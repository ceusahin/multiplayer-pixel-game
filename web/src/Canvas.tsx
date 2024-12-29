import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

interface CanvasProps {
  selectedColor: string;
  onPixelPlaced: () => void;
}

const CANVAS_SIZE = 500;
const GRID_SIZE = 100;
const PIXEL_SIZE = CANVAS_SIZE / GRID_SIZE;

const Canvas: React.FC<CanvasProps> = ({ selectedColor, onPixelPlaced }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [socket, setSocket] = useState<any>(null);
  const [canvasState, setCanvasState] = useState<string[][]>(
    Array(GRID_SIZE)
      .fill(null)
      .map(() => Array(GRID_SIZE).fill("#FFFFFF"))
  );
  const [scale, setScale] = useState(1);

  // Mobil cihazlarda canvas'ı ekrana sığdır
  useEffect(() => {
    const updateCanvasScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const newScale = Math.min(1, containerWidth / CANVAS_SIZE);
        setScale(newScale);
      }
    };

    updateCanvasScale();
    window.addEventListener("resize", updateCanvasScale);
    return () => window.removeEventListener("resize", updateCanvasScale);
  }, []);

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

    setCanvasState((prev) => {
      const newState = [...prev];
      newState[y][x] = color;
      return newState;
    });

    logCanvasState();
  };

  useEffect(() => {
    const newSocket = io(BACKEND_URL);
    setSocket(newSocket);

    // Başlangıç canvas durumunu al
    newSocket.on("init", ({ grid }) => {
      if (!grid) return;
      grid.forEach((row: string[], y: number) => {
        row.forEach((color: string, x: number) => {
          updatePixel(x, y, color);
        });
      });
    });

    // Periyodik canvas güncellemelerini al
    newSocket.on("canvas:update", ({ grid }) => {
      if (!grid) return;
      grid.forEach((row: string[], y: number) => {
        row.forEach((color: string, x: number) => {
          updatePixel(x, y, color);
        });
      });
    });

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
    const x = Math.floor((event.clientX - rect.left) / (PIXEL_SIZE * scale));
    const y = Math.floor((event.clientY - rect.top) / (PIXEL_SIZE * scale));

    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return;

    socket?.emit("pixel:place", { x, y, color: selectedColor });
    updatePixel(x, y, selectedColor);
    onPixelPlaced();
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const touch = event.touches[0];
    const x = Math.floor((touch.clientX - rect.left) / (PIXEL_SIZE * scale));
    const y = Math.floor((touch.clientY - rect.top) / (PIXEL_SIZE * scale));

    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return;

    socket?.emit("pixel:place", { x, y, color: selectedColor });
    updatePixel(x, y, selectedColor);
    onPixelPlaced();
  };

  return (
    <div
      ref={containerRef}
      className="w-full flex justify-center items-center touch-none"
      style={{ maxWidth: "100vw" }}
    >
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        style={{
          cursor: "pointer",
          transform: `scale(${scale})`,
          transformOrigin: "center",
          touchAction: "none",
        }}
        onClick={handleCanvasClick}
        onTouchStart={handleTouchStart}
      />
    </div>
  );
};

export default Canvas;
