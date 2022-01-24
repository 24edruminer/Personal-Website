// Import the functions you need from the SDKs you need

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyABAhJ0Q5D_2h3rZdnDe9jMzmAK_7cj3eU",
    authDomain: "blogwebsite-school.firebaseapp.com",
    projectId: "blogwebsite-school",
    storageBucket: "blogwebsite-school.appspot.com",
    messagingSenderId: "495776753740",
    appId: "1:495776753740:web:37b4d03ce0c29a8a1d6ce9"
  };
  firebase.initializeApp(firebaseConfig);
  // Initialize Firebase
  const db = firebase.firestore();

currentUser = null;

function universalSetup() {
  getStoredUser();    
}

function getStoredUser(){
  currentUser = localStorage.getItem("userCredential");
} 

