const getDateAndReminderWitAi = require("../services/analyze/witAi");
const sendTelegramMessage = require("../services/messaging/telegram");

const analyzeService = "WIT_AI";
const messagingService = "TELEGRAM";

const getDateAndReminder = async (message) => {
  switch (analyzeService) {
    case "WIT_AI":
      const [date, reminder] = await getDateAndReminderWitAi(message);
      return [date, reminder];
    default:
      return message;
  }
};

const sendMessage = async (chatId, message) => {
  switch (messagingService) {
    case "TELEGRAM":
      const response = sendTelegramMessage(chatId, message);
      return response;
    default:
      return message;
  }
};

module.exports = {getDateAndReminder, sendMessage};
