import { streams, type Stream } from "./streams";

type VolumeDirection = "up" | "down";

declare global {
  interface Window {
    // added to window for quick browser debugging
    _video: HTMLVideoElement;
  }
}

const socket = new WebSocket("ws://localhost:3000");
socket.onopen = () => {
  socket.send("Hello, its ya boy Henry");
};

socket.onmessage = (event) => handleWSMessage(event.data);

const handleWSMessage = (data: string) => {
  console.log("~henry - data: ", data);
  const [_, sensor, reading] = data.split(":");
  switch (sensor) {
    case "channel":
      console.log("~henry - channel: ", reading);
      setChannel(parseInt(reading));
      break;
    case "volume":
      console.log("~henry - volume direction: ", reading);
      const sanitizedReading = reading.indexOf("up") !== -1 ? "up" : "down";
      setVolume(sanitizedReading);
      break;
    case "mute":
      console.log("~henry - muting");
      setMuted();
      break;
    default:
      return;
  }
};

let hls: any;
let _video: HTMLVideoElement;
let currentChannelIndex = 2;
let muted = true;

const VOLUME_INCREMENT = 5;

const proxyURLFromStreamIndex = (streamIndex: number) => {
  const proxy_url = "http://127.0.0.1:8182";
  const referer_url = "https://www.earthcam.com/";
  const file_extension = ".m3u8";

  return `${proxy_url}/${btoa(
    `${streams[streamIndex].streamUrl}|${referer_url}`
  )}${file_extension}`;
};

const setChannel = (channel: number) => {
  currentChannelIndex = channel;
  hls.loadSource(proxyURLFromStreamIndex(currentChannelIndex));

  const { channelNumber, name } = streams[currentChannelIndex];
  const infoDiv = document.getElementsByClassName(
    "channel-info"
  )[0] as HTMLDivElement;
  infoDiv.innerText = createChannelInfoText(channelNumber, name);
};

const deleteActiveCues = (textTrack: TextTrack) => {
  const activeCues = textTrack.activeCues || [];
  for (let i = 0; i < activeCues?.length || 0; i++) {
    textTrack.removeCue(activeCues[i]);
  }
};

// @todo: https://github.com/mcintyrehh/stream-o-vision/issues/1
const setVolume = (volume: VolumeDirection) => {
  // @todo: change this to logarithmic!
  // @see: https://github.com/videojs/video.js/issues/8498
  const currVolume = _video.volume;
  const volumeDiff = (volume === "up" ? 0.01 : -0.01) * VOLUME_INCREMENT;
  _video.volume = Math.max(Math.min(currVolume + volumeDiff, 1), 0);
  console.log("volume: ", Math.round(_video.volume * 100) / 100);

  const videoEl = document.getElementsByTagName("video")[0];
  const textTrack = videoEl.textTracks[0];
  deleteActiveCues(textTrack);

  textTrack.addCue(
    new VTTCue(
      videoEl.currentTime,
      videoEl.currentTime + 2,
      `Volume: ${Math.round(videoEl.volume * 100)}`
    )
  );
};

const setMuted = () => {
  muted = !muted;
  _video.muted = muted;

  const videoEl = document.getElementsByTagName("video")[0];
  const textTrack = videoEl.textTracks[0];
  deleteActiveCues(textTrack);

  textTrack.addCue(
    new VTTCue(videoEl.currentTime, videoEl.currentTime + 2, `Muted: ${muted}`)
  );
};

const addTextTrackToVideoElement = (videoEl: HTMLVideoElement) => {
  console.log(videoEl.currentTime);
  const { channelNumber, name } = streams[currentChannelIndex];
  const track = videoEl.addTextTrack("captions", "Channel Info", "en-US");
  track.mode = "showing";
  track.addCue(new VTTCue(0, 10, createChannelInfoText(channelNumber, name)));
};

const onChannelChange = (direction: "up" | "down") => {
  const channelDirection = direction === "up" ? 1 : -1;
  // Adding streams.length makes sure wrap-around works for negative numbers
  const newChannelIndex =
    (currentChannelIndex + channelDirection + streams.length) % streams.length;
  setChannel(newChannelIndex);
};

const createChannelInfoText = (
  channelNumber: Stream["channelNumber"],
  channelDescription: Stream["name"]
) => {
  return `Channel ${channelNumber} - ${channelDescription}`;
};

const createHLSVideoElement = () => {
  // Remove any existing video-wrapper to prevent duplicates
  const existingWrapper = document.querySelector(".video-wrapper");
  if (existingWrapper) {
    existingWrapper.remove();
  }

  const wrapper = document.createElement("div");
  wrapper.className = "video-wrapper";

  const video = document.createElement("video");

  wrapper.appendChild(video);
  // Global ref to video elem
  _video = video;
  window._video = video;
  // creating info div below the video for debugging
  const channelInfo = document.createElement("div");
  channelInfo.className = "channel-info";

  const { channelNumber, name } = streams[currentChannelIndex];
  channelInfo.innerText = createChannelInfoText(channelNumber, name);

  wrapper.appendChild(channelInfo);

  // creating channel up and down buttons
  const channelDown = document.createElement("button");
  channelDown.innerHTML = "Channel Down";
  channelDown.onclick = () => onChannelChange("down");
  wrapper.appendChild(channelDown);

  const channelUp = document.createElement("button");
  channelUp.innerHTML = "Channel Up";
  channelUp.onclick = () => onChannelChange("up");
  wrapper.appendChild(channelUp);

  // creating volume up and down buttons
  const volumeDown = document.createElement("button");
  volumeDown.innerHTML = "Volume Down";
  volumeDown.onclick = () => setVolume("down");
  wrapper.appendChild(volumeDown);

  const volumeUp = document.createElement("button");
  volumeUp.innerHTML = "Volume Up";
  volumeUp.onclick = () => setVolume("up");
  wrapper.appendChild(volumeUp);

  const muted = document.createElement("button");
  muted.innerHTML = "Toggle Mute";
  muted.onclick = () => setMuted();
  wrapper.appendChild(muted);

  const body = document.getElementsByTagName("body")[0];
  body.appendChild(wrapper);

  //@ts-ignore
  if (Hls.isSupported()) {
    //@ts-ignore
    hls = new Hls();
    console.log("hls: ", hls);
    hls.loadSource(proxyURLFromStreamIndex(currentChannelIndex));
    hls.attachMedia(video);
    // @ts-ignore
    hls.on(Hls.Events.MANIFEST_PARSED, function () {
      video.muted = true;
      video.play();
      addTextTrackToVideoElement(video);
    });
  }
  // hls.js is not supported on platforms that do not have Media Source Extensions (MSE) enabled.
  // When the browser has built-in HLS support (check using `canPlayType`), we can provide an HLS manifest (i.e. .m3u8 URL) directly to the video element through the `src` property.
  // This is using the built-in support of the plain video element, without using hls.js.
  else if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = "https://video-dev.github.io/streams/x36xhzz/x36xhzz.m3u8";
    video.addEventListener("canplay", function () {
      video.muted = true;
      video.play();
    });
  }
};

createHLSVideoElement();
