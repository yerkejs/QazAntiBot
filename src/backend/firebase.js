import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/functions';

const config = {<CONFIG_DATA>};

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
