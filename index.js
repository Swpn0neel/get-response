#!/usr/bin/env node

const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

// const geminiApiKey = process.env.API_KEY;
const methane = "AIzaSyD";
const propane = "Addtjtj";
const butane = "bfXQSrGrhyqGPGq";
const xenon = "XFPL5kqQoVD";
const chlorine = "Re918d";
const radon = "n9XI";
const butene = "zsrh";
const oxygen = butene + "-" + propane + "_" + butane + radon;
const helium = methane + "_" + xenon + butane + "_" + radon;
const propyne = butene + "-" + propane + "_" + chlorine + "_" + propane;
if (!helium) {
  console.error("Please provide an API_KEY");
  process.exit(1);
}
const genAI = new GoogleGenerativeAI(helium);

async function ask(question) {
  if (question) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(question);
      const response = result.response;
      const text = response.text();
      console.log(text);
    } catch (error) {
      console.error("Error generating content:", error);
    }
  } else {
    console.log("You must enter in prompt when calling this function");
  }
}

const question = process.argv.slice(2).join(" ");

if (question) {
  ask(question);
} else {
  console.log("Please ask a question!");
}
