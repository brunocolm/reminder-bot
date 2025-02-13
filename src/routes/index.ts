import express from "express"
import { readMessage } from "../middleware/index.js";
import { addCalendarAuth } from "../services/calendar/googleCalendar.js";

const router = express.Router();

router.post("/", readMessage);
router.get("/redirect", addCalendarAuth);

export default router