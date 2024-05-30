# **Get Response** - A terminal-based AI chat-bot

Get-Response is a node.js based command-line interface (CLI) created by [Swapnoneel Saha](https://x.com/swapnoneel123) tool that interacts with the Google's Gemini API to generate content based on the user input. This tool allows you to ask questions directly or provide context from files or directories, and get the response in a simple and easy to understand interface. Also, you can automate some terminal commands by prompting for the task. And additionally, we also have support for responses from Stack Exchange sites like [Stack Overflow](https://stackoverflow.com)

## Installation

To install this package, you need to have node.js and npm installed in your machine. If you don't have them installed, you can refer to this [article](https://swapnoneel.hashnode.dev/nodejs-npm-nvm). Once that's done, you can install the package globally by using this command in your terminal:

```sh
npm i get-response -g
```

## Usage

### Simple Usage

To ask a question directly from the command line (context is not stored for further questions):

```sh
npx get-response "<Ask your question>"
```

### Using a File as the Context

To provide additional context about your question, you can use the `-f` or `--file` flag followed by the file path:

```sh
npx get-response "<Ask your question>" -f ./path/to/your/file.js
```

### Using a PDF as the Context

To provide additional context about your question, you can use the `-p` or `--pdf` flag followed by the file path:

```sh
npx get-response "<Ask your question>" -p ./path/to/your/pdf.pdf
```

### Using a Directory as the Context

To provide additional context about your question, you can use the `-d` or `--directory` flag followed by the name of the directory:

```sh
npx get-response "<Ask your question>" -d ./path/to/your/directory
```

### Chat Mode

In the context-based chat mode, you can ask multiple questions in a session:

```sh
npx get-response -c
```

Alternatively, you can also use:

```sh
npx get-response --chat-mode
```

In the chat mode, the prompt `Type your message: ` will appear, indicating that the tool is ready for you to type your question or command.

To exit the chat mode, type `exit` and press Enter.

Also, you can use the chat mode in association with the file, directory and PDF file as the context, using the -f, -d and -p flags respectively.

### Terminal Mode

In the terminal mode, you can ask the AI to perform some specific actions and it will automatically execute the commands in your terminal based on your permission:

```sh
npx get-response "<Mention your task>" -t
```

Alternatively, you can also use:

```sh
npx get-response "<Mention your task>" --terminal
```

### Get Response from Stack Exchange

You can also ask a question to Stack Exchange and get the response based on the most relevant conversations based on that topic, also you can limit the number of links that you want to see from the response.

```sh
npx get-response "Mention your question/problem" -s "maximum number of links"
```

Alternatively, you can also use:

```sh
npx get-response "Mention your question/problem" --search-stack "maximum number of links"
```

Other than this, we also have a Stack Exchange interface in the live chat mode, and you can switch to it whenever you want by typing `stack` as a response, while you are on the chat mode. And you will be able to have a conversation with the StackAI. To switch back to the AI chat mode, you can simply type `chat` as a response, and you'll be back on the interactive chat mode with the context of the previous interactions of the current session!

## Example

### Asking a Simple Question

```sh
npx get-response "What is the currency of South Africa?"
```

### Asking a Question with File Context

```sh
npx get-response "Tell me, what is the function of the variable named toggleMode" -f ./index.js
```

Alternatively, you can also use:

```sh
npx get-response "Tell me, what is the function of the variable named toggleMode" --file ./index.js
```

### Asking a Question with PDF Context

```sh
npx get-response "What is the summary of the story" -p ./sample.pdf
```

Alternatively, you can also use:

```sh
npx get-response "What is the summary of the story" --pdf ./sample.pdf
```

### Asking a Question with Directory Context

```sh
npx get-response "Write unit test cases for each of the functions" -d ./sample-app
```

Alternatively, you can also use:

```sh
npx get-response "Write unit test cases for each of the functions" --directory ./sample-app
```

### Entering the Chat Mode with a File, Directory or PDF Context

```sh
npx get-response -c -f ./index.js
```

Or,

```sh
npx get-response -c -d ./sample-app
```

Or,

```sh
npx get-response -c -p ./sample.pdf
```

### Asking to Create a React Application

```sh
npx get-response "Create a React application named get-response" -t
```

Or,

```sh
npx get-response "Create a directory named 'hello' and a text file named 'hi' inside it" --terminal
```

### Asking for the solution to a problem from Stack Exchange

```sh
npx get-response "How to shutdown a PC from the terminal?" -s 3
```

Or,

```sh
npx get-response "How to copy a file from one directory to another?" --search-stack 10
```

## Contributing

If you want to contribute to this project, please go ahead!! Open an issue or submit a pull request for any improvements, bug fixes or feature implementations.

## Bug Reporting

For any questions, suggestions or issues, please open an issue in the GitHub repository.
