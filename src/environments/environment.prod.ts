// Este archivo se usa cuando haces build para producción
export const environment = {
  production: true,
  apiUrl: 'https://greenbox0-1.onrender.com',  // ← URL de Render
  allowOfflineLogin: false,  // Requiere backend activo para validar el código
  firebase: {
    apiKey: "AIzaSyCGA2vn1DZan29mH6Lz_XpmHPrUCRVhlrk",
    authDomain: "greenbox1.firebaseapp.com",
    projectId: "greenbox1",
    storageBucket: "greenbox1.firebasestorage.app",
    messagingSenderId: "502680482164",
    appId: "1:502680482164:web:f36f5e6497458efdcefc21"
  }
};