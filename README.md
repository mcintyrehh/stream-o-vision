# stream-o-vision

Notes: 

07Apr2024 - Added scripts/install-*.sh to set up headless Raspberry Pi Lite w/ minimal GUI to launch 
            chromium-browser. These are close, but running into the error below. Will continue to develop
            in full Raspberry Pi OS and come back to this later as an optimization.
            Scripts based on: https://github.com/pureartisan/magic-mirror-raspbian-lite
            Error: 
            dpkg-query: no packages found matching bluealsa
            [11775:11775:0407/181930.437614:ERROR:ozone_platform_x11.cc(243)] Missing X server or $DISPLAY
            [11775:11775:0407/181930.437764:ERROR:env.cc(257)] The platform failed to initialize.  Exiting.