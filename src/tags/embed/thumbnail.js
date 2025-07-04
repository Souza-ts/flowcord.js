function $thumbnail(args, message, client, embedData) {
  if (!args || args.length < 1) return null;

  const thumbnailURL = args[0];

  try {
    new URL(thumbnailURL);
  } catch {
    return null;
  }

  if (embedData && typeof embedData === 'object') {
    embedData.thumbnail = { url: thumbnailURL };
  }

  return thumbnailURL;
}

module.exports = { $thumbnail };
