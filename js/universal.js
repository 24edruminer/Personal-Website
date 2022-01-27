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

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    currentUser = user;
    localStorage.setItem("storedUser", JSON.stringify(user));
  } else {
    currentUser = null
    localStorage.setItem("storedUser", null);
  }
});

function universalSetup() {
  getStoredUser();
  if (currentUser == null){
    var navbar = document.getElementsByClassName("navbar")[0];
    navbar.children[2].textContent = "Profile"
    navbar.children[1].remove();
  }else{
    console.log(currentUser);
    var dispName = currentUser.displayName || currentUser.email.split("@")[0];
    var navbar = document.getElementsByClassName("navbar")[0];
    navbar.children[2].textContent = "Profile: " + dispName;
    if (dispName != "erumi321" && dispName != "24edruminer") {
      navbar.children[1].remove();
    }
  }
}

function getStoredUser(){
  currentUser = JSON.parse(localStorage.getItem('storedUser') || {});
} 

function logFirebaseError(error){
  var errorCode = error.code;
  var errorMessage = error.message;
  alert(errorMessage);
  console.log(errorCode + ": " + errorMessage);
}