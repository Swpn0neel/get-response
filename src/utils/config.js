import { GoogleGenerativeAI } from "@google/generative-ai";

export const version = "1.10.2";

const key = "QUl6YVN5RDRLdUdUMjJhQ0VYWlNpOFhDdER3b1BibGI0eUMwQmo4adLcBr3vALjgTkhYOG3Dzw((";

export const geminiKey = Buffer.from(key.substring(0, 52), "base64").toString("utf-8");
export const stackExchangeKey = key.substring(52);

export const genAI = new GoogleGenerativeAI(geminiKey);
