import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

interface CanvasProps {
  selectedColor: string;
  onPixelPlaced: () => void;
}

const CANVAS_SIZE = 500;
const GRID_SIZE = 50;
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

  const drawGrid = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = "#EEEEEE";
    const pixelWidth = canvas.width / GRID_SIZE;
    const pixelHeight = canvas.height / GRID_SIZE;

    // Yatay çizgiler
    for (let y = 0; y <= GRID_SIZE; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * pixelHeight);
      ctx.lineTo(canvas.width, y * pixelHeight);
      ctx.stroke();
    }

    // Dikey çizgiler
    for (let x = 0; x <= GRID_SIZE; x++) {
      ctx.beginPath();
      ctx.moveTo(x * pixelWidth, 0);
      ctx.lineTo(x * pixelWidth, canvas.height);
      ctx.stroke();
    }
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Arka planı temizle
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Grid çiz
    drawGrid();

    // Pikselleri çiz
    const pixelWidth = canvas.width / GRID_SIZE;
    const pixelHeight = canvas.height / GRID_SIZE;

    canvasState.forEach((row, y) => {
      row.forEach((color, x) => {
        if (color !== "#FFFFFF") {
          ctx.fillStyle = color;
          ctx.fillRect(
            x * pixelWidth,
            y * pixelHeight,
            pixelWidth,
            pixelHeight
          );
        }
      });
    });
  };

  const updatePixel = (x: number, y: number, color: string) => {
    setCanvasState((prev) => {
      const newState = prev.map((row) => [...row]);
      newState[y][x] = color;
      return newState;
    });
  };

  // Canvas'ı yeniden çiz
  useEffect(() => {
    drawCanvas();
  }, [canvasState]);

  // Socket bağlantısını kur
  useEffect(() => {
    const newSocket = io(BACKEND_URL);
    setSocket(newSocket);

    newSocket.on("init", ({ grid }) => {
      if (!grid) return;
      setCanvasState(grid);
    });

    newSocket.on("canvas:update", ({ grid }) => {
      if (!grid) return;
      setCanvasState(grid);
    });

    newSocket.on("pixel:update", ({ x, y, color }) => {
      updatePixel(x, y, color);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !socket) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / (PIXEL_SIZE * scale));
    const y = Math.floor((event.clientY - rect.top) / (PIXEL_SIZE * scale));

    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return;

    socket.emit("pixel:place", { x, y, color: selectedColor });
    updatePixel(x, y, selectedColor);
    onPixelPlaced();
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas || !socket) return;

    const rect = canvas.getBoundingClientRect();
    const touch = event.touches[0];
    const x = Math.floor((touch.clientX - rect.left) / (PIXEL_SIZE * scale));
    const y = Math.floor((touch.clientY - rect.top) / (PIXEL_SIZE * scale));

    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return;

    socket.emit("pixel:place", { x, y, color: selectedColor });
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
