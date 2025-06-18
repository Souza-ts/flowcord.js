/**
 * Returns the current date formatted according to locale
 * @param {Array} args - Tag arguments [format]
 * @returns {String} - Formatted date
 */
function $date(args) {
  const date = new Date();
  if (!args || args.length === 0) {
    return date.toLocaleDateString();
  }
  
  try {
    const format = args[0];
    return date.toLocaleDateString(undefined, JSON.parse(format));
  } catch (error) {
    console.error('Error formatting date:', error);
    return date.toLocaleDateString();
  }
}

module.exports = {
  $date
}; 