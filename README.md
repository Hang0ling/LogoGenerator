# LogoGen AI

LogoGen AI is a small web app for generating logo concepts with Gemini image generation. Users enter a brand name, choose a style and color palette, preview the result, optionally remove the background, and download PNG or SVG-wrapped outputs in common icon sizes.

Original AI Studio project:
https://ai.studio/apps/c4a2eaf6-0ba2-4e4e-83d6-4aab1c25bb11

## What It Does

- Generates logo images from a brand name, style, and color scheme.
- Uses Gemini image generation through `@google/genai`.
- Provides style presets such as modern minimal, playful, luxury, tech, hand-drawn, and corporate.
- Provides color scheme presets.
- Previews the generated image in the browser.
- Offers a simple background removal toggle based on canvas pixel processing.
- Downloads PNG outputs in multiple sizes.
- Exports an SVG wrapper for compatibility with workflows that expect `.svg` files.

## Tech Stack

- React 19
- TypeScript
- Vite
- `@google/genai`
- Canvas image processing

## Project Structure

- `App.tsx` - Form, generation flow, preview, background removal, and downloads.
- `services/geminiService.ts` - Gemini image generation request.
- `utils/imageProcessor.ts` - Resizing, background removal, SVG wrapping, and file downloads.
- `components/Button.tsx` - Shared button component.
- `types.ts` - Request, output, and status types.
- `migrated_prompt_history/` - Historical AI Studio prompt export.

## Requirements

- Node.js 18 or newer
- A Gemini API key

Create `.env.local` in the project root:

```bash
GEMINI_API_KEY=your_gemini_api_key
```

## Run Locally

```bash
npm install
npm run dev
```

Then open the local URL printed by Vite.

## Build

```bash
npm run build
npm run preview
```

## Notes

- Generated SVG files are SVG wrappers around raster PNG data, not true vectorized logos.
- Background removal is a lightweight client-side tool and works best with simple, flat backgrounds.
- Gemini image generation depends on API access, model availability, and quota.
