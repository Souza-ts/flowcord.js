/**
 * Incrementa um valor numérico no banco de dados - VERSÃO MOCK (BANCO DE DADOS DESATIVADO)
 * @param {Array} args - Argumentos da tag [key, amount]
 * @param {Object} message - Objeto da mensagem
 * @param {Object} client - Cliente do Discord
 * @param {Object} db - Objeto do banco de dados
 * @returns {Number} - O valor que seria incrementado
 */
function $addVar(args, message, client, db) {
    // Validação inicial dos argumentos
    if (!args || args.length < 2) {
        console.log('Uso incorreto: $addVar(key, amount) - Usando valor padrão de 1');
        return 1;
    }

    // Obtém e valida a chave
    const key = args[0];
    if (typeof key !== 'string' || key.trim() === '') {
        console.log('Chave inválida fornecida - Usando valor padrão de 1');
        return 1;
    }

    // Obtém e valida o valor
    const amount = parseInt(args[1], 10);
    if (isNaN(amount) || amount < 0) {
        console.log('Valor inválido fornecido - Usando valor padrão de 1');
        return 1;
    }

    // Como o banco de dados está desativado, apenas retorna o valor
    console.log(`Sistema de banco de dados desativado - Tentativa de incrementar ${key} por ${amount}`);
    return amount;
}

module.exports = {
    $addVar
};