function $ping(args, message, client) {
  return Math.round(client.ws.ping);
}

module.exports = { $ping };
