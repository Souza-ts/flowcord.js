const { Guild, GuildMemberManager } = require('discord.js');

/**
 * Returns the number of members in the current guild
 * @param {Array} args - Tag arguments (not used in this tag)
 * @param {Object} message - Message object
 * @returns {Number} - Number of members
 */
function $membersCount(args, message) {
  if (!message || !message.guild) return 0;
  
  // No Discord.js v14, também podemos usar guild.members.cache.size
  // para contar membros que já estão em cache
  return message.guild.memberCount;
}

module.exports = {
  $membersCount
}; 