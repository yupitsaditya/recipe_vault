# Recipe Vault

A completely private, AI-powered digital recipe vault for storing and managing your favorite recipes. 

## Features
- **Strict Privacy**: Single-user architecture ensuring your recipes are strictly isolated and private.
- **Cross-Device Syncing**: Use Google Sign-In to access and sync your recipes securely across all your mobile and desktop devices.
- **Bring Your Own Key (BYOK) AI**: Provide your own Gemini API Key to automatically generate food photography, extract recipes from messy notes, and modify ingredients instantly.
- **Offline Support**: Automatically caches your recipes so you can cook even when your kitchen loses Wi-Fi.

## Architecture & Security
- **Frontend**: React + Vite
- **Database**: Firebase Firestore
- **Security**: Firestore Rules enforce that each user can only read and write their own documents based on their unique `uid`. There is no shared family access or public leakage of recipe data.

## Getting Started
1. Run `npm install`
2. Run `npm run dev` to start the local development server.
3. Open `http://localhost:5173`
4. Click the gear icon to provide your Gemini API key (stored securely in your local browser storage) or to sign in with Google for cross-device syncing.
