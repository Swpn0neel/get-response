import { exec } from "child_process";
import readline from "readline";
import chalk from "chalk";
import { createSpinner } from "nanospinner";
import { genAI } from "../utils/config.js";
import { getOS } from "../utils/helpers.js";

/**
 * Generates and executes terminal commands based on a question.
 * @param {string} question - Description of what the user wants to do.
 */
export async function askTerminal(question) {
  const spinner = createSpinner();
  const os = await getOS();
  spinner.start({ text: " Fetching the terminal commands..." });
  if (question) {
    const prompt = `Write the terminal commands to ${question}, exactly for ${os} Operating System. Just write the commands in simple text, without any explanation, decoration or formatting.`;
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      spinner.success({ text: " Got the terminal commands" });
      const terminalCommands = text.split("\n").filter(cmd => cmd.trim() !== "");
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

/**
 * Orchestrates execution of multiple commands with user confirmation.
 * @param {string[]} queue - List of commands to execute.
 */
export async function executeCommands(queue) {
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

/**
 * Executes a single command.
 * @param {string} command - Command to run.
 * @param {object} spinner - Spinner instance.
 * @returns {Promise<void>}
 */
export function executeCommand(command, spinner) {
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

/**
 * Asks the user for permission to run a command.
 * @param {string} query - Question prompt.
 * @returns {Promise<string>} - User's answer.
 */
export function requestPermission(query) {
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
