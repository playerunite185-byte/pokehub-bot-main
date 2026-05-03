import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { getWarnings, addWarning, clearWarnings } from "../store.js";
import { randomUUID } from "node:crypto";
import { buildEmbed } from "../embed.js";

export async function handleWarn(interaction: ChatInputCommandInteraction) {
  const target = interaction.options.getUser("user", true);
  const reason = interaction.options.getString("reason", true);
  const mod = interaction.user;

  const warning = {
    id: randomUUID().slice(0, 8).toUpperCase(),
    reason,
    moderatorId: mod.id,
    moderatorName: mod.username,
    timestamp: new Date().toISOString(),
  };

  addWarning(target.id, warning);
  const all = getWarnings(target.id);

  const { embed, attachment } = buildEmbed({
    title: "⚠️ Warning Issued",
    message: [
      `**User:** ${target} (${target.username})`,
      `**Moderator:** ${mod}`,
      `**Reason:** ${reason}`,
      `**Warning ID:** \`${warning.id}\``,
      `**Total Warnings:** ${all.length}`,
    ].join("\n"),
    color: "#f0a500",
    authorName: interaction.guild?.name,
  });

  await interaction.editReply({ embeds: [embed], files: attachment ? [attachment] : [] });

  try {
    const dmEmbed = new EmbedBuilder()
      .setColor(0xf0a500)
      .setTitle("⚠️ You Received a Warning")
      .addFields(
        { name: "Server", value: interaction.guild?.name ?? "Unknown", inline: true },
        { name: "Reason", value: reason, inline: true },
        { name: "Warning #", value: String(all.length), inline: true }
      )
      .setTimestamp();
    await target.send({ embeds: [dmEmbed] });
  } catch {}
}

export async function handleWarnings(interaction: ChatInputCommandInteraction) {
  const target = interaction.options.getUser("user", true);
  const warnings = getWarnings(target.id);

  if (warnings.length === 0) {
    const { embed, attachment } = buildEmbed({
      title: `📋 Warnings — ${target.username}`,
      message: `✅ **${target.username}** has no warnings on record.`,
      color: "#57f287",
      authorName: interaction.guild?.name,
    });
    await interaction.editReply({ embeds: [embed], files: attachment ? [attachment] : [] });
    return;
  }

  const lines = warnings.map(
    (w, i) =>
      `**#${i + 1}** \`${w.id}\` — ${w.reason}\n┗ *by ${w.moderatorName} on ${new Date(w.timestamp).toLocaleDateString()}*`
  );

  const { embed, attachment } = buildEmbed({
    title: `⚠️ Warnings — ${target.username} (${warnings.length} total)`,
    message: lines.join("\n\n"),
    color: "#f0a500",
    authorName: interaction.guild?.name,
    footer: `User ID: ${target.id} · Total warnings: ${warnings.length}`,
  });

  await interaction.editReply({ embeds: [embed], files: attachment ? [attachment] : [] });
}

export async function handleClearWarnings(interaction: ChatInputCommandInteraction) {
  const target = interaction.options.getUser("user", true);
  clearWarnings(target.id);
  await interaction.editReply(`✅ All warnings for **${target.username}** have been cleared.`);
}
