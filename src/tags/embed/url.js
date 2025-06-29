const { EmbedBuilder } = require('discord.js');

/**
 * Sets the URL for an embed message
 * @param {Array} args - Tag arguments [url]
 * @param {Object} message - Message object
 * @param {Object} client - Discord client
 * @param {Object} embedData - Data for embed construction
 * @returns {String} - The URL
 */
function $url(args, message, client, embedData) {
  if (!args || args.length < 1) return null;
  
  const url = args[0];
  
  // Verifica se a URL é válida
  try {
    new URL(url);
  } catch (e) {
    console.error('Invalid URL:', url);
    return null;
  }
  
  // Se embedData é fornecido, define a propriedade url
  if (embedData && typeof embedData === 'object') {
    embedData.url = url;
  }
  
  return url;
}

module.exports = {
  $url
}; 