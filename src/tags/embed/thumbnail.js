const { EmbedBuilder, AttachmentBuilder } = require('discord.js');

/**
 * Sets the thumbnail for an embed message
 * @param {Array} args - Tag arguments [thumbnailURL]
 * @param {Object} message - Message object
 * @param {Object} client - Discord client
 * @param {Object} embedData - Data for embed construction
 * @returns {String} - The thumbnail URL
 */
function $thumbnail(args, message, client, embedData) {
  if (!args || args.length < 1) return null;
  
  const thumbnailURL = args[0];
  
  // Verifica se a URL é válida
  try {
    new URL(thumbnailURL);
  } catch (e) {
    console.error('Invalid thumbnail URL:', thumbnailURL);
    return null;
  }
  
  // No Discord.js v14, a miniatura precisa ser definida como objeto com url
  // Similar à imagem, também suporta anexos locais com AttachmentBuilder
  if (embedData && typeof embedData === 'object') {
    embedData.thumbnail = { url: thumbnailURL };
  }
  
  return thumbnailURL;
}

module.exports = {
  $thumbnail
}; 