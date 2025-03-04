#!/usr/bin/env node

import { GoogleGenerativeAI } from "@google/generative-ai";
import path from "path";
import fs from "fs";
import { exec } from "child_process";
import readline from "readline";
import chalk from "chalk";
import boxen from "boxen";
import { createSpinner } from "nanospinner";
import latestVersion from "latest-version";

const version = "1.2.1";

const isUpdated = async () => {
  try {
    const latest = await latestVersion("get-response-lite");
    if (latest !== version) {
      console.log(
        `A new version of get-response-lite is available: ${chalk.yellow(
          latest
        )}. You are using version: ${chalk.red(
          version
        )}.\n\nTo update, run: ${chalk.yellow(`npm i get-response-lite`)}`
      );
    }
  } catch (error) {
    console.error(chalk.red("Network error while checking for updates"));
  }
};

await isUpdated();

function versionMsg(version) {
  console.log(`
${chalk.bold("Installed version of")} ${chalk.bold.cyan(
    "get-response-lite"
  )} ${chalk.bold("is:")} ${chalk.yellow.bold(version)}
  
To update to the latest version, run ${chalk.cyan(
    "npm i get-response-lite -g"
  )} in your terminal!!`);
}

const key =
  "QUl6YVN5RDRLdUdUMjJhQ0VYWlNpOFhDdER3b1BibGI0eUMwQmo4adLcBr3vALjgTkhYOG3Dzw((";
if (!key) {
  console.error(chalk.red("Incorrect API_KEY"));
  process.exit(1);
}
const genAI = new GoogleGenerativeAI(
  Buffer.from(key.substring(0, 52), "base64").toString("utf-8")
);

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
        const boxedCode = styledCode;
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
      if (text.substring(i, i + 2) === "* ") {
        i += 1;
        output += chalk.green("•");
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
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
      });
      const result = await model.generateContent(question);
      const response = result.response;
      const text = response.text();
      spinner.success({ text: " Here's your answer:" });
      console.log(textFormat(text));
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
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
      });
      const result = await model.generateContent(
        `${question}\nThe context of the question was based on:\n${context}`
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
      return `Previous question was: ${question}\nThe context of the question was based on:\n${context}\n\nThe generated answer was:\n${text}`;
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
  const os = await getOS();
  spinner.start({ text: " Fetching the terminal commands..." });
  if (question) {
    question = `Write the terminal commands to ${question}, strictly for ${os} Operating System. Strictly write the commands in simple text, without any explanation, decoration, blank lines and code formatting.`;
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
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
      exec !== "--file" &&
      exec !== "--mermaid" &&
      exec !== "-d" &&
      exec !== "--directory" &&
      exec !== "-c" &&
      exec !== "--chat-mode" &&
      exec !== "-h" &&
      exec !== "--help" &&
      exec !== "-t" &&
      exec !== "--terminal" &&
      !exec.startsWith("./")
  )
  .join(" ");

async function executeCommands(queue) {
  console.log(
    chalk.italic(
      `Enter ${chalk.green("yes / y")} to execute a particular command.
Enter ${chalk.magenta("skip / s")} to skip a command and move to the next one.
Enter ${chalk.red("no / n")} to terminate the process of command execution.`
    )
  );
  for (let i = 0; i < queue.length; i++) {
    const command = queue[i];
    const spinner = createSpinner();
    const answer = await requestPermission(
      `${chalk.blue(
        `Do you want to execute the command`
      )} "${command}"? (${chalk.green("yes")}/${chalk.magenta(
        "skip"
      )}/${chalk.red("no")}) `
    );
    if (answer.toLowerCase() === "yes" || answer.toLowerCase() === "y") {
      spinner.start({ text: `${chalk.green("Executing:")} ${command}` });
      try {
        await executeCommand(command, spinner);
      } catch (error) {
        spinner.error({
          text: `${chalk.red("Error executing command:")} ${command}`,
        });
        console.error(error.message);
        break;
      }
    } else if (
      answer.toLowerCase() === "skip" ||
      answer.toLowerCase() === "s"
    ) {
      console.log(`${chalk.magenta("Skipping command: ")}` + command);
    } else {
      console.log("Terminating program.");
      break;
    }
  }
}

function executeCommand(command, spinner) {
  if (command.startsWith("cd ")) {
    const directory = command.slice(3).trim();
    try {
      process.chdir(directory);
      spinner.success({
        text: `${chalk.green("Changed directory to:")} ${directory}`,
      });
      return Promise.resolve();
    } catch (error) {
      spinner.error({
        text: `${chalk.red("Failed to change directory:")} ${directory}`,
      });
      return Promise.reject(error);
    }
  } else {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }
        spinner.success({
          text: `Execution completed!! ${stdout ? stdout : stderr}`,
        });
        resolve();
      });
    });
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

function getOS() {
  const platform = process.platform.toLowerCase();
  const macosPlatforms = ["macos", "macintosh", "macintel", "macppc", "mac68k"];
  const windowsPlatforms = ["win32", "win64", "windows", "wince"];
  const iosPlatforms = ["iphone", "ipad", "ipod"];
  let os = null;
  if (macosPlatforms.indexOf(platform) !== -1) os = "Mac OS";
  else if (iosPlatforms.indexOf(platform) !== -1) os = "iOS";
  else if (windowsPlatforms.indexOf(platform) !== -1) os = "Windows";
  else if (/linux/.test(platform)) os = "Linux";
  return os;
}

async function isSkippable(file) {
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
${chalk.underline.yellow("Get-Response-Lite : A terminal-based AI chat-bot")}

[ ${chalk.italic.cyan("Created by Swapnoneel Saha")} ]

${chalk.bold("Usage : ")}

  ${chalk.yellow("npx ai [question] [option(s)] [directory path]")}

${chalk.bold("Options : ")}

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
  )}      Based on the prompt, generates commands that directly executes in the terminal

${chalk.bold("Examples : ")}

  ${chalk.dim(`npx ai "How is Python better than C++?"
  npx ai "What is the function isRand() doing?" -f context.js
  npx ai "How to import app.js within index.js?" -d contextDir
  npx ai "Create a React app named get-response" -t
  npx ai -c
  npx ai -c -f context.txt
  npx ai -c -d contextDir`)}
  
${chalk.bold("Check out Get Response : ")}      ${chalk.cyan.italic(
    "https://www.npmjs.com/package/get-response"
  )}
${chalk.bold("Follow me to stay updated : ")}   ${chalk.cyan.italic(
    "https://twitter.com/swapnoneel123"
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

function askQuestion(question) {
  if (question) ask(question);
  else console.error(chalk.red("Please ask a question!"));
}

async function fileContext(cmd) {
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
      if (await isSkippable(file)) {
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

async function directoryContext(cmd) {
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
      await readFilesRecursively(dir);
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

let context = ``;
function chatMode(material) {
  context = material
    ? `All the necessary details read from the files is:\n\n${material}`
    : "";
  console.log(
    chalk.italic(
      `Welcome to the interactive chat mode of ${chalk.yellow(
        "Get Response Lite"
      )}.\nYou can type ${chalk.yellow(
        "help"
      )} if you need any assistance, or type ${chalk.yellow(
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
    input = line.trim();
    if (input.toLowerCase() === "exit" || input.toLowerCase() === "stack") {
      rl.close();
    } else if (input.toLowerCase() === "help") {
      help();
      rl.prompt();
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
    if (input.toLowerCase() === "stack") {
      stackMode();
    } else {
      console.log(chalk.red("Exiting chat mode."));
    }
  });
}

if (cmd.includes("-v") || cmd.includes("--version")) versionMsg(version);
else if (cmd.includes("-h") || cmd.includes("--help")) help();
else if (cmd.includes("-f") || cmd.includes("--file")) {
  if (cmd.includes("-c") || cmd.includes("--chat-mode"))
    chatMode(await fileContext(cmd));
  else askQuestion(await fileContext(cmd));
} else if (cmd.includes("-d") || cmd.includes("--directory")) {
  if (cmd.includes("-c") || cmd.includes("--chat-mode"))
    chatMode(await directoryContext(cmd));
  else askQuestion(await directoryContext(cmd));
} else if (cmd.includes("-c") || cmd.includes("--chat-mode")) chatMode("");
else if (cmd.includes("-t") || cmd.includes("--terminal"))
  askTerminal(question);
else {
  if (question) ask(question);
  else
    console.log(
      chalk.red("Please provide a question or a valid flag to get a response!!")
    );
}
