
import React from 'react';
import { Source } from '../types';

interface SourceLinkProps {
  source: Source;
  index: number;
}

const SourceLink: React.FC<SourceLinkProps> = ({ source, index }) => {
  if (!source.uri) return null;

  return (
    <a
      href={source.uri}
      target="_blank"
      rel="noopener noreferrer"
      className="block text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition-colors truncate"
      title={source.title}
    >
      <span className="font-semibold">{index + 1}.</span> {source.title || new URL(source.uri).hostname}
    </a>
  );
};

export default SourceLink;
