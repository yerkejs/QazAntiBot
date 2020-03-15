import { auth } from './firebase';

export const login = (email, password) =>
  auth.signInWithEmailAndPassword(email, password)
export const out = () =>
  auth.signOut()
export const authentication = auth;
