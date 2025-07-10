const { color, error } = require('../utils/error.js');

module.exports = {
  name: "args",
  params: [
    {
      name: "index",
      required: false,
      type: "number"
    }
  ],
  code: ({ data }, index) => {
    const args = data.message.content.trim().split(/\s+/).slice(1);
    
    if (isNaN(index) || (typeof index === "number" && index < 1)) {
      
      return error("TypeError", "Argumento inválido fornecido no parâmetro 'index'.");
    }

    if (typeof index === "number" && index >= 1) {
      return args[index - 1] || ""; 
    } else {
      return args.join(" ");
    }
  }
};