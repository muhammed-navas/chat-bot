import pool from "../config/db.js";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export const createMessage = async (req, res) => {
  const { content } = req.body;
  if (!content) {
    return res.status(400).json({ error: "Message content is required" });
  }

  let client;
  try {
    client = await pool.connect();

    await client.query("BEGIN");

    const userMessageQuery = {
      text: "INSERT INTO messages (content, sender, timestamp) VALUES ($1, $2, NOW()) RETURNING *",
      values: [content, "user"],
    };

    const userMessageResult = await client.query(userMessageQuery);

    if (!userMessageResult.rows[0]) {
      throw new Error("Failed to insert user message");
    }
       console.log(userMessageResult, "userMessageResult");

    const geminiResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.OPENAI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: content }],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const geminiReply =
      geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log(geminiReply, "geminiReply");

    if (!geminiReply) {
      throw new Error("Invalid response from Gemini API");
    }

    const botMessageQuery = {
      text: "INSERT INTO messages (content, sender, timestamp) VALUES ($1, $2, NOW()) RETURNING *",
      values: [geminiReply, "bot"],
    };
console.log(botMessageQuery, "botMessageQuery");
    const botMessageResult = await client.query(botMessageQuery);

    if (!botMessageResult.rows[0]) {
      throw new Error("Failed to insert bot message");
    }

    await client.query("COMMIT");

    res.json({
      userMessage: userMessageResult.rows[0],
      botMessage: botMessageResult.rows[0],
    });
  } catch (err) {
    if (client) {
      await client.query("ROLLBACK");
    }
    console.error("Error in createMessage:", err.message);
    res.status(500).json({ error: "Server error ", details: err.message });
  } finally {
    if (client) {
      client.release();
    }
  }
};

export const getMessages = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM messages ORDER BY timestamp ASC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error in getMessages:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

export const deleteMessage = async (req, res) => {
  let client;

  try {
    client = await pool.connect();

    await client.query("BEGIN");

    await client.query("TRUNCATE TABLE messages RESTART IDENTITY CASCADE");

    await client.query("COMMIT");

    res.json({ message: "All messages deleted successfully" });
  } catch (error) {
    if (client) {
      await client.query("ROLLBACK");
    }

    console.error("Error in deleteMessage:", error.message);
    res
      .status(500)
      .json({ error: "Failed to delete messages", details: error.message });
  } finally {
    if (client) {
      client.release();
    }
  }
};
