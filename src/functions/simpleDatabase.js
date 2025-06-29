const fs = require('fs');
const path = require('path');

class SimpleDatabase {
  /**
   * Cria uma nova instância do banco de dados simples
   * @param {Object} options - Opções do banco de dados
   * @param {string} options.filePath - Caminho para o arquivo de banco de dados
   */
  constructor(options = {}) {
    this.filePath = options.filePath || './database.json';
    this.data = {};
    
    // Criar diretório se não existir
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Carregar dados existentes ou criar arquivo
    this.load();
  }

  /**
   * Carrega dados do arquivo
   * @private
   */
  load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const fileContent = fs.readFileSync(this.filePath, 'utf-8');
        this.data = JSON.parse(fileContent);
      } else {
        // Criar arquivo se não existir
        this.save();
      }
    } catch (error) {
      console.error('Erro ao carregar banco de dados:', error);
      this.data = {};
      this.save();
    }
  }

  /**
   * Salva dados no arquivo
   * @private
   */
  save() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (error) {
      console.error('Erro ao salvar banco de dados:', error);
    }
  }

  /**
   * Define um valor no banco de dados
   * @param {string} key - Chave do valor
   * @param {any} value - Valor a ser armazenado
   * @returns {this}
   */
  set(key, value) {
    if (!key) {
      throw new Error('A chave é obrigatória');
    }

    // Suporta caminhos aninhados como "user.profile.name"
    if (key.includes('.')) {
      const parts = key.split('.');
      let current = this.data;
      
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!current[part]) {
          current[part] = {};
        }
        current = current[part];
      }
      
      current[parts[parts.length - 1]] = value;
    } else {
      this.data[key] = value;
    }
    
    this.save();
    return this;
  }

  /**
   * Obtém um valor do banco de dados
   * @param {string} key - Chave do valor
   * @param {any} defaultValue - Valor padrão caso a chave não exista
   * @returns {any}
   */
  get(key, defaultValue = null) {
    if (!key) {
      return defaultValue;
    }

    // Suporta caminhos aninhados
    if (key.includes('.')) {
      const parts = key.split('.');
      let current = this.data;
      
      for (const part of parts) {
        if (!current || typeof current !== 'object' || !(part in current)) {
          return defaultValue;
        }
        current = current[part];
      }
      
      return current;
    }
    
    return key in this.data ? this.data[key] : defaultValue;
  }

  /**
   * Remove um valor do banco de dados
   * @param {string} key - Chave do valor
   * @returns {boolean} - Se a chave foi removida com sucesso
   */
  delete(key) {
    if (!key) {
      return false;
    }

    let deleted = false;

    // Suporta caminhos aninhados
    if (key.includes('.')) {
      const parts = key.split('.');
      let current = this.data;
      
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!current || typeof current !== 'object' || !(part in current)) {
          return false;
        }
        current = current[part];
      }
      
      const lastPart = parts[parts.length - 1];
      if (lastPart in current) {
        deleted = delete current[lastPart];
      }
    } else if (key in this.data) {
      deleted = delete this.data[key];
    }
    
    if (deleted) {
      this.save();
    }
    
    return deleted;
  }

  /**
   * Verifica se uma chave existe no banco de dados
   * @param {string} key - Chave a verificar
   * @returns {boolean}
   */
  has(key) {
    return this.get(key) !== null;
  }

  /**
   * Limpa todo o banco de dados
   * @returns {this}
   */
  clear() {
    this.data = {};
    this.save();
    return this;
  }

  /**
   * Obtém todas as chaves do banco de dados
   * @returns {string[]}
   */
  keys() {
    return Object.keys(this.data);
  }

  /**
   * Obtém todos os valores do banco de dados
   * @returns {any[]}
   */
  values() {
    return Object.values(this.data);
  }

  /**
   * Obtém todos os pares chave-valor do banco de dados
   * @returns {Array<{key: string, value: any}>}
   */
  entries() {
    return Object.entries(this.data).map(([key, value]) => ({ key, value }));
  }

  /**
   * Obtém o tamanho do banco de dados (número de chaves no nível raiz)
   * @returns {number}
   */
  size() {
    return Object.keys(this.data).length;
  }

  /**
   * Incrementa um valor numérico
   * @param {string} key - Chave do valor
   * @param {number} amount - Quantidade a incrementar (padrão: 1)
   * @returns {number} - Novo valor
   */
  add(key, amount = 1) {
    const currentValue = this.get(key, 0);
    const newValue = parseInt(currentValue, 10) + amount;
    this.set(key, newValue);
    return newValue;
  }

  /**
   * Decrementa um valor numérico
   * @param {string} key - Chave do valor
   * @param {number} amount - Quantidade a decrementar (padrão: 1)
   * @returns {number} - Novo valor
   */
  subtract(key, amount = 1) {
    return this.add(key, -amount);
  }

  /**
   * Adiciona um valor a um array
   * @param {string} key - Chave do array
   * @param {any} value - Valor a adicionar
   * @returns {Array} - Array atualizado
   */
  push(key, value) {
    const array = this.get(key, []);
    if (!Array.isArray(array)) {
      throw new Error(`O valor em ${key} não é um array`);
    }
    
    array.push(value);
    this.set(key, array);
    return array;
  }

  /**
   * Remove um valor de um array
   * @param {string} key - Chave do array
   * @param {any} value - Valor a remover
   * @returns {Array} - Array atualizado
   */
  pull(key, value) {
    const array = this.get(key, []);
    if (!Array.isArray(array)) {
      throw new Error(`O valor em ${key} não é um array`);
    }
    
    const newArray = array.filter(item => item !== value);
    this.set(key, newArray);
    return newArray;
  }
}

module.exports = { SimpleDatabase }; 