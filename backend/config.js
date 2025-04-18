import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get } from "firebase/database"; 

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

// Initialize Realtime Database and export
const db = getDatabase(app);
export { db, ref, set, get };