import { useState, useRef } from 'react';
import { wordles, allValidWords } from './data/words';

function App() {
  // ----------------------------------------------------------------------
  // STATE MANAGEMENT
  // ----------------------------------------------------------------------
  const [green, setGreen] = useState(['', '', '', '', '']);
  const [yellow, setYellow] = useState([
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', '']
  ]);
  const [gray, setGray] = useState('');

  // ----------------------------------------------------------------------
  // DOM REFERENCES
  // ----------------------------------------------------------------------
  const greenRefs = useRef([]);
  const yellowRefs = useRef(Array(5).fill(0).map(() => Array(5).fill(null)));

  // ----------------------------------------------------------------------
  // CLEAR & RESET FUNCTIONS
  // ----------------------------------------------------------------------
  const clearGreen = () => {
    setGreen(['', '', '', '', '']);
    greenRefs.current[0]?.focus();
  };

  const clearYellow = () => {
    setYellow([
      ['', '', '', '', ''],
      ['', '', '', '', ''],
      ['', '', '', '', ''],
      ['', '', '', '', ''],
      ['', '', '', '', '']
    ]);
  };

  const clearGray = () => setGray('');

  const resetBoard = () => {
    clearGreen();
    clearYellow();
    clearGray();
  };

  // ----------------------------------------------------------------------
  // INPUT HANDLERS: GREEN ROW
  // ----------------------------------------------------------------------
  const handleGreenChange = (index, e) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z]/g, '');

    if (value.length > 1) {
      const newGreen = [...green];
      const chars = value.split('');
      let lastUpdatedIndex = index;

      chars.forEach((char, i) => {
        if (index + i < 5) {
          newGreen[index + i] = char;
          lastUpdatedIndex = index + i;
        }
      });

      setGreen(newGreen);
      if (lastUpdatedIndex < 4) greenRefs.current[lastUpdatedIndex + 1]?.focus();
    } else {
      const newGreen = [...green];
      newGreen[index] = value;
      setGreen(newGreen);
      if (value && index < 4) greenRefs.current[index + 1]?.focus();
    }
  };

  const handleGreenKeyDown = (index, e) => {
    if (e.key === 'Backspace' && green[index] === '' && index > 0) {
      e.preventDefault();
      const newGreen = [...green];
      newGreen[index - 1] = '';
      setGreen(newGreen);
      greenRefs.current[index - 1]?.focus();
    }
  };

  // ----------------------------------------------------------------------
  // INPUT HANDLERS: YELLOW GRID
  // ----------------------------------------------------------------------
  const handleYellowChange = (rowIndex, colIndex, e) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z]/g, '');
    const newYellow = yellow.map(row => [...row]);

    if (value.length > 1) {
      const chars = value.split('');
      let lastUpdatedCol = colIndex;

      chars.forEach((char, i) => {
        if (colIndex + i < 5) {
          newYellow[rowIndex][colIndex + i] = char;
          lastUpdatedCol = colIndex + i;
        }
      });

      setYellow(newYellow);
      if (lastUpdatedCol < 4) yellowRefs.current[rowIndex][lastUpdatedCol + 1]?.focus();
    } else {
      newYellow[rowIndex][colIndex] = value;
      setYellow(newYellow);
      if (value && colIndex < 4) yellowRefs.current[rowIndex][colIndex + 1]?.focus();
    }
  };

  const handleYellowKeyDown = (rowIndex, colIndex, e) => {
    if (e.key === 'Backspace' && yellow[rowIndex][colIndex] === '' && colIndex > 0) {
      e.preventDefault();
      const newYellow = yellow.map(row => [...row]);
      newYellow[rowIndex][colIndex - 1] = '';
      setYellow(newYellow);
      yellowRefs.current[rowIndex][colIndex - 1]?.focus();
    }
  };

  const handleFocus = (e) => e.target.select();

  // ----------------------------------------------------------------------
  // THE FILTERING ENGINE
  // ----------------------------------------------------------------------
  const compiledYellow = ['', '', '', '', ''];
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      if (yellow[r][c] && !compiledYellow[c].includes(yellow[r][c])) {
        compiledYellow[c] += yellow[r][c];
      }
    }
  }

  const filteredWords = wordles.filter(word => {
    for (let i = 0; i < 5; i++) {
      if (green[i] && word[i] !== green[i]) return false;
    }

    for (let i = 0; i < 5; i++) {
      if (compiledYellow[i]) {
        for (let char of compiledYellow[i]) {
          if (!word.includes(char) || word[i] === char) return false;
        }
      }
    }

    if (gray) {
      for (let char of gray) {
        if (word.includes(char)) return false;
      }
    }

    return true; 
  });

  // ----------------------------------------------------------------------
  // SMART SORTING ENGINE
  // ----------------------------------------------------------------------
  const letterFreqs = {};
  filteredWords.forEach(word => {
    const uniqueLetters = new Set(word);
    uniqueLetters.forEach(char => {
      letterFreqs[char] = (letterFreqs[char] || 0) + 1;
    });
  });

  const sortedWords = [...filteredWords].sort((a, b) => {
    const scoreA = Array.from(new Set(a)).reduce((sum, char) => sum + (letterFreqs[char] || 0), 0);
    const scoreB = Array.from(new Set(b)).reduce((sum, char) => sum + (letterFreqs[char] || 0), 0);
    return scoreB - scoreA; 
  });

  // ----------------------------------------------------------------------
  // UI RENDER
  // ----------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-black text-slate-100 p-3 sm:p-6 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-6 md:gap-8">
        
        {/* LEFT COLUMN: CONTROLS */}
        <div className="flex-1 md:max-w-md">
          <div className="flex justify-between items-center mb-6 md:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-wide">Wordle Helper</h1>
            <button 
              onClick={resetBoard}
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-red-900/40 hover:bg-red-800/60 text-red-200 text-xs sm:text-sm font-bold rounded transition-colors border border-red-900/50"
            >
              Reset All
            </button>
          </div>

          <div className="bg-neutral-900 p-4 sm:p-6 rounded-xl shadow-lg border border-neutral-800 space-y-6 sm:space-y-8">
            
            {/* Green Letters Area */}
            <div>
              <div className="flex justify-between items-end mb-3">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-green-500 uppercase tracking-wider">Green Letters</label>
                  <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">Exact match. Type in the correct position.</p>
                </div>
                <button onClick={clearGreen} className="text-[10px] sm:text-xs font-bold text-slate-500 hover:text-slate-300 transition-colors">CLEAR</button>
              </div>
              <div className="flex gap-1.5 sm:gap-2">
                {green.map((letter, index) => (
                  <input
                    key={`green-${index}`}
                    ref={(el) => (greenRefs.current[index] = el)}
                    type="text"
                    value={letter.toUpperCase()}
                    onChange={(e) => handleGreenChange(index, e)}
                    onKeyDown={(e) => handleGreenKeyDown(index, e)}
                    onFocus={handleFocus}
                    className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold bg-neutral-800 border-2 border-green-600 rounded text-white focus:outline-none focus:border-green-400 transition-colors"
                  />
                ))}
              </div>
            </div>

            {/* Yellow Letters Grid Area */}
            <div>
              <div className="flex justify-between items-end mb-3">
                <div className="pr-2">
                  <label className="block text-xs sm:text-sm font-bold text-yellow-500 uppercase tracking-wider">Yellow Letters</label>
                  <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 leading-tight">Wrong position. Type each attempt row by row and position.</p>
                </div>
                <button onClick={clearYellow} className="text-[10px] sm:text-xs font-bold text-slate-500 hover:text-slate-300 transition-colors">CLEAR</button>
              </div>
              <div className="space-y-2">
                {yellow.map((row, rowIndex) => (
                  <div key={`yrow-${rowIndex}`} className="flex items-center gap-2 sm:gap-3">
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 w-12 sm:w-16 uppercase tracking-wider text-right leading-none">Attempt {rowIndex + 1}</span>
                    <div className="flex gap-1.5 sm:gap-2">
                      {row.map((letter, colIndex) => (
                        <input
                          key={`ycol-${rowIndex}-${colIndex}`}
                          ref={(el) => (yellowRefs.current[rowIndex][colIndex] = el)}
                          type="text"
                          value={letter.toUpperCase()}
                          onChange={(e) => handleYellowChange(rowIndex, colIndex, e)}
                          onKeyDown={(e) => handleYellowKeyDown(rowIndex, colIndex, e)}
                          onFocus={handleFocus}
                          className="w-9 h-10 sm:w-10 sm:h-10 text-center text-base sm:text-lg font-bold bg-neutral-800 border-2 border-yellow-600/50 rounded text-white focus:outline-none focus:border-yellow-400 transition-colors"
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gray Letters Area */}
            <div>
              <div className="flex justify-between items-end mb-3">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-wider">Gray Letters</label>
                  <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">Excluded completely. Type all letters here.</p>
                </div>
                <button onClick={clearGray} className="text-[10px] sm:text-xs font-bold text-slate-500 hover:text-slate-300 transition-colors">CLEAR</button>
              </div>
              <input
                type="text"
                value={gray.toUpperCase()}
                onChange={(e) => setGray(e.target.value.toLowerCase().replace(/[^a-z]/g, ''))}
                placeholder="E.G. QZXW"
                className="w-full p-3 sm:p-4 text-base sm:text-lg font-bold tracking-widest bg-neutral-800 border-2 border-neutral-700 rounded text-slate-300 focus:outline-none focus:border-slate-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: OUTPUT */}
        <div className="flex-1 bg-neutral-900 p-4 sm:p-6 rounded-xl shadow-lg border border-neutral-800 flex flex-col h-[500px] md:h-[750px]">
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-neutral-800">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-200">Possible Answers</h2>
              <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1">Instant updates based on your input.</p>
            </div>
            <span className="bg-blue-600 text-white text-[10px] sm:text-xs font-bold px-2 py-1 sm:px-3 sm:py-1 rounded-full whitespace-nowrap ml-2">
              {sortedWords.length} words
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
            {sortedWords.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5 sm:gap-2">
                {sortedWords.map((word) => (
                  <div key={word} className="bg-neutral-800 text-slate-300 text-center py-1.5 sm:py-2 rounded font-mono text-base sm:text-lg tracking-widest border border-neutral-700">
                    {word.toUpperCase()}
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center px-4">
                <span className="text-3xl sm:text-4xl mb-3 sm:mb-4">🔍</span>
                <p className="text-sm sm:text-base">No words match these criteria.</p>
                <p className="text-xs sm:text-sm mt-1 sm:mt-2">Double check your spelling or constraints.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;