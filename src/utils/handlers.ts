import schedule from "node-schedule";
import { filterReminders, getDateAndReminder, sendMessage, storeReminder } from "../middleware/index.js";
import { ReminderFilter } from "../services/storing/mongodb.js";
import { Response } from "express";

interface InlineKeyboard {
  text: string,
  callback_data: string
}

interface MessageData {
  text: string,
  chat: {
    id: number
  },
  reply_markup?: {
    inline_keyboard: InlineKeyboard[][]
  }

}
interface MessageBody {
  message?: MessageData,
  callback_query?: {
    message?: MessageData
  }
}
export enum MessageType {
  TEXT = "text",
  BUTTON_RESPONSE = "button_response",
  INVALID = "invalid"
}

export const sendErrorMessage = (chatId: number, error: string, res: Response) => {
  const errorMessage = "There was an error.. My bad!!"
  if (chatId) {
    sendMessage(chatId, errorMessage);
  }
  console.error(error);
  return res.send(error);
};

//Validates data is valid. (e.g.: {message: {text:"Message text", chat: {id:1 }}} )
const validateMessageBody = (body: MessageBody): MessageType | undefined => {
  if (!body.message) {
    return MessageType.INVALID
  }

  const { text, chat } = body.message;

  if (!text || !chat || !chat.id) return MessageType.INVALID;

  return
};
const validateButtonCallback = (callbackQuery: MessageBody): MessageType | undefined => {
  const messageType = validateMessageBody(callbackQuery);
  if (messageType) return messageType;

  if (!callbackQuery?.message?.reply_markup) return MessageType.INVALID;
  
  return
};

export const getMessageType = (body: MessageBody): MessageType => {
  if (body?.callback_query) {
    return validateButtonCallback(body.callback_query) || MessageType.BUTTON_RESPONSE
  } else if (body?.message) {
    return validateMessageBody(body) || MessageType.TEXT
  }

  return MessageType.INVALID
};

export const parseDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
  });
};

const reminderCallback = (chatId: number, date: string | Date, reminder: string) => {
  const parsedDate = parseDate(date)
  const message = `Remember to do this:\n${parsedDate} \n${reminder}`;
  sendMessage(chatId, message)
};

const scheduleReminder = (chatId: number, ISODate: string, reminder: string): boolean => {
  const job = schedule.scheduleJob(ISODate, function () {
    reminderCallback(chatId, new Date(), reminder);
  });

  if (!job) {
    const err = `There was an error generating your reminder. Date: ${ISODate}. Reminder: ${reminder}`;
    console.log(err);
    return false
  };

  console.log(`Scheduled for ${parseDate(ISODate)}: \n-${reminder}`)
  return true;
};

export const rescheduleReminders = async (): Promise<boolean> => {
  console.log("Rescheduling reminders...")
  const filter: ReminderFilter = {
    dateAfter: new Date().toISOString(),
    completed: false,
  }

  const filteredReminders = await filterReminders(filter)

  if (!filteredReminders.length) {
    console.log("No reminders to reschedule")
    return true;
  }

  filteredReminders.forEach(({ chatId, date, reminder }) => {
    const job = chatId && schedule.scheduleJob(new Date(date).toISOString(), function () {
      reminderCallback(chatId, new Date(), reminder);
    });

    if (!job) {
      console.log("error rescheduling reminders")
      return false
    };
    console.log(`Rescheduled for ${parseDate(date)}: \n-${reminder}`)
  });
  console.log("Rescheduling complete!")
  return true;
};

export const processReminderMessage = async (chatId: number, userMessage: string): Promise<string | undefined> => {
  console.log("Getting date and text from reminder")
  const [ISODate, reminder] = await getDateAndReminder(userMessage);
  if (!ISODate || !reminder) {
    const err = "Couldn't find date or reminder subject"
    console.log(err)
    sendMessage(chatId, err)
    return err
  }
  console.log(`Creating reminder for date: ${ISODate}. ${reminder}`)

  const reminderStatus = scheduleReminder(chatId, ISODate, reminder);
  console.log(`Reminder scheduled: ${reminderStatus}`)
  if (!reminderStatus) {
    const err = `There was an error generating your reminder. Date: ${ISODate}. Reminder: ${reminder}`;
    return err;
  }

  const storedReminderStatus = !!ISODate && !!reminder && storeReminder(ISODate, reminder, chatId)
  console.log(`Reminder stored: ${storedReminderStatus}`)
  if (!storedReminderStatus) {
    const err = `There was an error storing your reminder. Date: ${ISODate}. Reminder: ${reminder}`;
    console.log(err);
    return err;
  }


  const date = parseDate(ISODate);
  console.log(`Parsed date: ${date}`)
  const botMessage = `Reminder created:\n${date}\n${reminder}`;
  console.log(botMessage)

  sendMessage(chatId, botMessage)
};
