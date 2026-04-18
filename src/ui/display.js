import chalk from "chalk";
import boxen from "boxen";

/**
 * Displays the help message.
 */
export function help() {
  const helpText = `
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
  const helpMsg = boxen(helpText, {
    padding: 1,
    title: "Welcome",
    titleAlignment: "center",
    borderStyle: "double",
    borderColor: "green",
  });
  console.log(helpMsg);
}

/**
 * Displays the current version and update instructions.
 * @param {string} currentVersion - The version of the app.
 */
export function versionMsg(currentVersion) {
  console.log(`
${chalk.bold("Installed version of")} ${chalk.bold.cyan(
    "get-response"
  )} ${chalk.bold("is:")} ${chalk.yellow.bold(currentVersion)}
  
To update to the latest version, run ${chalk.cyan(
    "npm i get-response -g"
  )} in your terminal!!`);
}
