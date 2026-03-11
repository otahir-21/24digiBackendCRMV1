# 24digiBackendCRMV1

React CRM with Firebase Firestore. View products, manage data, and update product images.

## Setup

### 1. Install & Run

```bash
npm install
npm run dev
```

### 2. Firebase Configuration

1. Add your Firebase config to `.env` (see `.env.example`)
2. Enable **Authentication** → **Email/Password** in Firebase Console
3. Create user: **admin@24digi.com** / **admin123**

### 3. Firestore Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Features

- **Login** – Firebase Auth
- **Products** – Product Catalog from Firestore (24diet_products)
- **Edit Image** – Update product image URLs from the CRM
- **MongoDB Migration** – Script to copy data from MongoDB to Firebase

## MongoDB → Firebase Migration

```bash
# Add MONGODB_URI to .env, then:
npm run migrate:mongo
```

## Default Login

- **Email:** admin@24digi.com
- **Password:** admin123
