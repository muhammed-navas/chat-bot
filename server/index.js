import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'
import pool from './config/db.js';
import router from "./routes/route.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/messages", router);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));