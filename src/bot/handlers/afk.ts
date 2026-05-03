import { Message, EmbedBuilder } from "discord.js";
import { getAfk, setAfk } from "../store.js";

const PREFIX = "$afk";

export function handleAfkMessage(msg: Message) {
  if (msg.author.bot || !msg.guild) return;

  const userId = msg.author.id;

  if (msg.content.toLowerCase().startsWith(PREFIX)) {
    const reason = msg.content.slice(PREFIX.length).trim() || "AFK";
    setAfk(userId, { reason, since: new Date().toISOString() });

    const embed = new EmbedBuilder()
      .setColor(0xf0a500)
      .setTitle("💤 AFK Set")
      .setDescription(`You are now AFK.\n**Reason:** ${reason}`)
      .setTimestamp();

    msg.reply({ embeds: [embed] }).catch(() => {});
    return;
  }

  const userAfk = getAfk(userId);
  if (userAfk) {
    setAfk(userId, null);
    const since = new Date(userAfk.since);
    const diff = Date.now() - since.getTime();
    const mins = Math.floor(diff / 60_000);
    const embed = new EmbedBuilder()
      .setColor(0x57f287)
      .setTitle("✅ Welcome Back!")
      .setDescription(`Your AFK has been removed.\nYou were AFK for **${mins} minute${mins !== 1 ? "s" : ""}**.`)
      .setTimestamp();
    msg.reply({ embeds: [embed] }).catch(() => {});
  }

  for (const mention of msg.mentions.users.values()) {
    if (mention.bot) continue;
    const afk = getAfk(mention.id);
    if (afk) {
      const since = new Date(afk.since);
      const diff = Date.now() - since.getTime();
      const mins = Math.floor(diff / 60_000);
      const embed = new EmbedBuilder()
        .setColor(0xf0a500)
        .setTitle("💤 User is AFK")
        .setDescription(
          `**${mention.username}** is currently AFK.\n**Reason:** ${afk.reason}\n**Since:** ${mins} minute${mins !== 1 ? "s" : ""} ago`
        )
        .setTimestamp();
      msg.reply({ embeds: [embed] }).catch(() => {});
    }
  }
}
