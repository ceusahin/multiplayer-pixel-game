import React from "react";

interface ColorPaletteProps {
  colors: string[];
  selectedColor: string;
  onColorSelect: (color: string) => void;
}

const ColorPalette: React.FC<ColorPaletteProps> = ({
  colors,
  selectedColor,
  onColorSelect,
}) => {
  return (
    <div className="flex flex-wrap justify-center gap-2 p-2 sm:p-4 bg-white rounded-lg shadow-md w-full">
      {colors.map((color) => (
        <button
          key={color}
          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 ${
            color === selectedColor ? "border-blue-500" : "border-gray-300"
          } transition-transform hover:scale-110`}
          style={{ backgroundColor: color }}
          onClick={() => onColorSelect(color)}
          aria-label={`Renk seç: ${color}`}
        />
      ))}
    </div>
  );
};

export default ColorPalette;
