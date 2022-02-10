//!unviersal.js is the first loaded script in every HTML file, so it will always be accessible to every other script, hece its universal title!

//Setup the Firebase auth for use through out the project
var provider = new firebase.auth.GoogleAuthProvider();

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

//Set to null everytime because it is loaded everytime, this could probably be made more efficent but i dont know how to do that
currentUser = null;
curName = null;

function universalSetup(callback, onNotLoggedIn, onColorGot) {
  //load the user
  getStoredUser(callback, onNotLoggedIn, onColorGot);

  //If your signed out remove things you dont want to see and create a listener to check for sign-in
  if (currentUser == null){
    var navbar = document.getElementsByClassName("navbar")[0];
    navbar.children[2].textContent = "Profile"
    navbar.children[1].remove();
  //If your signed in set the profile tab to have the display name, and then if you are neither of Eli's google accoutns don't show the post creation tab
  }else{
    var dispName = curName;
    var navbar = document.getElementsByClassName("navbar")[0];
    navbar.children[2].textContent = "Profile: " + dispName;
    if (currentUser.uid != "rsNNG9JlJjaZqgkla7dUI0p28RD2" && currentUser.uid != "ZsB7WbdO87X5oPNj8QkDSM8YOq53") {
      navbar.children[1].remove();
    }
  }
  //Show the navbar after its been setup so there is no visual jumps
  navbar.classList.toggle("hidden");

  //Setup listener for having a textfield with a character limit (as seen on the profile page)
  var textfields = document.getElementsByClassName("namefield--input"); 
  for(i=0; i<textfields.length; i++){
      textfields[i].addEventListener("keydown", function(e) {
        //this is needed so that we get the length after the edit, not before
          setTimeout(() => {document.getElementById(this.getAttribute("curLengthID")).innerText = this.innerText.length - 1}, 10);
          if(this.innerText.length > this.getAttribute("max")){
              e.preventDefault();
              //in case the input somehow exceeded 25 characters reset it back to 25
              this.innerText = this.innerText.substring(0,24);
              alert("Too many characters!");
              return false;
          }
      }, false);
  }
}

function getStoredUser(callback, onNotLoggedIn, onColorGot){
  currentUser = JSON.parse(localStorage.getItem('storedUser'));
  //used to not repeat callback twice, also used to instantly check if callback isnt null which saves some time later
  var doCallback = callback != null; 
  if (currentUser != null) {
    curName = (currentUser || {displayName: ""}).displayName;
    //get color and store it in the currentUser for use when setting up the Profile Page
    db.collection("usercolor").doc(currentUser.uid).get().then((doc) => {
      if (doc.data() != null) {
        currentUser.currentColor = (doc.data().color || "#000000");
      }else{
       currentUser.currentColor = "#000000";   
      }
      //if onColorGot do callback only after query has finished
      if (doCallback && onColorGot) {
        callback();   
      }
    }).catch((error) => {
        console.log(error);
        alert(error);
    });
    if (doCallback && !onColorGot) {
      callback();
    }

  }else{
    //Only do the callback if speciifed to when not logged in
    if (doCallback && onNotLoggedIn) {
      callback();
    }
  }
} 
