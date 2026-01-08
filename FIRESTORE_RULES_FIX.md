# Fix Firestore Permissions Error

## Problem
You're getting: `FirebaseError: Missing or insufficient permissions`

This means your Firestore security rules are blocking read access to the charts collection.

## Solution

### Step 1: Open Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click **Firestore Database** in the left sidebar
4. Click the **Rules** tab at the top

### Step 2: Update Security Rules
Replace your current rules with these:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Charts collection - users can read/write their own charts
    match /charts/{chartId} {
      allow read: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Users collection - users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Nested: Chat messages for each chart
      match /charts/{chartId}/messages/{messageId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // Feedback collection - authenticated users can create feedback
    match /feedback/{feedbackId} {
      allow create: if request.auth != null;
      allow read, update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Chat messages (top-level) - users can read/write their own messages
    match /chatMessages/{messageId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Default deny all other collections
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Step 3: Publish Rules
1. Click **Publish** button
2. Wait for confirmation message

### Step 4: Test
1. Refresh your dashboard page
2. Charts should now load correctly

## What These Rules Do

- **Charts**: Users can only see and modify charts they created (where `userId` matches their auth UID)
- **Users**: Users can only access their own user document
- **Feedback**: Users can create feedback and manage their own feedback
- **Chat Messages**: Users can only see their own chat history
- **Default**: All other collections are denied by default for security

## Troubleshooting

If charts still don't load:
1. Check browser console for the exact error
2. Verify you're logged in (check `user.uid` in console)
3. Check that saved charts have a `userId` field matching your auth UID
4. Try logging out and back in
