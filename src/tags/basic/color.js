/**
 * Retorna um valor de cor válido para embeds
 * @param {Array} args - Argumentos da tag [colorCode]
 * @returns {String} - O valor da cor em formato hexadecimal ou nome
 */
function $color(args) {
    // Validação inicial
    if (!args || args.length === 0) {
        return null;
    }

    const colorInput = args[0];
    
    // Validação de cores hexadecimais
    if (colorInput.match(/^#[0-9A-Fa-f]{6}$/)) {
        return colorInput;
    }

    // Validação de cores em decimal
    if (!isNaN(colorInput) && colorInput >= 0 && colorInput <= 16777215) {
        return colorInput;
    }

    // Validação de nomes de cores
    const validColorNames = [
        'DEFAULT', 'WHITE', 'AQUA', 'GREEN', 'BLUE',
        'YELLOW', 'PURPLE', 'LUMINOUS_VIVID_PINK',
        'GOLD', 'ORANGE', 'RED', 'GREY',
        'DARKER_GREY', 'NAVY', 'DARK_AQUA',
        'DARK_GREEN', 'DARK_BLUE', 'DARK_PURPLE',
        'DARK_GOLD', 'DARK_ORANGE', 'DARK_RED',
        'DARK_GREY', 'LIGHT_GREY', 'DARK_NAVY',
        'RANDOM'
    ];

    // Converte nomes de cores para maiúsculas e verifica
    if (validColorNames.includes(colorInput.toUpperCase())) {
        return colorInput.toUpperCase();
    }

    // Se não for uma cor válida, retorna null
    return null;
}

module.exports = {
    $color
};