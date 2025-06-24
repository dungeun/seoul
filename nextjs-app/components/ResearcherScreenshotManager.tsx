'use client';

import { useState } from 'react';
import { useResearcherScreenshots } from '@/lib/hooks/useResearcherScreenshots';

export default function ResearcherScreenshotManager() {
  const {
    screenshots,
    loading,
    error,
    addScreenshot,
    updateScreenshot,
    deleteScreenshot,
    captureScreenshot,
  } = useResearcherScreenshots();

  const [formData, setFormData] = useState({
    researcher_name: '',
    original_url: '',
    description: '',
    order_index: 0,
  });

  const [isCapturing, setIsCapturing] = useState(false);

  // 스크린샷 캡처 및 저장
  const handleCaptureAndSave = async () => {
    if (!formData.researcher_name || !formData.original_url) {
      alert('연구진 이름과 URL을 입력해주세요.');
      return;
    }

    setIsCapturing(true);
    try {
      // 1. 스크린샷 캡처
      const screenshotUrl = await captureScreenshot(formData.original_url);
      
      if (!screenshotUrl) {
        alert('스크린샷 캡처에 실패했습니다.');
        return;
      }

      // 2. 데이터베이스에 저장
      const result = await addScreenshot({
        researcher_name: formData.researcher_name,
        screenshot_url: screenshotUrl,
        original_url: formData.original_url,
        description: formData.description,
        order_index: formData.order_index,
      });

      if (result) {
        alert('연구진 스크린샷이 성공적으로 추가되었습니다.');
        // 폼 초기화
        setFormData({
          researcher_name: '',
          original_url: '',
          description: '',
          order_index: 0,
        });
      }
    } catch (err) {
      console.error('Error:', err);
      alert('오류가 발생했습니다.');
    } finally {
      setIsCapturing(false);
    }
  };

  // 활성화/비활성화 토글
  const toggleActive = async (id: number, currentStatus: boolean) => {
    await updateScreenshot(id, { is_active: !currentStatus });
  };

  // 삭제
  const handleDelete = async (id: number) => {
    if (confirm('정말로 삭제하시겠습니까?')) {
      await deleteScreenshot(id);
    }
  };

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>오류: {error}</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">탄소중립 기술 연구진 스크린샷 관리</h2>

      {/* 새 스크린샷 추가 폼 */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h3 className="text-xl font-semibold mb-4">새 연구진 추가</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">연구진 이름</label>
            <input
              type="text"
              value={formData.researcher_name}
              onChange={(e) => setFormData({ ...formData, researcher_name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="홍길동 교수"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">웹사이트 URL</label>
            <input
              type="url"
              value={formData.original_url}
              onChange={(e) => setFormData({ ...formData, original_url: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="https://example.com/researcher"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">설명</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="서울대학교 환경공학과"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">순서</label>
            <input
              type="number"
              value={formData.order_index}
              onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border rounded-lg"
              min="0"
            />
          </div>
        </div>
        
        <button
          onClick={handleCaptureAndSave}
          disabled={isCapturing}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isCapturing ? '처리 중...' : '스크린샷 캡처 및 저장'}
        </button>
      </div>

      {/* 스크린샷 목록 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">썸네일</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">연구진</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">설명</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">순서</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">상태</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">작업</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {screenshots.map((screenshot) => (
              <tr key={screenshot.id}>
                <td className="px-4 py-3">
                  <img
                    src={screenshot.screenshot_url}
                    alt={screenshot.researcher_name}
                    className="w-24 h-16 object-cover rounded"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium">{screenshot.researcher_name}</div>
                  {screenshot.original_url && (
                    <a
                      href={screenshot.original_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      원본 링크
                    </a>
                  )}
                </td>
                <td className="px-4 py-3 text-sm">{screenshot.description || '-'}</td>
                <td className="px-4 py-3 text-sm">{screenshot.order_index}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleActive(screenshot.id, screenshot.is_active)}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      screenshot.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {screenshot.is_active ? '활성' : '비활성'}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleDelete(screenshot.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {screenshots.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            등록된 연구진 스크린샷이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}