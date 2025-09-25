"use client";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook } from '@fortawesome/free-solid-svg-icons';

interface VocabularyCardProps {
  vocab: {
    term: string;
    definition: string;
    example?: string;
  };
}

export function VocabularyCard({ vocab }: VocabularyCardProps) {
  const frontContent = (
    <div className="space-y-3">
      <div className="w-8 h-8 bg-quest-blue-500 rounded-full flex items-center justify-center mx-auto">
        <FontAwesomeIcon icon={faBook} className="text-white text-sm" />
      </div>
      <h4 className="text-lg font-bold text-gray-900">
        {vocab.term}
      </h4>
    </div>
  );

  const backContent = (
    <div className="space-y-3">
      <h4 className="text-sm font-bold text-quest-blue-800 mb-2">
        {vocab.term}
      </h4>
      <p className="text-sm text-gray-700 leading-relaxed">
        {vocab.definition}
      </p>
      {vocab.example && (
        <div className="bg-white rounded p-2 border border-quest-blue-200">
          <p className="text-xs font-semibold text-quest-blue-700 mb-1">Example:</p>
          <p className="text-xs text-quest-blue-600 italic">{vocab.example}</p>
        </div>
      )}
    </div>
  );

  return { frontContent, backContent };
}