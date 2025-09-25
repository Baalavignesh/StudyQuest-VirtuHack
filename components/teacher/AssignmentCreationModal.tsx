"use client";
import { useState } from 'react';
import { Modal } from '@/components/Modal';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBook, 
  faSpinner, 
  faLightbulb, 
  faChartLine, 
  faGraduationCap,
  faClock,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';

interface WeekData {
  week_number: number;
  topic: string;
  description: string;
}

interface AssignmentCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  weekData: WeekData;
  courseId: string;
  onSuccess: () => void;
}

interface ContentGenerationForm {
  additionalDescription: string;
  learningFocus: string[];
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  contentDepth: 'basic' | 'detailed' | 'comprehensive';
  includeExamples: boolean;
  includePracticeProblems: boolean;
  timeEstimate: number;
}

export function AssignmentCreationModal({
  isOpen,
  onClose,
  weekData,
  courseId,
  onSuccess
}: AssignmentCreationModalProps) {
  const [formData, setFormData] = useState<ContentGenerationForm>({
    additionalDescription: '',
    learningFocus: [],
    difficultyLevel: 'intermediate',
    contentDepth: 'detailed',
    includeExamples: true,
    includePracticeProblems: true,
    timeEstimate: 60
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState<'form' | 'generating' | 'success'>('form');
  const [generationProgress, setGenerationProgress] = useState('');

  const focusAreas = [
    'Conceptual Understanding',
    'Problem Solving',
    'Real-world Applications',
    'Mathematical Reasoning',
    'Critical Thinking',
    'Practical Skills',
    'Creative Expression',
    'Analytical Skills'
  ];

  const handleFocusToggle = (focus: string) => {
    setFormData(prev => ({
      ...prev,
      learningFocus: prev.learningFocus.includes(focus)
        ? prev.learningFocus.filter(f => f !== focus)
        : [...prev.learningFocus, focus]
    }));
  };

  const generateContent = async () => {
    setIsGenerating(true);
    setCurrentStep('generating');
    
    try {
      // Step-by-step progress updates
      setGenerationProgress('Analyzing week topic and requirements...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setGenerationProgress('Creating personalized study materials...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setGenerationProgress('Generating practice examples and exercises...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setGenerationProgress('Creating assessment questions...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setGenerationProgress('Finalizing educational content package...');
      
      // Make API call to generate comprehensive content
      const response = await fetch('/api/create-comprehensive-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId,
          weekData,
          formData
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      const result = await response.json();
      
      if (result.success) {
        setCurrentStep('success');
        setTimeout(() => {
          onSuccess();
          onClose();
          setCurrentStep('form');
          setIsGenerating(false);
          setGenerationProgress('');
        }, 2000);
      } else {
        throw new Error(result.error || 'Content generation failed');
      }
      
    } catch (error: any) {
      console.error('Error generating content:', error);
      alert(`Error generating content: ${error.message}`);
      setIsGenerating(false);
      setCurrentStep('form');
      setGenerationProgress('');
    }
  };

  const renderGeneratingContent = () => (
    <div className="p-8 text-center">
      <div className="mb-8">
        <FontAwesomeIcon icon={faSpinner} className="text-6xl text-orange-500 animate-spin mb-4" />
        <h3 className="text-2xl font-semibold text-gray-900 mb-2">
          Creating Comprehensive Educational Content
        </h3>
        <p className="text-gray-600">
          Generating personalized study materials and assessment for Week {weekData.week_number}
        </p>
      </div>
      
      <div className="bg-orange-50 border border-orange-200 rounded-game p-4 mb-6">
        <div className="flex items-center justify-center mb-3">
          <FontAwesomeIcon icon={faLightbulb} className="text-orange-600 mr-2" />
          <span className="font-medium text-orange-800">AI Processing</span>
        </div>
        <p className="text-orange-700 text-sm">{generationProgress}</p>
        <div className="w-full bg-orange-200 rounded-full h-2 mt-3">
          <div className="bg-orange-500 h-2 rounded-full animate-pulse w-3/4"></div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="bg-gray-50 rounded-game p-3">
          <FontAwesomeIcon icon={faBook} className="text-gray-600 mb-2" />
          <div className="font-medium">Study Materials</div>
          <div className="text-gray-600">Comprehensive lesson content</div>
        </div>
        <div className="bg-gray-50 rounded-game p-3">
          <FontAwesomeIcon icon={faChartLine} className="text-gray-600 mb-2" />
          <div className="font-medium">Practice Examples</div>
          <div className="text-gray-600">Step-by-step solutions</div>
        </div>
        <div className="bg-gray-50 rounded-game p-3">
          <FontAwesomeIcon icon={faGraduationCap} className="text-gray-600 mb-2" />
          <div className="font-medium">Assessment</div>
          <div className="text-gray-600">10 tailored questions</div>
        </div>
        <div className="bg-gray-50 rounded-game p-3">
          <FontAwesomeIcon icon={faClock} className="text-gray-600 mb-2" />
          <div className="font-medium">Learning Path</div>
          <div className="text-gray-600">Structured objectives</div>
        </div>
      </div>
    </div>
  );

  const renderSuccessContent = () => (
    <div className="p-8 text-center">
      <FontAwesomeIcon icon={faCheckCircle} className="text-6xl text-green-500 mb-4" />
      <h3 className="text-2xl font-semibold text-gray-900 mb-2">
        Content Generated Successfully!
      </h3>
      <p className="text-gray-600 mb-4">
        Comprehensive educational materials have been created for Week {weekData.week_number}: {weekData.topic}
      </p>
      <div className="bg-green-50 border border-green-200 rounded-game p-4">
        <p className="text-green-800 text-sm">
          Students now have access to complete study materials, practice examples, and assessments.
        </p>
      </div>
    </div>
  );

  const renderFormContent = () => (
    <div className="p-6">
      <div className="mb-6">
        <div className="bg-orange-50 border border-orange-200 rounded-game p-4 mb-4">
          <h4 className="font-semibold text-orange-800 mb-2">
            Week {weekData.week_number}: {weekData.topic}
          </h4>
          <p className="text-orange-700 text-sm">{weekData.description}</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Additional Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Context & Requirements
          </label>
          <textarea
            value={formData.additionalDescription}
            onChange={(e) => setFormData(prev => ({ ...prev, additionalDescription: e.target.value }))}
            placeholder="Provide additional context, specific topics to emphasize, or particular learning outcomes you want to focus on..."
            className="w-full p-3 border border-gray-300 rounded-game resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            rows={4}
          />
        </div>

        {/* Learning Focus Areas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Learning Focus Areas (Select Multiple)
          </label>
          <div className="grid grid-cols-2 gap-2">
            {focusAreas.map((focus) => (
              <motion.button
                key={focus}
                onClick={() => handleFocusToggle(focus)}
                className={`p-2 rounded-game text-sm border transition-colors ${
                  formData.learningFocus.includes(focus)
                    ? 'bg-orange-100 border-orange-300 text-orange-800'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
                whileTap={{ scale: 0.98 }}
              >
                {focus}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Difficulty Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Content Difficulty Level
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'beginner', label: 'Beginner', desc: 'Basic concepts and simple examples' },
              { value: 'intermediate', label: 'Intermediate', desc: 'Standard level with moderate complexity' },
              { value: 'advanced', label: 'Advanced', desc: 'Complex concepts and challenging problems' }
            ].map((level) => (
              <motion.button
                key={level.value}
                onClick={() => setFormData(prev => ({ ...prev, difficultyLevel: level.value as any }))}
                className={`p-3 rounded-game border text-left transition-colors ${
                  formData.difficultyLevel === level.value
                    ? 'bg-orange-100 border-orange-300'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
                whileTap={{ scale: 0.98 }}
              >
                <div className="font-medium text-gray-900 text-sm">{level.label}</div>
                <div className="text-xs text-gray-600 mt-1">{level.desc}</div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Content Depth */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Content Depth
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'basic', label: 'Basic', desc: 'Essential concepts only' },
              { value: 'detailed', label: 'Detailed', desc: 'Comprehensive explanations' },
              { value: 'comprehensive', label: 'Comprehensive', desc: 'In-depth with extra resources' }
            ].map((depth) => (
              <motion.button
                key={depth.value}
                onClick={() => setFormData(prev => ({ ...prev, contentDepth: depth.value as any }))}
                className={`p-3 rounded-game border text-left transition-colors ${
                  formData.contentDepth === depth.value
                    ? 'bg-orange-100 border-orange-300'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
                whileTap={{ scale: 0.98 }}
              >
                <div className="font-medium text-gray-900 text-sm">{depth.label}</div>
                <div className="text-xs text-gray-600 mt-1">{depth.desc}</div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Additional Options */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Include Worked Examples
            </label>
            <button
              onClick={() => setFormData(prev => ({ ...prev, includeExamples: !prev.includeExamples }))}
              className={`w-full p-3 rounded-game border transition-colors ${
                formData.includeExamples
                  ? 'bg-orange-100 border-orange-300 text-orange-800'
                  : 'bg-gray-50 border-gray-200 text-gray-700'
              }`}
            >
              {formData.includeExamples ? 'Included' : 'Not Included'}
            </button>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Include Practice Problems
            </label>
            <button
              onClick={() => setFormData(prev => ({ ...prev, includePracticeProblems: !prev.includePracticeProblems }))}
              className={`w-full p-3 rounded-game border transition-colors ${
                formData.includePracticeProblems
                  ? 'bg-orange-100 border-orange-300 text-orange-800'
                  : 'bg-gray-50 border-gray-200 text-gray-700'
              }`}
            >
              {formData.includePracticeProblems ? 'Included' : 'Not Included'}
            </button>
          </div>
        </div>

        {/* Estimated Study Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estimated Study Time (minutes)
          </label>
          <input
            type="range"
            min="30"
            max="180"
            step="15"
            value={formData.timeEstimate}
            onChange={(e) => setFormData(prev => ({ ...prev, timeEstimate: parseInt(e.target.value) }))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>30 min</span>
            <span className="font-medium">{formData.timeEstimate} minutes</span>
            <span>3 hours</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
        <motion.button
          onClick={onClose}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-game font-medium hover:bg-gray-50 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Cancel
        </motion.button>
        <motion.button
          onClick={generateContent}
          disabled={isGenerating}
          className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-game font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Generate Complete Educational Content
        </motion.button>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={isGenerating ? () => {} : onClose}
      title={
        currentStep === 'form' ? 'Create Comprehensive Educational Content' :
        currentStep === 'generating' ? 'Generating Content' :
        'Content Created Successfully'
      }
      maxWidth="2xl"
      showCloseButton={!isGenerating}
    >
      {currentStep === 'form' && renderFormContent()}
      {currentStep === 'generating' && renderGeneratingContent()}
      {currentStep === 'success' && renderSuccessContent()}
    </Modal>
  );
}