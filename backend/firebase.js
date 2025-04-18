// Import core and required Firebase modules
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC-vKU_FfHCEFwb4-fyg2w9BN7IzzcyyGs",
  authDomain: "helpchain-fc9b2.firebaseapp.com",
  databaseURL: "https://helpchain-fc9b2-default-rtdb.firebaseio.com",
  projectId: "helpchain-fc9b2",
  storageBucket: "helpchain-fc9b2.appspot.com",
  messagingSenderId: "564899371743",
  appId: "1:564899371743:web:8a0b65b9de26060d78676a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Database and Storage
const database = getDatabase(app);
const storage = getStorage(app);

export { app, database, storage };