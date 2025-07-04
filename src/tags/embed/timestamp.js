const { EmbedBuilder } = require('discord.js');

function $timestamp(args, message, client, embedData) {
  const timestamp = args?.[0] ? new Date(args[0]) : new Date();

  if (isNaN(timestamp.getTime())) {
    console.error('Invalid timestamp:', args[0]);
    return null;
  }

  if (embedData && typeof embedData === 'object') {
    embedData.timestamp = timestamp;
  }

  return timestamp;
}

module.exports = { $timestamp };
