#!/bin/bash

# check file path is provided
if [ -z "$1" ]; then
    echo "Usage: ./process_log.sh <input_file_path> [--start]"
    exit 1
fi

INPUT_FILE_PATH=$1
START_SERVER=$2

python log_to_json.py "$INPUT_FILE_PATH" > server/scans.json

if [ $? -ne 0 ]; then
    echo "log_to_json.py script failed."
    exit 1
fi

echo "server/scans.json has been updated with the output of $INPUT_FILE_PATH."

if [ "$START_SERVER" == "--start" ]; then
    cd server

    node server.js

    echo "Node.js server started."
else
    echo "Server start flag not provided. Skipping server start."
fi
