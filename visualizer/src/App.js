import React, { useState, useEffect, useCallback } from 'react';
import { Stage, Layer, Circle, Rect, Text } from 'react-konva';

const App = () => {
  // List to store all data received from the api
  const [scanData, setScanData] = useState([]);

  // List of points to display to the screen
  const [visiblePoints, setVisiblePoints] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Default canvas size
  const [canvasSize] = useState(1000);
  
  // Visualizer settings and default values
  const [scale, setScale] = useState(10);
  const [maxDistance] = useState(50);
  const [numOfVisiblePoints, setNumOfVisiblePoints] = useState(150);
  const [updateRate, setUpdateRate] = useState(20);

  // Odometry values
  const [northValue, setNorthValue] = useState(null);
  const [eastValue, setEastValue] = useState(null);
  const [downValue, setDownValue] = useState(null);
  const [modeValue, setModeValue] = useState(null);
  const [timeValue, setTimeValue] = useState(null);

  const [error, setError] = useState(null);

  // Fetch data from the server
  const fetchData = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3001/api/scan_data');
      console.log('fetched!');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setScanData(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching scan data:', error);
      setError(error.message);
    }
  }, []);

  // Sets the interval between each check to the server
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Slices list of lidar points and updates odometry values
  useEffect(() => {
    if (scanData.length > 0) {
      const updateVisiblePoints = () => {
        setCurrentIndex((prevIndex) => {
          const newIndex = (prevIndex + 1) % scanData.length;
          const endIndex = Math.min(newIndex + numOfVisiblePoints, scanData.length);
          const newVisiblePoints = scanData.slice(newIndex, endIndex);
          const odometry = newVisiblePoints[newVisiblePoints.length - 1];
          
          if (odometry) {
            if (odometry.north !== 0) {
              setNorthValue(Math.round(odometry.north * 100) / 100);
            }
            if (odometry.east !== 0) {
              setEastValue(Math.round(odometry.east * 100) / 100);
            }
            if (odometry.down !== 0) {
              setDownValue(Math.round(odometry.down * 100) / 100);
            }
            if (odometry.mode) {
              setModeValue(odometry.mode);
            }
            if (odometry.time !== 0) {
              setTimeValue(odometry.time);
            }
          }
          
          setVisiblePoints(newVisiblePoints);
          return newIndex;
        });
      };

      updateVisiblePoints();
      const interval = setInterval(updateVisiblePoints, updateRate); // Update every 200ms

      return () => clearInterval(interval);
    }
  }, [scanData]);

  // maps each lidar reading to x, y coordinates relative to drone's position
  const points = visiblePoints.map(point => ({
    x: point.distance * Math.sin(point.angle * Math.PI / 180) * scale + canvasSize / 2,
    y: point.distance * Math.cos(point.angle * Math.PI / 180) * scale * -1 + canvasSize / 2,
    north: point.north,
    east: point.east,
    down: point.down,
    mode: point.mode,
    time: point.time
  }));

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      {/* Display odometry values, if available */}
      {northValue !== null && <h1>North: {northValue}</h1>}
      {eastValue !== null && <h1>East: {eastValue}</h1>}
      {downValue !== null && <h1>Down: {downValue}</h1>}
      {modeValue !== null && <h1>Mode: {modeValue}</h1>}
      {timeValue !== null && <h1>Time: {timeValue}</h1>}
      <div>
        {/* Input for changing scale of visualizer */}
        <label>
          Scale:
          <input
            type="number"
            value={scale}
            onChange={(e) => setScale(Number(e.target.value))}
            min="1"
          />
        </label>
        {/* Input for changing update rate of visualizer */}
        <label>
          Update Rate:
          <input
            type="number"
            value={updateRate}
            onChange={(e) => setUpdateRate(Number(e.target.value))}
            min="1"
          />
        </label>
        {/* Input for changing number of visible points on visualizer */}
        <label>
          Number of Visible Points:
          <input
            type="number"
            value={numOfVisiblePoints}
            onChange={(e) => setNumOfVisiblePoints(Number(e.target.value))}
            min="1"
          />
        </label>
      </div>
      <Stage width={canvasSize} height={canvasSize}>
        <Layer>
          {/* Circles to display distance markings */}
          <Circle
            x={canvasSize / 2}
            y={canvasSize / 2}
            radius={maxDistance * scale}
            fill="transparent"
            stroke="black"
            strokeWidth={4}
          />
          <Circle
            x={canvasSize / 2}
            y={canvasSize / 2}
            radius={maxDistance * scale / 2}
            fill="transparent"
            stroke="black"
            strokeWidth={0.5}
          />
          <Circle
            x={canvasSize / 2}
            y={canvasSize / 2}
            radius={maxDistance * scale / 5}
            fill="transparent"
            stroke="black"
            strokeWidth={0.5}
          />
          {/* These circles are displayed if it's zoomed in */}
          { scale > 20 && <Circle
            x={canvasSize / 2}
            y={canvasSize / 2}
            radius={maxDistance * scale / 10}
            fill="transparent"
            stroke="black"
            strokeWidth={0.5}
          />}
          { scale > 40 && <Circle
            x={canvasSize / 2}
            y={canvasSize / 2}
            radius={maxDistance * scale / 20}
            fill="transparent"
            stroke="black"
            strokeWidth={0.5}
          />}
          {/* Text boxes to display distance markings */}
          <Text
            x={canvasSize / 2 + maxDistance * scale}
            y={canvasSize / 2}
            text={`${maxDistance}m`}
            fontSize={12}
          />
          <Text
            x={canvasSize / 2 + maxDistance * scale / 2}
            y={canvasSize / 2}
            text={`${maxDistance / 2}m`}
            fontSize={12}
          />
          <Text
            x={canvasSize / 2 + maxDistance * scale / 5}
            y={canvasSize / 2}
            text={`${maxDistance / 5}m`}
            fontSize={12}
          />
          {/* These text boxes are displayed if it's zoomed in */}
          {scale > 20 && <Text
            x={canvasSize / 2 + maxDistance * scale / 10}
            y={canvasSize / 2}
            text={`${maxDistance / 10}m`}
            fontSize={12}
          />}
          {scale > 40 && <Text
            x={canvasSize / 2 + maxDistance * scale / 20}
            y={canvasSize / 2}
            text={`${maxDistance / 20}m`}
            fontSize={12}
          />}
          {/* Map each point to the screen */}
          {points.map((point, index) => (
            <Circle
              key={index}
              x={point.x}
              y={point.y}
              radius={2}
              fill="red"
            />
          ))}
          {/* Display the drone */}
          <Rect x={canvasSize / 2 - 10} y={canvasSize / 2 - 10} height={20} width={20} fill="black" />
        </Layer>
      </Stage>
    </div>
  );
};

export default App;