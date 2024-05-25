#!/usr/bin/env node

import { GoogleGenerativeAI } from "@google/generative-ai";
import path from "path";
import fs from "fs";
import { exec } from "child_process";
import readline from "readline";
import chalk from "chalk";
import boxen from "boxen";
import { createSpinner } from "nanospinner";

const version = "1.8.0";

const key = "QUl6YVN5RDRLdUdUMjJhQ0VYWlNpOFhDdER3b1BibGI0eUMwQmo4";
if (!key) {
  console.error(chalk.red("Incorrect API_KEY"));
  process.exit(1);
}

function textFormat(text) {
  let block = 0;
  let code = ``;
  let lang = "";
  let heading = 2;
  let output = ``;

  for (let i = 0; i < text.length; i++) {
    if (text.substring(i, i + 3) === "```") {
      i += 3;
      if (block === 0) {
        block = 1;
        lang = "";
        while (i < text.length && text.charAt(i) !== "\n") {
          lang += text.charAt(i++);
        }
      } else {
        const styledCode = chalk.green(code);
        const boxedCode = boxen(styledCode, {
          title: lang,
          padding: 1,
          borderStyle: "double",
          borderColor: "cyan",
        });
        output += boxedCode + "\n";
        code = ``;
        lang = "";
        block = 0;
      }
    } else if (block === 0) {
      if (text.substring(i, i + 2) === "**") {
        i += 2;
        heading = heading === 2 ? 3 : 2;
      }
      if (heading === 2) {
        output += chalk.cyan.italic(text.charAt(i));
      } else if (heading === 3) {
        output += chalk.yellow(text.charAt(i));
      }
    } else {
      code += text.charAt(i);
    }
  }
  return output;
}

async function ask(question) {
  const spinner = createSpinner();
  spinner.start({ text: " Generating your answer..." });
  if (question) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(question);
      const response = result.response;
      const text = response.text();
      spinner.success({ text: " Here's your answer:" });
      console.log(textFormat(text));
      process.exit(0);
    } catch (error) {
      spinner.error({ text: " Unexpected error while generating content" });
      process.exit(1);
    }
  } else {
    spinner.warn({
      text: chalk.gray(" Please ask a question to get an answer!!"),
    });
    process.exit(1);
  }
}

async function interactive(question, context) {
  if (question) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(
        `${question}\nContext:\n${context}`
      );
      const response = result.response;
      const text = response.text();
      console.log(
        boxen(textFormat(text), {
          padding: 1,
          align: "left",
          borderColor: "green",
          title: "AI",
          titleAlignment: "left",
        })
      );
      return `${question}\nContext:\n${context}\n${text}`;
    } catch (error) {
      console.log(chalk.red(" Unexpected error while generating content"));
      process.exit(1);
    }
  } else {
    spinner.warn({
      text: chalk.gray(" Please ask a question to get an answer!!"),
    });
    process.exit(1);
  }
}

async function askTerminal(question) {
  const spinner = createSpinner();
  spinner.start({ text: " Fetching the terminal commands..." });
  if (question) {
    question =
      "Write the terminal commands for " +
      question +
      ". Just write the commands in simple text, without any explanation, decoration or formatting.";
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(question);
      const response = result.response;
      const text = response.text();
      spinner.success({ text: " Got the terminal commands" });
      const terminalCommands = text.split("\n");
      await executeCommands(terminalCommands)
        .then(() => console.log(chalk.green("Command sequence completed")))
        .catch((error) =>
          console.error(chalk.red(`Execution stopped due to ${error}`))
        );
      process.exit(0);
    } catch (error) {
      console.log(
        chalk.red(" Unexpected error while generating the terminal commands")
      );
      process.exit(1);
    }
  } else {
    spinner.warn({
      text: chalk.gray(" Please ask a question to get an answer!!"),
    });
    process.exit(1);
  }
}

const cmd = process.argv.slice(2);
let question = cmd
  .filter(
    (exec) =>
      exec !== "-f" &&
      exec != "--file" &&
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
      !exec.startsWith("./")
  )
  .join(" ");

const genAI = new GoogleGenerativeAI(
  Buffer.from(key, "base64").toString("utf-8")
);

async function executeCommands(queue) {
  for (let i = 0; i < queue.length; i++) {
    const command = queue[i];
    const answer = await requestPermission(
      `${chalk.blue(
        `Do you want to execute the command`
      )} "${command}"? (${chalk.green("yes")}/${chalk.red("no")}) `
    );
    if (answer.toLowerCase() === "yes" || answer.toLowerCase() === "y") {
      console.log(`${chalk.green("Executing:")} ${command}`);
      try {
        await executeCommand(command);
      } catch (error) {
        console.error(`${chalk.red("Error executing command:")} ${command}`);
        console.error(error.message);
        break;
      }
    } else {
      console.log("Terminating program.");
      break;
    }
  }
}

function requestPermission(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

function executeCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      console.log(`Output: ${stdout}`);
      resolve();
    });
  });
}

function isSkippable(file) {
  const stats = fs.statSync(file);
  const maxSize = 3 * 1024 * 1024;
  const largeFile = [".log", ".zip", ".tar", ".rar", ".gz", ".7z"];
  const largeDirectory = [
    ".next",
    "node_modules",
    "dist",
    "build",
    "coverage",
    "logs",
    "__pycache__",
    "tmp",
    "temp",
  ];
  const name = path.basename(file);
  const extension = path.extname(file);
  if (largeFile.includes(extension) || largeDirectory.includes(name))
    return true;
  if (stats.size > maxSize) return true;
  return false;
}

function help() {
  const help = `
${chalk.underline.yellow("Get-Response : A terminal-based AI chat-bot")}

[ ${chalk.italic.cyan("Created by Swapnoneel Saha")} ]

${chalk.bold("Usage : ")}

  ${chalk.yellow("npx get-response [question] [flag(s)] [directory path]")}

${chalk.bold("Flags : ")}

  ${chalk.cyan("-h, --help")}          Show this help message and exit
  ${chalk.cyan("-v, --version")}       Show the version number and exit
  ${chalk.cyan(
    "-f <file>"
  )}           Provide a file path to include its content as context
  ${chalk.cyan(
    "-d <directory>"
  )}      Provide a directory path to include all files' content as context
  ${chalk.cyan(
    "-c, --chat-mode"
  )}     Starts an context-based interactive chat window (type "exit" to exit)
  ${chalk.cyan(
    "-t, --terminal"
  )}      Based on your prompt, generates commands that directly executes on your terminal

${chalk.bold("Examples : ")}

  ${chalk.dim(`npx get-response "How is Python better than C++?"
  npx get-response "What is the function isRand() doing?" -f context.txt
  npx get-response "How to import app.js within index.js?" -d contextDir
  npx get-response "Create a React app named get-response" -t
  npx get-response -c
  npx get-response -c -f context.txt
  npx get-response -c -d contextDir`)}
  
${chalk.bold("GitHub Repository : ")}           ${chalk.cyan.italic(
    "https://github.com/Swpn0neel/get-response"
  )}
${chalk.bold("Follow me to stay updated : ")}   ${chalk.cyan.italic(
    "https://twitter.com/swapnoneel123"
  )}

${chalk.red(
  "In case of any issues/feature requests, please report it on GitHub!!"
)}`;
  const helpMsg = boxen(help, {
    padding: 1,
    title: "Welcome",
    titleAlignment: "center",
    borderStyle: "double",
    borderColor: "green",
  });
  console.log(helpMsg);
}

function versionMsg(version) {
  console.log(`
${chalk.bold("Installed version of")} ${chalk.bold.cyan(
    "get-response"
  )} ${chalk.bold("is:")} ${chalk.yellow.bold(version)}
  
To update to the latest version, run ${chalk.cyan(
    "npm i get-response -g"
  )} in your terminal!!`);
}

function askQuestion(question) {
  if (question) ask(question);
  else console.error(chalk.red("Please ask a question!"));
}

function fileContext(cmd) {
  let material = "";
  const index =
    (cmd.indexOf("-f") > cmd.indexOf("--file")
      ? cmd.indexOf("-f")
      : cmd.indexOf("--file")) + 1;
  if (index < cmd.length) {
    const spinner = createSpinner();
    spinner.start({ text: "Reading your file..." });
    let file = cmd[index];
    try {
      if (isSkippable(file)) {
        spinner.error({
          text: `${chalk.red(
            " Cannot read this file, it is too large:"
          )} ${file}`,
        });
      } else {
        const content = fs.readFileSync(path.resolve(file), "utf-8");
        material = `${question}\n\nContext of the question is:\n${content}`;
        spinner.success({ text: " File read successfully." });
      }
    } catch (error) {
      spinner.error({ text: ` Error while reading the file: ${error}` });
      process.exit(1);
    }
  } else {
    console.log("Please provide a file path after the -f flag.");
    process.exit(1);
  }
  return material;
}

function directoryContext(cmd) {
  let material = "";
  const index =
    (cmd.indexOf("-d") > cmd.indexOf("--directory")
      ? cmd.indexOf("-d")
      : cmd.indexOf("--directory")) + 1;
  if (index < cmd.length) {
    const spinner = createSpinner();
    spinner.start({ text: "Reading each file from your directory..." });
    let dir = cmd[index];
    let content = "";
    const readFilesRecursively = (directory) => {
      const files = fs.readdirSync(path.resolve(directory));
      files.forEach((file) => {
        const filePath = path.join(directory, file);
        if (fs.lstatSync(filePath).isDirectory() && !isSkippable(filePath)) {
          readFilesRecursively(filePath);
        } else {
          if (isSkippable(filePath)) {
            spinner.warn({
              text: `${chalk.red(
                " Cannot read this file, it is too large:"
              )} ${file}`,
            });
          } else {
            const fileContent = fs.readFileSync(filePath, "utf-8");
            content += `\nContext from ${filePath}:\n\n${fileContent}`;
            spinner.success({ text: `Read this file successfully: ${file}` });
          }
        }
      });
    };
    try {
      readFilesRecursively(dir);
      spinner.success({ text: "Completed reading files from the directory" });
      material = `${question}\n\nContext of the question is:\n${content}`;
    } catch (error) {
      spinner.error({
        text: `Error while reading files from the directory: ${error}`,
      });
      process.exit(1);
    }
  } else {
    console.log("Please provide a directory path after the -d flag.");
    process.exit(1);
  }
  return material;
}

function chatMode(material) {
  let context = material ? `Context:\n${material}` : "";
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: chalk.cyan("Type your message: "),
  });
  rl.prompt();
  rl.on("line", async (line) => {
    const input = line.trim();
    if (input.toLowerCase() === "exit") {
      rl.close();
    } else {
      readline.moveCursor(process.stdout, 0, -1);
      readline.clearLine(process.stdout, 0);
      readline.cursorTo(process.stdout, 0);
      console.log(
        "\n" +
          boxen(chalk.cyan(input), {
            padding: 1,
            align: "left",
            borderColor: "cyan",
            title: "You",
            titleAlignment: "left",
          })
      );
      context = await interactive(input, context);
      rl.prompt();
    }
  }).on("close", () => {
    console.log(chalk.red("Exiting chat mode."));
    process.exit(0);
  });
}

if (cmd.includes("-f") || cmd.includes("--file")) {
  if (cmd.includes("-c") || cmd.includes("--chat-mode"))
    chatMode(fileContext(cmd));
  else {
    question = fileContext(cmd);
    askQuestion(question);
  }
} else if (cmd.includes("-d") || cmd.includes("--directory")) {
  if (cmd.includes("-c") || cmd.includes("--chat-mode"))
    chatMode(directoryContext(cmd));
  else {
    question = directoryContext(cmd);
    askQuestion(question);
  }
} else if (cmd.includes("-c") || cmd.includes("--chat-mode")) chatMode("");
else if (cmd.includes("-t") || cmd.includes("--terminal"))
  askTerminal(question);
else if (cmd.includes("-h") || cmd.includes("--help")) help();
else if (cmd.includes("-v") || cmd.includes("--version")) versionMsg(version);
else {
  if (question) ask(question);
  else
    console.log(
      chalk.red("Please provide a question or a valid flag to get a response!!")
    );
}
