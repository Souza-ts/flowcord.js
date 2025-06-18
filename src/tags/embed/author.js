const { EmbedBuilder } = require('discord.js');

/**
 * Define o autor de uma mensagem embed
 * @param {Array} args - Argumentos da tag [name, iconURL (opcional), url (opcional)]
 * @param {Object} message - Objeto da mensagem
 * @param {Object} client - Cliente do Discord
 * @param {Object} embedData - Dados para construção do embed
 * @returns {Object} - O objeto do autor
 */
function $author(args, message, client, embedData) {
    // Validação inicial dos argumentos
    if (!args || args.length < 1) {
        console.log('Uso incorreto: $author(name, [iconURL], [url]) - Faltou o nome do autor');
        return null;
    }

    // Obtém e valida o nome do autor
    const name = args[0];
    if (typeof name !== 'string' || name.trim() === '') {
        console.log('Nome do autor inválido - Deve ser uma string não vazia');
        return null;
    }

    // Obtém URLs opcionais
    const iconURL = args.length > 1 ? args[1] : null;
    const url = args.length > 2 ? args[2] : null;

    // Validação das URLs
    if (iconURL && typeof iconURL !== 'string') {
        console.log('URL do ícone inválida - Deve ser uma string');
        return null;
    }
    if (url && typeof url !== 'string') {
        console.log('URL inválida - Deve ser uma string');
        return null;
    }

    // Cria o objeto do autor
    const author = {
        name: name
    };

    // Adiciona URLs se válidas
    if (iconURL) author.iconURL = iconURL;
    if (url) author.url = url;

    // Aplica ao embedData se fornecido
    if (embedData && typeof embedData === 'object') {
        embedData.author = author;
    }

    return author;
}

module.exports = {
    $author
};