const { EmbedBuilder, TimestampStyles } = require('discord.js');

/**
 * Sets the timestamp for an embed message
 * @param {Array} args - Tag arguments [timestamp (optional)] - If not provided, uses current time
 * @param {Object} message - Message object
 * @param {Object} client - Discord client
 * @param {Object} embedData - Data for embed construction
 * @returns {Date|Number} - The timestamp
 */
function $timestamp(args, message, client, embedData) {
  // Se nenhum argumento for fornecido, use o timestamp atual
  const timestamp = args && args.length > 0 ? new Date(args[0]) : new Date();
  
  // Verifica se a data é válida
  if (isNaN(timestamp.getTime())) {
    console.error('Invalid timestamp:', args[0]);
    return null;
  }
  
  // Se embedData é fornecido, define a propriedade timestamp
  if (embedData && typeof embedData === 'object') {
    embedData.timestamp = timestamp;
  }
  
  return timestamp;
}

module.exports = {
  $timestamp
}; 