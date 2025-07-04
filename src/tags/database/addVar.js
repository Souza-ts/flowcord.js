function $addVar(args, message, client, db) {
  if (!args || args.length < 2) return 0;
  const amount = parseInt(args[1], 10) || 1;
  return amount;
}

module.exports = { $addVar };
