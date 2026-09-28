import React from 'react';
import { ServiceHubView } from './ServiceHubView';

export const ServicesSupportDixel: React.FC<{ persona?: string }> = ({ persona }) => {
  // We can use the persona prop to adjust the view if needed, 
  // but for now we just render the new Service Hub.
  return (
    <div className="h-full w-full">
      <ServiceHubView />
    </div>
  );
};

export default ServicesSupportDixel;
