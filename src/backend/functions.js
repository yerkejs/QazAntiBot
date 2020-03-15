import { functions } from './firebase';


export const sendMessage = (title, url) =>
    functions.httpsCallable('sendMessage')({title, url})
