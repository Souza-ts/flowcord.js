const getVar = require('./getVar');
const setVar = require('./setVar');
const addVar = require('./addVar');

module.exports = {
  ...getVar,
  ...setVar,
  ...addVar
};
