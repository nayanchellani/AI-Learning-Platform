import React from 'react';

const ResourceCard = ({ title, snippet, link, source }) => {
  return (
    <div className="resource-card">
      <div className="resource-card-header">
        <span className="source-badge">{source}</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="external-icon"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
      </div>
      <h3 className="resource-title">{title}</h3>
      <p className="resource-snippet">{snippet}</p>
      <a href={link} target="_blank" rel="noopener noreferrer" className="btn-read">
        Read
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
      </a>
    </div>
  );
};

export default ResourceCard;
