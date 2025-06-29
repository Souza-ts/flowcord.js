const { Guild, GuildMember } = require('discord.js');

/**
 * Returns the ID of the current guild (server)
 * @param {Array} args - Tag arguments (not used in this tag)
 * @param {Object} message - Message object
 * @returns {String} - Guild ID
 */
function $guildId(args, message) {
  if (!message || !message.guild) return null;
  return message.guild.id;
}

module.exports = {
  $guildID
}; 