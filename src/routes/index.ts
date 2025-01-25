import express from "express"
import { readMessage } from "../middleware/index.js";


const router = express.Router();

router.post("*", readMessage);

export default router