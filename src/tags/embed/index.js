const title = require('./title');
const description = require('./description');
const footer = require('./footer');
const image = require('./image');
const thumbnail = require('./thumbnail');
const field = require('./field');
const color = require('./color');
const author = require('./author');
const timestamp = require('./timestamp');
const url = require('./url');

module.exports = {
  ...title,
  ...description,
  ...footer,
  ...image,
  ...thumbnail,
  ...field,
  ...color,
  ...author,
  ...timestamp,
  ...url
}; 