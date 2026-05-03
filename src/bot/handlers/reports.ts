import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  TextChannel,
  Guild,
} from "discord.js";
import { getGuildConfig, setGuildConfig } from "../store.js";

async function findReportChannel(guild: Guild): Promise<TextChannel | null> {
  const config = getGuildConfig(guild.id);

  if (config.reportChannelId) {
    try {
      const ch = await guild.channels.fetch(config.reportChannelId);
      if (ch && ch.isTextBased()) return ch as TextChannel;
    } catch {}
  }

  return null;
}

export async function handleSetReportChannel(interaction: ChatInputCommandInteraction) {
  const channel = interaction.options.getChannel("channel", true);
  const guild = interaction.guild!;

  const fetched = await guild.channels.fetch(channel.id).catch(() => null);
  if (!fetched || !fetched.isTextBased()) {
    await interaction.editReply("❌ Please select a valid text channel.");
    return;
  }

  setGuildConfig(guild.id, { reportChannelId: channel.id });
  await interaction.editReply(`✅ Report channel set to ${fetched}. All reports will now be sent there.`);
}

export async function handleReport(interaction: ChatInputCommandInteraction) {
  const reported = interaction.options.getUser("user", true);
  const reason = interaction.options.getString("reason", true);
  const proof = interaction.options.getAttachment("proof");
  const reporter = interaction.user;
  const guild = interaction.guild!;

  const reportChannel = await findReportChannel(guild);

  if (!reportChannel) {
    await interaction.editReply(
      "⚠️ No report channel is configured yet. Ask an admin to use `/set-report-channel` to set one up."
    );
    return;
  }

  const embed = new EmbedBuilder()
    .setColor(0xed4245)
    .setTitle("🚨 Member Report")
    .addFields(
      { name: "👤 Reported User", value: `${reported} (${reported.username})`, inline: true },
      { name: "🔎 Reported By", value: `${reporter} (${reporter.username})`, inline: true },
      { name: "📋 Reason", value: reason, inline: false },
      { name: "🕐 Time", value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
    )
    .setThumbnail(reported.displayAvatarURL({ size: 256 }))
    .setFooter({ text: `Reporter ID: ${reporter.id} | Reported ID: ${reported.id}` })
    .setTimestamp();

  if (proof) {
    if (proof.contentType?.startsWith("image/")) {
      embed.setImage(proof.url);
    }
    embed.addFields({ name: "📎 Proof", value: `[Click to view](${proof.url})`, inline: false });
  }

  await reportChannel.send({ embeds: [embed] });

  await interaction.editReply(
    `✅ Your report against **${reported.username}** has been submitted to the moderation team. Thank you.`
  );
}
