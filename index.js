const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const geminiApiKey = process.env.API_KEY;
const googleAI = new GoogleGenerativeAI(geminiApiKey);

const geminiConfig = {
  temperature: 0.9, // Controls randomness in the response (0 - 1)
  topP: 1, // Probability weighting for likely tokens
  topK: 1, // Encourages diverse responses
  maxOutputTokens: 4096, // Maximum number of tokens in the response
};

const geminiModel = googleAI.getGenerativeModel({
  model: "gemini-pro", // Specify the Gemini model (can be changed)
  geminiConfig,
});

async function answerQuestion(question) {
  try {
    const response = await geminiModel.generateText({
      prompt: question,
    });
    console.log(response.text);
  } catch (error) {
    console.error("Error:", error);
  }
}

// Get user input from terminal (replace with actual implementation)
const question = process.argv[2];

if (question) {
  answerQuestion(question);
} else {
  console.log("Please ask a question!");
}
