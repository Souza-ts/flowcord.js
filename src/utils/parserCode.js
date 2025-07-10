const fs = require("fs");
const path = require("path");

const functions = {};
const functionsPath = path.join(__dirname, "../functions");

const files = fs.readdirSync(functionsPath);
for (const file of files) {
  if (file.endsWith(".js") && file !== "index.js") {
    const func = require(path.join(functionsPath, file));
    functions[func.name] = func;
  }
}

module.exports = async function parseCode(code, { data, functionSyntax = "%" }) { // Valor padrão como fallback
  let isReply = false;

  // Verifica reply com a sintaxe correta
  const replyPattern = `${escapeRegExp(functionSyntax)}reply`;
  if (new RegExp(replyPattern).test(code)) {
    isReply = true;
    code = code.replace(new RegExp(replyPattern, "g"), "").trim();
  }

  for (const [name, func] of Object.entries(functions)) {
    // Cria regex com a sintaxe correta
    const pattern = `${escapeRegExp(functionSyntax)}${escapeRegExp(name)}(?:\\[([^\\]]*)\\])?`;
    const regex = new RegExp(pattern, "g");
    
    code = code.replace(regex, (match, paramStr, offset, fullStr) => {
      const funcParams = func.params || [];
      const required = funcParams.filter(p => p.required !== false);

      const hasBrackets = match.includes("[");
      const hasParamContent = paramStr && paramStr.trim() !== "";

      let params = [];

      if (hasParamContent) {
        params = paramStr.split(";")
          .map(p => p.trim())
          .filter(p => p !== "")
          .map(p => isNaN(p) ? p : Number(p));
      }

      if (required.length > 0 && !hasBrackets) {
        console.error(`Função ${functionSyntax}${name} espera pelo menos ${required.length} parâmetro(s), mas nenhum foi fornecido`);
        return match;
      }

      if (params.length < required.length) {
        console.error(`Função ${functionSyntax}${name} espera pelo menos ${required.length} parâmetro(s), mas recebeu ${params.length}`);
        return match;
      }

      try {
        return func.code({ data }, ...params);
      } catch (e) {
        console.error(`Erro ao executar a função ${functionSyntax}${name}:`, e); // Corrigido aqui
        return "";
      }
    });
  }

  return { content: code, reply: isReply };
};

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escapa corretamente o $
}