import axios from "axios";
import chalk from "chalk";
import boxen from "boxen";
import { createSpinner } from "nanospinner";
import { stackExchangeKey } from "../utils/config.js";

const apiUrl = "https://api.stackexchange.com/2.3/search/advanced";

export const stackExchangeSites = [
  "stackoverflow",
  "serverfault",
  "superuser",
  "askubuntu",
  "math",
  "unix",
  "datascience",
  "codereview",
];

/**
 * Searches Stack Exchange sites for a question.
 * @param {string} question - Query string.
 * @returns {Promise<string[]>} - List of relevant links.
 */
export async function searchStackExchange(question) {
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
      key: stackExchangeKey,
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

/**
 * Orchestrates a Stack Exchange search and displays results.
 * @param {string} question - The question to search.
 * @param {string[]} cmdArgs - Command line arguments to check for limit.
 */
export async function askStackExchange(question, cmdArgs) {
  const index =
    (cmdArgs.indexOf("-s") > cmdArgs.indexOf("--search-stack")
      ? cmdArgs.indexOf("-s")
      : cmdArgs.indexOf("--search-stack")) + 1;
  const limit = index < cmdArgs.length ? parseInt(cmdArgs[index], 10) : 5;
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

/**
 * Interactive version of Stack Exchange search for chat mode.
 * @param {string} question - The question to search.
 */
export async function interactiveStack(question) {
  const links = [];
  for (const site of stackExchangeSites) {
    const params = {
      order: "desc",
      sort: "relevance",
      q: question,
      site: site,
      key: stackExchangeKey,
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
