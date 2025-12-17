# Astrology App Backend - Firebase Version

Backend API for the Vedic Astrology application using Node.js, Express, and **Firebase/Firestore**.

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Get Firebase Service Account Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Go to **Project Settings** (gear icon) → **Service Accounts**
4. Click **Generate New Private Key**
5. Download the JSON file

### 3. Configure Environment Variables

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Extract values from your downloaded service account JSON and update `.env`:
```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
```

**Important:** Make sure to keep the quotes around `FIREBASE_PRIVATE_KEY` and keep the `\n` characters.

### 4. Run the Server
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## Project Structure
```
backend/
├── config/
│   └── firebase.js         # Firebase Admin SDK initialization
├── models/
│   ├── User.js             # User model (Firestore)
│   └── AstrologyRule.js    # Rules model (Firestore)
├── routes/                 # API routes (to be created)
├── controllers/            # Business logic (to be created)
├── middleware/             # Auth, validation (to be created)
├── server.js               # Entry point
├── package.json
└── .env                    # Environment variables
```

## Firestore Collections

### Users Collection (`users`)
- **Document ID:** Firebase UID
- **Fields:** profile, birth_details, astrology_data, subscription, timestamps

### Astrology Rules Collection (`astrology_rules`)
- **Document ID:** rule_id (lowercase)
- **Fields:** category, title, content, tags, priority, is_active, etc.

## API Endpoints (Planned)

### Health Check
- `GET /api/health` - Server health status

### Users (To be implemented)
- `POST /api/users/register` - Create new user
- `GET /api/users/:firebase_uid` - Get user by Firebase UID
- `PUT /api/users/:firebase_uid` - Update user
- `DELETE /api/users/:firebase_uid` - Delete user

### Astrology Rules (To be implemented)
- `GET /api/rules` - Get all rules
- `GET /api/rules/:rule_id` - Get specific rule
- `POST /api/rules` - Create rule (admin)
- `PUT /api/rules/:rule_id` - Update rule (admin)
- `DELETE /api/rules/:rule_id` - Delete rule (admin)

## Migration from MongoDB

This backend was migrated from MongoDB/Mongoose to Firebase/Firestore:
- ✅ Removed Mongoose dependencies
- ✅ Created Firebase Admin SDK configuration
- ✅ Updated User model to use Firestore
- ✅ Updated AstrologyRule model to use Firestore
- ✅ Class-based models with static methods

## Next Steps
1. Create authentication middleware with Firebase Auth
2. Implement user CRUD routes
3. Implement rules CRUD routes
4. Add validation middleware
5. Set up API documentation (Swagger/Postman)
