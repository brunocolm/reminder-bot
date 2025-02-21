import schedule from "node-schedule";
import { filterReminders, getDateAndReminder, sendMessage, storeReminder } from "../middleware/index.js";
import { ReminderFilter } from "../services/storing/mongodb.js";

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
