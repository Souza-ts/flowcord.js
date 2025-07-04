const { EmbedBuilder, AttachmentBuilder } = require('discord.js');

function $image(args, message, client, embedData) {
  if (!args || args.length < 1) return null;

  const imageURL = args[0];

  try {
    new URL(imageURL);
  } catch {
    return null;
  }

  if (embedData && typeof embedData === 'object') {
    embedData.image = { url: imageURL };
  }

  return imageURL;
}

module.exports = { $image };
