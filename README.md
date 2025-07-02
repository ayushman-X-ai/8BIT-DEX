# 8BitDex

This is a NextJS starter in Firebase Studio for creating a pixel-art Pokédex.

## Getting Started

To get started, take a look at `src/app/page.tsx`.

## Environment Variables

This project uses AI features that require Gemini API keys. For security, it's configured to use two separate keys.

1.  **Local Development:** Open the `.env` file and add your two Gemini API keys.
    
    - `GOOGLE_API_KEY`: Your primary key for server-side AI features (like generating explanations).
    - `SCANNER_API_KEY`: A dedicated key specifically for the Pokémon scanner.

    Your `.env` file should look like this (replace the placeholders with your actual keys):
    ```
    GOOGLE_API_KEY=YOUR_MAIN_API_KEY
    SCANNER_API_KEY=YOUR_SCANNER_API_KEY
    ```

    **Important**: If you are using a public Git repository, ensure your `.env` file is listed in `.gitignore` to keep your keys secure.

2.  **Production (Vercel):** When you deploy to Vercel, you will need to add both `GOOGLE_API_KEY` and `SCANNER_API_KEY` as environment variables in your Vercel project settings.

You can get free Gemini API keys from [Google AI Studio](https://aistudio.google.com/app/apikey).

## Deployment

### Deploying to Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Follow these steps:

1.  **Push your code to a Git repository:** Create a new repository on a platform like GitHub, GitLab, or Bitbucket and push your local code to it.
2.  **Import your project into Vercel:** Go to your Vercel dashboard, click "Add New... > Project", and import the Git repository you just created.
3.  **Configure Environment Variables:** During the import process, or in the project settings afterward, add your `GOOGLE_API_KEY` and `SCANNER_API_KEY` as environment variables.
4.  **Deploy:** Vercel will automatically detect that you are using Next.js and configure the build settings. Click "Deploy".

Your app will be live in a few moments!
