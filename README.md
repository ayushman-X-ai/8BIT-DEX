# 8BitDex

This is a NextJS starter in Firebase Studio for creating a pixel-art Pokédex.

## Getting Started

To get started, take a look at `src/app/page.tsx`.

## Environment Variables

This project uses AI features that require a Gemini API key. For security, it's configured to use an environment variable.

- `GOOGLE_API_KEY`: Your primary key for server-side AI features and for the scanner on non-mobile devices.

**Important**: The key in the `.env` file is for local development. For security, this file should be listed in your `.gitignore` to prevent it from being committed to a public repository.

You can get a free Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

## On-Device Mobile Scanner

For mobile devices, this app uses a custom, on-device model for identifying Pokémon to provide a faster, offline-capable experience without needing an API key on the client.

### Training Your Model with Teachable Machine

1.  Go to [Teachable Machine](https://teachablemachine.withgoogle.com/) and create a new **Image Project**.
2.  Create classes for each Pokémon you want to identify (e.g., "pikachu", "bulbasaur", "charmander"). **Make sure the class names are the lowercase English names of the Pokémon.**
3.  Upload training images for each class.
4.  Train your model.
5.  Once training is complete, click **Export Model**.
6.  Select the **Tensorflow.js** tab, choose the **model conversion** type you prefer, and click **Download**.
7.  This will give you three files: `model.json`, `weights.bin`, and `metadata.json`.

### Using Your Custom Model

1.  Take the three files you downloaded from Teachable Machine.
2.  Place them inside the `public/model/` directory in this project, replacing the placeholder files that are already there.
3.  That's it! The mobile scanner will automatically load and use your custom model.

## Deployment

### Deploying to Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Follow these steps:

1.  **Push your code to a Git repository:** Create a new repository on a platform like GitHub, GitLab, or Bitbucket and push your local code to it.
2.  **Import your project into Vercel:** Go to your Vercel dashboard, click "Add New... > Project", and import the Git repository you just created.
3.  **Configure Environment Variables:** During the import process, or in the project settings afterward, add your `GOOGLE_API_KEY` as an environment variable.
4.  **Deploy:** Vercel will automatically detect that you are using Next.js and configure the build settings. Click "Deploy".

Your app will be live in a few moments!
