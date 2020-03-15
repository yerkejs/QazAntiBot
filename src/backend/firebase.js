import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/functions';

const config = {
    apiKey: "AIzaSyDr9IQ7YP0aVPDf7hRfNgwo0YlOB4SqvlI",
    authDomain: "qazcoronabot-spmwxp.firebaseapp.com",
    databaseURL: "https://qazcoronabot-spmwxp.firebaseio.com",
    projectId: "qazcoronabot-spmwxp",
    storageBucket: "qazcoronabot-spmwxp.appspot.com",
    messagingSenderId: "1082693256911",
    appId: "1:1082693256911:web:2f843297f9f0d597bd19ba"
  };

if (!firebase.apps.length) {
  firebase.initializeApp(config);
}

const firestore = firebase.firestore();
const auth = firebase.auth();
const functions = firebase.functions();

export {
  firestore,
  auth,
  functions
};
