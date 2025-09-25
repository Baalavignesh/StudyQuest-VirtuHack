"use client";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faExternalLinkAlt,
  faBook,
  faVideo,
  faQuestionCircle,
  faDownload 
} from '@fortawesome/free-solid-svg-icons';
import { SimpleCard } from './SimpleCard';

interface ResourcesCardProps {
  resources: Array<{
    title: string;
    type: 'link' | 'reading' | 'video' | 'exercise';
    content: string;
    description?: string;
  }>;
}

export function ResourcesCard({ resources }: ResourcesCardProps) {
  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'link': return faExternalLinkAlt;
      case 'reading': return faBook;
      case 'video': return faVideo;
      case 'exercise': return faQuestionCircle;
      default: return faDownload;
    }
  };

  const getResourceColor = (type: string) => {
    switch (type) {
      case 'link': return 'text-quest-blue-600 bg-white border-gray-200 hover:bg-gray-50';
      case 'reading': return 'text-green-600 bg-white border-gray-200 hover:bg-gray-50';
      case 'video': return 'text-purple-600 bg-white border-gray-200 hover:bg-gray-50';
      case 'exercise': return 'text-orange-600 bg-white border-gray-200 hover:bg-gray-50';
      default: return 'text-gray-600 bg-white border-gray-200 hover:bg-gray-50';
    }
  };

  return (
    <SimpleCard>
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 bg-quest-blue-500 rounded-full flex items-center justify-center mr-3">
          <FontAwesomeIcon icon={faDownload} className="text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">
        Additional Resources
        </h3>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {resources.map((resource, index) => (
          <div 
            key={index} 
            className={`border rounded-game p-4 transition-all duration-200 cursor-pointer ${getResourceColor(resource.type)}`}
          >
            <div className="flex items-start">
              <FontAwesomeIcon 
                icon={getResourceIcon(resource.type)} 
                className={`text-lg mr-3 mt-1 flex-shrink-0 ${getResourceColor(resource.type).split(' ')[0]}`}
              />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                  {resource.title}
                </h4>
                {resource.description && (
                  <p className="text-gray-600 text-xs mb-3 leading-relaxed">
                    {resource.description}
                  </p>
                )}
                
                {resource.type === 'link' ? (
                  <a
                    href={resource.content}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-quest-blue-600 hover:text-quest-blue-800 font-medium text-xs"
                  >
                    <FontAwesomeIcon icon={faExternalLinkAlt} className="mr-1" />
                    Open Link
                  </a>
                ) : (
                  <div className="bg-white rounded p-2 border text-xs text-gray-700">
                    {resource.content.length > 100 
                      ? `${resource.content.substring(0, 100)}...` 
                      : resource.content
                    }
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </SimpleCard>
  );
}