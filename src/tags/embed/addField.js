module.exports = {
  $addField: {
    name: "$addField",
    code: async (d) => {
      const data = d.util.aoiFunc(d);
      if (data.err) return d.error(data.err);

      const [name, value, inline = "false"] = data.inside.splits;

      d.embed.addField(name, value, inline === "true");

      return {
        code: d.util.setCode(data),
      };
    }
  }
};
