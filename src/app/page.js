'use client'

import {
  Brush,
  Droplet,
  Edit3,
  Eye,
  EyeOff,
  History,
  ImageIcon,
  PenTool,
  Save,
  Trash2,
} from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import React, { useCallback, useEffect, useRef, useState } from 'react';

export default function Home() {
  // List of available background images.
  const imageList = [
    '/superchicche_1.png',
    'bingo.jpg',
    '/disegni-da-colorare.jpg',
    '/disegno-di-spongebob.jpg',
    '/pngtree.png',
    '/puffi.jpg',
    '/Spiderman.jpg',
  ];

  // Refs for canvases: one for background, one for drawing.
  const bgCanvasRef = useRef(null);
  const drawingCanvasRef = useRef(null);

  const [pencilSize, setPencilSize] = useState(5);
  const [color, setColor] = useState('black');
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState({ x: 0, y: 0 });
  const [loadedImage, setLoadedImage] = useState(null);
  const [selectedBackground, setSelectedBackground] = useState(null);

  // Brush type state: 'pencil', 'marker', or 'spray'
  const [brushType, setBrushType] = useState('pencil');

  // Drawer states.
  const [openImageDrawer, setOpenImageDrawer] = useState(false);
  const [openHistoryDrawer, setOpenHistoryDrawer] = useState(false);

  // History now stores objects with drawing and background info.
  const [drawingHistory, setDrawingHistory] = useState([]);
  // Composite thumbnails for history items.
  const [historyThumbnails, setHistoryThumbnails] = useState([]);

  // Toolbar visibility toggle.
  const [toolbarVisible, setToolbarVisible] = useState(true);

  // On mount, load drawing history from localStorage.
  useEffect(() => {
    const history = localStorage.getItem('drawingHistory');
    if (history) {
      setDrawingHistory(JSON.parse(history));
    }
  }, []);

  // Helper: Save updated history to state and localStorage.
  const updateHistory = (newHistory) => {
    setDrawingHistory(newHistory);
    localStorage.setItem('drawingHistory', JSON.stringify(newHistory));
  };

  // Helper: Draw an image on a canvas using "contain" sizing.
  const drawContainedImage = (canvas, img) => {
    const ctx = canvas.getContext('2d');
    const canvasWidth = parseInt(canvas.style.width) || window.innerWidth;
    const canvasHeight = parseInt(canvas.style.height) || window.innerHeight;
    const imgRatio = img.width / img.height;
    const canvasRatio = canvasWidth / canvasHeight;
    let drawWidth, drawHeight, offsetX, offsetY;
    if (imgRatio > canvasRatio) {
      drawWidth = canvasWidth;
      drawHeight = canvasWidth / imgRatio;
      offsetX = 0;
      offsetY = (canvasHeight - drawHeight) / 2;
    } else {
      drawHeight = canvasHeight;
      drawWidth = canvasHeight * imgRatio;
      offsetY = 0;
      offsetX = (canvasWidth - drawWidth) / 2;
    }
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  };

  // Adjust canvas sizes and redraw images.
  const setCanvasSizes = useCallback(() => {
    const dpr = window.devicePixelRatio || 1;
    if (bgCanvasRef.current) {
      const bgCanvas = bgCanvasRef.current;
      bgCanvas.width = window.innerWidth * dpr;
      bgCanvas.height = window.innerHeight * dpr;
      bgCanvas.style.width = window.innerWidth + 'px';
      bgCanvas.style.height = window.innerHeight + 'px';
      const bgCtx = bgCanvas.getContext('2d');
      bgCtx.scale(dpr, dpr);
      if (loadedImage) {
        bgCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        drawContainedImage(bgCanvas, loadedImage);
      }
    }
    if (drawingCanvasRef.current) {
      const drawCanvas = drawingCanvasRef.current;
      const drawCtx = drawCanvas.getContext('2d');
      const dataUrl = drawCanvas.toDataURL();
      const img = new Image();
      img.src = dataUrl;
      img.onload = () => {
        drawCanvas.width = window.innerWidth * dpr;
        drawCanvas.height = window.innerHeight * dpr;
        drawCanvas.style.width = window.innerWidth + 'px';
        drawCanvas.style.height = window.innerHeight + 'px';
        drawCtx.scale(dpr, dpr);
        drawCtx.drawImage(img, 0, 0, window.innerWidth, window.innerHeight);
      };
    }
  }, [loadedImage]);

  useEffect(() => {
    setCanvasSizes();
    window.addEventListener('resize', setCanvasSizes);
    return () => window.removeEventListener('resize', setCanvasSizes);
  }, [setCanvasSizes]);

  // Extract touch coordinates.
  const getTouchPos = (e) => {
    const canvas = drawingCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
  };

  // Mouse and Touch handlers.
  const startDrawing = (x, y) => {
    setIsDrawing(true);
    setLastPoint({ x, y });
  };

  const drawLine = (x, y) => {
    const canvas = drawingCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (brushType === 'spray') {
      const density = 30;
      const radius = pencilSize * 2;
      ctx.fillStyle = color;
      for (let i = 0; i < density; i++) {
        const offsetX = (Math.random() - 0.5) * 2 * radius;
        const offsetY = (Math.random() - 0.5) * 2 * radius;
        ctx.fillRect(x + offsetX, y + offsetY, 1, 1);
      }
      setLastPoint({ x, y });
      return;
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = pencilSize;
    ctx.lineCap = 'round';
    if (brushType === 'marker') ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    if (brushType === 'marker') ctx.globalAlpha = 1;
    setLastPoint({ x, y });
  };

  const endDrawing = () => {
    setIsDrawing(false);
  };

  // Mouse events.
  const handleMouseDown = (e) => {
    const rect = drawingCanvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    startDrawing(x, y);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    const rect = drawingCanvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    drawLine(x, y);
  };

  const handleMouseUp = () => {
    endDrawing();
  };

  // Touch events.
  const handleTouchStart = (e) => {
    e.preventDefault(); // Prevent scrolling
    const { x, y } = getTouchPos(e);
    startDrawing(x, y);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    if (!isDrawing) return;
    const { x, y } = getTouchPos(e);
    drawLine(x, y);
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    endDrawing();
  };

  // Clear drawing canvas.
  const clearDrawing = () => {
    if (!drawingCanvasRef.current) return;
    const canvas = drawingCanvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Background selection clears drawing.
  const handleImageSelect = (imageUrl) => {
    const img = new window.Image();
    img.src = imageUrl;
    img.onload = () => {
      setLoadedImage(img);
      setSelectedBackground(imageUrl);
      if (bgCanvasRef.current) {
        const ctx = bgCanvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        drawContainedImage(bgCanvasRef.current, img);
      }
      if (drawingCanvasRef.current) {
        const ctx = drawingCanvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, drawingCanvasRef.current.width, drawingCanvasRef.current.height);
      }
      setOpenImageDrawer(false);
    };
  };

  // Save drawing to history.
  // Save current drawing and background to history.
  const saveDrawing = () => {
    if (!drawingCanvasRef.current) return;
    const canvas = drawingCanvasRef.current;
    // Create a temporary canvas that matches the CSS dimensions.
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = window.innerWidth;
    tempCanvas.height = window.innerHeight;
    const tempCtx = tempCanvas.getContext('2d');
    // Draw the current drawing canvas onto the temporary canvas.
    // Note: This uses the CSS dimensions so that strokes remain consistent.
    tempCtx.drawImage(canvas, 0, 0, window.innerWidth, window.innerHeight);
    const dataUrl = tempCanvas.toDataURL();

    const newHistoryItem = {
      drawing: dataUrl,
      background: selectedBackground,
    };
    const newHistory = [...drawingHistory, newHistoryItem];
    updateHistory(newHistory);
  };


  // Load drawing from history.
  const loadDrawingFromHistory = (historyItem) => {
    if (historyItem.background) {
      const img = new window.Image();
      img.src = historyItem.background;
      img.onload = () => {
        setLoadedImage(img);
        setSelectedBackground(historyItem.background);
        if (bgCanvasRef.current) {
          const ctx = bgCanvasRef.current.getContext('2d');
          ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
          drawContainedImage(bgCanvasRef.current, img);
        }
      };
    }
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = historyItem.drawing;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, window.innerWidth, window.innerHeight);
    };
  };

  // Delete history items.
  const deleteHistoryItem = (index) => {
    const newHistory = drawingHistory.filter((_, i) => i !== index);
    updateHistory(newHistory);
  };

  const deleteAllHistory = () => {
    updateHistory([]);
  };

  // Generate composite thumbnail for history items.
  const generateThumbnail = (item, thumbnailWidth = 100) => {
    return new Promise((resolve, reject) => {
      const bgImg = new Image();
      const drawingImg = new Image();
      let loadedCount = 0;
      const checkLoaded = () => {
        loadedCount++;
        const required = item.background ? 2 : 1;
        if (loadedCount === required) {
          let aspectRatio = 1;
          if (item.background) {
            aspectRatio = bgImg.naturalHeight / bgImg.naturalWidth;
          } else {
            aspectRatio = drawingImg.naturalHeight / drawingImg.naturalWidth;
          }
          const thumbnailHeight = thumbnailWidth * aspectRatio;
          const canvas = document.createElement('canvas');
          canvas.width = thumbnailWidth;
          canvas.height = thumbnailHeight;
          const ctx = canvas.getContext('2d');
          if (item.background) {
            ctx.drawImage(bgImg, 0, 0, thumbnailWidth, thumbnailHeight);
          }
          ctx.drawImage(drawingImg, 0, 0, thumbnailWidth, thumbnailHeight);
          resolve(canvas.toDataURL());
        }
      };
      if (item.background) {
        bgImg.src = item.background;
        bgImg.onload = checkLoaded;
        bgImg.onerror = reject;
      }
      drawingImg.src = item.drawing;
      drawingImg.onload = checkLoaded;
      drawingImg.onerror = reject;
    });
  };

  // Regenerate thumbnails on history change.
  useEffect(() => {
    async function generateAllThumbnails() {
      try {
        const promises = drawingHistory.map((item) =>
          generateThumbnail(item, 100)
        );
        const thumbnails = await Promise.all(promises);
        setHistoryThumbnails(thumbnails);
      } catch (error) {
        console.error('Error generating thumbnails', error);
      }
    }
    if (drawingHistory.length) {
      generateAllThumbnails();
    } else {
      setHistoryThumbnails([]);
    }
  }, [drawingHistory]);

  // Brush options.
  const brushOptions = [
    { type: 'pencil', icon: <PenTool size={16} /> },
    { type: 'marker', icon: <Edit3 size={16} /> },
    { type: 'spray', icon: <Brush size={16} /> },
  ];

  // Preset colors.
  const colorOptions = [
    'black',
    'white',
    'red',
    'blue',
    'green',
    'yellow',
    'purple',
    'orange',
    'pink',
    'cyan',
    'lime',
  ];

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Toolbar Toggle */}
      <button
        onClick={() => setToolbarVisible(!toolbarVisible)}
        className="absolute top-4 right-4 z-30 bg-gray-700 text-white p-2 rounded"
        title={toolbarVisible ? 'Hide Toolbar' : 'Show Toolbar'}
      >
        {toolbarVisible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>

      {/* Toolbar */}
      {toolbarVisible && (
        <div className="absolute top-4 left-4 z-20 bg-white bg-opacity-90 rounded-lg shadow-lg p-4 flex flex-col gap-4 w-full max-w-xs sm:max-w-md">
          <div className="flex flex-wrap gap-2">
            {/* Background Drawer */}
            <Drawer open={openImageDrawer} onOpenChange={setOpenImageDrawer}>
              <DrawerTrigger asChild>
                <button
                  className="flex items-center gap-1 px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 transition"
                  title="Select Background"
                >
                  <ImageIcon size={16} />
                  Backgrounds
                </button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Select a Background</DrawerTitle>
                </DrawerHeader>
                <div className="p-4 flex gap-2 flex-wrap">
                  {imageList.map((url) => (
                    <img
                      key={url}
                      src={url}
                      alt="Background"
                      className="w-12 h-12 sm:w-16 sm:h-16 object-contain rounded cursor-pointer border hover:border-gray-500"
                      onClick={() => handleImageSelect(url)}
                    />
                  ))}
                </div>
              </DrawerContent>
            </Drawer>

            {/* Save Button */}
            <button
              onClick={saveDrawing}
              className="flex items-center gap-1 px-3 py-1 rounded bg-green-500 text-white hover:bg-green-600 transition"
              title="Save Drawing"
            >
              <Save size={16} />
              Save
            </button>

            {/* History Drawer */}
            <Drawer open={openHistoryDrawer} onOpenChange={setOpenHistoryDrawer}>
              <DrawerTrigger asChild>
                <button
                  className="flex items-center gap-1 px-3 py-1 rounded bg-purple-500 text-white hover:bg-purple-600 transition"
                  title="Drawing History"
                >
                  <History size={16} />
                  History
                </button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader className="flex justify-between items-center">
                  <DrawerTitle>Saved Drawings</DrawerTitle>
                  <button
                    onClick={deleteAllHistory}
                    className="text-red-500 text-sm"
                    title="Delete All"
                  >
                    Delete All
                  </button>
                </DrawerHeader>
                <div className="p-4 grid sm:grid-cols-3 lg:grid-cols-12 gap-2">
                  {drawingHistory.length === 0 && (
                    <p className="col-span-3 text-center text-sm text-gray-600">
                      No drawings saved yet.
                    </p>
                  )}
                  {drawingHistory.map((item, index) => (
                    <div key={index} className="relative group">
                      {historyThumbnails[index] ? (
                        <img
                          src={historyThumbnails[index]}
                          alt={`Drawing ${index + 1}`}
                          className="w-full rounded cursor-pointer border hover:border-gray-500"
                          onClick={() => {
                            loadDrawingFromHistory(item);
                            setOpenHistoryDrawer(false);
                          }}
                        />
                      ) : (
                        <div className="w-full h-24 bg-gray-200" />
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteHistoryItem(index);
                        }}
                        className="absolute top-1 right-1 bg-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                        title="Delete"
                      >
                        <Trash2 size={12} className="text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              </DrawerContent>
            </Drawer>

            {/* Clear Button */}
            <button
              onClick={clearDrawing}
              className="flex items-center gap-1 px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 transition"
              title="Clear Drawing"
            >
              <Trash2 size={16} />
              Clear
            </button>
          </div>

          {/* Brush & Size */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">Brush:</span>
            {brushOptions.map((option) => (
              <button
                key={option.type}
                onClick={() => setBrushType(option.type)}
                className={`flex items-center gap-1 px-2 py-1 rounded border transition ${brushType === option.type ? 'bg-gray-300' : 'bg-white'
                  }`}
                title={option.type}
              >
                {option.icon}
                <span className="capitalize">{option.type}</span>
              </button>
            ))}
            <div className="flex items-center gap-2">
              <label htmlFor="pencilSize" className="font-medium">
                Size:
              </label>
              <input
                type="range"
                id="pencilSize"
                min="1"
                max="50"
                value={pencilSize}
                onChange={(e) => setPencilSize(parseInt(e.target.value))}
                className="w-24 sm:w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <span className="w-6 text-center">{pencilSize}</span>
            </div>
          </div>

          {/* Color Options */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1">
              <Droplet size={16} />
              Colors:
            </span>
            {colorOptions.map((col) => (
              <button
                key={col}
                className={`w-6 h-6 rounded-full border-2 ${color === col ? 'border-slate-800' : 'border-slate-200'
                  }`}
                style={{ backgroundColor: col }}
                onClick={() => setColor(col)}
                title={col}
              />
            ))}
            <div className="flex items-center gap-1">
              <label htmlFor="customColor" className="font-medium">
                Custom:
              </label>
              <input
                id="customColor"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-10 h-10 p-0 border-0 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Background Canvas */}
      <canvas ref={bgCanvasRef} className="absolute top-0 left-0 z-0" />

      {/* Drawing Canvas with Mouse & Touch Handlers */}
      <canvas
        ref={drawingCanvasRef}
        className="absolute top-0 left-0 z-10"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      />
    </div>
  );
}
