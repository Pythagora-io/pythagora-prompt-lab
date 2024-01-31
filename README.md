# Prompt Engineering App

## Overview

Prompt Engineering is a web application designed to interact with and analyze responses from the OpenAI API. Users can construct a dialogue with an AI large language model (LLM) and submit this dialogue for processing. The app then sends the dialogue to the OpenAI API multiple times in parallel, depending on the user's input, and streams the results back in real-time.

## Features

- Interactive interface to construct dialogues between a user and an assistant.
- Capability to add infinite message items dynamically.
- Option to determine the roles of messages as either from the user or assistant.
- Submit the dialogue for concurrent processing a specified number of times (0-100).
- Real-time streaming and display of responses from the OpenAI API.

## Installation

Before installing, ensure Node.js is installed on your system.

To install the app, follow these steps:

1. Clone the repository to your local machine.
2. Install dependencies by running `npm install` in the project root directory.
3. Start the server with `npm start`. The application will be served at `http://localhost:3000`.

## Configuration

Create a `.env` file in the root directory with the following format:

```
OPENAI_API_KEY=your-actual-openai-api-key
MONGODB_URI=mongodb://localhost:27017/prompt_engineering
```

Replace `your-actual-openai-api-key` with your OpenAI API key. Ensure that MongoDB is running and accessible at the URI provided.

## Usage

Access the web interface to construct your dialogue. Input your dialogue as a series of messages and assign roles to each message. Specify the number of times the dialogue should be sent to the OpenAI API and hit the 'SUBMIT' button to initiate the process. The responses will appear as expandable elements in real-time as they are streamed back from the API.

## Technologies

- Node.js
- Express
- Socket.IO for real-time communication.
- MongoDB for storing dialogues.
- Tailwind CSS for styling.

## Testing

Run `npm test` to execute the test suites included in the project.

## Contributions

Contributions to the project are welcome. Please ensure you write tests for new features and run existing tests before making a pull request.

## License

This project is licensed under the ISC License - see the LICENSE file for details.