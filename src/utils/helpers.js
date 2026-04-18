import fs from "fs";
import path from "path";
import chalk from "chalk";
import latestVersion from "latest-version";
import { version } from "./config.js";

/**
 * Checks for updates to the get-response package.
 */
export const isUpdated = async () => {
  try {
    const latest = await latestVersion("get-response");
    if (latest !== version) {
      console.log(
        `A new version of get-response is available: ${chalk.yellow(
          latest
        )}. You are using version: ${chalk.red(
          version
        )}.\n\nTo update, run: ${chalk.yellow(`npm i get-response -g`)}`
      );
    }
  } catch (error) {
    console.error(chalk.red("Network error while checking for updates"));
  }
};

/**
 * Generates a random alphanumeric string.
 * @param {number} length - Desired length.
 * @returns {string} - Random string.
 */
export function generateRandomString(length) {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }
  return result;
}

/**
 * Detects the Operating System.
 * @returns {string|null} - OS name or null.
 */
export function getOS() {
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

/**
 * Determines if a file or directory should be skipped based on size or name.
 * @param {string} file - Path to the file or directory.
 * @returns {boolean} - True if it should be skipped.
 */
export async function isSkippable(file) {
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
