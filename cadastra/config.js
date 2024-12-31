// Configurações do Firebase
const firebaseConfig = {
    // Mova estas configurações para variáveis de ambiente em produção
    apiKey: process.env.FIREBASE_API_KEY || "AIzaSyCLEyAd_4-2n2ID0xTjwS1ouip9G9C6JDs",
    authDomain: "blacknight-600de.firebaseapp.com",
    databaseURL: "https://blacknight-600de.firebaseio.com",
    projectId: "blacknight-600de",
    storageBucket: "blacknight-600de.appspot.com",
    messagingSenderId: "588926432348",
    appId: "1:588926432348:web:47b2b4a1b421d4b2a0e299",
    measurementId: "G-559VYPVJ5Q"
};

// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);

// Configurações da aplicação
const appConfig = {
    cliente: "inovabar",
    defaultButtonTitle: "Lista Inova",
    defaultApelido: "Inova",
    defaultStatus: "Promoção",
    defaultWhatsapp: "11999100893",
    imagemPadrao: "https://firebasestorage.googleapis.com/v0/b/blacknight-600de.appspot.com/o/inovabar%2Ffoto.png?alt=media&token=1633178c-a441-4c52-884c-26a7325c5107"
};
