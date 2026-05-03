import { AutocompleteInteraction, ChatInputCommandInteraction, EmbedBuilder, Message } from "discord.js";
import { searchTimezones, getTimeFor, getUtcOffset, TIMEZONES } from "../timezones.js";
import { getEconomy, updateEconomy } from "../store.js";

const userTimezones = new Map<string, string>();

export function handleTimeAutocomplete(interaction: AutocompleteInteraction) {
  const focused = interaction.options.getFocused();
  const results = searchTimezones(focused);
  interaction.respond(
    results.map((t) => ({ name: `${t.flag} ${t.country}`, value: t.timezone }))
  ).catch(() => {});
}

export async function handleTimeCommand(interaction: ChatInputCommandInteraction) {
  const timezone = interaction.options.getString("country", true);
  const entry = TIMEZONES.find((t) => t.timezone === timezone);
  const timeStr = getTimeFor(timezone);

  if (!timeStr) {
    await interaction.editReply("❌ Could not get time for that timezone.");
    return;
  }

  const offset = getUtcOffset(timezone);
  const flag = entry?.flag ?? "🌍";
  const label = entry?.country ?? timezone;

  userTimezones.set(interaction.user.id, timezone);

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle(`${flag} Current Time — ${label}`)
    .addFields(
      { name: "🕐 Time", value: timeStr, inline: false },
      { name: "🌐 Timezone", value: `\`${timezone}\``, inline: true },
      { name: "📍 UTC Offset", value: offset, inline: true }
    )
    .setFooter({ text: "Your timezone has been saved. Use $time anytime to check again." })
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}

export function handleTimePrefixCommand(msg: Message) {
  if (!msg.content.toLowerCase().startsWith("$time")) return false;

  const args = msg.content.slice(5).trim();

  if (!args) {
    const saved = userTimezones.get(msg.author.id);
    if (saved) {
      const entry = TIMEZONES.find((t) => t.timezone === saved);
      const timeStr = getTimeFor(saved);
      const offset = getUtcOffset(saved);
      const flag = entry?.flag ?? "🌍";
      const label = entry?.country ?? saved;

      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle(`${flag} Current Time — ${label}`)
        .addFields(
          { name: "🕐 Time", value: timeStr ?? "Unknown", inline: false },
          { name: "🌐 Timezone", value: `\`${saved}\``, inline: true },
          { name: "📍 UTC Offset", value: offset, inline: true }
        )
        .setFooter({ text: "Use /time to change your timezone." })
        .setTimestamp();

      msg.reply({ embeds: [embed] }).catch(() => {});
    } else {
      msg.reply("⏰ Use `/time` to set your timezone — search and select your country!").catch(() => {});
    }
    return true;
  }

  const results = searchTimezones(args);
  if (results.length === 0) {
    msg.reply("❌ No matching country found. Try `/time` to search interactively.").catch(() => {});
    return true;
  }

  const match = results[0]!;
  const timeStr = getTimeFor(match.timezone);
  const offset = getUtcOffset(match.timezone);

  userTimezones.set(msg.author.id, match.timezone);

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle(`${match.flag} Current Time — ${match.country}`)
    .addFields(
      { name: "🕐 Time", value: timeStr ?? "Unknown", inline: false },
      { name: "🌐 Timezone", value: `\`${match.timezone}\``, inline: true },
      { name: "📍 UTC Offset", value: offset, inline: true }
    )
    .setFooter({ text: "Timezone saved! Use $time anytime to check again." })
    .setTimestamp();

  msg.reply({ embeds: [embed] }).catch(() => {});
  return true;
}
