function $username(args, message, client) {
  const userId = args?.[0]?.replace(/[<@!>]/g, '') || message.author?.id;
  if (!userId) return null;

  if (message?.guild) {
    const guildMember = message.guild.members.cache.get(userId);
    if (guildMember) {
      return guildMember.user.username;
    }
  }

  const user = client.users.cache.get(userId);
  if (user) {
    return user.username;
  }

  return null;
}

module.exports = { $username };
