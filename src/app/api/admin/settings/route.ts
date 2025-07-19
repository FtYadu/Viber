import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth/config';
import { db } from '@/lib/db';
import { encrypt, decrypt } from '@/lib/encryption';

// Define which settings should be encrypted
const ENCRYPTED_SETTINGS = [
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'RESEND_API_KEY',
  'CLOUDINARY_API_SECRET',
  'OPENAI_API_KEY',
  'CLOUDFLARE_API_TOKEN',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_DRIVE_CLIENT_SECRET',
  'LANGFLOW_API_KEY',
  'N8N_API_KEY',
  'UPSTASH_REDIS_REST_TOKEN'
];

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { stepId, settings } = await req.json();

    // Save each setting to the database
    const settingPromises = Object.entries(settings).map(async ([key, value]) => {
      const shouldEncrypt = ENCRYPTED_SETTINGS.includes(key);
      const settingValue = shouldEncrypt ? encrypt(value as string) : value;

      return db.appSetting.upsert({
        where: {
          userId_settingKey: {
            userId: session.user.id,
            settingKey: key
          }
        },
        update: {
          settingValue: settingValue as string,
          isEncrypted: shouldEncrypt,
          updatedAt: new Date()
        },
        create: {
          userId: session.user.id,
          settingKey: key,
          settingValue: settingValue as string,
          isEncrypted: shouldEncrypt,
          featureCategory: stepId,
          isRequired: false
        }
      });
    });

    await Promise.all(settingPromises);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const settings = await db.appSetting.findMany({
      where: {
        userId: session.user.id
      }
    });

    // Decrypt encrypted settings and return (but mask sensitive values)
    const decryptedSettings = settings.reduce((acc, setting) => {
      let value = setting.settingValue;
      
      if (setting.isEncrypted && value) {
        try {
          value = decrypt(value);
          // Mask sensitive values for display
          if (ENCRYPTED_SETTINGS.includes(setting.settingKey)) {
            value = value.slice(0, 4) + '****' + value.slice(-4);
          }
        } catch (error) {
          console.error(`Failed to decrypt setting ${setting.settingKey}:`, error);
          value = '****';
        }
      }

      acc[setting.settingKey] = {
        value,
        isEncrypted: setting.isEncrypted,
        featureCategory: setting.featureCategory,
        isRequired: setting.isRequired,
        updatedAt: setting.updatedAt
      };

      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({ settings: decryptedSettings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}
