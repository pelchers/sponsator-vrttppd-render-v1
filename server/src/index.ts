import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Add logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.post("/log", (req, res) => {
  const { message, type = 'info' } = req.body;
  console.log(`[CLIENT] ${type.toUpperCase()}: ${message}`);
  res.sendStatus(200);
});

app.get("/", (req, res) => {
  console.log("Root endpoint accessed");
  res.send("Server is running!");
});

const PORT = process.env.PORT || 4100;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
}); 