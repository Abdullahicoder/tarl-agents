import React from 'react';

export default function MainStage({ currentStage, activeSubject, currentItem, storyItem, feedback, onOptionClick }) {
  if (currentStage === 'PLAY_ZONE') {
    return (
      <main className="flex-1 flex items-center justify-center my-4 relative">
        <div className="w-full max-w-4xl h-full bg-amber-50 rounded-3xl shadow-2xl p-6 flex flex-col items-center justify-center relative border-4 border-yellow-300">
          <h2 className="text-4xl font-black text-yellow-900 mb-4">🎨 Welcome to the Play Zone!</h2>
          <p className="text-lg text-yellow-800 font-semibold mb-6">Earn stars in the Study Zone to unlock new creative activities.</p>
          <div className="w-48 h-48 bg-yellow-200 border-4 border-yellow-400 rounded-full flex items-center justify-center text-7xl shadow-inner">
            🎯
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex items-center justify-center my-4 relative">
      <div className="w-full max-w-4xl h-full bg-white rounded-3xl shadow-2xl p-6 flex flex-col items-center justify-between relative border-4 border-sky-200">
        
        {/* Feedback Overlay */}
        {feedback === 'SUCCESS' && (
          <div className="absolute inset-0 bg-emerald-500/90 rounded-3xl flex items-center justify-center z-20 backdrop-blur-sm transition">
            <span className="text-6xl font-black text-white animate-bounce">✨ Awesome! +1 ⭐</span>
          </div>
        )}

        {/* Prompt Header */}
        <div className="text-center mt-4">
          <h2 className="text-3xl md:text-4xl font-black text-gray-800 tracking-wide">
            {activeSubject === 'STORIES' ? storyItem.title : currentItem.prompt}
          </h2>
        </div>

        {/* Exercise Options or Story Engine */}
        {activeSubject !== 'STORIES' ? (
          <div className="flex justify-center items-center gap-6 my-auto">
            {currentItem.options.map((option) => (
              <button 
                key={option}
                onClick={() => onOptionClick(option, currentItem.correct)}
                className="w-28 h-28 md:w-36 md:h-36 text-5xl font-black bg-amber-100 hover:bg-amber-200 text-amber-900 border-4 border-amber-400 rounded-3xl flex items-center justify-center shadow-lg transform hover:-translate-y-1 active:scale-95 transition"
              >
                {option}
              </button>
            ))}
          </div>
        ) : (
          <div className="bg-amber-50 p-6 rounded-2xl border-2 border-amber-200 text-center max-w-2xl my-auto shadow-inner">
            <p className="text-xl leading-relaxed text-gray-800 font-medium">
              {storyItem.text}
            </p>
          </div>
        )}

        {/* Companion Teacher Badge */}
        <div className="self-start flex items-center space-x-3 bg-purple-100 border border-purple-300 px-4 py-2 rounded-full shadow-sm">
          <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
            👩🏾‍🏫
          </div>
          <span className="text-sm font-bold text-purple-900">Alefa is guiding you...</span>
        </div>
      </div>
    </main>
  );
}
