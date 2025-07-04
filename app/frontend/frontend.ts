import Hls from "hls.js";
import { streams, type Stream } from "./streams";
import { setupCRTScene as setUpCRTScene } from "./crt-threejs";
import "./styles.css";

declare global {
  interface Window {
    _video: HTMLVideoElement;
  }
}

// === Constants and State ===
type VolumeDirection = "up" | "down";
const scanlinesClass = "scanlines";
// const scanlinesClass = "crt";

let hls: Hls;
let _video: HTMLVideoElement;
let _videoWrapper: HTMLDivElement;
let _textTrack: TextTrack;
let currentChannelIndex = 2;

// let scanlinesEnabled = true;
let grayscaleEnabled = false;
const VOLUME_INCREMENT = 5;
// Enable for WebGL CRT effect, disable for pure CSS effects
const THREE_JS_ENABLED = true;

// === Utility Functions ===
const proxyURLFromStreamIndex = (streamIndex: number) => {
  const proxy_url = "http://127.0.0.1:8182";
  const referer_url = "https://www.earthcam.com/";
  const file_extension = ".m3u8";
  return `${proxy_url}/${btoa(
    `${streams[streamIndex].streamUrl}|${referer_url}`
  )}${file_extension}`;
};

const createChannelInfoText = (
  channelNumber: Stream["channelNumber"],
  channelDescription: Stream["name"]
) => `Channel ${channelNumber} - ${channelDescription}`;

const deleteActiveCues = (textTrack: TextTrack) => {
  const activeCues = textTrack.activeCues || [];
  for (let i = 0; i < activeCues?.length || 0; i++) {
    textTrack.removeCue(activeCues[i]);
  }
};

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
    default:
      return;
  }
};

// === Channel, Volume, and Mute Controls ===
const setChannel = (channel: number) => {
  currentChannelIndex = channel;
  hls.loadSource(proxyURLFromStreamIndex(currentChannelIndex));
  hls.once(Hls.Events.MANIFEST_PARSED, function () {
    addTextTrackToVideoElement(_video);
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
  _video?.style.setProperty("--grayscaleLevel", grayscaleEnabled ? "1" : "0");
};

const toggleScanlines = () => {
  _videoWrapper.classList.toggle(scanlinesClass);
  const scanlineHeight = _video.clientHeight / 486; // 486 is the height of NTSC video
  console.log("Setting scanline height to:", scanlineHeight);
  _videoWrapper.style.setProperty("--scanlineHeight", scanlineHeight + "px");
  console.log(
    "Scanlines enabled:",
    _videoWrapper.classList.contains(scanlinesClass)
  );
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

function setUpTextTrackOverlay(
  video: HTMLVideoElement,
  container: HTMLElement
) {
  let overlay = document.getElementById("text-track-overlay") as HTMLDivElement;
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "text-track-overlay";
    container.appendChild(overlay);
  }
  // Find the first showing text track
  let track: TextTrack | undefined;
  for (let i = 0; i < video.textTracks.length; i++) {
    if (video.textTracks[i].mode === "showing") {
      track = video.textTracks[i];
      break;
    }
  }
  if (!track) return;
  function updateOverlay() {
    const active = track!.activeCues;
    if (active && active.length > 0) {
      overlay.innerHTML = Array.from(active)
        .map((cue: VTTCue | TextTrackCue) => (cue as VTTCue).text)
        .join("<br>");
      overlay.style.display = "block";
    } else {
      overlay.innerHTML = "";
      overlay.style.display = "none";
    }
  }
  track.addEventListener("cuechange", updateOverlay);
  // Initial update
  updateOverlay();
}

const init = () => {
  // Remove any existing video-wrapper to prevent duplicates
  const existingWrapper = document.querySelector(".video-wrapper");
  if (existingWrapper) existingWrapper.remove();

  const wrapper = document.createElement("div");
  wrapper.classList.add(
    "video-wrapper",
    scanlinesClass,
    // "crt-curved",
    "horizontal-hold"
  );

  const video = document.createElement("video");
  video.classList.add("grayscale", scanlinesClass);
  THREE_JS_ENABLED && video.classList.add("hidden-video");
  
  video.muted = true;

  wrapper.appendChild(video);
  // Global ref to video elem/wrapper
  _video = video;
  _videoWrapper = wrapper;
  window._video = video;

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

  document.body.appendChild(wrapper);

  if (!Hls.isSupported())
    throw new Error("HLS is not supported in this browser.");
  hls = new Hls();
  hls.loadSource(proxyURLFromStreamIndex(currentChannelIndex));
  hls.attachMedia(video);

  hls.on(Hls.Events.MANIFEST_PARSED, function () {
    video.play();
  });

  addTextTrackToVideoElement(video);
  addEventListeners(video, overlay);
  if (THREE_JS_ENABLED) {
    setUpCRTScene(video, wrapper);
    setUpTextTrackOverlay(video, wrapper);
  }
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

  const handleArrowClick = (
    direction: "up" | "down" | "left" | "right" | "center"
  ) => {
    deleteActiveCues(_textTrack);
    _textTrack.addCue(
      new VTTCue(
        _video.currentTime,
        _video.currentTime + 999,
        `Arrow Pressed: ${direction}`
      )
    );
  };
  for (const direction of ["up", "down", "left", "right", "center"] as const) {
    overlay
      .querySelector(`.arrow-${direction}`)
      ?.addEventListener("click", () => handleArrowClick(direction));
  }

  const toggleGrayscaleButton = overlay.querySelector(
    ".toggle-grayscale"
  ) as HTMLButtonElement;
  toggleGrayscaleButton.addEventListener("click", () => toggleGrayscale());
  videoEl?.style.setProperty("--grayscaleLevel", "0");

  // Scanline height update on video resize
  const updateScanlineHeight = () => {
    if (_videoWrapper.classList.contains(scanlinesClass)) {
      const scanlineHeight = _video.clientHeight / 486; // 486 is the height of NTSC video
      _videoWrapper.style.setProperty(
        "--scanlineHeight",
        scanlineHeight + "px"
      );
    }
  };
  const resizeObserver = new ResizeObserver(updateScanlineHeight);
  resizeObserver.observe(_video);

  const scanlinesBtn = overlay.querySelector(
    ".toggle-scanlines"
  ) as HTMLButtonElement;
  scanlinesBtn.addEventListener("click", () => toggleScanlines());
};

init();
