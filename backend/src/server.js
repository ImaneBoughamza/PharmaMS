import "dotenv/config";
import { createApp } from "./app.js";
import { connectDB } from "./config/db.js";

const app = createApp();

const port = process.env.PORT || 5000;

await connectDB(process.env.MONGO_URI);

app.listen(port, () => {
  console.log(`🚀 API running on http://localhost:${port}`);
});
