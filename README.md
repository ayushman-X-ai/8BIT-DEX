# 8BitDex

This is a NextJS starter in Firebase Studio for creating a pixel-art Pokédex.

## Getting Started

To get started, take a look at `src/app/page.tsx`.

## Environment Variables

This project uses AI features that require API keys. For security, it's configured to use environment variables.

- `GOOGLE_API_KEY`: Your primary key for server-side AI features, including the scanner on non-mobile devices.
- `NEXT_PUBLIC_VISION_API_KEY`: A public key for the Google Cloud Vision API, used for the on-device scanner on mobile devices. **Note:** This key is exposed on the client-side and should have appropriate restrictions (e.g., HTTP referrers) in your Google Cloud project.

**Important**: The keys in the `.env` file are for local development. For security, this file should be listed in your `.gitignore` to prevent it from being committed to a public repository.

You can get free Gemini API keys from [Google AI Studio](https://aistudio.google.com/app/apikey) and Vision API keys from the [Google Cloud Console](https://console.cloud.google.com/apis/credentials).

## Deployment

### Deploying to Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Follow these steps:

1.  **Push your code to a Git repository:** Create a new repository on a platform like GitHub, GitLab, or Bitbucket and push your local code to it.
2.  **Import your project into Vercel:** Go to your Vercel dashboard, click "Add New... > Project", and import the Git repository you just created.
3.  **Configure Environment Variables:** During the import process, or in the project settings afterward, add your `GOOGLE_API_KEY` and `NEXT_PUBLIC_VISION_API_KEY` as environment variables.
4.  **Deploy:** Vercel will automatically detect that you are using Next.js and configure the build settings. Click "Deploy".

Your app will be live in a few moments!
