function $date(args) {
  const date = new Date();

  if (!args?.length) {
    return date.toLocaleDateString();
  }

  try {
    const format = args[0];
    return date.toLocaleDateString(undefined, JSON.parse(format));
  } catch {
    return date.toLocaleDateString();
  }
}

module.exports = { $date };
