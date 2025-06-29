const { ChannelType, channelMention } = require('discord.js');

/**
 * Returns the ID of the current channel
 * @param {Array} args - Tag arguments (not used in this tag)
 * @param {Object} message - Message object
 * @returns {String} - Channel ID
 */
function $channelId(args, message) {
  if (!message || !message.channel) return null;
  
  // Retorna o ID do canal e pode ser usado para menções
  return message.channel.id;
}

module.exports = {
  $channelID
}; 