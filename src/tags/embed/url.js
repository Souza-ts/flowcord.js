module.exports = {
  $url: {
    name: "$url",
    code: async (d) => {
      const data = d.util.aoiFunc(d);
      if (data.err) return d.error(data.err);

      d.embed.setURL(data.inside);

      return {
        code: d.util.setCode(data),
      };
    }
  }
};
