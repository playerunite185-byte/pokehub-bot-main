import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  ChatInputCommandInteraction,
  GuildMember,
  Guild,
} from "discord.js";
import { logger } from "../lib/logger.js";
import { commands } from "./commands.js";
import { buildEmbed } from "./embed.js";
import { handleMessageEconomy, canClaimDaily, claimDaily, formatBalance, formatCooldown } from "./handlers/economy.js";
import { handleAfkMessage } from "./handlers/afk.js";
import { handleWarn, handleWarnings, handleClearWarnings } from "./handlers/warnings.js";
import { handleReport, handleSetReportChannel } from "./handlers/reports.js";
import { handleShopMenu, handleCreateRole, handleRedeem, handleGiveRuby, handleCreateCode } from "./handlers/shop.js";
import { handleTimeout, handleBan, handleKick, handleNickname } from "./handlers/moderation.js";
import { handleTimeAutocomplete, handleTimeCommand, handleTimePrefixCommand } from "./handlers/time.js";
import { handleStats } from "./handlers/stats.js";
import { handleLockdown, handleUnlockdown } from "./handlers/lockdown.js";
import { handleInvites, handleMemberJoin, handleMemberLeave, cacheGuildInvites } from "./handlers/invites.js";
import { handleSetWelcomeChannel, sendWelcomeMessage } from "./handlers/welcome.js";
import { recordMessage } from "./store.js";

const TOKEN = process.env["DISCORD_TOKEN"];
const GUILD_ID = process.env["DISCORD_GUILD_ID"];

if (!TOKEN) throw new Error("DISCORD_TOKEN environment variable is required.");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
});

async function registerCommands(clientId: string) {
  const rest = new REST({ version: "10" }).setToken(TOKEN!);
  logger.info("Registering slash commands globally...");
  await rest.put(Routes.applicationCommands(clientId), { body: commands });
  logger.info("Global slash commands registered successfully.");
  if (GUILD_ID) {
    try {
      await rest.put(Routes.applicationGuildCommands(clientId, GUILD_ID), { body: commands });
      logger.info({ guildId: GUILD_ID }, "Guild commands registered (instant).");
    } catch {
      logger.warn({ guildId: GUILD_ID }, "Guild registration skipped — bot not yet in that server.");
    }
  }
}

async function sendDMWithEmbed(
  interaction: ChatInputCommandInteraction,
  members: GuildMember[],
  opts: { title?: string | null; message: string; color?: string | null; footer?: string | null }
) {
  const guildName = interaction.guild?.name ?? "Server";
  let sent = 0, failed = 0;
  for (const member of members) {
    if (member.user.bot) continue;
    try {
      const { embed, attachment } = buildEmbed({ ...opts, authorName: guildName });
      await member.send({ embeds: [embed], files: attachment ? [attachment] : [] });
      sent++;
    } catch { failed++; }
  }
  return { sent, failed };
}

client.on("error", (err) => { logger.error({ err }, "Discord client error"); });

client.once("ready", async (c) => {
  logger.info({ tag: c.user.tag }, "Discord bot logged in");

  // Cache invites for all guilds on startup
  for (const guild of c.guilds.cache.values()) {
    await cacheGuildInvites(guild);
  }
  logger.info(`Invite cache populated for ${c.guilds.cache.size} guild(s).`);

  try {
    await registerCommands(c.user.id);
  } catch (err) {
    logger.error({ err }, "Failed to register slash commands.");
  }
});

// Re-cache when bot joins a new guild
client.on("guildCreate", async (guild: Guild) => {
  await cacheGuildInvites(guild);
});

// New invite created — update cache
client.on("inviteCreate", async (invite) => {
  if (!invite.guild) return;
  await cacheGuildInvites(invite.guild as Guild);
});

// Invite deleted — update cache
client.on("inviteDelete", async (invite) => {
  if (!invite.guild) return;
  await cacheGuildInvites(invite.guild as Guild);
});

// Member joined — detect invite, send welcome
client.on("guildMemberAdd", async (member) => {
  try {
    const result = await handleMemberJoin(member);
    await sendWelcomeMessage(member, result);
  } catch (err) {
    logger.error({ err, userId: member.user.id }, "Error handling member join");
  }
});

// Member left — mark invite stats
client.on("guildMemberRemove", async (member) => {
  try {
    await handleMemberLeave(member as GuildMember);
  } catch (err) {
    logger.error({ err, userId: member.user.id }, "Error handling member leave");
  }
});

// Messages — economy, AFK, time prefix, stats tracking
client.on("messageCreate", (msg) => {
  if (msg.author.bot || !msg.guild) return;
  recordMessage(msg.author.id);
  handleMessageEconomy(msg);
  handleAfkMessage(msg);
  handleTimePrefixCommand(msg);
});

// Slash commands
client.on("interactionCreate", async (interaction) => {
  if (interaction.isAutocomplete()) {
    if (interaction.commandName === "time") handleTimeAutocomplete(interaction);
    return;
  }
  if (!interaction.isChatInputCommand()) return;

  await interaction.deferReply({ ephemeral: true });
  const { commandName } = interaction;

  try {
    // ── DM commands ────────────────────────────────────────────────────────
    if (commandName === "dm-user") {
      const targetUser = interaction.options.getUser("user", true);
      const message = interaction.options.getString("message", true);
      const title = interaction.options.getString("title");
      const color = interaction.options.getString("color");
      const footer = interaction.options.getString("footer");
      const member =
        interaction.guild?.members.cache.get(targetUser.id) ??
        await interaction.guild?.members.fetch(targetUser.id).catch(() => null);
      if (!member) { await interaction.editReply("❌ Member not found."); return; }
      const { sent } = await sendDMWithEmbed(interaction, [member], { title, message, color, footer });
      await interaction.editReply(sent > 0 ? `✅ DM sent to **${targetUser.username}**.` : `❌ Failed to DM **${targetUser.username}** (DMs may be disabled).`);

    } else if (commandName === "dm-all") {
      const message = interaction.options.getString("message", true);
      const title = interaction.options.getString("title");
      const color = interaction.options.getString("color");
      const footer = interaction.options.getString("footer");
      await interaction.editReply("📨 Fetching all members and sending DMs...");
      const members = await interaction.guild!.members.fetch();
      const { sent, failed } = await sendDMWithEmbed(interaction, [...members.values()], { title, message, color, footer });
      await interaction.editReply(`Done! ✅ Sent: **${sent}** | ❌ Failed: **${failed}**`);

    } else if (commandName === "dm-role") {
      const role = interaction.options.getRole("role", true);
      const message = interaction.options.getString("message", true);
      const title = interaction.options.getString("title");
      const color = interaction.options.getString("color");
      const footer = interaction.options.getString("footer");
      await interaction.editReply(`📨 Fetching members with role **${role.name}**...`);
      const members = await interaction.guild!.members.fetch();
      const targets = [...members.values()].filter((m) => m.roles.cache.has(role.id));
      if (targets.length === 0) { await interaction.editReply(`❌ No members with role **${role.name}**.`); return; }
      const { sent, failed } = await sendDMWithEmbed(interaction, targets, { title, message, color, footer });
      await interaction.editReply(`Done! ✅ Sent: **${sent}** | ❌ Failed: **${failed}**`);

    // ── Warnings ───────────────────────────────────────────────────────────
    } else if (commandName === "warn") {
      await handleWarn(interaction);
    } else if (commandName === "warnings") {
      await handleWarnings(interaction);
    } else if (commandName === "clearwarnings") {
      await handleClearWarnings(interaction);

    // ── Moderation actions ─────────────────────────────────────────────────
    } else if (commandName === "timeout") {
      await handleTimeout(interaction);
    } else if (commandName === "ban") {
      await handleBan(interaction);
    } else if (commandName === "kick") {
      await handleKick(interaction);
    } else if (commandName === "nickname") {
      await handleNickname(interaction);

    // ── Reports ────────────────────────────────────────────────────────────
    } else if (commandName === "report") {
      await handleReport(interaction);
    } else if (commandName === "set-report-channel") {
      await handleSetReportChannel(interaction);

    // ── Welcome ────────────────────────────────────────────────────────────
    } else if (commandName === "set-welcome-channel") {
      await handleSetWelcomeChannel(interaction);

    // ── Invites ────────────────────────────────────────────────────────────
    } else if (commandName === "invites") {
      await handleInvites(interaction);

    // ── Economy ────────────────────────────────────────────────────────────
    } else if (commandName === "balance") {
      const targetUser = interaction.options.getUser("user") ?? interaction.user;
      const bal = formatBalance(targetUser.id);
      const { embed, attachment } = buildEmbed({
        title: `💰 Balance — ${targetUser.username}`,
        message: [
          `💎 **Emeralds:** ${bal.emeralds.toLocaleString()}`,
          `🔴 **Rubies:** ${bal.rubies.toLocaleString()}`,
          `📊 **Total Value:** ${bal.total.toLocaleString()} Emeralds`,
        ].join("\n"),
        color: "#57f287",
        authorName: interaction.guild?.name,
      });
      await interaction.editReply({ embeds: [embed], files: attachment ? [attachment] : [] });

    } else if (commandName === "daily") {
      const { canClaim, msLeft } = canClaimDaily(interaction.user.id);
      if (!canClaim) {
        await interaction.editReply(`⏰ Already claimed! Come back in **${formatCooldown(msLeft)}**.`);
        return;
      }
      const reward = claimDaily(interaction.user.id);
      const { embed, attachment } = buildEmbed({
        title: "🎁 Daily Reward Claimed!",
        message: `You received **${reward} 💎 Emeralds**!\nCome back tomorrow for another claim.`,
        color: "#57f287",
        authorName: interaction.guild?.name,
      });
      await interaction.editReply({ embeds: [embed], files: attachment ? [attachment] : [] });

    } else if (commandName === "give-ruby") {
      await handleGiveRuby(interaction);

    // ── Shop ───────────────────────────────────────────────────────────────
    } else if (commandName === "shop") {
      const sub = interaction.options.getSubcommand();
      if (sub === "menu") await handleShopMenu(interaction);
      else if (sub === "create-role") await handleCreateRole(interaction);
      else if (sub === "redeem") await handleRedeem(interaction);

    } else if (commandName === "create-code") {
      await handleCreateCode(interaction);

    // ── Stats ──────────────────────────────────────────────────────────────
    } else if (commandName === "stats") {
      await handleStats(interaction);

    // ── Lockdown ───────────────────────────────────────────────────────────
    } else if (commandName === "lockdown") {
      await handleLockdown(interaction);
    } else if (commandName === "unlockdown") {
      await handleUnlockdown(interaction);

    // ── Time ───────────────────────────────────────────────────────────────
    } else if (commandName === "time") {
      await handleTimeCommand(interaction);
    }

  } catch (err) {
    logger.error({ err, commandName }, "Error handling command");
    try { await interaction.editReply("❌ An error occurred. Please try again."); } catch {}
  }
});

export function startBot() {
  client.login(TOKEN).catch((err) => {
    logger.error({ err }, "Failed to log in Discord bot");
  });
}
