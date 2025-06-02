import express from "express";
const app = express();
import os from "os";
import { exec } from "child_process";
import path = require('path');
import { SerialPort } from 'serialport';
import { WebSocketServer } from 'ws'

console.log("os.type(): ", os.type())

const portPath = os.type() === "Windows_NT" ? "COM3" : "/dev/ttyACM1"

// // Debugging Serial Ports
// SerialPort.list().then(ports => console.log("Ports: ", ports))

// Open WebSocket for communication with frontend
const wss = new WebSocketServer({port: 3000})

wss.on('connection', (socket) => {
	console.log("WebSocket Connected")
	const port = new SerialPort({
		path: portPath,
		baudRate: 115200,
	})
	
	// Open errors will be emitted as an error event
	port.on('error', function(err) {
		console.log('Error: ', err.message)
	})
	
	port.on("open", () => {
		console.log("Serial Port Open")
		port.on('data', (data) => {
			console.log("serial port data: ", data.toString())
			socket.send(data.toString());
		})
	})
	
	socket.on('message', (message) => {
		console.log("message: ", message.toString())
	})
})
// console.log("wssSocket: ", wssSocket);



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
	`node ./node_modules/@warren-bank/hls-proxy/hls-proxy/bin/hlsd.js --port "8182"`,
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
	const pathway = path.join(__dirname, "..", "..", "app", "public", "index.html");
	console.log("pathway: ", pathway);
	res.sendFile(pathway);
});

app.use(express.static("public"));
app.use("/scripts", express.static(path.join(__dirname, "..", "scripts/")));
app.use("/static", express.static(path.join(__dirname, "..", "static/")));

app.listen(1337, () => {
		console.log("Server is running on http://localhost:1337");
		require('child_process').exec('start http://localhost:1337');
});
