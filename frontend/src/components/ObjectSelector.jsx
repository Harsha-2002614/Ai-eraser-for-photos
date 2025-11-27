import React, { useRef, useState, useEffect } from 'react';

const ObjectSelector = ({ imageUrl, imagePath, detections, onSelectionComplete }) => {
  const imgRef = useRef(null);
  const canvasRef = useRef(null);
  const maskCanvasRef = useRef(null);
  const [selectedBox, setSelectedBox] = useState(null);
  const [mode, setMode] = useState('auto');
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(20);

  useEffect(() => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (img && canvas && maskCanvas) {
      canvas.width = img.clientWidth;
      canvas.height = img.clientHeight;
      maskCanvas.width = img.naturalWidth;
      maskCanvas.height = img.naturalHeight;

      const maskCtx = maskCanvas.getContext('2d');
      maskCtx.fillStyle = 'black';
      maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);

      if (mode === 'auto' && detections) {
        drawDetections();
      }
    }
  }, [imageUrl, detections, mode]);

  const drawDetections = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !detections) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const scaleX = img.clientWidth / img.naturalWidth;
    const scaleY = img.clientHeight / img.naturalHeight;

    detections.forEach((det, idx) => {
      const [x1, y1, x2, y2] = det.box;
      const sx1 = x1 * scaleX;
      const sy1 = y1 * scaleY;
      const sx2 = x2 * scaleX;
      const sy2 = y2 * scaleY;

      ctx.strokeStyle = selectedBox === idx ? '#ec4899' : '#6366f1';
      ctx.lineWidth = 3;
      ctx.strokeRect(sx1, sy1, sx2 - sx1, sy2 - sy1);

      ctx.fillStyle = selectedBox === idx ? '#ec4899' : '#6366f1';
      const label = `${det.label} ${(det.conf * 100).toFixed(0)}%`;
      ctx.font = '14px Inter, sans-serif';
      const textWidth = ctx.measureText(label).width;
      ctx.fillRect(sx1, sy1 - 25, textWidth + 10, 25);

      ctx.fillStyle = 'white';
      ctx.fillText(label, sx1 + 5, sy1 - 7);
    });
  };

  const handleCanvasClick = (e) => {
    if (mode !== 'auto') return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const img = imgRef.current;
    const scaleX = img.clientWidth / img.naturalWidth;
    const scaleY = img.clientHeight / img.naturalHeight;

    for (let i = 0; i < detections.length; i++) {
      const [x1, y1, x2, y2] = detections[i].box;
      const sx1 = x1 * scaleX;
      const sy1 = y1 * scaleY;
      const sx2 = x2 * scaleX;
      const sy2 = y2 * scaleY;

      if (x >= sx1 && x <= sx2 && y >= sy1 && y <= sy2) {
        setSelectedBox(i);
        drawDetections();

        onSelectionComplete({
          x1: detections[i].box[0],
          y1: detections[i].box[1],
          x2: detections[i].box[2],
          y2: detections[i].box[3]
        });
        return;
      }
    }
  };

  const handleMouseDown = (e) => {
    if (mode !== 'manual') return;
    setIsDrawing(true);
    drawBrush(e);
  };

  const handleMouseMove = (e) => {
    if (mode !== 'manual' || !isDrawing) return;
    drawBrush(e);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const drawBrush = (e) => {
    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    const img = imgRef.current;
    const rect = canvas.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(236, 72, 153, 0.5)';
    ctx.beginPath();
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    ctx.fill();

    const scaleX = img.naturalWidth / img.clientWidth;
    const scaleY = img.naturalHeight / img.clientHeight;
    const maskCtx = maskCanvas.getContext('2d');
    maskCtx.fillStyle = 'white';
    maskCtx.beginPath();
    maskCtx.arc(x * scaleX, y * scaleY, (brushSize / 2) * scaleX, 0, Math.PI * 2);
    maskCtx.fill();
  };

  const handleManualSubmit = () => {
    const maskCanvas = maskCanvasRef.current;
    const maskDataUrl = maskCanvas.toDataURL('image/png');
    onSelectionComplete({ manualMask: maskDataUrl });
  };

  const clearMask = () => {
    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const maskCtx = maskCanvas.getContext('2d');
    maskCtx.fillStyle = 'black';
    maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
  };

  return (
    <div>
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          className={`btn ${mode === 'auto' ? '' : 'btn-secondary'}`}
          onClick={() => setMode('auto')}
        >
          Auto Detect
        </button>
        <button
          className={`btn ${mode === 'manual' ? '' : 'btn-secondary'}`}
          onClick={() => setMode('manual')}
        >
          ✏️ Manual Brush
        </button>

        {mode === 'manual' && (
          <>
            <label style={{ color: '#94a3b8' }}>
              Brush Size: {brushSize}px
              <input
                type="range"
                min="5"
                max="50"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                style={{ marginLeft: '0.5rem' }}
              />
            </label>
            <button className="btn btn-secondary" onClick={clearMask}>Clear</button>
            <button className="btn" onClick={handleManualSubmit}>Remove Object</button>
          </>
        )}
      </div>

      <div className="canvas-container">
        <img
          ref={imgRef}
          src={imageUrl}
          alt="Original"
          style={{ maxWidth: '100%', display: 'block' }}
          onLoad={() => {
            if (canvasRef.current && imgRef.current && maskCanvasRef.current) {
              canvasRef.current.width = imgRef.current.clientWidth;
              canvasRef.current.height = imgRef.current.clientHeight;
              maskCanvasRef.current.width = imgRef.current.naturalWidth;
              maskCanvasRef.current.height = imgRef.current.naturalHeight;

              const maskCtx = maskCanvasRef.current.getContext('2d');
              maskCtx.fillStyle = 'black';
              maskCtx.fillRect(0, 0, maskCanvasRef.current.width, maskCanvasRef.current.height);

              if (mode === 'auto') drawDetections();
            }
          }}
        />
        <canvas
          ref={canvasRef}
          className="canvas-overlay"
          onClick={handleCanvasClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ cursor: mode === 'manual' ? 'crosshair' : 'pointer' }}
        />
        <canvas
          ref={maskCanvasRef}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
};

export default ObjectSelector;
