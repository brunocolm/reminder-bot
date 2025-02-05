import { Request, Response } from "express";
import { awaitingResponseUser, handleCommand } from "../utils/commands.js";
import { processReminderMessage, sendErrorMessage, getMessageType, MessageType } from "../utils/handlers.js"

export const readTelegramMessage = async (req: Request, res: Response): Promise<any> => {
  try {
    console.log("The request body received is:")
    console.log(JSON.stringify(req?.body))
    const messageType = getMessageType(req.body);

    console.log(`*******Message type:${messageType} ******`)

    switch (messageType) {
      case MessageType.INVALID:
        {
          const { chat: { id: chatId } } = req?.body?.message || req?.body?.callback_query?.message;
          const errMsg = "Data is not valid"
          return sendErrorMessage(chatId, errMsg, res);
        }
      case MessageType.TEXT:
        {
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
        }
      case MessageType.BUTTON_RESPONSE:
        {
          const { chat: { id: chatId } } = req.body.callback_query.message;
          console.log("Message: ", req.body.callback_query.message)
          const buttonIndex = req?.body?.callback_query?.message?.reply_markup?.inline_keyboard[0][0].text
          return handleCommand(`/c ${buttonIndex}`, chatId, res)
        }

      default:
        break;
    }


  } catch (error) {
    const { chat: { id: chatId } } = req.body.message;
    const reqError = "Error in POST request"
    return sendErrorMessage(chatId, reqError, res);
  }
};