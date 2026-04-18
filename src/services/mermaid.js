import fs from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { exec } from "child_process";
import { promisify } from "util";
import { createSpinner } from "nanospinner";
import chalk from "chalk";
import { genAI } from "../utils/config.js";
import { generateRandomString } from "../utils/helpers.js";

const execPromise = promisify(exec);

/**
 * Generates an image from Mermaid code.
 * @param {string} mermaidCode - The mermaid code.
 */
export async function mermaidImageGen(mermaidCode) {
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

/**
 * Generates Mermaid code for a given material and then generates an image.
 * @param {string} material - Material for workflow generation.
 * @param {string} initialQuestion - The initial question provided by the user.
 */
export async function askMermaid(material, initialQuestion) {
  const spinner = createSpinner();
  spinner.start({ text: " Generating the mermaid code..." });
  const prompt = `Instructions for the generated response:\nDON'T USE MARKDOWN FORMATTING. Use SIMPLE TEXT, without any explanation, DECORATION or FORMATTING.\n\nQuestion:\nGenerate the mermaid code for the whole codebase.\n\n${material}`;
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });
    const result = await model.generateContent(prompt);
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
