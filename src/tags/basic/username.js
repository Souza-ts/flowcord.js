const { Client, User, GuildMember } = require('discord.js');

/**
 * Retorna o nome de usuário de um membro ou usuário
 * @param {Array} args - Argumentos da tag [userId] - Se não fornecido, usa o autor da mensagem
 * @param {Object} message - Objeto da mensagem
 * @param {Object} client - Cliente do Discord
 * @returns {String|null} - O nome de usuário ou null se não encontrado
 */
function $username(args, message, client) {
    // Validação inicial do cliente
    if (!client || !client.users) {
        throw new Error('Cliente Discord não inicializado corretamente');
    }

    // Obtém o ID do usuário (priorizando o fornecido, senão usa o autor)
    const userId = args && args.length > 0 
        ? args[0].replace(/[<@!>]/g, '')
        : message?.author?.id;

    // Validação do ID
    if (!userId || !userId.match(/^\d{17,19}$/)) {
        return null;
    }

    try {
        // Tenta obter o membro da guild atual
        if (message?.guild) {
            const guildMember = message.guild.members.cache.get(userId);
            if (guildMember) {
                return guildMember.user.username;
            }
        }

        // Tenta obter o usuário do cache global
        const user = client.users.cache.get(userId);
        if (user) {
            return user.username;
        }

        // Se não encontrar o usuário, retorna null
        return null;
    } catch (error) {
        console.error('Erro ao obter nome de usuário:', error);
        return null;
    }
}

module.exports = {
    $username
};