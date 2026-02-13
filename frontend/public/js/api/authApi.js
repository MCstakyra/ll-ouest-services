/**
 * @file authApi.js
 * @description Gestion des appels API pour l'authentification dans L&L Ouest Services avec Firebase Auth.
 * Récupère dynamiquement les configurations Firebase via l'endpoint /api/config pour éviter l'exposition des clés.
 * Gère l'inscription, la connexion, la déconnexion, la vérification de token, l'envoi d'emails de vérification et de réinitialisation,
 * ainsi que la gestion des notifications push avec un modal personnalisé pour demander la permission.
 * Intègre une gestion d'erreurs optimisée avec handleApiError sans diagnostics ni retries, et supporte des icônes SVG personnalisées.
 * Toutes les opérations post-endpoint (comme le nettoyage du formulaire ou la mise à jour de l'UI) sont passées en paramètres
 * et exécutées avant les redirections pour garantir leur exécution. Les redirections utilisent la racine /pages/... conformément aux spécifications.
 * @module api/authApi
 * @version 1.3.0
 * @author L&L Ouest Services Team
 * @lastUpdated 2025-09-26
 * @license MIT
 * @dependencies Firebase Auth v12.1.0, Firebase Messaging v12.1.0, SweetAlert2, Utils.js, EmailTemplates.js
 * @changelog
 * - v1.3.0: Ajout de la gestion des opérations post-endpoint passées en paramètres pour exécution avant redirection.
 *   Suppression des opérations asynchrones après les appels API pour éviter les exécutions partielles.
 *   Mise à jour des redirections pour utiliser /pages/... conformément à authService.js.
 *   Ajout de JSDoc ultra complets avec casts de type stricts.
 *   Optimisation des validations et des logs pour une traçabilité maximale.
 *   Gestion des cas d'expiration de code avec renvoi automatique (aligné sur authService.js).
 * - v1.2.0: Amélioration du design de showApiErrorDialog avec animations fluides, boutons SVG pour actions et signalement d'erreur.
 *   Changement du signalement d'erreur en bouton stylé avec SVG au lieu d'un lien simple.
 *   Ajout de SVG personnalisés pour les actions dans handleApiError et intégration dans le modal.
 *   Mise à jour des métadonnées complètes du fichier.
 *   Optimisation des validations et logs pour une meilleure traçabilité.
 * - v1.1.0: Ajout de gestion séquentielle bloquante pour FCM Token lors de l'inscription.
 * - v1.0.0: Version initiale avec intégration Firebase et backend.
 */

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithEmailLink,
  isSignInWithEmailLink,
  signOut,
  onAuthStateChanged,
} from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js';
import { getMessaging, getToken } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-messaging.js';
import emailTemplates from '../mail/emailTemplates.js';
import {
  showNotification,
  validateInput,
  getStoredToken,
  setStoredToken,
  clearStoredToken,
  handleApiError,
  getAuthErrorMessage,
  clearUserCache,
  initializeFirebase,
  getFirebaseConfig,
  apiFetch,
  fetchLogoBase64,
  invalidateEmailCache,
  showSuccessSignUp,
  showSuccessDialog,
  getCachedUserData,
} from '../modules/utils.js';
import { loadUserData, updateUIWithUserData } from '../loadData.js';
import api from '../api.js';

/**
 * @constant {string} company - Nom de l'entreprise.
 */
const company = 'L&L Ouest Services';

/**
 * @constant {string} supportPhone - Numéro de téléphone du support.
 */
const supportPhone = '+33 7 56 98 45 12';

/**
 * @constant {string} website - URL du site web de l'entreprise.
 */
const website = 'https://llouestservices.fr';

/**
 * @constant {number} currentYear - Année courante.
 */
const currentYear = new Date().getFullYear();

/**
 * @constant {string} logoBase64 - Logo de l'entreprise en base64.
 */
const logoBase64 = fetchLogoBase64();

/**
 * @type {Object.<string, any>} firebaseConfig - Configuration Firebase globale.
 */
let firebaseConfig = {};

/**
 * @type {string} VAPID_KEY - Clé VAPID pour les notifications push.
 */
let VAPID_KEY = '';

/**
 * @type {Object|null} app - Instance de l'application Firebase.
 */
let app = null;

/**
 * @type {Object|null} auth - Instance de l'authentification Firebase.
 */
let auth = null;

/**
 * @type {Object|null} messaging - Instance de Firebase Messaging.
 */
let messaging = null;

/**
 * @type {boolean} signupNotificationPermissionGranted - État de la permission de notification pour l'inscription en cours.
 */
let signupNotificationPermissionGranted = false;

/**
 * Récupère les configurations Firebase depuis l'endpoint /api/config.
 * @async
 * @function fetchFirebaseConfig
 * @returns {Promise<void>}
 * @throws {Error} Si la récupération des configurations échoue.
 */
async function fetchFirebaseConfig() {
  try {
    app = await initializeFirebase();
    firebaseConfig = await getFirebaseConfig();
    VAPID_KEY = firebaseConfig.vapidKey || '';

    auth = getAuth(app);
    console.log('✅ Firebase Auth initialisé avec succès');

    try {
      messaging = getMessaging(app);
      console.log('✅ Firebase Messaging initialisé avec succès');
    } catch (error) {
      console.warn('⚠️ Notifications push désactivées (Firebase Messaging non initialisé):', error.message);
      messaging = null;
    }
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des configurations Firebase:', error);
    throw await handleApiError(error, 'Impossible de charger les configurations Firebase', {
      context: 'Initialisation Firebase',
      sourceContext: 'fetch-config',
      isCritical: true,
      iconSvg: `
        <svg class="w-12 h-12 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      `,
      actions: [
        {
          text: 'Réessayer',
          href: window.location.href,
          class: 'bg-ll-blue hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-Cinzel shadow-md hover:shadow-lg transition-all duration-300',
          svg: `<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>`,
        },
      ],
    });
  }
}

/**
 * Réinitialise l'état de la permission de notification pour une nouvelle tentative d'inscription.
 * @function resetSignupNotificationState
 */
function resetSignupNotificationState() {
  signupNotificationPermissionGranted = false;
  localStorage.removeItem('notificationPermissionAsked');
  console.log('État de la permission de notification réinitialisé pour nouvelle inscription');
}

/**
 * Affiche un modal SweetAlert2 personnalisé pour demander la permission de notification.
 * @async
 * @function showNotificationPermissionModalSwal
 * @returns {Promise<NotificationPermission>} Résultat de la permission ('granted', 'denied', ou 'default').
 */
async function showNotificationPermissionModalSwal() {
  if (signupNotificationPermissionGranted !== false) {
    const currentPermission = Notification.permission;
    if (currentPermission === 'granted') return 'granted';
    if (currentPermission === 'denied') return 'denied';
  }

  if (localStorage.getItem('notificationPermissionAsked')) {
    const currentPermission = Notification.permission;
    if (currentPermission === 'granted') return 'granted';
    if (currentPermission === 'denied') return 'denied';
  }

  const htmlContent = `
    <div class="relative overflow-hidden bg-ll-white dark:bg-ll-black rounded-3xl shadow-2xl p-6 max-w-4xl mx-auto border border-slate-200/50 dark:border-slate-700/50 font-Cinzel">
      <div class="absolute inset-0 bg-gradient-to-br from-ll-blue/10 to-indigo-50/10 dark:from-slate-800/30 dark:to-ll-blue/30 rounded-3xl" aria-hidden="true"></div>
      <div class="relative z-10 flex flex-col items-center text-center space-y-6">
        <div class="flex items-center justify-center space-x-8 w-full">
          <div class="relative p-0 bg-ll-white/90 dark:bg-ll-black/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 dark:border-slate-600/50">
            <img src="/assets/images/logo.png" alt="L&L Ouest Services Logo" class="h-10 rounded-xl w-auto">
          </div>
          <div class="relative p-4 bg-gradient-to-r from-ll-blue to-indigo-600 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" class="h-8 w-8">
              <path fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" d="M16 16l-4 4 4 4M32 32l4-4-4-4"/>
              <circle cx="24" cy="24" r="16" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="100" class="animate-spin-slow"/>
            </svg>
          </div>
          <div class="relative p-3 bg-ll-white/90 dark:bg-ll-black/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 dark:border-slate-600/50">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" class="h-10 w-10 text-ll-blue dark:text-blue-400">
              <path fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" d="M24 40c-2.21 0-4-1.79-4-4h8c0 2.21-1.79 4-4 4zM20 32V16c0-6.63 5.37-12 12-12s12 5.37 12 12v16"/>
              <circle cx="24" cy="24" r="8" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="50" class="animate-pulse"/>
            </svg>
          </div>
        </div>
        <div class="space-y-3">
          <h2 class="text-3xl font-bold text-ll-black dark:text-ll-white leading-tight font-cinzel">Activez vos notifications</h2>
          <div class="h-px w-24 bg-gradient-to-r from-ll-blue to-indigo-600 mx-auto"></div>
          <p class="text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed text-base">Restez informé en temps réel avec L&L Ouest Services. Sécurité, opportunités et organisation optimisée.</p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-5xl">
          <div class="group relative bg-ll-white dark:bg-ll-black rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-500 hover:-translate-y-1 border border-slate-100 dark:border-slate-700">
            <div class="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div class="relative z-10">
              <div class="flex justify-center mb-4">
                <div class="p-3 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" class="h-8 w-8 text-green-600 dark:text-green-400">
                    <circle cx="24" cy="24" r="18" fill="none" stroke="currentColor" stroke-width="2"/>
                    <path fill="none" stroke="currentColor" stroke-width="2" d="M16 24l4 4 8-8"/>
                  </svg>
                </div>
              </div>
              <h3 class="text-lg font-semibold text-ll-black dark:text-ll-white mb-3 text-center font-cinzel">Sécurité</h3>
              <p class="text-gray-600 dark:text-gray-300 text-sm leading-relaxed text-center">Confirmations immédiates de vos comptes et mises à jour de profil en temps réel</p>
            </div>
            <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-b-xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left"></div>
          </div>
          <div class="group relative bg-ll-white dark:bg-ll-black rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-500 hover:-translate-y-1 border border-slate-100 dark:border-slate-700">
            <div class="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-amber-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div class="relative z-10">
              <div class="flex justify-center mb-4">
                <div class="p-3 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" class="h-8 w-8 text-orange-600 dark:text-orange-400">
                    <circle cx="24" cy="24" r="18" fill="none" stroke="currentColor" stroke-width="2"/>
                    <path fill="none" stroke="currentColor" stroke-width="2" d="M12 24l8 8 12-12"/>
                  </svg>
                </div>
              </div>
              <h3 class="text-lg font-semibold text-ll-black dark:text-ll-white mb-3 text-center font-cinzel">Opportunités</h3>
              <p class="text-gray-600 dark:text-gray-300 text-sm leading-relaxed text-center">Alertes personnalisées sur les promotions et nouveaux services exclusifs</p>
            </div>
            <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-b-xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left"></div>
          </div>
          <div class="group relative bg-ll-white dark:bg-ll-black rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-500 hover:-translate-y-1 border border-slate-100 dark:border-slate-700">
            <div class="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-violet-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div class="relative z-10">
              <div class="flex justify-center mb-4">
                <div class="p-3 bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-900/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" class="h-8 w-8 text-purple-600 dark:text-purple-400">
                    <circle cx="24" cy="24" r="18" fill="none" stroke="currentColor" stroke-width="2"/>
                    <path fill="none" stroke="currentColor" stroke-width="2" d="M24 16v12h8"/>
                  </svg>
                </div>
              </div>
              <h3 class="text-lg font-semibold text-ll-black dark:text-ll-white mb-3 text-center font-cinzel">Organisation</h3>
              <p class="text-gray-600 dark:text-gray-300 text-sm leading-relaxed text-center">Rappels intelligents pour vos rendez-vous et échéances importantes</p>
            </div>
            <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-violet-500 rounded-b-xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left"></div>
          </div>
        </div>
        <div class="pt-4 border-t border-gray-200/30 dark:border-gray-700/50 w-full text-xs text-gray-500 dark:text-gray-400 text-center">
          <div class="flex flex-wrap justify-center items-center gap-3">
            <span class="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-4 h-4">
                <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              Conforme RGPD
            </span>
            <span class="text-gray-300 dark:text-gray-600">•</span>
            <span class="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-4 h-4">
                <path fill="none" stroke="currentColor" stroke-width="2" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              100% sécurisé
            </span>
          </div>
        </div>
      </div>
    </div>
  `;

  try {
    const result = await Swal.fire({
      html: htmlContent,
      width: 'auto',
      padding: '0',
      showCancelButton: true,
      confirmButtonText: 'Activer les notifications',
      cancelButtonText: 'Plus tard',
      customClass: {
        popup: 'rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 bg-ll-white dark:bg-ll-black',
        confirmButton: 'bg-gradient-to-r from-ll-blue to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 font-Cinzel',
        cancelButton: 'bg-ll-white dark:bg-ll-black hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-8 py-3 rounded-xl font-medium border border-gray-300 dark:border-gray-600 shadow-sm transition-all duration-300 font-Cinzel',
        htmlContainer: 'text-gray-600 dark:text-gray-300 p-0 !m-0 bg-transparent',
      },
      buttonsStyling: true,
      reverseButtons: false,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showCloseButton: false,
      focusConfirm: true,
      backdrop: 'rgba(0, 0, 0, 0.5)',
      didOpen: () => {
        const popup = Swal.getPopup();
        popup.style.transform = 'scale(0.8) rotateX(10deg)';
        popup.style.opacity = '0';
        setTimeout(() => {
          popup.style.transition = 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
          popup.style.transform = 'scale(1) rotateX(0deg)';
          popup.style.opacity = '1';
        }, 10);
      },
    });

    localStorage.setItem('notificationPermissionAsked', 'true');

    if (result.isConfirmed) {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          signupNotificationPermissionGranted = true;
        }
        return permission;
      } catch (error) {
        console.error('Erreur lors de la demande de permission:', error);
        return 'default';
      }
    } else if (result.isDismissed && result.dismiss === Swal.DismissReason.cancel) {
      signupNotificationPermissionGranted = false;
      return 'denied';
    } else {
      signupNotificationPermissionGranted = false;
      return 'default';
    }
  } catch (swalError) {
    console.error('Erreur modal SweetAlert:', swalError);
    return 'default';
  }
}

/**
 * Récupère un FCM Token valide pour les notifications push.
 * @async
 * @function getFcmToken
 * @param {boolean} [isCritical=false] - Si true, bloquant pour l'inscription.
 * @returns {Promise<string|null>} Le FCM token ou null si impossible.
 */
async function getFcmToken(isCritical = false) {
  if (!messaging) {
    console.warn('Firebase Messaging non disponible - Notifications désactivées');
    return null;
  }

  const currentPermission = Notification.permission;
  if (currentPermission === 'granted') {
    console.log('Permission de notification déjà accordée');
    return await generateToken();
  }

  if (currentPermission === 'denied') {
    console.warn('Permission de notification refusée - Pas de notifications push');
    return null;
  }

  if (currentPermission === 'default') {
    try {
      const permission = await showNotificationPermissionModalSwal();
      if (permission === 'granted') {
        return await generateToken();
      } else {
        console.warn('Permission de notification refusée par l\'utilisateur');
        return null;
      }
    } catch (error) {
      console.error('Erreur modal permission:', error);
      if (Notification.permission === 'granted') {
        return await generateToken();
      }
      return null;
    }
  }

  return null;
}

/**
 * Génère le token FCM une fois la permission accordée.
 * @async
 * @function generateToken
 * @returns {Promise<string|null>} Le token FCM ou null si erreur.
 */
async function generateToken() {
  try {
    let registration;
    try {
      registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
        scope: '/firebase-cloud-messaging-push-scope',
        updateViaCache: 'none',
      });
      console.log('Service Worker enregistré:', registration.scope);
    } catch (swError) {
      console.error('Erreur enregistrement Service Worker:', swError);
      registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('Service Worker enregistré (scope par défaut):', registration.scope);
    }

    const token = await Promise.race([
      getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration,
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout génération token')), 10000)
      ),
    ]);

    console.log('FCM Token généré avec succès:', token ? `${token.substring(0, 20)}...` : 'Token vide');
    return token || null;
  } catch (error) {
    console.error('Erreur génération FCM Token:', error);
    if (error.message.includes('messaging/permission-blocked')) {
      console.warn('Notifications bloquées par le navigateur');
    } else if (error.message.includes('messaging/registration-error')) {
      console.warn('Erreur enregistrement Service Worker');
    }
    return null;
  }
}

/**
 * Attend l'état d'authentification Firebase.
 * @async
 * @function waitForAuthState
 * @returns {Promise<Object|null>} Utilisateur courant ou null si non authentifié.
 */
export async function waitForAuthState() {
  return new Promise((resolve, reject) => {
    if (!auth) {
      reject(new Error('Firebase Auth non initialisé'));
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    }, (error) => {
      unsubscribe();
      reject(new Error(getAuthErrorMessage(error) || 'Erreur lors de la vérification de l\'état d\'authentification'));
    });
  });
}

/**
 * Valide les données d'inscription.
 * @function validateSignUpData
 * @param {Object} userData - Données de l'utilisateur.
 * @param {string} userData.email - Adresse email.
 * @param {string} userData.password - Mot de passe.
 * @param {string} userData.name - Nom de l'utilisateur.
 * @param {string} userData.phone - Numéro de téléphone.
 * @param {string} [userData.street] - Rue.
 * @param {string} [userData.city] - Ville.
 * @param {string} [userData.postalCode] - Code postal.
 * @param {string} [userData.country] - Pays.
 * @param {string} [userData.fcmToken] - Token FCM.
 * @param {string} [userData.role] - Rôle de l'utilisateur.
 * @returns {boolean} True si valide, sinon lance une erreur.
 * @throws {Error} Si les données sont invalides.
 */
function validateSignUpData(userData) {
  const schema = {
    email: { type: 'string', required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    password: { type: 'string', required: true, minLength: 8, maxLength: 50 },
    name: { type: 'string', required: true, minLength: 2, maxLength: 100 },
    phone: { type: 'string', required: true, pattern: /^\+\d{1,3}[\s\d\-]{4,20}$/ },
    street: { type: 'string', required: false, minLength: 3, maxLength: 255 },
    city: { type: 'string', required: false, minLength: 2, maxLength: 100 },
    postalCode: { type: 'string', required: false, pattern: /^\d{5}$/ },
    country: { type: 'string', required: false, minLength: 2, default: 'France' },
    fcmToken: { type: 'string', required: false },
    role: { type: 'string', required: false, enum: ['client', 'provider', 'admin'], default: 'client' },
  };
  const { error } = validateInput(userData, schema);
  if (error) {
    showNotification(`Données d'inscription invalides : ${error.details.map(d => d.message).join(', ')}`, 'error', false);
    throw new Error('Données d\'inscription invalides');
  }
  return true;
}

/**
 * Valide les données de connexion.
 * @function validateSignInData
 * @param {Object} credentials - Identifiants de connexion.
 * @param {string} credentials.email - Adresse email.
 * @param {string} credentials.password - Mot de passe.
 * @param {string} [credentials.fcmToken] - Token FCM.
 * @returns {boolean} True si valide, sinon lance une erreur.
 * @throws {Error} Si les données sont invalides.
 */
function validateSignInData(credentials) {
  const schema = {
    email: { type: 'string', required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    password: { type: 'string', required: true },
    fcmToken: { type: 'string', required: false },
  };
  const { error } = validateInput(credentials, schema);
  if (error) {
   showNotification(`Identifiants invalides : ${error.details.map(d => d.message).join(', ')}`, 'error', false);
    throw new Error('Identifiants invalides');
  }
  return true;
}

/**
 * Valide les données d'email.
 * @function validateEmailData
 * @param {Object} data - Données de l'email.
 * @param {string} data.email - Adresse email.
 * @param {string} data.name - Nom de l'utilisateur.
 * @returns {boolean} True si valide, sinon lance une erreur.
 * @throws {Error} Si les données sont invalides.
 */
function validateEmailData(data) {
  const schema = {
    email: { type: 'string', required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    name: { type: 'string', required: true, minLength: 2, maxLength: 100 },
  };
  const { error } = validateInput(data, schema);
  if (error) {
    showNotification(`Données d'email invalides : ${error.details.map(d => d.message).join(', ')}`, 'error', false);
    throw new Error('Données d\'email invalides');
  }
  return true;
}

/**
 * Valide les données de changement d'email.
 * @function validateChangeEmailData
 * @param {Object} data - Données de changement d'email.
 * @param {string} data.currentEmail - Email actuel.
 * @param {string} data.name - Nom de l'utilisateur.
 * @returns {boolean} True si valide, sinon lance une erreur.
 * @throws {Error} Si les données sont invalides.
 */
function validateChangeEmailData(data) {
  const schema = {
    currentEmail: { type: 'string', required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    name: { type: 'string', required: true, minLength: 2, maxLength: 100 },
  };
  const { error } = validateInput(data, schema);
  if (error) {
    showNotification(`Données de changement d'email invalides : ${error.details.map(d => d.message).join(', ')}`, 'error', false);
    throw new Error('Données de changement d\'email invalides');
  }
  return true;
}

/**
 * Valide les données pour la confirmation du nouvel email.
 * @function validateConfirmNewEmailData
 * @param {Object} data - Données à valider.
 * @param {string} data.newEmail - Nouvel email.
 * @param {string} data.name - Nom de l'utilisateur.
 * @throws {Error} Si les données sont invalides.
 */
function validateConfirmNewEmailData(data) {
  const schema = {
    newEmail: { type: 'string', required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    name: { type: 'string', required: true, minLength: 2, maxLength: 100 },
  };
  const { error } = validateInput(data, schema);
  if (error) {
    showNotification(`Données de changement d'email invalides : ${error.details.map(d => d.message).join(', ')}`, 'error', false);
    throw new Error('Données de changement d\'email invalides');
  }
  return true;
}

/**
 * Valide les données de lien email.
 * @function validateEmailLinkData
 * @param {Object} data - Données du lien email.
 * @param {string} data.email - Adresse email.
 * @param {string} data.link - Lien de connexion.
 * @returns {boolean} True si valide, sinon lance une erreur.
 * @throws {Error} Si les données sont invalides.
 */
function validateEmailLinkData(data) {
  const schema = {
    email: { type: 'string', required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    link: { type: 'string', required: true, pattern: /^https?:\/\/.+/ },
  };
  const { error } = validateInput(data, schema);
  if (error) {
    showNotification(`Données de lien email invalides : ${error.details.map(d => d.message).join(', ')}`, 'error', false);
    throw new Error('Données de lien email invalides');
  }
  return true;
}

/**
 * Valide les données de code.
 * @function validateCodeData
 * @param {Object} data - Données du code.
 * @param {string} data.email - Adresse email.
 * @param {string} data.code - Code à 6 chiffres.
 * @returns {boolean} True si valide, sinon lance une erreur.
 * @throws {Error} Si les données sont invalides.
 */
function validateCodeData(data) {
  const schema = {
    email: { type: 'string', required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    code: { type: 'string', required: true, pattern: /^\d{6}$/ },
  };
  const { error } = validateInput(data, schema);
  if (error) {
    showNotification(`Données de code invalides : ${error.details.map(d => d.message).join(', ')}`, 'error', false);
    throw new Error('Données de code invalides');
  }
  return true;
}

fetchFirebaseConfig().catch(error => {
  console.error('Échec de l\'initialisation des configurations Firebase:', error);
  showNotification('Erreur lors du chargement des configurations', 'error', false);
});

/**
 * API d'authentification pour gérer les opérations liées à Firebase Auth et le backend.
 * @namespace authApi
 */
const authApi = {
  /**
   * Inscrit un nouvel utilisateur avec Firebase et enregistre dans le backend.
   * Exécute les opérations post-endpoint passées en paramètres avant redirection.
   * @async
   * @function signUp
   * @param {Object} userData - Données de l'utilisateur.
   * @param {string} userData.email - Adresse email.
   * @param {string} userData.password - Mot de passe.
   * @param {string} userData.name - Nom de l'utilisateur.
   * @param {string} userData.phone - Numéro de téléphone.
   * @param {string} [userData.street] - Rue.
   * @param {string} [userData.city] - Ville.
   * @param {string} [userData.postalCode] - Code postal.
   * @param {string} [userData.country] - Pays.
   * @param {string} [userData.role] - Rôle de l'utilisateur.
   * @param {Array<Function>} [postOperations=[]] - Liste de fonctions à exécuter après l'inscription.
   * @returns {Promise<Object>} Données de l'utilisateur créé et token JWT.
   * @throws {Error} En cas d'erreur d'inscription.
   */
  async signUp(userData, postOperations = []) {
    let firebaseUser = null;
    let shouldResetNotificationState = true;

    try {
      if (!auth) {
        throw new Error('Firebase Auth non initialisé. Veuillez réessayer.');
      }

      // Étape 1: Validation des données
      console.log('🔄 Étape 1: Validation des données...');
      validateSignUpData(userData);
      const { email, password, name, phone, street, city, postalCode, country, role } = userData;
      console.log('✅ Validation réussie');

      // Étape 2: Obtention du FCM Token
      console.log('🔄 Étape 2: Demande de permission notifications...');
      const fcmToken = await getFcmToken(true);
      if (!fcmToken && Notification.permission !== 'granted') {
        shouldResetNotificationState = false;
        throw new Error('Les notifications sont obligatoires pour vous inscrire. Veuillez activer les notifications pour continuer.');
      }
      console.log('✅ Token FCM obtenu:', fcmToken ? 'Oui' : 'Non');

      // Étape 3: Création de l'utilisateur dans Firebase Auth
      console.log('🔄 Étape 3: Création utilisateur Firebase...');
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        firebaseUser = userCredential.user;
        console.log('✅ Utilisateur Firebase créé:', firebaseUser.uid);
      } catch (firebaseError) {
        if (firebaseError.code === 'auth/email-already-in-use') {
          throw new Error('Cet email est déjà utilisé. Essayez de vous connecter ou réinitialisez votre mot de passe.');
        }
        throw firebaseError;
      }

      // Étape 4: Obtention du token Firebase ID
      console.log('🔄 Étape 4: Récupération token Firebase...');
      let firebaseToken;
      try {
        firebaseToken = await firebaseUser.getIdToken();
        console.log('✅ Token Firebase obtenu');
      } catch (error) {
        throw await handleApiError(error, 'Erreur lors de la récupération du token Firebase', {
          context: 'Inscription',
          sourceContext: 'inscription',
          isCritical: false,
          iconSvg: `
            <svg class="w-12 h-12 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          `,
          actions: [
            {
              text: 'Réessayer',
              href: window.location.href,
              class: 'bg-ll-blue hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-Cinzel shadow-md hover:shadow-lg transition-all duration-300',
              svg: `<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>`,
            },
          ],
        });
      }

      // Étape 5: Enregistrement backend
      console.log('🔄 Étape 5: Enregistrement backend...');
      const address = {
        street: street || '',
        city: city || '',
        postalCode: postalCode || '',
        country: country || 'France',
      };
      const response = await apiFetch('/auth/signup', 'POST', {
        email,
        name,
        phone,
        address,
        firebaseToken,
        fcmToken,
        role: role || 'client',
      }, false, { context: 'Inscription' });
      console.log('✅ Enregistrement backend réussi');

      // Étape 6: Envoi email de vérification
      console.log('🔄 Étape 6: Envoi email de vérification...');
      try {
        const responseverify = await apiFetch('/auth/verify-email', 'POST', {
          email,
          name,
          htmlTemplate: emailTemplates.verification({
            name,
            code: '{{code}}',
            logoBase64,
          }),
        }, false, { context: 'Inscription' });
        console.log('✅ Email de vérification envoyé');

        // Étape 7: Exécution des opérations post-endpoint
        console.log('🔄 Étape 7: Exécution des opérations post-endpoint...');
        for (const operation of postOperations) {
          try {
            await operation();
            console.log('✅ Opération post-endpoint exécutée:', operation.name || 'anonyme');
          } catch (opError) {
            console.error('❌ Erreur lors de l\'exécution de l\'opération post-endpoint:', opError);
          }
        }
        console.log('✅ Toutes les opérations post-endpoint exécutées');

        // Étape 8: Préparation de la redirection
        localStorage.setItem('codeCheckType', 'email-verification');
        localStorage.setItem('codeCheckEmail', email);
        setStoredToken(response.data.token, response.data.user.role || 'client');
        console.log('✅ Token JWT stocké');
        invalidateEmailCache();
        const loadedUserData = await loadUserData();
        updateUIWithUserData(loadedUserData);

        await showNotification('Inscription réussie ! Vérifiez votre email pour le code de confirmation.', 'success');
        await showSuccessSignUp(name);

        console.log('🎉 Inscription terminée avec succès');

        // Étape 9: Redirection
        setTimeout(() => {
          window.location.href = responseverify.redirect;
        }, 3000);

        return response.data;
      } catch (verificationError) {
        console.error('❌ Échec envoi email de vérification:', verificationError);
        // Exécuter les opérations post-endpoint même en cas d'échec de l'email
        for (const operation of postOperations) {
          try {
            await operation();
            console.log('✅ Opération post-endpoint exécutée:', operation.name || 'anonyme');
          } catch (opError) {
            console.error('❌ Erreur lors de l\'exécution de l\'opération post-endpoint:', opError);
          }
        }
        setStoredToken(response.data.token, response.data.user.role || 'client');
        console.log('✅ Token JWT stocké malgré échec email');
        invalidateEmailCache();
        const loadedUserData = await loadUserData();
        updateUIWithUserData(loadedUserData);
        showNotification('Inscription réussie, mais l\'email de vérification n\'a pas pu être envoyé. Vous pouvez réessayer depuis le tableau de bord.', 'warning');
        await showSuccessSignUp(name);

        setTimeout(() => {
          window.location.href = '/pages/dashboard.html';
        }, 3000);
        return response.data;
      }
    } catch (error) {
      console.error('❌ Erreur inscription:', error);
      if (firebaseUser) {
        try {
          await firebaseUser.delete();
          console.log('🧹 Utilisateur Firebase supprimé après échec');
        } catch (deleteError) {
          console.error('❌ Échec suppression utilisateur Firebase:', deleteError);
        }
      }
      Swal.close();
      clearStoredToken();
      if (shouldResetNotificationState) {
        resetSignupNotificationState();
        console.log('🔄 État notifications réinitialisé pour nouvelle tentative');
      }

      let errorMessage = error.backendMessage || error.message || 'Erreur lors de l\'inscription';
      let actions = [];

      const backendMsg = typeof error.backendMessage === 'string'
        ? error.backendMessage
        : (typeof error.backendMessage === 'object' && error.backendMessage !== null
          ? JSON.stringify(error.backendMessage)
          : '');

      if (
        error.message.includes('email-already-in-use') ||
        backendMsg.includes('email-already-in-use')
      ) {
        errorMessage = 'Cet email est déjà utilisé. Essayez de vous connecter ou réinitialisez votre mot de passe.';
        actions = [
          {
            text: 'Se connecter',
            href: '/pages/auth/signin.html',
            class: 'bg-ll-blue hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-Cinzel shadow-md hover:shadow-lg transition-all duration-300',
            svg: `<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>`,
          },
          {
            text: 'Réinitialiser mot de passe',
            href: '/pages/auth/password-reset.html',
            class: 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-Cinzel shadow-md hover:shadow-lg transition-all duration-300',
            svg: `<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>`,
          },
        ];
      } else if (error.reason === 'timeout') {
        errorMessage = 'Délai d\'attente dépassé. Veuillez réessayer.';
        actions = [
          {
            text: 'Réessayer',
            href: window.location.href,
            class: 'bg-ll-blue hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-Cinzel shadow-md hover:shadow-lg transition-all duration-300',
            svg: `<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>`,
          },
        ];
      } else if (error.reason === 'missing_token') {
        errorMessage = 'Token d\'authentification manquant. Veuillez vous reconnecter.';
        actions = [
          {
            text: 'Se reconnecter',
            href: '/pages/auth/signin.html',
            class: 'bg-ll-blue hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-Cinzel shadow-md hover:shadow-lg transition-all duration-300',
            svg: `<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>`,
          },
        ];
      }

      throw await handleApiError(error, errorMessage, {
        context: 'Inscription',
        sourceContext: 'inscription',
        isCritical: error.isCritical || false,
        iconSvg: `
          <svg class="w-12 h-12 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        `,
        actions,
      });
    }
  },


  /**
 * Fonction unifiée pour gérer toutes les actions post-connexion de manière sûre et séquentielle.
 * Exécutée uniquement après succès backend, sans risque de boucle (pas d'appels API récursifs).
 * @async
 * @function handlePostSignInSuccess
 * @param {Object} responseData - Les données de réponse du backend (token, user, redirect).
 * @description Met en cache les données utilisateur, met à jour l'UI, affiche les notifications et dialogues,
 * et redirige. Exportée pour réutilisation si nécessaire.
 * @returns {Promise<void>}
 * @throws {Error} En cas d'erreur critique (mais gérée silencieusement pour ne pas interrompre la redirection).
 */
async handlePostSignInSuccess(responseData) {
  try {
    setStoredToken(responseData.token, responseData.user.role || 'client');
    console.log('✅ Token et rôle stockés avec succès');

   cacheUserData(responseData.user);
    console.log('✅ Données utilisateur mises en cache');

    Swal.close();

    showNotification('Connexion réussie ! 🎉', 'success');

    updateUIWithUserData(responseData.user);
    console.log('✅ UI mise à jour avec les données utilisateur');

    await showSuccessDialog(responseData.user);
    console.log('✅ Dialogue de succès affiché');

    setTimeout(() => {
      window.location.href = responseData.redirect || '/dashboard.html';
    }, 2000);
    console.log('✅ Redirection planifiée');

  } catch (postError) {
    console.error('❌ Erreur lors des actions post-connexion:', postError);
    Swal.close();
    showNotification('Connexion réussie, mais erreur mineure lors de la finalisation.', 'warning');
    setTimeout(() => {
      window.location.href = '/dashboard.html';
    }, 1000);
  }
},

/**
 * Connecte un utilisateur avec email et mot de passe.
 * Gère entièrement les opérations post-endpoint en interne via handlePostSignInSuccess.
 * @async
 * @function signIn
 * @param {Object} credentials - Identifiants de connexion.
 * @param {string} credentials.email - Adresse email.
 * @param {string} credentials.password - Mot de passe.
 * @returns {Promise<Object>} Données de l'utilisateur et token JWT (en cas de succès, mais redirection immédiate).
 * @throws {Error} En cas d'erreur de connexion (Firebase ou Backend).
 */
async signIn(credentials) {

  try {
    if (!auth) {
      throw new Error('Firebase Auth non initialisé. Veuillez réessayer.');
    }
    
    validateSignInData(credentials);
    const { email, password } = credentials;

    // Récupération optionnelle du FCM Token pour les notifications
    let fcmToken = null;
    try {
      fcmToken = await getFcmToken(false);
      if (!fcmToken) {
        console.warn('Aucun FCM Token généré - Connexion sans notifications push');
      }
    } catch (tokenError) {
      console.error('Erreur obtention FCM Token:', tokenError);
    }
    

    // 1. TENTATIVE DE CONNEXION FIREBASE
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    let firebaseToken;
    try {
      firebaseToken = await user.getIdToken();
    } catch (error) {
      await signOut(auth);
      // Erreur lors de la récupération du JWT (cas rare)
      throw await handleApiError(error, 'Erreur lors de la récupération du token Firebase', {
        context: 'Connexion',
        sourceContext: 'connexion',
        isCritical: false,
        // ✅ ACTIONS: Réessayer / Support
        iconSvg: `<svg class="w-12 h-12 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
        actions: [
          { text: 'Réessayer', href: window.location.href, class: 'bg-ll-blue hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-Cinzel shadow-md hover:shadow-lg transition-all duration-300', svg: `<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>`},
          { text: 'Contacter le support', href: 'mailto:contact@llouestservices.fr', class: 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-Cinzel shadow-md hover:shadow-lg transition-all duration-300', svg: `<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>`},
        ],
      });
    }

    // 2. CONNEXION AU BACKEND API
    try {
      const response = await apiFetch('/auth/signin', 'POST', {
        email,
        firebaseToken,
        fcmToken,
      }, false, { context: 'Connexion' });

      await this.handlePostSignInSuccess(response.data);

      return response.data;
    } catch (backendError) {
      // 2.1. Échec du Backend API - Nettoyage
      await signOut(auth);
      clearStoredToken();
      throw await handleApiError(backendError, 'Erreur lors de la connexion au backend', {
        context: 'Connexion',
        sourceContext: 'connexion',
        isCritical: false,
        iconSvg: `<svg class="w-12 h-12 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
        actions: [
          { text: 'Réessayer', href: window.location.href, class: 'bg-ll-blue hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-Cinzel shadow-md hover:shadow-lg transition-all duration-300', svg: `<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>`},
          { text: 'Contacter le support', href: 'mailto:contact@llouestservices.fr', class: 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-Cinzel shadow-md hover:shadow-lg transition-all duration-300', svg: `<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>`},
        ],
      });
    }
  } catch (error) {
    console.error('❌ Erreur connexion:', error);
    clearStoredToken();
    
    try { await signOut(auth); } catch(e) { /* ignore */ }
    Swal.close();
    
    const userMessage = getAuthErrorMessage(error) || 'Erreur lors de la connexion'; 
    const shouldShowReset = ['auth/invalid-credential', 'auth/wrong-password', 'auth/user-not-found'].includes(error.code);
    
    // ✅ ACTIONS: Réessayer / Réinitialiser (si pertinent) / Support
    const errorActions = [
      {
        text: 'Réessayer',
        href: window.location.href,
        class: 'bg-ll-blue hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-Cinzel shadow-md hover:shadow-lg transition-all duration-300',
        svg: `<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>`,
      },
      ...(shouldShowReset ? [{
        text: 'Réinitialiser mot de passe',
        href: '/pages/auth/password-reset.html',
        class: 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-Cinzel shadow-md hover:shadow-lg transition-all duration-300',
        svg: `<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>`,
      }] : []),
      {
        text: 'Contacter le support',
        href: 'mailto:contact@llouestservices.fr',
        class: 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-Cinzel shadow-md hover:shadow-lg transition-all duration-300',
        svg: `<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>`,
      },
    ];

    throw await handleApiError(error, userMessage, {
      context: 'Connexion',
      sourceContext: 'connexion',
      isCritical: false,
      iconSvg: `<svg class="w-12 h-12 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
      actions: errorActions,
    });
  }
},

  

  /**
   * Rafraîchit le token JWT.
   * Exécute les opérations post-endpoint avant redirection.
   * @async
   * @function refreshToken
   * @param {Array<Function>} [postOperations=[]] - Liste de fonctions à exécuter après le rafraîchissement.
   * @returns {Promise<Object>} Nouveau token JWT et rôle.
   * @throws {Error} En cas d'erreur de rafraîchissement.
   */
  async refreshToken(postOperations = []) {
    try {
      if (!auth) {
        throw new Error('Firebase Auth non initialisé. Veuillez réessayer.');
      }
      const user = await waitForAuthState();
      if (!user) {
        clearStoredToken();
        throw new Error('Aucun utilisateur connecté');
      }
      const firebaseToken = await user.getIdToken(true);

      const response = await apiFetch('/auth/refresh', 'POST', {
        firebaseToken,
      }, false, { context: 'Rafraîchissement Token' });

      // Exécution des opérations post-endpoint
      for (const operation of postOperations) {
        try {
          await operation();
          console.log('✅ Opération post-endpoint exécutée:', operation.name || 'anonyme');
        } catch (opError) {
          console.error('❌ Erreur lors de l\'exécution de l\'opération post-endpoint:', opError);
        }
      }

      setStoredToken(response.data.token, response.data.role || 'client');
      showNotification('Token rafraîchi avec succès.', 'success');
      return response.data;
    } catch (error) {
      clearStoredToken();
      await signOut(auth);
      throw await handleApiError(error, 'Erreur lors du rafraîchissement du token', {
        context: 'Rafraîchissement Token',
        sourceContext: 'refresh-token',
        isCritical: false,
        iconSvg: `
          <svg class="w-12 h-12 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        `,
        actions: [
          {
            text: 'Se reconnecter',
            href: '/pages/auth/signin.html',
            class: 'bg-ll-blue hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-Cinzel shadow-md hover:shadow-lg transition-all duration-300',
            svg: `<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>`,
          },
          {
            text: 'Contacter le support',
            href: 'mailto:contact@llouestservices.fr',
            class: 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-Cinzel shadow-md hover:shadow-lg transition-all duration-300',
            svg: `<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>`,
          },
        ],
      });
    }
  },

  /**
   * Déconnecte l'utilisateur.
   * Exécute les opérations post-endpoint avant redirection.
   * @async
   * @function signOut
   * @param {Array<Function>} [postOperations=[]] - Liste de fonctions à exécuter après la déconnexion.
   * @returns {Promise<void>}
   * @throws {Error} En cas d'erreur de déconnexion.
   */
  async signOut(postOperations = []) {
    let response;
    
    try {
      if (!auth) {
        throw new Error('Firebase Auth non initialisé. Veuillez réessayer.');
      }
      const user = await waitForAuthState();

      if (user) {
        const firebaseToken = await user.getIdToken();
      response = await apiFetch('/auth/signout', 'POST', {
          firebaseToken,
        }, true, { context: 'Déconnexion' });
      

      // Exécution des opérations post-endpoint
      for (const operation of postOperations) {
        try {
          await operation();
          console.log('✅ Opération post-endpoint exécutée:', operation.name || 'anonyme');
        } catch (opError) {
          console.error('❌ Erreur lors de l\'exécution de l\'opération post-endpoint:', opError);
        }
      }

      await signOut(auth);
      clearUserCache();
      clearStoredToken();
      showNotification('Déconnexion réussie.', 'success');

     Swal.close();
    showNotification('Déconnexion réussie.', 'success');
    setTimeout(() => {
      window.location.replace(response.redirect || '/index.html');
    }, 2000);
  }

    } catch (error) {
      clearStoredToken();
      await signOut(auth);
      throw await handleApiError(error, 'Erreur lors de la déconnexion', {
        context: 'Déconnexion',
        sourceContext: 'signout',
        isCritical: false,
        iconSvg: `
          <svg class="w-12 h-12 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        `,
        actions: [
          {
            text: 'Retour à l\'accueil',
            href: '/',
            class: 'bg-ll-blue hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-Cinzel shadow-md hover:shadow-lg transition-all duration-300',
            svg: `<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>`,
          },
          {
            text: 'Contacter le support',
            href: 'mailto:contact@llouestservices.fr',
            class: 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-Cinzel shadow-md hover:shadow-lg transition-all duration-300',
            svg: `<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>`,
          },
        ],
      });
    }
  },

  /**
   * Vérifie la validité du token Firebase.
   * Exécute les opérations post-endpoint avant redirection.
   * @async
   * @function verifyToken
   * @param {Array<Function>} [postOperations=[]] - Liste de fonctions à exécuter après la vérification.
   * @returns {Promise<Object>} Données de vérification du token.
   * @throws {Error} En cas d'erreur de vérification.
   */
  async verifyToken(postOperations = []) {
    try {
      if (!auth) {
        throw new Error('Firebase Auth non initialisé. Veuillez réessayer.');
      }
      const user = await waitForAuthState();
      if (!user) {
        throw new Error('Aucun utilisateur connecté');
      }
      const firebaseToken = await user.getIdToken();

      const response = await apiFetch('/auth/verify-token', 'POST', {
        firebaseToken,
      }, false, { context: 'Vérification Token' });

      // Exécution des opérations post-endpoint
      for (const operation of postOperations) {
        try {
          await operation();
          console.log('✅ Opération post-endpoint exécutée:', operation.name || 'anonyme');
        } catch (opError) {
          console.error('❌ Erreur lors de l\'exécution de l\'opération post-endpoint:', opError);
        }
      }

      return response.data;
    } catch (error) {
      clearStoredToken();
      await signOut(auth);
      throw await handleApiError(error, 'Erreur lors de la vérification du token', {
        context: 'Vérification Token',
        sourceContext: 'verify-token',
        isCritical: false,
        iconSvg: `
          <svg class="w-12 h-12 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        `,
        actions: [
          {
            text: 'Se reconnecter',
            href: '/pages/auth/signin.html',
            class: 'bg-ll-blue hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-Cinzel shadow-md hover:shadow-lg transition-all duration-300',
            svg: `<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>`,
          },
          {
            text: 'Contacter le support',
           href: 'mailto:contact@llouestservices.fr',
            class: 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-Cinzel shadow-md hover:shadow-lg transition-all duration-300',
            svg: `<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>`,
          },
        ],
      });
    }
  },

  /**
   * Envoie un email de vérification.
   * Exécute les opérations post-endpoint avant redirection.
   * @async
   * @function sendVerificationEmail
   * @param {Object} data - Données pour l'envoi de l'email.
   * @param {string} data.email - Adresse email.
   * @param {string} data.name - Nom de l'utilisateur.
   * @param {Array<Function>} [postOperations=[]] - Liste de fonctions à exécuter après l'envoi.
   * @returns {Promise<void>}
   * @throws {Error} En cas d'erreur d'envoi.
   */
  async sendVerificationEmail(data, postOperations = []) {
    try {
      validateEmailData(data);
      const { email, name , retry } = data;

      const user = await waitForAuthState();
      if (!user) {
        throw new Error('Aucun utilisateur connecté');
      }


      await apiFetch('/auth/verify-email', 'POST', {
        email,
        name,
        retry,
        htmlTemplate: emailTemplates.verification({
          name,
          code: '{{code}}',
          logoBase64,
        }),
      }, false, { context: 'Envoi Email Vérification' });

      // Exécution des opérations post-endpoint
      for (const operation of postOperations) {
        try {
          await operation();
          console.log('✅ Opération post-endpoint exécutée:', operation.name || 'anonyme');
        } catch (opError) {
          console.error('❌ Erreur lors de l\'exécution de l\'opération post-endpoint:', opError);
        }
      }

      localStorage.setItem('codeCheckType', 'email-verification');
      localStorage.setItem('codeCheckEmail', email);
      await showNotification('Email de vérification envoyé. Vérifiez votre boîte de réception.', 'success',false);

      setTimeout(() => {
        window.location.replace('/pages/auth/code-check.html');
      }, 2000);
    } catch (error) {
      throw await handleApiError(error, getAuthErrorMessage(error) || 'Erreur lors de l\'envoi de l\'email de vérification', {
        context: 'Envoi Email Vérification',
        sourceContext: 'send-verification-email',
        isCritical: false,
        iconSvg: `
          <svg class="w-12 h-12 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        `,
        actions: [
          {
            text: 'Réessayer',
            href: window.location.href,
            class: 'bg-ll-blue hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-Cinzel shadow-md hover:shadow-lg transition-all duration-300',
            svg: `<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>`,
          },
          {
            text: 'Contacter le support',
            href: 'mailto:contact@llouestservices.fr',
            class: 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-Cinzel shadow-md hover:shadow-lg transition-all duration-300',
            svg: `<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>`,
          },
        ],
      });
    }
  },


  /**
 * Envoie un code de vérification à l'email actuel pour initier le changement d'email.
 * Exécute les opérations post-endpoint avant redirection.
 * @async
 * @function changeEmail
 * @param {Object} data - Données pour la vérification de l'email actuel.
 * @param {string} data.currentEmail - Email actuel.
 * @param {string} data.name - Nom de l'utilisateur.
 * @param {boolean} [data.retry=false] - Renvoi de code
 * @param {Array<Function>} [postOperations=[]] - Liste de fonctions à exécuter après l'envoi.
 * @returns {Promise<void>}
 * @throws {Error} En cas d'erreur d'envoi.
 */
async changeEmail(data, postOperations = []) {
  try {
    validateChangeEmailData(data);
    const { currentEmail, name , retry } = data;

    const user = await waitForAuthState();
    if (!user) {
      throw new Error('Aucun utilisateur connecté');
    }

    if (user.email !== currentEmail) {
      throw new Error('L\'email actuel ne correspond pas à celui de l\'utilisateur connecté');
    }

    const firebaseToken = await user.getIdToken(true);

    const response = await apiFetch('/auth/request-new-email', 'POST', {
      email: currentEmail,
      name,
      retry,
      htmlTemplate: emailTemplates.emailChangeVerification({ 
        name, 
        logoBase64,
        code: '{{ code }}' 
      }),
    }, true, { context: 'Vérification Email Actuel' });

    // Exécution des opérations post-endpoint
    for (const operation of postOperations) {
      try {
        await operation();
        console.log('✅ Opération post-endpoint exécutée:', operation.name || 'anonyme');
      } catch (opError) {
        console.error('❌ Erreur lors de l\'exécution de l\'opération post-endpoint:', opError);
      }
    }

    Swal.close();
    setTimeout(() => {
      window.location.replace(response.redirect);
    }, 2000);
  } catch (error) {
    throw await handleApiError(error, getAuthErrorMessage(error) || 'Erreur lors de l\'envoi du code de vérification', {
      context: 'Vérification Email Actuel',
      sourceContext: 'change-email',
      isCritical: false,
      iconSvg: `
        <svg class="w-12 h-12 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      `,
      actions: [
        {
          text: 'Réessayer',
          href: window.location.href,
          class: 'bg-ll-blue hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-Cinzel shadow-md hover:shadow-lg transition-all duration-300',
          svg: `<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>`,
        },
        {
          text: 'Contacter le support',
          href: 'mailto:contact@llouestservices.fr',
          class: 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-Cinzel shadow-md hover:shadow-lg transition-all duration-300',
          svg: `<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>`,
        },
      ],
    });
  }
},


/**
 * Envoie un code de vérification au nouvel email pour finaliser le changement d'email.
 * Exécute les opérations post-endpoint avant redirection.
 * @async
 * @function confirmNewEmail
 * @param {Object} data - Données pour la confirmation du nouvel email.
 * @param {string} data.newEmail - Nouvel email.
 * @param {string} data.name - Nom de l'utilisateur.
 * @param {Array<Function>} [postOperations=[]] - Liste de fonctions à exécuter après l'envoi.
 * @returns {Promise<void>}
 * @throws {Error} En cas d'erreur d'envoi.
 */
async confirmNewEmail(data, postOperations = []) {
  try {
    validateConfirmNewEmailData(data);
    const { newEmail, name , retry} = data;

    const user = await waitForAuthState();
    if (!user) {
      throw new Error('Aucun utilisateur connecté');
    }

    const firebaseToken = await user.getIdToken(true);

    const response = await apiFetch('/auth/confirm-new-email', 'POST', {
      newEmail,
      name,
      retry,
      htmlTemplate: emailTemplates.emailChange({ name, newEmail, logoBase64 }),
    }, true, { context: 'Confirmation Nouvel Email' });

    // Exécution des opérations post-endpoint
    for (const operation of postOperations) {
      try {
        await operation();
        console.log('✅ Opération post-endpoint exécutée:', operation.name || 'anonyme');
      } catch (opError) {
        console.error('❌ Erreur lors de l\'exécution de l\'opération post-endpoint:', opError);
      }
    }

    Swal.close();
    setTimeout(() => {
      window.location.replace(response.redirect);
    }, 2000);
  } catch (error) {
    throw await handleApiError(error, getAuthErrorMessage(error) || 'Erreur lors de l\'envoi du code de confirmation', {
      context: 'Confirmation Nouvel Email',
      sourceContext: 'confirm-new-email',
      isCritical: false,
      iconSvg: `
        <svg class="w-12 h-12 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      `,
      actions: [
        {
          text: 'Réessayer',
          href: window.location.href,
          class: 'bg-ll-blue hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-Cinzel shadow-md hover:shadow-lg transition-all duration-300',
          svg: `<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>`,
        },
        {
          text: 'Contacter le support',
          href: 'mailto:contact@llouestservices.fr',
          class: 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-Cinzel shadow-md hover:shadow-lg transition-all duration-300',
          svg: `<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>`,
        },
      ],
    });
  }
},


  /**
   * Envoie un email de réinitialisation de mot de passe.
   * Exécute les opérations post-endpoint avant redirection.
   * @async
   * @function sendPasswordResetEmail
   * @param {Object} data - Données pour l'envoi de l'email.
   * @param {string} data.email - Adresse email.
   * @param {string} data.name - Nom de l'utilisateur.
   * @param {Array<Function>} [postOperations=[]] - Liste de fonctions à exécuter après l'envoi.
   * @returns {Promise<void>}
   * @throws {Error} En cas d'erreur d'envoi.
   */
  async sendPasswordResetEmail(data, postOperations = []) {
    try {
      validateEmailData(data);
      const { email, name } = data;


      const response = await apiFetch('/auth/reset-password', 'POST', {
        email,
        name,
        htmlTemplate: emailTemplates.resetPassword({
          name,
          code: '{{code}}',
          logoBase64,
        }),
      }, false, { context: 'Réinitialisation Mot de Passe' });

      // Exécution des opérations post-endpoint
      for (const operation of postOperations) {
        try {
          await operation();
          console.log('✅ Opération post-endpoint exécutée:', operation.name || 'anonyme');
        } catch (opError) {
          console.error('❌ Erreur lors de l\'exécution de l\'opération post-endpoint:', opError);
        }
      }

      localStorage.setItem('codeCheckType', 'password-reset');
      localStorage.setItem('codeCheckEmail', email);
      showNotification('Email de réinitialisation envoyé. Vérifiez votre boîte de réception.', 'success');

      setTimeout(() => {
        window.location.replace(response.redirect);
      }, 2000);
      
    } catch (error) {
      throw await handleApiError(error, getAuthErrorMessage(error) || 'Erreur lors de l\'envoi de l\'email de réinitialisation', {
        context: 'Réinitialisation Mot de Passe',
        sourceContext: 'send-password-reset-email',
        isCritical: false,
        iconSvg: `
          <svg class="w-12 h-12 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        `,
        actions: [
          {
            text: 'Réessayer',
            href: window.location.href,
            class: 'bg-ll-blue hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-Cinzel shadow-md hover:shadow-lg transition-all duration-300',
            svg: `<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>`,
          },
          {
            text: 'Contacter le support',
            href: 'mailto:contact@llouestservices.fr',
            class: 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-Cinzel shadow-md hover:shadow-lg transition-all duration-300',
            svg: `<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>`,
          },
        ],
      });
    }
  },

  /**
   * Connecte un utilisateur via un lien email.
   * Exécute les opérations post-endpoint avant redirection.
   * @async
   * @function signInWithEmailLink
   * @param {Object} data - Données pour la connexion par lien.
   * @param {string} data.email - Adresse email.
   * @param {string} data.link - Lien de connexion.
   * @param {Array<Function>} [postOperations=[]] - Liste de fonctions à exécuter après la connexion.
   * @returns {Promise<Object>} Données de l'utilisateur et token JWT.
   * @throws {Error} En cas d'erreur de connexion.
   */
  async signInWithEmailLink(data, postOperations = []) {
    try {
      validateEmailLinkData(data);
      const { email, link } = data;

      if (!isSignInWithEmailLink(auth, link)) {
        throw new Error('Lien de connexion invalide');
      }

      const userCredential = await signInWithEmailLink(auth, email, link);
      const user = userCredential.user;
      const firebaseToken = await user.getIdToken();

      let fcmToken = null;
      try {
        fcmToken = await getFcmToken(false);
        if (!fcmToken) {
          console.warn('Aucun FCM Token généré - Connexion sans notifications push');
        }
      } catch (tokenError) {
        console.error('Erreur obtention FCM Token:', tokenError);
      }

      const response = await apiFetch('/auth/signin', 'POST', {
        email,
        firebaseToken,
        fcmToken,
      }, false, { context: 'Connexion Lien Email' });

      // Exécution des opérations post-endpoint
      for (const operation of postOperations) {
        try {
          await operation();
          console.log('✅ Opération post-endpoint exécutée:', operation.name || 'anonyme');
        } catch (opError) {
          console.error('❌ Erreur lors de l\'exécution de l\'opération post-endpoint:', opError);
        }
      }

      setStoredToken(response.data.token, response.data.user.role || 'client');
      Swal.close();
      showNotification('Connexion réussie via lien email !', 'success');
      const loadedUserData = await loadUserData();
      updateUIWithUserData(loadedUserData);

      setTimeout(() => {
        window.location.href = '/pages/dashboard.html';
      }, 2000);

      return response.data;
    } catch (error) {
      clearStoredToken();
      await signOut(auth);
      Swal.close();
      throw await handleApiError(error, getAuthErrorMessage(error) || 'Erreur lors de la connexion via lien email', {
        context: 'Connexion Lien Email',
        sourceContext: 'signin-email-link',
        isCritical: false,
        iconSvg: `
          <svg class="w-12 h-12 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        `,
        actions: [
          {
            text: 'Réessayer',
            href: '/pages/auth/signin.html',
            class: 'bg-ll-blue hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-Cinzel shadow-md hover:shadow-lg transition-all duration-300',
            svg: `<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>`,
          },
          {
            text: 'Contacter le support',
            href: 'mailto:contact@llouestservices.fr',
            class: 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-Cinzel shadow-md hover:shadow-lg transition-all duration-300',
            svg: `<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>`,
          },
        ],
      });
    }
  },


  /**
 * Vérifie un code de vérification d'email.
 * Utilise la redirection fournie par le backend et évite d'ajouter à l'historique de navigation.
 * Le backend gère les cas d'expiration et les renvois de code.
 * @async
 * @function verifyEmailCode
 * @param {Object} data - Données du code.
 * @param {string} data.email - Adresse email.
 * @param {string} data.code - Code à 6 chiffres.
 * @param {Array<Function>} [postOperations=[]] - Liste de fonctions à exécuter après la vérification.
 * @returns {Promise<void>}
 * @throws {Error} En cas d'erreur de vérification.
 */
async verifyEmailCode(data, postOperations = []) {
  try {
    validateCodeData(data);
    const { email, code } = data;

    const response = await apiFetch('/auth/verify-email-code', 'POST', {
      email,
      code,
    }, false, { context: 'Vérification Code Email' });

    // Exécution des opérations post-endpoint
    for (const operation of postOperations) {
      try {
        await operation();
        console.log('✅ Opération post-endpoint exécutée:', operation.name || 'anonyme');
      } catch (opError) {
        console.error('❌ Erreur lors de l\'exécution de l\'opération post-endpoint:', opError);
      }
    }

    Swal.close();
    showNotification('Email vérifié avec succès.', 'success');
    setTimeout(() => {
      window.location.replace(response.redirect); // Utilise la redirection du backend
    }, 2000);
  } catch (error) {
    Swal.close();
    throw await handleApiError(error, getAuthErrorMessage(error) || 'Code invalide ou erreur lors de la vérification', {
      context: 'Vérification Code Email',
      sourceContext: 'verify-email-code',
      isCritical: false,
      iconSvg: `
        <svg class="w-12 h-12 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      `,
      actions: [
        {
          text: 'Réessayer',
          href: window.location.href,
          class: 'bg-ll-blue hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-Cinzel shadow-md hover:shadow-lg transition-all duration-300',
          svg: `<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>`,
        },
        {
          text: 'Contacter le support',
          href: 'mailto:contact@llouestservices.fr',
          class: 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-Cinzel shadow-md hover:shadow-lg transition-all duration-300',
          svg: `<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>`,
        },
      ],
    });
  }
},

/**
 * Vérifie un code de réinitialisation de mot de passe.
 * Utilise la redirection fournie par le backend et évite d'ajouter à l'historique de navigation.
 * Le backend gère les cas d'expiration et les renvois de code.
 * @async
 * @function verifyPasswordResetCode
 * @param {Object} data - Données du code.
 * @param {string} data.email - Adresse email.
 * @param {string} data.code - Code à 6 chiffres.
 * @param {Array<Function>} [postOperations=[]] - Liste de fonctions à exécuter après la vérification.
 * @returns {Promise<void>}
 * @throws {Error} En cas d'erreur de vérification.
 */
async verifyPasswordResetCode(data, postOperations = []) {
  try {
    validateCodeData(data);
    const { email, code } = data;

    const response = await apiFetch('/auth/verify-password-reset-code', 'POST', {
      email,
      code,
    }, false, { context: 'Vérification Code Réinitialisation Mot de Passe' });

    // Exécution des opérations post-endpoint
    for (const operation of postOperations) {
      try {
        await operation();
        console.log('✅ Opération post-endpoint exécutée:', operation.name || 'anonyme');
      } catch (opError) {
        console.error('❌ Erreur lors de l\'exécution de l\'opération post-endpoint:', opError);
      }
    }

    Swal.close();
    showNotification('Code de réinitialisation vérifié.', 'success');
    setTimeout(() => {
      window.location.replace(response.redirect);
    }, 2000);
  } catch (error) {
    Swal.close();
    throw await handleApiError(error, getAuthErrorMessage(error) || 'Code invalide ou erreur lors de la vérification', {
      context: 'Vérification Code Réinitialisation Mot de Passe',
      sourceContext: 'verify-password-reset-code',
      isCritical: false,
      iconSvg: `
        <svg class="w-12 h-12 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      `,
      actions: [
        {
          text: 'Réessayer',
          href: window.location.href,
          class: 'bg-ll-blue hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-Cinzel shadow-md hover:shadow-lg transition-all duration-300',
          svg: `<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>`,
        },
        {
          text: 'Contacter le support',
          href: 'mailto:contact@llouestservices.fr',
          class: 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-Cinzel shadow-md hover:shadow-lg transition-all duration-300',
          svg: `<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>`,
        },
      ],
    });
  }
},

/**
 * Vérifie un code de changement d'email (pour email actuel ou nouvel email).
 * Utilise la redirection fournie par le backend et évite d'ajouter à l'historique de navigation.
 * Le backend gère les cas d'expiration et les renvois de code.
 * @async
 * @function verifyChangeEmailCode
 * @param {Object} data - Données du code.
 * @param {string} data.email - Adresse email (actuel ou nouveau).
 * @param {string} data.code - Code à 6 chiffres.
 * @param {Array<Function>} [postOperations=[]] - Liste de fonctions à exécuter après la vérification.
 * @returns {Promise<void>}
 * @throws {Error} En cas d'erreur de vérification.
 */
async verifyChangeEmailCode(data, postOperations = []) {
  try {
    validateCodeData(data);
    const { email, code } = data;

    const response = await apiFetch('/auth/verify-change-email-code', 'POST', {
      email,
      code,
    }, false, { context: 'Vérification Code Changement Email' });

    // Exécution des opérations post-endpoint
    for (const operation of postOperations) {
      try {
        await operation();
        console.log('✅ Opération post-endpoint exécutée:', operation.name || 'anonyme');
      } catch (opError) {
        console.error('❌ Erreur lors de l\'exécution de l\'opération post-endpoint:', opError);
      }
    }

    Swal.close();
    showNotification('Changement d\'email vérifié.', 'success');
    setTimeout(() => {
      window.location.replace(response.redirect);
    }, 2000);
  } catch (error) {
    Swal.close();
    throw await handleApiError(error, getAuthErrorMessage(error) || 'Code invalide ou erreur lors de la vérification', {
      context: 'Vérification Code Changement Email',
      sourceContext: 'verify-change-email-code',
      isCritical: false,
      iconSvg: `
        <svg class="w-12 h-12 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      `,
      actions: [
        {
          text: 'Réessayer',
          href: window.location.href,
          class: 'bg-ll-blue hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-Cinzel shadow-md hover:shadow-lg transition-all duration-300',
          svg: `<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>`,
        },
        {
          text: 'Contacter le support',
          href: 'mailto:contact@llouestservices.fr',
          class: 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-Cinzel shadow-md hover:shadow-lg transition-all duration-300',
          svg: `<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>`,
        },
      ],
    });
  }
},




/**
 * Réinitialise le mot de passe de l'utilisateur.
 * @async
 * @function resetPassword
 * @param {Object} data - Données du mot de passe.
 * @param {string} data.email - Adresse email.
 * @param {string} data.password - Nouveau mot de passe.
 * @param {Array<Function>} [postOperations=[]] - Liste de fonctions à exécuter après la réinitialisation.
 * @returns {Promise<void>}
 * @throws {Error} En cas d'erreur de réinitialisation.
 */
async resetPassword(data, postOperations = []) {
  try {
    validateCodeData(data); 
    const { email, password } = data;

    const response = await apiFetch('/auth/update-password', 'POST', {
      email,
      password,
    }, false, { context: 'Réinitialisation Mot de Passe' });

    // Exécution des opérations post-endpoint
    for (const operation of postOperations) {
      try {
        await operation();
        console.log('✅ Opération post-endpoint exécutée:', operation.name || 'anonyme');
      } catch (opError) {
        console.error('❌ Erreur lors de l\'exécution de l\'opération post-endpoint:', opError);
      }
    }

    Swal.close();
    showNotification('Mot de passe réinitialisé avec succès.', 'success');
    setTimeout(() => {
      window.location.replace(response.redirect);
    }, 2000);
    
  } catch (error) {
    Swal.close();
    throw await handleApiError(error, getAuthErrorMessage(error) || 'Erreur lors de la réinitialisation du mot de passe', {
      context: 'Réinitialisation Mot de Passe',
      sourceContext: 'reset-password',
      isCritical: false,
      iconSvg: `
        <svg class="w-12 h-12 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      `,
      actions: [
        {
          text: 'Réessayer',
          href: window.location.href,
          class: 'bg-ll-blue hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-Cinzel shadow-md hover:shadow-lg transition-all duration-300',
          svg: `<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>`,
        },
        {
          text: 'Contacter le support',
          href: 'mailto:contact@llouestservices.fr',
          class: 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-Cinzel shadow-md hover:shadow-lg transition-all duration-300',
          svg: `<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>`,
        },
      ],
    });
  }
},

/**
 * Récupère les données de l'utilisateur courant.
 * @async
 * @returns {Promise<Object>} Données de l'utilisateur.
 * @throws {Error} En cas d'erreur.
 */
async  getCurrentUser() {
  try {
    if (!auth) {
      throw new Error('Firebase Auth non initialisé. Veuillez réessayer.');
    }

    const user = await waitForAuthState();
    if (!user) {
      clearStoredToken();
      throw new Error('Aucun utilisateur connecté');
    }

    const response = await Promise.race([
      apiFetch('/user/profile', 'GET', null, true, { context: 'Récupération Utilisateur' }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout lors de la récupération du profil')), 10000)) // 10s timeout
    ]);

    return response.data.user;
  } catch (error) {
    // Gestion spécifique des erreurs
    const errorMessage = error.message || 'Erreur inconnue';
    if (errorMessage.includes('401') || errorMessage.includes('403') || errorMessage.includes('Token') || errorMessage.includes('expiré') || errorMessage.includes('invalide')) {
      clearStoredToken();
      await signOut(auth);
      await api.auth.signOut();
      window.location.href = '/pages/auth/signin.html';
      return; // Arrêter l'exécution après redirection
    } else if (errorMessage.includes('Timeout') || errorMessage.includes('Network')) {
      // Mode dégradé si backend indisponible
      const cachedUser = getCachedUserData();
      if (cachedUser) {
        await showNotification('Mode dégradé activé (Backend indisponible). Utilisation des données en cache.', 'warning');
        return cachedUser;
      } else {
        await showNotification('Backend indisponible. Veuillez réessayer plus tard.', 'error');
      }
    }

    console.log(error);
    // Gestion générique des erreurs
    throw await handleApiError(error, getAuthErrorMessage(error) || 'Erreur lors de la récupération des données utilisateur', {
      context: 'Récupération Utilisateur',
      sourceContext: 'get-current-user',
      isCritical: false,
      iconSvg: `
        <svg class="w-12 h-12 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      `,
      actions: [
        {
          text: 'Se reconnecter',
          href: '/pages/auth/signin.html',
          class: 'bg-ll-blue hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-Cinzel shadow-md hover:shadow-lg transition-all duration-300',
          svg: `<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>`,
        },
        {
          text: 'Contacter le support',
          href: 'mailto:contact@llouestservices.fr',
          class: 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-Cinzel shadow-md hover:shadow-lg transition-all duration-300',
          svg: `<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>`,
        },
      ],
    });
  }
},
  /**
   * Vérifie si l'utilisateur est connecté.
   * @async
   * @function isAuthenticated
   * @returns {Promise<boolean>} True si l'utilisateur est connecté, sinon false.
   */
  async isAuthenticated() {
    try {
      const user = await waitForAuthState();
      return !!user;
    } catch (error) {
      console.error('Erreur vérification authentification:', error);
      return false;
    }
  },


  /**
   * Réinitialise l'état des notifications pour une nouvelle tentative d'inscription
   * @function resetNotificationState
   */
  resetNotificationState() {
    resetSignupNotificationState();
  }

  
};

export default authApi;