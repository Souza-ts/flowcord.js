/**
 * Coloriza textos para o console com suporte a cores ANSI, estilos e fundos.
 * ---------------
 * @param {string} texto - Texto a ser estilizado.
 * @param {object} opcoes - Opções de formatação.
 * @param {string} [opcoes.cor] - Cor do texto (black, red, green, yellow, blue, magenta, cyan, white, gray).
 * @param {string} [opcoes.fundo] - Cor do fundo (black, red, green, yellow, blue, magenta, cyan, white).
 * @param {boolean} [opcoes.negrito] - Texto em negrito.
 * @param {boolean} [opcoes.sublinhado] - Texto sublinhado.
 * @param {boolean} [opcoes.inverso] - Inverte cor do texto e fundo.
 * @returns {string} - Texto formatado com códigos ANSI.
* ---------------
 * @example
 * // Texto vermelho em negrito
 * console.log(color("ERRO CRÍTICO", { cor: "red", negrito: true }));
 * 
 * // Fundo amarelo com texto preto sublinhado
 * console.log(color("ALERTA", { cor: "black", fundo: "yellow", sublinhado: true }));
 */
function color(texto, opcoes = {}) {
    const cores = {
        // Cores básicas
        black: '\x1b[30m',
        red: '\x1b[31m',
        green: '\x1b[32m',
        yellow: '\x1b[33m',
        blue: '\x1b[34m',
        magenta: '\x1b[35m',
        cyan: '\x1b[36m',
        white: '\x1b[37m',
        gray: '\x1b[90m',

        // Cores de fundo
        bgBlack: '\x1b[40m',
        bgRed: '\x1b[41m',
        bgGreen: '\x1b[42m',
        bgYellow: '\x1b[43m',
        bgBlue: '\x1b[44m',
        bgMagenta: '\x1b[45m',
        bgCyan: '\x1b[46m',
        bgWhite: '\x1b[47m',

        // Estilos
        reset: '\x1b[0m',
        negrito: '\x1b[1m',
        sublinhado: '\x1b[4m',
        inverso: '\x1b[7m'
    };

    let resultado = '';

    // Aplica estilos
    if (opcoes.negrito) resultado += cores.negrito;
    if (opcoes.sublinhado) resultado += cores.sublinhado;
    if (opcoes.inverso) resultado += cores.inverso;

    // Aplica cor do texto
    if (opcoes.cor && cores[opcoes.cor]) resultado += cores[opcoes.cor];
    
    // Aplica cor de fundo
    if (opcoes.fundo && cores[`bg${opcoes.fundo.charAt(0).toUpperCase() + opcoes.fundo.slice(1)}`]) {
        resultado += cores[`bg${opcoes.fundo.charAt(0).toUpperCase() + opcoes.fundo.slice(1)}`];
    }

    resultado += texto + cores.reset;
    return resultado;
}

/**
 * Função para tratar e exibir erros.
 * @param {string} type - Tipo do erro (ex: "SyntaxError", "TypeError").
 * @param {string} message - Mensagem de erro descritiva.
 * @returns {string} - Mensagem formatada para enviar ao chat (opcional).
 */
function error(type, message) {
    const consoleError = color(`[ERRO] ${type}: ${message}`, { cor: "red" });
    
    console.error(consoleError);
    
    return `\`\`\`js\n❌ ${type}: ${message}\n\`\`\``; 
}

module.exports = { color, error };