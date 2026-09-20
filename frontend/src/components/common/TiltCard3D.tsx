import React, { useRef, useState, useCallback } from 'react';

export interface TiltCard3DProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  maxTilt?: number; // Maximum tilt angle in degrees, default 10
  perspective?: number; // Perspective distance in px, default 1000
  glare?: boolean; // Whether to show specular glare reflection, default true
  scale?: number; // Scale on hover, default 1.02
  initialTiltX?: number; // Resting isometric X tilt angle
  initialTiltY?: number; // Resting isometric Y tilt angle
  initialRotateZ?: number; // Resting isometric Z rotation
}

export const TiltCard3D: React.FC<TiltCard3DProps> = ({
  children,
  className = '',
  style = {},
  maxTilt = 8,
  perspective = 1000,
  glare = true,
  scale = 1.02,
  initialTiltX = 0,
  initialTiltY = 0,
  initialRotateZ = 0,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const restingTransform = `perspective(${perspective}px) rotateX(${initialTiltX}deg) rotateY(${initialTiltY}deg) rotateZ(${initialRotateZ}deg) scale3d(1, 1, 1)`;
  const [transform, setTransform] = useState<string>(restingTransform);
  const [glareStyle, setGlareStyle] = useState<React.CSSProperties>({ opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const card = cardRef.current;
      if (!card) return;

      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Calculate tilt angles (-1 to +1 normalized, multiplied by maxTilt)
      const rotateX = -((y - centerY) / centerY) * maxTilt;
      const rotateY = ((x - centerX) / centerX) * maxTilt;

      setTransform(
        `perspective(${perspective}px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(${scale}, ${scale}, ${scale})`
      );

      if (glare) {
        const glareX = (x / rect.width) * 100;
        const glareY = (y / rect.height) * 100;
        setGlareStyle({
          opacity: 0.35,
          background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.06) 50%, transparent 80%)`,
        });
      }
    },
    [maxTilt, perspective, scale, glare]
  );

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTransform(restingTransform);
    setGlareStyle({ opacity: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative transition-transform ease-out will-change-transform ${className}`}
      style={{
        transformStyle: 'preserve-3d',
        transform: transform,
        transitionDuration: isHovered ? '80ms' : '500ms',
        ...style,
      }}
    >
      {/* 3D Content Container */}
      <div style={{ transformStyle: 'preserve-3d' }}>
        {children}
      </div>

      {/* Specular Glare Reflection */}
      {glare && (
        <div
          className="pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden transition-opacity duration-300"
          style={{
            ...glareStyle,
            mixBlendMode: 'overlay',
          }}
        />
      )}
    </div>
  );
};
