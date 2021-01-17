import * as firebase from 'firebase';
import 'firebase/firebase-firestore';
import { firebaseConfig } from './secret.js';

firebase.initializeApp(firebaseConfig);
var firestore = firebase.firestore();

export default firestore;