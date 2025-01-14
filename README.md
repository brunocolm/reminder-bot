# Reminder Bot

A simple reminder bot built using JavaScript, currently integrated with Telegram and powered by Wit.ai for natural language processing. The bot helps users set reminders and manage tasks through chat interactions.

## Features

- **Set Reminders**: Users can set reminders through natural language input.
- **Messaging Integration**: The bot is currently integrated with Telegram, allowing users to interact via Telegram chats. Easily adaptable to other messaging services as well.
- **Natural Language Processing (NLP)**: The bot currently utilizes Wit.ai to analyze and process user input to understand reminder requests. It can be adaptable for other processing services.
- **Reminder Notifications**: The bot sends notifications when a reminder is due.

## Technologies Used

- **Node.js**: JavaScript runtime environment.
- **Telegram Bot API**: For bot interaction in Telegram.
- **Wit.ai**: Natural language processing to analyze user input.
- **Jest**: For writing and running tests.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/reminder-bot.git
   cd reminder-bot

2. Install dependencies:

    ```bash
    npm install

3. Get tokens

    Telegram: [BotFather](https://telegram.me/BotFather)
    
    [Wit.ai](https://wit.ai/)

4. Create a .env file in the root directory and add tokens like shown in .env.example 

## Run tests

To run the tests:

   ```bash
   npx jest

## Still in development...