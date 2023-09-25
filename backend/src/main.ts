import express from "express";
const app = express();
import fs from "fs";
import { exec } from "child_process";
import path from "path";

// Spin up HLS proxy server to get around CORS/Origin, Referer HTTP request headers
console.log("Starting HLS proxy server...");
exec("echo 'henry is cool'", (error, stdout, stderr) => {
  console.log(stdout);
});
exec("pwd", (error, stdout, stderr) => {
  console.log("henry");
  console.log("iscool");
  console.log(stdout);
});

exec(
  './node_modules/@warren-bank/hls-proxy/hls-proxy/bin/hlsd.js --port "8181"',
  (error, stdout, stderr) => {
    if (error) {
      console.error(`node subprocess error.message: ${error.message}`);
      console.error(`node subprocess error: ${error}`);
      return;
    }

    if (stderr) {
      console.error(`node subprocess stderr: ${stderr}`);
      return;
    }
    console.log(`node subprocess stdout: ${stdout}`);
  },
);

app.get("/", function (req, res) {
  console.log("dirname: ", __dirname);
  const pathway = path.join(__dirname, "..", "..", "public", "index.html");
  console.log("pathway: ", pathway);
  res.sendFile(pathway);
});
// app.get("/earth-cam", function (req, res) {
//   res.sendFile(__dirname + "/earth-cam.html");
// });
app.use(express.static("public"));
app.use("/scripts", express.static(path.join(__dirname, "..", "scripts/")));

app.listen(3000);
