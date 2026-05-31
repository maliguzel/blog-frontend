// src/lib/firebase-admin.ts
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function getAdminApp() {
    if (getApps().length > 0) return getApps()[0];
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        throw new Error(
            "FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.",
        );
    }
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    return initializeApp({
        credential: cert(serviceAccount),
    });
}

export const adminDb = getFirestore(getAdminApp());
