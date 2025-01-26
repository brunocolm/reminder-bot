
import { MongoClient, ObjectId, ServerApiVersion } from 'mongodb';

export interface Reminder {
    _id?: ObjectId | undefined;
    reminder: string;
    date: string;
    completed?: boolean;
    completedDate?: boolean;
    chatId?: number;
    createdAt?: string;
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

        if (!result?.value) {
            throw new Error(`No reminder found with ID: ${reminderId}`);
        }

        console.log(`Reminder with ID: ${reminderId} completed`);

        return result.value as Reminder;
    } catch (error) {
        console.error(`Error completing reminder with ID ${reminderId}:`, error);
        throw error;
    }
};
