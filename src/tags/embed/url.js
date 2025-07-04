function $url(args, message, client, embedData) {
  if (!args || args.length < 1) return null;

  const url = args[0];

  try {
    new URL(url);
  } catch {
    return null;
  }

  if (embedData && typeof embedData === 'object') {
    embedData.url = url;
  }

  return url;
}

module.exports = { $url };
