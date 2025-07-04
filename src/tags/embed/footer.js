function $footer(args, message, client, embedData) {
  if (!args || args.length < 1) return null;

  const footerText = args[0];
  const footerIconURL = args.length > 1 ? args[1] : null;
  const footer = {
    text: footerText,
    iconURL: footerIconURL
  };

  if (embedData && typeof embedData === 'object') {
    embedData.footer = footer;
  }

  return footer;
}

module.exports = { $footer };
