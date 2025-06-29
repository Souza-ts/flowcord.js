const { EmbedBuilder } = require('discord.js');

/**
 * Adds a field to an embed message
 * @param {Array} args - Tag arguments [name, value, inline (boolean as string)]
 * @param {Object} message - Message object
 * @param {Object} client - Discord client
 * @param {Object} embedData - Data for embed construction
 * @returns {Object} - The field object
 */
function $field(args, message, client, embedData) {
  if (!args || args.length < 2) return null;
  
  const name = args[0];
  const value = args[1];
  const inline = args.length > 2 ? args[2] === 'true' : false;
  const field = { name, value, inline };
  
  // Se embedData é fornecido, adiciona ao array de campos
  if (embedData && typeof embedData === 'object') {
    if (!embedData.fields) {
      embedData.fields = [];
    }
    embedData.fields.push(field);
  }
  
  return field;
}

module.exports = {
  $addField
}; 