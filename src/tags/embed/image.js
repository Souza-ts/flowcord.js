module.exports = {
  $image: {
    name: "$image",
    code: async (d) => {
      const data = d.util.aoiFunc(d);
      if (data.err) return d.error(data.err);

      d.embed.setImage(data.inside);

      return {
        code: d.util.setCode(data),
      };
    }
  }
};
