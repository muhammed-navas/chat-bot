import pool from "../config/db.js";
import axios from "axios";
import dotenv from "dotenv"

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
    console.log(userMessageResult.rows[0], "userMessageResult");

    if (!userMessageResult.rows[0]) {
      throw new Error("Failed to insert user message");
    }

    if (!process.env.OPENAI_API_KEY) {
      throw new Error("Gemini API key is not configured");
    }

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

    if (!geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error("Invalid response from Gemini API");
    }

    const geminiReply = geminiResponse.data.candidates[0].content.parts[0].text;
    const botMessageQuery = {
      text: "INSERT INTO messages (content, sender, timestamp) VALUES ($1, $2, NOW()) RETURNING *",
      values: [geminiReply, "bot"],
    };

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

    console.error("Error message:", err.message);
    if (err.response?.status === 401) {
      res.status(401).json({
        error: "Gemini API authentication failed",
        details:
          process.env.NODE_ENV === "development"
            ? "Please check your GEMINI_API_KEY environment variable"
            : undefined,
      });
    } else {
      res.status(500).json({
        error: "Server error",
        details:
          process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    }
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
    res.status(500).json({ error: "Server error" });
  }
};

export const deleteMessage = async (req, res) => {
  let client;

  try {
    // Get database connection
    client = await pool.connect();

    // Start transaction
    await client.query("BEGIN");

    // Truncate the `messages` table
    await client.query("TRUNCATE TABLE messages RESTART IDENTITY CASCADE");

    // Commit the transaction
    await client.query("COMMIT");

    // Send success response
    res.json({ message: "All messages deleted successfully" });
  } catch (error) {
    // Rollback transaction on error
    if (client) {
      await client.query("ROLLBACK");
    }

    console.error("Error in deleteMessage:", error);
    res.status(500).json({ error: "Failed to delete messages" });
  } finally {
    // Release client back to pool
    if (client) {
      client.release();
    }
  }
};



