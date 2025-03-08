#!/bin/bash

SOURCE_DIR="/media/$USER/CIRCUITPY/"
TARGET_DIR="./microcontroller/"
echo "Source Directory: $SOURCE_DIR"
echo "Target Directory: $TARGET_DIR"

# # Initial sync
rsync -av --delete "$SOURCE_DIR" "$TARGET_DIR"

# Watch for changes and sync automatically
inotifywait -m -r -e modify,create,delete "$SOURCE_DIR" | while read -r directory events filename; do
    rsync -av --delete "$SOURCE_DIR" "$TARGET_DIR"
done