const { Client } = require('discord.js');

function $avatar(args, message, client) {
  const userId = args?.[0]?.replace(/[<@!>]/g, '') || message.author?.id;
  if (!userId) return null;

  const size = args?.[1] ? parseInt(args[1]) : 1024;
  const format = args?.[2] || 'png';

  if (message?.guild) {
    const guildMember = message.guild.members.cache.get(userId);
    if (guildMember) {
      return guildMember.user.displayAvatarURL({
        size,
        forceStatic: format !== 'gif',
        extension: format
      });
    }
  }

  const user = client.users.cache.get(userId);
  if (user) {
    return user.displayAvatarURL({
      size,
      forceStatic: format !== 'gif',
      extension: format
    });
  }

  return null;
}

module.exports = { $avatar };
