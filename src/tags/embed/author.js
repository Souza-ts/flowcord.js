function $author(args, message, client, embedData) {
  if (!args || args.length < 1) return null;

  const author = { name: args[0] };
  if (args[1]) author.iconURL = args[1];
  if (args[2]) author.url = args[2];

  if (embedData && typeof embedData === 'object') {
    embedData.author = author;
  }

  return author;
}

module.exports = { $author };
