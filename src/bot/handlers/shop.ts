import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildMember,
  PermissionFlagsBits,
} from "discord.js";
import {
  getEconomy,
  updateEconomy,
  getCode,
  markCodeUsed,
  createCode,
  getCustomRole,
  setCustomRole,
} from "../store.js";
import { buildEmbed } from "../embed.js";

const CUSTOM_ROLE_COST = 2500;

function parseHexColor(hex: string): number | null {
  const clean = hex.replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return null;
  return parseInt(clean, 16);
}

export async function handleShopMenu(interaction: ChatInputCommandInteraction) {
  const eco = getEconomy(interaction.user.id);
  const totalEmeralds = eco.emeralds + eco.rubies * 1000;

  const embed = new EmbedBuilder()
    .setColor(0x57f287)
    .setTitle("🏪 Server Shop")
    .setDescription(`Your balance: 💎 **${eco.emeralds}** Emeralds | 🔴 **${eco.rubies}** Rubies\n*(1 Ruby = 1,000 Emeralds)*`)
    .addFields(
      {
        name: "🎨 Custom Role — 2,500 💎",
        value: "Create your own role with a custom name and color.\nUse `/shop create-role [name] [color]`",
        inline: false,
      },
      {
        name: "🎟️ Redeem a Code",
        value: "Have a reward code? Use `/shop redeem [code]`",
        inline: false,
      }
    )
    .setFooter({ text: "Earn emeralds by chatting! 10 💎 per message (1 min cooldown)" })
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}

export async function handleCreateRole(interaction: ChatInputCommandInteraction) {
  const roleName = interaction.options.getString("name", true);
  const colorHex = interaction.options.getString("color", true);
  const member = interaction.member as GuildMember;
  const guild = interaction.guild!;
  const eco = getEconomy(interaction.user.id);

  const colorInt = parseHexColor(colorHex);
  if (colorInt === null) {
    await interaction.editReply("❌ Invalid color. Please use a hex code like `#ff0000`.");
    return;
  }

  if (eco.emeralds < CUSTOM_ROLE_COST) {
    await interaction.editReply(
      `❌ You need **${CUSTOM_ROLE_COST} 💎 Emeralds** to create a custom role. You have **${eco.emeralds}**.\nEarn more by chatting!`
    );
    return;
  }

  const existingRoleId = getCustomRole(interaction.user.id);
  if (existingRoleId) {
    const existingRole = guild.roles.cache.get(existingRoleId);
    if (existingRole) {
      try {
        await existingRole.edit({ name: roleName, color: colorInt });
        await interaction.editReply(`✅ Your custom role has been updated to **${roleName}** with color \`${colorHex}\`!`);
        return;
      } catch {
      }
    }
  }

  try {
    const newRole = await guild.roles.create({
      name: roleName,
      color: colorInt,
      reason: `Custom role for ${interaction.user.username}`,
    });

    await member.roles.add(newRole);
    setCustomRole(interaction.user.id, newRole.id);
    updateEconomy(interaction.user.id, { emeralds: eco.emeralds - CUSTOM_ROLE_COST });

    const { embed, attachment } = buildEmbed({
      title: "🎨 Custom Role Created!",
      message: [
        `**Role:** ${newRole}`,
        `**Color:** \`${colorHex}\``,
        `**Cost:** ${CUSTOM_ROLE_COST} 💎 Emeralds`,
        `**Remaining Balance:** ${eco.emeralds - CUSTOM_ROLE_COST} 💎`,
      ].join("\n"),
      color: colorHex,
      authorName: guild.name,
    });

    await interaction.editReply({ embeds: [embed], files: [attachment] });
  } catch (err) {
    await interaction.editReply("❌ Failed to create role. Make sure the bot has the `Manage Roles` permission and its role is above where new roles are placed.");
  }
}

export async function handleRedeem(interaction: ChatInputCommandInteraction) {
  const code = interaction.options.getString("code", true).trim().toUpperCase();
  const userId = interaction.user.id;
  const entry = getCode(code);

  if (!entry) {
    await interaction.editReply("❌ Invalid code. Please check and try again.");
    return;
  }

  if (entry.usedBy.includes(userId)) {
    await interaction.editReply("❌ You have already redeemed this code.");
    return;
  }

  if (entry.usedBy.length >= entry.maxUses) {
    await interaction.editReply("❌ This code has already been fully redeemed.");
    return;
  }

  markCodeUsed(code, userId);
  const eco = getEconomy(userId);
  updateEconomy(userId, {
    emeralds: eco.emeralds + entry.emeralds,
    rubies: eco.rubies + entry.rubies,
  });

  const rewards: string[] = [];
  if (entry.emeralds > 0) rewards.push(`💎 **${entry.emeralds}** Emeralds`);
  if (entry.rubies > 0) rewards.push(`🔴 **${entry.rubies}** Rubies`);

  await interaction.editReply(
    `✅ Code redeemed! You received: ${rewards.join(" + ")}`
  );
}

export async function handleGiveRuby(interaction: ChatInputCommandInteraction) {
  const target = interaction.options.getUser("user", true);
  const amount = interaction.options.getInteger("amount", true);

  if (amount <= 0) {
    await interaction.editReply("❌ Amount must be positive.");
    return;
  }

  const eco = getEconomy(target.id);
  updateEconomy(target.id, { rubies: eco.rubies + amount });

  const { embed, attachment } = buildEmbed({
    title: "🔴 Rubies Granted",
    message: [
      `**Recipient:** ${target} (${target.username})`,
      `**Rubies Given:** 🔴 ${amount}`,
      `**New Balance:** 🔴 ${eco.rubies + amount} Rubies`,
    ].join("\n"),
    color: "#ed4245",
    authorName: interaction.guild?.name,
  });

  await interaction.editReply({ embeds: [embed], files: [attachment] });

  try {
    const dmEmbed = new EmbedBuilder()
      .setColor(0xed4245)
      .setTitle("🔴 You Received Rubies!")
      .setDescription(
        `You were given **${amount} Ruby${amount !== 1 ? "s" : ""}** by ${interaction.user} in **${interaction.guild?.name}**!\n\n1 Ruby = 1,000 Emeralds`
      )
      .setTimestamp();
    await target.send({ embeds: [dmEmbed] });
  } catch {
  }
}

export async function handleCreateCode(interaction: ChatInputCommandInteraction) {
  const code = interaction.options.getString("code", true).trim().toUpperCase();
  const emeralds = interaction.options.getInteger("emeralds") ?? 0;
  const rubies = interaction.options.getInteger("rubies") ?? 0;
  const maxUses = interaction.options.getInteger("max-uses") ?? 1;

  if (emeralds === 0 && rubies === 0) {
    await interaction.editReply("❌ Code must reward at least some emeralds or rubies.");
    return;
  }

  createCode(code, { emeralds, rubies, maxUses, usedBy: [] });

  await interaction.editReply(
    `✅ Code \`${code}\` created!\n💎 ${emeralds} Emeralds | 🔴 ${rubies} Rubies | Max uses: ${maxUses}`
  );
}
