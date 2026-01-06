const express = require("express");
const app = express();

app.use(express.json());
app.use(express.static("public"));

app.get("/api/hello", (req, res) => {
  res.json({ message: "Backend működik 🚀" });
});

app.listen(3000, () => {
  console.log("Szerver fut: http://localhost:3000");
});