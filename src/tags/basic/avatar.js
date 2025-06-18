const { Client, User, GuildMember } = require('discord.js');

/**
 * Returns the avatar URL of a user
 * @param {Array} args - Tag arguments [userId, size, format] - If userId not provided, uses message author
 * @param {Object} message - Message object
 * @param {Object} client - Discord client
 * @returns {String} - The avatar URL
 */
function $avatar(args, message, client) {
  // Se nenhum ID for fornecido, use o autor da mensagem
  const userId = args && args.length > 0 ? args[0].replace(/[<@!>]/g, '') : message.author?.id;
  
  if (!userId) return null;
  
  // Parâmetros opcionais
  const size = args && args.length > 1 ? parseInt(args[1]) : 1024;
  const format = args && args.length > 2 ? args[2] : 'png';
  
  // Primeira, tente obter um membro da guild na mensagem atual
  if (message?.guild) {
    const guildMember = message.guild.members.cache.get(userId);
    if (guildMember) {
      // No Discord.js v14, displayAvatarURL() aceita opções como objeto
      return guildMember.user.displayAvatarURL({ 
        size: size, 
        forceStatic: format !== 'gif',
        extension: format
      });
    }
  }
  
  // Tente obter o usuário do cache global de usuários
  const user = client.users.cache.get(userId);
  if (user) {
    return user.displayAvatarURL({ 
      size: size, 
      forceStatic: format !== 'gif',
      extension: format
    });
  }
  
  // Se não conseguirmos encontrar o usuário, retorne null
  return null;
}

module.exports = {
  $avatar
}; 