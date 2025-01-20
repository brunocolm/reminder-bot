
import 'dotenv/config';
import express from "express";
import routes from "./routes/index.js";

const app = express();
app.use(express.json());

app.use("/", routes);

const PORT = process.env.PORT || 4040;

app.listen(PORT, (err: any) => {
  if (err) {
    console.error("Error starting server:", err);
  } else {
    console.log("Server listening on PORT", PORT);
  }
});

export default app;