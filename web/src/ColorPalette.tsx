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
    <div className="flex flex-wrap gap-2 p-4 bg-white rounded-lg shadow-md">
      {colors.map((color) => (
        <button
          key={color}
          className={`w-10 h-10 rounded-full border-2 ${
            color === selectedColor ? "border-blue-500" : "border-gray-300"
          }`}
          style={{ backgroundColor: color }}
          onClick={() => onColorSelect(color)}
          aria-label={`Renk seç: ${color}`}
        />
      ))}
    </div>
  );
};

export default ColorPalette;
