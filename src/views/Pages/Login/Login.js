// Import FirebaseAuth and firebase.
import React from 'react';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import firebase from 'firebase';

// Configure FirebaseUI.
const uiConfig = {
  // Popup signin flow rather than redirect flow.
  signInFlow: 'popup',
  'callbacks': {'signInSuccess': function(currentUser, credential, redirectUrl){
    window.location.assign(`/dashboard`);
    return false;
  }},
  //signInSuccessUrl: '/dashboard',
  signInOptions: [
    firebase.auth.EmailAuthProvider.PROVIDER_ID
  ]
};

class Login extends React.Component {
  render() {
    return (
      <div>
        <h1>Planner</h1>
        <p>Please sign-in:</p>
        <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()}/>
      </div>
    );
  }
}

export default Login;