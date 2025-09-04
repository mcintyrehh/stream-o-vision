import type { Stream } from "./streams";

export const getHlsProxyUrl = (streamUrl: string) => {
  const proxy_url = "http://127.0.0.1:8182";
  const referer_url = "https://www.earthcam.com/";
  const file_extension = ".m3u8";
  return `${proxy_url}/${btoa(`${streamUrl}|${referer_url}`)}${file_extension}`;
};

export const createChannelInfoText = (
  channelNumber: Stream["channelNumber"],
  channelDescription: Stream["name"]
) => `Channel ${channelNumber} - ${channelDescription}`;

export const deleteActiveCues = (textTrack: TextTrack) => {
  const activeCues = textTrack.activeCues || [];
  for (let i = 0; i < activeCues?.length || 0; i++) {
    textTrack.removeCue(activeCues[i]);
  }
};

function updateOverlay(overlay: HTMLDivElement, track: TextTrack) {
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

export function setUpTextTrackOverlay(
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

  track.addEventListener("cuechange", () => updateOverlay(overlay, track));
  // Initial update
  updateOverlay(overlay, track);
}
