# Vercel Environment Setup

## Required Environment Variables

Set these in your Vercel project dashboard: https://vercel.com/dashboard

### Authentication (Required)
```
NEXTAUTH_URL=https://your-vercel-app.vercel.app
NEXTAUTH_SECRET=<generate-a-new-secret-for-production>
```

### Discord OAuth (Required)
```
DISCORD_CLIENT_ID=<your-discord-client-id>
DISCORD_CLIENT_SECRET=<your-discord-client-secret>
```

### API Backend (Required)
```
NEXT_PUBLIC_API_URL=https://your-api-url.com/api/v1
API_INTERNAL_URL=https://your-api-url.com/api/v1
```

### Bot (Required)
```
BOT_API_KEY=<your-bot-api-key>
NEXT_PUBLIC_BOT_INSTALL_URL=https://discord.com/oauth2/authorize?client_id=<client-id>&permissions=8&integration_type=0&scope=bot+applications.commands
```

### Stripe (Optional - for billing)
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<your-stripe-key>
```

## Setting Environment Variables via CLI

```bash
# Example:
vercel env add NEXTAUTH_URL production --value "https://your-app.vercel.app" --yes
vercel env add NEXTAUTH_SECRET production --value "your-secret-here" --yes
vercel env add DISCORD_CLIENT_ID production --value "your-client-id" --yes
vercel env add DISCORD_CLIENT_SECRET production --value "your-client-secret" --yes
vercel env add NEXT_PUBLIC_API_URL production --value "https://your-api.com/api/v1" --yes
vercel env add API_INTERNAL_URL production --value "https://your-api.com/api/v1" --yes
vercel env add BOT_API_KEY production --value "your-api-key" --yes
```

## Generating NEXTAUTH_SECRET

Run this to generate a secure secret:
```bash
openssl rand -base64 32
```

## Deploying

After setting environment variables:
```bash
vercel --prod
```