#!/bin/bash

SOURCE_DIR="./microcontroller/"
TARGET_DIR="/media/$USER/CIRCUITPY/"
echo "Source Directory: $SOURCE_DIR"
echo "Target Directory: $TARGET_DIR"

# # Initial sync
rsync -av --delete "$SOURCE_DIR" "$TARGET_DIR"

# Watch for changes and sync automatically
inotifywait -m -r -e modify,create,delete "$SOURCE_DIR" | while read -r directory events filename; do
    rsync -av --delete "$SOURCE_DIR" "$TARGET_DIR"
done