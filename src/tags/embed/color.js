const { resolveColor } = require('discord.js');

function $color(args, message, client, embedData) {
  if (!args || args.length < 1) return null;

  const colorInput = args[0];
  let color;

  try {
    color = resolveColor(colorInput);
  } catch {
    color = 0x5865F2;
  }

  if (embedData && typeof embedData === 'object') {
    embedData.color = color;
  }

  return color;
}

module.exports = { $color };
