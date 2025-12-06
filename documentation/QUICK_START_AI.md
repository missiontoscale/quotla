# Quick Start: Switch to OpenAI or Gemini

Since you're out of Anthropic credits, here's how to switch providers quickly.

## Option 1: Google Gemini (FREE) ⚡ Recommended

**Setup Time**: 2 minutes

1. **Get API Key**:
   - Go to [https://ai.google.dev](https://ai.google.dev)
   - Click "Get API key"
   - Sign in with Google
   - Click "Create API key"
   - Copy the key

2. **Update .env file**:
   ```env
   AI_PROVIDER=gemini
   GOOGLE_AI_API_KEY=AIzaSy_your_key_here
   ```

3. **Install package**:
   ```bash
   npm install @google/generative-ai
   ```

4. **Restart server**:
   ```bash
   npm run dev
   ```

5. **Test it**: Create a quote and use AI generation!

✅ **Free tier**: 60 requests/minute (plenty for most users)

---

## Option 2: OpenAI (Cheap & Excellent)

**Setup Time**: 3 minutes

1. **Get API Key**:
   - Go to [https://platform.openai.com](https://platform.openai.com)
   - Sign up/login
   - Go to API keys
   - Create new secret key
   - Copy the key

2. **Update .env file**:
   ```env
   AI_PROVIDER=openai
   OPENAI_API_KEY=sk-proj-your_key_here
   ```

3. **Install package**:
   ```bash
   npm install openai
   ```

4. **Restart server**:
   ```bash
   npm run dev
   ```

5. **Test it**: Create a quote and use AI generation!

✅ **New users get $5 free credit** (lasts months for typical usage)

---

## What I Changed

I've added support for multiple AI providers:

✅ **New Files Created**:
- `lib/ai/openai.ts` - OpenAI integration
- `lib/ai/gemini.ts` - Google Gemini integration
- `lib/ai/index.ts` - Smart provider selection

✅ **Updated Files**:
- `package.json` - Added OpenAI and Gemini packages
- `app/api/ai/generate/route.ts` - Now uses provider system
- `.env.example` - Added AI_PROVIDER configuration

✅ **How it works**:
1. Set `AI_PROVIDER` in your `.env` file
2. The system automatically uses that provider
3. If no provider is set, it tries all of them until one works

---

## Commands

```bash
# Install new dependencies
npm install

# Start development server
npm run dev
```

---

## Costs Comparison

| Provider | Free Tier | Cost per 1000 requests |
|----------|-----------|------------------------|
| **Gemini** | ✅ 60/min | FREE |
| **OpenAI** | $5 credit | ~$0.03 |
| **Claude** | ❌ No | ~$0.015 |

---

## My Recommendation

**Use Google Gemini** - it's completely free and works great!

Only if you need higher rate limits or slightly better quality, then use OpenAI.

---

## Need Help?

Check the full guide: `AI_PROVIDERS.md`
