const { Client } = require('discord.js');

/**
 * Retorna o ping/latência do bot em milissegundos
 * @param {Array} args - Argumentos da tag (não utilizados nesta tag)
 * @param {Object} message - Objeto da mensagem
 * @param {Object} client - Cliente do Discord
 * @returns {Number|null} - A latência em milissegundos ou null se não disponível
 */
function $ping(args, message, client) {
    // Validação do cliente
    if (!client || !client.ws) {
        return null;
    }

    // Verifica se o cliente está conectado
    if (!client.readyAt) {
        return null;
    }

    // Obtém e arredonda o ping
    const ping = client.ws.ping;
    
    // Valida se o ping é um número válido
    if (isNaN(ping) || ping < 0) {
        return null;
    }

    return Math.round(ping);
}

module.exports = {
    $ping
};