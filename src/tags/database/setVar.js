/**
 * Sets a value in the database - DUMMY VERSION (DATABASE DISABLED)
 * @param {Array} args - Tag arguments [key, value]
 * @param {Object} message - Message object
 * @param {Object} client - Discord client
 * @param {Object} db - Database object
 * @returns {Boolean} - Always returns true
 */
function $setVar(args, message, client, db) {
  if (!args || args.length < 2) return false;
  
  // Não faz nada, apenas retorna true como se tivesse funcionado
  return true;
}

module.exports = {
  $setVar
}; 