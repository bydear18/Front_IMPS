// Import the necessary Firebase modules
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBTFoXlCEQgrvlFpwyzC4NmjPrKArmXN7c",
    authDomain: "imps-2199c.firebaseapp.com",
    projectId: "imps-2199c",
    storageBucket: "imps-2199c.appspot.com",
    messagingSenderId: "851764140471",
    appId: "1:851764140471:web:a774cf0ead8857eb9a3032"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Get a reference to the storage service
const storage = getStorage(app);

export default storage;
