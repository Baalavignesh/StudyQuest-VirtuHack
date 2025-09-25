"use client";
import { motion } from 'framer-motion';
import { WeekNode } from './WeekNode';
import { ConnectingPath } from './ConnectingPath';
import { WeeklyContent, StudentProgress } from '@/interfaces';
import { useRouter } from 'next/navigation';

interface WeekLevelMapProps {
  courseId: string;
  weeks: WeeklyContent[];
  studentProgress?: StudentProgress;
  currentWeek: number;
  midtermWeek?: number;
  finalExamWeek?: number;
}

export function WeekLevelMap({
  courseId,
  weeks,
  studentProgress,
  currentWeek,
  midtermWeek = 6,
  finalExamWeek = 12
}: WeekLevelMapProps) {
  const router = useRouter();

  const isWeekReleased = (week?: WeeklyContent) => {
    if (!week) {
      return false;
    }

    const hasStudyContent = week.study_content?.created === true;
    const hasAssignment = week.weekly_assignment?.created === true;
    const hasVideo = week.video?.uploaded === true;

    return hasStudyContent || hasAssignment || hasVideo;
  };

  const getWeekStatus = (weekNumber: number) => {
    const completedWeeks = studentProgress?.completed_weeks || [];
    const weekData = weeks.find((item) => item.week_number === weekNumber);
    const released = isWeekReleased(weekData);
    const isCompleted = completedWeeks.includes(weekNumber);
    const meetsProgress = weekNumber <= currentWeek;
    const isUnlocked = isCompleted || (meetsProgress && released);
    const isCurrentWeek = weekNumber === currentWeek && !isCompleted && released;
    const isBossWeek = weekNumber === midtermWeek || weekNumber === finalExamWeek;

    return { isCompleted, isUnlocked, isCurrentWeek, isBossWeek };
  };

  const handleWeekClick = (weekNumber: number) => {
    const { isUnlocked } = getWeekStatus(weekNumber);
    if (isUnlocked) {
      router.push(`/student/course/${courseId}/week/${weekNumber}`);
    }
  };

  return (
    <div className="bg-white rounded-game-lg p-10 border border-gray-200 shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Course Progress
        </h2>
        <p className="text-gray-600">
          Complete each week in order to unlock the next level
        </p>
      </div>

      <div className="relative">
        {/* Horizontal scrollable container */}
        <div 
          className="overflow-x-auto overflow-y-visible scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400"
          style={{ scrollbarWidth: 'thin' }}
        >
          <div className="flex items-center space-x-8 pb-4 min-w-max px-4 py-6">
            {weeks.map((week, index) => {
              const weekNumber = week.week_number ?? index + 1;
              const {
                isCompleted,
                isUnlocked,
                isCurrentWeek,
                isBossWeek
              } = getWeekStatus(weekNumber);
              const nextWeekNumber = weeks[index + 1]?.week_number ?? weekNumber + 1;
              const nextWeekStatus = getWeekStatus(nextWeekNumber);
              
              return (
                <div key={week.week_number ?? weekNumber} className="flex items-center">
                  {/* Week Node */}
                  <WeekNode
                    weekNumber={weekNumber}
                    isUnlocked={isUnlocked}
                    isCompleted={isCompleted}
                    isCurrentWeek={isCurrentWeek}
                    isBossWeek={isBossWeek}
                    onClick={() => handleWeekClick(weekNumber)}
                  />
                  
                  {/* Connecting Path (if not last week) */}
                  {index < weeks.length - 1 && (
                    <div className="mx-4">
                      <ConnectingPath
                        isUnlocked={nextWeekStatus.isUnlocked}
                        isCompleted={isCompleted}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>



      </div>
    </div>
  );
}