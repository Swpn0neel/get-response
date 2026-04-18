import chalk from "chalk";
import boxen from "boxen";

/**
 * Formats AI response text with styling and boxed code blocks.
 * @param {string} text - The raw text from the AI.
 * @returns {string} - Styled and formatted output.
 */
export function textFormat(text) {
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
