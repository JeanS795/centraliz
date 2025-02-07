import React, { useState, useEffect, useCallback } from "react";
import { useSwipeable } from 'react-swipeable';
import NavBar from "./NavBar";
import Notes from "./Notes";
import HpCalendar from "./HpCalendar";
import ClaCalendar from "./ClaCalendar";
import Mail from "./Mail";
import Links from "./Links";

function Main() {
  const [currentPosition, setCurrentPosition] = useState('center');
  const [isTyping, setIsTyping] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  const isInputFocused = () => {
    const activeElement = document.activeElement;
    return activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA';
  };

  const getNewPosition = useCallback((direction) => {
    const positions = {
      left: { right: 'center', left: 'center' },
      center: { right: 'right', left: 'left' },
      right: { right: 'center', left: 'center' }
    };
    return positions[currentPosition][direction];
  }, [currentPosition]);

  const handleNavigation = useCallback((direction, isButton = false) => {
    if (isTyping || isBlocked) {
      return;
    }

    if (isButton) {
      // Navigation directe pour les boutons
      setCurrentPosition(direction);
      return;
    }

    // Navigation progressive pour les flèches
    if (
      (currentPosition === 'right' && direction === 'right') ||
      (currentPosition === 'left' && direction === 'left')
    ) {
      setIsBlocked(true);
      setTimeout(() => setIsBlocked(false), 400);
      return;
    }

    const newPosition = getNewPosition(direction);
    setCurrentPosition(newPosition);
  }, [currentPosition, isTyping, isBlocked, getNewPosition]); // Ajout de getNewPosition

  useEffect(() => {
    const updateMedia = () => {
      setIsDesktop(window.innerWidth > 768);
    };
    updateMedia();
    window.addEventListener('resize', updateMedia);
    return () => window.removeEventListener('resize', updateMedia);
  }, []);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handleNavigation('right'),
    onSwipedRight: () => handleNavigation('left'),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  });

  const handlers = isDesktop ? {} : swipeHandlers;

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (isInputFocused()) {
        setIsTyping(true);
        return;
      }
      setIsTyping(false);
      if (e.key === 'ArrowLeft') handleNavigation('left');
      if (e.key === 'ArrowRight') handleNavigation('right');
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleNavigation]); // Mise à jour des dépendances

  return (
    <div className="main-container">
      <NavBar 
        currentPosition={currentPosition}
        handleNavigation={handleNavigation}
        isTyping={isTyping}
      />
      <div className="pages-container" {...handlers}>
        <div className={`pages-wrapper position-${currentPosition} ${isBlocked ? 'blocked' : ''}`}>
          <div className="page-section notes-section">
            <div className="section-content">
              <div className="div-notes">
                <Notes />
              </div>
            </div>
          </div>

          <div className="page-section calendars-section">
            <div className="section-content">
              <div className="calendars-wrapper">
                <div className="div-hp-calendar">
                  <HpCalendar />
                </div>
                <div className="div-cla-calendar">
                  <ClaCalendar />
                </div>
              </div>
            </div>
          </div>

          <div className="page-section mail-links-section">
            <div className="section-content">
              <div className="mail-links-wrapper">
                <div className="div-mail">
                  <Mail />
                </div>
                <div className="div-links">
                  <Links />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Main;