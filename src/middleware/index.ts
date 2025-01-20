import { getDateAndReminderWitAi } from "../services/analyze/witAi.js";
import { sendTelegramMessage } from "../services/messaging/telegram.js";

enum ANALYZE_SERVICE {
  WIT_AI = "WIT_AI"
}

enum MESSAGING_SERVICE {
  TELEGRAM = "TELEGRAM"
}

const analyzeService = ANALYZE_SERVICE.WIT_AI;
const messagingService = MESSAGING_SERVICE.TELEGRAM;

export const getDateAndReminder = async (message: string): Promise<[string, string] | string> => {
  try {
    switch (analyzeService) {
      case ANALYZE_SERVICE.WIT_AI:
        const [date, reminder] = await getDateAndReminderWitAi(message);
        return [date, reminder];
      default:
        return message;
    }
  } catch (e:any) {
    console.log("Error getting date and reminder:", e.message);
    throw new Error(e)
  }
};

export const sendMessage = async (chatId: number, message: string): Promise<[string, string] | string> => {
  switch (messagingService) {
    case MESSAGING_SERVICE.TELEGRAM:
      const response = sendTelegramMessage(chatId, message);
      return response;
    default:
      return message;
  }
};


