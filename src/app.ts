import express from "express";
import dotenv from "dotenv";
import {router} from "./routes/auth.route.js"

dotenv.config({ quiet: true });
const app = express();

app.use(express.json());
app.use('/api', router)

app.get(`/`, (req, res) => {
  res.send({
    message: "working",
  });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
