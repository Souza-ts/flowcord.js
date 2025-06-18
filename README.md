# flowcord.js

**flowcord.js** é um framework moderno e flexível para criação de bots no Discord, inspirado no `aoi.js`, mas reimaginado para ser mais intuitivo, escalável e poderoso. Ideal tanto para iniciantes quanto para desenvolvedores experientes.

## 🚀 Recursos Principais

* ✅ Leitura sequencial real (de cima para baixo)
* ⚙️ Execução estável sem uso inseguro de `eval`
* 🧠 Suporte a condições e lógica programável
* 💾 Sistema de variáveis customizáveis com drivers JSON ou Mongo
* 🔌 Totalmente extensível via plugins e funções personalizadas

---

## 📦 Instalação

```
npm install flowcord.js
```

---

## 🧪 Exemplo de uso

```ts
import { FlowClient } from "flowcord.js";

const client = new FlowClient({
  token: "SEU_TOKEN",
  prefix: "!",
  intents: ["Guilds", "GuildMessages", "MessageContent"]
});

client.command({
  name: "ping",
  code: `
    Pong! Seu ping é $pingms
  `
});

client.login();
```

---

## 🛠 Comandos e Funções

| Função          | Descrição                     |
| --------------- | ----------------------------- |
| `$ping`         | Mostra o ping da API do bot   |
| `$userTag`      | Retorna a tag de quem enviou  |
| `$wait[3s]`     | Aguarda por X segundos        |
| `$if` / `$else` | Controle de fluxo condicional |

---

## 🧩 Crie sua própria função

```ts
bot.functions.add({
  name: "$hello",
  execute: () => "Olá, mundo!"
});
```

---

## 📚 Documentação

> Em breve: [https://flowcord.js.org](https://flowcord.js.org)

---

## 🤝 Contribuindo

Pull requests são bem-vindos! Sinta-se à vontade para abrir issues, sugerir ideias ou contribuir com código.

---

## 📄 Licença

MIT

---

Feito com ❤️ por Souza e a comunidade open source.
