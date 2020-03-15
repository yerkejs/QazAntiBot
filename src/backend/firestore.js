import { firestore } from './firebase';
import firebase from 'firebase/app';


export const sendComplain = (name, price, text) => {
  var date = new Date();
  let now = date.getTime();
  firestore.collection("complains").doc(now + "").set({
    name, price, text
  }).catch(function(e) {
    console.log(e)
  })
}
export const createNews = (title, url, date) => {
  firestore.collection("News").doc(date + "").set({ count: date, title, url})
  firestore.collection("realNews").doc("news").update({
    news: firebase.firestore.FieldValue.arrayUnion(url)
  })
}



export const getNews = () =>
  firestore.collection("News").get()
export const getZhaloby = () =>
  firestore.collection("complains").get()
