/**
 * Gets a value from the database - DUMMY VERSION (DATABASE DISABLED)
 * @param {Array} args - Tag arguments [key, defaultValue]
 * @param {Object} message - Message object
 * @param {Object} client - Discord client
 * @param {Object} db - Database object
 * @returns {Any} - Default value
 */
function $getVar(args, message, client, db) {
  if (!args || args.length < 1) return "0";
  const defaultValue = args[1] || "0";
  
  // Retorna valor padrão, banco de dados desativado
  return defaultValue;
}

module.exports = {
  $getVar
}; 