import React from 'react';

export default function HeaderBar({ starCount, resetStars, onAudioTrigger }) {
  return (
    <header className="flex justify-between items-center bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-md border border-white/50">
      <button 
        aria-label="Reset Progress"
        onClick={resetStars}
        className="w-12 h-12 bg-emerald-500 hover:bg-emerald-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md transform active:scale-95 transition"
      >
        ↺
      </button>
      
      {/* Progress Tracker / Star Rewards */}
      <div className="flex items-center space-x-2 bg-yellow-100 px-5 py-2 rounded-full border-2 border-yellow-300 shadow-inner">
        <span className="text-3xl animate-bounce">⭐</span>
        <span className="text-2xl font-black text-yellow-800">{starCount}</span>
      </div>

      {/* Audio Prompt Repeat */}
      <button 
        aria-label="Repeat Audio"
        onClick={onAudioTrigger}
        className="w-12 h-12 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center text-white text-xl shadow-md transform active:scale-95 transition"
      >
        🔊
      </button>
    </header>
  );
}
