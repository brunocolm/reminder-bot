const schedule = require("node-schedule");
const { getDateAndReminder, sendMessage } = require("../middleware");

//Validates data is valid. (e.g.: {message: {text:"Message text", chat: {id:1 }}} )
const validateMessageBody = (body) => {
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

const parseDate = (ISODate) => {
  return new Date(ISODate).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const reminderCallback = (chatId, ISODate, reminder) => {
  const date=parseDate(ISODate)
  const message = `${date}Reminder!!\n${reminder}`;
  sendMessage(chatId,message)
};

const scheduleReminder = (chatId, ISODate, reminder) => {
  const job = schedule.scheduleJob(ISODate, function () {
    reminderCallback(chatId, new Date(), reminder);
  });
  
  if (!job) return "error";

  return "success";
};

const processReminderMessage = async (chatId, userMessage) => {
  const [ISODate, reminder] = await getDateAndReminder(userMessage);
  const reminderStatus = scheduleReminder(chatId, ISODate, reminder);

  if (reminderStatus === "error") {
    const err = `There was an error generating your reminder. Date: ${ISODate}. Reminder: ${reminder}`;
    console.log(err);
    return err;
  }

  const date = parseDate(ISODate);
  const botMessage = `Reminder created: ${date}\n${reminder}`;

  sendMessage(chatId,botMessage)
};

module.exports = {
  validateMessageBody,
  processReminderMessage,
};
