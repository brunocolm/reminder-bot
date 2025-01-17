import express from "express"
import { createReminder } from "../controllers/reminderController"

const router = express.Router();

router.post("*", createReminder);

export default router