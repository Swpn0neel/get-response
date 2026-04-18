#!/usr/bin/env node

import chalk from "chalk";
import { version } from "./src/utils/config.js";
import { isUpdated } from "./src/utils/helpers.js";
import { ask, askPDF } from "./src/services/ai.js";
import { askStackExchange } from "./src/services/stack.js";
import { askTerminal } from "./src/services/terminal.js";
import { askMermaid } from "./src/services/mermaid.js";
import { pdfReader, imageContext, fileContext, directoryContext } from "./src/core/context.js";
import { chatMode } from "./src/core/chat.js";
import { help, versionMsg } from "./src/ui/display.js";

/**
 * Main function to start the Get-Response CLI.
 */
async function main() {
  await isUpdated();

  const cmd = process.argv.slice(2);
  let question = cmd
    .filter(
      (exec) =>
        exec !== "-f" &&
        exec !== "--file" &&
        exec !== "-p" &&
        exec !== "--pdf" &&
        exec !== "-i" &&
        exec !== "--image" &&
        exec !== "-m" &&
        exec !== "--mermaid" &&
        exec !== "-d" &&
        exec !== "--directory" &&
        exec !== "-c" &&
        exec !== "--chat-mode" &&
        exec !== "-v" &&
        exec !== "--version" &&
        exec !== "-h" &&
        exec !== "--help" &&
        exec !== "-t" &&
        exec !== "--terminal" &&
        exec !== "-s" &&
        exec !== "--search-stack" &&
        !exec.startsWith("./")
    )
    .join(" ");

  const askQuestion = (question) => {
    if (question) ask(question);
    else console.error(chalk.red("Please ask a question!"));
  };

  if (cmd.includes("-v") || cmd.includes("--version")) {
    versionMsg(version);
  } else if (cmd.includes("-h") || cmd.includes("--help")) {
    help();
  } else if (cmd.includes("-p") || cmd.includes("--pdf")) {
    const pdfMaterial = await pdfReader(cmd, question);
    if (cmd.includes("-c") || cmd.includes("--chat-mode")) {
      chatMode(pdfMaterial);
    } else {
      askPDF(pdfMaterial);
    }
  } else if (cmd.includes("-i") || cmd.includes("--image")) {
    const imageMaterial = await imageContext(cmd, question);
    if (cmd.includes("-c") || cmd.includes("--chat-mode")) {
      chatMode(imageMaterial);
    } else {
      askQuestion(imageMaterial);
    }
  } else if (cmd.includes("-f") || cmd.includes("--file")) {
    const fileMaterial = await fileContext(cmd, question);
    if (cmd.includes("-m") || cmd.includes("--mermaid")) {
      askMermaid(fileMaterial, question);
    } else if (cmd.includes("-c") || cmd.includes("--chat-mode")) {
      chatMode(fileMaterial);
    } else {
      askQuestion(fileMaterial);
    }
  } else if (cmd.includes("-d") || cmd.includes("--directory")) {
    const dirMaterial = await directoryContext(cmd, question);
    if (cmd.includes("-m") || cmd.includes("--mermaid")) {
      askMermaid(dirMaterial, question);
    } else if (cmd.includes("-c") || cmd.includes("--chat-mode")) {
      chatMode(dirMaterial);
    } else {
      askQuestion(dirMaterial);
    }
  } else if (cmd.includes("-s") || cmd.includes("--search-stack")) {
    if (question) {
      await ask(question);
      askStackExchange(question, cmd);
    } else {
      console.log(chalk.red("Please provide a question!!"));
    }
  } else if (cmd.includes("-c") || cmd.includes("--chat-mode")) {
    chatMode("");
  } else if (cmd.includes("-t") || cmd.includes("--terminal")) {
    askTerminal(question);
  } else {
    if (question) {
      ask(question);
    } else {
      console.log(
        chalk.red("Please provide a question or a valid flag to get a response!!")
      );
    }
  }
}

main().catch(error => {
  console.error(chalk.red("An error occurred:"), error);
  process.exit(1);
});
