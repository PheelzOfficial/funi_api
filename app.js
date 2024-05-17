const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cookieparser = require("cookie-parser");
const expressFileupload = require("express-fileupload");
const auth = require("./routes/auth");
const home = require("./routes/home");
require("dotenv").config();
const path = require("path");

mongoose
  .connect(process.env.mongoose)
  .then(() => {
    console.log("DB connected !");
  })
  .catch((err) => {
    console.log(err.message);
  });

app.use("/public", express.static(path.join(__dirname, "public")));
app.use(expressFileupload());
app.use(cookieparser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/api/v1", auth);
app.use("/api/v1", home);

app.get("/", (req, res) => {
  const hostname = `${req.protocol}://${req.get("host")}`;
  return res.send("I am working on " + hostname);
});

const port = process.env.PORT;
app.listen(port, () => {
  console.log("Server listening on port " + port);
});
