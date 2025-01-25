import express from "express"
import { readMessage } from "../middleware";


const router = express.Router();

router.post("*", readMessage);

export default router