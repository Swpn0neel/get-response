import { createSpinner } from "nanospinner";
import chalk from "chalk";
import boxen from "boxen";
import { genAI } from "../utils/config.js";
import { textFormat } from "../utils/formatter.js";

/**
 * Generates an answer using Gemini AI.
 * @param {string} question - The user's question.
 */
export async function ask(question) {
  const spinner = createSpinner();
  spinner.start({ text: " Generating your answer..." });
  if (question) {
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
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

/**
 * Generates interactive content for chat mode.
 * @param {string} question - User question.
 * @param {string} context - Previous context.
 * @returns {string} - Updated context.
 */
export async function interactive(question, context) {
  if (question) {
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
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
    // Note: spinner is not defined in this scope in original index.js, but it's likely meant to be a warning
    console.warn(chalk.gray(" Please ask a question to get an answer!!"));
    process.exit(1);
  }
}

/**
 * Handles PDF-based questions.
 * @param {string} question - Question with PDF context.
 */
export async function askPDF(question) {
  const spinner = createSpinner();
  spinner.start({ text: " Generating your answer..." });
  if (question) {
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
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
