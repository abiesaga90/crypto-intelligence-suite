'use client';

import React from 'react';

interface TeroxxLogoProps {
  className?: string;
  width?: number;
  height?: number;
  showText?: boolean;
  color?: string;
}

export default function TeroxxLogo({ 
  className = '', 
  width = 120, 
  height = 32, 
  showText = true,
  color = 'currentColor'
}: TeroxxLogoProps) {
  const iconSize = height;
  const totalWidth = showText ? width : iconSize;

  return (
    <div className={`flex items-center ${className}`}>
      <svg 
        width={totalWidth} 
        height={height} 
        viewBox={`0 0 ${totalWidth} ${height}`}
        className="flex-shrink-0"
      >
        {/* Circular logo icon */}
        <g transform={`translate(${iconSize/2}, ${iconSize/2})`}>
          {/* Outer circle */}
          <circle
            cx="0"
            cy="0"
            r={iconSize * 0.45}
            fill="none"
            stroke={color}
            strokeWidth={iconSize * 0.08}
          />
          
          {/* Inner geometric pattern - recreating the segments */}
          <g strokeWidth={iconSize * 0.08} stroke={color} fill="none">
            {/* Top segment */}
            <path d={`M 0,${-iconSize * 0.35} Q ${-iconSize * 0.15},${-iconSize * 0.15} ${-iconSize * 0.35},0`} />
            <path d={`M 0,${-iconSize * 0.35} Q ${iconSize * 0.15},${-iconSize * 0.15} ${iconSize * 0.35},0`} />
            
            {/* Right segment */}
            <path d={`M ${iconSize * 0.35},0 Q ${iconSize * 0.15},${iconSize * 0.15} 0,${iconSize * 0.35}`} />
            <path d={`M ${iconSize * 0.35},0 Q ${iconSize * 0.15},${-iconSize * 0.15} 0,${-iconSize * 0.35}`} />
            
            {/* Bottom segment */}
            <path d={`M 0,${iconSize * 0.35} Q ${-iconSize * 0.15},${iconSize * 0.15} ${-iconSize * 0.35},0`} />
            <path d={`M 0,${iconSize * 0.35} Q ${iconSize * 0.15},${iconSize * 0.15} ${iconSize * 0.35},0`} />
            
            {/* Left segment */}
            <path d={`M ${-iconSize * 0.35},0 Q ${-iconSize * 0.15},${-iconSize * 0.15} 0,${-iconSize * 0.35}`} />
            <path d={`M ${-iconSize * 0.35},0 Q ${-iconSize * 0.15},${iconSize * 0.15} 0,${iconSize * 0.35}`} />
          </g>
        </g>

        {/* Text "Teroxx" */}
        {showText && (
          <text
            x={iconSize + 8}
            y={height * 0.72}
            fontSize={height * 0.65}
            fontFamily="var(--font-geist-sans), system-ui, sans-serif"
            fontWeight="600"
            fill={color}
            className="select-none"
          >
            Teroxx
          </text>
        )}
      </svg>
    </div>
  );
} 