function $description(args, message, client, embedData) {
  if (!args || args.length < 1) return null;

  const description = args.join(' ');
  if (embedData && typeof embedData === 'object') {
    embedData.description = description;
  }

  return description;
}

module.exports = { $description };
