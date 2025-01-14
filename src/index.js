require('dotenv').config();
const express = require("express");
const routes = require("./routes");

const app = express();
app.use(express.json());

app.use("/", routes);

const PORT = process.env.PORT || 4040;
app.listen(PORT, (err) => {
  if (err) {
    console.error("Error starting server:", err);
  } else {
    console.log("Server listening on PORT", PORT);
  }
});

module.exports = app;