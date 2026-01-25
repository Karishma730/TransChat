# Quick Setup Guide

## Step 1: Firebase Project Setup (5 minutes)

### Create Firebase Project
1. Visit https://console.firebase.google.com/
2. Click "Add project"
3. Enter project name and click "Continue"
4. Disable Google Analytics (optional)
5. Click "Create project"

### Enable Authentication
1. In Firebase Console, click "Authentication" in left sidebar
2. Click "Get started"
3. Click "Email/Password" under Sign-in method
4. Toggle "Enable" switch
5. Click "Save"

### Create Firestore Database
1. Click "Firestore Database" in left sidebar
2. Click "Create database"
3. Select "Start in production mode"
4. Choose a location close to your users
5. Click "Enable"

### Set Up Firestore Rules
1. In Firestore Database, click "Rules" tab
2. Replace the rules with:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    match /chats/{chatId} {
      allow read, write: if request.auth != null &&
        request.auth.uid in resource.data.participants;
    }
    match /messages/{messageId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null &&
        request.auth.uid == request.resource.data.senderId;
    }
  }
}
```
3. Click "Publish"

### Enable Storage
1. Click "Storage" in left sidebar
2. Click "Get started"
3. Click "Next" (accept default rules)
4. Choose same location as Firestore
5. Click "Done"

### Update Storage Rules
1. In Storage, click "Rules" tab
2. Replace with:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```
3. Click "Publish"

### Get Firebase Configuration
1. Click the gear icon next to "Project Overview"
2. Select "Project settings"
3. Scroll to "Your apps" section
4. Click the web icon (</>)
5. Register app with a nickname
6. Copy the `firebaseConfig` object values

## Step 2: Google Cloud Translation API (3 minutes)

### Enable Translation API
1. Visit https://console.cloud.google.com/
2. Select your Firebase project from the dropdown
3. Click "APIs & Services" > "Library"
4. Search for "Cloud Translation API"
5. Click on it and click "Enable"

### Create API Key
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the API key
4. (Recommended) Click "Restrict Key"
5. Under "API restrictions", select "Restrict key"
6. Check only "Cloud Translation API"
7. Click "Save"

## Step 3: Configure Application

### Create Environment File
1. In the project root, create a file named `.env`
2. Copy from `.env.example` and fill in your values:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:abc123
VITE_GOOGLE_TRANSLATE_API_KEY=AIzaSy...
```

## Step 4: Run the Application

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Step 5: Test the Application

### Create Test Accounts
1. Click "Sign Up"
2. Create first account (e.g., user1@test.com)
3. Sign out
4. Create second account (e.g., user2@test.com)

### Test Chat
1. Sign in as user1
2. Click "+" icon to start new chat
3. Select user2
4. Send a message

### Test Translation
1. Sign in as user2 (in another browser or incognito window)
2. Open chat with user1
3. Click the translation icon (🌐)
4. Select a different language
5. View the translated message

### Test Media Sharing
1. Click the image icon
2. Select an image or video
3. Send and verify it appears in chat

### Test Dark Mode
1. Click the moon icon in chat list header
2. Verify theme changes

## Common Issues

### "Permission denied" errors
- Check Firestore and Storage rules are published
- Ensure you're signed in
- Verify chat participants array includes your user ID

### Translation not working
- Verify Translation API is enabled
- Check API key is correct and has no quotation marks
- Ensure API key restrictions allow Translation API

### Messages not real-time
- Check internet connection
- Verify Firestore rules allow read access
- Check browser console for errors

### Build errors
- Run `npm install` again
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node.js version (should be 16+)

## Next Steps

- Deploy to Firebase Hosting or Vercel
- Set up custom domain
- Enable Firebase Analytics
- Add more users and test at scale
- Convert to Android app using PWA Builder

## Cost Estimates (Free Tier)

- **Firebase Authentication**: 50K verifications/month
- **Firestore**: 50K reads, 20K writes, 20K deletes/day
- **Storage**: 5GB storage, 1GB/day downloads
- **Translation API**: $20 free credit/month (translates ~1M characters)

Your application should run completely free for moderate usage!
