const { EmbedBuilder, resolveColor } = require('discord.js');

/**
 * Sets the color for an embed message
 * @param {Array} args - Tag arguments [color] (hex, integer, or named color)
 * @param {Object} message - Message object
 * @param {Object} client - Discord client
 * @param {Object} embedData - Data for embed construction
 * @returns {String|Number} - The color value
 */
function $color(args, message, client, embedData) {
  if (!args || args.length < 1) return null;
  
  const colorInput = args[0];
  let color;
  
  try {
    color = resolveColor(colorInput);
  } catch (e) {
    console.error('Invalid color:', colorInput);
    // Cor padrão caso inválida (azul Discord)
    color = 0x5865F2;
  }
  
  // Se embedData é fornecido, define a propriedade color
  if (embedData && typeof embedData === 'object') {
    embedData.color = color;
  }
  
  return color;
}

module.exports = {
  $color
}; 