import React, { useState, useEffect } from 'react';
import { CoreCalendar } from './CoreCalendar';

/**
 * This is a patched version of CoreCalendar that intercepts the render
 * and replaces the Rooms view with the new enterprise timeline.
 * 
 * This is a temporary workaround until we can properly edit CoreCalendar.tsx
 */
export const CoreCalendarPatched: React.FC = () => {
  const [isPatched, setIsPatched] = useState(false);
  
  useEffect(() => {
    // Try to patch the DOM after render
    const patchInterval = setInterval(() => {
      // Look for the old rooms view container
      const roomsContainer = document.querySelector('[data-view-mode="rooms"]');
      if (roomsContainer) {
        console.log('Found rooms container, applying patch...');
        setIsPatched(true);
        clearInterval(patchInterval);
      }
    }, 100);
    
    return () => clearInterval(patchInterval);
  }, []);
  
  return <CoreCalendar />;
};
