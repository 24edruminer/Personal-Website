function signup() {
  if (currentUser == null){
    firebase.auth().createUserWithEmailAndPassword(document.getElementById("namefield").value, document.getElementById("passfield").value)
    .then((userCredential) => {
      // Signed in 
      firebase.auth().currentUser.sendEmailVerification()
      .then(() => {
        alert("Created and signed in!");
        location.href="index.html";
        currentUser = userCredential.user;
        localStorage.setItem("userCredential", userCredential.user);
    });
    })
    .catch((error) => {
      logFirebaseError(error);
    });
  }else{
    alert("Already signed in!");
  }
}

function checkSignIn() {
  if (currentUser == null) {
    firebase.auth()
    .getRedirectResult()
    .then((result) => {
      alert("Signed in");
      location.href = "index.html";
    }).catch((error) => {
      logFirebaseError(error);
    });
  }
}

function login() {
  if (currentUser == null){
    firebase.auth().signInWithRedirect(provider).then(() => {
      alert("Signed in");
      location.href="index.html";
    });

  }else{
    alert("Already signed in!");
  }
}

function deleteaccount() {
  if (confirm('Are you sure you want to delete your account?')) {
    const user = firebase.auth().currentUser;
    user.delete().then(() => {
      alert("Deleted!");
      logout();
    }).catch((error) => {
      logFirebaseError(error)
    });
  } else {
    // Do nothing!
    console.log('Thing was not saved to the database.');
  }
}

function logout() {
  if (currentUser != null) {
    firebase.auth().signOut().then(() => {
      alert("Logged out!");
      var navbar = document.getElementsByClassName("navbar")[0];
      console.log(navbar);
      console.log(navbar.lastChild);
      navbar.children[navbar.children.length - 1].innerText = "Profile";
      if (navbar.children.length == 3){
        navbar.children[1].remove();
      }
      currentUser = null;
      localStorage.setItem("storedUser", null);
    }).catch((error) => {
      logFirebaseError(error)
    });

  }else{
    alert("Not currently signed in!");
  }
}

// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth());
ui.start('#firebaseui-auth-container', {
  signInOptions: [
    // List of OAuth providers supported.
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
  ],
  // Other config options...
});