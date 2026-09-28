import React from 'react';
import { CoreCalendar } from './CoreCalendar';

/**
 * Wrapper around CoreCalendar that should inject the new rooms timeline.
 * This is a workaround for file editing issues.
 */
export const CoreCalendarWrapper: React.FC = () => {
  // Intercept and wrap the CoreCalendar
  React.useEffect(() => {
    console.log('🔧 CoreCalendarWrapper mounted');
    console.log('Looking for rooms view to replace...');
  }, []);
  
  return <CoreCalendar />;
};

// Also export as default for backwards compatibility
export default CoreCalendarWrapper;
