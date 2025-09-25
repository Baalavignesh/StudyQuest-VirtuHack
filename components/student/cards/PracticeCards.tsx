"use client";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLightbulb, faEye, faEyeSlash, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { SwipeableCard } from './SwipeableCard';
import { SimpleCard } from './SimpleCard';
import { useState } from 'react';

interface WorkedExampleCardProps {
  example: {
    problem: string;
    solution_steps: string[];
    final_answer: string;
    explanation?: string;
  };
}

function WorkedExampleCard({ example }: WorkedExampleCardProps) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="w-12 h-12 bg-quest-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <FontAwesomeIcon icon={faEye} className="text-white text-xl" />
        </div>
        <h4 className="text-lg font-semibold text-gray-900 mb-3">
          {example.problem}
        </h4>
      </div>
      
      <div className="bg-gray-50 rounded-game p-4">
        <h5 className="font-semibold text-gray-800 mb-3 text-sm">Solution Steps:</h5>
        <div className="space-y-2">
          {example.solution_steps.map((step: string, index: number) => (
            <div key={index} className="flex items-start">
              <span className="bg-quest-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0 mt-0.5">
                {index + 1}
              </span>
              <span className="text-sm text-gray-700">{step}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-green-50 border border-green-200 rounded-game p-3 text-center">
        <h6 className="text-sm font-semibold text-green-800 mb-1">Answer:</h6>
        <p className="text-green-700 font-medium">{example.final_answer}</p>
      </div>
      
      {example.explanation && (
        <div className="bg-quest-blue-50 border border-quest-blue-200 rounded-game p-3">
          <p className="text-sm text-quest-blue-700 italic">{example.explanation}</p>
        </div>
      )}
    </div>
  );
}

interface PracticeProblemsCardProps {
  problem: {
    problem: string;
    hint?: string;
    solution: string;
    difficulty: 'easy' | 'medium' | 'hard';
  };
}

function PracticeProblemCard({ problem }: PracticeProblemsCardProps) {
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <FontAwesomeIcon icon={faQuestionCircle} className="text-white text-xl" />
        </div>
        
        <div className="flex items-center justify-center mb-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getDifficultyColor(problem.difficulty)}`}>
            {problem.difficulty.toUpperCase()}
          </span>
        </div>
        
        <p className="text-gray-900 font-medium mb-4">
          {problem.problem}
        </p>
      </div>

      {/* Hint Section */}
      {problem.hint && (
        <div className="space-y-2">
          <button
            onClick={() => setShowHint(!showHint)}
            className="w-full bg-quest-blue-50 hover:bg-quest-blue-100 border border-quest-blue-200 rounded-game p-3 flex items-center justify-center text-quest-blue-700 font-medium transition-colors"
          >
            <FontAwesomeIcon icon={faLightbulb} className="mr-2" />
            {showHint ? 'Hide Hint' : 'Need a hint?'}
          </button>
          
          {showHint && (
            <div className="bg-quest-blue-50 border border-quest-blue-200 rounded-game p-3">
              <p className="text-sm text-quest-blue-700">{problem.hint}</p>
            </div>
          )}
        </div>
      )}

      {/* Solution Section */}
      <div>
        <button
          onClick={() => setShowSolution(!showSolution)}
          className={`w-full rounded-game border p-3 flex items-center justify-center text-sm font-medium transition-colors ${
            showSolution
              ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
              : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
          }`}
        >
          <FontAwesomeIcon icon={showSolution ? faEyeSlash : faEye} className="mr-2" />
          <span className={showSolution ? 'text-left leading-relaxed' : ''}>
            {showSolution ? problem.solution : 'Show Solution'}
          </span>
        </button>
      </div>
    </div>
  );
}

interface PracticeCardsProps {
  practiceMaterials: {
    worked_examples?: any[];
    practice_problems?: any[];
  };
  weekNumber: number;
}

export function PracticeCards({ practiceMaterials, weekNumber }: PracticeCardsProps) {
  const workedExamples = practiceMaterials.worked_examples ?? [];
  const practiceProblems = practiceMaterials.practice_problems ?? [];

  const hasWorkedExamples = workedExamples.length > 0;
  const hasPracticeProblems = practiceProblems.length > 0;

  if (!hasWorkedExamples && !hasPracticeProblems) {
    return null;
  }

  if (hasWorkedExamples && !hasPracticeProblems) {
    return (
      <div className="w-full">
        <SwipeableCard
          title="Worked Examples"
          items={workedExamples}
          renderCard={(example) => <WorkedExampleCard example={example} />}
          className="h-full"
        />
      </div>
    );
  }

  if (!hasWorkedExamples && hasPracticeProblems) {
    return (
      <div className="w-full">
        <SwipeableCard
          title={`Practice Problems (${practiceProblems.length})`}
          items={practiceProblems}
          renderCard={(problem) => <PracticeProblemCard problem={problem} />}
          className="h-full"
        />
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2 w-full">
      <SwipeableCard
        title="Worked Examples"
        items={workedExamples}
        renderCard={(example) => <WorkedExampleCard example={example} />}
        className="h-full"
      />
      <SwipeableCard
        title={`Practice Problems (${practiceProblems.length})`}
        items={practiceProblems}
        renderCard={(problem) => <PracticeProblemCard problem={problem} />}
        className="h-full"
      />
    </div>
  );
}