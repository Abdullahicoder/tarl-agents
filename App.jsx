import React, { useState } from 'react';

export default function StudentApp() {
  const [currentStage, setCurrentStage] = useState('STUDY_ZONE');
  const [activeSubject, setActiveSubject] = useState('LITERACY');
  const [starCount, setStarCount] = useState(0);

  return (
    <div className="h-screen w-screen bg-sky-100 flex flex-col justify-between p-4 font-sans select-none">
      {/* Top Header Bar */}
      <header className="flex justify-between items-center bg-white/80 backdrop-blur rounded-2xl p-4 shadow-sm">
        <button 
          aria-label="Back"
          className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md hover:scale-105 transition"
        >
          ←
        </button>
        
        {/* Progress Tracker / Star Rewards */}
        <div className="flex items-center space-x-2 bg-yellow-100 px-4 py-2 rounded-full border border-yellow-300">
          <span className="text-2xl">⭐</span>
          <span className="text-xl font-bold text-yellow-800">{starCount}</span>
        </div>

        {/* Audio Prompt Repeat */}
        <button 
          aria-label="Repeat Audio"
          className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl shadow-md hover:scale-105 transition"
        >
          🔊
        </button>
      </header>

      {/* Main Interactive Stage */}
      <main className="flex-1 flex items-center justify-center my-4 relative">
        <div className="w-full max-w-4xl h-full bg-white rounded-3xl shadow-xl p-6 flex flex-col items-center justify-center relative border-4 border-sky-200">
          
          <div className="text-center space-y-6">
            <h2 className="text-4xl font-extrabold text-gray-800 tracking-wide">
              {activeSubject === 'LITERACY' ? 'Match the Letter' : 'Count the Objects'}
            </h2>

            <div className="flex justify-center space-x-6 my-8">
              {['a', 'b', 'c'].map((item) => (
                <button 
                  key={item}
                  onClick={() => setStarCount(prev => prev + 1)}
                  className="w-24 h-24 text-4xl font-bold bg-amber-100 hover:bg-amber-200 text-amber-900 border-4 border-amber-400 rounded-2xl flex items-center justify-center shadow-lg transform active:scale-95 transition"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="absolute bottom-4 left-4 flex items-center space-x-3 bg-purple-100 border border-purple-300 px-4 py-2 rounded-full shadow">
            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
              👩🏾‍🏫
            </div>
            <span className="text-sm font-semibold text-purple-900">Alefa is listening...</span>
          </div>
        </div>
      </main>

      {/* Navigation Dock */}
      <nav className="bg-white rounded-2xl p-3 shadow-lg flex justify-around items-center border border-gray-100">
        <button 
          onClick={() => setActiveSubject('LITERACY')}
          className={`flex flex-col items-center px-6 py-2 rounded-xl transition ${activeSubject === 'LITERACY' ? 'bg-emerald-500 text-white shadow-md' : 'text-gray-600'}`}
        >
          <span className="text-2xl">abc</span>
          <span className="text-xs font-bold mt-1">Literacy</span>
        </button>

        <button 
          onClick={() => setActiveSubject('NUMERACY')}
          className={`flex flex-col items-center px-6 py-2 rounded-xl transition ${activeSubject === 'NUMERACY' ? 'bg-red-500 text-white shadow-md' : 'text-gray-600'}`}
        >
          <span className="text-2xl">123</span>
          <span className="text-xs font-bold mt-1">Numeracy</span>
        </button>

        <button 
          onClick={() => setActiveSubject('STORIES')}
          className={`flex flex-col items-center px-6 py-2 rounded-xl transition ${activeSubject === 'STORIES' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-600'}`}
        >
          <span className="text-2xl">📖</span>
          <span className="text-xs font-bold mt-1">Stories</span>
        </button>

        <button 
          onClick={() => setCurrentStage(currentStage === 'PLAY_ZONE' ? 'STUDY_ZONE' : 'PLAY_ZONE')}
          className={`flex flex-col items-center px-6 py-2 rounded-xl transition ${currentStage === 'PLAY_ZONE' ? 'bg-yellow-400 text-gray-900 shadow-md' : 'text-gray-600'}`}
        >
          <span className="text-2xl">🎨</span>
          <span className="text-xs font-bold mt-1">Play Zone</span>
        </button>
      </nav>
    </div>
  );
}
