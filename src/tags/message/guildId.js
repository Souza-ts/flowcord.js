function $guildId(args, message) {
  return message?.guild?.id || null;
}

module.exports = { $guildId };
