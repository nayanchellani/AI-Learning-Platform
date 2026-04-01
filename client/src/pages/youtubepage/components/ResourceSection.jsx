import React from 'react';
import ResourceCard from './ResourceCard';

const ResourceSection = ({ title, data }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="resource-section">
      <h2 className="section-title">{title}</h2>
      <div className="resource-grid">
        {data.map((item, index) => (
          <ResourceCard 
            key={index}
            title={item.title}
            snippet={item.snippet}
            link={item.link}
            source={item.source}
          />
        ))}
      </div>
    </div>
  );
};

export default ResourceSection;
