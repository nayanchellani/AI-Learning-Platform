import React from 'react';

const ResourceCard = ({ title, snippet, link, source }) => {
  return (
    <div className="resource-card">
      <div className="resource-card-header">
        <span className="source-badge">{source}</span>
      </div>
      <h3 className="resource-title">{title}</h3>
      <p className="resource-snippet">{snippet}</p>
      <a href={link} target="_blank" rel="noopener noreferrer" className="btn-read">
        Read
      </a>
    </div>
  );
};

export default ResourceCard;
