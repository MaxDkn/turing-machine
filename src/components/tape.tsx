import React, { useCallback, useRef } from "react"; 
import { useSpring, animated } from "@react-spring/web";
import { useMachineStore, TapeValue } from "../store/machine"; 

type TuringTapeProps = {
  cellWidth?: number;
  cellHeight?: number;
};

export function TuringTape({
  cellWidth = 60,
  cellHeight = 80,
}: TuringTapeProps) {
  
  const { tape, head, setHead, setTape } = useMachineStore();
  const numberOfCells = tape.length;
  // Référence pour stocker la position angulaire cumulée
  const accumulatedRotation = useRef(0);

  // ---------------------------------
  // Calculs Géométriques
  // ---------------------------------

  const anglePerCell = 360 / numberOfCells;
  const radius = (cellWidth / 2) / Math.tan(Math.PI / numberOfCells);

  // Initialisation à la rotation 0.
  const [{ rotation }, api] = useSpring(() => ({ 
    rotation: 0,
    config: { tension: 250, friction: 30 }
  }));

  // ---------------------------------
  // Gestion des Actions
  // ---------------------------------

  /** Calcule l'index avec le wrap-around (modulo). */
  const getWrappedIndex = useCallback((index: number) => {
    return (index % numberOfCells + numberOfCells) % numberOfCells;
  }, [numberOfCells]);


  const handleMove = useCallback((direction: 1 | -1) => {
    // 1. Calculer la nouvelle tête
    const rawNewHead = head + direction;
    const newHead = getWrappedIndex(rawNewHead);
    
    // 2. Mettre à jour la tête du store
    setHead(newHead);
    
    // 3. Mettre à jour l'animation (en relatif)
    // On ajoute/soustraie simplement un angle de cellule à la rotation actuelle cumulée.
    const rotationDelta = direction === 1 ? -anglePerCell : anglePerCell;

    // Mise à jour de la référence de la rotation cumulée
    accumulatedRotation.current += rotationDelta;

    // Déclencher l'animation vers la nouvelle rotation totale
    api.start({ rotation: accumulatedRotation.current });
    
    // ✅ BUG FIX: 'head' est maintenant dans les dépendances
  }, [head, anglePerCell, api, setHead, getWrappedIndex]);


  const handleWrite = useCallback((value: TapeValue) => {
    // 1. Mettre à jour la valeur du store
    const newTape = [...tape]; 
    newTape[head] = value;
    setTape(newTape);
    // L'écriture ne déclenche AUCUNE animation du ruban, uniquement la mise à jour de la cellule.
  }, [head, tape, setTape]);


  // ---------------------------------
  // Rendu JSX
  // ---------------------------------

  return (
    <div className="turing-tape-container">
      <div 
        className="tape-scene" 
        style={{ perspective: 1800 }}
      >
        <animated.div
          className="tape-carousel"
          style={{
            transform: rotation.to(
              (r) =>
                `translateZ(${-radius}px) rotateY(${r}deg)`
            ),
            width: `${cellWidth}px`,
            height: `${cellHeight}px`,
          }}
        >
          {tape.map((value, i) => ( 
            <div
              key={i}
              className="tape-cell"
              style={{
                transform: `rotateY(${
                  i * anglePerCell
                }deg) translateZ(${radius}px)`,
                width: `${cellWidth}px`,
                height: `${cellHeight}px`,
              }}
            >
              <span className={`value-${value}`}>{value}</span>
            </div>
          ))}
        </animated.div>
      </div>

      <div className="read-head">
        <div className="read-head-value">
          {tape[head]} 
        </div>
        <div className="read-head-pointer" />
      </div>

      <div className="tape-controls">
        <button onClick={() => handleMove(-1)}>←</button>
        <button onClick={() => handleWrite("0")}>0</button>
        <button onClick={() => handleWrite("1")}>1</button>
        <button onClick={() => handleWrite("b")}>b</button>
        <button onClick={() => handleMove(1)}>→</button>
      </div>

      <style>{`
        /* Styles CSS (Inchagés) */
        .turing-tape-container {
          width: 100%;
          max-width: 1024px;
          margin-left: auto;
          margin-right: auto;
          padding: 2rem 0;
          background: #f4f4f9;
          border-radius: 8px;
          overflow: hidden;
          user-select: none;
        }

        .tape-scene {
          width: 100%;
          height: ${cellHeight + 40}px;
          position: relative;
        }

        .tape-carousel {
          position: absolute;
          top: 20px;
          left: 50%;
          transform-style: preserve-3d;
          margin-left: -${cellWidth / 2}px;
        }

        .tape-cell {
          position: absolute;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: monospace;
          font-size: 1.5rem;
          font-weight: bold;
          background: white;
          border: 1px solid #ccc;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          color: #333;
          backface-visibility: hidden;
        }
        
        .tape-cell .value-0 { color: #b87b3a; }
        .tape-cell .value-1 { color: #2c5f9c; }
        .tape-cell .value-b { color: #999; }

        .read-head {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          top: -${cellHeight + 20}px; 
          z-index: 10;
        }

        .read-head-value {
          width: 50px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fff;
          border: 2px solid #333;
          border-radius: 6px;
          font-family: monospace;
          font-size: 16px;
          font-weight: bold;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        }

        .read-head-pointer {
          width: 0;
          height: 0;
          border-left: 10px solid transparent;
          border-right: 10px solid transparent;
          border-top: 15px solid #333;
        }

        .tape-controls {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 1rem;
          position: relative;
          z-index: 11;
        }

        .tape-controls button {
          font-family: monospace;
          font-size: 1rem;
          font-weight: bold;
          width: 40px;
          height: 40px;
          border: none;
          border-radius: 50%;
          background: #e0e0e7;
          color: #333;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .tape-controls button:hover {
          background: #c8c8d0;
        }
        .tape-controls button:active {
          background: #b0b0b8;
        }
      `}</style>
    </div>
  );
}