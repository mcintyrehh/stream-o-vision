import express from "express";
const app = express();
// import fs
import fs from "fs";
 
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});
 
app.listen(3000);