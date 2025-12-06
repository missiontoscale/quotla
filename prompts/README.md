# AI Prompts

This folder contains all AI prompts used throughout the Quotla application. Centralizing prompts here makes them easier to manage, update, and maintain.

## Structure

- `chat.ts` - General chat/conversation prompts
- `quote.ts` - Quote generation prompts
- `invoice.ts` - Invoice generation prompts
- `index.ts` - Exports all prompts

## Usage

Import prompts from this folder:

```typescript
import { CHAT_SYSTEM_PROMPT, QUOTE_GENERATION_PROMPT } from '@/prompts'
```

## Guidelines

1. Keep prompts descriptive and well-documented
2. Use clear variable names that indicate the prompt's purpose
3. Include comments explaining the prompt's role
4. Test prompts thoroughly before committing changes
