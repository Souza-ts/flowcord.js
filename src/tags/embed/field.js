function $field(args, message, client, embedData) {
  if (!args || args.length < 2) return null;

  const name = args[0];
  const value = args[1];
  const inline = args.length > 2 ? args[2] === 'true' : false;
  const field = { name, value, inline };

  if (embedData && typeof embedData === 'object') {
    if (!embedData.fields) embedData.fields = [];
    embedData.fields.push(field);
  }

  return field;
}

module.exports = { $field };
