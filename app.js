import pg from "pg";
import express from "express";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const { Pool, Client } = pg;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "practice",
  password: "abinanthan",
  port: 5432,
});

async function testDBConnection() {
  try {
    const client = await pool.connect();
    console.log("Connected to PostgreSQL");
    client.release();
  } catch (err) {
    console.error("Failed to connect to PostgreSQL", err);
  }
}

testDBConnection();

const app = express();
const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/about", (req, res) => {
  res.send("<h1>About Us</h1> <p>This is about us page.</p>");
});

app.get("/events", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM events");
    const events = result.rows;
    res.render("event", { events: events });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching events");
  }
});

app.post("/create", async (req, res) => {
  const { title, description, date, location } = req.body;
  if (!title || !date || !location) {
    return res.status(400).send("Title, date, and location are required.");
  }
  try {
    const query =
      "INSERT INTO events (title, description, date, location) VALUES ($1, $2, $3, $4)";
    await pool.query(query, [title, description, date, location]);
    res.redirect("/events");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating event");
  }
});

app.listen(port, () => {
  console.log("Server listening on port ${port}");
});
