# Complete Deployment Guide to Vercel with Supabase

## Step 1: Vercel Account Setup

1. **Login to Vercel**
   ```bash
   vercel login
   ```
   Choose your preferred login method (GitHub, Google, etc.)

2. **Link Project to Vercel**
   ```bash
   vercel
   ```
   Follow the prompts to create a new project

## Step 2: Deploy the Application

```bash
vercel --prod
```

## Step 3: Configure Environment Variables in Vercel Dashboard

After deployment, go to your Vercel project dashboard and add these environment variables:

### Core Database & Auth (Required)
| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `postgresql://postgres.pyyvlpobbbiegikppqlz:Yadu@1998@aws-0-eu-north-1.pooler.supabase.com:6543/postgres` |
| `NEXTAUTH_URL` | `https://your-vercel-domain.vercel.app` |
| `NEXTAUTH_SECRET` | Generate with: `openssl rand -base64 32` |

### Supabase Configuration
| Variable | Value |
|----------|-------|
| `SUPABASE_URL` | `https://pyyvlpobbbiegikppqlz.supabase.co` |
| `SUPABASE_ANON_KEY` | `[Your Anon Public Key]` |
| `SUPABASE_SERVICE_ROLE_KEY` | `[Your Service Role Secret]` |
| `SUPABASE_JWT_SECRET` | `WdI2HheE2Sd8QvGc146zehrDF/zAizy9RytFER6YNH2+fo57J4arqyop0nLzzAnW1YDSgB7T/ULIS9qrjsRGZQ==` |

### Google OAuth (Required for admin access)
| Variable | Value |
|----------|-------|
| `GOOGLE_CLIENT_ID` | Your Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Your Google OAuth Client Secret |

### App Configuration
| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_APP_URL` | `https://your-vercel-domain.vercel.app` |
| `NEXT_PUBLIC_ADMIN_EMAIL` | Your admin email address |

## Step 4: Set up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the **Google+ API** and **Google OAuth2 API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client IDs**
5. Configure OAuth consent screen
6. Create OAuth client with these settings:
   - **Application type**: Web application
   - **Authorized JavaScript origins**: `https://your-vercel-domain.vercel.app`
   - **Authorized redirect URIs**: `https://your-vercel-domain.vercel.app/api/auth/callback/google`

## Step 5: Database Migration

The database will be automatically migrated on deployment via the `postinstall` script in package.json.

## Step 6: First Access

1. Visit your deployed application
2. Go to `/admin/setup` to complete the setup process
3. Sign in with your Google account (must match NEXT_PUBLIC_ADMIN_EMAIL)
4. Use the progressive setup wizard to configure optional services

## Step 7: Optional Services Configuration

After basic deployment, you can configure additional services through the admin panel:

- **Cloudinary** (image uploads)
- **Stripe** (payments)
- **Resend** (emails)
- **Upstash Redis** (caching)
- **Sentry** (error tracking)
- **N8N** (workflow automation)
- **Cloudflare** (DNS management)

## Troubleshooting

### Build Issues
- All Next.js 14 compatibility issues have been resolved
- Dynamic pages are properly configured
- Suspense boundaries are in place for client components

### Database Issues
- Ensure the Supabase database URL is correct
- Check that the connection string includes the correct credentials
- Verify that Prisma migrations run successfully

### Authentication Issues
- Verify Google OAuth credentials are correct
- Check that redirect URIs match exactly
- Ensure NEXTAUTH_SECRET is properly generated and set

## Success Indicators

- ✅ Build completes without errors
- ✅ Database connection established
- ✅ Admin login works with Google OAuth
- ✅ Setup wizard accessible at `/admin/setup`
- ✅ Progressive configuration system functional

## Next Steps After Deployment

1. Complete the setup wizard
2. Configure your preferred optional services
3. Add your first client/project data
4. Test the full application workflow

Your application includes a progressive setup system that allows you to start with minimal configuration and add services as needed through the admin interface.
