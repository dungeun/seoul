'use client';

import { useResearcherScreenshots } from '@/lib/hooks/useResearcherScreenshots';
import Link from 'next/link';

export default function ResearcherScreenshotDisplay() {
  const { screenshots, loading, error } = useResearcherScreenshots();

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 h-48 rounded-lg mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        연구진 정보를 불러오는 중 오류가 발생했습니다.
      </div>
    );
  }

  if (screenshots.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        등록된 연구진 정보가 없습니다.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {screenshots.map((screenshot) => (
        <div
          key={screenshot.id}
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
        >
          {screenshot.original_url ? (
            <Link
              href={screenshot.original_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={screenshot.screenshot_url}
                  alt={screenshot.researcher_name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            </Link>
          ) : (
            <div className="relative h-48 overflow-hidden">
              <img
                src={screenshot.screenshot_url}
                alt={screenshot.researcher_name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-1">
              {screenshot.researcher_name}
            </h3>
            {screenshot.description && (
              <p className="text-sm text-gray-600">
                {screenshot.description}
              </p>
            )}
            {screenshot.original_url && (
              <Link
                href={screenshot.original_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center mt-2 text-sm text-blue-600 hover:text-blue-800"
              >
                <span>프로필 보기</span>
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </Link>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}