function $title(args, message, client, embedData) {
  if (!args || args.length < 1) return null;

  const title = args.join(' ');
  if (embedData && typeof embedData === 'object') {
    embedData.title = title;
  }

  return title;
}

module.exports = {
  $title
};
