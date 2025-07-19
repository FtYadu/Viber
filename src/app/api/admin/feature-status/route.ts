import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { getFeatureStatus } from '@/lib/feature-gates';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all configured settings for this user
    const settings = await db.appSetting.findMany({
      where: {
        userId: session.user.id
      },
      select: {
        settingKey: true,
        settingValue: true
      }
    });

    // Convert to the format expected by feature gates
    const settingsArray = settings.map(s => ({
      key: s.settingKey,
      value: s.settingValue
    }));

    // Get feature status
    const featureStatus = getFeatureStatus(settingsArray);

    return NextResponse.json(featureStatus);
  } catch (error) {
    console.error('Error fetching feature status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feature status' },
      { status: 500 }
    );
  }
}
