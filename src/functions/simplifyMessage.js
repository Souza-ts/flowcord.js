const { EmbedBuilder } = require('discord.js');

/**
 * Facilita o envio de mensagens
 * @param {Object} options - Opções de mensagem
 * @param {Object} message - Objeto de mensagem original
 * @returns {Promise<Message>}
 */
async function sendMessage(options, message) {
  // Configurações padrão
  const settings = {
    content: '',
    embeds: [],
    components: [],
    ephemeral: false,
    reply: true,
    deleteAfter: null
  };

  // Mesclar com as opções fornecidas
  Object.assign(settings, options);

  // Criação de embed simplificada
  if (options.embed) {
    const embed = new EmbedBuilder();
    
    if (options.embed.title) embed.setTitle(options.embed.title);
    if (options.embed.description) embed.setDescription(options.embed.description);
    if (options.embed.color) embed.setColor(options.embed.color);
    if (options.embed.footer) embed.setFooter(options.embed.footer);
    if (options.embed.image) embed.setImage(options.embed.image);
    if (options.embed.thumbnail) embed.setThumbnail(options.embed.thumbnail);
    if (options.embed.author) embed.setAuthor(options.embed.author);
    if (options.embed.fields) embed.addFields(options.embed.fields);
    
    settings.embeds.push(embed);
  }

  // Opções da mensagem
  const messageOptions = {
    content: settings.content,
    embeds: settings.embeds,
    components: settings.components,
    ephemeral: settings.ephemeral
  };

  // Enviar mensagem
  let sentMessage;
  if (settings.reply && message) {
    sentMessage = await message.reply(messageOptions);
  } else if (message.channel) {
    sentMessage = await message.channel.send(messageOptions);
  }

  // Auto-deletar após certo tempo (se especificado)
  if (settings.deleteAfter && sentMessage) {
    setTimeout(() => {
      sentMessage.delete().catch(() => {});
    }, settings.deleteAfter);
  }

  return sentMessage;
}

module.exports = { sendMessage }; 