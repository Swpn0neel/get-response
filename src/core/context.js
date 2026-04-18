import fs from "fs";
import path from "path";
import chalk from "chalk";
import pdf from "pdf-parse-fork";
import Tesseract from "tesseract.js";
import { createSpinner } from "nanospinner";
import { isSkippable } from "../utils/helpers.js";

/**
 * Reads a PDF file and extracts its text.
 * @param {string[]} cmdArgs - Command line arguments to find the file path.
 * @param {string} question - The user's question.
 * @returns {Promise<string>} - The question combined with the PDF content.
 */
export async function pdfReader(cmdArgs, question) {
  let material = "";
  const index =
    (cmdArgs.indexOf("-p") > cmdArgs.indexOf("--pdf")
      ? cmdArgs.indexOf("-p")
      : cmdArgs.indexOf("--pdf")) + 1;
  if (index < cmdArgs.length) {
    const spinner = createSpinner();
    spinner.start({ text: "Reading your file..." });
    let file = cmdArgs[index];
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

/**
 * Extracts text from an image using OCR.
 * @param {string[]} cmdArgs - Command line arguments.
 * @param {string} question - User's question.
 * @returns {Promise<string>} - Extracted context.
 */
export async function imageContext(cmdArgs, question) {
  let material = "";
  const index =
    (cmdArgs.indexOf("-i") > cmdArgs.indexOf("--image")
      ? cmdArgs.indexOf("-i")
      : cmdArgs.indexOf("--image")) + 1;
  if (index < cmdArgs.length) {
    console.log(
      chalk.italic(
        `${chalk.red(
          "Note:"
          )} The image must have text content, for this to work properly.`
      )
    );
    const spinner = createSpinner();
    spinner.start({ text: " Extracting text from image..." });
    let imagePath = cmdArgs[index];
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

/**
 * Reads a single file's content as context.
 * @param {string[]} cmdArgs - Command line arguments.
 * @param {string} question - User's question.
 * @returns {Promise<string>} - File content context.
 */
export async function fileContext(cmdArgs, question) {
  let material = "";
  const index =
    (cmdArgs.indexOf("-f") > cmdArgs.indexOf("--file")
      ? cmdArgs.indexOf("-f")
      : cmdArgs.indexOf("--file")) + 1;
  if (index < cmdArgs.length) {
    const spinner = createSpinner();
    spinner.start({ text: "Reading your file..." });
    let file = cmdArgs[index];
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

/**
 * Reads files recursively within a directory as context.
 */
export async function directoryContext(cmdArgs, question) {
  let material = "";
  const index =
    (cmdArgs.indexOf("-d") > cmdArgs.indexOf("--directory")
      ? cmdArgs.indexOf("-d")
      : cmdArgs.indexOf("--directory")) + 1;
  if (index < cmdArgs.length) {
    const spinner = createSpinner();
    spinner.start({ text: "Reading each file from your directory..." });
    let dir = cmdArgs[index];
    let content = "";
    
    const readFilesRecursively = async (directory) => {
      const files = fs.readdirSync(path.resolve(directory));
      for (const file of files) {
        const filePath = path.join(directory, file);
        if (fs.lstatSync(filePath).isDirectory() && !(await isSkippable(filePath))) {
          await readFilesRecursively(filePath);
        } else {
          if (await isSkippable(filePath)) {
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
      }
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
