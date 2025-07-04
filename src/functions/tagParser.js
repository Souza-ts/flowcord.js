const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  SelectMenuBuilder,
  ButtonStyle,
  AttachmentBuilder,
  resolveColor
} = require('discord.js');
const fs = require('fs');
const path = require('path');

function loadTagsFromFiles() {
  const tagFunctions = {};
  const tagsDir = path.join(__dirname, '../tags');
  if (!fs.existsSync(tagsDir)) return {};
  const categories = fs.readdirSync(tagsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  for (const category of categories) {
    const categoryDir = path.join(tagsDir, category);
    const tagFiles = fs.readdirSync(categoryDir)
      .filter(file => file.endsWith('.js') && file !== 'index.js');
    for (const file of tagFiles) {
      try {
        Object.assign(tagFunctions, require(path.join(categoryDir, file)));
      } catch {}
    }
  }
  return tagFunctions;
}

const tagFunctions = loadTagsFromFiles();

function registerTag(name, func) {
  if (!name.startsWith('$')) name = '$' + name;
  tagFunctions[name] = func;
}

async function processTagString(content, message, client, db) {
  if (!content) return '';
  let result = content;
  const tagRegex = /\$([a-zA-Z0-9_]+)(?:\[([^\]]*)\])?/g;
  const operations = [];
  let match;
  while ((match = tagRegex.exec(content)) !== null) {
    const fullMatch = match[0];
    const tagName = '$' + match[1];
    const args = (match[2] || '').split(';').map(a => a.trim());
    operations.push((async () => {
      if (tagFunctions[tagName]) {
        try {
          const embedData = {};
          const value = await Promise.resolve(tagFunctions[tagName](args, message, client, db, embedData));
          return { tag: fullMatch, value: value ?? '' };
        } catch {
          return { tag: fullMatch, value: `[ERROR TAG ${tagName}]` };
        }
      } else {
        return { tag: fullMatch, value: `[UNKNOWN TAG: ${tagName}]` };
      }
    })());
  }
  const results = await Promise.all(operations);
  for (const { tag, value } of results) {
    result = result.replace(tag, value);
  }
  return result;
}

async function processEmbed(embedData, message, client, db) {
  const embed = new EmbedBuilder();
  if (embedData.title) embed.setTitle(await processTagString(embedData.title, message, client, db));
  if (embedData.description) embed.setDescription(await processTagString(embedData.description, message, client, db));
  if (embedData.color) {
    try {
      embed.setColor(resolveColor(await processTagString(embedData.color, message, client, db)));
    } catch {
      embed.setColor(0x5865F2);
    }
  }
  if (embedData.url) {
    const url = await processTagString(embedData.url, message, client, db);
    if (url.trim()) embed.setURL(url);
  }
  if (embedData.timestamp) {
    const timestamp = await processTagString(embedData.timestamp, message, client, db);
    try {
      embed.setTimestamp(timestamp ? new Date(timestamp) : null);
    } catch {
      embed.setTimestamp();
    }
  }
  if (embedData.image) {
    const img = await processTagString(embedData.image, message, client, db);
    if (img.trim()) embed.setImage(img);
  }
  if (embedData.thumbnail) {
    const thumb = await processTagString(embedData.thumbnail, message, client, db);
    if (thumb.trim()) embed.setThumbnail(thumb);
  }
  if (embedData.author) {
    const name = await processTagString(embedData.author.name, message, client, db);
    if (name.trim()) {
      const author = { name };
      const icon = embedData.author.iconURL ? await processTagString(embedData.author.iconURL, message, client, db) : null;
      const url = embedData.author.url ? await processTagString(embedData.author.url, message, client, db) : null;
      if (icon && icon.trim()) author.iconURL = icon;
      if (url && url.trim()) author.url = url;
      embed.setAuthor(author);
    }
  }
  if (embedData.footer) {
    const text = await processTagString(embedData.footer.text, message, client, db);
    if (text.trim()) {
      const footer = { text };
      const icon = embedData.footer.iconURL ? await processTagString(embedData.footer.iconURL, message, client, db) : null;
      if (icon && icon.trim()) footer.iconURL = icon;
      embed.setFooter(footer);
    }
  }
  if (Array.isArray(embedData.fields)) {
    for (const field of embedData.fields) {
      const name = await processTagString(field.name, message, client, db);
      const value = await processTagString(field.value, message, client, db);
      if (name.trim() && value.trim()) embed.addFields({ name, value, inline: field.inline ?? false });
    }
  }
  return embed;
}

async function processCode(code, message, client, db) {
  const response = { content: null, embeds: [], components: [], ephemeral: false, files: [] };
  const lines = code.trim().split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('$title')) {
      const embedData = {};
      while (i < lines.length && lines[i].trim().startsWith('$')) {
        const embedLine = lines[i].trim();
        if (embedLine.startsWith('$title')) embedData.title = embedLine.substring(6).trim();
        else if (embedLine.startsWith('$description')) embedData.description = embedLine.substring(12).trim();
        else if (embedLine.startsWith('$color')) embedData.color = embedLine.substring(6).trim();
        else if (embedLine.startsWith('$image')) embedData.image = embedLine.substring(6).trim();
        else if (embedLine.startsWith('$thumbnail')) embedData.thumbnail = embedLine.substring(10).trim();
        else if (embedLine.startsWith('$timestamp')) embedData.timestamp = embedLine.substring(10).trim() || new Date().toISOString();
        else if (embedLine.startsWith('$url')) embedData.url = embedLine.substring(4).trim();
        else if (embedLine.startsWith('$author')) {
          const parts = embedLine.substring(7).trim().split('|');
          embedData.author = { name: parts[0], iconURL: parts[1], url: parts[2] };
        } else if (embedLine.startsWith('$footer')) {
          const parts = embedLine.substring(7).trim().split('|');
          embedData.footer = { text: parts[0], iconURL: parts[1] };
        } else if (embedLine.startsWith('$field')) {
          if (!embedData.fields) embedData.fields = [];
          const parts = embedLine.substring(6).trim().split('|');
          embedData.fields.push({ name: parts[0], value: parts[1], inline: parts[2] === 'true' });
        }
        i++;
      }
      i--;
      if (Object.keys(embedData).length > 0) response.embeds.push(await processEmbed(embedData, message, client, db));
    }
    else if (line.startsWith('$content')) {
      response.content = await processTagString(line.substring(8).trim(), message, client, db);
    }
    else if (line.startsWith('$ephemeral')) {
      response.ephemeral = line.substring(10).trim() === 'true';
    }
    else if (line.startsWith('$attachment')) {
      const parts = line.substring(11).trim().split('|');
      if (parts.length >= 2) {
        try {
          const url = await processTagString(parts[0], message, client, db);
          const name = await processTagString(parts[1], message, client, db);
          response.files.push(new AttachmentBuilder(url, { name }));
        } catch {}
      }
    }
    else if (line.startsWith('$button')) {
      if (!response.components[0]) response.components[0] = new ActionRowBuilder();
      const parts = line.substring(7).trim().split('|');
      const button = new ButtonBuilder()
        .setCustomId(parts[0])
        .setLabel(await processTagString(parts[1], message, client, db));
      switch ((parts[2] || '').toLowerCase()) {
        case 'primary': button.setStyle(ButtonStyle.Primary); break;
        case 'secondary': button.setStyle(ButtonStyle.Secondary); break;
        case 'success': button.setStyle(ButtonStyle.Success); break;
        case 'danger': button.setStyle(ButtonStyle.Danger); break;
        case 'link':
          button.setStyle(ButtonStyle.Link);
          if (parts[3]) button.setURL(parts[3]);
          break;
        default: button.setStyle(ButtonStyle.Primary);
      }
      if (parts[4]) button.setEmoji(parts[4]);
      if (parts[5] === 'true') button.setDisabled(true);
      response.components[0].addComponents(button);
    }
    else if (line.startsWith('$dropdown')) {
      if (!response.components[1]) response.components[1] = new ActionRowBuilder();
      const parts = line.substring(9).trim().split('|');
      const dropdown = new SelectMenuBuilder()
        .setCustomId(parts[0])
        .setPlaceholder(await processTagString(parts[1], message, client, db));
      if (parts[3]) dropdown.setMinValues(parseInt(parts[3]) || 1);
      if (parts[4]) dropdown.setMaxValues(parseInt(parts[4]) || 1);
      if (parts[5] === 'true') dropdown.setDisabled(true);
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
