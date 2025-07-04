function $random(args) {
  if (!args || args.length < 2) return Math.floor(Math.random() * 100) + 1;
  const min = parseInt(args[0], 10) || 1;
  const max = parseInt(args[1], 10) || 100;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = { $random };
