const { EmbedBuilder } = require('discord.js');

/**
 * Sets the description for an embed message
 * @param {Array} args - Tag arguments [description]
 * @param {Object} message - Message object
 * @param {Object} client - Discord client
 * @param {Object} embedData - Data for embed construction
 * @returns {String} - The description text
 */
function $description(args, message, client, embedData) {
  if (!args || args.length < 1) return null;
  
  const description = args.join(' ');
  if (embedData && typeof embedData === 'object') {
    embedData.description = description;
  }
  
  return description;
}

module.exports = {
  $description
}; 