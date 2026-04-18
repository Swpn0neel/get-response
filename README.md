# **Get Response** - A Terminal-Based AI Powerhouse 🚀

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![Gemini 2.5 Flash](https://img.shields.io/badge/AI-Gemini%202.5%20Flash-blue.svg)](https://deepmind.google/technologies/gemini/)

**Get-Response** is a cutting-edge, modular CLI tool designed by [Swapnoneel Saha](https://x.com/swapnoneel123) that brings the power of **Google's Gemini** directly to your terminal. It's more than just a chatbot; it's a productivity suite for developers, allowing you to interact with your codebase, documents, images, and even automate terminal tasks through natural language.


> [!TIP]
> **Looking for something lighter?** Check out [**get-response-lite**](https://github.com/Swpn0neel/get-response-lite), a stripped-down version that focuses only on the essential AI chat features for a zero-weight footprint. Available on [NPM](https://www.npmjs.com/package/get-response-lite).

---

## 🌟 Key Features

- **🚀 Gemini Integration**: Leverages the latest, high-speed model for near-instant responses.
- **📂 Context-Aware Interaction**: Provide context through single files, entire directories, PDFs, or images (via OCR).
- **📟 Terminal Automation**: Describe a task (e.g., "Create a React app") and the AI will generate and execute the necessary commands with your permission.
- **📚 Stack Exchange Integration**: Search across Stack Overflow and other Stack Exchange sites directly from the CLI.
- **🖼️ Mermaid Workflow Generation**: Automatically generate and render workflow diagrams for your codebase.
- **💬 Interactive Modes**: Seamlessly switch between AI chat mode and Stack Exchange research mode while maintaining session context.
- **💅 Beautiful UI**: Rich, styled terminal output using `chalk`, `boxen`, and real-time status spinners.

---

## 🏗️ Architecture

The project follows a modular, functional architecture designed for high maintainability and clarity.

### Directory Structure

```text
get-response/
├── index.js                # Main entry point and CLI orchestrator
├── package.json            # Project dependencies and script definitions
├── src/                    # Core source code
│   ├── core/               # Critical logic for data gathering and flow
│   │   ├── chat.js         # Interactive Chat & Stack mode management
│   │   └── context.js      # File, PDF, Image, and Directory reading logic
│   ├── services/           # External API & Tool integrations
│   │   ├── ai.js           # Google Gemini AI implementation
│   │   ├── stack.js        # Stack Exchange API wrapper
│   │   ├── terminal.js     # Command generation and execution engine
│   │   └── mermaid.js      # Mermaid diagram generation logic
│   ├── ui/                 # Visual components and templates
│   │   └── display.js      # Help messages, banners, and version info
│   └── utils/              # Generic utilities and configuration
│       ├── config.js       # API keys and project constants
│       ├── formatter.js    # AI response styling and code-block boxing
│       └── helpers.js      # OS detection, update checks, and sanitization
└── node_modules/           # External dependencies
```

### Module Breakdown

- **`index.js`**: The thin entry layer that parses command-line arguments using `process.argv` and routes them to the appropriate core or service module.
- **`src/services/ai.js`**: Managed by the `GoogleGenerativeAI` client, it handles prompt engineering and content generation using the `gemini-2.5-flash` model.
- **`src/core/context.js`**: Uses `pdf-parse-fork` for document ingestion and `tesseract.js` for OCR text extraction from images.
- **`src/services/terminal.js`**: A bridge between AI-generated commands and the system shell, implementing a safety-first "Request Permission" loop before execution.

---

## 💻 Installation

Ensure you have **Node.js (>=18.0.0)** installed.

```sh
npm i get-response -g
```

> [!TIP]
> You can also run it without permanent installation using `npx get-response`.

---

## 🚀 Usage

### Simple Question
```sh
npx get-response "How do I reverse a linked list in Python?"
```

### Contextual Knowledge
| Input Type | Flag | Example |
| :--- | :--- | :--- |
| **File** | `-f` | `npx get-response "Explain this code" -f ./auth.js` |
| **Directory** | `-d` | `npx get-response "Find bugs in this project" -d ./src` |
| **PDF** | `-p` | `npx get-response "Summarize this paper" -p ./research.pdf` |
| **Image**| `-i` | `npx get-response "What does this error message mean?" -i ./screenshot.png` |

### Interactive Chat Mode
Enter a persistent session where context is remembered across multiple questions:
```sh
npx get-response -c
```
*   Type `stack` within chat mode to jump to Stack Exchange research.
*   Type `chat` within stack mode to return with your context intact.

### Terminal Automation
```sh
npx get-response "Initialize a git repo and add a basic .gitignore" -t
```

### Mermaid Diagram Generation
Generate a visual workflow of your codebase:
```sh
npx get-response -m -d ./src
```

---

## 🏎️ Full vs. Lite Version

| Feature | Get-Response (Full) | Get-Response-Lite |
| :--- | :---: | :---: |
| **Gemini AI Chat** | ✅ | ✅ |
| **File Context** | ✅ | ✅ |
| **Directory Context**| ✅ | ✅ |
| **OCR (Images)** | ✅ | ❌ |
| **PDF Parsing** | ✅ | ❌ |
| **Terminal Automation**| ✅ | ✅ |
| **Mermaid Diagrams** | ✅ | ❌ |
| **Stack Exchange** | ✅ | ❌ |

If you only need core AI interactions without the extra toolset, we recommend [**get-response-lite**](https://www.npmjs.com/package/get-response-lite).

---

## 🛠️ Tech Stack

- **AI Engine**: [Google Gemini 2.5 Flash](https://deepmind.google/technologies/gemini/)
- **Runtime**: [Node.js](https://nodejs.org/)
- **Networking**: [Axios](https://axios-http.com/)
- **OCR**: [Tesseract.js](https://tesseract.projectnaptha.com/)
- **PDF Parsing**: `pdf-parse-fork`
- **CLI Aesthetics**: `chalk`, `boxen`, `nanospinner`
- **Diagrams**: `mermaid-cli`

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 🐛 Support & Bug Reporting

For any questions, suggestions, or issues, please [open an issue](https://github.com/Swpn0neel/get-response/issues) in the GitHub repository.

**Follow the creator:** 
[![Twitter Follow](https://img.shields.io/twitter/follow/swapnoneel123?style=social)](https://twitter.com/swapnoneel123)

---
*Created with ❤️ by Swapnoneel Saha*
