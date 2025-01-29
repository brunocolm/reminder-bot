
import { Filter, Document, MongoClient, ObjectId, ServerApiVersion } from 'mongodb';
import { filterReminders } from '../../middleware';

export interface Reminder {
    _id?: ObjectId | undefined;
    reminder: string;
    date: string;
    completed?: boolean;
    completedDate?: string;
    chatId?: number;
    createdAt?: string;
}

export interface ReminderFilter {
    _id?: ObjectId[] | [];
    reminder?: string;
    dateBefore?: string;
    dateAfter?: string;
    completed?: boolean;
    completedBefore?: string;
    completedAfter?: string;
    chatId?: number[];
    createdBefore?: string;
    createdAfter?: string;
}



// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(process.env.MONGO_URI || "", {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

export const run = async () => {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("reminders").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } catch (e) {
        // Ensures that the client will close when you finish/error
        await client.close();
        console.log("Client closed due to an error: ", e);
    }
}

export const createReminderMongoDB = async (reminder: Reminder): Promise<boolean> => {
    const db = client.db("reminders")
    const coll = db.collection("reminders")
    const result = await coll.insertOne(reminder);
    console.log(
        `A reminder was inserted with the _id: ${result.insertedId}`,
    );

    return result.acknowledged
}

export const readAllRemindersMongoDB = async (): Promise<Reminder[]> => {
    const db = client.db("reminders");
    const coll = db.collection("reminders");
    const reminders = await coll.find().toArray();
    console.log("allReminders: \n", reminders)

    return reminders as Reminder[];
};

export const filterRemindersMongoDB = async (findOptions: Filter<Document>): Promise<Reminder[]> => {
    console.log("Searching reminders.. ")
    const db = client.db("reminders");
    const coll = db.collection("reminders");
    const reminders = await coll.find(findOptions).toArray();

    console.log("Filtered reminders: \n", reminders);

    return reminders as Reminder[];
};

export const createMongoFilterQuery = (reminderFilter: ReminderFilter): Filter<Document> => {
    const filter: Filter<Document> = {};

    if (reminderFilter._id && reminderFilter._id.length > 0) {
        filter._id = { $in: reminderFilter._id };
    }
    if (reminderFilter.reminder) {
        filter.reminder = { $regex: reminderFilter.reminder, $options: "i" }; // Case-insensitive search
    }
    if (reminderFilter.dateBefore) {
        filter.date = { ...filter.date, $lte: reminderFilter.dateBefore }; // Convert to Date
    }
    if (reminderFilter.dateAfter) {
        filter.date = { ...filter.date, $gte: reminderFilter.dateAfter }; // Convert to Date
    }
    if (reminderFilter.completed !== undefined) {
        filter.completed = reminderFilter.completed;
    }
    if (reminderFilter.completedBefore) {
        filter.completedDate = { ...filter.completedDate, $lte: reminderFilter.completedBefore };
    }
    if (reminderFilter.completedAfter) {
        filter.completedDate = { ...filter.completedDate, $gte: reminderFilter.completedAfter };
    }
    if (reminderFilter.chatId && reminderFilter.chatId.length > 0) {
        filter.chatId = { $in: reminderFilter.chatId };
    }
    if (reminderFilter.createdBefore) {
        filter.createdAt = { ...filter.createdAt, $lte: reminderFilter.createdBefore };
    }
    if (reminderFilter.createdAfter) {
        filter.createdAt = { ...filter.createdAt, $gte: reminderFilter.createdAfter };
    }

    console.log("********************Query created********************")
    console.log("Reminder query: ", reminderFilter)
    console.log("MongoDB query: ", filter)
    
    return filter;
};
export const completeReminderMongoDB = async (reminderId: string | ObjectId): Promise<Reminder> => {
    const db = client.db("reminders");
    const coll = db.collection("reminders");
    try {
        console.log("Searching reminder..")
        const id = typeof reminderId === "string" ? new ObjectId(reminderId) : reminderId;
        const result = await coll.findOneAndUpdate(
            { _id: id },
            { $set: { completed: true } },
            { returnDocument: "after" }
        );
        console.log("Query result: ", result)

        if (!result) {
            throw new Error(`No reminder found with ID: ${reminderId}`);
        }

        console.log(`Reminder with ID: ${reminderId} completed`);

        return result as Reminder;
    } catch (error) {
        console.error(`Error completing reminder with ID ${reminderId}:`, error);
        throw error;
    }
};
