import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

interface CanvasProps {
  selectedColor: string;
  onPixelPlaced: () => void;
}

const CANVAS_SIZE = 500;
const GRID_SIZE = 25;
const PIXEL_SIZE = CANVAS_SIZE / GRID_SIZE;

const Canvas: React.FC<CanvasProps> = ({ selectedColor, onPixelPlaced }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [socket, setSocket] = useState<any>(null);
  const [canvasState, setCanvasState] = useState<string[][]>(
    Array(GRID_SIZE)
      .fill(null)
      .map(() => Array(GRID_SIZE).fill("#FFFFFF"))
  );

  const logCanvasState = () => {
    console.log("Canvas Durumu:");
    let output = "";
    for (let y = 0; y < GRID_SIZE; y++) {
      let row = "";
      for (let x = 0; x < GRID_SIZE; x++) {
        const color = canvasState[y][x];
        row += `[${color}] `;
      }
      output += row + "\n";
    }
    console.log(output);

    // Renk paleti istatistikleri
    const colorCount: { [key: string]: number } = {};
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const color = canvasState[y][x];
        colorCount[color] = (colorCount[color] || 0) + 1;
      }
    }

    console.log("\nRenk Dağılımı:");
    Object.entries(colorCount).forEach(([color, count]) => {
      console.log(
        `%c${color}: ${count} piksel`,
        `color: ${color}; font-weight: bold`
      );
    });
  };

  const updatePixel = (x: number, y: number, color: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = color;
    ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);

    // Canvas state'ini güncelle
    setCanvasState((prev) => {
      const newState = [...prev];
      newState[y][x] = color;
      return newState;
    });

    // Yeni durumu konsola yazdır
    logCanvasState();
  };

  useEffect(() => {
    const newSocket = io(BACKEND_URL);
    setSocket(newSocket);

    newSocket.on("pixel:update", ({ x, y, color }) => {
      updatePixel(x, y, color);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Arka planı beyaz yap
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Izgara çiz
    ctx.strokeStyle = "#EEEEEE";
    for (let i = 0; i <= CANVAS_SIZE; i += PIXEL_SIZE) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, CANVAS_SIZE);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(CANVAS_SIZE, i);
      ctx.stroke();
    }
  }, []);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / PIXEL_SIZE);
    const y = Math.floor((event.clientY - rect.top) / PIXEL_SIZE);

    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return;

    socket?.emit("pixel:place", { x, y, color: selectedColor });
    updatePixel(x, y, selectedColor);
    onPixelPlaced();
  };

  return (
    <div style={{ overflow: "auto" }}>
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        style={{
          cursor: "pointer",
        }}
        onClick={handleCanvasClick}
      />
    </div>
  );
};

export default Canvas;
