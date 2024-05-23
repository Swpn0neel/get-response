#!/usr/bin/env node

import { GoogleGenerativeAI } from "@google/generative-ai";
import path from "path";
import fs from "fs";
import chalk from "chalk";
import boxen from "boxen";
import { createSpinner } from "nanospinner";

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

  console.log(output);
}

const key = "AIzaSyD__oeJEDBzUPfeDDLBkU9nOomdyeYkUQs";

if (!key) {
  console.error(chalk.red("Incorrect API_KEY"));
  process.exit(1);
}
const genAI = new GoogleGenerativeAI(key);

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
      textFormat(text);
      process.exit(0);
    } catch (error) {
      spinner.error({ text: " Unexpected error while generating content" });
      process.exit(1);
    }
  } else {
    spinner.warn({
      text: " Please ask a question to get an answer!!",
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
      !exec.startsWith("./")
  )
  .join(" ");
const pathCmd = cmd.filter(
  (exec) =>
    typeof exec === "string" && (exec.startsWith("./") || exec.includes("\\"))
);
if (
  pathCmd.length > 0 &&
  !cmd.includes("-f") &&
  !cmd.includes("-d") &&
  !cmd.includes("--file") &&
  !cmd.includes("--directory")
) {
  console.error(
    "Error: Please use the -f flag for file paths or the -d flag for directory paths."
  );
  process.exit(1);
}

function isSkippable(file) {
  const stats = fs.statSync(file);
  const maxSize = 1024 * 1024;
  const largeFile = [".log", ".zip", ".tar", ".rar", ".gz", ".7z"];
  const largeDirectory = [
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
  return (
    stats.size > maxSize ||
    largeFile.includes(extension) ||
    largeDirectory.includes(name)
  );
}

if (cmd.includes("-f") || cmd.includes("--file")) {
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
        question = `${question}\n\nContext of the question is:\n${content}`;
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
}

if (cmd.includes("-d") || cmd.includes("--directory")) {
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
        if (fs.lstatSync(filePath).isDirectory()) {
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
            content += `\n\nContext from ${filePath}:\n${fileContent}`;
          }
        }
      });
    };

    try {
      readFilesRecursively(dir);
      spinner.success({ text: "Completed reading files from the directory" });
      question = `${question}\n\nContext of the question is:\n${content}`;
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
}

if (!question) console.log("Kindly ask a question to get an answer!!");
else ask(question);
