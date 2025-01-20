import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;
const connectionString =
  "postgresql://neondb_owner:npg_JbXBcvnr7qx9@ep-flat-silence-a1quyn8p.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err.message);
  } else {
    console.log("Connected to the PostgreSQL database on neon");
  }
});

export default pool;
