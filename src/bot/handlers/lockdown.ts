import {
  ChatInputCommandInteraction,
  PermissionsBitField,
  TextChannel,
  CategoryChannel,
  OverwriteType,
} from "discord.js";

export async function handleLockdown(interaction: ChatInputCommandInteraction) {
  const guild = interaction.guild!;
  await interaction.editReply("🔒 Locking all text channels...");

  const channels = [...guild.channels.cache.values()].filter(
    (c): c is TextChannel => c.isTextBased() && !c.isDMBased()
  );

  let locked = 0;
  let failed = 0;

  for (const channel of channels) {
    try {
      await channel.permissionOverwrites.edit(
        guild.roles.everyone,
        { SendMessages: false },
        { reason: `Server lockdown by ${interaction.user.username}` }
      );
      locked++;
    } catch {
      failed++;
    }
  }

  await interaction.editReply(
    `🔒 **Server Lockdown Active**\n✅ Locked: **${locked}** channels | ❌ Failed: **${failed}**\nUse \`/unlockdown\` to restore access.`
  );
}

export async function handleUnlockdown(interaction: ChatInputCommandInteraction) {
  const guild = interaction.guild!;
  await interaction.editReply("🔓 Unlocking all text channels...");

  const channels = [...guild.channels.cache.values()].filter(
    (c): c is TextChannel => c.isTextBased() && !c.isDMBased()
  );

  let unlocked = 0;
  let failed = 0;

  for (const channel of channels) {
    try {
      await channel.permissionOverwrites.edit(
        guild.roles.everyone,
        { SendMessages: null },
        { reason: `Lockdown lifted by ${interaction.user.username}` }
      );
      unlocked++;
    } catch {
      failed++;
    }
  }

  await interaction.editReply(
    `🔓 **Server Lockdown Lifted**\n✅ Unlocked: **${unlocked}** channels | ❌ Failed: **${failed}**`
  );
}
