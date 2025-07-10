const colors = require('colors');

/**
 * Cria uma caixa estilizada no terminal com cabeçalho e conteúdo
 * ---------------
 * @param {string} headerText - Texto do cabeçalho da caixa
 * @param {string[]} linesToPrint - Array de strings com as linhas de conteúdo
 * ---------------
 * @param {Object} borders - Configuração dos caracteres das bordas (opcional)
 * @param {string} [borders.topLeft] - Caractere do canto superior esquerdo
 * @param {string} [borders.topRight] - Caractere do canto superior direito
 * @param {string} [borders.bottomLeft] - Caractere do canto inferior esquerdo
 * @param {string} [borders.bottomRight] - Caractere do canto inferior direito
 * @param {string} [borders.horizontal] - Caractere da borda horizontal
 * @param {string} [borders.vertical] - Caractere da borda vertical
 * ---------------
 * @param {Object} colorConfig - Configuração de cores (opcional)
 * @param {string} [colorConfig.header='cyan'] - Cor do cabeçalho (deve ser um método válido do pacote 'colors')
 * @param {string|null} [colorConfig.lines=null] - Cor para todas as linhas (null mantém cores individuais)
 * @param {string|null} [colorConfig.borders=null] - Cor para todas as bordas (null mantém a cor padrão)
 * ---------------
 * @example
 * // Exemplo básico
 * printBox('Título', ['Linha 1', 'Linha 2']);
 * ---------------
 * @example
 * // Exemplo customizado
 * printBox(
 *   'Título Especial',
 *   [colors.yellow('Linha amarela'), 'Texto normal'],
 *   {
 *     topLeft: '╔',
 *     horizontal: '═'
 *   },
 *   {
 *     header: 'rainbow',
 *     borders: 'green'
 *   }
 * );
 */
module.exports = function logTable(
  headerText,
  linesToPrint,
  colorConfig = {
    header: 'cyan',
    lines: null,
    borders: null
  },
  borders = {
    topLeft: '╭',
    topRight: '╮',
    bottomLeft: '╰',
    bottomRight: '╯',
    horizontal: '─',
    vertical: '│'
  }) {
  const removeColors = (text) => text.replace(/\x1b\[[0-9;]*m/g, '');
  
  const maxElementLength = Math.min(
    Math.max(...linesToPrint.map(e => removeColors(e).length), removeColors(headerText).length),
    (process.stdout?.columns || 80) - 4
  );

  const horizontalBorder = borders.horizontal.repeat(maxElementLength + 2);
  
  const paddedTitle = headerText
    .padStart((maxElementLength - removeColors(headerText).length) / 2 + removeColors(headerText).length)
    .padEnd(maxElementLength);

  const coloredHeader = colorConfig.header ? colors[colorConfig.header](paddedTitle) : paddedTitle;

  // Aplica cor às bordas se configurado
  const applyBorderColor = (text) => 
    colorConfig.borders ? colors[colorConfig.borders](text) : text;

  console.log(applyBorderColor(`${borders.topLeft}${horizontalBorder}${borders.topRight}`));
  
  console.log(applyBorderColor(`${borders.vertical}`) + ` ${coloredHeader} ` + applyBorderColor(`${borders.vertical}`));

  linesToPrint.forEach((element) => {
    const strippedElement = removeColors(element);
    const paddedElement = element + ' '.repeat(maxElementLength - strippedElement.length);
    const coloredElement = colorConfig.lines ? colors[colorConfig.lines](paddedElement) : paddedElement;
    
    console.log(applyBorderColor(`${borders.vertical}`) + ` ${coloredElement} ` + applyBorderColor(`${borders.vertical}`));
  });

  console.log(applyBorderColor(`${borders.bottomLeft}${horizontalBorder}${borders.bottomRight}`));
};