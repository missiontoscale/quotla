# AI Provider Guide for Quotla

Quotla now supports multiple AI providers for content generation. Choose the one that works best for you!

## Supported Providers

1. **OpenAI (GPT-4)** - Recommended
2. **Google Gemini** - Good alternative
3. **Anthropic Claude** - Original provider
4. **None** - Disable AI features

## Quick Setup

### Option 1: OpenAI (Recommended)

**Cost**: ~$0.03 per 1,000 tokens (very affordable)

**Get API Key**:
1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up or log in
3. Click your profile → "View API keys"
4. Create new secret key
5. Copy the key (starts with `sk-`)

**Configure**:
```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
```

**Free Credits**: New accounts get $5 free credit

### Option 2: Google Gemini

**Cost**: FREE tier available (60 requests/minute)

**Get API Key**:
1. Go to [ai.google.dev](https://ai.google.dev)
2. Click "Get API key in Google AI Studio"
3. Sign in with Google account
4. Create new API key
5. Copy the key

**Configure**:
```env
AI_PROVIDER=gemini
GOOGLE_AI_API_KEY=AIzaSyxxxxxxxxxxxxx
```

**Free Tier**: 60 requests per minute, perfect for small businesses

### Option 3: Anthropic Claude

**Cost**: Pay as you go (requires credits)

**Get API Key**:
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up and add credits
3. Go to API Keys section
4. Create new key
5. Copy the key

**Configure**:
```env
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
```

### Option 4: Disable AI

If you don't want to use AI at all:

```env
AI_PROVIDER=none
```

The "Generate with AI" button will still appear but show an error message.

## Comparison

| Provider | Cost | Speed | Quality | Free Tier |
|----------|------|-------|---------|-----------|
| **OpenAI** | Low | Fast | Excellent | $5 credit |
| **Gemini** | FREE | Fast | Very Good | 60/min |
| **Claude** | Medium | Medium | Excellent | No |

## Recommendation

**For most users**: Use **Google Gemini** (it's free!)

**For best quality**: Use **OpenAI GPT-4**

**If you need the absolute best**: Use **Anthropic Claude** (when you have credits)

## Setup Instructions

### Step 1: Choose Your Provider

Pick one from the options above based on your needs.

### Step 2: Get API Key

Follow the provider-specific instructions above.

### Step 3: Update Environment

1. Open your `.env` file (create from `.env.example` if needed)
2. Set `AI_PROVIDER` to your choice
3. Add the corresponding API key
4. Save the file

Example for OpenAI:
```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-proj-abc123xyz...
```

### Step 4: Install Dependencies

```bash
npm install
```

This will install:
- `openai` - OpenAI SDK
- `@google/generative-ai` - Google Gemini SDK
- `@anthropic-ai/sdk` - Anthropic SDK (already installed)

### Step 5: Restart Server

```bash
npm run dev
```

### Step 6: Test It

1. Go to `/quotes/new` or `/invoices/new`
2. Add a line item
3. Click "Generate with AI"
4. Enter a service description
5. It should work!

## Auto-Fallback Mode

If you don't set `AI_PROVIDER`, Quotla will automatically try providers in this order:

1. Anthropic Claude
2. OpenAI GPT-4
3. Google Gemini

This is useful if you have multiple API keys and want automatic failover.

To enable auto-fallback, either:
- Remove the `AI_PROVIDER` line from `.env`
- Set it to an empty value: `AI_PROVIDER=`

## Cost Estimates

### Light Usage (10-50 generations/day)

- **Gemini**: FREE ✨
- **OpenAI**: ~$0.50/month
- **Claude**: ~$1-2/month

### Medium Usage (100-200 generations/day)

- **Gemini**: FREE ✨ (within limits)
- **OpenAI**: ~$2-5/month
- **Claude**: ~$5-10/month

### Heavy Usage (500+ generations/day)

- **Gemini**: May hit rate limits
- **OpenAI**: ~$10-20/month
- **Claude**: ~$20-50/month

## Troubleshooting

### "Failed to generate description"

**Check**:
1. Is the API key correct?
2. Do you have credits/quota?
3. Is the provider name spelled correctly?
4. Did you restart the dev server?

### "Credit balance too low" (Anthropic)

You need to add credits to your Anthropic account. Either:
- Add more credits at [console.anthropic.com](https://console.anthropic.com)
- Switch to OpenAI or Gemini

### "Rate limit exceeded" (Gemini)

Free tier limits:
- 60 requests per minute
- Wait a minute and try again
- Or upgrade to paid tier
- Or switch to OpenAI

### "Invalid API key"

Double-check:
1. Key is copied correctly (no spaces)
2. Key hasn't been revoked
3. Account is active
4. Using the right key for the right provider

### Still not working?

Check the server console for detailed error messages. Look for lines starting with:
```
AI generation error:
```

## Best Practices

### Security

- **Never** commit `.env` file to git
- **Never** share API keys publicly
- Rotate keys if compromised
- Use different keys for dev and production

### Cost Optimization

1. **Use Gemini for development** (it's free)
2. **Use OpenAI for production** (better quality, still cheap)
3. Monitor your usage regularly
4. Set billing alerts

### Quality

For best descriptions:
- Be specific in your prompts
- Include key details
- Let users edit AI output
- Test different providers to see which works best for your use case

## Provider-Specific Tips

### OpenAI

- **Model**: Uses GPT-4 Turbo (latest)
- **Best for**: Consistent, high-quality output
- **Tip**: Set up billing alerts in OpenAI dashboard

### Google Gemini

- **Model**: Uses Gemini Pro
- **Best for**: Free development and testing
- **Tip**: Keep requests under 60/minute to stay in free tier

### Anthropic Claude

- **Model**: Uses Claude 3.5 Sonnet
- **Best for**: Most sophisticated responses
- **Tip**: Pre-purchase credits to get better rates

## Switching Providers

You can change providers anytime:

1. Update `AI_PROVIDER` in `.env`
2. Add the new provider's API key
3. Restart your dev server
4. Test the new provider

No code changes needed!

## Production Deployment

When deploying to production (Vercel, etc.):

1. Add environment variables in platform dashboard
2. Use the same variable names
3. Keep API keys secure
4. Set up billing alerts
5. Monitor usage

## Support

If you have issues:

1. Check this guide
2. Verify API key is active
3. Check provider's status page
4. Look at server console logs
5. Try a different provider

## Summary

**Quickest setup**: Google Gemini (free, no credit card)
**Best value**: OpenAI (cheap and excellent)
**Best quality**: Anthropic Claude (when you have credits)

Pick the one that fits your budget and needs. You can always switch later!
