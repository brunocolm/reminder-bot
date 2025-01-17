import { Request, Response } from "express";
import { validateMessageBody, processReminderMessage } from "../utils/handlers"


export const createReminder = async (req: Request, res: Response): Promise<any> => {
  try {
    const validationError = validateMessageBody(req.body);

    if (validationError) {
      return res.status(400).send(validationError);
    }

    const { text, chat } = req.body.message;
    const reminderResponse = processReminderMessage(chat.id, text);
    return res.send(reminderResponse);
  } catch (error) {
    console.error("Error in POST request:", error);
    return res.status(500).send("Internal Server Error");
  }
};
