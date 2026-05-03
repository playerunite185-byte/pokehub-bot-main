import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";

export const commands = [
  // ── DM commands ───────────────────────────────────────────────────────────
  new SlashCommandBuilder()
    .setName("dm-user")
    .setDescription("Send a custom DM to a specific user")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addUserOption((o) => o.setName("user").setDescription("User to DM").setRequired(true))
    .addStringOption((o) => o.setName("message").setDescription("Message body").setRequired(true))
    .addStringOption((o) => o.setName("title").setDescription("Embed title"))
    .addStringOption((o) => o.setName("color").setDescription("Hex color e.g. #ff0000"))
    .addStringOption((o) => o.setName("footer").setDescription("Footer text")),

  new SlashCommandBuilder()
    .setName("dm-all")
    .setDescription("Mass DM every member in the server (Admin only)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((o) => o.setName("message").setDescription("Message body").setRequired(true))
    .addStringOption((o) => o.setName("title").setDescription("Embed title"))
    .addStringOption((o) => o.setName("color").setDescription("Hex color e.g. #ff0000"))
    .addStringOption((o) => o.setName("footer").setDescription("Footer text")),

  new SlashCommandBuilder()
    .setName("dm-role")
    .setDescription("DM all members with a specific role")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addRoleOption((o) => o.setName("role").setDescription("Target role").setRequired(true))
    .addStringOption((o) => o.setName("message").setDescription("Message body").setRequired(true))
    .addStringOption((o) => o.setName("title").setDescription("Embed title"))
    .addStringOption((o) => o.setName("color").setDescription("Hex color e.g. #ff0000"))
    .addStringOption((o) => o.setName("footer").setDescription("Footer text")),

  // ── Warnings ──────────────────────────────────────────────────────────────
  new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Issue a warning to a member")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addUserOption((o) => o.setName("user").setDescription("Member to warn").setRequired(true))
    .addStringOption((o) => o.setName("reason").setDescription("Reason").setRequired(true)),

  new SlashCommandBuilder()
    .setName("warnings")
    .setDescription("View all warnings for a member (shows total count)")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addUserOption((o) => o.setName("user").setDescription("Member to check").setRequired(true)),

  new SlashCommandBuilder()
    .setName("clearwarnings")
    .setDescription("Clear all warnings for a member (Admin only)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption((o) => o.setName("user").setDescription("Member to clear").setRequired(true)),

  // ── Moderation actions ────────────────────────────────────────────────────
  new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Temporarily mute a member")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((o) => o.setName("user").setDescription("Member to timeout").setRequired(true))
    .addStringOption((o) =>
      o.setName("duration").setDescription("Duration: 10s, 5m, 2h, 1d (max 28d)").setRequired(true)
    )
    .addStringOption((o) => o.setName("reason").setDescription("Reason")),

  new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Ban a member from the server")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption((o) => o.setName("user").setDescription("Member to ban").setRequired(true))
    .addStringOption((o) => o.setName("reason").setDescription("Reason for the ban"))
    .addIntegerOption((o) =>
      o.setName("delete-messages").setDescription("Delete messages from last N days (0–7)").setMinValue(0).setMaxValue(7)
    ),

  new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick a member from the server")
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption((o) => o.setName("user").setDescription("Member to kick").setRequired(true))
    .addStringOption((o) => o.setName("reason").setDescription("Reason for the kick")),

  new SlashCommandBuilder()
    .setName("nickname")
    .setDescription("Change or reset a member's nickname")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames)
    .addUserOption((o) => o.setName("user").setDescription("Target member").setRequired(true))
    .addStringOption((o) => o.setName("nickname").setDescription("New nickname (blank = reset)")),

  // ── Reports ───────────────────────────────────────────────────────────────
  new SlashCommandBuilder()
    .setName("report")
    .setDescription("Report a member to the moderation team")
    .addUserOption((o) => o.setName("user").setDescription("Member to report").setRequired(true))
    .addStringOption((o) => o.setName("reason").setDescription("Reason for the report").setRequired(true))
    .addAttachmentOption((o) => o.setName("proof").setDescription("Screenshot or image proof (optional)")),

  new SlashCommandBuilder()
    .setName("set-report-channel")
    .setDescription("Set the channel where reports are sent (Admin only)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption((o) =>
      o.setName("channel").setDescription("Text channel for reports").setRequired(true)
    ),

  // ── Welcome ───────────────────────────────────────────────────────────────
  new SlashCommandBuilder()
    .setName("set-welcome-channel")
    .setDescription("Set the channel for welcome messages (Admin only)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption((o) =>
      o.setName("channel").setDescription("Text channel for welcome messages").setRequired(true)
    ),

  // ── Invites ───────────────────────────────────────────────────────────────
  new SlashCommandBuilder()
    .setName("invites")
    .setDescription("View invite stats — total, fake, left, and alt invites")
    .addUserOption((o) => o.setName("user").setDescription("Check another user's invite stats")),

  // ── Economy ───────────────────────────────────────────────────────────────
  new SlashCommandBuilder()
    .setName("balance")
    .setDescription("Check your emerald and ruby balance")
    .addUserOption((o) => o.setName("user").setDescription("Check another user's balance")),

  new SlashCommandBuilder()
    .setName("daily")
    .setDescription("Claim your daily 200 💎 Emeralds"),

  new SlashCommandBuilder()
    .setName("give-ruby")
    .setDescription("Give rubies to a member (Admin only)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption((o) => o.setName("user").setDescription("Recipient").setRequired(true))
    .addIntegerOption((o) => o.setName("amount").setDescription("Number of rubies").setRequired(true).setMinValue(1)),

  // ── Shop ──────────────────────────────────────────────────────────────────
  new SlashCommandBuilder()
    .setName("shop")
    .setDescription("Open the server shop")
    .addSubcommand((sub) => sub.setName("menu").setDescription("Browse the shop"))
    .addSubcommand((sub) =>
      sub
        .setName("create-role")
        .setDescription("Create your custom role (2,500 💎 Emeralds)")
        .addStringOption((o) => o.setName("name").setDescription("Role name").setRequired(true))
        .addStringOption((o) => o.setName("color").setDescription("Hex color e.g. #ff00ff").setRequired(true))
    )
    .addSubcommand((sub) =>
      sub
        .setName("redeem")
        .setDescription("Redeem a reward code")
        .addStringOption((o) => o.setName("code").setDescription("Your code").setRequired(true))
    ),

  new SlashCommandBuilder()
    .setName("create-code")
    .setDescription("Create a redeemable reward code (Admin only)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((o) => o.setName("code").setDescription("Code string").setRequired(true))
    .addIntegerOption((o) => o.setName("emeralds").setDescription("Emeralds to reward").setMinValue(0))
    .addIntegerOption((o) => o.setName("rubies").setDescription("Rubies to reward").setMinValue(0))
    .addIntegerOption((o) => o.setName("max-uses").setDescription("Max uses (default 1)").setMinValue(1)),

  // ── Stats ─────────────────────────────────────────────────────────────────
  new SlashCommandBuilder()
    .setName("stats")
    .setDescription("View message activity stats for a member")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addUserOption((o) => o.setName("user").setDescription("Member to check (default: yourself)")),

  // ── Lockdown ──────────────────────────────────────────────────────────────
  new SlashCommandBuilder()
    .setName("lockdown")
    .setDescription("Lock all text channels for @everyone (Admin only)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  new SlashCommandBuilder()
    .setName("unlockdown")
    .setDescription("Lift the lockdown and restore all channels (Admin only)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  // ── Time ──────────────────────────────────────────────────────────────────
  new SlashCommandBuilder()
    .setName("time")
    .setDescription("Check the current time for any country (saves your timezone)")
    .addStringOption((o) =>
      o
        .setName("country")
        .setDescription("Search and select your country")
        .setRequired(true)
        .setAutocomplete(true)
    ),
].map((cmd) => cmd.toJSON());
