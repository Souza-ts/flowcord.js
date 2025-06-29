const { EmbedBuilder } = require('discord.js');

/**
 * Sets the footer for an embed message
 * @param {Array} args - Tag arguments [footerText, footerIconURL (optional)]
 * @param {Object} message - Message object
 * @param {Object} client - Discord client
 * @param {Object} embedData - Data for embed construction
 * @returns {Object} - The footer object
 */
function $footer(args, message, client, embedData) {
  if (!args || args.length < 1) return null;
  
  const footerText = args[0];
  const footerIconURL = args.length > 1 ? args[1] : null;
  const footer = {
    text: footerText,
    iconURL: footerIconURL
  };
  
  // Se embedData é fornecido, define a propriedade footer
  if (embedData && typeof embedData === 'object') {
    embedData.footer = footer;
  }
  
  return footer;
}

module.exports = {
  $footer
}; 