# **Get Response** - A terminal-based AI chat-bot

Get-Response is a node.js based command-line interface (CLI) tool that interacts with the Google's Gemini API to generate content based on the user input. This tool allows you to ask questions directly or provide context from files or directories, and get the response in a simple and easy to understand manner.

## Installation

To install this package, you need to have node.js and npm installed in your machine. You can install the package globally using npx:

```sh
npx get-response
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

### Using a Directory as the Context

To provide additional context about your question, you can use the `-d` or `--directory` flag followed by the name of the directory:

```sh
npx get-response "<Ask your question>" -d ./path/to/your/directory
```

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

### Asking a Question with Directory Context

```sh
npx get-response "Write unit test cases for each of the functions" -d ./sample-app
```

Alternatively, you can also use:

```sh
npx get-response "Write unit test cases for each of the functions" --directory ./sample-app
```

## Contributing

If you want to contribute to this project, please go ahead!! Open an issue or submit a pull request for any improvements, bug fixes or feature implementations.

## Bug Reporting

For any questions, suggestions or issues, please open an issue in the GitHub repository.
