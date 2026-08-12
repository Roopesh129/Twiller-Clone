
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// keep your credentials 
const firebaseConfig = {
  apiKey: "AIzaSyCPJeuXKQrjGgkEmNWthtSk0bCAPaJFLww",
  authDomain: "twitter-clone-73ccb.firebaseapp.com",
  projectId: "twitter-clone-73ccb",
  storageBucket: "twitter-clone-73ccb.firebasestorage.app",
  messagingSenderId: "193185421733",
  appId: "1:193185421733:web:1cf09881016c6873df304c",
  measurementId: "G-RQBT50JFF5"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
