module.exports = {
  name: "message",
  params: [
    {
      required: false
    }
  ],
  code: ({ data }) => {
    const args = data.message.content.trim().split(/\s+/).slice(1);
    return args.join(" ");
  }
};