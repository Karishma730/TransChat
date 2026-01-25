# WhatsApp-like Multilingual Chat Application

A real-time, multilingual chat web application built with React and Firebase. Features WhatsApp-like UI, per-chat AI translation, and easy conversion to Android app.

## Features

- **Real-time Messaging**: Instant message delivery using Firestore real-time listeners
- **User Authentication**: Secure email/password authentication with Firebase Auth
- **Per-Chat Translation**: Independent translation settings for each conversation
  - Toggle translation on/off per chat
  - Select different target languages for different contacts
  - Shows original message with translation
- **Media Sharing**: Send and receive images and videos
- **Dark Mode**: System-wide light/dark theme toggle
- **Mobile-First Design**: Responsive UI optimized for mobile devices
- **WebView Compatible**: Ready for conversion to Android app using PWA builders

## Technology Stack

- **Frontend**: React.js with TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Firestore, Authentication, Storage)
- **Translation**: Google Cloud Translation API
- **Icons**: Lucide React

## Setup Instructions

### 1. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new Firebase project
3. Enable the following services:
   - **Authentication**: Enable Email/Password sign-in method
   - **Firestore Database**: Create database in production mode
   - **Storage**: Enable Firebase Storage

4. Get your Firebase configuration:
   - Go to Project Settings > General
   - Scroll down to "Your apps" section
   - Click on the web icon (</>)
   - Copy the Firebase configuration object

5. Set up Firestore Security Rules:
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

6. Set up Storage Security Rules:
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

### 2. Google Cloud Translation API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select your Firebase project
3. Enable the Cloud Translation API
4. Create an API key:
   - Go to APIs & Services > Credentials
   - Click "Create Credentials" > "API Key"
   - Copy the API key
   - (Optional) Restrict the API key to only Cloud Translation API

### 3. Environment Variables

1. Create a `.env` file in the project root
2. Copy the contents from `.env.example`
3. Fill in your Firebase and Google Cloud credentials:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GOOGLE_TRANSLATE_API_KEY=your_google_cloud_translation_api_key
```

### 4. Install Dependencies and Run

```bash
npm install
npm run dev
```

The application will be available at `http://localhost:5173`

## Usage Guide

### Getting Started

1. **Register an Account**: Create a new account with email and password
2. **Start a New Chat**: Click the "+" icon to see all users and start a conversation
3. **Send Messages**: Type in any language and send messages instantly

### Translation Features

#### Enabling Translation for a Chat

1. Open a chat conversation
2. Click the translation icon (🌐) in the chat header
3. Select your preferred target language
4. Click "Enable Translation"

#### How Translation Works

- **Translation OFF**: Messages appear exactly as sent by the sender
- **Translation ON**:
  - Incoming messages are automatically translated to your selected language
  - Your sent messages remain in your original language
  - Both original and translated text are visible
  - Each chat has independent translation settings

#### Changing Target Language

1. Click the translation icon to disable translation
2. Click again to open language selection
3. Choose a new target language
4. Translation resumes with the new language

### Media Sharing

1. Click the image icon in the message input
2. Select an image or video (max 10MB)
3. The media will be uploaded and sent automatically
4. Media appears inline in the conversation

### Dark Mode

Click the moon/sun icon in the chat list header to toggle between light and dark themes.

## Supported Languages

English, Spanish, French, German, Italian, Portuguese, Russian, Japanese, Korean, Chinese (Simplified & Traditional), Arabic, Hindi, Bengali, Turkish, Vietnamese, Thai, Dutch, Polish, Swedish, and more.

## Converting to Android App

### Using PWA Builder

1. Build the production version: `npm run build`
2. Deploy to Firebase Hosting or Vercel
3. Visit [PWA Builder](https://www.pwabuilder.com/)
4. Enter your deployed URL
5. Download the Android package

### Using WebView Wrapper

Tools like [Capacitor](https://capacitorjs.com/) or [Apache Cordova](https://cordova.apache.org/) can wrap your web app:

```bash
npm install @capacitor/core @capacitor/cli
npx cap init
npx cap add android
npx cap open android
```

## Project Structure

```
src/
├── components/
│   ├── Auth/
│   │   ├── Login.tsx
│   │   └── Register.tsx
│   └── Chat/
│       ├── Chat.tsx
│       ├── ChatList.tsx
│       ├── ChatWindow.tsx
│       ├── ChatHeader.tsx
│       ├── MessageBubble.tsx
│       ├── MessageInput.tsx
│       ├── NewChatModal.tsx
│       └── TranslationSettings.tsx
├── contexts/
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
├── services/
│   ├── authService.ts
│   ├── chatService.ts
│   ├── storageService.ts
│   └── translationService.ts
├── types/
│   └── index.ts
├── config/
│   └── firebase.ts
├── App.tsx
└── main.tsx
```

## Data Model

### Firestore Collections

#### Users Collection
```typescript
{
  uid: string
  email: string
  displayName: string
  createdAt: Date
}
```

#### Chats Collection
```typescript
{
  participants: string[]
  lastMessage: string
  lastMessageTime: Date
  translationSettings: {
    [userId]: {
      enabled: boolean
      targetLanguage: string
    }
  }
}
```

#### Messages Collection
```typescript
{
  chatId: string
  senderId: string
  receiverId: string
  originalText: string
  translatedText: string
  mediaUrl: string
  mediaType: 'image' | 'video'
  timestamp: Date
}
```

## Troubleshooting

### Messages not appearing in real-time
- Check Firestore security rules
- Ensure you're authenticated
- Verify internet connection

### Translation not working
- Verify Google Cloud Translation API key is correct
- Check API is enabled in Google Cloud Console
- Ensure API key has no restrictions or is restricted to Translation API only

### Media upload failing
- Check Firebase Storage security rules
- Verify file size is under 10MB
- Ensure Storage is enabled in Firebase project

### App not working in WebView
- Check that all API calls use HTTPS
- Verify CORS settings
- Test with Chrome DevTools mobile emulation first

## Deployment

### Firebase Hosting

```bash
npm run build
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### Vercel

```bash
npm install -g vercel
vercel
```

## Future Enhancements

- Group chat support
- Voice messages
- Message reactions
- Read receipts
- Online status indicators
- Push notifications
- Message search
- File sharing (PDFs, documents)

## License

MIT License - Feel free to use this project for any purpose.

## Support

For issues or questions, please check:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Google Cloud Translation API](https://cloud.google.com/translate/docs)
- [React Documentation](https://react.dev/)
