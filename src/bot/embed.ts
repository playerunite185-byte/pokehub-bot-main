import { EmbedBuilder, AttachmentBuilder } from "discord.js";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function resolveLogoPath(): string | null {
  const candidates = [
    resolve(__dirname, "logo.jpg"),
    resolve(__dirname, "../public/logo.jpg"),
    resolve(__dirname, "../../src/public/logo.jpg"),
    resolve(process.cwd(), "src/public/logo.jpg"),
    resolve(process.cwd(), "dist/logo.jpg"),
  ];
  for (const p of candidates) {
    try {
      if (existsSync(p)) return p;
    } catch {}
  }
  return null;
}

const LOGO_PATH = resolveLogoPath();

export function parseColor(hex?: string | null): number {
  if (!hex) return 0x5865f2;
  const clean = hex.replace("#", "");
  const parsed = parseInt(clean, 16);
  return isNaN(parsed) ? 0x5865f2 : parsed;
}

export function buildEmbed(opts: {
  title?: string | null;
  message: string;
  color?: string | null;
  footer?: string | null;
  authorName?: string;
}): { embed: EmbedBuilder; attachment: AttachmentBuilder | null } {
  const embed = new EmbedBuilder()
    .setColor(parseColor(opts.color))
    .setDescription(opts.message || "\u200b")
    .setTimestamp();

  if (opts.title) embed.setTitle(opts.title);
  if (opts.footer) embed.setFooter({ text: opts.footer });
  if (opts.authorName) embed.setAuthor({ name: opts.authorName });

  if (LOGO_PATH) {
    const attachment = new AttachmentBuilder(LOGO_PATH, { name: "logo.jpg" });
    embed.setThumbnail("attachment://logo.jpg");
    return { embed, attachment };
  }

  return { embed, attachment: null };
}

export function sendWithEmbed(
  send: (payload: { embeds: EmbedBuilder[]; files: AttachmentBuilder[] }) => Promise<unknown>,
  embed: EmbedBuilder,
  attachment: AttachmentBuilder | null
) {
  return send({ embeds: [embed], files: attachment ? [attachment] : [] });
}
