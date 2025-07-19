# Vercel Deployment Instructions

## 1. Deploy to Vercel

Run this command to deploy:
```bash
vercel --prod
```

## 2. Environment Variables to Configure in Vercel

After deployment, go to your Vercel dashboard > Settings > Environment Variables and add these:

### Required Database Configuration
```
DATABASE_URL=postgresql://postgres.pyyvlpobbbiegikppqlz:Yadu@1998@aws-0-eu-north-1.pooler.supabase.com:6543/postgres
```

### Supabase Configuration
```
SUPABASE_URL=https://pyyvlpobbbiegikppqlz.supabase.co
SUPABASE_ANON_KEY=[REDACTED:jwt-token]
SUPABASE_SERVICE_ROLE_KEY=[REDACTED:jwt-token]
SUPABASE_JWT_SECRET=WdI2HheE2Sd8QvGc146zehrDF/zAizy9RytFER6YNH2+fo57J4arqyop0nLzzAnW1YDSgB7T/ULIS9qrjsRGZQ==
```

### Authentication (Required)
```
NEXTAUTH_URL=https://your-vercel-domain.vercel.app
NEXTAUTH_SECRET=your-generated-secret-key
```

### Google OAuth (Required for admin access)
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### App Configuration
```
NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app
NEXT_PUBLIC_ADMIN_EMAIL=your-admin-email@domain.com
```

## 3. Generate NextAuth Secret

Run this to generate a secure NextAuth secret:
```bash
openssl rand -base64 32
```

## 4. Set up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add your Vercel domain to authorized origins
6. Add `https://your-domain.vercel.app/api/auth/callback/google` to authorized redirect URIs

## 5. After Deployment

1. Visit your deployed site
2. Go to `/admin/setup` to complete configuration
3. Use the progressive setup wizard to configure optional services

## 6. Database Migration

The app will automatically run Prisma migrations on first deployment through the postinstall script.
