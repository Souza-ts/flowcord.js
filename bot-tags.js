const { Flowcord } = require('./src/index');

// Inicializar o bot 
const bot = new Flowcord({
  token: 'SEU_TOKEN_AQUI',
  prefix: '!',
  slashCommands: true,
  clientId: 'SEU_CLIENT_ID'
});

// Configurar banco de dados
bot.database('./dados/bot.json');

// Comando de ping simples usando tags
bot.command({
  name: 'ping',
  code: 'Pong! Latência: $ping ms'
});

// Comando com embed usando tags
bot.command({
  name: 'perfil',
  code: `
$title Perfil de $username[$authorId]
$description Informações do usuário
$color #3498db
$thumbnail $avatar[$authorId]
$field Conta criada|<t:$getVar[usuarios.$authorId.criadoEm;0]:R>|true
$field Comandos usados|$getVar[usuarios.$authorId.comandos;0]|true
$footer ID: $authorId
  `
});

// Contador de uso com banco de dados
bot.command({
  name: 'contador',
  code: `
$setVar[usuarios.$authorId.comandos;$addVar[usuarios.$authorId.comandos;1]]
Você já usou $getVar[usuarios.$authorId.comandos] comandos!
  `
});

// Comando com botões usando tags
bot.command({
  name: 'botoes',
  code: `
$title Teste de Botões
$description Clique em um botão para testar!
$color #00ff00
$button botao_vermelho|Vermelho|danger|
$button botao_verde|Verde|success|
$button botao_link|Discord|link|https://discord.com|🔗
  `
});

// Handler para os botões usando tags
bot.onButton('botao_vermelho', `
$title Botão Vermelho
$description Você clicou no botão vermelho!
$color #ff0000
$ephemeral true
`);

bot.onButton('botao_verde', `
$title Botão Verde
$description Você clicou no botão verde!
$color #00ff00
$ephemeral true
`);

// Comando com menu dropdown usando tags
bot.command({
  name: 'menu',
  code: `
$title Menu de Opções
$description Selecione uma opção no menu abaixo
$color #9b59b6
$dropdown menu_opcoes|Escolha uma opção|opcao1,Opção 1,Primeira opção,1️⃣;opcao2,Opção 2,Segunda opção,2️⃣
  `
});

// Handler para o menu usando tags
bot.onMenu('menu_opcoes', `
$title Opção Selecionada
$description Você selecionou a opção $username!
$color #9b59b6
$ephemeral true
`);

// Slash command com tags
bot.slashCommand({
  name: 'avatar',
  description: 'Mostra o avatar de um usuário',
  options: [
    {
      name: 'usuario',
      type: 'user',
      description: 'O usuário para mostrar o avatar',
      required: false
    }
  ],
  code: `
$title Avatar de $username[$if[$username;$username;$authorId]]
$description Clique na imagem para baixar
$image $avatar[$if[$username;$username;$authorId]]
$color #2ecc71
  `
});

// Slash command com dados do servidor
bot.slashCommand({
  name: 'servidor',
  description: 'Mostra informações do servidor',
  code: `
$title $guildId
$description Este servidor tem $membersCount membros
$color #3498db
$thumbnail https://cdn.discordapp.com/icons/$guildId/$guildId.png
  `
});

// Adicionar uma tag personalizada
bot.addTag('aleatorio', (args) => {
  const frases = [
    'Você é demais!',
    'Tenha um ótimo dia!',
    'A sorte está do seu lado hoje!',
    'Continue assim!',
    'Você é incrível!'
  ];
  return frases[Math.floor(Math.random() * frases.length)];
});

// Comando usando a tag personalizada
bot.command({
  name: 'motivar',
  code: `
$title Mensagem Motivacional
$description $aleatorio
$color #f1c40f
  `
});

bot.loadCommands('./commands');

// Iniciar o bot
console.log('Bot configurado com sistema de tags! Remova o comentário da linha abaixo para iniciar.');
// bot.start(); 