module.exports = {
  $thumbnail: {
    name: "$thumbnail",
    code: async (d) => {
      const data = d.util.aoiFunc(d);
      if (data.err) return d.error(data.err);

      d.embed.setThumbnail(data.inside);

      return {
        code: d.util.setCode(data),
      };
    }
  }
};
