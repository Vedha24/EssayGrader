
// client/src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyACr8EGTTVl2mmU1QITcQc9ej80uZI5M0Q",
    authDomain: "essay-grader-a32a7.firebaseapp.com",
    projectId: "essay-grader-a32a7",
    storageBucket: "essay-grader-a32a7.firebasestorage.app",
    messagingSenderId: "761573521157",
    appId: "1:761573521157:web:c44eff5806569db671e96c",
    measurementId: "G-HLLD0QBX0V"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
