import React, { useState, useEffect } from 'react';
import './App.css';
import tituloImg from './assets/titulo.png';
import victorySound from './assets/victoria.mp3'; 

const allWords = [
  // Señales Reglamentarias
  "PARE", "CEDA", "PROHIBIDO", "VELOCIDAD", "SENTIDO", "GIRO", "PREFERENCIAL",
  // Señales Preventivas
  "CURVA", "ESCUELA", "CICLOVIA", "PEATONAL", "RESALTO", "REDUCTOR", "ANIMALES",
  // Señales Informativas
  "HOSPITAL", "PARQUEO", "TELEFONO", "GASOLINA", "RESTAURANTE", "INFORMACION",
  // Actores Viales
  "CICLISTA", "CINTURON", "PEATON", "CONDUCTOR", "PASAJERO", "MOTOCICLISTA",
  // Elementos de Tránsito
  "SEMAFORO", "SEGURIDAD", "ANDEN", "CRUCE", "CEBRA", "SEÑALES", "VIA",
  // Elementos de Seguridad
  "CASCO", "CHALECO", "LUCES", "FRENOS", "ESPEJO", "BOCINA", "REFLECTIVO"
];

const colors = [
  '#FF9AA2', '#FFB7B2', '#FFDAC1', '#E2F0CB', '#B5EAD7', '#C7CEEA', '#9DD6FF', 
  '#FFE400', '#FFD700', '#019548', '#039fdd', '#87CEFA',
];

const gridSize = 15;
const wordsPerGame = 12;

const App = () => {
  const [words, setWords] = useState([]);
  const [wordGrid, setWordGrid] = useState([]);
  const [currentSelection, setCurrentSelection] = useState([]);
  const [wordsFound, setWordsFound] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [foundSelections, setFoundSelections] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  // Crea una instancia del sonido de victoria
  const victoryAudio = new Audio(victorySound);

  const selectRandomWords = () => {
    const shuffled = [...allWords].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, wordsPerGame);
  };

  const startNewGame = () => {
    const selectedWords = selectRandomWords();
    setWords(selectedWords);
    const newGrid = generateEmptyGrid(gridSize);
    placeWordsInGrid(selectedWords, newGrid);
    setWordGrid(newGrid);
    setCurrentSelection([]);
    setWordsFound([]);
    setFoundSelections([]);
    setCurrentWordIndex(0);
  };

  useEffect(() => {
    startNewGame();
  }, []);

  const generateEmptyGrid = (size) =>
    Array(size).fill(null).map(() => Array(size).fill('_'));

  const placeWordsInGrid = (words, grid) => {
    words.forEach((word) => {
      let placed = false;
      while (!placed) {
        const direction = Math.random() > 0.5 ? 'horizontal' : 'vertical';
        const row = Math.floor(Math.random() * (gridSize - (direction === 'vertical' ? word.length : 0)));
        const col = Math.floor(Math.random() * (gridSize - (direction === 'horizontal' ? word.length : 0)));

        if (canPlaceWordAt(word, grid, row, col, direction)) {
          for (let i = 0; i < word.length; i++) {
            if (direction === 'horizontal') {
              grid[row][col + i] = word[i];
            } else {
              grid[row + i][col] = word[i];
            }
          }
          placed = true;
        }
      }
    });

    fillEmptySpaces(grid);
  };

  const canPlaceWordAt = (word, grid, row, col, direction) => {
    for (let i = 0; i < word.length; i++) {
      const cell = direction === 'horizontal'
        ? grid[row][col + i]
        : grid[row + i][col];
      if (cell !== '_') return false;
    }
    return true;
  };

  const fillEmptySpaces = (grid) => {
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        if (grid[row][col] === '_') {
          grid[row][col] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        }
      }
    }
  };

  const handleMouseDown = (rowIndex, colIndex) => {
    setIsDragging(true);
    setCurrentSelection([rowIndex * gridSize + colIndex]);
  };

  const handleMouseOver = (rowIndex, colIndex) => {
    if (isDragging) {
      const index = rowIndex * gridSize + colIndex;
      if (!currentSelection.includes(index)) {
        setCurrentSelection([...currentSelection, index]);
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    checkSelectedWord();
  };

  const checkSelectedWord = () => {
    const selectedWord = currentSelection
      .map((idx) => {
        const row = Math.floor(idx / gridSize);
        const col = idx % gridSize;
        return wordGrid[row][col];
      })
      .join('')
      .toUpperCase();

    if (words.includes(selectedWord) && !wordsFound.includes(selectedWord)) {
      setWordsFound([...wordsFound, selectedWord]);
      setFoundSelections([
        ...foundSelections,
        {
          word: selectedWord,
          selection: currentSelection,
          color: colors[currentWordIndex % colors.length]
        }
      ]);
      setCurrentWordIndex(currentWordIndex + 1);

      // Reproduce el sonido de victoria
      victoryAudio.play();
    } else {
      setCurrentSelection([]);
    }
  };

  const getCellStyle = (rowIndex, colIndex) => {
    const index = rowIndex * gridSize + colIndex;
    
    if (currentSelection.includes(index)) {
      return { backgroundColor: '#FFE4B5' };
    }
    
    for (const found of foundSelections) {
      if (found.selection.includes(index)) {
        return { backgroundColor: found.color };
      }
    }
    
    return {};
  };

  return (
    <>
      <div className="App">
        <div className="wordsList">
          {words.map((word, index) => (
            <div
              key={word}
              className={wordsFound.includes(word) ? 'found' : ''}
              style={wordsFound.includes(word) ? { color: colors[foundSelections.find(f => f.word === word)?.color] } : {}}
            >
              {word}
            </div>
          ))}
        </div>
        
        <div id="wordSearchContainer"
          onMouseLeave={() => {
            setIsDragging(false);
            checkSelectedWord();
          }}
        >
          {wordGrid.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="cell"
                style={getCellStyle(rowIndex, colIndex)}
                onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                onMouseOver={() => handleMouseOver(rowIndex, colIndex)}
                onMouseUp={handleMouseUp}
              >
                {cell}
              </div>
            ))
          )}
        </div>
       
      </div>
      <button onClick={startNewGame}>Generar Nueva Sopa de Letras</button>
    </>
  );
};

export default App;
