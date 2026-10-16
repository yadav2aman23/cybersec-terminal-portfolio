import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyC8PTDDHmtYT2xrSdmv8Kh7ZPiZBBziq9U",
    authDomain: "aman-cybersec-portfolio.firebaseapp.com",
    projectId: "aman-cybersec-portfolio",
    storageBucket: "aman-cybersec-portfolio.firebasestorage.app",
    messagingSenderId: "759218598091",
    appId: "1:759218598091:web:24c52b7e8cb106bd97d3ee",
    measurementId: "G-FSQQNWKF67",
};

const app = initializeApp(firebaseConfig);


export const auth = getAuth(app);

export const db = getFirestore(app);
export const storage = getStorage(app);
