import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  X, Check, RotateCw, ZoomIn, ZoomOut, FlipHorizontal, RefreshCw, 
  Crop, Sparkles, Image as ImageIcon, Move
} from 'lucide-react';

export default function ImageCropModal({
  isOpen,
  imageSrc,
  onClose,
  onCropComplete,
  initialAspect = '16:9',
  title = 'Edit & Crop Photo'
}) {
  const [aspect, setAspect] = useState(initialAspect); // '16:9' | '4:3' | '1:1' | '3:4' | 'free'
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [flipH, setFlipH] = useState(false);

  // Position offset (pan) in container
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const containerRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setAspect(initialAspect || '16:9');
      setZoom(1);
      setRotation(0);
      setFlipH(false);
      setPan({ x: 0, y: 0 });
    }
  }, [isOpen, initialAspect, imageSrc]);

  // Handle Drag / Pan of Image
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - pan.x,
      y: e.clientY - pan.y
    };
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y
    });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch handlers for mobile/tablet
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y
      };
    }
  };

  const handleTouchMove = useCallback((e) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPan({
      x: e.touches[0].clientX - dragStartRef.current.x,
      y: e.touches[0].clientY - dragStartRef.current.y
    });
  }, [isDragging]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // Rotate 90 degrees
  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  // Reset all
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setFlipH(false);
    setPan({ x: 0, y: 0 });
  };

  // Perform Crop & Render to High-Res Canvas
  const handleApplyCrop = () => {
    if (!imgRef.current || !containerRef.current) return;

    const img = imgRef.current;
    const container = containerRef.current;

    // Get the crop window dimensions
    const cropBox = container.getBoundingClientRect();
    const cropW = cropBox.width;
    const cropH = cropBox.height;

    // Output canvas size based on selected aspect ratio
    let outW = 1200;
    let outH = 675; // default 16:9
    if (aspect === '16:9') { outW = 1600; outH = 900; }
    else if (aspect === '4:3') { outW = 1200; outH = 900; }
    else if (aspect === '1:1') { outW = 1000; outH = 1000; }
    else if (aspect === '3:4') { outW = 900; outH = 1200; }
    else {
      // free aspect ratio
      outW = Math.round(cropW * 2);
      outH = Math.round(cropH * 2);
    }

    const canvas = document.createElement('canvas');
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // 1. Draw Ambient Blurred Background (eliminates harsh cuts / blank bars when zooming out)
    ctx.save();
    try {
      ctx.filter = 'blur(25px)';
      ctx.drawImage(img, -outW * 0.1, -outH * 0.1, outW * 1.2, outH * 1.2);
    } catch {
      ctx.fillStyle = '#071530';
      ctx.fillRect(0, 0, outW, outH);
    }
    ctx.restore();

    // Soft dark tint over background for contrast
    ctx.fillStyle = 'rgba(7, 21, 48, 0.4)';
    ctx.fillRect(0, 0, outW, outH);

    // Coordinate mapping: from screen container to output canvas
    const scaleFactor = outW / cropW;

    ctx.save();
    // Center transformation
    ctx.translate(outW / 2, outH / 2);

    // Apply Pan
    ctx.translate(pan.x * scaleFactor, pan.y * scaleFactor);

    // Apply Rotation
    ctx.rotate((rotation * Math.PI) / 180);

    // Apply Flip
    ctx.scale(flipH ? -1 : 1, 1);

    // Apply Zoom
    ctx.scale(zoom, zoom);

    // Draw the image centered
    const imgNaturalW = img.naturalWidth;
    const imgNaturalH = img.naturalHeight;

    // Base display size inside container before zoom
    let baseDisplayW, baseDisplayH;
    const containerAspect = cropW / cropH;
    const imgAspect = imgNaturalW / imgNaturalH;

    if (imgAspect > containerAspect) {
      // Image wider
      baseDisplayW = cropW;
      baseDisplayH = cropW / imgAspect;
    } else {
      // Image taller
      baseDisplayH = cropH;
      baseDisplayW = cropH * imgAspect;
    }

    const drawW = baseDisplayW * scaleFactor;
    const drawH = baseDisplayH * scaleFactor;

    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    try {
      const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.92);
      onCropComplete(croppedDataUrl);
      onClose();
    } catch (err) {
      alert('Could not export cropped image: ' + err.message);
    }
  };

  if (!isOpen || !imageSrc) return null;

  // Aspect ratio styling for crop window
  const getCropBoxAspectClass = () => {
    switch (aspect) {
      case '16:9': return 'aspect-video max-w-xl';
      case '4:3': return 'aspect-[4/3] max-w-md';
      case '1:1': return 'aspect-square max-w-sm';
      case '3:4': return 'aspect-[3/4] max-w-xs';
      default: return 'aspect-video max-w-xl';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 text-white rounded-3xl w-full max-w-2xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Crop className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <span>{title}</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono px-2 py-0.5 rounded-full">
                  Interactive
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Drag photo to position • Select format • Zoom &amp; Rotate
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Aspect Ratio Selector Pills */}
        <div className="px-5 py-2.5 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center gap-2 text-xs font-bold">
          <span className="text-slate-400 text-[11px] uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <ImageIcon className="w-3.5 h-3.5 text-amber-400" /> Format:
          </span>
          {[
            { id: '16:9', label: '16:9 Banner (Hero Slider)', sub: 'Best for Website Top' },
            { id: '4:3',  label: '4:3 Card (Course)', sub: 'Standard Card' },
            { id: '1:1',  label: '1:1 Square (Avatar/Logo)', sub: 'Square' },
            { id: '3:4',  label: '3:4 Portrait (Poster)', sub: 'Flyer' }
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setAspect(item.id);
                setPan({ x: 0, y: 0 });
              }}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shrink-0 ${
                aspect === item.id 
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20' 
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Workspace: Crop Box + Canvas Preview */}
        <div className="relative flex-1 min-h-[280px] sm:min-h-[360px] bg-slate-950 flex items-center justify-center p-4 overflow-hidden select-none">
          
          {/* Guide Overlay Grid Lines in background */}
          <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-25 pointer-events-none" />

          {/* Interactive Crop Frame Container */}
          <div 
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            className={`relative w-full ${getCropBoxAspectClass()} border-2 border-amber-400 rounded-2xl overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing bg-slate-900 ring-4 ring-amber-400/20`}
            style={{ touchAction: 'none' }}
          >
            {/* Ambient blur behind image inside frame */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-40 blur-xl scale-110"
              style={{
                backgroundImage: `url(${imageSrc})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
            <div className="absolute inset-0 bg-slate-950/40 pointer-events-none" />

            {/* Dark Mask Rule of Thirds Guide Lines */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none z-10 opacity-30">
              <div className="border-r border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-b border-white" />
              <div className="border-r border-white" />
              <div className="border-r border-white" />
              <div />
            </div>

            {/* Corner Crop Indicators */}
            <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-amber-400 z-20 pointer-events-none" />
            <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-amber-400 z-20 pointer-events-none" />
            <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-amber-400 z-20 pointer-events-none" />
            <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-amber-400 z-20 pointer-events-none" />

            {/* Image Subject */}
            <div 
              className="absolute inset-0 flex items-center justify-center transition-transform duration-75 z-10"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) rotate(${rotation}deg) scale(${flipH ? -zoom : zoom}, ${zoom})`,
                transformOrigin: 'center center'
              }}
            >
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Crop preview"
                className="max-w-none max-h-none pointer-events-none"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
                crossOrigin="anonymous"
              />
            </div>

            {/* Drag hint tooltip badge */}
            <div className="absolute bottom-2 right-2 z-20 bg-black/70 backdrop-blur-xs text-[10px] text-amber-300 font-bold px-2 py-0.5 rounded-md pointer-events-none flex items-center gap-1 border border-amber-400/30">
              <Move className="w-3 h-3" />
              <span>Drag to reposition</span>
            </div>
          </div>
        </div>

        {/* Toolbar: Zoom, Rotate, Flip, Reset */}
        <div className="px-5 py-3 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          
          {/* Zoom Slider */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-slate-400 text-[11px] font-bold flex items-center gap-1">
              <ZoomIn className="w-3.5 h-3.5 text-amber-400" /> Zoom:
            </span>
            <button
              type="button"
              onClick={() => setZoom(z => Math.max(0.3, Number((z - 0.1).toFixed(2))))}
              className="w-7 h-7 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center text-slate-300 hover:text-white"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <input
              type="range"
              min="0.3"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-24 sm:w-32 accent-amber-500 cursor-pointer"
            />
            <button
              type="button"
              onClick={() => setZoom(z => Math.min(3, Number((z + 0.1).toFixed(2))))}
              className="w-7 h-7 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center text-slate-300 hover:text-white"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-slate-300 text-[11px] min-w-8">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => {
                setZoom(1);
                setPan({ x: 0, y: 0 });
              }}
              className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-[10.5px] font-bold border border-amber-500/30 cursor-pointer transition-colors ml-1"
              title="Reset Zoom to 100% and Center"
            >
              Fit 100%
            </button>
          </div>

          {/* Action buttons: Rotate, Flip, Reset */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRotate}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-amber-400 rounded-xl font-bold flex items-center gap-1 transition-colors cursor-pointer border border-slate-700"
              title="Rotate 90 degrees"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Rotate</span>
            </button>

            <button
              type="button"
              onClick={() => setFlipH(f => !f)}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-amber-400 rounded-xl font-bold flex items-center gap-1 transition-colors cursor-pointer border border-slate-700"
              title="Flip horizontally"
            >
              <FlipHorizontal className="w-3.5 h-3.5" />
              <span>Flip</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 rounded-xl font-bold flex items-center gap-1 transition-colors cursor-pointer border border-slate-700"
              title="Reset position and zoom"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              // Direct use original without cropping
              onCropComplete(imageSrc);
              onClose();
            }}
            className="text-xs text-slate-400 hover:text-slate-200 underline underline-offset-4 cursor-pointer"
          >
            Use Original (No Crop)
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApplyCrop}
              className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/25 flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
            >
              <Check className="w-4 h-4 text-slate-950" />
              <span>Apply &amp; Save Photo</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
