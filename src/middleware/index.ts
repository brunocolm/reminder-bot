import { readTelegramMessage } from "../controllers/reminderController.js";
import { getDateAndReminderWitAi } from "../services/analyze/witAi.js";
import { sendTelegramMessage } from "../services/messaging/telegram.js";
import { completeReminderMongoDB, createMongoFilterQuery, createReminderMongoDB, filterRemindersMongoDB, readAllRemindersMongoDB, Reminder, ReminderFilter } from "../services/storing/mongodb.js";
import { Request, Response } from "express";
import { ObjectId } from "mongodb";

enum ANALYZE_SERVICE {
  WIT_AI = "WIT_AI"
}

enum MESSAGING_SERVICE {
  TELEGRAM = "TELEGRAM"
}

enum STORING_SERVICE {
  MONGODB = "MONGODB"
}

const analyzeService = ANALYZE_SERVICE.WIT_AI;
const messagingService = MESSAGING_SERVICE.TELEGRAM;
const storingService = STORING_SERVICE.MONGODB;

export const getDateAndReminder = async (message: string): Promise<[string, string] | string> => {
  try {
    console.log("Analyzing message with:", analyzeService);
    switch (analyzeService) {
      case ANALYZE_SERVICE.WIT_AI:
        const [date, reminder] = await getDateAndReminderWitAi(message);
        return [date, reminder];
      default:
        return message;
    }
  } catch (e: any) {
    console.log("Error getting date and reminder:", e.message);
    throw e
  }
};

export const readMessage = async (req: Request, res: Response): Promise<any> => {
  console.log("Reading message with:", messagingService);
  try {
    switch (messagingService) {
      case MESSAGING_SERVICE.TELEGRAM:
        const response = await readTelegramMessage(req, res);
        return response;
      default:
        return null;
    }
  } catch (e: any) {
    console.log("Error reading message:", e.message);
    return res.status(500).send("Internal Server Error");
  }
};

export const sendMessage = async (chatId: number, message: string): Promise<[string, string] | string> => {
  console.log("Sending message with:", messagingService);
  switch (messagingService) {
    case MESSAGING_SERVICE.TELEGRAM:
      const response = sendTelegramMessage(chatId, message);
      return response;
    default:
      return message;
  }
};

export const storeReminder = async (date: string, reminder: string, chatId?: number, completed = false): Promise<boolean> => {
  try {
    console.log("Storing reminder with:", storingService);
    switch (storingService) {
      case STORING_SERVICE.MONGODB:
        const response = createReminderMongoDB({
          date, reminder, completed, chatId
        });
        return response;
      default:
        return false;
    }
  } catch (e: any) {
    console.log("Error storing reminder:", e.message);
    throw e
  }
};

export const readAllReminders = async (): Promise<Reminder[]> => {
  try {
    console.log("Reading all reminders with:", storingService);
    switch (storingService) {
      case STORING_SERVICE.MONGODB:
        return readAllRemindersMongoDB()
      default:
        return [];
    }
  } catch (e: any) {
    console.log("Error reading reminder:", e.message);
    throw e
  }
};

export const filterReminders = async (reminderFilter:ReminderFilter): Promise<Reminder[]> => {
  try {
    console.log("Filtering reminders with: ", storingService);
    switch (storingService) {
      case STORING_SERVICE.MONGODB:
        const mongoQuery = createMongoFilterQuery(reminderFilter)
        return filterRemindersMongoDB(mongoQuery)
      default:
        return [];
    }
  } catch (e: any) {
    console.log("Error reading reminder:", e.message);
    throw e
  }
};

export const completeReminder = async (reminderId: string | ObjectId): Promise<Reminder | null> => {
  try {
    console.log("Completing reminder with:", storingService);
    switch (storingService) {
      case STORING_SERVICE.MONGODB:
        return await completeReminderMongoDB(reminderId)
      default:
        return null;
    }
  } catch (e: any) {
    console.log("Error completing reminder:", e.message);
    throw e
  }
};
