import Hls from "hls.js";
import { streams, type Stream } from "./streams";
import "./styles.css";

type VolumeDirection = "up" | "down";
const scanlinesClass = "scanlines";
// const scanlinesClass = "crt";

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
  const [, sensor, reading] = data.split(":"); // skip unused variable
  switch (sensor) {
    case "channel":
      setChannel(parseInt(reading));
      break;
    case "volume":
      const sanitizedReading = reading.indexOf("up") !== -1 ? "up" : "down";
      setVolume(sanitizedReading);
      break;
    case "mute":
      setMuted();
      break;
    case "grayscale":
      toggleGrayscale();
      break;
    case "scanlines":
      toggleScanlines();
      break;
    default:
      return;
  }
};

let hls: Hls;
let _video: HTMLVideoElement;
let currentChannelIndex = 2;
let muted = true;
let scanlinesEnabled = true;
let grayscaleEnabled = false;
let menuLayer = 0;

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

  const textTrack = _video.textTracks[0];
  deleteActiveCues(textTrack);

  textTrack.addCue(
    new VTTCue(_video.currentTime, _video.currentTime + 2, `Muted: ${muted}`)
  );
};

const toggleGrayscale = () => {
  grayscaleEnabled = !grayscaleEnabled;
  _video?.style.setProperty("--grayscaleLevel", grayscaleEnabled ? "1" : "0");
};

const toggleScanlines = () => {
  const videoWrapper = document.querySelector(".video-wrapper");
  if (videoWrapper) {
    const hasScanlines = videoWrapper.classList.contains(scanlinesClass);
    if (hasScanlines) {
      videoWrapper.classList.remove(scanlinesClass);
    } else {
      videoWrapper.classList.add(scanlinesClass);
    }
    console.log("Scanlines enabled:", !hasScanlines);
  }
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
  wrapper.classList.add("video-wrapper");
  wrapper.classList.add(scanlinesClass);

  const video = document.createElement("video");
  video.classList.add("grayscale");
  video.classList.add(scanlinesClass);

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

  // Add overlay with arrow controls and toggles, plus channel/volume/mute controls
  const overlay = document.createElement("div");
  overlay.className = "video-overlay";
  overlay.innerHTML = `
    <div class="arrow-controls">
      <div style="display:flex; flex-direction:column; gap:0.5rem; align-items:center;">
        <button class="channel-up">Channel Up</button>
        <button class="channel-down">Channel Down</button>
        <button class="volume-up">Volume Up</button>
        <button class="volume-down">Volume Down</button>
        <button class="toggle-mute">Toggle Mute</button>
      </div>
      <button class="arrow arrow-up" aria-label="Up">&#8593;</button>
      <div class="arrow-row">
        <button class="arrow arrow-left" aria-label="Left">&#8592;</button>
        <button class="arrow arrow-center" aria-label="Center">&#9679;</button>
        <button class="arrow arrow-right" aria-label="Right">&#8594;</button>
      </div>
      <button class="arrow arrow-down" aria-label="Down">&#8595;</button>
      <div style="margin-top:1rem; display:flex; flex-direction:column; gap:0.5rem; align-items:center;">
        <button class="toggle-grayscale">Toggle Grayscale</button>
        <button class="toggle-scanlines">Toggle Scanlines</button>
      </div>
    </div>
  `;
  // Place overlay after the video element if it exists, otherwise append
  if (wrapper.children.length > 0) {
    wrapper.insertBefore(overlay, wrapper.children[1] || null);
  } else {
    wrapper.appendChild(overlay);
  }

  const body = document.getElementsByTagName("body")[0];
  body.appendChild(wrapper);

  if (!Hls.isSupported()) {
    throw new Error("HLS is not supported in this browser.");
  }
  hls = new Hls();
  console.log("hls: ", hls);
  hls.loadSource(proxyURLFromStreamIndex(currentChannelIndex));
  hls.attachMedia(video);
  hls.on(Hls.Events.MANIFEST_PARSED, function () {
    video.muted = true;
    video.play();
    addTextTrackToVideoElement(video);
  });

  // Add event listeners for channel/volume/mute controls
  overlay
    .querySelector(".channel-down")
    ?.addEventListener("click", () => onChannelChange("down"));
  overlay
    .querySelector(".channel-up")
    ?.addEventListener("click", () => onChannelChange("up"));
  overlay
    .querySelector(".volume-down")
    ?.addEventListener("click", () => setVolume("down"));
  overlay
    .querySelector(".volume-up")
    ?.addEventListener("click", () => setVolume("up"));
  overlay
    .querySelector(".toggle-mute")
    ?.addEventListener("click", () => setMuted());

  // Add event listeners to arrow buttons
  const handleArrowClick = (
    direction: "up" | "down" | "left" | "right" | "center"
  ) => {
    console.log("Arrow pressed:", direction);
    const videoEl = document.getElementsByTagName("video")[0];
    const textTrack = videoEl.textTracks[0];
    deleteActiveCues(textTrack);

    textTrack.addCue(
      new VTTCue(
        videoEl.currentTime,
        videoEl.currentTime + 999,
        `Arrow Pressed: ${direction}`
      )
    );
  };

  for (const direction of ["up", "down", "left", "right", "center"] as const) {
    overlay
      .querySelector(`.arrow-${direction}`)
      ?.addEventListener("click", () => handleArrowClick(direction));
  }

  // Add event listener for Grayscale toggle
  const videoEl = wrapper.querySelector("video");
  const toggleGrayscaleButton = overlay.querySelector(
    ".toggle-grayscale"
  ) as HTMLButtonElement;

  toggleGrayscaleButton.addEventListener("click", () => toggleGrayscale());
  // Set initial grayscaleLevel
  videoEl?.style.setProperty("--grayscaleLevel", "0");

  // Add event listener for Scanlines toggle
  const scanlinesBtn = overlay.querySelector(
    ".toggle-scanlines"
  ) as HTMLButtonElement;
  scanlinesBtn.addEventListener("click", () => toggleScanlines());

  const menuStructure = {
    Channels: {
      "Brooklyn Bridge": () => setChannel(0),
      "World Trade Center": () => setChannel(1),
      "Wall Street Bull": () => setChannel(2),
      "Times Square": () => setChannel(3),
      "Times Square View (South)": () => setChannel(4),
      "Times Square View (North)": () => setChannel(5),
      "Times Square Street Cam": () => setChannel(6),
      "Times Square Crossroads": () => setChannel(7),
      "Midtown Skyline": () => setChannel(8),
      "Brooklyn Bridge View": () => setChannel(9),
    },
  };
};

createHLSVideoElement();
