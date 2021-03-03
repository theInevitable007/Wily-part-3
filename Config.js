import firebase from 'firebase';
require('@firebase/firestore');
var firebaseConfig = {
    apiKey: "AIzaSyDlsKC-Tt6m1Az9v6SvhSQzI4culB8T758",
    authDomain: "wily-eb5d0.firebaseapp.com",
    projectId: "wily-eb5d0",
    storageBucket: "wily-eb5d0.appspot.com",
    messagingSenderId: "284819409016",
    appId: "1:284819409016:web:81d052122b356b64a6458d"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  export default firebase.firestore();