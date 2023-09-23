const wrapper = document.createElement("div");
const video = document.createElement("video");
wrapper.appendChild(video);

// creating info divs below the video
const videoInfo = document.createElement("div");
const channelNumber = document.createElement("span");
channelNumber.className = "channel-div";
channelNumber.innerHTML = `Channel 1`;

videoInfo.appendChild(channelNumber);
const videoName = document.createElement("span");

videoName.innerHTML = ` - Empire State Building`;
videoInfo.appendChild(videoName);
wrapper.appendChild(videoInfo);

const proxy_url = "http://127.0.0.1:8181";
const video_url =
  "https://videos3.earthcam.com/fecnetwork/20489.flv/playlist.m3u8";
const referer_url = "https://www.earthcam.com/";
const file_extension = ".m3u8";

const hls_proxy_url = `${proxy_url}/${btoa(
  `${video_url}|${referer_url}`,
)}${file_extension}`;
console.log("hls_proxy_url: ", hls_proxy_url);

const body = document.getElementsByTagName("body")[0];
body.appendChild(wrapper);
//         <video id="videoPlayer" width="50%" controls muted="muted" autoplay>
// <source src="http://127.0.0.1:8181/aHR0cHM6Ly92aWRlb3MzLmVhcnRoY2FtLmNvbS9mZWNuZXR3b3JrLzIwNDg5LmZsdi9wbGF5bGlzdC5tM3U4fGh0dHBzOi8vd3d3LmVhcnRoY2FtLmNvbS8=.m3u8" type="video/mp4" />
// </video>
