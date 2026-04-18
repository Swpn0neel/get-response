import readline from "readline";
import chalk from "chalk";
import boxen from "boxen";
import { interactive } from "../services/ai.js";
import { interactiveStack } from "../services/stack.js";
import { help } from "../ui/display.js";

/**
 * Interactive chat mode.
 * @param {string} material - Initial material context.
 */
export function chatMode(material) {
  let context = material
    ? `All the necessary details read from the files is:\n\n${material}`
    : "";
    
  console.log(
    chalk.italic(
      `Welcome to the interactive chat mode of ${chalk.yellow(
        "Get Response"
      )}.\nYou can type ${chalk.yellow(
        "help"
      )} if you need any assistance, or type ${chalk.yellow(
        "stack"
      )} if you want to interact with the Stack Exchange interface, or type ${chalk.yellow(
        "exit"
      )} to quit the chat mode.`
    )
  );

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: chalk.cyan("Type your message: "),
  });

  rl.prompt();
  let input = "";
  rl.on("line", async (line) => {
    const currentInput = line.trim();
    if (currentInput.toLowerCase() === "exit" || currentInput.toLowerCase() === "stack") {
      input = currentInput;
      rl.close();
    } else if (currentInput.toLowerCase() === "help") {
      help();
      rl.prompt();
    } else {
      readline.moveCursor(process.stdout, 0, -1);
      readline.clearLine(process.stdout, 0);
      readline.cursorTo(process.stdout, 0);
      console.log(
        "\n" +
          boxen(chalk.cyan(currentInput), {
            padding: 1,
            align: "left",
            borderColor: "cyan",
            title: "You",
            titleAlignment: "left",
          })
      );
      context = await interactive(currentInput, context);
      if (!rl.closed) rl.prompt();
    }
  }).on("close", () => {
    if (input.toLowerCase() === "stack") {
      stackMode(context);
    } else {
      console.log(chalk.red("Exiting chat mode."));
    }
  });
}

/**
 * Stack Exchange interface for chat mode.
 * @param {string} prevContext - Previous context to pass back to chat mode.
 */
export function stackMode(prevContext) {
  console.log(
    chalk.italic(
      `Switched to the the ${chalk.yellow(
        "Stack Exchange"
      )} interface of the chat mode of ${chalk.yellow(
        "Get Response"
      )}.\nYou can type ${chalk.yellow(
        "help"
      )} if you need any assistance, or type ${chalk.yellow(
        "exit"
      )} to quit the chat mode, or type ${chalk.yellow(
        "chat"
      )} to switch back to the interactive chat mode.`
    )
  );

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: chalk.cyan("Type your message: "),
  });

  rl.prompt();
  let input = "";
  rl.on("line", async (line) => {
    const currentInput = line.trim();
    if (currentInput.toLowerCase() === "exit" || currentInput.toLowerCase() === "chat") {
      input = currentInput;
      rl.close();
    } else if (currentInput.toLowerCase() === "help") {
      help();
      rl.prompt();
    } else {
      readline.moveCursor(process.stdout, 0, -1);
      readline.clearLine(process.stdout, 0);
      readline.cursorTo(process.stdout, 0);
      console.log(
        "\n" +
          boxen(chalk.cyan(currentInput), {
            padding: 1,
            align: "left",
            borderColor: "cyan",
            title: "You",
            titleAlignment: "left",
          })
      );
      await interactiveStack(currentInput);
      if (!rl.closed) rl.prompt();
    }
  }).on("close", () => {
    if (input.toLowerCase() === "chat") {
      console.log(
        chalk.italic(
          `${chalk.bold.red(
            "Note:"
          )} The chat context of this session was stored, so you can continue the conversation from where you left earlier.`
        )
      );
      chatMode(prevContext);
    } else {
      console.log(chalk.red("Exiting chat mode."));
    }
  });
}
