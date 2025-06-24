import { useState, useEffect, useCallback } from 'react';

interface ResearcherScreenshot {
  id: number;
  researcher_name: string;
  screenshot_url: string;
  original_url?: string;
  description?: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface UseResearcherScreenshotsReturn {
  screenshots: ResearcherScreenshot[];
  loading: boolean;
  error: string | null;
  fetchScreenshots: () => Promise<void>;
  addScreenshot: (data: Omit<ResearcherScreenshot, 'id' | 'created_at' | 'updated_at' | 'is_active'>) => Promise<ResearcherScreenshot | null>;
  updateScreenshot: (id: number, data: Partial<ResearcherScreenshot>) => Promise<ResearcherScreenshot | null>;
  deleteScreenshot: (id: number) => Promise<boolean>;
  captureScreenshot: (url: string) => Promise<string | null>;
}

export function useResearcherScreenshots(includeInactive = false): UseResearcherScreenshotsReturn {
  const [screenshots, setScreenshots] = useState<ResearcherScreenshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 스크린샷 목록 조회
  const fetchScreenshots = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const url = includeInactive 
        ? '/api/researcher-screenshots?include_inactive=true'
        : '/api/researcher-screenshots';
        
      const response = await fetch(url);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '스크린샷 조회 실패');
      }
      
      setScreenshots(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
      console.error('Error fetching screenshots:', err);
    } finally {
      setLoading(false);
    }
  }, [includeInactive]);

  // 스크린샷 추가
  const addScreenshot = useCallback(async (
    data: Omit<ResearcherScreenshot, 'id' | 'created_at' | 'updated_at' | 'is_active'>
  ): Promise<ResearcherScreenshot | null> => {
    try {
      const response = await fetch('/api/researcher-screenshots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || '스크린샷 추가 실패');
      }
      
      // 목록 새로고침
      await fetchScreenshots();
      
      return result.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
      console.error('Error adding screenshot:', err);
      return null;
    }
  }, [fetchScreenshots]);

  // 스크린샷 수정
  const updateScreenshot = useCallback(async (
    id: number,
    data: Partial<ResearcherScreenshot>
  ): Promise<ResearcherScreenshot | null> => {
    try {
      const response = await fetch('/api/researcher-screenshots', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || '스크린샷 수정 실패');
      }
      
      // 목록 새로고침
      await fetchScreenshots();
      
      return result.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
      console.error('Error updating screenshot:', err);
      return null;
    }
  }, [fetchScreenshots]);

  // 스크린샷 삭제
  const deleteScreenshot = useCallback(async (id: number): Promise<boolean> => {
    try {
      const response = await fetch(`/api/researcher-screenshots?id=${id}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || '스크린샷 삭제 실패');
      }
      
      // 목록 새로고침
      await fetchScreenshots();
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
      console.error('Error deleting screenshot:', err);
      return false;
    }
  }, [fetchScreenshots]);

  // URL로부터 스크린샷 캡처
  const captureScreenshot = useCallback(async (url: string): Promise<string | null> => {
    try {
      const response = await fetch('/api/screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || '스크린샷 캡처 실패');
      }
      
      return result.screenshot_url;
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
      console.error('Error capturing screenshot:', err);
      return null;
    }
  }, []);

  // 초기 로드
  useEffect(() => {
    fetchScreenshots();
  }, [fetchScreenshots]);

  return {
    screenshots,
    loading,
    error,
    fetchScreenshots,
    addScreenshot,
    updateScreenshot,
    deleteScreenshot,
    captureScreenshot,
  };
}