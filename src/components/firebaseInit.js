import firebase from 'firebase'
import 'firebase/firestore'
import firebaseConfig from './firebaseConfig'
const firebaseApp = firebase.initializeApp(firebaseConfig)
export let db = firebaseApp.firestore()
export let rtdb = firebaseApp.database()