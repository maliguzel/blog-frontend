import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

interface ServiceAccountEnv {
    projectId: string;
    clientEmail: string;
    privateKey: string;
}

function readServiceAccountFromEnv(): ServiceAccountEnv {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;
    const privateKey = rawPrivateKey?.replace(/\\n/g, "\n");

    if (!projectId || !clientEmail || !privateKey) {
        throw new Error(
            "Firebase Admin ortam değişkenleri eksik. FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL ve FIREBASE_PRIVATE_KEY tanımlı olmalı.",
        );
    }

    return { projectId, clientEmail, privateKey };
}

function getFirebaseAdminApp(): App {
    const existingApps = getApps();

    if (existingApps.length > 0) {
        return existingApps[0];
    }

    const { projectId, clientEmail, privateKey } = readServiceAccountFromEnv();

    return initializeApp({
        credential: cert({
            projectId,
            clientEmail,
            privateKey,
        }),
    });
}

export function getAdminFirestore(): Firestore {
    const app = getFirebaseAdminApp();
    return getFirestore(app);
}
