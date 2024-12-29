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
    <div className="min-h-screen bg-gray-100 p-2 sm:p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-xl sm:text-3xl font-bold text-center mb-2 sm:mb-4">
          Piksel Sanat Oyunu
        </h1>

        <div className="flex flex-col items-center gap-2 sm:gap-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-8 text-base sm:text-xl font-semibold text-gray-700 text-center">
            <div>Yerleştirilen Piksel: {pixelCount}</div>
            <div>Geçen Süre: {formatTime(elapsedTime)}</div>
          </div>

          <div className="w-full sm:w-auto border-2 sm:border-4 border-gray-300 rounded-lg overflow-hidden">
            <div className="max-w-full overflow-x-auto">
              <Canvas
                selectedColor={selectedColor}
                onPixelPlaced={handlePixelPlaced}
              />
            </div>
          </div>

          <div className="w-full sm:w-auto">
            <ColorPalette
              colors={COLORS}
              selectedColor={selectedColor}
              onColorSelect={setSelectedColor}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
