import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  delay: number;
  rotation: number;
  size: number;
}

interface ConfettiProps {
  isActive: boolean;
  duration?: number;
}

const colors = ['#F33791', '#336907', '#FF6B35', '#FFD700', '#A0FF4F', '#FF6B9D'];

export function Confetti({ isActive, duration = 3000 }: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isActive) {
      const newPieces: ConfettiPiece[] = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.5,
        rotation: Math.random() * 360,
        size: 8 + Math.random() * 8,
      }));
      setPieces(newPieces);
      setShow(true);

      const timer = setTimeout(() => {
        setShow(false);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isActive, duration]);

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
          {pieces.map((piece) => (
            <motion.div
              key={piece.id}
              className="absolute"
              style={{
                left: `${piece.x}%`,
                top: -20,
                width: piece.size,
                height: piece.size,
                backgroundColor: piece.color,
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
              }}
              initial={{ y: -20, rotate: 0, opacity: 1 }}
              animate={{
                y: window.innerHeight + 100,
                rotate: piece.rotation + 720,
                opacity: [1, 1, 0],
                x: [0, Math.sin(piece.id) * 100, Math.cos(piece.id) * 50],
              }}
              transition={{
                duration: 2 + Math.random(),
                delay: piece.delay,
                ease: 'easeOut',
              }}
              exit={{ opacity: 0 }}
            />
          ))}
          
          {/* Stars */}
          {pieces.slice(0, 15).map((piece) => (
            <motion.div
              key={`star-${piece.id}`}
              className="absolute"
              style={{
                left: `${piece.x}%`,
                top: -30,
              }}
              initial={{ y: -30, scale: 0, opacity: 1 }}
              animate={{
                y: window.innerHeight + 100,
                scale: [0, 1, 1, 0],
                opacity: [1, 1, 0],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 2.5 + Math.random(),
                delay: piece.delay + 0.2,
                ease: 'easeOut',
              }}
              exit={{ opacity: 0 }}
            >
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 20 20" 
                fill={piece.color}
              >
                <path d="M10 0L12 8L20 10L12 12L10 20L8 12L0 10L8 8L10 0Z" />
              </svg>
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

export function useConfetti() {
  const [isActive, setIsActive] = useState(false);

  const trigger = () => {
    setIsActive(true);
    setTimeout(() => setIsActive(false), 100);
  };

  return { isActive, trigger };
}