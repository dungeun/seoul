import { NextResponse } from 'next/server';
import { energyScheduler } from '@/lib/energy-scheduler';

// 스케줄러 제어 API
export async function GET() {
  const status = energyScheduler.getStatus();
  
  return NextResponse.json({
    scheduler: status,
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: Request) {
  try {
    const { action } = await request.json();

    switch (action) {
      case 'start':
        energyScheduler.start();
        return NextResponse.json({ 
          success: true, 
          message: 'Scheduler started' 
        });

      case 'stop':
        energyScheduler.stop();
        return NextResponse.json({ 
          success: true, 
          message: 'Scheduler stopped' 
        });

      case 'status':
        return NextResponse.json({ 
          success: true, 
          status: energyScheduler.getStatus() 
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to control scheduler' },
      { status: 500 }
    );
  }
}