import admin from 'firebase-admin';

let app: admin.app.App | null = null;

function initFirebase() {
  if (app) return app;

  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (!serviceAccount) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT env var is missing');
  }

  let parsedServiceAccount;
  try {
    parsedServiceAccount = JSON.parse(serviceAccount);
  } catch {
    throw new Error('FIREBASE_SERVICE_ACCOUNT must be valid JSON');
  }

  app = admin.initializeApp({
    credential: admin.credential.cert(parsedServiceAccount),
  });

  return app;
}

export function getDb() {
  const app = initFirebase();
  return app.firestore();
}

export function getAuth() {
  const app = initFirebase();
  return app.auth();
}

export function getMessaging() {
  const app = initFirebase();
  return app.messaging();
}

export function getFieldValue() {
  return admin.firestore.FieldValue;
}
