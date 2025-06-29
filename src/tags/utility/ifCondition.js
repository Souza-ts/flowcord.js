/**
 * Evaluates a condition and returns one of two values
 * @param {Array} args - Tag arguments [condition, trueValue, falseValue]
 * @returns {Any} - True or false value based on condition
 */
function $if(args) {
  if (!args || args.length < 3) return null;
  const condition = args[0];
  const trueValue = args[1];
  const falseValue = args[2];
  
  try {
    if (eval(condition)) {
      return trueValue;
    } else {
      return falseValue;
    }
  } catch (error) {
    console.error(`Error evaluating condition: ${condition}`, error);
    return falseValue;
  }
}

module.exports = {
  $if
}; 