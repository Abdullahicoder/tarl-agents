import React, { useState, useEffect } from 'react';
import HeaderBar from './components/HeaderBar';
import MainStage from './components/MainStage';
import NavigationDock from './components/NavigationDock';

export default function StudentApp() {
  const [currentStage, setCurrentStage] = useState('STUDY_ZONE');
  const [activeSubject, setActiveSubject] = useState('LITERACY');
  const [starCount, setStarCount] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [activeItemIndex, setActiveItemIndex] = useState(0);

  const literacyItems = [
    { target: 'A', prompt: 'Find the letter A', options: ['A', 'B', 'C'], correct: 'A' },
    { target: 'B', prompt: 'Find the letter B', options: ['D', 'B', 'P'], correct: 'B' },
  ];

  const numeracyItems = [
    { target: '3', prompt: 'Count the apples: 🍎 🍎 🍎', options: ['2', '3', '5'], correct: '3' },
    { target: '2', prompt: 'Count the stars: ⭐ ⭐', options: ['1', '2', '4'], correct: '2' },
  ];

  const storyItems = [
    { title: 'The Wise Tortoise', text: 'Once upon a time, a small tortoise saved the forest water pool...' },
  ];

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (activeSubject === 'LITERACY') speakText(literacyItems[0].prompt);
    if (activeSubject === 'NUMERACY') speakText(numeracyItems[0].prompt);
    if (activeSubject === 'STORIES') speakText(storyItems[0].title);
  }, [activeSubject]);

  const currentItem = activeSubject === 'LITERACY' 
    ? literacyItems[activeItemIndex % literacyItems.length]
    : numeracyItems[activeItemIndex % numeracyItems.length];

  const handleOptionClick = (option, correctOption) => {
    if (option === correctOption) {
      setStarCount((prev) => prev + 1);
      setFeedback('SUCCESS');
      speakText('Great job!');
      setTimeout(() => {
        setFeedback(null);
        setActiveItemIndex((prev) => (prev + 1) % 2);
      }, 1200);
    } else {
      setFeedback('TRY_AGAIN');
      speakText('Try again!');
      setTimeout(() => setFeedback(null), 1000);
    }
  };

  return (
    <div className="h-screen w-screen bg-sky-100 flex flex-col justify-between p-4 font-sans select-none overflow-hidden">
      <HeaderBar 
        starCount={starCount} 
        resetStars={() => setStarCount(0)} 
        onAudioTrigger={() => speakText(activeSubject === 'STORIES' ? storyItems[0].text : currentItem.prompt)} 
      />
      <MainStage 
        currentStage={currentStage}
        activeSubject={activeSubject}
        currentItem={currentItem}
        storyItem={storyItems[0]}
        feedback={feedback}
        onOptionClick={handleOptionClick}
      />
      <NavigationDock 
        currentStage={currentStage}
        activeSubject={activeSubject}
        setStage={setCurrentStage}
        setSubject={setActiveSubject}
      />
    </div>
  );
}
