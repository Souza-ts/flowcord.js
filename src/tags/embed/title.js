const { EmbedBuilder } = require('discord.js');

/**
 * Sets the title for an embed message
 * @param {Array} args - Tag arguments [title]
 * @param {Object} message - Message object
 * @param {Object} client - Discord client
 * @param {Object} embedData - Data for embed construction
 * @returns {String} - The title text
 */
function $title(args, message, client, embedData) {
  if (!args || args.length < 1) return null;
  
  const title = args.join(' ');
  if (embedData && typeof embedData === 'object') {
    embedData.title = title;
  }
  
  return title;
}

module.exports = {
  $title
};