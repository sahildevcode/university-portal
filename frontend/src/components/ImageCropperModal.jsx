import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Check, 
  Crop, 
  RefreshCcw,
  Sliders
} from 'lucide-react';

export default function ImageCropperModal({
  imageSrc,
  onClose,
  onCropComplete,
  title = 'Crop Student Photo (फोटो क्रॉप करें)'
}) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(false);

  const containerRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    if (!imageSrc) return;
    setZoom(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
  }, [imageSrc]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - offset.x,
      y: e.clientY - offset.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - offset.x,
        y: e.touches[0].clientY - offset.y
      });
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    setOffset({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY * -0.002;
    setZoom((prev) => Math.min(Math.max(0.8, prev + delta), 4));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
  };

  const handleApplyCrop = () => {
    if (!imageSrc || !imgRef.current || !containerRef.current) return;
    setLoading(true);

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imageSrc;

      img.onload = () => {
        const cropBox = containerRef.current.getBoundingClientRect();
        const outW = aspectRatio === '3:4' ? 600 : 600;
        const outH = aspectRatio === '3:4' ? 800 : 600;

        const canvas = document.createElement('canvas');
        canvas.width = outW;
        canvas.height = outH;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          alert('Canvas rendering error');
          setLoading(false);
          return;
        }

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, outW, outH);

        ctx.save();
        ctx.translate(outW / 2, outH / 2);
        ctx.rotate((rotation * Math.PI) / 180);

        const boxWidth = cropBox.width;
        const boxHeight = cropBox.height;

        const scaleX = outW / boxWidth;
        const scaleY = outH / boxHeight;

        const rad = (rotation * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);

        const transX = offset.x * scaleX;
        const transY = offset.y * scaleY;
        const rotatedTransX = transX * cos + transY * sin;
        const rotatedTransY = -transX * sin + transY * cos;

        ctx.translate(rotatedTransX, rotatedTransY);

        const isRotated90or270 = rotation % 180 !== 0;
        const naturalW = isRotated90or270 ? img.naturalHeight : img.naturalWidth;
        const naturalH = isRotated90or270 ? img.naturalWidth : img.naturalHeight;

        const fitRatio = Math.max(boxWidth / naturalW, boxHeight / naturalH);
        const drawWidth = img.naturalWidth * fitRatio * zoom * scaleX;
        const drawHeight = img.naturalHeight * fitRatio * zoom * scaleY;

        ctx.drawImage(
          img,
          -drawWidth / 2,
          -drawHeight / 2,
          drawWidth,
          drawHeight
        );

        ctx.restore();

        canvas.toBlob((blob) => {
          if (!blob) {
            alert('Failed to generate cropped image');
            setLoading(false);
            return;
          }
          const croppedFile = new File([blob], 'student_photo_' + Date.now() + '.jpg', {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.95);

          setLoading(false);
          onCropComplete(croppedFile, croppedDataUrl);
        }, 'image/jpeg', 0.95);
      };
    } catch (err) {
      console.error('Crop error:', err);
      alert('Error cropping photo: ' + err.message);
      setLoading(false);
    }
  };

  const cropAspectClass = aspectRatio === '3:4' ? 'w-[240px] h-[320px]' : 'w-[260px] h-[260px]';

  return (
    <div 
      className="fixed inset-0 z-[10000] bg-slate-950/85 backdrop-blur-md overflow-y-auto p-3 sm:p-4 py-6 sm:py-10 flex justify-center items-start animate-fadeIn select-none"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-lg rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 my-auto text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs">
              <Crop className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                {title}
              </h3>
              <p className="text-[11px] text-slate-500">
                Drag to reposition • Use slider to zoom • Rotate if needed
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setAspectRatio('1:1')}
              className={'px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ' + (aspectRatio === '1:1' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900')}
            >
              1:1 Square
            </button>
            <button
              type="button"
              onClick={() => setAspectRatio('3:4')}
              className={'px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ' + (aspectRatio === '3:4' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900')}
            >
              3:4 Passport
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleRotate}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition cursor-pointer text-xs"
              title="Rotate 90 degrees clockwise"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Rotate</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition cursor-pointer text-xs"
              title="Reset Position"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        <div 
          className="relative w-full h-80 bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing border-2 border-slate-700 shadow-inner"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
        >
          {imageSrc && (
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Source"
              draggable={false}
              className="absolute max-w-none transition-transform pointer-events-none"
              style={{
                transform: 'translate(' + offset.x + 'px, ' + offset.y + 'px) scale(' + zoom + ') rotate(' + rotation + 'deg)',
                transformOrigin: 'center center'
              }}
            />
          )}

          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div 
              ref={containerRef}
              className={'relative ' + cropAspectClass + ' border-2 border-amber-400 shadow-[0_0_0_9999px_rgba(15,23,42,0.72)] rounded-lg pointer-events-none transition-all'}
            >
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-40">
                <div className="border-r border-b border-white/60"></div>
                <div className="border-r border-b border-white/60"></div>
                <div className="border-b border-white/60"></div>
                <div className="border-r border-b border-white/60"></div>
                <div className="border-r border-b border-white/60"></div>
                <div className="border-b border-white/60"></div>
                <div className="border-r border-b border-white/60"></div>
                <div className="border-r border-b border-white/60"></div>
                <div></div>
              </div>

              <div className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 border-t-2 border-l-2 border-amber-400"></div>
              <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 border-t-2 border-r-2 border-amber-400"></div>
              <div className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 border-b-2 border-l-2 border-amber-400"></div>
              <div className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 border-b-2 border-r-2 border-amber-400"></div>

              <span className="absolute bottom-2 left-2 bg-slate-900/80 text-amber-300 font-mono text-[9px] px-2 py-0.5 rounded font-bold border border-amber-400/40">
                {aspectRatio + ' Crop Area'}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-1 bg-slate-50 p-3 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-600" />
              <span>Zoom & Scale</span>
            </span>
            <span className="font-mono text-indigo-700">{Math.round(zoom * 100)}%</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setZoom((prev) => Math.max(0.8, prev - 0.15))}
              className="p-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <input
              type="range"
              min="0.8"
              max="3.5"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
            <button
              type="button"
              onClick={() => setZoom((prev) => Math.min(3.5, prev + 0.15))}
              className="p-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Cancel (रद्द करें)
          </button>
          <button
            type="button"
            onClick={handleApplyCrop}
            disabled={loading}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white px-5 py-2.5 rounded-xl text-xs font-extrabold shadow-md transition cursor-pointer disabled:opacity-50 border border-emerald-400/30"
          >
            {loading ? (
              <span>Cropping & Saving...</span>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Crop & Save Photo (क्रॉप और सेव करें)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
