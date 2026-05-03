import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const DATA_DIR = join(process.cwd(), "bot-data");
const DATA_FILE = join(DATA_DIR, "store.json");

export interface EconomyEntry {
  emeralds: number;
  rubies: number;
  lastDaily: string | null;
  lastMessage: string | null;
}

export interface Warning {
  id: string;
  reason: string;
  moderatorId: string;
  moderatorName: string;
  timestamp: string;
}

export interface AfkEntry {
  reason: string;
  since: string;
}

export interface RedeemCode {
  emeralds: number;
  rubies: number;
  maxUses: number;
  usedBy: string[];
}

export interface GuildConfig {
  reportChannelId?: string;
  welcomeChannelId?: string;
}

export interface MemberRecord {
  joinCount: number;
  firstJoined: string;
  lastJoined: string;
  lastInviteCode?: string;
  lastInviterId?: string;
  lastInviterName?: string;
  leftAt: string | null;
  isAlt: boolean;
  accountAgeDays: number;
}

export interface InviterStats {
  total: number;
  fake: number;
  left: number;
  alts: number;
  invitedUsers: string[];
  fakeUsers: string[];
  leftUsers: string[];
  altUsers: string[];
}

export interface StoreData {
  economy: Record<string, EconomyEntry>;
  warnings: Record<string, Warning[]>;
  afk: Record<string, AfkEntry>;
  codes: Record<string, RedeemCode>;
  customRoles: Record<string, string>;
  guildConfig: Record<string, GuildConfig>;
  messageStats: Record<string, Record<string, number>>;
  memberHistory: Record<string, Record<string, MemberRecord>>;
  inviterStats: Record<string, Record<string, InviterStats>>;
}

function defaultStore(): StoreData {
  return {
    economy: {},
    warnings: {},
    afk: {},
    codes: {},
    customRoles: {},
    guildConfig: {},
    messageStats: {},
    memberHistory: {},
    inviterStats: {},
  };
}

function load(): StoreData {
  try {
    if (!existsSync(DATA_FILE)) return defaultStore();
    const parsed = JSON.parse(readFileSync(DATA_FILE, "utf-8")) as Partial<StoreData>;
    return { ...defaultStore(), ...parsed };
  } catch {
    return defaultStore();
  }
}

function save(data: StoreData) {
  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

// ── Economy ──────────────────────────────────────────────────────────────────

export function getEconomy(userId: string): EconomyEntry {
  const data = load();
  if (!data.economy[userId]) {
    data.economy[userId] = { emeralds: 0, rubies: 0, lastDaily: null, lastMessage: null };
    save(data);
  }
  return data.economy[userId]!;
}

export function updateEconomy(userId: string, patch: Partial<EconomyEntry>) {
  const data = load();
  const current = data.economy[userId] ?? { emeralds: 0, rubies: 0, lastDaily: null, lastMessage: null };
  data.economy[userId] = { ...current, ...patch };
  save(data);
}

// ── Warnings ─────────────────────────────────────────────────────────────────

export function getWarnings(userId: string): Warning[] {
  const data = load();
  return data.warnings[userId] ?? [];
}

export function addWarning(userId: string, warning: Warning) {
  const data = load();
  if (!data.warnings[userId]) data.warnings[userId] = [];
  data.warnings[userId]!.push(warning);
  save(data);
}

export function clearWarnings(userId: string) {
  const data = load();
  data.warnings[userId] = [];
  save(data);
}

// ── AFK ───────────────────────────────────────────────────────────────────────

export function getAfk(userId: string): AfkEntry | null {
  const data = load();
  return data.afk[userId] ?? null;
}

export function setAfk(userId: string, entry: AfkEntry | null) {
  const data = load();
  if (entry === null) {
    delete data.afk[userId];
  } else {
    data.afk[userId] = entry;
  }
  save(data);
}

// ── Codes ─────────────────────────────────────────────────────────────────────

export function getCode(code: string): RedeemCode | null {
  const data = load();
  return data.codes[code.toUpperCase()] ?? null;
}

export function createCode(code: string, entry: RedeemCode) {
  const data = load();
  data.codes[code.toUpperCase()] = entry;
  save(data);
}

export function markCodeUsed(code: string, userId: string) {
  const data = load();
  const c = data.codes[code.toUpperCase()];
  if (c) {
    c.usedBy.push(userId);
    save(data);
  }
}

// ── Custom Roles ──────────────────────────────────────────────────────────────

export function getCustomRole(userId: string): string | null {
  const data = load();
  return data.customRoles[userId] ?? null;
}

export function setCustomRole(userId: string, roleId: string | null) {
  const data = load();
  if (roleId === null) {
    delete data.customRoles[userId];
  } else {
    data.customRoles[userId] = roleId;
  }
  save(data);
}

// ── Guild Config ──────────────────────────────────────────────────────────────

export function getGuildConfig(guildId: string): GuildConfig {
  const data = load();
  return data.guildConfig[guildId] ?? {};
}

export function setGuildConfig(guildId: string, patch: Partial<GuildConfig>) {
  const data = load();
  data.guildConfig[guildId] = { ...data.guildConfig[guildId], ...patch };
  save(data);
}

// ── Message Stats ─────────────────────────────────────────────────────────────

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}
function monthKey(): string {
  return new Date().toISOString().slice(0, 7);
}
function yearKey(): string {
  return new Date().toISOString().slice(0, 4);
}

export function recordMessage(userId: string) {
  const data = load();
  if (!data.messageStats[userId]) data.messageStats[userId] = {};
  const stats = data.messageStats[userId]!;
  const day = todayKey();
  const month = monthKey();
  const year = yearKey();
  stats[day] = (stats[day] ?? 0) + 1;
  stats[month] = (stats[month] ?? 0) + 1;
  stats[year] = (stats[year] ?? 0) + 1;
  stats["total"] = (stats["total"] ?? 0) + 1;
  save(data);
}

export function getMessageStats(userId: string): { today: number; month: number; year: number; total: number } {
  const data = load();
  const stats = data.messageStats[userId] ?? {};
  return {
    today: stats[todayKey()] ?? 0,
    month: stats[monthKey()] ?? 0,
    year: stats[yearKey()] ?? 0,
    total: stats["total"] ?? 0,
  };
}

// ── Member History ────────────────────────────────────────────────────────────

export function getMemberRecord(guildId: string, userId: string): MemberRecord | null {
  const data = load();
  return data.memberHistory[guildId]?.[userId] ?? null;
}

export function setMemberRecord(guildId: string, userId: string, record: MemberRecord) {
  const data = load();
  if (!data.memberHistory[guildId]) data.memberHistory[guildId] = {};
  data.memberHistory[guildId]![userId] = record;
  save(data);
}

// ── Inviter Stats ─────────────────────────────────────────────────────────────

function defaultInviterStats(): InviterStats {
  return { total: 0, fake: 0, left: 0, alts: 0, invitedUsers: [], fakeUsers: [], leftUsers: [], altUsers: [] };
}

export function getInviterStats(guildId: string, inviterId: string): InviterStats {
  const data = load();
  return data.inviterStats[guildId]?.[inviterId] ?? defaultInviterStats();
}

export function addInviterUse(guildId: string, inviterId: string, invitedUserId: string, isAlt: boolean) {
  const data = load();
  if (!data.inviterStats[guildId]) data.inviterStats[guildId] = {};
  const s = data.inviterStats[guildId]![inviterId] ?? defaultInviterStats();
  if (!s.invitedUsers.includes(invitedUserId)) {
    s.total += 1;
    s.invitedUsers.push(invitedUserId);
  }
  if (isAlt && !s.altUsers.includes(invitedUserId)) {
    s.alts += 1;
    s.altUsers.push(invitedUserId);
  }
  data.inviterStats[guildId]![inviterId] = s;
  save(data);
}

export function markInviterLeft(guildId: string, inviterId: string, leftUserId: string) {
  const data = load();
  if (!data.inviterStats[guildId]) data.inviterStats[guildId] = {};
  const s = data.inviterStats[guildId]![inviterId] ?? defaultInviterStats();
  if (!s.leftUsers.includes(leftUserId)) {
    s.left += 1;
    s.leftUsers.push(leftUserId);
  }
  data.inviterStats[guildId]![inviterId] = s;
  save(data);
}

export function markInviterFake(guildId: string, inviterId: string, fakeUserId: string) {
  const data = load();
  if (!data.inviterStats[guildId]) data.inviterStats[guildId] = {};
  const s = data.inviterStats[guildId]![inviterId] ?? defaultInviterStats();
  if (!s.fakeUsers.includes(fakeUserId)) {
    s.fake += 1;
    s.fakeUsers.push(fakeUserId);
  }
  data.inviterStats[guildId]![inviterId] = s;
  save(data);
}
