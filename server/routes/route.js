import { Router } from "express";
import { createMessage, deleteMessage, getMessages } from "../controllers/messageController.js";

const router = Router();

router.get("/", getMessages);
router.post("/", createMessage);
router.delete("/delete", deleteMessage);

export default router;
