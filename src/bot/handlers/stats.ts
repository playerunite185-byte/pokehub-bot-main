import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { getMessageStats } from "../store.js";
import { buildEmbed } from "../embed.js";

export async function handleStats(interaction: ChatInputCommandInteraction) {
  const targetUser = interaction.options.getUser("user") ?? interaction.user;
  const stats = getMessageStats(targetUser.id);

  const { embed, attachment } = buildEmbed({
    title: `📊 Message Stats — ${targetUser.username}`,
    message: [
      `📅 **Today:** ${stats.today.toLocaleString()} messages`,
      `🗓️ **This Month:** ${stats.month.toLocaleString()} messages`,
      `📆 **This Year:** ${stats.year.toLocaleString()} messages`,
      `📬 **All Time Total:** ${stats.total.toLocaleString()} messages`,
    ].join("\n"),
    color: "#5865f2",
    authorName: interaction.guild?.name,
    footer: "Stats are tracked since the bot joined",
  });

  const files = attachment ? [attachment] : [];
  await interaction.editReply({ embeds: [embed], files });
}
