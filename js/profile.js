function profileSetup() {
  var dispname = curName;
  if (curName.length > 25){
    dispname = dispname.substring(0, 25);
  }
  document.getElementById("namefield").innerText = dispname;
  document.getElementById("curLengthID").innerText = dispname.length;
}

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

function deleteaccount() {
  if (confirm('Are you sure you want to delete your account?')) {
    const user = firebase.auth().currentUser;
      deleteComments(curName);
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

function deleteComments(userName){
  console.log(userName);
    db.collection("comments").where("createdby", "==", userName)
    .get()
    .then((querySnapshot) => {
        querySnapshot.forEach((comment) => {
          console.log("comment");
            db.collection("comments").doc(comment.id).delete();
        })
    }).catch((error) => {
      logFirebaseError(error);
  });
  db.collection("replies").where("createdby", "==", userName)
  .get()
  .then((querySnapshot) => {
      querySnapshot.forEach((reply) => {
        console.log("reply");
          db.collection("replies").doc(reply.id).delete();
      })
  }).catch((error) => {
    logFirebaseError(error);
  })
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

function submitDisplayName() {
  const user = firebase.auth().currentUser;
  console.log(document.getElementById("namefield").innerText);
  user.updateProfile({
    displayName: document.getElementById("namefield").innerText
  }).then(() => {
    console.log(user);
    localStorage.setItem("storedUser", JSON.stringify(user));
    location.reload();
    alert("Updated account succesfully!")
  }).catch((error) => {
    logFirebaseError(error);
  });  
}
// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth());
var uiConfig = {
  callbacks: {
    signInSuccessWithAuthResult: function(authResult, redirectUrl) {
      console.log(authResult);
      currentUser = authResult.user;
      localStorage.setItem('storedUser', JSON.stringify(authResult.user));
      alert("Signed In");
      return true;
    },
    uiShown: function() {
      // The widget is rendered.
      // Hide the loader.
      document.getElementsByClassName("firebaseui-idp-text")[0].innerText = "Sign in/up with Google"
      var parEle = document.getElementsByClassName("firebaseui-idp-text")[0].parentElement
      parEle.setAttribute("style", parEle.getAttribute("style") + ";max-width: 240px;");
    }
  },
  // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
  signInFlow: 'popup',
  signInSuccessUrl: 'index.html',
  signInOptions: [
    // Leave the lines as is for the providers you want to offer your users.
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
  ],

};

ui.start('#firebaseui-auth-container', uiConfig);