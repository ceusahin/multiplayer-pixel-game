import React, { useState, useEffect } from "react";
import Canvas from "./Canvas";
import ColorPalette from "./ColorPalette";

const COLORS = [
  "#FF0000", // Kırmızı
  "#00FF00", // Yeşil
  "#0000FF", // Mavi
  "#FFFF00", // Sarı
  "#FF00FF", // Magenta
  "#00FFFF", // Cyan
  "#FFA500", // Turuncu
  "#800080", // Mor
  "#008000", // Koyu Yeşil
  "#000000", // Siyah
  "#FFFFFF", // Beyaz
  "#808080", // Gri
];

const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const App: React.FC = () => {
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [pixelCount, setPixelCount] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handlePixelPlaced = () => {
    setPixelCount((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-4">
          Piksel Sanat Oyunu
        </h1>

        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-8 text-xl font-semibold text-gray-700">
            <div>Yerleştirilen Piksel: {pixelCount}</div>
            <div>Geçen Süre: {formatTime(elapsedTime)}</div>
          </div>

          <div className="border-4 border-gray-300 rounded-lg overflow-hidden">
            <Canvas
              selectedColor={selectedColor}
              onPixelPlaced={handlePixelPlaced}
            />
          </div>

          <ColorPalette
            colors={COLORS}
            selectedColor={selectedColor}
            onColorSelect={setSelectedColor}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
