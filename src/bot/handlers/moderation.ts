import { ChatInputCommandInteraction, EmbedBuilder, GuildMember } from "discord.js";
import { buildEmbed } from "../embed.js";

function parseDuration(value: string): number | null {
  const match = value.match(/^(\d+)(s|m|h|d)$/i);
  if (!match) return null;
  const n = parseInt(match[1]!);
  const unit = match[2]!.toLowerCase();
  const multipliers: Record<string, number> = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  const ms = n * multipliers[unit]!;
  if (ms > 2_419_200_000) return null;
  return ms;
}

export async function handleTimeout(interaction: ChatInputCommandInteraction) {
  const target = interaction.options.getUser("user", true);
  const durationStr = interaction.options.getString("duration", true);
  const reason = interaction.options.getString("reason") ?? "No reason provided";

  const ms = parseDuration(durationStr);
  if (!ms) {
    await interaction.editReply("❌ Invalid duration. Use format: `10s`, `5m`, `2h`, `1d` (max 28d).");
    return;
  }

  const member = await interaction.guild!.members.fetch(target.id).catch(() => null) as GuildMember | null;
  if (!member) { await interaction.editReply("❌ Member not found."); return; }

  try {
    await member.timeout(ms, reason);
  } catch {
    await interaction.editReply("❌ Failed to timeout — make sure my role is above theirs and I have Moderate Members permission.");
    return;
  }

  const until = new Date(Date.now() + ms);
  const { embed, attachment } = buildEmbed({
    title: "🔇 Member Timed Out",
    message: [
      `**User:** ${target} (${target.username})`,
      `**Duration:** ${durationStr}`,
      `**Until:** <t:${Math.floor(until.getTime() / 1000)}:F>`,
      `**Reason:** ${reason}`,
      `**Moderator:** ${interaction.user}`,
    ].join("\n"),
    color: "#f0a500",
    authorName: interaction.guild?.name,
  });

  await interaction.editReply({ embeds: [embed], files: [attachment] });

  try {
    const dmEmbed = new EmbedBuilder()
      .setColor(0xf0a500)
      .setTitle("🔇 You Have Been Timed Out")
      .addFields(
        { name: "Server", value: interaction.guild?.name ?? "Unknown", inline: true },
        { name: "Duration", value: durationStr, inline: true },
        { name: "Reason", value: reason, inline: false },
        { name: "Until", value: `<t:${Math.floor(until.getTime() / 1000)}:F>`, inline: false },
      )
      .setTimestamp();
    await target.send({ embeds: [dmEmbed] });
  } catch {}
}

export async function handleBan(interaction: ChatInputCommandInteraction) {
  const target = interaction.options.getUser("user", true);
  const reason = interaction.options.getString("reason") ?? "No reason provided";
  const deletedays = interaction.options.getInteger("delete-messages") ?? 0;

  try {
    await interaction.guild!.members.ban(target, {
      reason,
      deleteMessageSeconds: deletedays * 86400,
    });
  } catch {
    await interaction.editReply("❌ Failed to ban — make sure my role is above theirs and I have Ban Members permission.");
    return;
  }

  const { embed, attachment } = buildEmbed({
    title: "🔨 Member Banned",
    message: [
      `**User:** ${target.username} (${target.id})`,
      `**Reason:** ${reason}`,
      `**Messages Deleted:** ${deletedays} day(s)`,
      `**Moderator:** ${interaction.user}`,
    ].join("\n"),
    color: "#ed4245",
    authorName: interaction.guild?.name,
  });

  await interaction.editReply({ embeds: [embed], files: [attachment] });

  try {
    const dmEmbed = new EmbedBuilder()
      .setColor(0xed4245)
      .setTitle("🔨 You Have Been Banned")
      .addFields(
        { name: "Server", value: interaction.guild?.name ?? "Unknown", inline: true },
        { name: "Reason", value: reason, inline: false },
      )
      .setTimestamp();
    await target.send({ embeds: [dmEmbed] });
  } catch {}
}

export async function handleKick(interaction: ChatInputCommandInteraction) {
  const target = interaction.options.getUser("user", true);
  const reason = interaction.options.getString("reason") ?? "No reason provided";

  const member = await interaction.guild!.members.fetch(target.id).catch(() => null) as GuildMember | null;
  if (!member) { await interaction.editReply("❌ Member not found."); return; }

  try {
    await member.kick(reason);
  } catch {
    await interaction.editReply("❌ Failed to kick — make sure my role is above theirs and I have Kick Members permission.");
    return;
  }

  const { embed, attachment } = buildEmbed({
    title: "👢 Member Kicked",
    message: [
      `**User:** ${target.username} (${target.id})`,
      `**Reason:** ${reason}`,
      `**Moderator:** ${interaction.user}`,
    ].join("\n"),
    color: "#ed4245",
    authorName: interaction.guild?.name,
  });

  await interaction.editReply({ embeds: [embed], files: [attachment] });

  try {
    const dmEmbed = new EmbedBuilder()
      .setColor(0xed4245)
      .setTitle("👢 You Have Been Kicked")
      .addFields(
        { name: "Server", value: interaction.guild?.name ?? "Unknown", inline: true },
        { name: "Reason", value: reason, inline: false },
      )
      .setTimestamp();
    await target.send({ embeds: [dmEmbed] });
  } catch {}
}

export async function handleNickname(interaction: ChatInputCommandInteraction) {
  const target = interaction.options.getUser("user", true);
  const nick = interaction.options.getString("nickname");

  const member = await interaction.guild!.members.fetch(target.id).catch(() => null) as GuildMember | null;
  if (!member) { await interaction.editReply("❌ Member not found."); return; }

  const oldNick = member.nickname ?? target.username;

  try {
    await member.setNickname(nick, `Changed by ${interaction.user.username}`);
  } catch {
    await interaction.editReply("❌ Failed to change nickname — make sure my role is above theirs and I have Manage Nicknames permission.");
    return;
  }

  const { embed, attachment } = buildEmbed({
    title: "✏️ Nickname Changed",
    message: [
      `**User:** ${target} (${target.username})`,
      `**Old Nickname:** ${oldNick}`,
      `**New Nickname:** ${nick ?? target.username + " (reset)"}`,
      `**Changed By:** ${interaction.user}`,
    ].join("\n"),
    color: "#5865f2",
    authorName: interaction.guild?.name,
  });

  await interaction.editReply({ embeds: [embed], files: [attachment] });
}
