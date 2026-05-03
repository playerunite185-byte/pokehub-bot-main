import { Client, Guild, GuildMember, ChatInputCommandInteraction, Invite } from "discord.js";
import { buildEmbed } from "../embed.js";
import {
  getMemberRecord,
  setMemberRecord,
  getInviterStats,
  addInviterUse,
  markInviterLeft,
  markInviterFake,
} from "../store.js";

const FAKE_THRESHOLD_MS = 24 * 60 * 60 * 1000;
const ALT_ACCOUNT_DAYS = 7;

export const inviteCache = new Map<string, Map<string, { uses: number; inviterId: string; inviterName: string; inviterTag: string }>>();

export async function cacheGuildInvites(guild: Guild) {
  try {
    const invites = await guild.invites.fetch();
    const map = new Map<string, { uses: number; inviterId: string; inviterName: string; inviterTag: string }>();
    for (const inv of invites.values()) {
      if (!inv.inviter) continue;
      map.set(inv.code, {
        uses: inv.uses ?? 0,
        inviterId: inv.inviter.id,
        inviterName: inv.inviter.username,
        inviterTag: inv.inviter.tag ?? inv.inviter.username,
      });
    }
    inviteCache.set(guild.id, map);
  } catch {}
}

export async function detectInviteUsed(
  guild: Guild,
  member: GuildMember
): Promise<{ code: string; inviterId: string; inviterName: string } | null> {
  const cached = inviteCache.get(guild.id);

  let currentInvites: Map<string, Invite>;
  try {
    const fetched = await guild.invites.fetch();
    currentInvites = new Map(fetched.map((inv) => [inv.code, inv]));
  } catch {
    return null;
  }

  let usedCode: string | null = null;
  let inviterId = "Unknown";
  let inviterName = "Unknown";

  if (cached) {
    for (const [code, curr] of currentInvites) {
      const prev = cached.get(code);
      const currUses = curr.uses ?? 0;
      if (!prev) {
        if (currUses > 0) {
          usedCode = code;
          inviterId = curr.inviter?.id ?? "Unknown";
          inviterName = curr.inviter?.username ?? "Unknown";
          break;
        }
      } else if (currUses > prev.uses) {
        usedCode = code;
        inviterId = curr.inviter?.id ?? prev.inviterId;
        inviterName = curr.inviter?.username ?? prev.inviterName;
        break;
      }
    }
  }

  const newMap = new Map<string, { uses: number; inviterId: string; inviterName: string; inviterTag: string }>();
  for (const [code, inv] of currentInvites) {
    if (!inv.inviter) continue;
    newMap.set(code, {
      uses: inv.uses ?? 0,
      inviterId: inv.inviter.id,
      inviterName: inv.inviter.username,
      inviterTag: inv.inviter.tag ?? inv.inviter.username,
    });
  }
  inviteCache.set(guild.id, newMap);

  if (!usedCode) return null;
  return { code: usedCode, inviterId, inviterName };
}

export async function handleMemberJoin(member: GuildMember) {
  const guild = member.guild;
  const userId = member.user.id;
  const now = new Date().toISOString();

  const existing = getMemberRecord(guild.id, userId);
  const isRejoin = existing !== null;
  const joinCount = existing ? existing.joinCount + 1 : 1;

  const accountAge = Date.now() - member.user.createdTimestamp;
  const isAlt = accountAge < ALT_ACCOUNT_DAYS * 24 * 60 * 60 * 1000;
  const accountAgeDays = Math.floor(accountAge / (24 * 60 * 60 * 1000));

  const inviteInfo = await detectInviteUsed(guild, member);

  const allMembers = await guild.members.fetch().catch(() => null);
  const joinNumber = allMembers ? allMembers.size : 0;

  setMemberRecord(guild.id, userId, {
    joinCount,
    firstJoined: existing?.firstJoined ?? now,
    lastJoined: now,
    lastInviteCode: inviteInfo?.code,
    lastInviterId: inviteInfo?.inviterId,
    lastInviterName: inviteInfo?.inviterName,
    leftAt: null,
    isAlt,
    accountAgeDays,
  });

  if (inviteInfo && inviteInfo.inviterId !== "Unknown") {
    addInviterUse(guild.id, inviteInfo.inviterId, userId, isAlt);
  }

  return { isRejoin, joinCount, inviteInfo, joinNumber, isAlt, accountAgeDays };
}

export async function handleMemberLeave(member: GuildMember) {
  const guild = member.guild;
  const userId = member.user.id;
  const record = getMemberRecord(guild.id, userId);
  if (!record) return;

  const now = Date.now();
  const joinedAt = new Date(record.lastJoined).getTime();
  const isFake = now - joinedAt < FAKE_THRESHOLD_MS;

  setMemberRecord(guild.id, userId, { ...record, leftAt: new Date().toISOString() });

  if (record.lastInviterId && record.lastInviterId !== "Unknown") {
    markInviterLeft(guild.id, record.lastInviterId, userId);
    if (isFake) markInviterFake(guild.id, record.lastInviterId, userId);
  }
}

export async function handleInvites(interaction: ChatInputCommandInteraction) {
  const targetUser = interaction.options.getUser("user") ?? interaction.user;
  const guild = interaction.guild!;
  const stats = getInviterStats(guild.id, targetUser.id);

  const { embed, attachment } = buildEmbed({
    title: `📨 Invite Stats — ${targetUser.username}`,
    message: [
      `✅ **Total Invites:** ${stats.total}`,
      `👥 **Currently In Server:** ${stats.total - stats.left - stats.fake}`,
      `🚪 **Left:** ${stats.left}`,
      `🚫 **Fake (left within 24h):** ${stats.fake}`,
      `🤖 **Alts (new accounts):** ${stats.alts}`,
    ].join("\n"),
    color: "#5865f2",
    authorName: guild.name,
    footer: `User ID: ${targetUser.id}`,
  });

  await interaction.editReply({ embeds: [embed], files: attachment ? [attachment] : [] });
}
