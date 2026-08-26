import React from 'react';

export default function NavigationDock({ currentStage, activeSubject, setStage, setSubject }) {
  return (
    <nav className="bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-xl flex justify-around items-center border border-gray-100">
      <button 
        onClick={() => { setStage('STUDY_ZONE'); setSubject('LITERACY'); }}
        className={`flex flex-col items-center px-6 py-2 rounded-xl transition transform active:scale-95 ${activeSubject === 'LITERACY' && currentStage === 'STUDY_ZONE' ? 'bg-emerald-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
      >
        <span className="text-2xl">abc</span>
        <span className="text-xs font-bold mt-1">Literacy</span>
      </button>

      <button 
        onClick={() => { setStage('STUDY_ZONE'); setSubject('NUMERACY'); }}
        className={`flex flex-col items-center px-6 py-2 rounded-xl transition transform active:scale-95 ${activeSubject === 'NUMERACY' && currentStage === 'STUDY_ZONE' ? 'bg-red-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
      >
        <span className="text-2xl">123</span>
        <span className="text-xs font-bold mt-1">Numeracy</span>
      </button>

      <button 
        onClick={() => { setStage('STUDY_ZONE'); setSubject('STORIES'); }}
        className={`flex flex-col items-center px-6 py-2 rounded-xl transition transform active:scale-95 ${activeSubject === 'STORIES' && currentStage === 'STUDY_ZONE' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
      >
        <span className="text-2xl">📖</span>
        <span className="text-xs font-bold mt-1">Stories</span>
      </button>

      <button 
        onClick={() => setStage(currentStage === 'PLAY_ZONE' ? 'STUDY_ZONE' : 'PLAY_ZONE')}
        className={`flex flex-col items-center px-6 py-2 rounded-xl transition transform active:scale-95 ${currentStage === 'PLAY_ZONE' ? 'bg-yellow-400 text-gray-900 shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
      >
        <span className="text-2xl">🎨</span>
        <span className="text-xs font-bold mt-1">Play Zone</span>
      </button>
    </nav>
  );
}
