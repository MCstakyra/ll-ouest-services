import {
  initializeFirebase,
  showNotification,
  setStoredToken,
  clearStoredToken,
  getStoredToken,
  getCachedUserData,
  checkNetwork,
  isDarkMode,
  handleApiError,
  monitorBackend,
  stopMonitoring,
  waitForAuthState,
} from './modules/utils.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js';
import Api from './api.js';
import './animations/animation.js';
import './animations/theme.js';
import './animations/sidebar.js';
import './animations/chat.js';
import { loadUserData, updateUIWithUserData } from './loadData.js';



const apiCache = {};
const CACHE_TTL = 2 * 60 * 1000;

// État global
let appInitialized = false;
let firebaseInitialized = false;
let auth = null;
let currentPage = null;
let networkMonitoringInterval = null;
const NETWORK_CHECK_INTERVAL = 30000; 

// État pour l'overlay de chargement
let loadingOverlay = null;
let loadingStatusElement = null;
let loadingTextElement = null;
let loadingIconElement = null;
let loadingSubtextElement = null;

/**
 * Initialise les éléments de l'overlay de chargement.
 */
function initLoadingElements() {
  loadingOverlay = document.getElementById('loading-overlay');
  loadingStatusElement = document.getElementById('loading-status');
  loadingTextElement = document.getElementById('loading-text');
  loadingIconElement = document.getElementById('loading-icon');
  loadingSubtextElement = document.getElementById('loading-subtext');
}

/**
 * Met à jour le statut de chargement avec icône SVG et message dynamique.
 * @param {string} text - Texte principal.
 * @param {string} subtext - Sous-texte optionnel.
 * @param {string} iconType - Type d'icône : 'network', 'firebase', 'auth', 'backend', 'modules', 'default'.
 */
export function updateLoadingStatus(text, subtext = '', iconType = 'default') {
  if (!loadingTextElement || !loadingSubtextElement || !loadingIconElement) return;

  // Messages adaptés pour les utilisateurs
  const messages = {
    network: { 
      text: 'Connexion en cours...', 
      subtext: 'Vérification de votre accès internet.' 
    },
    backend: { 
      text: 'Préparation en cours...', 
      subtext: 'Veuillez patienter quelques instants.' 
    },
    firebase: { 
      text: 'Sécurité en cours...', 
      subtext: 'Chargement des protections.' 
    },
    auth: { 
      text: 'Vérification de compte...', 
      subtext: 'Récupération de vos informations.' 
    },
    modules: { 
      text: 'Interface en préparation...', 
      subtext: 'Chargement des fonctionnalités.' 
    },
    success: {
      text: 'Prêt !',
      subtext: 'Ouverture de votre espace...'
    },
    default: { 
      text: 'Bienvenue chez L&L Ouest Services', 
      subtext: 'Chargement en cours...' 
    }
  };

  const status = messages[iconType] || messages.default;
  
  // Transition fluide
  loadingTextElement.style.opacity = '0';
  loadingSubtextElement.style.opacity = '0';
  
  setTimeout(() => {
    loadingTextElement.textContent = text || status.text;
    loadingSubtextElement.textContent = subtext || status.subtext;
    
    loadingTextElement.style.transition = 'opacity 0.3s ease';
    loadingSubtextElement.style.transition = 'opacity 0.3s ease';
    loadingTextElement.style.opacity = '1';
    loadingSubtextElement.style.opacity = '1';
  }, 150);

  const icons = {
    network: '<svg class="w-6 h-6 text-blue-400 animate-pulse"version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <rect x="10.779" y="60.901" style="fill:#FF7D46;" width="490.442" height="130.07"></rect> <rect x="371.874" y="104.017" style="fill:#EFEFEF;" width="86.232" height="43.835"></rect> <rect x="10.779" y="190.971" style="fill:#FF7D46;" width="490.442" height="130.07"></rect> <rect x="371.874" y="234.086" style="fill:#EFEFEF;" width="86.232" height="43.835"></rect> <rect x="10.779" y="321.029" style="fill:#FF7D46;" width="490.442" height="130.07"></rect> <rect x="371.874" y="364.145" style="fill:#EFEFEF;" width="86.232" height="43.835"></rect> <g> <path style="fill:#231F20;" d="M501.221,50.122H10.779C4.827,50.122,0,54.948,0,60.901v390.198c0,5.953,4.827,10.779,10.779,10.779 h490.442c5.952,0,10.779-4.826,10.779-10.779V60.901C512,54.948,507.173,50.122,501.221,50.122z M21.558,201.746h468.884v108.508 H21.558V201.746z M21.558,71.68h468.884v108.508H21.558V71.68z M490.442,440.32H21.558V331.812h468.884V440.32z"></path> <path style="fill:#231F20;" d="M458.105,93.238h-86.232c-5.952,0-10.779,4.826-10.779,10.779v43.835 c0,5.953,4.827,10.779,10.779,10.779h86.232c5.952,0,10.779-4.826,10.779-10.779v-43.835 C468.884,98.064,464.057,93.238,458.105,93.238z M447.326,137.073h-64.674v-22.277h64.674V137.073z"></path> <path style="fill:#231F20;" d="M458.105,223.304h-86.232c-5.952,0-10.779,4.826-10.779,10.779v43.835 c0,5.953,4.827,10.779,10.779,10.779h86.232c5.952,0,10.779-4.826,10.779-10.779v-43.835 C468.884,228.13,464.057,223.304,458.105,223.304z M447.326,267.138h-64.674v-22.277h64.674V267.138z"></path> <path style="fill:#231F20;" d="M371.874,418.762h86.232c5.952,0,10.779-4.826,10.779-10.779v-43.835 c0-5.953-4.827-10.779-10.779-10.779h-86.232c-5.952,0-10.779,4.826-10.779,10.779v43.835 C361.095,413.936,365.922,418.762,371.874,418.762z M382.653,374.927h64.674v22.277h-64.674V374.927z"></path> <path style="fill:#231F20;" d="M66.829,115.151c-2.847,0-5.616,1.153-7.621,3.158s-3.158,4.786-3.158,7.621 c0,2.846,1.152,5.616,3.158,7.621c2.005,2.016,4.775,3.158,7.621,3.158c2.835,0,5.616-1.143,7.62-3.158 c2.005-2.005,3.159-4.775,3.159-7.621c0-2.835-1.153-5.616-3.159-7.621C72.445,116.304,69.664,115.151,66.829,115.151z"></path> <path style="fill:#231F20;" d="M118.568,115.151c-5.951,0-10.779,4.829-10.779,10.779c0,5.961,4.828,10.779,10.779,10.779 c5.95,0,10.779-4.818,10.779-10.779C129.347,119.98,124.518,115.151,118.568,115.151z"></path> <path style="fill:#231F20;" d="M170.307,115.151c-2.835,0-5.616,1.153-7.621,3.158c-2.005,2.005-3.158,4.786-3.158,7.621 c0,2.835,1.152,5.616,3.158,7.621c2.005,2.016,4.786,3.158,7.621,3.158s5.616-1.143,7.62-3.158 c2.005-2.005,3.159-4.786,3.159-7.621c0-2.835-1.153-5.616-3.159-7.621C175.923,116.304,173.142,115.151,170.307,115.151z"></path> <path style="fill:#231F20;" d="M66.829,245.221c-2.847,0-5.616,1.153-7.621,3.158s-3.158,4.786-3.158,7.621 c0,2.835,1.152,5.616,3.158,7.621c2.005,2.005,4.775,3.158,7.621,3.158c2.835,0,5.616-1.153,7.62-3.158 c2.005-2.005,3.159-4.786,3.159-7.621c0-2.835-1.153-5.616-3.159-7.621C72.445,246.373,69.664,245.221,66.829,245.221z"></path> <path style="fill:#231F20;" d="M118.568,245.221c-5.951,0-10.779,4.829-10.779,10.779c0,5.95,4.828,10.779,10.779,10.779 c5.95,0,10.779-4.829,10.779-10.779C129.347,250.05,124.518,245.221,118.568,245.221z"></path> <path style="fill:#231F20;" d="M170.307,245.221c-2.835,0-5.616,1.153-7.621,3.158c-2.005,2.005-3.158,4.786-3.158,7.621 c0,2.835,1.152,5.616,3.158,7.621c2.005,2.005,4.786,3.158,7.621,3.158s5.616-1.153,7.62-3.158 c2.005-2.005,3.159-4.786,3.159-7.621c0-2.835-1.153-5.616-3.159-7.621C175.923,246.373,173.142,245.221,170.307,245.221z"></path> <path style="fill:#231F20;" d="M66.829,396.847c2.835,0,5.616-1.153,7.62-3.158c2.005-2.005,3.159-4.786,3.159-7.621 c0-2.846-1.153-5.616-3.159-7.621c-2.004-2.016-4.785-3.158-7.62-3.158c-2.847,0-5.616,1.143-7.621,3.158 c-2.005,2.005-3.158,4.786-3.158,7.621s1.152,5.616,3.158,7.621C61.214,395.695,63.983,396.847,66.829,396.847z"></path> <path style="fill:#231F20;" d="M118.568,396.847c5.95,0,10.779-4.829,10.779-10.779c0-5.961-4.829-10.779-10.779-10.779 c-5.951,0-10.779,4.818-10.779,10.779C107.789,392.018,112.617,396.847,118.568,396.847z"></path> <path style="fill:#231F20;" d="M170.307,396.847c2.835,0,5.616-1.153,7.62-3.158c2.005-2.005,3.159-4.786,3.159-7.621 s-1.153-5.616-3.159-7.632c-2.004-2.005-4.785-3.147-7.62-3.147s-5.616,1.143-7.621,3.147c-2.005,2.016-3.158,4.797-3.158,7.632 c0,2.835,1.152,5.616,3.158,7.621C164.692,395.695,167.472,396.847,170.307,396.847z"></path> <path style="fill:#231F20;" d="M279.887,115.151H247.19c-5.952,0-10.779,4.826-10.779,10.779c0,5.953,4.827,10.779,10.779,10.779 h32.697c5.952,0,10.779-4.826,10.779-10.779C290.666,119.977,285.84,115.151,279.887,115.151z"></path> <path style="fill:#231F20;" d="M279.887,245.218H247.19c-5.952,0-10.779,4.826-10.779,10.779s4.827,10.779,10.779,10.779h32.697 c5.952,0,10.779-4.826,10.779-10.779S285.84,245.218,279.887,245.218z"></path> <path style="fill:#231F20;" d="M247.19,396.842h32.697c5.952,0,10.779-4.826,10.779-10.779s-4.827-10.779-10.779-10.779H247.19 c-5.952,0-10.779,4.826-10.779,10.779S241.238,396.842,247.19,396.842z"></path> </g> </g></svg>',
    firebase: '<svg viewBox="-47.5 0 351 351" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-orange-400 animate-bounce" xmlns:xlink="http://www.w3.org/1999/xlink" preserveAspectRatio="xMidYMid" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><defs><path d="M1.253 280.732l1.605-3.131 99.353-188.518-44.15-83.475C54.392-1.283 45.074.474 43.87 8.188L1.253 280.732z" id="a"></path><filter x="-50%" y="-50%" width="200%" height="200%" filterUnits="objectBoundingBox" id="b"><feGaussianBlur stdDeviation="17.5" in="SourceAlpha" result="shadowBlurInner1"></feGaussianBlur><feOffset in="shadowBlurInner1" result="shadowOffsetInner1"></feOffset><feComposite in="shadowOffsetInner1" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="shadowInnerInner1"></feComposite><feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.06 0" in="shadowInnerInner1"></feColorMatrix></filter><path d="M134.417 148.974l32.039-32.812-32.039-61.007c-3.042-5.791-10.433-6.398-13.443-.59l-17.705 34.109-.53 1.744 31.678 58.556z" id="c"></path><filter x="-50%" y="-50%" width="200%" height="200%" filterUnits="objectBoundingBox" id="d"><feGaussianBlur stdDeviation="3.5" in="SourceAlpha" result="shadowBlurInner1"></feGaussianBlur><feOffset dx="1" dy="-9" in="shadowBlurInner1" result="shadowOffsetInner1"></feOffset><feComposite in="shadowOffsetInner1" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="shadowInnerInner1"></feComposite><feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.09 0" in="shadowInnerInner1"></feColorMatrix></filter></defs><path d="M0 282.998l2.123-2.972L102.527 89.512l.212-2.017L58.48 4.358C54.77-2.606 44.33-.845 43.114 6.951L0 282.998z" fill="#FFC24A"></path><use fill="#FFA712" fill-rule="evenodd" xlink:href="#a"></use><use filter="url(#b)" xlink:href="#a"></use><path d="M135.005 150.38l32.955-33.75-32.965-62.93c-3.129-5.957-11.866-5.975-14.962 0L102.42 87.287v2.86l32.584 60.233z" fill="#F4BD62"></path><use fill="#FFA50E" fill-rule="evenodd" xlink:href="#c"></use><use filter="url(#d)" xlink:href="#c"></use><path fill="#F6820C" d="M0 282.998l.962-.968 3.496-1.42 128.477-128 1.628-4.431-32.05-61.074z"></path><path d="M139.121 347.551l116.275-64.847-33.204-204.495c-1.039-6.398-8.888-8.927-13.468-4.34L0 282.998l115.608 64.548a24.126 24.126 0 0 0 23.513.005" fill="#FDE068"></path><path d="M254.354 282.16L221.402 79.218c-1.03-6.35-7.558-8.977-12.103-4.424L1.29 282.6l114.339 63.908a23.943 23.943 0 0 0 23.334.006l115.392-64.355z" fill="#FCCA3F"></path><path d="M139.12 345.64a24.126 24.126 0 0 1-23.512-.005L.931 282.015l-.93.983 115.607 64.548a24.126 24.126 0 0 0 23.513.005l116.275-64.847-.285-1.752-115.99 64.689z" fill="#EEAB37"></path></g></svg>',
    auth: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="w-6 h-6 text-green-400 animate-spin-slow"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M12 4v16m-3-9h6"></path></svg>',
    backend: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="w-6 h-6 text-purple-400 animate-pulse"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>',
    modules: '<svg class="w-6 h-6 text-indigo-400 animate-bounce" version="1.1" id="_x35_" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path style="fill:#CAA85D;" d="M437.476,443.858H74.501c-40.97,0-74.49-33.521-74.49-74.49V148.201 c0-40.969,33.52-74.49,74.49-74.49h362.976c40.97,0,74.49,33.521,74.49,74.49v221.167 C511.966,410.338,478.446,443.858,437.476,443.858z"></path> <path style="fill:#CAA85D;" d="M205.518,258.785H74.501c-40.97,0-74.49-33.52-74.49-74.49V74.49C0.011,33.521,33.531,0,74.501,0 h131.017c40.969,0,74.49,33.521,74.49,74.49v109.805C280.008,225.264,246.487,258.785,205.518,258.785z"></path> <rect x="37.662" y="117.195" style="fill:#FFFFFF;" width="436.654" height="225.906"></rect> <path style="fill:#CAA85D;" d="M512,186.66v265.681c0,15.726-12.912,28.637-28.637,28.637H28.643 c-4.552,0-8.939-1.076-12.746-3.062c-5.628-2.814-10.18-7.366-12.912-12.912c-1.49-2.897-2.4-6.125-2.814-9.518 c-0.083-0.993-0.166-2.069-0.166-3.145v-160.65l37.659-37.659l3.311-3.311l64.061-64.061H512z"></path> <path style="fill:#AF8B4D;" d="M268.997,186.66l-72.09,72.09l-84.339,84.339l-84.505,84.505L0.171,455.486 c-0.083-0.993-0.166-2.069-0.166-3.145v-160.65l37.659-37.659l3.311-3.311l64.061-64.061H268.997z"></path> <polygon style="fill:#F9D68A;" points="104.999,186.664 0,291.663 104.999,291.663 "></polygon> <rect x="304.62" y="394.01" style="fill:#ECE4D9;" width="169.696" height="57.272"></rect> </g> </g></svg>',
    default: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="w-6 h-6 text-blue-400 animate-spin-slow"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>'
  };

  loadingIconElement.innerHTML = icons[iconType] || icons.default;
  
  // Animation douce
  loadingIconElement.style.transform = 'scale(0.9)';
  loadingIconElement.style.transition = 'transform 0.3s ease';
  
  setTimeout(() => {
    loadingIconElement.style.transform = 'scale(1)';
  }, 50);
}



/**
 * Vérifie si le serveur est en cold start et attend son démarrage
 * @param {Object} options - Options de configuration
 * @returns {Promise<boolean>} true si le serveur est prêt
 */
export async function waitForServerReady(options = {}) {
  const {
    maxAttempts = 5,
    initialDelay = 3000,
    maxDelay = 30000,
    context = 'Server Ready Check'
  } = options;

  console.log('🔄 Vérification de l\'état du serveur...');

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      updateLoadingStatus?.('Connexion au serveur...', 'Le serveur se réveille, veuillez patienter.', 'backend');
      
      const networkStatus = await checkNetwork({ context });
      
      if (networkStatus.backendConnected) {
        console.log('✅ Serveur prêt après', attempt, 'tentative(s)');
        updateLoadingStatus?.('Serveur prêt !', 'Chargement de l\'application...', 'success');
        return true;
      }

      // Calcul du délai avec backoff exponentiel
      const delay = Math.min(maxDelay, initialDelay * Math.pow(1.5, attempt - 1));
      
      if (attempt < maxAttempts) {
        console.log(`⏳ Tentative ${attempt}/${maxAttempts} - Nouvel essai dans ${delay}ms`);
        
        // Message utilisateur progressif
        const userMessage = attempt === 1 
          ? 'Initialisation du serveur...'
          : attempt === 2
          ? 'Le serveur démarre, presque prêt...'
          : 'Presque là, préparation finale...';
        
        updateLoadingStatus?.(userMessage, 'Veuillez patienter quelques instants supplémentaires.', 'backend');
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    } catch (error) {
      console.warn(`⚠️ Erreur lors de la vérification (tentative ${attempt}):`, error.message);
      
      if (attempt === maxAttempts) {
        console.error('❌ Impossible de contacter le serveur après', maxAttempts, 'tentatives');
        return false;
      }
      
      const delay = Math.min(maxDelay, initialDelay * Math.pow(1.5, attempt));
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  return false;
}


/**
 * Affiche des messages d'attente pendant le chargement
 */
function showWaitingMessage(step, totalSteps) {
  const messages = [
    "Initialisation en cours...",
    "Chargement des services...",
    "Configuration finale...",
    "Ouverture imminente..."
  ];
  
  const subMessages = [
    "Veuillez patienter",
    "Préparation en cours",
    "Quelques instants",
    "Presque terminé"
  ];
  
  const index = Math.min(step - 1, messages.length - 1);
  
  updateLoadingStatus(
    messages[index] || "Chargement en cours",
    subMessages[index] || "Merci de patienter",
    'backend'
  );
}

/**
 * Écoute constante de l'état backend, toutes les 30 secondes.
 * Utilise des notifications polies pour informer sans bloquer.
 * **Vérifie UNIQUEMENT la disponibilité du backend.**
 */
function startNetworkMonitoring() {
  if (networkMonitoringInterval) return;
  
  networkMonitoringInterval = setInterval(async () => {
    const networkStatus = await checkNetwork({ context: 'Network Monitoring' }); 
    if (!networkStatus.backendConnected) {
      await showNotification(
        'Serveur temporairement indisponible. Nous réessayons automatiquement.',
        'warning'
      );
      await monitorBackend({ context: 'Network Monitoring' });
    } else {
      stopMonitoring();
    }
  }, NETWORK_CHECK_INTERVAL);
}

/**
 * Arrête l'écoute backend constante.
 */
function stopNetworkMonitoring() {
  if (networkMonitoringInterval) {
    clearInterval(networkMonitoringInterval);
    networkMonitoringInterval = null;
  }
}

/**
 * Met en cache une réponse API.
 * @param {string} key - Clé du cache.
 * @param {*} data - Données à cacher.
 */
function cacheResponse(key, data) {
  apiCache[key] = { data, timestamp: Date.now() };
}

/**
 * Récupère une réponse du cache si valide.
 * @param {string} key - Clé du cache.
 * @returns {*} - Données cachées ou null.
 */
function getCachedResponse(key) {
  const cached = apiCache[key];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  delete apiCache[key];
  return null;
}


/**
 * Wrapper pour appels asynchrones avec retries (backoff exponentiel, plus patient pour Render).
 * @param {Function} fn - Fonction async à appeler.
 * @param {number} maxRetries - Max tentatives (défaut 8 pour cold starts).
 * @param {number} baseDelay - Délai base en ms (défaut 5s).
 * @returns {Promise<*>} Résultat de fn.
 */
async function withRetries(fn, maxRetries = 8, baseDelay = 5000) {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.log(`🔄 Retry ${attempt}/${maxRetries} dans ${delay}ms : ${err.message}`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError || new Error('Échec après retries');
}

/**
 * Détermine la page actuelle à partir de l'URL.
 * @returns {string} - Nom de la page.
 */
function getCurrentPage() {
  const path = window.location.pathname;
  const parts = path.split('/').filter(Boolean);
  if (parts.length === 0 || parts[0] === 'index.html' || path === '/') {
    return 'index';
  }
  const lastPart = parts[parts.length - 1];
  return lastPart.endsWith('.html') ? lastPart.replace('.html', '') : lastPart;
}

/**
 * Charge dynamiquement un module avec gestion d'erreurs.
 * @param {string} modulePath - Chemin du module.
 * @returns {Promise<Object|null>} - Module chargé ou null.
 */
async function loadModule(modulePath) {
  const cacheKey = `module_${modulePath.replace(/\//g, '_')}`;
  const cachedModule = getCachedResponse(cacheKey);
  if (cachedModule) {
    return cachedModule;
  }
  try {
    const module = await import(modulePath);
    const moduleObj = module.default || module;
    cacheResponse(cacheKey, moduleObj);
    return moduleObj;
  } catch (error) {
    await showNotification(`Erreur chargement module: ${modulePath}`, 'error');
    return null;
  }
}

/**
 * Initialise la page actuelle.
 * @param {string} page - Nom de la page.
 * @param {boolean} isAuthenticated - État d'authentification.
 * @param {Object} [userData] - Données utilisateur.
 * @returns {Promise<boolean>} Succès de l'initialisation.
 */
async function initializePage(page, isAuthenticated, userData = null) {
  updateLoadingStatus('Chargement des modules...', 'Préparation de l\'interface...', 'modules');

  const moduleMap = {
    index: { path: null, pages: ['index'], modules: ['contact', 'service', 'review', 'about'], authRequired: false, title: 'Accueil' },
    auth: { path: './modules/auth.js', pages: ['signin', 'signup', 'verify-email', 'password-reset', 'reset-password', 'change-email', 'code-check'], modules: [], authRequired: false, title: 'Authentification' },
    user: { path: './modules/user.js', pages: ['dashboard', 'profile', 'admin'], modules: ['notifications'], authRequired: true, title: 'Espace utilisateur' },
    chat: { path: './modules/chat.js', pages: ['chat'], modules: [], authRequired: true, title: 'Chat' },
    contact: { path: './modules/contact.js', pages: ['contact', 'messages'], modules: [], authRequired: false, title: 'Contact' },
    doc: { path: './modules/document.js', pages: ['doc'], modules: [], authRequired: true, title: 'Documents' },
    map: { path: './modules/map.js', pages: ['map'], modules: [], authRequired: false, title: 'Localisation' },
    review: { path: './modules/review.js', pages: ['reviews', 'create', 'manage', 'user'], modules: [], authRequired: false, title: 'Avis' },
    service: { path: './modules/service.js', pages: ['services', 'admin'], modules: [], authRequired: false, title: 'Services' },
    mentions: { path: './modules/mentions.js', pages: ['mentions'], modules: [], authRequired: false, title: 'Mentions légales' },
    realizations: { path: './modules/realizations.js', pages: ['realizations'], modules: [], authRequired: false, title: 'Réalisations' }
  };

  const authRequiredPages = Object.values(moduleMap)
    .filter(mod => mod.authRequired)
    .flatMap(mod => mod.pages);

  if (authRequiredPages.includes(page) && !isAuthenticated) {
    await showNotification('Veuillez vous connecter.', 'warning');
    setTimeout(() => window.location.href = '/pages/auth/signin.html', 1500);
    return false;
  }

  const pageConfig = Object.values(moduleMap).find(config => config.pages.includes(page));
  if (pageConfig?.title) {
    document.title = `${pageConfig.title} - L&L Ouest Services`;
  }

  const initPromises = [];
  const mainModule = Object.entries(moduleMap).find(([_, mod]) => mod.pages.includes(page));

  if (mainModule) {
    const [moduleName, mod] = mainModule;
    if (mod.path && (!mod.authRequired || isAuthenticated)) {
      initPromises.push(
        loadModule(mod.path).then(async module => {
          if (module?.init) {
            await module.init({ isAuthenticated, userData, pageContext: page });
          }
        })
      );
    }
    if (mod.modules?.length) {
      for (const additionalModuleName of mod.modules) {
        const additionalMod = moduleMap[additionalModuleName];
        if (additionalMod?.path && (!additionalMod.authRequired || isAuthenticated)) {
          initPromises.push(
            loadModule(additionalMod.path).then(async module => {
              if (module?.init) {
                await module.init({ isAuthenticated, userData, pageContext: page });
              }
            })
          );
        }
      }
    }
  }

  try {
    await Promise.all(initPromises);
    if (typeof AOS !== 'undefined') AOS.refresh();
    return true;
  } catch (error) {
    await showNotification(`Erreur chargement page: ${error.message}`, 'error');
    return false;
  }
}

/**
 * Vérifie l'état d'authentification.
 * @param {Object|null} user - Utilisateur Firebase.
 * @returns {Promise<{isAuthenticated: boolean, userData: Object|null}>}
 */
async function verifyAuthState(user) {
  updateLoadingStatus('Vérification de votre session...', 'Récupération de vos informations personnelles.', 'auth');

  let isAuthenticated = !!user;
  let userData = null;

  if (user) {
    try {
      const firebaseToken = await user.getIdToken(true);
      const cachedAuth = getCachedResponse('auth_state');
      if (cachedAuth && Date.now() - cachedAuth.timestamp < 2 * 60 * 1000) {
        if (getStoredToken() === cachedAuth.token) {
          return { isAuthenticated: true, userData: cachedAuth.userInfo };
        }
      }

      let storedToken = getStoredToken();
      let newToken = storedToken;

      if (storedToken) {
        try {
          const payload = JSON.parse(atob(storedToken.split('.')[1]));
          if (payload.exp * 1000 <= Date.now()) {
            throw new Error('Token expired');
          }
          if (payload.exp * 1000 - Date.now() < 5 * 60 * 1000) {
            const refreshData = await withRetries(() => Api.auth.refreshToken());
            newToken = refreshData.token;
            userData = refreshData.user;
          } else {
            const verifyData = await withRetries(() => Api.auth.verifyToken());
            newToken = verifyData.token;
            userData = verifyData.user;
          }
        } catch (error) {
          try {
            const refreshData = await withRetries(() => Api.auth.refreshToken());
            newToken = refreshData.token;
            userData = refreshData.user;
          } catch (refreshError) {
            throw refreshError;
          }
        }
      } else {
        const verifyData = await withRetries(() => Api.auth.verifyToken());
        newToken = verifyData.token;
        userData = verifyData.user;
      }

      // S'assurer que le rôle est défini
      if (!userData?.role) {
        userData = { ...userData, role: 'client' };
      }

      setStoredToken(newToken, userData.role);
      cacheResponse('auth_state', { token: newToken, userInfo: userData, timestamp: Date.now() });
    } catch (error) {
      const networkStatus = await checkNetwork();
      if (!networkStatus.backendConnected) {
        const cachedUser = getCachedUserData();
        if (cachedUser) {
          isAuthenticated = true;
          userData = cachedUser;
          await showNotification('Mode dégradé activé (Backend indisponible).', 'warning');
        } else {
          isAuthenticated = false;
          userData = null;
          await showNotification('Backend indisponible. Aucune donnée en cache. Veuillez réessayer.', 'error');
        }
      } else if (error.message?.includes('invalid algorithm') || error.message?.includes('Token invalide') || error.message?.includes('expiré') || error.message?.includes('401')) {
        clearStoredToken();
        await Api.auth.signOut();
        await showNotification('Session expirée. Veuillez vous reconnecter.', 'error');
      } else {
        await handleApiError(error, 'Erreur inattendue d\'authentification.', {
          context: 'Authentification',
          sourceContext: 'authentification',
          isCritical: false,
          iconSvg: `<svg class="w-10 h-10 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
          actions: [
            { text: 'Réessayer', href: window.location.href, class: 'bg-ll-blue hover:bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm font-medium', svg: `<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>` },
            { text: 'Contacter le support', href: 'mailto:contact@llouestservices.fr', class: 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-3 py-1.5 rounded-md text-sm font-medium', svg: `<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>` },
          ],
          errorId: generateString(8),
        });
        isAuthenticated = false;
        userData = null;
      }
    }
  } else {
    clearStoredToken();
    await Api.auth.signOut();
  }

  return { isAuthenticated, userData };
}

/**
 * Masque l'overlay de chargement avec animation fluide.
 */
function hideLoadingOverlay() {
  if (loadingOverlay) {
    loadingOverlay.style.opacity = '0';
    setTimeout(() => {
      loadingOverlay.style.display = 'none';
      document.body.classList.remove('loading');
      loadingOverlay = null;
    }, 500);
  }
}

/**
 * Initialise l'application.
 * @returns {Promise<boolean>} Succès de l'initialisation.
 */
// Modifier la fonction initializeApp
async function initializeApp() {
  if (appInitialized) return true;

  initLoadingElements();
  const appStartTime = Date.now();
  window.__APP_START_TIME__ = appStartTime;

  try {
    // Étape 1: Vérification réseau rapide
    updateLoadingStatus('Vérification de la connexion...', 'Assurons-nous que tout est connecté.', 'network');
    
    const networkStatus = await checkNetwork({ context: 'Initial Check', fastCheck: true });
    
    // Si le serveur n'est pas disponible, attendre son démarrage
    if (!networkStatus.backendConnected) {
      updateLoadingStatus('Connexion au serveur...', 'Le serveur se réveille, veuillez patienter.', 'backend');
      
      const serverReady = await waitForServerReady({
        maxAttempts: 4,
        initialDelay: 5000,
        maxDelay: 15000,
        context: 'App Initialization'
      });
      
      if (!serverReady) {
        await showNotification(
          'Le serveur est temporairement indisponible. Mode dégradé activé.',
          'warning',
          false,
          { timer: 5000 }
        );
        
        // Continuer sans backend
        firebaseInitialized = false;
        appInitialized = true;
        currentPage = getCurrentPage();
        
        // Masquer l'overlay rapidement
        setTimeout(() => hideLoadingOverlay(), 1000);
        return true;
      }
    }

    // Étape 2: Initialiser Firebase (sans bloquer sur les erreurs)
    updateLoadingStatus('Initialisation des services...', 'Chargement des modules sécurisés.', 'firebase');
    
    try {
      const app = await withRetries(() => initializeFirebase(), 3, 2000);
      firebaseInitialized = true;
      auth = getAuth(app);
    } catch (firebaseError) {
      console.warn('⚠️ Firebase non disponible, continuation en mode dégradé:', firebaseError.message);
      firebaseInitialized = false;
      // Continuer sans Firebase
    }

    // Étape 3: Initialiser les API (mode résilient)
    updateLoadingStatus('Chargement des modules...', 'Préparation des fonctionnalités.', 'modules');
    
    const apiInitPromises = [];
    for (const moduleName in Api) {
      if (typeof Api[moduleName]?.init === 'function') {
        apiInitPromises.push(
          (async () => {
            try {
              await Api[moduleName].init();
            } catch (error) {
              console.warn(`⚠️ Module ${moduleName} non initialisé:`, error.message);
              // Continuer sans ce module
            }
          })()
        );
      }
    }
    
    await Promise.allSettled(apiInitPromises);

    // Étape 4: Démarrer la surveillance réseau
    startNetworkMonitoring();

    appInitialized = true;
    currentPage = getCurrentPage();

    const totalLoadTime = Date.now() - appStartTime;
    console.log(`🚀 Application initialisée en ${totalLoadTime}ms`);
    
    return true;
  } catch (error) {
    console.error('❌ Erreur critique d\'initialisation:', error);
    
    // Essayer de masquer l'overlay même en cas d'erreur
    setTimeout(() => {
      hideLoadingOverlay();
      showNotification(
        'Application chargée en mode limité. Certaines fonctionnalités peuvent être indisponibles.',
        'warning',
        false,
        { timer: 8000 }
      );
    }, 2000);
    
    return false;
  }
}


// Initialisation principale
(async () => {
  initLoadingElements();
  
  // Démarrer l'initialisation avec un léger délai pour lisser l'expérience
  setTimeout(async () => {
   /* if (!await initializeApp()) {*/
    
    
    /* Suite du code existant pour l'authentification et le chargement de la page...
    if (firebaseInitialized && auth) {
      try {
        const user = await waitForAuthState(auth); 
        const { isAuthenticated, userData } = await verifyAuthState(user);
        
        updateUIWithUserData(userData);
        
        // Mettre à jour le statut juste avant le chargement de la page
        updateLoadingStatus('Chargement de la page...', 'Préparation du contenu.', 'modules');
        
        const pageInitSuccess = await initializePage(currentPage || getCurrentPage(), isAuthenticated, userData);
        
        if (pageInitSuccess) {
          // Petit délai pour montrer le message de succès
          updateLoadingStatus('Prêt !', 'Redirection vers votre espace...', 'success');
          setTimeout(() => hideLoadingOverlay(), 1000);
          
          document.dispatchEvent(new CustomEvent('app:pageReady', {
            detail: { page: currentPage, isAuthenticated, userData, timestamp: Date.now() }
          }));
        } else {
          hideLoadingOverlay();
        }
      } catch (error) {
        // En cas d'erreur, masquer l'overlay et continuer
        hideLoadingOverlay();
        console.error('Erreur lors du chargement:', error);
      }
    } else {
      */// Mode sans authentification
      updateLoadingStatus('Chargement...', 'Préparation de l\'interface.', 'modules');
      const pageInitSuccess = await initializePage(currentPage || getCurrentPage(), false, null);
      
      if (pageInitSuccess) {
        setTimeout(() => hideLoadingOverlay(), 500);
      }
    //}
    
    // Événements et nettoyage...
    document.dispatchEvent(new CustomEvent('app:initialized', {
      detail: { timestamp: Date.now(), firebaseReady: firebaseInitialized, page: currentPage }
    }));

    window.addEventListener('beforeunload', () => {
      stopNetworkMonitoring();
    });

  }, 100); // Petit délai initial pour fluidité
})();