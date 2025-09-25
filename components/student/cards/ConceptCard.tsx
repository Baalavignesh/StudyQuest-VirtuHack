"use client";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLightbulb } from '@fortawesome/free-solid-svg-icons';

interface ConceptCardProps {
  concept: {
    title: string;
    explanation: string;
    examples?: string[];
  };
}

export function ConceptCard({ concept }: ConceptCardProps) {
  return (
    <div className="text-center space-y-4">
      <div className="flex items-center justify-center mb-4">
        <div className="w-12 h-12 bg-quest-blue-100 rounded-full flex items-center justify-center">
          <FontAwesomeIcon icon={faLightbulb} className="text-quest-blue-600 text-xl" />
        </div>
      </div>
      
      <h4 className="text-xl font-semibold text-gray-900 mb-3">
        {concept.title}
      </h4>
      
      <p className="text-gray-700 leading-relaxed mb-4">
        {concept.explanation}
      </p>
      
      {concept.examples && concept.examples.length > 0 && (
        <div className="bg-quest-blue-50 rounded-game p-4 border border-quest-blue-200">
          <p className="text-sm font-semibold text-quest-blue-800 mb-2">Examples:</p>
          <ul className="space-y-1 text-sm text-quest-blue-700">
            {concept.examples.map((example, index) => (
              <li key={index} className="flex items-start">
                <span className="text-quest-blue-500 mr-2">•</span>
                <span>{example}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}