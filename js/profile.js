//Set the pre-loaded values of the profile page from data stored in the database 
function profileSetup() {
  if (currentUser != null || curName != null){
    var dispname = curName;
    if (curName.length > 25){
      //reset the textfield in case it was manually edited in the console to increase its size
      dispname = dispname.substring(0, 25);
    }
    //setup fields with user's data
    document.getElementById("namefield").innerText = dispname;
    document.getElementById("curLengthID").innerText = dispname.length ;
    document.getElementById("colorselector").value = currentUser.currentColor || "#000000";
  }else{
    //if not signed in then remove fields relating to signed in user data
    document.getElementById("displayname").remove();
    document.getElementById("color").remove();
    document.getElementById("signedinas").remove();
  }

  //body is done being setup so show it
  document.getElementsByTagName("body")[0].classList.toggle("hidden");
}

//Deletes account from firebase
function deleteaccount() {
  if (confirm('Are you sure you want to delete your account?')) {
    const user = firebase.auth().currentUser;
    //delete all their comments and replies
      deleteComments(curName);
      user.delete().then(() => {
        alert("Deleted!");
        logout();
      }).catch((error) => {
        console.log(error);
        alert(error);
      });
  } else {
    // Do nothing!
  }
}

//Deletes all their comments and replies
function deleteComments(userName){
    //Deletes all comments
    db.collection("comments").where("createdby", "==", userName)
    .get()
    .then((querySnapshot) => {
        querySnapshot.forEach((comment) => {
          db.collection("comments").doc(comment.id).delete();
        })
    }).catch((error) => {
      console.log(error);
      alert(error);
  });
  //Deletes all replies
  db.collection("replies").where("createdby", "==", userName)
  .get()
  .then((querySnapshot) => {
      querySnapshot.forEach((reply) => {
        db.collection("replies").doc(reply.id).delete();
      })
  }).catch((error) => {
    console.log(error);
    alert(error);
  })
}

//Logs out user
function logout() {
  if (currentUser != null) {
    firebase.auth().signOut().then(() => {
      alert("Logged out!");
      currentUser = null;
      localStorage.setItem("storedUser", null);
      location.reload();
    }).catch((error) => {
      console.log(error);
      alert(error);
    });

  }else{
    alert("Not currently signed in!");
  }
}

//Changes the display name attached to the user
function submitDisplayName() {
  const user = firebase.auth().currentUser;
  user.updateProfile({
    displayName: document.getElementById("namefield").innerText
  }).then(() => {
    console.log(user);
    localStorage.setItem("storedUser", JSON.stringify(user));
    location.reload();
    alert("Updated account succesfully!")
  }).catch((error) => {
    console.log(error);
    alert(error);
  });  
}

//Changes the color value in the collecton with the id equal to the user's uid
function submitDisplayColor() {
  const user = firebase.auth().currentUser;
  
  db.collection("usercolor").doc(user.uid).set({
    color: document.getElementById("colorselector").value
  }).then(() => {
    user.currentColor = document.getElementById("colorselector").value
    localStorage.setItem("storedUser", JSON.stringify(user));
    location.reload();
    alert("Updated account succesfully!");
  } )
  .catch((error) => {
      console.log(error);
alert(error);
  });

}

// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth());
var uiConfig = {
  callbacks: {
    //on success update user, then redirect to the home page (returning true brings you to the signInSuccessUrl) 
    signInSuccessWithAuthResult: function(authResult, redirectUrl) {
      console.log(authResult);
      currentUser = authResult.user;
      localStorage.setItem('storedUser', JSON.stringify(authResult.user));

      alert("Signed In");
      return true;
    },
    uiShown: function() {
      // The widget is rendered.
      //Change the visuals to have the same font and change its size
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

//magic that creates teh UI and all its handlers, handled by firebase
ui.start('#firebaseui-auth-container', uiConfig);