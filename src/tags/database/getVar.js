function $getVar(args, message, client, db) {
  if (!args || args.length < 1) return "0";
  const defaultValue = args[1] || "0";
  return defaultValue;
}

module.exports = { $getVar };
