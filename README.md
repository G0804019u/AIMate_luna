# Luna - AI Chat Template

A beautiful, production-ready AI chat template built with Expo and React Native.

## Features

- **AI Integration Ready** - OpenAI (ChatGPT), Google Gemini, and Anthropic Claude support
- **Speech-to-Text** - Voice input with OpenAI Whisper transcription
- **Dark/Light Mode** - Seamless theme switching
- **Markdown Support** - Rich text rendering for AI responses
- **Built with Expo** - Easy development and deployment
- **NativeWind** - Tailwind CSS styling for React Native
- **TypeScript** - Full type safety

## Getting Started

```bash
# Use Node.js v20
nvm use 20

# Install dependencies
npm install

# Start the Expo development server
npx expo start -c
```

> **Note:** the repository ships an `.npmrc` with `legacy-peer-deps=true`, so plain `npm install` (and `npm ci` in CI) work out of the box — no extra flags needed.

## Setting Up AI

Luna supports three AI providers. You only need ONE to get started.

### 1. Create your `.env` file

Copy the example environment file:

```bash
cp .env.example .env
```

### 2. Add your API key

Edit `.env` and add your preferred provider's API key:

```env
# Choose your provider: openai | gemini | claude
EXPO_PUBLIC_AI_PROVIDER=openai

# Add your API key (only need one)
EXPO_PUBLIC_OPENAI_API_KEY=sk-...
EXPO_PUBLIC_GEMINI_API_KEY=your-gemini-key
EXPO_PUBLIC_CLAUDE_API_KEY=your-claude-key
```

### 3. Get an API key

| Provider | Get API Key | Model Used |
|----------|-------------|------------|
| OpenAI | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) | GPT-4o-mini |
| Google Gemini | [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey) | Gemini 2.0 Flash |
| Anthropic Claude | [console.anthropic.com](https://console.anthropic.com/) | Claude 3 Haiku |

### 4. Restart your dev server

```bash
npx expo start -c
```

## Speech-to-Text

Voice input uses OpenAI's Whisper API for transcription. To enable:

1. Add your OpenAI API key to `.env`
2. Tap the microphone button to record
3. Tap "Done" when finished speaking
4. Your speech will be transcribed to text

> Note: Speech-to-text requires an OpenAI API key regardless of which AI provider you choose for chat.


## Customization

### Changing the AI Model

Edit the provider files in `services/providers/` to use different models:

```typescript
// services/providers/openai.ts
model: 'gpt-4o-mini'  // Change to 'gpt-4o', 'gpt-3.5-turbo', etc.
```

### Adding System Prompts

Modify `app/(drawer)/index.tsx` to add a system prompt:

```typescript
const aiMessages: AIMessage[] = [
    { role: 'system', content: 'You are a helpful assistant...' },
    ...messages.map(m => ({ role: m.type, content: m.content })),
    { role: 'user', content: text },
];
```

## Support

For questions or issues, please contact support.

## Before you ship

- **EAS project identifiers:** `app.json` intentionally ships without an `owner`, EAS `projectId`, or updates URL. Run `eas init` while logged into your own Expo account to generate them before building or publishing with EAS.
- **Mock data:** all app data is local demo content, and some screens use remote placeholder images. Replace these with your own data sources and assets.
- **Auth & backend:** login/signup, checkout and similar flows are UI-only — connect them to your own backend services.

## Dependency audit status

Last reviewed 2026-10-02: everything `npm audit fix` can resolve is resolved. `npm audit` still reports 8 transitive findings (5 high, 3 moderate) from two packages that cannot be fixed until an upstream release:

- **node-forge** (high; via `@expo/code-signing-certificates`, pulled in by `@expo/cli` and `expo-updates`) — RSA PKCS#1 v1.5 signature verification issue. No fixed node-forge release exists yet, and it comes in through Expo's command-line tooling.
- **decode-uri-component** (moderate; via `query-string`, pinned by `expo-router`) — DoS on malformed percent-encoded input. The fixed release (0.5.0) is ESM-only and incompatible with query-string's current CJS usage.

These will clear with future Expo SDK updates. Do not run `npm audit fix --force` — it replaces `expo-router` and `expo-updates` with incompatible major versions.

## Useful commands

```bash
npx tsc --noEmit   # Type check
npm run lint       # ESLint + Prettier check
npm run format     # Auto-fix lint + formatting
```

## License

Licensed for use in your own projects — see [LICENSE.md](LICENSE.md) for the full terms.
