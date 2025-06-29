const { EmbedBuilder, AttachmentBuilder } = require('discord.js');

/**
 * Sets the image for an embed message
 * @param {Array} args - Tag arguments [imageURL]
 * @param {Object} message - Message object
 * @param {Object} client - Discord client
 * @param {Object} embedData - Data for embed construction
 * @returns {String} - The image URL
 */
function $image(args, message, client, embedData) {
  if (!args || args.length < 1) return null;
  
  const imageURL = args[0];
  
  // Verifica se a URL é válida
  try {
    new URL(imageURL);
  } catch (e) {
    console.error('Invalid image URL:', imageURL);
    return null;
  }
  
  if (embedData && typeof embedData === 'object') {
    embedData.image = { url: imageURL };
  }
  
  return imageURL;
}

module.exports = {
  $image
}; 