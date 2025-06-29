const { 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  SelectMenuBuilder, 
  ButtonStyle, 
  AttachmentBuilder, 
  userMention, 
  channelMention,
  TimestampStyles,
  resolveColor
} = require('discord.js');
const fs = require('fs');
const path = require('path');

// Função para carregar tags de arquivos
/**
 * Carrega todas as tags da pasta /tags
 * @returns {Object} - Objeto com todas as tags carregadas
 */
function loadTagsFromFiles() {
  const tagFunctions = {};
  const tagsDir = path.join(__dirname, '../tags');
  
  // Verifica se o diretório existe
  if (!fs.existsSync(tagsDir)) {
    console.error('Diretório de tags não encontrado:', tagsDir);
    return {};
  }
  
  // Lê todas as categorias (pastas dentro de /tags)
  const categories = fs.readdirSync(tagsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  // Para cada categoria, carrega os arquivos de tag
  for (const category of categories) {
    const categoryDir = path.join(tagsDir, category);
    // Pula o arquivo index.js em cada categoria
    const tagFiles = fs.readdirSync(categoryDir)
      .filter(file => file.endsWith('.js') && file !== 'index.js');
    
    for (const file of tagFiles) {
      try {
        const tagModule = require(path.join(categoryDir, file));
        
        // Adiciona cada tag do módulo ao objeto de tags
        Object.assign(tagFunctions, tagModule);
      } catch (error) {
        console.error(`Erro ao carregar tag de ${category}/${file}:`, error);
      }
    }
  }
  
  return tagFunctions;
}

// Carrega as tags dos arquivos
const tagFunctions = loadTagsFromFiles();

// Função para registrar tags adicionais manualmente
function registerTag(name, func) {
  if (!name.startsWith('$')) {
    name = '$' + name;
  }
  tagFunctions[name] = func;
}

/**
 * Processa uma string de texto substituindo tags por seus valores
 * @param {string} content - Conteúdo a ser processado
 * @param {Object} message - Objeto de mensagem
 * @param {Client} client - Cliente do Discord
 * @param {SimpleDatabase} db - Banco de dados
 * @returns {Promise<string>} - Texto processado
 */
async function processTagString(content, message, client, db) {
  if (!content) return '';
  
  let result = content;
  
  // Regex para encontrar tags no formato $tag[args] ou $tag
  const tagRegex = /\$([a-zA-Z0-9_]+)(?:\[([^\]]*)\])?/g;
  
  // Converter todas as tags em uma lista de operações assíncronas
  const operations = [];
  let match;
  const matches = [];
  
  // Primeiro, encontrar todas as tags
  while ((match = tagRegex.exec(content)) !== null) {
    const fullMatch = match[0];
    const tagName = '$' + match[1];
    const argsText = match[2] || '';
    const args = argsText.split(';').map(arg => arg.trim());
    
    matches.push({
      fullMatch,
      tagName,
      args
    });
    
    // Criar operações para processar cada tag
    operations.push(async () => {
      if (tagFunctions[tagName]) {
        try {
          // Cria dados de embed vazios para passar para as funções de tag
          const embedData = {};
          const value = await Promise.resolve(tagFunctions[tagName](args, message, client, db, embedData));
          return {
            tag: fullMatch,
            value: value !== null && value !== undefined ? String(value) : ''
          };
        } catch (error) {
          console.error(`Erro ao processar a tag ${tagName}:`, error);
          return {
            tag: fullMatch,
            value: `[ERRO NA TAG ${tagName}]`
          };
        }
      } else {
        return {
          tag: fullMatch,
          value: `[TAG DESCONHECIDA: ${tagName}]`
        };
      }
    });
  }
  
  // Executar todas as operações de processamento de tags
  const results = await Promise.all(operations.map(op => op()));
  
  // Substituir as tags pelos valores calculados
  for (const item of results) {
    result = result.replace(item.tag, item.value);
  }
  
  return result;
}

/**
 * Processa um embed definido com tags
 * @param {Object} embedData - Dados do embed com tags
 * @param {Object} message - Objeto de mensagem
 * @param {Client} client - Cliente do Discord
 * @param {SimpleDatabase} db - Banco de dados
 * @returns {Promise<EmbedBuilder>} - Embed processado
 */
async function processEmbed(embedData, message, client, db) {
  const embed = new EmbedBuilder();
  
  if (embedData.title) {
    embed.setTitle(await processTagString(embedData.title, message, client, db));
  }
  
  if (embedData.description) {
    embed.setDescription(await processTagString(embedData.description, message, client, db));
  }
  
  if (embedData.color) {
    try {
      const colorStr = await processTagString(embedData.color, message, client, db);
      embed.setColor(resolveColor(colorStr));
    } catch (e) {
      console.error('Erro ao definir cor do embed:', e);
      embed.setColor(0x5865F2); // Azul Discord padrão
    }
  }
  
  if (embedData.url) {
    const url = await processTagString(embedData.url, message, client, db);
    if (url && url.trim() !== '') {
      embed.setURL(url);
    }
  }
  
  if (embedData.timestamp) {
    const timestamp = await processTagString(embedData.timestamp, message, client, db);
    try {
      embed.setTimestamp(timestamp ? new Date(timestamp) : null);
    } catch (e) {
      console.error('Erro ao definir timestamp:', e);
      embed.setTimestamp(); // Timestamp atual
    }
  }
  
  if (embedData.image) {
    const imageUrl = await processTagString(embedData.image, message, client, db);
    if (imageUrl && imageUrl.trim() !== '') {
      embed.setImage(imageUrl);
    }
  }
  
  if (embedData.thumbnail) {
    const thumbnailUrl = await processTagString(embedData.thumbnail, message, client, db);
    if (thumbnailUrl && thumbnailUrl.trim() !== '') {
      embed.setThumbnail(thumbnailUrl);
    }
  }
  
  if (embedData.author) {
    const authorName = await processTagString(embedData.author.name, message, client, db);
    const authorIcon = embedData.author.iconURL 
      ? await processTagString(embedData.author.iconURL, message, client, db) 
      : null;
    const authorUrl = embedData.author.url 
      ? await processTagString(embedData.author.url, message, client, db) 
      : null;
    
    // Verificar se o nome do autor não está vazio
    if (authorName && authorName.trim() !== '') {
      const authorData = { name: authorName };
      
      // Adicionar iconURL e url apenas se forem válidos
      if (authorIcon && authorIcon.trim() !== '') {
        authorData.iconURL = authorIcon;
      }
      
      if (authorUrl && authorUrl.trim() !== '') {
        authorData.url = authorUrl;
      }
      
      embed.setAuthor(authorData);
    }
  }
  
  if (embedData.footer) {
    const footerText = await processTagString(embedData.footer.text, message, client, db);
    const footerIcon = embedData.footer.iconURL 
      ? await processTagString(embedData.footer.iconURL, message, client, db) 
      : null;
    
    // Verificar se o texto do footer não está vazio
    if (footerText && footerText.trim() !== '') {
      const footerData = { text: footerText };
      
      // Adicionar iconURL apenas se for válido
      if (footerIcon && footerIcon.trim() !== '') {
        footerData.iconURL = footerIcon;
      }
      
      embed.setFooter(footerData);
    }
  }
  
  if (embedData.fields && Array.isArray(embedData.fields)) {
    for (const field of embedData.fields) {
      const name = await processTagString(field.name, message, client, db);
      const value = await processTagString(field.value, message, client, db);
      
      // Verificar se o nome e o valor do campo não estão vazios
      if (name && name.trim() !== '' && value && value.trim() !== '') {
        const inline = field.inline !== undefined ? field.inline : false;
        embed.addFields({ name, value, inline });
      }
    }
  }
  
  return embed;
}

/**
 * Processa um comando definido com código de tags
 * @param {string} code - Código com tags
 * @param {Object} message - Objeto de mensagem ou interação
 * @param {Client} client - Cliente do Discord
 * @param {SimpleDatabase} db - Banco de dados
 * @returns {Promise<Object>} - Objeto de resposta
 */
async function processCode(code, message, client, db) {
  const response = {
    content: null,
    embeds: [],
    components: [],
    ephemeral: false,
    files: []
  };
  
  // Verificar se é um código de várias linhas
  const lines = code.trim().split('\n');
  
  // Processar as tags básicas primeiro
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Processar embed
    if (trimmedLine.startsWith('$title')) {
      const embedData = {};
      
      // Processar múltiplas linhas de embed
      for (let i = lines.indexOf(line); i < lines.length; i++) {
        const embedLine = lines[i].trim();
        
        if (embedLine.startsWith('$title')) {
          embedData.title = embedLine.substring(6).trim();
        } else if (embedLine.startsWith('$description')) {
          embedData.description = embedLine.substring(12).trim();
        } else if (embedLine.startsWith('$color')) {
          embedData.color = embedLine.substring(6).trim();
        } else if (embedLine.startsWith('$image')) {
          embedData.image = embedLine.substring(6).trim();
        } else if (embedLine.startsWith('$thumbnail')) {
          embedData.thumbnail = embedLine.substring(10).trim();
        } else if (embedLine.startsWith('$timestamp')) {
          embedData.timestamp = embedLine.substring(10).trim() || new Date().toISOString();
        } else if (embedLine.startsWith('$url')) {
          embedData.url = embedLine.substring(4).trim();
        } else if (embedLine.startsWith('$author')) {
          const authorData = embedLine.substring(7).trim();
          const parts = authorData.split('|');
          embedData.author = {
            name: parts[0],
            iconURL: parts[1],
            url: parts[2]
          };
        } else if (embedLine.startsWith('$footer')) {
          const footerData = embedLine.substring(7).trim();
          const parts = footerData.split('|');
          embedData.footer = {
            text: parts[0],
            iconURL: parts[1]
          };
        } else if (embedLine.startsWith('$field')) {
          if (!embedData.fields) embedData.fields = [];
          const fieldData = embedLine.substring(6).trim();
          const parts = fieldData.split('|');
          
          embedData.fields.push({
            name: parts[0],
            value: parts[1],
            inline: parts[2] === 'true'
          });
        }
      }
      
      if (Object.keys(embedData).length > 0) {
        const embed = await processEmbed(embedData, message, client, db);
        response.embeds.push(embed);
      }
    } 
    // Processar conteúdo de texto
    else if (trimmedLine.startsWith('$content')) {
      response.content = await processTagString(trimmedLine.substring(8).trim(), message, client, db);
    }
    // Processar opção ephemeral
    else if (trimmedLine.startsWith('$ephemeral')) {
      response.ephemeral = trimmedLine.substring(10).trim() === 'true';
    }
    // Processar arquivos/anexos
    else if (trimmedLine.startsWith('$attachment')) {
      const attachmentData = trimmedLine.substring(11).trim();
      const parts = attachmentData.split('|');
      
      if (parts.length >= 2) {
        const url = await processTagString(parts[0], message, client, db);
        const name = await processTagString(parts[1], message, client, db);
        
        try {
          const attachment = new AttachmentBuilder(url, { name: name });
          response.files.push(attachment);
        } catch (error) {
          console.error('Erro ao criar anexo:', error);
        }
      }
    }
    // Processar botões
    else if (trimmedLine.startsWith('$button')) {
      if (!response.components[0]) {
        response.components.push(new ActionRowBuilder());
      }
      
      const buttonData = trimmedLine.substring(7).trim();
      const parts = buttonData.split('|');
      
      const button = new ButtonBuilder()
        .setCustomId(parts[0])
        .setLabel(await processTagString(parts[1], message, client, db));
      
      if (parts[2]) {
        // Processar estilos
        switch (parts[2].toLowerCase()) {
          case 'primary':
            button.setStyle(ButtonStyle.Primary);
            break;
          case 'secondary':
            button.setStyle(ButtonStyle.Secondary);
            break;
          case 'success':
            button.setStyle(ButtonStyle.Success);
            break;
          case 'danger':
            button.setStyle(ButtonStyle.Danger);
            break;
          case 'link':
            button.setStyle(ButtonStyle.Link);
            if (parts[3]) button.setURL(parts[3]);
            break;
          default:
            button.setStyle(ButtonStyle.Primary);
        }
      } else {
        button.setStyle(ButtonStyle.Primary);
      }
      
      // Adicionar emoji se fornecido
      if (parts[4]) {
        button.setEmoji(parts[4]);
      }
      
      // Definir se o botão está desativado
      if (parts[5] === 'true') {
        button.setDisabled(true);
      }
      
      response.components[0].addComponents(button);
    }
    // Processar menus de seleção
    else if (trimmedLine.startsWith('$dropdown')) {
      if (!response.components[1]) {
        response.components.push(new ActionRowBuilder());
      }
      
      const dropdownData = trimmedLine.substring(9).trim();
      const parts = dropdownData.split('|');
      
      const dropdown = new SelectMenuBuilder()
        .setCustomId(parts[0])
        .setPlaceholder(await processTagString(parts[1], message, client, db));
      
      // Mínimo/máximo de seleções
      if (parts[3]) dropdown.setMinValues(parseInt(parts[3]) || 1);
      if (parts[4]) dropdown.setMaxValues(parseInt(parts[4]) || 1);
      
      // Definir se o menu está desativado
      if (parts[5] === 'true') {
        dropdown.setDisabled(true);
      }
      
      // Processar opções
      if (parts[2]) {
        const options = parts[2].split(';');
        for (const option of options) {
          const optParts = option.split(',');
          dropdown.addOptions({
            label: await processTagString(optParts[0], message, client, db),
            value: optParts[1],
            description: optParts[2] ? await processTagString(optParts[2], message, client, db) : undefined,
            emoji: optParts[3] || undefined,
            default: optParts[4] === 'true'
          });
        }
      }
      
      response.components[1].addComponents(dropdown);
    }
  }
  
  // Se não for um embed ou comando específico, processar como conteúdo simples
  if (!response.content && response.embeds.length === 0) {
    response.content = await processTagString(code, message, client, db);
  }
  
  return response;
}

module.exports = {
  processTagString,
  processEmbed,
  processCode,
  tagFunctions,
  registerTag
}; 