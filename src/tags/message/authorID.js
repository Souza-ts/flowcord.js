const { User, userMention } = require('discord.js');

/**
 * Returns the ID of the message author
 * @param {Array} args - Tag arguments (not used in this tag)
 * @param {Object} message - Message object
 * @returns {String} - Author ID
 */
function $authorID(args, message) {
  if (!message || !message.author) return null;
  // Retorna o ID do autor e pode ser usado para menções
  return message.author.id;
}

module.exports = {
  $authorID
}; 