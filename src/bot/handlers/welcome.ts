import { GuildMember, EmbedBuilder, TextChannel, ChatInputCommandInteraction } from "discord.js";
import { getGuildConfig, setGuildConfig } from "../store.js";

const WELCOME_GIF = "https://media.discordapp.net/attachments/1474421112686514247/1494698607859732642/welcome.gif?ex=69f8a60e&is=69f7548e&hm=6adbc4452d8ec8cf3cc68b3395b";

export async function handleSetWelcomeChannel(interaction: ChatInputCommandInteraction) {
  const channel = interaction.options.getChannel("channel", true);
  const guild = interaction.guild!;

  const fetched = await guild.channels.fetch(channel.id).catch(() => null);
  if (!fetched || !fetched.isTextBased()) {
    await interaction.editReply("❌ Please select a valid text channel.");
    return;
  }

  setGuildConfig(guild.id, { welcomeChannelId: channel.id });
  await interaction.editReply(`✅ Welcome channel set to ${fetched}. New member greetings will be sent there.`);
}

export async function sendWelcomeMessage(
  member: GuildMember,
  opts: {
    isRejoin: boolean;
    joinNumber: number;
    inviteInfo: { code: string; inviterId: string; inviterName: string } | null;
    isAlt: boolean;
    accountAgeDays: number;
  }
) {
  const guild = member.guild;
  const config = getGuildConfig(guild.id);

  if (!config.welcomeChannelId) return;

  let welcomeChannel: TextChannel | null = null;
  try {
    const ch = await guild.channels.fetch(config.welcomeChannelId);
    if (ch && ch.isTextBased()) welcomeChannel = ch as TextChannel;
  } catch {}

  if (!welcomeChannel) return;

  const joinTypeLabel = opts.isRejoin ? "🔄 **Rejoined**" : "✨ **New Member**";

  let joinMethod = "Direct link / Vanity URL";
  if (opts.inviteInfo && opts.inviteInfo.inviterId !== "Unknown") {
    joinMethod = `Invite by **${opts.inviteInfo.inviterName}** (code: \`${opts.inviteInfo.code}\`)`;
  } else if (opts.inviteInfo?.code) {
    joinMethod = `Invite code: \`${opts.inviteInfo.code}\``;
  }

  const lines: string[] = [
    `## Welcome, ${member}!`,
    `### enjoy your stay here!`,
    ``,
    `📋 **Joined via:** ${joinMethod}`,
    `🔢 **Member #${opts.joinNumber}** in the server`,
    `${joinTypeLabel}${opts.isRejoin ? "" : ""}`,
    `📅 **Account age:** ${opts.accountAgeDays} day${opts.accountAgeDays === 1 ? "" : "s"}`,
  ];

  if (opts.isAlt) {
    lines.push(`⚠️ **New account detected** (less than 7 days old)`);
  }

  const embed = new EmbedBuilder()
    .setColor(0x57f287)
    .setDescription(lines.join("\n"))
    .setImage(WELCOME_GIF)
    .setTimestamp();

  const serverIcon = guild.iconURL({ size: 256 });
  if (serverIcon) embed.setThumbnail(serverIcon);

  embed.setFooter({ text: guild.name, iconURL: serverIcon ?? undefined });

  await welcomeChannel.send({ content: `${member}`, embeds: [embed] });
}
