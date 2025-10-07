import Hls from "hls.js";
import { streams } from "./streams";
import { createDebugOverlay } from "./debug-overlay";
import {
  getHlsProxyUrl,
  createChannelInfoText,
  deleteActiveCues,
  setUpTextTrackOverlay,
} from "./utils";
import {
  setUpCRTScene,
  setGrayscaleShader,
  setHorizontalHoldShader,
  setVerticalHoldShader,
  setExtremeHorizontalMeltdownShader,
  setBarrelDistortionShader,
  setScanlinesShader,
  clearCRTRenderer,
  resumeCRTRenderer,
} from "./crt-threejs";
import "./styles.css";

declare global {
  interface Window {
    _video: HTMLVideoElement;
  }
}
type VolumeDirection = "up" | "down";

// === Constants and State ===
const VOLUME_INCREMENT = 5;
const HOLD_INCREMENT = 2;
// seconds to delay between stream changes for maximum static gif effect
const STREAM_CHANGE_DELAY_SECONDS = 1;

let hls: Hls;
let _video: HTMLVideoElement;
let _textTrack: TextTrack;
let currentChannelIndex = 2;

// let scanlinesEnabled = true;
let grayscaleEnabled = false;
let horizontalHoldLevel = 0;
let verticalHoldLevel = 0;
let extremeHorizontalMeltdown = false; // For horizontal meltdown effect
let barrelDistortionEnabled = true; // For barrel distortion effect
let scanlinesEnabled = true;
let webcamModeEnabled = true;

// === WebSocket Handling ===
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
    case "barrel_distortion":
      toggleBarrelDistortion();
      break;
    case "bumpinator":
      triggerPercussiveMaintenance();
      break;
    default:
      return;
  }
};

// === Channel, Volume, and Mute Controls ===
const setChannel = async (channel: number) => {
  currentChannelIndex = channel;

  // Pause the video to prevent old content from showing
  _video.pause();

  // Make sure we wait for at least the stream change delay before resuming rendering for maximum static gif effect
  const streamDelayPromise = new Promise<void>((resolve) =>
    setTimeout(() => resolve(), STREAM_CHANGE_DELAY_SECONDS * 1000)
  );

  // Clear the WebGL renderer to show static background during channel change
  clearCRTRenderer();

  hls.loadSource(getHlsProxyUrl(streams[currentChannelIndex].streamUrl));
  hls.once(Hls.Events.MANIFEST_PARSED, async function () {
    await streamDelayPromise;
    resumeCRTRenderer();
    addTextTrackToVideoElement(_video);
    // Resume video playback
    _video.play();
  });
};

const toggleWebcamMode = () => {
  webcamModeEnabled = !webcamModeEnabled;
  console.log("Webcam mode enabled:", webcamModeEnabled);
  if (!webcamModeEnabled) {
    _video.srcObject = null;
    initHls(_video);
    return;
  }
  enableWebcamMode();
};

const enableWebcamMode = () => {
  // update the video element source to use the webcam
  const constraints = {
    video: { width: 1280, height: 720, facingMode: "user" },
  };
  const userMedia = navigator.mediaDevices.getUserMedia(constraints);
  userMedia
    .then((stream) => {
      _video.srcObject = stream;
      _video.play(); // Ensure the video starts playing
    })
    .catch((error) => {
      console.error("Error accessing webcam:", error);
    });
};

const setVolume = (volume: VolumeDirection) => {
  // @todo: change this to logarithmic!
  // @see: https://github.com/videojs/video.js/issues/8498
  const currVolume = _video.volume;
  const volumeDiff = (volume === "up" ? 0.01 : -0.01) * VOLUME_INCREMENT;
  _video.volume = Math.max(Math.min(currVolume + volumeDiff, 1), 0);
  console.log("volume: ", Math.round(_video.volume * 100) / 100);

  deleteActiveCues(_textTrack);
  _textTrack.addCue(
    new VTTCue(
      _video.currentTime,
      _video.currentTime + 2,
      `Volume: ${Math.round(_video.volume * 100)}`
    )
  );
};

const setMuted = () => {
  _video.muted = !_video.muted;
  deleteActiveCues(_textTrack);
  _textTrack.addCue(
    new VTTCue(
      _video.currentTime,
      _video.currentTime + 2,
      `Muted: ${_video.muted}`
    )
  );
};

const toggleGrayscale = () => {
  grayscaleEnabled = !grayscaleEnabled;
  setGrayscaleShader(grayscaleEnabled);
  console.log("Grayscale toggled:", grayscaleEnabled);

  // Also show feedback via text track
  deleteActiveCues(_textTrack);
  _textTrack.addCue(
    new VTTCue(
      _video.currentTime,
      _video.currentTime + 2,
      `Grayscale: ${grayscaleEnabled ? "On" : "Off"}`
    )
  );
};

const toggleScanlines = () => {
  scanlinesEnabled = !scanlinesEnabled;
  setScanlinesShader(scanlinesEnabled);
  console.log(`Scanlines enabled: ${scanlinesEnabled}`);
};

const setHorizontalHold = (direction: "up" | "down") => {
  const holdDiff = direction === "up" ? HOLD_INCREMENT : -HOLD_INCREMENT;
  horizontalHoldLevel = horizontalHoldLevel + holdDiff;

  // Use Three.js shader for horizontal hold effect
  setHorizontalHoldShader(horizontalHoldLevel);

  // Also show feedback via text track
  deleteActiveCues(_textTrack);
  _textTrack.addCue(
    new VTTCue(
      _video.currentTime,
      _video.currentTime + 2,
      `Horizontal Hold: ${horizontalHoldLevel}`
    )
  );

  console.log("Horizontal hold level:", horizontalHoldLevel);
};

const setVerticalHold = (direction: "up" | "down") => {
  const holdDiff = direction === "up" ? HOLD_INCREMENT : -HOLD_INCREMENT;
  verticalHoldLevel = verticalHoldLevel + holdDiff;

  // Use Three.js shader for vertical hold effect
  setVerticalHoldShader(verticalHoldLevel);

  // Also show feedback via text track
  deleteActiveCues(_textTrack);
  _textTrack.addCue(
    new VTTCue(
      _video.currentTime,
      _video.currentTime + 2,
      `Vertical Hold: ${verticalHoldLevel}`
    )
  );

  console.log("Vertical hold level:", verticalHoldLevel);
};

const setExtremeHorizontalMeltdown = (enabled: boolean) => {
  extremeHorizontalMeltdown = enabled;

  setExtremeHorizontalMeltdownShader(extremeHorizontalMeltdown);

  // Also show feedback via text track
  deleteActiveCues(_textTrack);
  _textTrack.addCue(
    new VTTCue(
      _video.currentTime,
      _video.currentTime + 2,
      `Extreme Horizontal Meltdown: ${extremeHorizontalMeltdown ? "On" : "Off"}`
    )
  );

  console.log("Extreme horizontal meltdown:", extremeHorizontalMeltdown);
};

const triggerPercussiveMaintenance = () => {
  // Simulate a "percussive maintenance" effect
  console.log("Triggering percussive maintenance!");
  horizontalHoldLevel = 0; // Reset horizontal hold
  verticalHoldLevel = 0; // Reset vertical hold
  setHorizontalHoldShader(horizontalHoldLevel);
  setVerticalHoldShader(verticalHoldLevel);
  setExtremeHorizontalMeltdown(false); // Disable meltdown effect
};

const toggleBarrelDistortion = () => {
  // Simulate a "barrel distortion" effect
  console.log("Toggling barrel distortion!");
  barrelDistortionEnabled = !barrelDistortionEnabled;
  setBarrelDistortionShader(barrelDistortionEnabled);
};

// === Video Element and Overlay Setup ===
const addTextTrackToVideoElement = (videoEl: HTMLVideoElement) => {
  // Remove all existing cues from all caption tracks
  for (let i = 0; i < videoEl.textTracks.length; i++) {
    const track = videoEl.textTracks[i];
    if (track.kind === "captions") {
      while (track.cues && track.cues.length > 0) {
        track.removeCue(track.cues[0]);
      }
      track.mode = "showing";
      _textTrack = track;
    }
  }
  // If no caption track exists, add one
  if (!_textTrack || !_textTrack.cues) {
    _textTrack = videoEl.addTextTrack("captions", "Channel Info", "en-US");
    _textTrack.mode = "showing";
  }
  const { channelNumber, name } = streams[currentChannelIndex];
  _textTrack.addCue(
    new VTTCue(0, 10, createChannelInfoText(channelNumber, name))
  );
};

const onChannelChange = (direction: "up" | "down") => {
  const channelDirection = direction === "up" ? 1 : -1;
  // Adding streams.length makes sure wrap-around works for negative numbers
  const newChannelIndex =
    (currentChannelIndex + channelDirection + streams.length) % streams.length;
  setChannel(newChannelIndex);
};

const init = () => {
  const wrapper = document.createElement("div");
  wrapper.classList.add("video-wrapper");

  const video = document.createElement("video");
  video.classList.add("hidden-video");

  video.muted = true;

  wrapper.appendChild(video);

  // Create TV overlay with transparent hole
  const tvOverlay = document.createElement("div");
  tvOverlay.classList.add("tv-overlay");

  // Global ref to video elem/wrapper
  _video = video;
  window._video = video;

  const debugOverlay = createDebugOverlay();

  wrapper.appendChild(debugOverlay);
  document.body.appendChild(wrapper);
  document.body.appendChild(tvOverlay); // Add TV overlay on top

  if (webcamModeEnabled) {
    enableWebcamMode();
  } else {
    initHls(video);
  }

  const shaderInits = {
    scanlines: scanlinesEnabled,
    barrelDistortion: barrelDistortionEnabled,
    grayscale: grayscaleEnabled,
  };

  addTextTrackToVideoElement(video);
  addEventListeners(video, debugOverlay);
  setUpCRTScene(video, wrapper, shaderInits);
  setUpTextTrackOverlay(video, wrapper);
};

const initHls = (video) => {
  hls = new Hls();
  hls.loadSource(getHlsProxyUrl(streams[currentChannelIndex].streamUrl));
  hls.attachMedia(video);

  hls.on(Hls.Events.MANIFEST_PARSED, function () {
    video.play();
  });
};

// === Event Listeners ===
const addEventListeners = (
  videoEl: HTMLVideoElement,
  overlay: HTMLDivElement
) => {
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
  overlay
    .querySelector(".horizontal-hold-up")
    ?.addEventListener("click", () => setHorizontalHold("up"));
  overlay
    .querySelector(".horizontal-hold-down")
    ?.addEventListener("click", () => setHorizontalHold("down"));
  overlay
    .querySelector(".vertical-hold-up")
    ?.addEventListener("click", () => setVerticalHold("up"));
  overlay
    .querySelector(".vertical-hold-down")
    ?.addEventListener("click", () => setVerticalHold("down"));
  overlay
    .querySelector(".extreme-horizontal-meltdown")
    ?.addEventListener("click", () =>
      setExtremeHorizontalMeltdown(!extremeHorizontalMeltdown)
    );
  overlay
    .querySelector(".percussive-maintenance")
    ?.addEventListener("click", () => triggerPercussiveMaintenance());
  overlay
    .querySelector(".toggle-scanlines")
    ?.addEventListener("click", () => toggleScanlines());
  overlay
    .querySelector(".barrel-distortion")
    ?.addEventListener("click", () => toggleBarrelDistortion());
  overlay
    .querySelector(".webcam-mode")
    ?.addEventListener("click", () => toggleWebcamMode());

  const toggleGrayscaleButton = overlay.querySelector(
    ".toggle-grayscale"
  ) as HTMLButtonElement;
  toggleGrayscaleButton.addEventListener("click", () => toggleGrayscale());

  // Add keyboard shortcuts
  document.addEventListener("keydown", (event) => {
    switch (event.key.toLowerCase()) {
      case "g":
        toggleGrayscale();
        break;
      case "b":
        toggleBarrelDistortion();
        break;
      case "s":
        toggleScanlines();
        break;
      case "h":
        setHorizontalHold("up");
        break;
      case "v":
        setVerticalHold("up");
        break;
      case "e":
        setExtremeHorizontalMeltdown(!extremeHorizontalMeltdown);
        break;
      case "p":
        triggerPercussiveMaintenance();
        break;
      case "w":
        toggleWebcamMode();
        break;
      case "arrowup":
        onChannelChange("up");
        break;
      case "arrowdown":
        onChannelChange("down");
        break;
      case "m":
        setMuted();
        break;
    }
  });
};

init();
