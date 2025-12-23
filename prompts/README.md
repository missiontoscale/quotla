# AI Prompts

This folder contains all AI prompts used throughout the Quotla application.

## 🎯 Quick Start

**All prompts are now plain text files for easy editing!**

- **Edit prompts:** Go to [`txt/`](./txt/) folder
- **How to edit:** See [QUICK_EDIT_GUIDE.md](./QUICK_EDIT_GUIDE.md)
- **Technical details:** See [MIGRATION_SUMMARY.md](./MIGRATION_SUMMARY.md)

## 📁 Structure

```
prompts/
├── txt/                          # Plain text prompt files (EDIT THESE!)
│   ├── chat-system.txt
│   ├── chat-business-advisor.txt
│   ├── chat-pricing-expert.txt
│   ├── quote-generation-system.txt
│   ├── quote-generation-user.txt
│   ├── invoice-generation-system.txt
│   ├── invoice-generation-user.txt
│   ├── vision-extraction.txt
│   └── README.md                 # Detailed editing instructions
├── QUICK_EDIT_GUIDE.md          # Quick reference for common edits
└── MIGRATION_SUMMARY.md         # Technical migration details
```

## 🎨 For Non-Technical Users

1. Open any `.txt` file in `txt/` folder
2. Edit the text (no coding knowledge needed!)
3. Save the file
4. Changes apply immediately

See [txt/README.md](./txt/README.md) for detailed instructions.

## 💻 For Developers

Prompts are loaded at runtime from text files:

```typescript
import { CHAT_SYSTEM_PROMPT } from '@/lib/utils/prompts'
```

The utility module (`lib/utils/prompts.ts`) handles:
- Loading text files
- Template variable replacement (`{{variable}}`)
- Same API as previous TypeScript system

## 📚 Documentation

- **[txt/README.md](./txt/README.md)** - Comprehensive editing guide
- **[QUICK_EDIT_GUIDE.md](./QUICK_EDIT_GUIDE.md)** - Quick reference and examples
- **[MIGRATION_SUMMARY.md](./MIGRATION_SUMMARY.md)** - Technical details and changes

## ✅ Benefits

- ✅ No coding knowledge required to edit
- ✅ Clear formatting and readability
- ✅ Accessible to entire team
- ✅ Version control friendly
- ✅ Easy to test and iterate
