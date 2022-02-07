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

currentUser = null;
curName = null;
function universalSetup(callback) {
  getStoredUser(callback);
  if (currentUser == null){
    var navbar = document.getElementsByClassName("navbar")[0];
    navbar.children[2].textContent = "Profile"
    navbar.children[1].remove();
    firebase.auth()
    .getRedirectResult()
    .then((result) => {
    var user = result.user;
      currentUser = user;
      localStorage.setItem("storedUser", JSON.stringify(user));    
    }).catch((error) => {
      logFirebaseError(error);
    });
  }else{
    console.log(currentUser);
    var dispName = curName;
    var navbar = document.getElementsByClassName("navbar")[0];
    navbar.children[2].textContent = "Profile: " + dispName;
    if (currentUser.uid != "rsNNG9JlJjaZqgkla7dUI0p28RD2" && currentUser.uid != "ZsB7WbdO87X5oPNj8QkDSM8YOq53") {
      navbar.children[1].remove();
    }
  }

  var textfields = document.getElementsByClassName("namefield--input"); 
for(i=0; i<textfields.length; i++){
    textfields[i].addEventListener("keydown", function(e) {
        setTimeout(() => {document.getElementById(this.getAttribute("curLengthID")).innerText = this.innerHTML.length}, 10);
        if(this.innerHTML.length > this.getAttribute("max")){
            e.preventDefault();
            this.innerText = this.innerText.substring(0,24);
            alert("Too many characters!");
            return false;
        }
    }, false);
}
}

function getStoredUser(callback){
  var stored = localStorage.getItem('storedUser');
  if (stored != null) {
    currentUser = JSON.parse(localStorage.getItem('storedUser'));
    if (currentUser.uid != null) {
    db.collection("usercolor").doc(currentUser.uid).get().then((doc) => {
          currentUser.currentColor = doc.data().color;
          if (callback != null) {
            callback();
          }
      } )
      .catch((error) => {
          logFirebaseError(error);
      });
    }
    curName = (currentUser || {displayName: ""}).displayName;
  }else{
    currentUser = null;
    curName = null;
  }
} 

function logFirebaseError(error){
  var errorCode = error.code;
  var errorMessage = error.message;
  alert(errorMessage);
  console.log(errorCode + ": " + errorMessage);
}
