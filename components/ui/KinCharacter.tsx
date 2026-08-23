import React from 'react';
import { cn } from '@/lib/utils';
import type { KinState } from '@/types';

interface KinCharacterProps {
  size?: number;
  state?: KinState;
  animate?: boolean;
  className?: string;
  showShadow?: boolean;
}

/**
 * Kin — the penguin AI companion
 * 
 * Design preserved exactly from the provided UI references.
 * SVG-based character with multiple states and animations.
 */
export const KinCharacter: React.FC<KinCharacterProps> = ({
  size = 90,
  state = 'idle',
  animate = true,
  className,
  showShadow = true,
}) => {
  const height = size * 1.15;
  
  return (
    <div 
      className={cn('relative inline-block', className)}
      style={{ width: size, height }}
      aria-label={`Kin the penguin, ${state}`}
    >
      {showShadow && (
        <div 
          className="absolute"
          style={{
            bottom: -2,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '70%',
            height: 8,
            background: 'rgba(0,0,0,0.08)',
            borderRadius: '50%',
            filter: 'blur(4px)',
          }}
        />
      )}
      <div className={animate ? 'animate-kin-bob' : ''} style={{ transformOrigin: 'center bottom' }}>
        <svg 
          width={size} 
          height={height} 
          viewBox="0 0 90 110" 
          fill="none"
          style={{ display: 'block' }}
        >
          <defs>
            <radialGradient id={`kin-belly-${size}`} cx="50%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="75%" stopColor="#F8F8F2" />
              <stop offset="100%" stopColor="#ECECE4" />
            </radialGradient>
            <linearGradient id={`kin-body-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2A2A3A" />
              <stop offset="55%" stopColor="#1A1A28" />
              <stop offset="100%" stopColor="#0F0F1C" />
            </linearGradient>
            <radialGradient id={`kin-cheek-${size}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFB347" stopOpacity={state === 'thinking' ? 0.9 : 0.7} />
              <stop offset="100%" stopColor="#FFB347" stopOpacity="0" />
            </radialGradient>
            <linearGradient id={`kin-beak-${size}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FF9A3C" />
              <stop offset="100%" stopColor="#E07020" />
            </linearGradient>
          </defs>
          
          {/* Ground shadow */}
          <ellipse cx="45" cy="105" rx="28" ry="4" fill="rgba(0,0,0,0.06)" />
          
          {/* Left wing */}
          <g 
            className={animate ? 'animate-wing-flap' : ''} 
            style={{ transformOrigin: '18px 55px' }}
          >
            <path d="M14 54 Q6 72 10 90 L26 82 Q24 68 26 56 Z" fill={`url(#kin-body-${size})`} />
          </g>
          
          {/* Body */}
          <ellipse cx="45" cy="64" rx="30" ry="42" fill={`url(#kin-body-${size})`} />
          
          {/* Belly */}
          <ellipse cx="45" cy="72" rx="20" ry="32" fill={`url(#kin-belly-${size})`} />
          
          {/* Right wing */}
          <g style={{ transformOrigin: '70px 58px' }}>
            <path d="M70 56 Q80 72 76 88 L64 80 Q66 68 66 58 Z" fill={`url(#kin-body-${size})`} />
          </g>
          
          {/* Head */}
          <ellipse cx="45" cy="28" rx="22" ry="23" fill={`url(#kin-body-${size})`} />
          
          {/* Head highlight */}
          <ellipse cx="38" cy="20" rx="9" ry="5" fill="rgba(255,255,255,0.06)" />
          
          {/* Face white area */}
          <ellipse cx="45" cy="35" rx="16.5" ry="14" fill="#FAFAF7" />
          
          {/* Cheeks */}
          <ellipse cx="29" cy="32" rx="5.5" ry="7" fill={`url(#kin-cheek-${size})`} />
          <ellipse cx="61" cy="32" rx="5.5" ry="7" fill={`url(#kin-cheek-${size})`} />
          
          {/* Chin blush for happy/found states */}
          {(state === 'found' || state === 'happy') && (
            <ellipse cx="45" cy="52" rx="10" ry="5" fill="#FFB347" opacity="0.4" />
          )}
          
          {/* Left eye */}
          <g 
            className={animate ? 'animate-kin-blink' : ''} 
            style={{ transformOrigin: '36px 28px' }}
          >
            <ellipse cx="36" cy="28" rx="4.2" ry="5" fill="white" />
            <circle 
              cx={state === 'thinking' ? 35.5 : 36.8} 
              cy={state === 'thinking' ? 29.5 : 28.8} 
              r="2.6" 
              fill="#1A1A2E" 
            />
            <circle cx="37.8" cy="27.8" r="0.9" fill="white" />
          </g>
          
          {/* Right eye */}
          <g 
            className={animate ? 'animate-kin-blink' : ''} 
            style={{ transformOrigin: '54px 28px', animationDelay: '0.15s' }}
          >
            <ellipse cx="54" cy="28" rx="4.2" ry="5" fill="white" />
            <circle 
              cx={state === 'thinking' ? 55.3 : 54.8} 
              cy={state === 'thinking' ? 29.5 : 28.8} 
              r="2.6" 
              fill="#1A1A2E" 
            />
            <circle cx="55.8" cy="27.8" r="0.9" fill="white" />
          </g>
          
          {/* Beak — changes shape based on state */}
          {state === 'important' || state === 'error' ? (
            <path 
              d="M40 38 Q45 34 50 38 Q47.5 44 45 44 Q42.5 44 40 38" 
              fill={`url(#kin-beak-${size})`} 
            />
          ) : state === 'found' || state === 'happy' ? (
            <path 
              d="M40 37 Q45 42 50 37 Q47.5 41 45 41 Q42.5 41 40 37" 
              fill={`url(#kin-beak-${size})`} 
            />
          ) : state === 'building' || state === 'scanning' ? (
            <ellipse cx="45" cy="40" rx="5" ry="3.5" fill={`url(#kin-beak-${size})`} />
          ) : (
            <path 
              d="M40 37 L45 44 L50 37 Q47.5 40.5 45 40.5 Q42.5 40.5 40 37" 
              fill={`url(#kin-beak-${size})`} 
            />
          )}
          
          {/* Feet */}
          <ellipse cx="34" cy="102" rx="9" ry="3.5" fill="#FF8C42" />
          <ellipse cx="56" cy="102" rx="9" ry="3.5" fill="#FF8C42" />
          
          {/* Thinking indicator */}
          {state === 'thinking' && (
            <g>
              <circle cx="20" cy="12" r="3" fill="#2D5F8A" opacity="0.6">
                <animate attributeName="cy" values="12;8;12" dur="1s" repeatCount="indefinite" />
              </circle>
              <circle cx="28" cy="8" r="3" fill="#2D5F8A" opacity="0.8">
                <animate attributeName="cy" values="8;4;8" dur="1s" begin="0.15s" repeatCount="indefinite" />
              </circle>
              <circle cx="36" cy="10" r="3" fill="#2D5F8A">
                <animate attributeName="cy" values="10;6;10" dur="1s" begin="0.3s" repeatCount="indefinite" />
              </circle>
            </g>
          )}
          
          {/* Scanning indicator */}
          {state === 'scanning' && (
            <g>
              <circle cx="68" cy="14" r="10" fill="none" stroke="#0891B2" strokeWidth="1.5" opacity="0.4">
                <animate attributeName="r" values="6;14;6" dur="1.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0;0.6" dur="1.5s" repeatCount="indefinite" />
              </circle>
              <circle cx="68" cy="14" r="3" fill="#0891B2" />
            </g>
          )}
          
          {/* Building indicator */}
          {state === 'building' && (
            <g>
              <rect x="62" y="6" width="4" height="4" fill="#D97706" rx="1">
                <animate attributeName="opacity" values="1;0.3;1" dur="0.8s" repeatCount="indefinite" />
              </rect>
              <rect x="68" y="6" width="4" height="4" fill="#D97706" rx="1">
                <animate attributeName="opacity" values="0.3;1;0.3" dur="0.8s" repeatCount="indefinite" begin="0.2s" />
              </rect>
              <rect x="74" y="6" width="4" height="4" fill="#D97706" rx="1">
                <animate attributeName="opacity" values="1;0.3;1" dur="0.8s" repeatCount="indefinite" begin="0.4s" />
              </rect>
            </g>
          )}
          
          {/* Error indicator */}
          {state === 'error' && (
            <g>
              <circle cx="68" cy="14" r="10" fill="rgba(220,38,38,0.1)" />
              <text x="68" y="18" textAnchor="middle" fontSize="12" fill="#DC2626" fontWeight="bold">!</text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};

export default KinCharacter;
