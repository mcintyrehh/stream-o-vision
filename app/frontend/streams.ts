export type Stream = {
  streamUrl: string;
  url: string;
  name: string;
  channelNumber: number;
};

export const streams: Stream[] = [
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
      "https://videos3.earthcam.com/fecnetwork/chargingbull.flv/playlist.m3u8",
    url: "https://www.earthcam.com/usa/newyork/wallstreet/chargingbull/?cam=chargingbull_hd",
    name: "Wall Street Bull",
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
      "https://videos-3.earthcam.com/fecnetwork/21380.flv/playlist.m3u8",
    url: "https://www.earthcam.com/usa/newyork/coneyisland/?cam=coneyisland",
    name: "Coney Island",
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
