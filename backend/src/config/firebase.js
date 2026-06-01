const admin = require('firebase-admin');
const path = require('path');

let serviceAccount;

// Try loading from environment variable path first, then fallback
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
  || path.join(__dirname, '..', '..', '..', 'hack-14ae1-firebase-adminsdk-fbsvc-53bb47d937.json');

try {
  serviceAccount = require(path.resolve(serviceAccountPath));
} catch (err) {
  console.error('Failed to load Firebase service account:', err.message);
  console.error('Looked at path:', path.resolve(serviceAccountPath));
  process.exit(1);
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'hack-14ae1',
  });
}

const db = admin.firestore();

module.exports = { admin, db };
