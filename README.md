# **Get Response-Lite** : Terminal-based AI assistant

Get Response Lite is a node.js based command-line interface (CLI) created by [Swapnoneel Saha](https://x.com/swapnoneel123) tool that interacts with the Google's Gemini API to generate content based on the user input. This tool allows you to ask questions directly or provide context from files, images or directories, and get the response in a simple and easy to understand interface. Also, you can automate some terminal commands by prompting for the task

It's the lighter version of my NPM package [Get-Response](https://www.npmjs.com/package/get-response), which includes more features, but is a bit bulky to download and install; and has more performance load!

## Installation

To install this package, you need to have node.js and npm installed in your machine. If you don't have them installed, you can refer to this [article](https://swapnoneel.hashnode.dev/nodejs-npm-nvm). Once that's done, you can install the package globally by using this command in your terminal:

```sh
npm i get-response-lite -g
```

## Usage

### Simple Usage

To ask a question directly from the command line (context is not stored for further questions):

```sh
npx ai "<Ask your question>"
```

### Using a File as the Context

To provide additional context about your question, you can use the `-f` or `--file` flag followed by the file path:

```sh
npx ai "<Ask your question>" -f ./path/to/your/file.js
```

### Using a Directory as the Context

To provide additional context about your question, you can use the `-d` or `--directory` flag followed by the name of the directory:

```sh
npx ai "<Ask your question>" -d ./path/to/your/directory
```

### Chat Mode

In the context-based chat mode, you can ask multiple questions in a session:

```sh
npx ai -c
```

In the chat mode, the prompt `Type your message: ` will appear, indicating that the tool is ready for you to type your question or command.

To exit the chat mode, type `exit` and press Enter.

Also, you can use the chat mode in association with the file and directory as the context, using the -f and -d flags respectively.

### Terminal Mode

In the terminal mode, you can ask the AI to perform some specific actions and it will automatically execute the commands in your terminal based on your permission:

```sh
npx ai "<Mention your task>" -t
```

## Example

### Asking a Simple Question

```sh
npx ai "What is the currency of South Africa?"
```

### Asking a Question with File Context

```sh
npx ai "Tell me, what is the function of the variable named toggleMode" -f ./index.js
```

Alternatively, you can also use:

```sh
npx ai "Tell me, what is the function of the variable named toggleMode" --file ./index.js
```

### Asking a Question with Directory Context

```sh
npx ai "Write unit test cases for each of the functions" -d ./sample-app
```

### Entering the Chat Mode with a File or Directory as Context

```sh
npx ai -c -f ./index.js
```

Or,

```sh
npx ai -c -d ./sample-app
```

### Asking to Create a React Application

```sh
npx ai "Create a React application named get-response" -t
```

## Contributing

If you want to contribute to this project, please go ahead!! Open an issue or submit a pull request for any improvements, bug fixes or feature implementations in the main repository of [Get Response](https://github.com/Swpn0neel/get-response).

## Bug Reporting

For any questions, suggestions or issues, please open an issue in the GitHub repository.
