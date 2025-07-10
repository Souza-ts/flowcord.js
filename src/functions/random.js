module.exports = {
  name: "random",
  params: [
    { name: "min", required: true, type: "number" },
    { name: "max", required: true, type: "number" }
  ],
  code: ({ data }, min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
};