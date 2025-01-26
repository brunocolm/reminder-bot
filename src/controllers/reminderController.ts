import { Request, Response } from "express";
import { completeReminder, readAllReminders, sendMessage } from "../middleware/index.js";
import { validateMessageBody, processReminderMessage, parseDate } from "../utils/handlers.js"


export const readTelegramMessage = async (req: Request, res: Response): Promise<any> => {
  const errorMessage = "There was an error.. My bad!!"
  try {
    const validationError = validateMessageBody(req.body);
    if (validationError) {
      const errorMessage = "There was an error.. My bad!!"
      const { chat: { id: chatId } } = req?.body?.message;
      chatId && sendMessage(chatId, errorMessage)
      console.log(validationError)
      return res.status(400).send(validationError);
    }
    console.log("*******Message valid******")
    const { text, chat: { id: chatId } } = req.body.message;
    console.log("Message: ", req.body.message)
    if (text[0] === "/") {
      console.log("Command detected: ", text)
      if (text === "/start") {
        const welcomeMsg = "Welcome! Create reminders just by writing it.\nCurrent commands:\n/all: gets all pending reminders\n/all *: gets all reminders"
        sendMessage(chatId, welcomeMsg)
        return res.send(welcomeMsg);
      }
      else if (text === "/all *") {
        const allReminders = await readAllReminders();
        console.log("Reading all reminders")
        const allRemindersMessage = `Your reminders are: ${allReminders.map((reminder, index) => `\n${index + 1}. ${reminder.reminder}: ${parseDate(reminder.date)} ${reminder.completed ? "✅" : ""}`)}`;
        console.log(allRemindersMessage)
        sendMessage(chatId, allRemindersMessage)
        return res.send(allReminders);
      } else if (text === "/all") {
        const allReminders = await readAllReminders();
        console.log("Reading all pending reminders")
        const allRemindersMessage = `Your pending reminders are: ${allReminders
          .filter((reminder) => !reminder.completed)
          .map((reminder, index) => `\n${index + 1}. ${reminder.reminder}: ${parseDate(reminder.date)}`)}`;

        console.log(allRemindersMessage)
        sendMessage(chatId, allRemindersMessage)
        return res.send(allReminders);
      } else if (text[1] === "c") {
        const allReminders = await readAllReminders();
        const reminderToComplete = text.split(" ")[1];
        const reminderId = allReminders[reminderToComplete - 1]?._id;
        console.log(`Completing reminder:\n${reminderToComplete} with ID: ${reminderId}`);

        if (!reminderId) {
          sendMessage(chatId, errorMessage)
          return res.status(400).send("Invalid reminder ID.");
        }

        const completedReminder = await completeReminder(reminderId);
        if (!completedReminder) {
          console.warn(`No reminder found with ID: ${reminderId}`);
          sendMessage(chatId, errorMessage)
          return res.status(404).send("Reminder not found or already completed.");
        }

        const completedReminderMessage = `You just completed: ${completedReminder?.reminder}.`;
        console.log(completedReminderMessage)
        sendMessage(chatId, completedReminderMessage)
        return res.send(allReminders);
      } else {
        const err = `Command doesn't exist: ${text}`
        sendMessage(chatId, err)
        console.log(err)
        return res.status(400).send(`Invalid command: ${text}`);
      }
    } else {
      const reminderResponse = processReminderMessage(chatId, text);
      return res.send(reminderResponse);
    }
  } catch (error) {
    const { chat: { id: chatId } } = req?.body?.message;
    chatId && sendMessage(chatId, errorMessage)
    console.error("Error in POST request:", error);
    return res.status(500).send("Internal Server Error");
  }
};
