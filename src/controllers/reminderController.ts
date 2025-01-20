import { Request, Response } from "express";
import { validateMessageBody, processReminderMessage } from "../utils/handlers.js"


export const createReminder = async (req: Request, res: Response): Promise<any> => {
  console.log("Create reminder request body: ", req.body)
  try {
    const validationError = validateMessageBody(req.body);

    if (validationError) {
      return res.status(400).send(validationError);
    }

    const { text, chat } = req.body.message;
    console.log("Text: ", text)
    console.log("Chat: ", chat)
    const reminderResponse = await processReminderMessage(chat.id, text);
    console.log("Reminder response: ", reminderResponse)
    return res.send(reminderResponse);
  } catch (error:any) {
    console.log("Error in create reminder:", error.message);
    return res.status(500).send("Internal Server Error");
  }
};
