const fs = require('fs');
const path = require('path');

class SimpleDatabase {
  constructor(options = {}) {
    this.filePath = options.filePath || './database.json';
    this.data = {};

    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    this.load();
  }

  load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const content = fs.readFileSync(this.filePath, 'utf-8');
        this.data = JSON.parse(content);
      } else {
        this.save();
      }
    } catch {
      this.data = {};
      this.save();
    }
  }

  save() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch {}
  }

  set(key, value) {
    if (!key) throw new Error('Key is required');

    if (key.includes('.')) {
      const parts = key.split('.');
      let cur = this.data;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!cur[parts[i]]) cur[parts[i]] = {};
        cur = cur[parts[i]];
      }
      cur[parts[parts.length - 1]] = value;
    } else {
      this.data[key] = value;
    }

    this.save();
    return this;
  }

  get(key, defaultValue = null) {
    if (!key) return defaultValue;

    if (key.includes('.')) {
      const parts = key.split('.');
      let cur = this.data;
      for (const part of parts) {
        if (!cur || typeof cur !== 'object' || !(part in cur)) return defaultValue;
        cur = cur[part];
      }
      return cur;
    }

    return key in this.data ? this.data[key] : defaultValue;
  }

  delete(key) {
    if (!key) return false;

    let deleted = false;
    if (key.includes('.')) {
      const parts = key.split('.');
      let cur = this.data;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!cur || typeof cur !== 'object' || !(parts[i] in cur)) return false;
        cur = cur[parts[i]];
      }
      const last = parts[parts.length - 1];
      if (last in cur) deleted = delete cur[last];
    } else if (key in this.data) {
      deleted = delete this.data[key];
    }

    if (deleted) this.save();
    return deleted;
  }

  has(key) {
    return this.get(key) !== null;
  }

  clear() {
    this.data = {};
    this.save();
    return this;
  }

  keys() {
    return Object.keys(this.data);
  }

  values() {
    return Object.values(this.data);
  }

  entries() {
    return Object.entries(this.data).map(([k, v]) => ({ key: k, value: v }));
  }

  size() {
    return Object.keys(this.data).length;
  }

  add(key, amount = 1) {
    const current = this.get(key, 0);
    const newVal = parseInt(current, 10) + amount;
    this.set(key, newVal);
    return newVal;
  }

  subtract(key, amount = 1) {
    return this.add(key, -amount);
  }

  push(key, value) {
    const arr = this.get(key, []);
    if (!Array.isArray(arr)) throw new Error(`Value at ${key} is not an array`);
    arr.push(value);
    this.set(key, arr);
    return arr;
  }

  pull(key, value) {
    const arr = this.get(key, []);
    if (!Array.isArray(arr)) throw new Error(`Value at ${key} is not an array`);
    const filtered = arr.filter(i => i !== value);
    this.set(key, filtered);
    return filtered;
  }
}

module.exports = { SimpleDatabase };
