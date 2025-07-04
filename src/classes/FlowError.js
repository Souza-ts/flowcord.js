const Util = require("./Util.js");
const chalk = require("chalk");
const { ComponentParser, EmbedParser, FileParser } = Util.parsers;
const { BaseInteraction, MessageFlags } = require("discord.js");

class FlowError {
  constructor() {
    const error = new Error(`Cannot initialize "FlowError" Class`);
    error.name = "FlowError";
    throw error;
  }

  static EventError(event, intent, line) {
    const error = new Error(`(Missing Intents) : "${event}" requires "${intent}" intent.`);
    error.name = "EventError";
    error.fileName = "./FlowClient.js";
    error.lineNumber = line;
    throw error;
  }

  static AstGeneratorError(message, options) {
    const error = new Error(`(GenerationError): ${message} `);
    error.name = "AstGeneratorError";
    error.options = options;
    throw error;
  }

  static CommandError(command, type, name, position) {
    if (type === "name") {
      throw new Error(`FlowError: "Name" property is missing in "${command}" (position: ${position})`);
    } else if (type === "code") {
      throw new Error(`FlowError: "Code" is not provided in "${name || "the Command"}" : ${command} (position: ${position})`);
    } else if (type === "channel") {
      throw new Error(`FlowError: "Channel" is not provided in "${name || "the Command"}" : ${command} (position: ${position})`);
    }
  }

  static async makeMessageError(client, channel, options = {}, extraOptions = {}, d) {
    options = options?.data ?? options;

    if (typeof options === "object") {
      options.content = options.content?.toString()?.trim() || " ";
      if (options.embeds && typeof options.embeds === "string") {
        options.embeds = await EmbedParser(options.embeds, d);
      }
      if (options.files && typeof options.files === "string") {
        options.files = FileParser(options.files, d);
      }
      if (options.components && typeof options.components === "string") {
        options.components = await ComponentParser(options.components, d);
      }
    } else {
      options = {
        content: options?.toString()?.trim() === "" ? " " : options?.toString()
      };
    }

    let msg;
    if (extraOptions.interaction) {
      if (options.content === "" && options.embeds?.length === 0 && options.files?.length === 0 && options.components?.length === 0) return;

      if (extraOptions?.defer && !d.data.interaction?.deferred) {
        await d.data.interaction.deferReply({
          flags: extraOptions.ephemeral ? (options.flags ? (MessageFlags.Ephemeral | options.flags) : MessageFlags.Ephemeral) : options.flags
        });
      }

      const method = d.data.interaction?.deferred ? "followUp" : "reply";
      msg = await d.data.interaction[method]({
        ...options,
        flags: extraOptions.ephemeral ? (options.flags ? (MessageFlags.Ephemeral | options.flags) : MessageFlags.Ephemeral) : options.flags
      });
    } else {
      if (channel instanceof BaseInteraction) {
        msg = await channel.reply(options).catch((e) => {
          FlowcordError.consoleError("CreateMessageError", e);
          return undefined;
        });
      } else {
        if (extraOptions.reply?.message) {
          if (extraOptions.reply?.mention) options.allowedMentions.repliedUser = true;
          const refMsg = await d.util.getMessage(channel, extraOptions.reply.message);
          msg = await refMsg.reply(options).catch((e) => {
            FlowcordError.consoleError("CreateMessageError", e);
            return undefined;
          });
        } else {
          msg = await channel.send(options).catch((e) => {
            FlowcordError.consoleError("CreateMessageError", e);
            return undefined;
          });
        }
      }
    }

    if (extraOptions.reactions?.length) {
      for (const emoji of extraOptions.reactions) {
        msg.react(emoji).catch(() => {});
      }
    }

    if (extraOptions.edits) {
      for (const group of extraOptions.edits.messages) {
        for (const content of group) {
          await new Promise((r) => setTimeout(r, extraOptions.edits.time));
          await msg.edit(content).catch(() => {});
        }
      }
    }

    if (extraOptions.deleteIn) setTimeout(() => msg.delete().catch(() => {}), extraOptions.deleteIn);
    if (extraOptions.deleteCommand) d.message.delete().catch(() => {});

    return msg;
  }

  static consoleError(name, err) {
    return console.error(`${name}: ${err}`);
  }

  static functionErrorResolve(d, type, data, message) {
    const errorData = {
      Function: d.func,
      Command: d.command?.name,
      Type: d.command?.type,
      Version: require("../../package.json").version
    };

    const typeMap = {
      member: "Invalid Member ID",
      message: "Invalid Message ID",
      channel: "Invalid Channel ID",
      user: "Invalid User ID",
      role: "Invalid Role ID",
      guild: "Invalid Guild ID",
      emoji: "Invalid Emoji ID",
      option: "Invalid Option ID",
      custom: message
    };

    errorData.type = typeMap[type] || "Unknown Error";
    return `FlowError: \`${errorData.Function}\` in \`${data.inside}\` (${errorData.type})`;
  }

  static fnError(d, type, data, message) {
    d.error(this.functionErrorResolve(d, type, data, message));
  }

  static createConsoleMessage(messages, borderColor = "white", title) {
    if (!Array.isArray(messages)) messages = [messages];

    const strip = (str) => str.replace(/\x1B[[(?);]{0,2}(;?\d)*./g, "");
    const totalwidth = process.stdout?.columns || 80;
    const bordercolor = chalk[borderColor] || chalk.white;
    const maxwidth = Math.max(...messages.map((msg) => strip(typeof msg === "string" ? msg : msg.text).length), title?.text?.length || 0);
    const msgwidth = Math.min(maxwidth, totalwidth - 4);
    const bordertop = bordercolor(`╭${"─".repeat(msgwidth + 2)}╮`);

    const wrapText = (text, width) => {
      const words = text.split(" ");
      let lines = [], current = words[0];
      for (let i = 1; i < words.length; i++) {
        if (strip(current).length + strip(words[i]).length + 1 <= width) current += " " + words[i];
        else { lines.push(current); current = words[i]; }
      }
      lines.push(current);
      return lines;
    };

    const newmessage = (msg) => {
      const text = typeof msg === "string" ? msg : msg.text;
      const textcolor = msg.textColor ? chalk[msg.textColor] : chalk.white;
      const wrapped = wrapText(text, msgwidth);
      return wrapped.map((line) => {
        const padding = msgwidth - strip(line).length;
        const padded = msg.centered !== false
          ? " ".repeat(Math.floor(padding / 2)) + line + " ".repeat(Math.ceil(padding / 2))
          : line + " ".repeat(padding);
        return `│ ${textcolor(padded)} │`;
      });
    };

    const titlemsg = title?.text ? newmessage(title) : [];
    const msgs = messages.flatMap(newmessage);

    console.log(bordertop);
    titlemsg.forEach((line) => console.log(line));
    msgs.forEach((line) => console.log(line));
    console.log(bordercolor(`╰${"─".repeat(msgwidth + 2)}╯`));
  }
}

module.exports = FlowError;