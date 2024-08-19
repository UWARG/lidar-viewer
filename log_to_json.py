# pylint: disable=all
"""
Running this script will convert obstacle avoidance output into a json file.
"""

import datetime
import json
import sys

file_path = None
try:
    file_path = sys.argv[1]
except IndexError:
    print("Error: provide a file path")
    print("Usage: python log_to_json.py <file_path>")

if file_path is None:
    print("Error: Unable to open log.")
    sys.exit()

file = open(file_path, 'r')

dists = []
angles = []
norths = []
easts = []
downs = []
modes = []
times = []

# initialize arrays
for _ in range(1000000):
    norths.append(0)
    easts.append(0)
    downs.append(0)
    modes.append('')
    times.append('')

index = 0

for line in file:
    line = line.strip()
    line = line.split()
    for i in range(len(line)):
        if line[i] == 'm' :
            i -= 1
            dists.append(float(line[i]))
            i += 1
        if line[i] == 'deg' :
            i -= 1
            angles.append(float(line[i]))   
            i += 1
        if line[i] == 'Distance:':
            i += 1
            dists.append(float(line[i][:-1]))
            index += 1
        if line[i] == 'Angle:':
            i += 1
            angles.append(float(line[i][:-1]))
        if line[i] == 'North:':
            i += 1
            norths[index] = (float(line[i][:-1]))
        if line[i] == 'East:':
            i += 1
            easts[index] = (float(line[i][:-1]))
        if line[i] == 'Down:':
            i += 1
            downs[index] = (float(line[i][:-2]))
        if line[i] == 'FlightMode.MOVING.':
            modes[index] = 'AUTO'
        if line[i] == 'FlightMode.STOPPED.':
            modes[index] = 'LOITER'
        if line[i] == 'Time:':
            i += 1
            epoch = float(line[i][:-1])
            time = datetime.datetime.fromtimestamp(epoch).strftime('%Y-%m-%d %H:%M:%S')
            times[index] = time

readings = []
for i in range(len(dists)):
    readings.append({'distance': dists[i],
                     "angle": angles[i],
                     'north': norths[i],
                     'east': easts[i],
                     'down': downs[i],
                     'mode': modes[i],
                     'time': times[i]})
    
json_data = json.dumps(readings, indent=4)

# Print the JSON string
print(json_data)





            
   

