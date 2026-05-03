import { Message } from "discord.js";
import { getEconomy, updateEconomy } from "../store.js";

const EMERALDS_PER_MSG = 10;
const MSG_COOLDOWN_MS = 60_000;

export function handleMessageEconomy(msg: Message) {
  if (msg.author.bot || !msg.guild) return;
  const eco = getEconomy(msg.author.id);
  const now = Date.now();
  const last = eco.lastMessage ? new Date(eco.lastMessage).getTime() : 0;
  if (now - last >= MSG_COOLDOWN_MS) {
    updateEconomy(msg.author.id, {
      emeralds: eco.emeralds + EMERALDS_PER_MSG,
      lastMessage: new Date().toISOString(),
    });
  }
}

export function canClaimDaily(userId: string): { canClaim: boolean; msLeft: number } {
  const eco = getEconomy(userId);
  if (!eco.lastDaily) return { canClaim: true, msLeft: 0 };
  const last = new Date(eco.lastDaily).getTime();
  const msLeft = 86_400_000 - (Date.now() - last);
  return { canClaim: msLeft <= 0, msLeft: Math.max(0, msLeft) };
}

export function claimDaily(userId: string): number {
  const eco = getEconomy(userId);
  const reward = 200;
  updateEconomy(userId, {
    emeralds: eco.emeralds + reward,
    lastDaily: new Date().toISOString(),
  });
  return reward;
}

export function formatBalance(userId: string): { emeralds: number; rubies: number; total: number } {
  const eco = getEconomy(userId);
  return {
    emeralds: eco.emeralds,
    rubies: eco.rubies,
    total: eco.emeralds + eco.rubies * 1000,
  };
}

export function formatCooldown(ms: number): string {
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  const parts: string[] = [];
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  if (s) parts.push(`${s}s`);
  return parts.join(" ") || "0s";
}
