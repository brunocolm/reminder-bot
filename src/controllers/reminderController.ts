import { Request, Response } from "express";
import { awaitingResponseUser, handleCommand } from "../utils/commands.js";
import { validateMessageBody, processReminderMessage, sendErrorMessage } from "../utils/handlers.js"

export const readTelegramMessage = async (req: Request, res: Response): Promise<any> => {
  try {
    const validationError = validateMessageBody(req.body);
    if (validationError) {
      const { chat: { id: chatId } } = req.body.message;
      return sendErrorMessage(chatId, validationError, res);
    }
    console.log("*******Message valid******")
    const { text, chat: { id: chatId } } = req.body.message;
    console.log("Message: ", req.body.message)

    //If bot is waiting a response, this will indicate which command
    const completionCommand = awaitingResponseUser[chatId]

    let processedText;
    if (completionCommand && text[0] !== "/") {
      processedText = `${completionCommand} ${text}`;
    } else {
      processedText = text
    }

    if (processedText[0] === "/") {
      console.log("Command detected: ", text)
      return handleCommand(processedText, chatId, res)
    } else {
      const reminderResponse = processReminderMessage(chatId, text);
      return res.send(reminderResponse);
    }
  } catch (error) {
    const { chat: { id: chatId } } = req.body.message;
    const reqError = "Error in POST request"
    return sendErrorMessage(chatId, reqError, res, 500);
  }
};
