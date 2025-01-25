import { Request, Response } from "express";
import { completeReminder, readAllReminders, sendMessage } from "../middleware/index.js";
import { validateMessageBody, processReminderMessage, parseDate } from "../utils/handlers.js"


export const readTelegramMessage = async (req: Request, res: Response): Promise<any> => {
  try {
    const validationError = validateMessageBody(req.body);

    if (validationError) {
      return res.status(400).send(validationError);
    }
    const { text, chat: { id: chatId } } = req.body.message;

    if (text[0] === "/") {
      const allReminders = await readAllReminders();
      if (text.substring(1, 4) === "all") {
        const allRemindersMessage = `Your reminders are: ${allReminders.map((reminder, index) => `\n${index + 1}. ${reminder.reminder}: ${parseDate(reminder.date)}`)}`;
        sendMessage(chatId, allRemindersMessage)
        return res.send(allReminders);
      }
      if (text[1] === "c") {
        const reminderToComplete = text.split(" ")[1];
        const reminderId = allReminders[reminderToComplete-1]._id;
        const completedReminder = reminderId && await completeReminder(reminderId);
        const allRemindersMessage = `You just completed: ${completedReminder?.reminder}.`;
        sendMessage(chatId, allRemindersMessage)
        return res.send(allReminders);
      }
    } else {
      const reminderResponse = processReminderMessage(chatId, text);
      return res.send(reminderResponse);
    }
  } catch (error) {
    console.error("Error in POST request:", error);
    return res.status(500).send("Internal Server Error");
  }
};
