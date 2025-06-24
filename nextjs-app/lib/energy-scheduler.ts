import * as cron from 'node-cron';

// 에너지 데이터 자동 수집 스케줄러
export class EnergyDataScheduler {
  private tasks: cron.ScheduledTask[] = [];
  private isRunning = false;

  // 스케줄러 시작
  start() {
    if (this.isRunning) {
      console.log('Energy scheduler is already running');
      return;
    }

    console.log('Starting energy data collection scheduler...');

    // 매시간 정각에 데이터 수집 (예: 00:00, 01:00, 02:00...)
    const hourlyTask = cron.schedule('0 * * * *', async () => {
      console.log('Running hourly energy data collection...');
      await this.collectEnergyData();
    });

    // 매일 자정에 일일 리포트 생성
    const dailyTask = cron.schedule('0 0 * * *', async () => {
      console.log('Running daily energy report generation...');
      await this.generateDailyReport();
    });

    // 매월 1일 자정에 월간 리포트 생성
    const monthlyTask = cron.schedule('0 0 1 * *', async () => {
      console.log('Running monthly energy report generation...');
      await this.generateMonthlyReport();
    });

    this.tasks = [hourlyTask, dailyTask, monthlyTask];
    this.isRunning = true;

    // 시작 시 즉시 한 번 실행
    this.collectEnergyData();

    console.log('Energy scheduler started successfully');
  }

  // 스케줄러 중지
  stop() {
    if (!this.isRunning) {
      console.log('Energy scheduler is not running');
      return;
    }

    this.tasks.forEach(task => task.stop());
    this.tasks = [];
    this.isRunning = false;

    console.log('Energy scheduler stopped');
  }

  // 에너지 데이터 수집
  private async collectEnergyData() {
    try {
      const apiKey = process.env.INTERNAL_API_KEY || 'dev-key';
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

      const response = await fetch(`${baseUrl}/api/energy-collector`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Collection failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('Energy data collection completed:', result);

      // 수집 성공 시 실시간 데이터 업데이트 트리거
      await this.triggerRealtimeUpdate();

    } catch (error) {
      console.error('Energy data collection error:', error);
      
      // 실패 시 재시도 로직 (5분 후)
      setTimeout(() => {
        console.log('Retrying energy data collection...');
        this.collectEnergyData();
      }, 5 * 60 * 1000);
    }
  }

  // 실시간 업데이트 트리거
  private async triggerRealtimeUpdate() {
    try {
      // SSE 클라이언트들에게 업데이트 신호 전송
      // 실제 구현 시 Redis pub/sub 또는 다른 메시징 시스템 사용
      console.log('Triggering realtime update for connected clients');
    } catch (error) {
      console.error('Realtime update trigger error:', error);
    }
  }

  // 일일 리포트 생성
  private async generateDailyReport() {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      console.log(`Generating daily report for ${yesterday.toDateString()}`);
      
      // 일일 통계 계산 및 저장 로직
      // TODO: 구현 필요

    } catch (error) {
      console.error('Daily report generation error:', error);
    }
  }

  // 월간 리포트 생성
  private async generateMonthlyReport() {
    try {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      console.log(`Generating monthly report for ${lastMonth.getMonth() + 1}/${lastMonth.getFullYear()}`);
      
      // 월간 통계 계산 및 저장 로직
      // TODO: 구현 필요

    } catch (error) {
      console.error('Monthly report generation error:', error);
    }
  }

  // 스케줄러 상태 확인
  getStatus() {
    return {
      isRunning: this.isRunning,
      tasks: this.tasks.map((task, index) => ({
        id: index,
        status: 'scheduled'
      }))
    };
  }
}

// 싱글톤 인스턴스
export const energyScheduler = new EnergyDataScheduler();