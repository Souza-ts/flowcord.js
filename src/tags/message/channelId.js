const { channelMention } = require('discord.js');

function $channelId(args, message) {
  const id = message?.channel?.id;
  return args?.[0] === 'mention' && id ? channelMention(id) : id || null;
}

module.exports = { $channelId };
