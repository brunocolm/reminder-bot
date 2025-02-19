import { completeReminder, createInterfaceButtons, filterReminders, getCalendarEvents, readAllReminders, sendMessage } from "../middleware/index.js";
import { Response } from "express";
import { parseDate, sendErrorMessage } from "./handlers.js";

export type Command = "/start" | "/s" | "/all" | "/complete" | "/c" | "/ge" | "/get_events";
export const awaitingResponseUser: Record<number | string, Command> = {};

const handleStartCommand = async (chatId: number, res: Response): Promise<any> => {
    const welcomeMsg = "Welcome! Create reminders just by writing it.\nCurrent commands:\n/all: gets all pending reminders\n/all *: gets all reminders"
    sendMessage(chatId, welcomeMsg)
    return res.send(welcomeMsg);
}

const handleReadAllCommand = async (chatId: number, res: Response): Promise<any> => {
    const allReminders = await readAllReminders();
    console.log("Reading all reminders")
    const allRemindersMessage = `Your reminders are: ${allReminders.map((reminder, index) => `\n${index + 1}. ${reminder.reminder}: ${parseDate(reminder.date)} ${reminder.completed ? "✅" : ""}`)}`;
    console.log(allRemindersMessage)
    sendMessage(chatId, allRemindersMessage)
    return res.send(allReminders);
}

const handleReadPendingCommand = async (chatId: number, res: Response): Promise<any> => {
    const pendingReminders = await filterReminders({ completed: false });
    console.log("Reading all pending reminders")
    const allRemindersMessage = `Your pending reminders are: ${pendingReminders.map((reminder, index) => `\n${index + 1}. ${reminder.reminder}: ${parseDate(reminder.date)}`)}`;

    console.log(allRemindersMessage)
    sendMessage(chatId, allRemindersMessage)
    return res.send(pendingReminders);
}

const handleAllCommand = async (chatId: number, res: Response, param?: string): Promise<any> => {
    if (param === "*") {
        return handleReadAllCommand(chatId, res)
    } else {
        return handleReadPendingCommand(chatId, res)
    }
}

const handleGetCalendarEvents = async (chatId: number, res: Response, param?: string): Promise<any> => {
    const allEvents = await getCalendarEvents(chatId)

    if (allEvents?.length) {
        const completedReminderMessage = `Your events are: ${allEvents}.`;
        console.log(completedReminderMessage)
        sendMessage(chatId, completedReminderMessage)
        return res.send(allEvents);
    }
    return res.send("No events");
}

const handleCompleteCommand = async (chatId: number, res: Response, reminderIndexToComplete?: number | string): Promise<any> => {
    const pendingReminders = await filterReminders({ completed: false });

    if (!pendingReminders.length) {
        const err = `You don't have any pending reminder.`
        return sendErrorMessage(chatId, err, res);
    }

    if (!reminderIndexToComplete) {
        const selectReminderMessage = `Select the reminder you want to complete: ${pendingReminders
            .map((reminder, index) => `\n${index + 1}. ${reminder.reminder}: ${parseDate(reminder.date)}`)}`;
        console.log(selectReminderMessage)

        const messageButtons = createInterfaceButtons(pendingReminders.length)
        sendMessage(chatId, selectReminderMessage, messageButtons)
        awaitingResponseUser[chatId] = "/c";
        return res.send(selectReminderMessage);
    }

    delete awaitingResponseUser[chatId]
    const reminderIndexNumberToComplete = typeof (reminderIndexToComplete) === "string" ? parseInt(reminderIndexToComplete) : reminderIndexToComplete

    if (reminderIndexNumberToComplete < 1 || reminderIndexNumberToComplete > pendingReminders.length) {
        const err = "Must select reminder within options"
        return sendErrorMessage(chatId, err, res);
    }

    const { _id: reminderId, reminder } = pendingReminders[reminderIndexNumberToComplete - 1]
    console.log(`Reminder chosen:\n ${reminderIndexToComplete}. ${reminder} with _id=${reminderId}`);
    if (!reminderId) {
        const err = "Invalid reminder ID."
        return sendErrorMessage(chatId, err, res);
    }

    console.log(`Completing reminder:\n${reminderIndexToComplete} with _id=${reminderId}`);
    const completedReminder = await completeReminder(reminderId);
    if (!completedReminder) {
        const err = "Reminder not found or already completed."
        return sendErrorMessage(chatId, err, res);
    }

    const completedReminderMessage = `You just completed: ${completedReminder?.reminder}.`;
    console.log(completedReminderMessage)
    sendMessage(chatId, completedReminderMessage)
    return res.send(pendingReminders);
}

export const handleCommand = async (commandInput: string, chatId: number, res: Response): Promise<any> => {
    const args = commandInput.split(" ");
    const command = args[0] as Command;
    const param = args[1];

    switch (command) {
        case "/start":
        case "/s":
            return handleStartCommand(chatId, res)
        case "/c":
        case "/complete":
            return handleCompleteCommand(chatId, res, param)
        case "/all":
            return handleAllCommand(chatId, res, param)
        case "/ge":
        case "/get_events":
            return handleGetCalendarEvents(chatId, res, param)
        default:
            const err = `Command doesn't exist: ${commandInput}`
            return sendErrorMessage(chatId, err, res);
    }
}