#!/usr/bin/env node

import { GoogleGenerativeAI } from "@google/generative-ai";
import path from "path";
import fs from "fs";
import { exec } from "child_process";
import axios from "axios";
import readline from "readline";
import pdf from "pdf-parse-fork";
import Tesseract from "tesseract.js";
import { tmpdir } from "os";
import { join } from "path";
import { promisify } from "util";
import chalk from "chalk";
import boxen from "boxen";
import { createSpinner } from "nanospinner";
import latestVersion from "latest-version";

const version = "1.10.0";

const isUpdated = async () => {
  try {
    const latest = await latestVersion("get-response");
    if (latest !== version) {
      console.log(
        `A new version of get-response is available: ${chalk.yellow(
          latest
        )}. You are using version: ${chalk.red(
          version
        )}.\n\nTo update, run: ${chalk.yellow(`npm i get-response`)}`
      );
    }
  } catch (error) {
    console.error(chalk.red("Network error while checking for updates"));
  }
};

await isUpdated();

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

const stackExchangeSites = [
  "stackoverflow",
  "serverfault",
  "superuser",
  "askubuntu",
  "math",
  "unix",
  "datascience",
  "codereview",
];

async function searchStackExchange(question) {
  const apiUrl = "https://api.stackexchange.com/2.3/search/advanced";
  const spinner = createSpinner();
  console.log("\n");
  spinner.start({ text: "Searching on Stack Exchange..." });
  const results = [];

  for (const site of stackExchangeSites) {
    const params = {
      order: "desc",
      sort: "relevance",
      q: question,
      site: site,
      key: key.substring(52),
    };
    try {
      const response = await axios.get(apiUrl, { params });
      const items = response.data.items;
      const links = items.map((item) => item.link);
      results.push(...links);
    } catch (error) {
      spinner.error({ text: ` Error searching site ${site}` });
    }
  }
  spinner.success({ text: " Stack Exchange search completed!" });
  return results;
}

async function askStackExchange(question) {
  const index =
    (cmd.indexOf("-s") > cmd.indexOf("--search-stack")
      ? cmd.indexOf("-s")
      : cmd.indexOf("--search-stack")) + 1;
  const limit = index < cmd.length ? parseInt(cmd[index], 10) : 5;
  try {
    const links = await searchStackExchange(question);
    if (!links || links.length === 0)
      console.log(chalk.red("No relevant posts found!"));
    else {
      console.log(chalk.yellow("\nRelevant posts:"));
      for (let i = 0; i < Math.min(limit, links.length); i++) {
        console.log(
          `${chalk.yellow(`${i + 1}.`)} ${chalk.italic.cyan(`${links[i]}`)}`
        );
      }
    }
  } catch (error) {
    console.error("Error:", error);
  }
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

async function interactiveStack(question) {
  const apiUrl = "https://api.stackexchange.com/2.3/search/advanced";
  const links = [];
  for (const site of stackExchangeSites) {
    const params = {
      order: "desc",
      sort: "relevance",
      q: question,
      site: site,
      key: "adLcBr3vALjgTkhYOG3Dzw((",
    };
    try {
      const response = await axios.get(apiUrl, { params });
      const items = response.data.items;
      const siteLinks = items.map((item) => item.link);
      links.push(...siteLinks);
    } catch (error) {
      console.log(chalk.red(`Error searching site ${site}: ${error.message}`));
    }
  }
  if (!links || links.length === 0) {
    console.log(
      boxen(chalk.red("No relevant posts found!"), {
        padding: 1,
        align: "left",
        borderColor: "green",
        title: "StackAI",
        titleAlignment: "left",
      })
    );
  } else {
    let response = ``;
    for (let i = 0; i < Math.min(5, links.length); i++) {
      response += `${chalk.yellow(`${i + 1}.`)} ${chalk.italic.cyan(
        `${links[i]}\n`
      )}`;
    }
    console.log(
      boxen(response, {
        padding: 1,
        align: "left",
        borderColor: "green",
        title: "StackAI",
        titleAlignment: "left",
      })
    );
  }
}

async function askTerminal(question) {
  const spinner = createSpinner();
  const os = await getOS();
  spinner.start({ text: " Fetching the terminal commands..." });
  if (question) {
    question = `Write the terminal commands to ${question}, exactly for ${os} Operating System. Just write the commands in simple text, without any explanation, decoration or formatting.`;
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

async function askPDF(question) {
  const spinner = createSpinner();
  spinner.start({ text: " Generating your answer..." });
  if (question) {
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
      });
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

function generateRandomString(length) {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }
  return result;
}

const execPromise = promisify(exec);
async function mermaidImageGen(mermaidCode) {
  const spinner = createSpinner();
  spinner.start({ text: " Generating the image..." });
  const randomFileName = generateRandomString(5) + ".png";
  const outputFilePath = join(process.cwd(), randomFileName);
  const tempDir = tmpdir();
  const mermaidFilePath = join(tempDir, "temp.mmd");
  try {
    await fs.promises.writeFile(mermaidFilePath, mermaidCode);
  } catch (writeError) {
    spinner.error({
      text: `Failed to write Mermaid code to temporary file: ${writeError.message}`,
    });
    process.exit(1);
  }
  const command = `mmdc -i ${mermaidFilePath} -o ${outputFilePath}`;
  try {
    const { stdout, stderr } = await execPromise(command);
    if (stderr) {
      console.error(`mmdc stderr: ${stderr}`);
    }
    spinner.success({
      text: `Image created successfully at ${outputFilePath}`,
    });
  } catch (execError) {
    spinner.error({
      text: `Failed to execute mmdc command: ${execError.message}`,
    });
  }
}

async function askMermaid(material) {
  const spinner = createSpinner();
  spinner.start({ text: " Generating the mermaid code..." });
  question = `Instructions for the generated response:\nDON'T USE MARKDOWN FORMATTING. Use SIMPLE TEXT, without any explanation, DECORATION or FORMATTING.\n\nQuestion:\nGenerate the mermaid code for the whole codebase.\n\n${material}`;
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(question);
    const response = result.response;
    const code = response.text();
    let mermaid = ``;
    let block = 0;
    for (let i = 0; i < code.length; i++) {
      if (code.substring(i, i + 3) === "```") {
        i += 3;
        if (block === 0) {
          block = 1;
          while (i < code.length && code.charAt(i) !== "\n") i++;
        } else block = 0;
      } else mermaid += code.charAt(i);
    }
    spinner.success({ text: " Got the mermaid code" });
    await mermaidImageGen(mermaid.trim());
    process.exit(0);
  } catch (error) {
    console.log(
      spinner.error({
        text: " Unexpected error while generating the mermaid code",
      })
    );
    process.exit(1);
  }
}

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

async function pdfReader(cmd) {
  let material = "";
  const index =
    (cmd.indexOf("-p") > cmd.indexOf("--pdf")
      ? cmd.indexOf("-p")
      : cmd.indexOf("--pdf")) + 1;
  if (index < cmd.length) {
    const spinner = createSpinner();
    spinner.start({ text: "Reading your file..." });
    let file = cmd[index];
    try {
      if (path.extname(file) !== ".pdf") {
        spinner.error({
          text: `${chalk.red(
            "Cannot read this file, it is not a PDF:"
          )} ${file}`,
        });
      } else {
        const filePath = path.resolve(file);
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdf(dataBuffer);
        material = `${question}\n\nContext of the question is:\n${data.text}`;
        spinner.success({ text: "File read successfully." });
      }
    } catch (error) {
      spinner.error({ text: `Error while reading the file: ${error}` });
      process.exit(1);
    }
  } else {
    console.log("Please provide a file path after the -p flag.");
    process.exit(1);
  }
  return material;
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
    "-p <pdf-file>"
  )}       Provide a PDF file to include its content as context
  ${chalk.cyan(
    "-i <image>"
  )}          Provide an image to include its text content as context
  ${chalk.cyan(
    "-c, --chat-mode"
  )}     Starts an context-based interactive chat window (type "exit" to exit)
  ${chalk.cyan(
    "-t, --terminal"
  )}      Based on the prompt, generates commands that directly executes in the terminal
  ${chalk.cyan(
    "-m, --mermaid"
  )}       Generates the workflow image for the provided content using mermaid
  ${chalk.cyan(
    "-s <limit>"
  )}          Searches your question on Stack Exchange, and provides the relevant links

${chalk.bold("Examples : ")}

  ${chalk.dim(`npx get-response "How is Python better than C++?"
  npx get-response "What is the function isRand() doing?" -f context.js
  npx get-response "Who is the writer of this book?" -p context.pdf
  npx get-response "How to import app.js within index.js?" -d contextDir
  npx get-response "Create a React app named get-response" -t
  npx get-response "How to solve IndexOutOfBounds Error in Java?" -s 3
  npx get-response -m -f index.js
  npx get-response -m -d ./src
  npx get-response -c
  npx get-response -c -f context.txt
  npx get-response -c -p context.pdf
  npx get-response -c -d contextDir
  npx get-response -c -i image.png`)}
  
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

async function imageContext(cmd) {
  let material = "";
  const index =
    (cmd.indexOf("-i") > cmd.indexOf("--image")
      ? cmd.indexOf("-i")
      : cmd.indexOf("--image")) + 1;
  if (index < cmd.length) {
    console.log(
      chalk.italic(
        `${chalk.red(
          "Note:"
        )} The image must have text content, for this to work properly.`
      )
    );
    const spinner = createSpinner();
    spinner.start({ text: " Extracting text from image..." });
    let imagePath = cmd[index];
    try {
      if (!fs.existsSync(imagePath))
        spinner.error(chalk.red(`Image file not found at path: ${imagePath}`));
      const result = await Tesseract.recognize(imagePath, "eng");
      material = `${question}\n\nThe question is asked based on the image, and the extracted text may contain some noise. The text extracted from the image is:\n${result.data.text}`;
      spinner.success({ text: " Text extracted successfully" });
    } catch (error) {
      spinner.error(chalk.red("Error during OCR processing:", error));
    }
  } else {
    console.log("Please provide an image path after the -i flag.");
    process.exit(1);
  }
  return material;
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

function stackMode() {
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
    input = line.trim();
    if (input.toLowerCase() === "exit" || input.toLowerCase() === "chat") {
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
      await interactiveStack(input);
      rl.prompt();
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
      chatMode(context);
    } else {
      console.log(chalk.red("Exiting chat mode."));
    }
  });
}

if (cmd.includes("-v") || cmd.includes("--version")) versionMsg(version);
else if (cmd.includes("-h") || cmd.includes("--help")) help();
else if (cmd.includes("-p") || cmd.includes("--pdf")) {
  if (cmd.includes("-c") || cmd.includes("--chat-mode"))
    chatMode(await pdfReader(cmd));
  else {
    question = await pdfReader(cmd);
    askPDF(question);
  }
} else if (cmd.includes("-i") || cmd.includes("--image")) {
  if (cmd.includes("-c") || cmd.includes("--chat-mode"))
    chatMode(await imageContext(cmd));
  else {
    question = await imageContext(cmd);
    askQuestion(question);
  }
} else if (cmd.includes("-f") || cmd.includes("--file")) {
  if (cmd.includes("-m") || cmd.includes("--mermaid")) {
    askMermaid(await fileContext(cmd));
  } else if (cmd.includes("-c") || cmd.includes("--chat-mode"))
    chatMode(await fileContext(cmd));
  else askQuestion(await fileContext(cmd));
} else if (cmd.includes("-d") || cmd.includes("--directory")) {
  if (cmd.includes("-m") || cmd.includes("--mermaid"))
    askMermaid(await directoryContext(cmd));
  else if (cmd.includes("-c") || cmd.includes("--chat-mode"))
    chatMode(await directoryContext(cmd));
  else askQuestion(await directoryContext(cmd));
} else if (cmd.includes("-s") || cmd.includes("--search-stack")) {
  if (question) {
    await ask(question);
    askStackExchange(question);
  } else console.log(chalk.red("Please provide a question!!"));
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
