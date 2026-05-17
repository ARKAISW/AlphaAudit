import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * ResizablePanel - A component that allows resizing by dragging a handle
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to render
 * @param {string} props.direction - 'horizontal' or 'vertical'
 * @param {number} props.defaultSize - Default size in pixels
 * @param {number} props.minSize - Minimum size in pixels
 * @param {number} props.maxSize - Maximum size in pixels
 * @param {string} props.className - Additional CSS classes
 */
export default function ResizablePanel({
  children,
  direction = 'horizontal',
  defaultSize = 400,
  minSize = 200,
  maxSize = 1200,
  className = '',
}) {
  const [size, setSize] = useState(defaultSize);
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef(null);
  const startPosRef = useRef(0);
  const startSizeRef = useRef(0);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsResizing(true);
    startPosRef.current = direction === 'horizontal' ? e.clientX : e.clientY;
    startSizeRef.current = size;
  }, [direction, size]);

  const handleMouseMove = useCallback((e) => {
    if (!isResizing) return;

    const currentPos = direction === 'horizontal' ? e.clientX : e.clientY;
    const delta = direction === 'horizontal' 
      ? startPosRef.current - currentPos  // Reverse for horizontal (right panel)
      : currentPos - startPosRef.current;
    
    const newSize = Math.max(minSize, Math.min(maxSize, startSizeRef.current + delta));
    setSize(newSize);
  }, [isResizing, direction, minSize, maxSize]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = direction === 'horizontal' ? 'ew-resize' : 'ns-resize';
      document.body.style.userSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp, direction]);

  const style = direction === 'horizontal' 
    ? { width: `${size}px`, minWidth: `${minSize}px`, maxWidth: `${maxSize}px` }
    : { height: `${size}px`, minHeight: `${minSize}px`, maxHeight: `${maxSize}px` };

  return (
    <div
      ref={panelRef}
      className={`resizable-panel ${className}`}
      style={style}
    >
      {direction === 'horizontal' && (
        <div
          className="resize-handle resize-handle-horizontal"
          onMouseDown={handleMouseDown}
        />
      )}
      {children}
      {direction === 'vertical' && (
        <div
          className="resize-handle resize-handle-vertical"
          onMouseDown={handleMouseDown}
        />
      )}
    </div>
  );
}
