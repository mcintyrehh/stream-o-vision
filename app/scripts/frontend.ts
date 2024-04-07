//TODO set up webpack so I can import this from a const file
const streams = [
  {
    streamUrl:
      "https://videos3.earthcam.com/fecnetwork/20489.flv/playlist.m3u8",
    url: "https://www.earthcam.com/usa/newyork/empirestatebuilding/?cam=esb37",
    name: "Empire State Building",
    channelNumber: 0,
  },
  {
    streamUrl: "https://videos3.earthcam.com/fecnetwork/3983.flv/playlist.m3u8",
    url: "https://www.earthcam.com/usa/newyork/brooklynbridge/?cam=gzcchd",
    name: "Brooklyn Bridge",
    channelNumber: 1,
  },
  {
    streamUrl:
      "https://videos3.earthcam.com/fecnetwork/10874.flv/playlist.m3u8",
    url: "https://www.earthcam.com/usa/newyork/worldtradecenter/?cam=skyline_g",
    name: "World Trade Center",
    channelNumber: 2,
  },
  {
    streamUrl:
      "https://videos-3.earthcam.com/fecnetwork/22640.flv/playlist.m3u8?",
    url: "https://www.earthcam.com/usa/newyork/highline/?cam=highline",
    name: "High Line Cam",
    channelNumber: 3,
  },
  {
    streamUrl:
      "https://videos3.earthcam.com/fecnetwork/hdtimes10.flv/playlist.m3u8",
    url: "https://www.earthcam.com/usa/newyork/timessquare/?cam=tsrobo1",
    name: "Times Square",
    channelNumber: 4,
  },
  {
    streamUrl:
      "https://videos3.earthcam.com/fecnetwork/4017timessquare.flv/playlist.m3u8",
    url: "https://www.earthcam.com/cams/newyork/timessquare/?cam=tstwo_hd",
    name: "Times Square View (South)",
    channelNumber: 5,
  },
  {
    streamUrl:
      "http://videos3.earthcam.com/fecnetwork/hdtimes10.flv/playlist.m3u8",
    url: "https://www.earthcam.com/cams/newyork/timessquare/?cam=tsnorth_hd",
    name: "Times Square View (North)",
    channelNumber: 6,
  },
  {
    streamUrl: "https://videos3.earthcam.com/fecnetwork/9974.flv/playlist.m3u8",
    url: "https://www.earthcam.com/cams/newyork/timessquare/?cam=tsstreet",
    name: "Times Square Street Cam",
    channelNumber: 7,
  },
  {
    streamUrl:
      "https://videos3.earthcam.com/fecnetwork/15559.flv/playlist.m3u8",
    url: "https://www.earthcam.com/cams/newyork/timessquare/?cam=tsrobo3",
    name: "Times Square Crossroads",
    channelNumber: 8,
  },
  {
    streamUrl:
      "https://videos3.earthcam.com/fecnetwork/13903.flv/playlist.m3u8",
    url: "https://www.earthcam.com/usa/newyork/midtown/skyline/?cam=midtown4k",
    name: "Midtown Skyline",
    channelNumber: 9,
  },
  {
    streamUrl:
      "https://videos-3.earthcam.com/fecnetwork/4089.flv/playlist.m3u8",
    url: "https://www.earthcam.com/usa/newyork/midtown/skyline/?cam=midtown4k",
    name: "Statue of Liberty",
    channelNumber: 10,
  },
];

//@ts-ignore
let hls: any;

let currentChannelIndex = 2;

const wrapper = document.getElementsByClassName("video-wrapper")[0] as HTMLDivElement;
wrapper.style.display = "flex";
wrapper.style.flexWrap = "nowrap";
wrapper.style.flexDirection = "column";
wrapper.style.position = "relative";
wrapper.style.height = "100vh";
wrapper.style.width = "100vw";
wrapper.style.backgroundImage = "url('./scripts/static-tv-static.gif')";

const proxyURLFromStreamIndex = (streamIndex: number) => {
  const proxy_url = "http://127.0.0.1:8182";
  const referer_url = "https://www.earthcam.com/";
  const file_extension = ".m3u8";

  return `${proxy_url}/${btoa(
    `${streams[streamIndex].streamUrl}|${referer_url}`,
  )}${file_extension}`;
};

const onChannelChange = (direction: "up" | "down") => {
  const channelDirection = direction === "up" ? 1 : -1;
  // Adding streams.length makes sure wrap-around works for negative numbers
  currentChannelIndex =
    (currentChannelIndex + channelDirection + streams.length) % streams.length;
  createHLSVideoElement();
};

const createHLSVideoElement = () => {
  const videoElement = document.getElementsByClassName("video-wrapper")[0];
  if (videoElement) {
    videoElement.parentNode?.removeChild(videoElement);
  }
  if (hls) {
    hls.destroy();
  }
  var wrapper = document.createElement("div");
  wrapper.className = "video-wrapper";
  

  var video = document.createElement("video");
  video.style.height = "100%";
  video.style.width = "100%";
  video.style.backgroundImage = "url('./scripts/static-tv-static.gif')"

  wrapper.appendChild(video);
  // creating info divs below the video
  var videoInfo = document.createElement("div");
  var channelNumber = document.createElement("span");
  channelNumber.className = "channel-div";
  channelNumber.innerHTML = `Channel ${streams[currentChannelIndex].channelNumber}`;
  videoInfo.appendChild(channelNumber);
  var videoName = document.createElement("span");
  videoName.innerHTML = ` - ${streams[currentChannelIndex].name}`;
  videoInfo.appendChild(videoName);
  wrapper.appendChild(videoInfo);

  // creating channel up and down buttons
  const channelDown = document.createElement("button");
  channelDown.innerHTML = "Channel Down";
  channelDown.onclick = () => onChannelChange("down");
  wrapper.appendChild(channelDown);

  const channelUp = document.createElement("button");
  channelUp.innerHTML = "Channel Up";
  channelUp.onclick = () => onChannelChange("up");
  wrapper.appendChild(channelUp);

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
