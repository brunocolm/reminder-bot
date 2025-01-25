import schedule from "node-schedule";
import { getDateAndReminder, sendMessage, storeReminder } from "../middleware/index.js";

interface MessageBody {
  message: {
    text: string,
    chat: {
      id: number
    }
  }
}

//Validates data is valid. (e.g.: {message: {text:"Message text", chat: {id:1 }}} )
export const validateMessageBody = (body: MessageBody): string | null => {
  if (!body.message) {
    return "Bad Request: Missing message object";
  }

  const { text, chat } = body.message;

  if (!text) {
    return "Bad Request: Missing text field";
  }
  if (!chat) {
    return "Bad Request: Missing chat object";
  }
  if (!chat.id) {
    return "Bad Request: Missing chat id";
  }

  return null; // Return null if validation passes
};

export const parseDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeStyle:"medium"
  });
};

const reminderCallback = (chatId: number, date: string | Date, reminder: string) => {
  const parsedDate = parseDate(date)
  const message = `I hear you my man:\n${parsedDate} \n${reminder}`;
  sendMessage(chatId, message)
};

const scheduleReminder = (chatId: number, ISODate: string, reminder: string): boolean => {
  const job = schedule.scheduleJob(ISODate, function () {
    reminderCallback(chatId, new Date(), reminder);
  });

  if (!job) return false;

  return true;
};

export const processReminderMessage = async (chatId: number, userMessage: string) => {
  const [ISODate, reminder] = await getDateAndReminder(userMessage);
  const storedReminderStatus = storeReminder(ISODate, reminder, chatId)
  if (!storedReminderStatus) {
    const err = `There was an error storing your reminder. Date: ${ISODate}. Reminder: ${reminder}`;
    console.log(err);
  }

  const reminderStatus = scheduleReminder(chatId, ISODate, reminder);

  if (!reminderStatus) {
    const err = `There was an error generating your reminder. Date: ${ISODate}. Reminder: ${reminder}`;
    console.log(err);
    return err;
  }

  const date = parseDate(ISODate);
  const botMessage = `Reminder created:\n${date}\n${reminder}`;

  sendMessage(chatId, botMessage)
};

