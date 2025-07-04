function $color(args) {
  if (!args || args.length === 0) return null;
  return args[0];
}

module.exports = { $color };
