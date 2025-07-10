module.exports = {
  name: "ping",
  params: [
    {
      required: false
    }
  ],
  code: ({ data }) => {
    return data.client.ws.ping;
  }
};