"use client";
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGraduationCap, faTrophy, faFlagCheckered, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { SwipeableCard } from './SwipeableCard';
import { FlipCard } from './FlipCard';
import { SimpleCard } from './SimpleCard';
import { ConceptCard } from './ConceptCard';
import { VocabularyCard } from './VocabularyCard';
import { StepCard } from './StepCard';
import { Modal } from '@/components/Modal';
import { PracticeCards } from './PracticeCards';
import { ResourcesCard } from './ResourcesCard';

interface StudyContentCardsProps {
  lessonContent: any;
  weekNumber: number;
  summary?: string;
  resources?: Array<{
    title: string;
    type: 'link' | 'reading' | 'video' | 'exercise';
    content: string;
    description?: string;
  }>;
}

export function StudyContentCards({ lessonContent, weekNumber, summary, resources = [] }: StudyContentCardsProps) {
  const steps = useMemo(() => lessonContent.step_by_step_guide || [], [lessonContent.step_by_step_guide]);
  const [isStepModalOpen, setIsStepModalOpen] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const openStepModal = (index: number) => {
    setActiveStepIndex(index);
    setIsStepModalOpen(true);
  };

  const closeStepModal = () => setIsStepModalOpen(false);

  const stepPreview = steps.slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Step-by-Step Mission Card */}
      {steps.length > 0 && (
        <motion.button
          type="button"
          onClick={() => openStepModal(0)}
          className="w-full text-left"
          whileHover={{ translateY: -4, boxShadow: '0 16px 40px rgba(59, 130, 246, 0.25)' }}
          whileTap={{ scale: 0.99 }}
        >
          <div className="rounded-game-xl border border-transparent bg-gradient-to-br from-quest-blue-500 via-quest-purple-500 to-quest-blue-700 px-6 py-8 lg:px-10 lg:py-10 text-white shadow-xl overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('/textures/noise.png')] opacity-[0.08] pointer-events-none" aria-hidden="true"></div>
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-inner">
                  <FontAwesomeIcon icon={faFlagCheckered} className="text-2xl" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-white/80">
                    Mission Mode
                  </p>
                  <h2 className="text-2xl md:text-3xl font-bold">Step-by-Step Adventure</h2>
                  <p className="mt-2 text-white/85 text-sm md:text-base max-w-xl">
                    Unlock {steps.length} guided steps to master this week&apos;s lesson. Earn rewards as you progress through each challenge.
                  </p>
                </div>
              </div>

              <div className="flex-1 lg:flex lg:items-center lg:justify-between gap-6">
                <div className="grid sm:grid-cols-3 gap-3 flex-1">
                  {stepPreview.map((step: any, index: number) => (
                    <div key={index} className="bg-white/10 rounded-game-lg px-4 py-3 border border-white/10 backdrop-blur-sm">
                      <span className="text-xs font-semibold uppercase tracking-wide text-white/70">
                        Step {step.step}
                      </span>
                      <p className="mt-1 text-sm font-medium leading-snug">
                        {step.title}
                      </p>
                    </div>
                  ))}
                  {steps.length > 3 && (
                    <div className="bg-white/10 rounded-game-lg px-4 py-3 border border-white/10 backdrop-blur-sm flex items-center justify-center text-sm font-semibold text-white/80">
                      +{steps.length - 3} more
                    </div>
                  )}
                </div>

                <div className="mt-4 lg:mt-0 lg:text-right">
                  <span className="inline-flex items-center px-4 py-2 rounded-full bg-white/15 text-sm font-semibold backdrop-blur-sm">
                    Start Mission
                    <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.button>
      )}

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          {/* Learning Objectives */}
          {lessonContent.learning_objectives && lessonContent.learning_objectives.length > 0 && (
            <SimpleCard delay={0.2}>
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-3">
                  <FontAwesomeIcon icon={faTrophy} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Learning Goals</h3>
              </div>
              <div className="grid gap-3">
                {lessonContent.learning_objectives.map((objective: string, index: number) => (
                  <div key={index} className="flex items-start p-3 rounded-game border border-green-200 bg-green-50/70">
                    <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5 flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-gray-800 text-sm leading-relaxed">{objective}</span>
                  </div>
                ))}
              </div>
            </SimpleCard>
          )}

          {/* Main Concepts - Swipeable Cards */}
          {lessonContent.main_concepts && lessonContent.main_concepts.length > 0 && (
            <SwipeableCard
              title={`Key Concepts`}
              items={lessonContent.main_concepts}
              renderCard={(concept) => <ConceptCard concept={concept} />}
              className="delay-[0.3s]"
            />
          )}

          {/* Worked Examples & Practice Problems */}
          {lessonContent.practice_materials && (
            <PracticeCards
              practiceMaterials={lessonContent.practice_materials}
              weekNumber={weekNumber}
            />
          )}
          
        </div>

        <div className="space-y-6 lg:col-span-5">
          {/* Vocabulary - Flip Cards Grid */}
          {lessonContent.key_vocabulary && lessonContent.key_vocabulary.length > 0 && (
            <SimpleCard delay={0.3}>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Vocabulary</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {lessonContent.key_vocabulary.map((vocab: any, index: number) => {
                  const { frontContent, backContent } = VocabularyCard({ vocab });
                  return (
                    <FlipCard
                      key={index}
                      frontContent={frontContent}
                      backContent={backContent}
                    />
                  );
                })}
              </div>
            </SimpleCard>
          )}

          {/* Teacher Tips or Bonus Content */}
          {lessonContent.teacher_tips && lessonContent.teacher_tips.length > 0 && (
            <SimpleCard delay={0.35}>
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-quest-blue-500 rounded-full flex items-center justify-center mr-3">
                  <FontAwesomeIcon icon={faGraduationCap} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Teacher Tips</h3>
              </div>
              <ul className="space-y-3 text-sm text-gray-700">
                {lessonContent.teacher_tips.map((tip: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="mt-1 inline-block w-2 h-2 rounded-full bg-quest-blue-500"></span>
                    <span className="leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </SimpleCard>
          )}

          
        </div>
      </div>
      
      {resources && resources.length > 0 && (
        <ResourcesCard resources={resources} />
      )}

      {summary && (
        <SimpleCard variant="primary" delay={0.4} className="text-center">
          <h3 className="text-lg font-semibold text-quest-blue-900 mb-4">Summary</h3>
          <p className="text-quest-blue-800 leading-relaxed">{summary}</p>
        </SimpleCard>
      )}
      <Modal
        isOpen={isStepModalOpen}
        onClose={closeStepModal}
        title={`Step-by-Step Mission · Week ${weekNumber}`}
        maxWidth="2xl"
      >
        <div className="p-6 space-y-6">
          <div className="grid gap-6 lg:grid-cols-5">
            <div className="space-y-4 lg:col-span-2">
              <div className="rounded-game-lg border border-quest-blue-200 bg-quest-blue-50 p-4">
                <p className="text-sm font-semibold text-quest-blue-800">
                  Progress Overview
                </p>
                <p className="mt-2 text-2xl font-bold text-quest-blue-900">
                  {activeStepIndex + 1} / {steps.length}
                </p>
                <p className="text-xs text-quest-blue-700 mt-1">
                  Select any step to focus on the challenge and strategy.
                </p>
              </div>

              <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                {steps.map((step: any, index: number) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setActiveStepIndex(index)}
                    className={`w-full text-left rounded-game border px-4 py-3 transition-all duration-150 ${
                      index === activeStepIndex
                        ? 'border-quest-blue-400 bg-quest-blue-50 text-quest-blue-800 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-quest-blue-200 hover:bg-quest-blue-50/60'
                    }`}
                  >
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Step {step.step}
                    </span>
                    <p className="text-sm font-medium text-gray-800 mt-1 leading-snug">
                      {step.title}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-3">
              <SimpleCard className="bg-white border-gray-100 shadow-md" delay={0}>
                <StepCard step={steps[activeStepIndex]} totalSteps={steps.length} />
              </SimpleCard>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}