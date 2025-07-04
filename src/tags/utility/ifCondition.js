function $if(args) {
  if (!args || args.length < 3) return null;

  const condition = args[0];
  const trueValue = args[1];
  const falseValue = args[2];

  try {
    return eval(condition) ? trueValue : falseValue;
  } catch {
    return falseValue;
  }
}

module.exports = { $if };
