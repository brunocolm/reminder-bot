
import { google } from 'googleapis';
import { sendMessage } from '../../middleware/index.js';
import { Request, Response } from "express";

export interface Event {
    date: Date,
    event: string
}

const oauth2Client = new google.auth.OAuth2(
    process.env.YOUR_CLIENT_ID,
    process.env.YOUR_CLIENT_SECRET,
    process.env.YOUR_REDIRECT_URL
);

const scopes = [
    'https://www.googleapis.com/auth/calendar'
];

export const connectToCalendarOAuth = async (): Promise<any> => {
    const url = oauth2Client.generateAuthUrl({
        // 'online' (default) or 'offline' (gets refresh_token)
        access_type: 'offline',

        // If you only need one scope, you can pass it as a string
        scope: scopes
    });
    return url
}

export const getCalendars = async (): Promise<any> => {
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    calendar.calendarList.list({}, (err, response) => {
        if (err) {
            console.error('error fetching calendars', err);
            return;
        }
        const calendars = response?.data?.items;
        console.log("Calendars:")
        console.log(JSON.stringify(calendars))
        console.log("------------------------------")
    });
};
export const getEvents = async (): Promise<any> => {
    const calendarId = "en.spain#holiday@group.v.calendar.google.com"
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    calendar.events.list({ calendarId, timeMin: (new Date()).toISOString(), maxResults: 15, singleEvents: true, orderBy: "startTime" }, (err, response) => {
        if (err) {
            console.error('error fetching events', err);
            return;
        }
        const events = response?.data?.items;
        console.log("Events:")
        console.log(JSON.stringify(events))
        console.log("------------------------------")
    });
};

export const addCalendarAuth = async (req: Request, res: Response): Promise<any> => {
    const code: any = req?.query?.code
    code && oauth2Client.getToken(code, (err, tokens) => {
        if (err) {
            console.error('Couldn\'t get token', err);
            res.send('Error');
            return;
        }
        if (tokens) {
            tokens && oauth2Client.setCredentials(tokens);
            res.send('Successfully logged in');
            getCalendars()
            getEvents()
            return;
        }
        res.send('Error');
        return;
    })
}

export const getGoogleCalendarEvents = async (chatId: number, maxResults = 15): Promise<Event[] | undefined> => {
    const calendarId = "en.spain#holiday@group.v.calendar.google.com"
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    console.log("Google Calendar: ", calendar)

    let events;
    console.log("Listing calendar events...")


    await calendar.events.list({ calendarId, timeMin: (new Date()).toISOString(), maxResults, singleEvents: true, orderBy: "startTime" }, async (err, response) => {
        if (err) {
            console.log("Couldn't list events: ", err);
            const OAuthURL = await connectToCalendarOAuth()
            const connectMessage = `To get your events you gotta sign in first: ${OAuthURL}`

            sendMessage(chatId, connectMessage)
            return;
        }
        events = response?.data?.items;

        console.log("Events callback:")
        console.log(JSON.stringify(events))
        console.log("------------------------------")
    });

    return events
}