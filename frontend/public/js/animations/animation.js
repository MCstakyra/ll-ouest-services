/**
 * @file animation.js
 * @description Module de gestion des animations globales pour L&L Ouest Services.
 * Ce module gère les carrousels Swiper avancés, les sliders avant/après avec support tactile et accessibilité, les interactions utilisateur dynamiques,
 * les filtres de services avec animations fluides, les animations Lottie pour les états de chargement et interactions, les modales futuristes avec effets 3D,
 * le thème sombre/clair avec transitions douces, les particules interactives pour un design futuriste, les scroll animations avec AOS personnalisé,
 * et des sections supplémentaires pour FAQ, équipe, partenaires, blog, événements, galerie, statistiques, tarification, et contacts.
 * Le design est ultra professionnel et futuriste avec des effets néon, gradients, et animations CSS/JS avancées.
 * Le module est optimisé pour les performances, avec lazy loading, debounce, et gestion des ressources.
 * @requires AOS
 * @requires Swiper
 * @requires SweetAlert2
 * @requires lottie-web
 * @requires utils.js
 * @requires api.js
 * @requires loadService.js
 */

// Imports essentiels
import { showNotification, openLightbox } from '../modules/utils.js';
import api from '../api.js';
import loadServicesModule, { allFilteredServices, equipmentIcons, getServiceIndex, highlightSearchTerms, resetHighlights, setServiceIndex } from '../injection/loadService.js';
const { loadServices, renderServicesSidebar, renderServiceDetail, navigateService, toggleServicesLoading } = loadServicesModule;


// Icônes SVG pour catégories avec effets néon
const categoryIcons = {
  all: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-ll-white"><path d="M3 3h18v18H3z"></path><path d="M12 8v8"></path><path d="M8 12h8"></path></svg>`,
  bureaux: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-ll-white"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="M6 8h12"></path><path d="M6 12h12"></path><path d="M6 16h12"></path></svg>`,
  piscine: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-ll-white"><path d="M2 14h2l2-2 2 4 2-2 2 4 2-2 2 4h2"></path><path d="M2 18h2l2-2 2 4 2-2 2 4 2-2 2 4h2"></path></svg>`,
  régulier: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-ll-white"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`,
  ponctuel: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-ll-white"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
  salles_de_réunion: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-ll-white"><rect x="3" y="3" width="18" height="18" rx="2"></rect><path d="M9 3v18"></path><path d="M9 9h12"></path></svg>`,
  sas_dentrée: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-ll-white"><path d="M8 3h8a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"></path><path d="M12 7v10"></path></svg>`,
  réfectoire: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-ll-white"><path d="M4 12h16"></path><path d="M4 6h16"></path><path d="M4 18h16"></path></svg>`,
  sanitaires: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-ll-white"><path d="M12 3v18"></path><path d="M6 12h12"></path></svg>`,
  escaliers: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-ll-white"><path d="M4 4h6v6H4z"></path><path d="M14 4h6v6h-6z"></path><path d="M4 14h6v6H4z"></path><path d="M14 14h6v6h-6z"></path></svg>`,
  vitrines: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-ll-white"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="M2 10h20"></path></svg>`,
  industriel: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-ll-white"><path d="M2 20h20V4H2z"></path><path d="M6 4v16"></path><path d="M10 4v16"></path><path d="M14 4v16"></path><path d="M18 4v16"></path></svg>`,
  commercial: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-ll-white"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><path d="M9 9h6v6H9z"></path></svg>`,
  residentiel: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-ll-white"><path d="M3 12l9-9 9 9"></path><path d="M5 10v10a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1V10"></path></svg>`,
  medical: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-ll-white"><path d="M12 2v20"></path><path d="M4 10h16"></path><path d="M4 14h16"></path></svg>`,
  education: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-ll-white"><rect x="3" y="3" width="18" height="18" rx="2"></rect><path d="M12 3v18"></path><path d="M3 12h18"></path></svg>`,
  hotelier: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-ll-white"><rect x="2" y="6" width="20" height="12" rx="2"></rect><path d="M6 10h.01"></path><path d="M6 14h.01"></path><path d="M10 10h.01"></path><path d="M10 14h.01"></path><path d="M14 10h.01"></path><path d="M14 14h.01"></path><path d="M18 10h.01"></path><path d="M18 14h.01"></path></svg>`,
  restaurant: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-ll-white"><path d="M4 12h16"></path><path d="M4 6h16"></path><path d="M4 18h16"></path></svg>`,
  gym: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-ll-white"><path d="M4 7h16v10H4z"></path><path d="M8 10v4"></path><path d="M12 10v4"></path><path d="M16 10v4"></path></svg>`,
  parking: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-ll-white"><rect x="3" y="3" width="18" height="18" rx="2"></rect><path d="M8 8h8v8H8z"></path></svg>`,
  jardin: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-ll-white"><path d="M12 3v18"></path><path d="M6 9h12"></path><path d="M4 15h16"></path></svg>`,
  facade: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-ll-white"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="M6 8v8"></path><path d="M10 8v8"></path><path d="M14 8v8"></path><path d="M18 8v8"></path></svg>`,
  toiture: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-ll-white"><path d="M3 12l9-9 9 9"></path><path d="M5 10v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V10"></path></svg>`,
  evenementiel: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-ll-white"><path d="M12 2v4"></path><path d="M2 12h4"></path><path d="M12 18v4"></path><path d="M18 12h4"></path><path d="M4 4l16 16"></path><path d="M4 20L20 4"></path></svg>`,
};



 // Icônes d'expansion/collapse
  const expandIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-500">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>`;
  const collapseIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-500">
    <polyline points="18 15 12 9 6 15"></polyline>
  </svg>`;

// Données mock étendues
let MOCK_CATEGORIES = [];
let MOCK_TESTIMONIALS = [];
let MOCK_SERVICES = [];
let MOCK_FAQ = [];
let MOCK_TEAM = [];
let MOCK_PARTNERS = [];
let MOCK_BLOG_POSTS = [];
let MOCK_EVENTS = [];
let MOCK_GALLERY = [];
let MOCK_STATS = [];
let MOCK_PRICING = [];
let MOCK_CONTACTS = [];
let WHY_US_DATA = [];
let ECO_DATA = [];
let currentServiceIndex = getServiceIndex();
/**
 * Charge les données mock depuis JSON avec fallback détaillé et logs.
 * @async
 */
async function loadMockData() {
  try {
    const categoriesResponse = await fetch('/assets/json/mock/mock-categories.json');
    if (categoriesResponse.ok) {
      MOCK_CATEGORIES = await categoriesResponse.json();
      MOCK_CATEGORIES = [
        { id: 'all', name: 'Tout', icon: categoryIcons.all },
        ...MOCK_CATEGORIES,
        { id: 'industriel', name: 'Industriel', icon: categoryIcons.industriel },
        { id: 'commercial', name: 'Commercial', icon: categoryIcons.commercial },
        { id: 'residentiel', name: 'Résidentiel', icon: categoryIcons.residentiel },
        { id: 'medical', name: 'Médical', icon: categoryIcons.medical },
        { id: 'education', name: 'Éducation', icon: categoryIcons.education },
        { id: 'hotelier', name: 'Hôtelier', icon: categoryIcons.hotelier },
        { id: 'restaurant', name: 'Restaurant', icon: categoryIcons.restaurant },
        { id: 'gym', name: 'Gym', icon: categoryIcons.gym },
        { id: 'parking', name: 'Parking', icon: categoryIcons.parking },
        { id: 'jardin', name: 'Jardin', icon: categoryIcons.jardin },
        { id: 'facade', name: 'Façade', icon: categoryIcons.facade },
        { id: 'toiture', name: 'Toiture', icon: categoryIcons.toiture },
        { id: 'evenementiel', name: 'Événementiel', icon: categoryIcons.evenementiel },
      ];
    } else {
      throw new Error('Échec du chargement des catégories');
    }

    const testimonialsResponse = await fetch('/assets/json/mock/mock-testimonials.json');
    if (testimonialsResponse.ok) {
      MOCK_TESTIMONIALS = await testimonialsResponse.json();
     
    } else {
      throw new Error('Échec du chargement des témoignages');
    }

    const faqResponse = await fetch('/assets/json/mock/mock-faq.json');
    if (faqResponse.ok) {
      MOCK_FAQ = await faqResponse.json();
    } else {
     

        MOCK_FAQ = [
    {
      question: 'Quels sont vos tarifs ?',
      answer: 'Nos <span class="highlight text-blue-500 font-semibold">tarifs</span> sont établis sur mesure, en fonction de la <span class="highlight text-blue-500 font-semibold">surface à nettoyer</span>, de la fréquence des interventions et des services spécifiques que vous souhaitez. N\'hésitez pas à nous contacter pour un <span class="highlight text-blue-500 font-semibold">devis gratuit</span> et sans engagement !',
      category: 'tarifs',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-500">
        <line x1="12" y1="1" x2="12" y2="23"></line>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
      </svg>`
    },
    {
      question: 'Utilisez-vous des produits écologiques ?',
      answer: 'Absolument. Nous sommes engagés dans une démarche <span class="highlight text-green-500 font-semibold">éco-responsable</span> et privilégions l\'utilisation de <span class="highlight text-green-500 font-semibold">produits certifiés biodégradables</span> et non toxiques pour l\'environnement et la santé de nos clients.',
      category: 'ecologie',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-500">
        <path d="M4 20h16"></path>
        <path d="m6.9 15-3.9 5"></path>
        <path d="m10.2 12.6-6.2 8.3"></path>
        <path d="m8 11 3-4 2 6 3-4c.5-.3 1.3-.3 1.5.2.3.5 0 1.3-.5 1.5l-3.5 2"></path>
        <path d="m22 2-3 7c-.5 1.1-2.2 1-2.9-.2-.8-1.3 0-2.8 1.4-3l2-1"></path>
      </svg>`
    },
    {
      question: 'Dans quelles régions intervenez-vous ?',
      answer: 'Nous couvrons l\'ensemble de l\'<span class="highlight text-purple-500 font-semibold">Ouest de la France</span>, incluant la <span class="highlight text-purple-500 font-semibold">Bretagne</span>, les <span class="highlight text-purple-500 font-semibold">Pays de la Loire</span>, et une partie de la <span class="highlight text-purple-500 font-semibold">Normandie</span> et de la <span class="highlight text-purple-500 font-semibold">Nouvelle-Aquitaine</span>. Pour plus de précisions, veuillez nous contacter.',
      category: 'regions',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-purple-500">
        <circle cx="12" cy="10" r="3"></circle>
        <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z"></path>
      </svg>`
    },
    {
      question: 'Quels types de services proposez-vous ?',
      answer: 'Nous offrons une gamme complète de <span class="highlight text-blue-500 font-semibold">services de nettoyage</span>, incluant le ménage domestique, le nettoyage commercial, et des services spécialisés comme le nettoyage de vitres ou après travaux. Consultez notre page services pour plus de détails.',
      category: 'tarifs',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-500">
        <path d="M20 6 9 17l-5-5"></path>
      </svg>`
    },
    {
      question: 'Vos produits sont-ils sans danger pour les animaux ?',
      answer: 'Oui, nos <span class="highlight text-green-500 font-semibold">produits écologiques</span> sont conçus pour être sans danger pour les <span class="highlight text-green-500 font-semibold">animaux domestiques</span> et les enfants, tout en étant efficaces pour un nettoyage en profondeur.',
      category: 'ecologie',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-500">
        <path d="M4 20h16"></path>
        <path d="m6.9 15-3.9 5"></path>
        <path d="m10.2 12.6-6.2 8.3"></path>
        <path d="m8 11 3-4 2 6 3-4c.5-.3 1.3-.3 1.5.2.3.5 0 1.3-.5 1.5l-3.5 2"></path>
        <path d="m22 2-3 7c-.5 1.1-2.2 1-2.9-.2-.8-1.3 0-2.8 1.4-3l2-1"></path>
      </svg>`
    }
  ];

    }

    const teamResponse = await fetch('/assets/json/mock/mock-team.json');
    if (teamResponse.ok) {
      MOCK_TEAM = await teamResponse.json();
    } 


    

    const partnersResponse = await fetch('/assets/json/mock/mock-partners.json');
    if (partnersResponse.ok) {
      MOCK_PARTNERS = await partnersResponse.json();
    } else {
     
       MOCK_PARTNERS = [
            {
                name: "Hilton Hotels & Resorts",
                logo: "https://seeklogo.com/images/H/hilton-hotels-resorts-logo-304F248592-seeklogo.com.png",
                description: "Une collaboration pour garantir une expérience client irréprochable. Notre engagement commun pour l'hygiène et le confort soutient leur réputation mondiale d'excellence.",
                website: "https://www.hilton.com"
            },
            {
                name: "JLL",
                logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/JLL_logo.svg/2560px-JLL_logo.svg.png",
                description: "Recommandé pour la valorisation et l'entretien d'actifs immobiliers prestigieux. JLL nous choisit pour notre fiabilité et notre capacité à maintenir des standards élevés.",
                website: "https://www.jll.com"
            },
            {
                name: "WeWork",
                logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/WeWork_logo.svg/2560px-WeWork_logo.svg.png",
                description: "Partenaire de confiance pour des espaces de travail sains et créatifs. Nous assurons un environnement impeccable pour stimuler le bien-être et la productivité.",
                website: "https://www.wework.com"
            },
            {
                name: "Westfield",
                logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Westfield_Logo.svg/2560px-Westfield_Logo.svg.png",
                description: "Assurer une expérience premium dans des zones à très fort trafic. Nos équipes relèvent le défi quotidien de la propreté avec efficacité et discrétion.",
                website: "https://www.westfield.com"
            },
            {
                name: "Equinox",
                logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Equinox_Hotels_logo.svg/1280px-Equinox_Hotels_logo.svg.png",
                description: "Maintenir des standards d'hygiène stricts pour une clientèle exigeante. Equinox valorise notre engagement envers la sécurité et la satisfaction de leurs membres.",
                website: "https://www.equinox.com"
            }
        ];

        
    }

    const blogResponse = await fetch('/assets/json/mock/mock-blog-posts.json');
    if (blogResponse.ok) {
      MOCK_BLOG_POSTS = await blogResponse.json();
    } else {
      MOCK_BLOG_POSTS = [
        { id: 'b1', title: 'Comment choisir un service de nettoyage ?', content: 'Conseils pour sélectionner le bon service.', date: '2025-08-01', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
        { id: 'b2', title: 'Les avantages du nettoyage écologique', content: 'Pourquoi opter pour des produits verts.', date: '2025-07-15', image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
        { id: 'b3', title: 'Entretien des bureaux : nos astuces', content: 'Maintenir un espace de travail propre.', date: '2025-06-30', image: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
        { id: 'b4', title: 'Nettoyage événementiel : ce qu’il faut savoir', content: 'Préparer vos événements avec soin.', date: '2025-06-15', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
        { id: 'b5', title: 'L’importance de la propreté en milieu médical', content: 'Normes strictes pour la santé.', date: '2025-05-20', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
      ];
    }

    const eventsResponse = await fetch('/assets/json/mock/mock-events.json');
    if (eventsResponse.ok) {
      MOCK_EVENTS = await eventsResponse.json();
    } else {
      MOCK_EVENTS = [
        { id: 'e1', title: 'Salon du Nettoyage Écologique', date: '2025-09-10', location: 'Nantes', description: 'Découvrez nos innovations.' },
        { id: 'e2', title: 'Atelier Propreté', date: '2025-10-05', location: 'Rennes', description: 'Formation sur les techniques modernes.' },
        { id: 'e3', title: 'Conférence Durabilité', date: '2025-11-20', location: 'Brest', description: 'Engagement pour un avenir vert.' },
      ];
    }

    const galleryResponse = await fetch('/assets/json/mock/mock-gallery.json');
    if (galleryResponse.ok) {
      MOCK_GALLERY = await galleryResponse.json();
    } else {
      MOCK_GALLERY = [
        { id: 'g1', src: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', alt: 'Nettoyage de bureau' },
        { id: 'g2', src: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', alt: 'Nettoyage industriel' },
        { id: 'g3', src: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', alt: 'Piscine propre' },
      ];
    }

    const statsResponse = await fetch('/assets/json/mock/mock-stats.json');
    if (statsResponse.ok) {
      MOCK_STATS = await statsResponse.json();
    } else {
      MOCK_STATS = [
            {
                label: "Clients Satisfaits",
                value: 1500,
                unit: "+",
                svg: `<svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 mx-auto mb-4 text-ll-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0-12l-1 3m5-3l1 3m5-3l1 3m-5 3v6m-2-6v6m2-6l-1 3m-2-3l-1 3" />
                </svg>`, // Icon for clients (group of people)
                description: "Plus de 1500 clients fidèles dans divers secteurs."
            },
            {
                label: "Années d'Expérience",
                value: 20,
                unit: "+",
                svg: `<svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 mx-auto mb-4 text-ll-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>`, // Icon for calendar
                description: "20 ans d'expertise en services de nettoyage professionnels."
            },
            {
                label: "Interventions Réalisées",
                value: 5000,
                unit: "+",
                svg: `<svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 mx-auto mb-4 text-ll-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>`, // Icon for broom/cleaning
                description: "Plus de 5000 missions de nettoyage accomplies avec succès."
            },
            {
                label: "Équipes Professionnelles",
                value: 30,
                unit: "+",
                svg: `<svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 mx-auto mb-4 text-ll-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>`, // Icon for team
                description: "30 équipes qualifiées pour un service impeccable."
            },
            {
                label: "Produits Éco-labellisés",
                value: 100,
                unit: "%",
                svg: `<svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 mx-auto mb-4 text-ll-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.372V17.25m-6 0V15m0-5.25v1.5m0 3v1.5m0 3V21m3.75-3v1.5m0-3V15m0-5.25v1.5m0 3v1.5m0 3V21M15 9a3 3 0 100-6H9a3 3 0 000 6h6zm-3 3a3 3 0 100-6H9a3 3 0 000 6h3z" />
                </svg>`, // Icon for leaf/eco
                description: "100% de produits respectueux de l'environnement."
            }
        ];
    }

    const pricingResponse = await fetch('/assets/json/mock/mock-pricing.json');
    if (pricingResponse.ok) {
      MOCK_PRICING = await pricingResponse.json();
    } else {
      MOCK_PRICING = [
        { id: 'p1', name: 'Basique', price: 99, features: ['Nettoyage régulier', 'Produits standards', 'Support email'] },
        { id: 'p2', name: 'Pro', price: 199, features: ['Nettoyage avancé', 'Produits écologiques', 'Support prioritaire'] },
        { id: 'p3', name: 'Premium', price: 299, features: ['Nettoyage complet', 'Produits écologiques', 'Support 24/7', 'Rapport détaillé'] },
      ];
    }

    const contactsResponse = await fetch('/assets/json/mock/mock-contacts.json');
    if (contactsResponse.ok) {
      MOCK_CONTACTS = await contactsResponse.json();
    } else {
      MOCK_CONTACTS = [
        { id: 'c1', name: 'Support Général', email: 'support@llouests.com', phone: '+33 7 66 88 16 79' },
        { id: 'c2', name: 'Service Commercial', email: 'sales@llouests.com', phone: '+33 1 23 45 67 90' },
        { id: 'c3', name: 'Recrutement', email: 'hr@llouests.com', phone: '+33 1 23 45 67 91' },
      ];
    }

  const reasonResponse = await  fetch('/assets/json/mock/why-us-data.json');
   if(reasonResponse.ok){
    WHY_US_DATA = await reasonResponse.json();
   }

   const ecoResponse = await fetch('/assets/json/mock/eco-data.json');
   if(ecoResponse.ok){
    ECO_DATA = await ecoResponse.json();
   }


  } catch (error) {
    console.error('Erreur lors du chargement des données mock:', error);
    MOCK_CATEGORIES = [
      { id: 'all', name: 'Tout', icon: categoryIcons.all },
      { id: 'bureaux', name: 'Bureaux', icon: categoryIcons.bureaux },
      { id: 'piscine', name: 'Piscine', icon: categoryIcons.piscine },
      { id: 'régulier', name: 'Régulier', icon: categoryIcons.régulier },
      { id: 'ponctuel', name: 'Ponctuel', icon: categoryIcons.ponctuel },
      { id: 'salles_de_réunion', name: 'Salles de Réunion', icon: categoryIcons.salles_de_réunion },
      { id: 'sas_dentrée', name: 'Sas d’Entrée', icon: categoryIcons.sas_dentrée },
      { id: 'réfectoire', name: 'Réfectoire', icon: categoryIcons.réfectoire },
      { id: 'sanitaires', name: 'Sanitaires', icon: categoryIcons.sanitaires },
      { id: 'escaliers', name: 'Escaliers', icon: categoryIcons.escaliers },
      { id: 'vitrines', name: 'Vitrines', icon: categoryIcons.vitrines },
      { id: 'industriel', name: 'Industriel', icon: categoryIcons.industriel },
      { id: 'commercial', name: 'Commercial', icon: categoryIcons.commercial },
      { id: 'residentiel', name: 'Résidentiel', icon: categoryIcons.residentiel },
      { id: 'medical', name: 'Médical', icon: categoryIcons.medical },
      { id: 'education', name: 'Éducation', icon: categoryIcons.education },
      { id: 'hotelier', name: 'Hôtelier', icon: categoryIcons.hotelier },
      { id: 'restaurant', name: 'Restaurant', icon: categoryIcons.restaurant },
      { id: 'gym', name: 'Gym', icon: categoryIcons.gym },
      { id: 'parking', name: 'Parking', icon: categoryIcons.parking },
      { id: 'jardin', name: 'Jardin', icon: categoryIcons.jardin },
      { id: 'facade', name: 'Façade', icon: categoryIcons.facade },
      { id: 'toiture', name: 'Toiture', icon: categoryIcons.toiture },
      { id: 'evenementiel', name: 'Événementiel', icon: categoryIcons.evenementiel },
    ];

    MOCK_TESTIMONIALS = [
      {
        id: 't1',
        text: 'Service exceptionnel ! L’équipe est professionnelle et à l’écoute.',
        author: 'Jean Dupont',
        title: 'Client Satisfait',
        rating: 5,
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
        details: 'Détails étendus sur le service, avec mention des aspects écologiques et la rapidité.',
      },
      {
        id: 't2',
        text: 'Rapide, efficace et respectueux de l’environnement.',
        author: 'Entreprise XYZ',
        title: 'Client Professionnel',
        rating: 4,
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
        details: 'Service adapté aux besoins des entreprises.',
      },
      {
        id: 't3',
        text: 'Un service de qualité qui dépasse nos attentes.',
        author: 'Marie L.',
        title: 'Particulier',
        rating: 5,
        image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
        details: 'Nettoyage complet avec des produits écologiques.',
      },
    ];

  }
}





const HERO_SLIDES = [
  {
    type: 'grid',
    images: [
      { type: 'image', src: '/assets/images/img8.jpeg', alt: 'Véranda nettoyée par L&L Ouest Services' },
      { type: 'image', src: '/assets/images/img6.jpeg', alt: 'Équipements de nettoyage' },
      { type: 'image', src: '/assets/images/img5.jpeg', alt: 'Détail nettoyage professionnel' },
      
    ],
    title: 'Nettoyage Professionnel à Angers',
    subtitle: 'L&L Ouest Services : Propreté impeccable pour bureaux, commerces et espaces extérieurs.',
    thumbnail: '/assets/images/after-veranda.png',
    sidebarMessage: 'Solutions sur mesure pour un environnement éclatant.',
    delay: 6000,
  },
  {
    type: 'grid',

     images: [
      { type: 'image', src: '/assets/images/transforme1.png', alt: 'Véranda nettoyée par L&L Ouest Services' },
      { type: 'image', src: '/assets/images/transforme2.png', alt: 'Véranda nettoyée par L&L Ouest Services' },
     ],

    src: 'https://assets.mixkit.co/videos/preview/mixkit-woman-cleaning-a-room-39865-large.mp4',
    
    title: 'Transformations Visibles',
    subtitle: 'Avant et après : Interventions rapides pour révéler l’éclat de vos espaces.',
    thumbnail: '/assets/images/before-bureau.png',
    sidebarMessage: 'Résultats qui impressionnent vos clients.',
    delay: 7000,
  },

  {
    type: 'grid',
     images: [
      { type: 'image', src: '/assets/images/img9.jpeg', alt: 'Véranda nettoyée par L&L Ouest Services' },
      { type: 'image', src: '/assets/images/img3.png', alt: 'Jardin avant nettoyage' },
     ],
    title: 'Résultats qui impressionnent nos clients.',
    subtitle: 'Avant et après : Nos interventions rapides révèlent l’éclat de vos espaces professionnels.',
    thumbnail: '/assets/images/before-bureau.png',
    sidebarMessage: 'Résultats qui impressionnent vos clients.',
    delay: 9000,
  },


  {
    type: 'grid',
    images: [
      { type: 'image', src: '/assets/images/bureau1.png', alt: 'Bureau avant nettoyage' },
      { type: 'image', src: '/assets/images/bureau2.png', alt: 'Détail bureau nettoyé' },
      { type: 'image', src: '/assets/images/bureau3.png', alt: 'Espace de travail propre' },
    ],
    title: 'Bureaux Impeccables',
    subtitle: 'Nettoyage méticuleux pour des environnements de travail sains à Angers.',
    thumbnail: '/assets/images/before-bureau.png',
    sidebarMessage: 'Un cadre professionnel toujours prêt.',
    delay: 6500,
  },
  {
    type: 'grid',
    images: [
      { type: 'image', src: '/assets/images/exterieur1.png', alt: 'Nettoyage extérieur' },
      { type: 'image', src: '/assets/images/exterieur2.png', alt: 'Nettoyage extérieur' },
    ],
    title: 'Espaces Extérieurs Propres',
    subtitle: 'Jardins, vérandas et façades : Redonnez vie à vos extérieurs.',
    thumbnail: '/assets/images/img3.png',
    sidebarMessage: 'Extérieurs éclatants pour une première impression parfaite.',
    delay: 5500,
  },
  {
    type: 'grid',
     images: [
      { type: 'image', src: '/assets/images/vitre1.jpeg', alt: 'Nettoyage extérieur' },
      { type: 'image', src: '/assets/images/vitre2.jpeg', alt: 'Nettoyage extérieur' },
    ],
    poster: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    title: 'Nettoyage de Vitres',
    subtitle: 'Clarté et transparence pour vos fenêtres avec des techniques avancées.',
    thumbnail: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    sidebarMessage: 'Des vitres sans traces pour une vue parfaite.',
    delay: 7000,
  },
  {
    type: 'grid',
    images: [
      { type: 'image', src: '/assets/images/equipe1.png', alt: 'Équipe au travail' },
      { type: 'image', src: '/assets/images/equipe2.png', alt: 'Équipe professionnelle' },
    ],
    title: 'Équipe Dédiée Locale',
    subtitle: 'Une équipe passionnée à Angers, offrant un service fiable et personnalisé.',
    thumbnail: '/assets/images/img5.jpeg',
    sidebarMessage: 'Confiance et proximité avec L&L Ouest Services.',
    delay: 6000,
  },
  {
    type: 'grid',
    images: [
      { type: 'image', src: '/assets/images/img7.jpeg', alt: 'Véranda avant nettoyage' },
      { type: 'image', src: '/assets/images/sanitaire1.png', alt: 'Véranda après nettoyage' },
      { type: 'image', src: '/assets/images/sanitaire2.png', alt: 'Hygiène certifiée' },
    ],
    title: 'Hygiène Premium',
    subtitle: 'Standards élevés pour une sécurité optimale dans vos espaces sanitaires.',
    thumbnail: '/assets/images/before-veranda.png',
    sidebarMessage: 'Hygiène au sommet pour votre sérénité.',
    delay: 6500,
  },
  {
    type: 'grid',
    images: [
      { type: 'image', src: '/assets/images/voiture.jpg', alt: 'Jardin avant nettoyage' },
      { type: 'image', src: '/assets/images/poubelle.jpg', alt: 'Jardin avant nettoyage' },
      { type: 'image', src: '/assets/images/maison.png', alt: 'Jardin avant nettoyage' },
    ],
    title: 'Personnalisation Totale',
    subtitle: 'Solutions sur mesure : nettoyage, petits boulots, et prestations extérieures adaptées.',
    thumbnail: '/assets/images/before-garden.png',
    sidebarMessage: 'Adapté à chaque client, chaque défi unique.',
    delay: 5500,
  },
  {
    type: 'grid',
     images: [
      { type: 'image', src: '/assets/images/meuble.png', alt: 'Jardin avant nettoyage' },
      { type: 'image', src: '/assets/images/meuble2.png', alt: 'Jardin avant nettoyage' },
    ],
    title: 'Nettoyage de Meubles',
    subtitle: 'Redonnez vie à vos meubles avec nos techniques de nettoyage à la vapeur.',
    thumbnail: '/assets/images/meuble.png',
    sidebarMessage: 'Mobilier comme neuf, durablement.',
    delay: 7000,
  },
  {
    type: 'grid',
    images: [
      { type: 'image', src: '/assets/images/express.png', alt: 'Service express' },
    ],
    title: 'Service Express 24/7',
    subtitle: 'Interventions rapides et discrètes pour ne jamais perturber votre activité.',
    thumbnail: '/assets/images/img8.jpeg',
    sidebarMessage: 'Efficacité à toute heure pour vos besoins.',
    delay: 5500,
  },
  {
    type: 'grid',
    images: [
      { type: 'image', src: '/assets/images/outils.png', alt: 'Technologie de pointe' },
      { type: 'image', src: '/assets/images/outils2.png', alt: 'Outils modernes' },
      { type: 'image', src: '/assets/images/instrument.png', alt: 'Outils modernes' },
    ],
    title: 'Outils Innovants',
    subtitle: 'Technologie de pointe pour un nettoyage impeccable et durable.',
    thumbnail: '/assets/images/img9.jpeg',
    sidebarMessage: 'Innovation pour une propreté premium.',
    delay: 6000,
  },
];

/**
 * Fisher-Yates shuffle for random order without repetition
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled copy
 */
function shuffleSlides(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Lazy load images with IntersectionObserver
 * @param {NodeList} images - List of images to lazy load
 */
/**
 * Lazy load images with IntersectionObserver and apply blur-up effect
 * @param {NodeList} images - List of images to lazy load
 */
function lazyLoadImages(images) {
  images.forEach((img) => {
    const onImageLoad = () => {
      img.classList.remove('opacity-0', 'blur-lg');
      const container = img.closest('.image-container');
      if (container) {
          container.style.backgroundImage = 'none';
      }
    };

    if ('loading' in HTMLImageElement.prototype) {
      img.src = img.dataset.src || img.src;

      
      img.addEventListener('load', onImageLoad, { once: true });
    } else {

      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const currentImg = entry.target;

            currentImg.src = currentImg.dataset.src || currentImg.src;
         
            currentImg.addEventListener('load', onImageLoad, { once: true });
            obs.unobserve(currentImg);
          }
        });
      }, { rootMargin: '0px 0px 50% 0px' });

      observer.observe(img);
    }
  });
}


let activeSlide = 0;
let swiperInstance = null;
let currentTimer = null;

async function initHeroCarousel() {
  const slidesContainer = document.getElementById('hero-slides');
  if (!slidesContainer) return;

  const shuffledSlides = shuffleSlides(HERO_SLIDES);

  function generateGridLayout(images) {
    const imageCount = images.length;
    const layouts = {
      1: {
        gridCols: 'grid-cols-1',
        gridRows: 'grid-rows-1',
        items: [{ class: 'col-span-1 row-span-1', scale: '110', visible: true }],
      },
      2: {
        gridCols: 'grid-cols-2',
        gridRows: 'grid-rows-1',
        items: [
          { class: 'col-span-1 row-span-1 z-10', scale: '108', visible: true },
          { class: 'col-span-1 row-span-1 z-0 -ml-8', scale: '105', visible: true },
        ],
      },
      3: {
        gridCols: 'grid-cols-3',
        gridRows: 'grid-rows-2',
        items: [
          { class: 'col-span-2 row-span-2 z-10', scale: '110', visible: true },
          { class: 'col-span-1 row-span-1 z-0 -ml-8', scale: '105', visible: true },
          { class: 'col-span-1 row-span-1 z-5 -ml-8 mt-1Organisation d’Événements', scale: '105', visible: true },
        ],
      },
    };
    return layouts[imageCount] || layouts[1];
  }

  slidesContainer.innerHTML = shuffledSlides.map((slide, index) => {
    const isVideoSlide = slide.type === 'video';
    const isGridSlide = slide.type === 'grid';
    let gridCols = '', gridRows = '', gridItems = [];

    if (isGridSlide) {
      const layout = generateGridLayout(slide.images);
      gridCols = layout.gridCols;
      gridRows = layout.gridRows;
      gridItems = layout.items;
    }

    return `
      <div class="swiper-slide relative w-full h-full flex items-center justify-center transition-all duration-500 ease-in-out overflow-hidden transform scale-100 group" role="group" aria-label="Slide ${index + 1} de ${shuffledSlides.length}">
        ${isVideoSlide ? `
          <div class="absolute inset-0 z-0">
            <video class="w-full h-full object-cover object-center transition-all duration-500 ease-out" poster="${slide.poster}" muted loop playsinline preload="metadata" src="${slide.src}" aria-hidden="true">
              <source src="${slide.src}" type="video/mp4">
            </video>
          </div>
          <div class="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/70 z-[5]"></div>
        ` : isGridSlide ? `
          <div class="absolute inset-0 z-0 grid ${gridCols} ${gridRows} gap-0">
            ${slide.images.map((img, idx) => `
    <div class="${gridItems[idx]?.class || 'col-span-1 row-span-1'} relative rounded-none overflow-hidden transform transition-transform duration-500 ease-out group-[.swiper-slide-active]:scale-${gridItems[idx]?.scale || '100'} ${gridItems[idx]?.visible ? '' : 'hidden'}">
      ${img.type === 'image' ? `
        <div class="image-container w-full h-full relative" style="background-image: url('${img.placeholderSrc || img.src}'); background-size: cover;">
          <img 
            data-src="${img.src}" 
            alt="${img.alt}" 
            class="lazy-image w-full h-full object-cover object-center transition-opacity duration-700 ease-out opacity-0 blur-lg" 
            loading="lazy" 
          >
        </div>
      ` : `
        `}
      <div class="absolute inset-0 bg-gradient-to-b from-transparent to-black/${idx === 0 ? '60' : '40'} transition-opacity duration-500 ease-out"></div>
    </div>
  `).join('')}
          </div>
        ` : ''}
        <div class="relative z-10 flex flex-col justify-center md:justify-end items-center text-center text-white pb-4 md:pb-12 px-4 sm:px-6 lg:px-8 w-full max-w-4xl mx-auto transition-all duration-500 ease-in-out group-[.swiper-slide-active]:translate-y-0 group-[.swiper-slide-active]:opacity-100 translate-y-10 opacity-0">
          <h1 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-cinzel font-bold mb-2 sm:mb-3 tracking-tight text-shadow-lg">${slide.title}</h1>
          <p class="text-sm sm:text-base md:text-lg lg:text-xl mb-3 sm:mb-4 max-w-2xl mx-auto leading-relaxed font-light line-clamp-2">${slide.subtitle}</p>
          <a href="#contact" class="btn-container flex items-center backdrop-blur gap-2 py-2.5 bg-gray-600/30 shadow-xl border-2 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white py-3 px-4 rounded-xl font-semibold  transition-colors duration-200 flex items-center justify-center">
           <div class="btn-content shine-effect relative z-10 flex items-center">
              <div class="icon-wrapper text-white mr-2 sm:mr-3 flex-shrink-0">
                <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                </svg>
              </div>
              <span class="btn-text whitespace-nowrap">Contactez-nous</span>
            </div>
          </a>
        </div>
      </div>
    `;
  }).join('');

  const swiperSlides = slidesContainer.querySelectorAll('.swiper-slide');

  function handleSlideMedia(swiper) {
    swiperSlides.forEach((slide, idx) => {
      const videos = slide.querySelectorAll('video');
      videos.forEach((video) => {
        if (idx === swiper.realIndex) {
          video.currentTime = 0;
          video.play().catch(() => console.log('Autoplay blocked'));
        } else {
          video.pause();
          video.currentTime = 0;
        }
      });
    });
  }

  function startSlideTimer(swiper) {
    if (currentTimer) clearTimeout(currentTimer);
    const currentSlide = shuffledSlides[swiper.realIndex % shuffledSlides.length];
    const delay = currentSlide.delay || 6000;
    currentTimer = setTimeout(() => {
      swiper.slideNext();
    }, delay);
  }

  const swiper = new Swiper('[data-carousel]', {
    effect: 'cube',
    cubeEffect: {
      slideShadows: false,
      shadow: false,
    },
    loop: true,
    speed: 500,
    resizeObserver: true,
    navigation: {
      prevEl: '.custom-prev-btn',
      nextEl: '.custom-next-btn',
    },
    a11y: {
      enabled: true,
      prevSlideMessage: 'Slide précédent',
      nextSlideMessage: 'Slide suivant',
    },
    on: {
      init: (swiper) => {
        handleSlideMedia(swiper);
        startSlideTimer(swiper);
      },
      slideChange: (swiper) => {
        handleSlideMedia(swiper);
        startSlideTimer(swiper);
      },
      resize: (swiper) => {
        swiper.update();
        slidesContainer.style.height = `${window.innerHeight}px`;
      },
    },
  });

  swiperInstance = swiper;

  slidesContainer.style.height = `${window.innerHeight}px`;

  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      swiper.update();
      slidesContainer.style.height = `${window.innerHeight}px`;
    }, 100);
  });

 lazyLoadImages(document.querySelectorAll('.lazy-image'));
}



/**
 * Initialise le carrousel des témoignages avec un design futuriste et une boucle infinie
 */
function initTestimonialsCarousel() {
  const testimonialsContainer = document.getElementById('testimonials-list');
  const loadingIndicator = document.getElementById('testimonials-loading');
  if (!testimonialsContainer) {
    //console.log('Conteneur des témoignages non trouvé');
    return;
  }

  if (MOCK_TESTIMONIALS.length === 0) {
    loadingIndicator?.classList.add('hidden');
    document.getElementById('no-testimonials')?.classList.remove('hidden');
    return;
  }

  testimonialsContainer.innerHTML = MOCK_TESTIMONIALS.map((testimonial, index) => {
    const rating = Math.min(Math.max(Number(testimonial.rating), 0), 5);
    const expandIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><polyline points="6 9 12 15 18 9"></polyline></svg>`;
    const collapseIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><polyline points="18 15 12 9 6 15"></polyline></svg>`;

    return `
      <div class="swiper-slide rounded-3xl">
        <div class="testimonial-card-futuristic relative p-6 bg-ll-white-800 dark:bg-ll-black-950 rounded-3xl border border-blue-600/20 dark:border-white/50 shadow-lg hover:shadow-2xl transition-all duration-500 ease-in-out h-full flex flex-col justify-between transform hover:-translate-y-2" data-aos="fade-up" data-aos-delay="${index * 100}">
          <div class="flex items-center mb-4">
            <img src="${testimonial.image}" data-src="${testimonial.image}" class="w-16 h-16 rounded-full object-cover mr-4 border-2 border-blue-500 lazy" alt="Photo de ${testimonial.author}">
            <div>
              <p class="font-bold text-lg text-white-400">${testimonial.author}</p>
              <p class="text-sm text-gray-400">${testimonial.title}</p>
              <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">${testimonial.location} - ${new Date(testimonial.submitted_at).toLocaleDateString('fr-FR')}</p>
            </div>
          </div>
          <div class="flex items-center mb-4">
            ${Array(rating).fill('<i class="fas fa-star text-yellow-400" aria-hidden="true"></i>').join('')}
            ${Array(5 - rating).fill('<i class="fas fa-star text-gray-600" aria-hidden="true"></i>').join('')}
          </div>
          <p class="text-base italic text-ll-black-300 dark:text-ll-white flex-grow transition-all duration-300 testimonial-text line-clamp-3">${testimonial.text}</p>
          
          <div class="text-center mt-6 flex justify-between items-center">
            <button class="view-full-testimonial flex items-center back-text bg-ll-blue text-ll-white py-2 px-4 rounded-full font-semibold hover:bg-ll-dark-blue transition-colors"
                    data-testimonial-id="${testimonial.id}" aria-label="Voir le témoignage complet de ${testimonial.author}">
                    ${expandIcon}
             <span class="ml-2"> Voir le complet </span>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  lazyLoadImages(document.querySelectorAll('.testimonial-card-futuristic img.lazy'));

  const swiperOptions = {
    slidesPerView: 1,
    spaceBetween: 30,
    effect: 'slide',
    loop: true,
    speed: 1000,
    autoplay: {
      delay: 1000,
      disableOnInteraction: false,
      pauseOnMouseEnter: true, 
    },
    breakpoints: {
      640: { slidesPerView: 2, spaceBetween: 20 },
      1024: { slidesPerView: 3, spaceBetween: 30 },
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
      renderBullet: (index, className) => `<span class="${className} w-3 h-3 bg-gray-600 dark:bg-gray-400 rounded-full transition-all duration-300 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Aller au témoignage ${index + 1}"></span>`,
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    a11y: {
      enabled: true,
      prevSlideMessage: 'Témoignage précédent',
      nextSlideMessage: 'Témoignage suivant',
      paginationBulletMessage: 'Aller au témoignage {{index}}',
    },
  };

  const swiper = new Swiper('.testimonials-swiper', swiperOptions);

  loadingIndicator?.classList.add('hidden');
  document.querySelector('.testimonials-swiper')?.classList.remove('hidden');

  // Event listeners for opening the full testimonial modal
  document.querySelectorAll('.view-full-testimonial').forEach(button => {
    button.addEventListener('click', () => {
      const testimonialId = button.dataset.testimonialId;
      const testimonial = MOCK_TESTIMONIALS.find(t => t.id === testimonialId);
      if (testimonial) {
        openTestimonialModal(testimonial);
      }
    });
  });
}

/**
 * Ouvre une modale futuriste pour un témoignage complet
 * @param {Object} testimonial - Données du témoignage
 */
function openTestimonialModal(testimonial) {
  const modal = document.createElement('div');
  modal.id = 'testimonial-modal';
  modal.className = 'fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 md:p-6 transition-opacity duration-500 opacity-0';

  modal.innerHTML = `
<div class="modal-content bg-white dark:bg-ll-black/20 rounded-2xl shadow-2xl max-w-3xl w-full mx-auto overflow-hidden max-h-[90vh] overflow-y-auto transform scale-95 transition-transform duration-500">
      <button class="modal-close absolute top-4 right-4 z-10 bg-white dark:bg-gray-700 rounded-xl p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shadow-md" aria-label="Fermer la modale">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    
      <div class="grid grid-cols-1 gap-6 p-6 md:p-8">
      <div class="flex flex-row items-center text-center space-y-2">
          <img src="${testimonial.image}" class="w-32 h-32 rounded-full object-cover mb-4 border-4 border-blue-200 dark:border-gray-600 shadow-md" alt="Photo de ${testimonial.author}">
          <div>
          <h3 class="text-2xl font-sans font-bold text-gray-900 dark:text-white">${testimonial.author}</h3>
          <p class="text-blue-600 dark:text-blue-400 font-medium">${testimonial.title}</p>
          <div class="mt-2 flex justify-center">
            ${Array(testimonial.rating).fill('<svg class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.97a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.97c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.54-1.118l1.287-3.97a1 1 0 00-.364-1.118L2.098 9.397c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.97z"/></svg>').join('')}
            ${Array(5 - testimonial.rating).fill('<svg class="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.97a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.97c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.54-1.118l1.287-3.97a1 1 0 00-.364-1.118L2.098 9.397c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.97z"/></svg>').join('')}
          </div>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">${testimonial.location} - ${new Date(testimonial.submitted_at).toLocaleDateString('fr-FR')}</p>
        </div>
        </div>
        <div class="bg-white dark:bg-gray-700 p-4 rounded-xl shadow-sm">
          <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Témoignage Complet
          </h4>
          <p class="text-gray-700 dark:text-gray-300 italic leading-relaxed mb-4">${testimonial.text}</p>
          <p class="text-gray-700 dark:text-gray-300 leading-relaxed">${testimonial.details}</p>
        </div>
        <div class="bg-white dark:bg-gray-700 p-4 rounded-xl shadow-sm">
          <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Images du Travail Réalisé
          </h4>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
            ${testimonial.workImages.map(img => `
              <a href="${img}" target="_blank" rel="noopener noreferrer">
                <img src="${img}" class="w-full h-32 object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300" alt="Image du travail réalisé pour ${testimonial.author}" loading="lazy">
              </a>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  setTimeout(() => {
    modal.classList.remove('opacity-0');
    modal.classList.add('opacity-100');
    modal.querySelector('.modal-content').classList.remove('scale-95');
    modal.querySelector('.modal-content').classList.add('scale-100');
  }, 10);

  const closeModal = () => {
    modal.classList.remove('opacity-100');
    modal.classList.add('opacity-0');
    modal.querySelector('.modal-content').classList.remove('scale-100');
    modal.querySelector('.modal-content').classList.add('scale-95');
    setTimeout(() => modal.remove(), 500);
    document.body.style.overflow = 'auto';
  };

  modal.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', closeModal);
  });

  modal.addEventListener('click', e => {
    if (e.target === modal) {
      closeModal();
    }
  });

  modal.querySelector('.modal-close').focus();
  document.body.style.overflow = 'hidden';
}



let typingInterval = null;

   
    /**
     * Simule une frappe de texte dans un élément.
     * @param {HTMLElement} element - L'élément où afficher le texte.
     * @param {string} text - Le texte complet à taper.
     * @param {number} speed - La vitesse de frappe en ms.
     */
    function typeAnswer(element, text, speed = 1) {
      if (typingInterval) clearInterval(typingInterval);
      let i = 0;
      element.innerHTML = '';
      const cursor = '<span class="typing-cursor"></span>';
      element.innerHTML = cursor;

      typingInterval = setInterval(() => {
        if (i < text.length) {
          element.innerHTML = text.substring(0, i + 1) + cursor;
          i++;
        } else {
          clearInterval(typingInterval);
          setTimeout(() => {
            if (element.querySelector('.typing-cursor')) {
              element.querySelector('.typing-cursor').style.display = 'none';
            }
          }, 1000);
        }
      }, speed);
    }

/*

function typeAnswer(element, text, speed = 10) {
  if (!element) return;
  
  element.innerHTML = '';
  let i = 0;
  
  function typeWriter() {
    if (i < text.length) {
      element.innerHTML += text.charAt(i);
      i++;
      setTimeout(typeWriter, speed);
    }
  }
  
  typeWriter();
}
    

  
*/
   /**
 * Initialise la section FAQ avec accordéon animé, filtres par catégorie, pagination, icônes SVG,
 * fermeture automatique des autres accordéons, effet de typing, et bouton de contact
 */
function initFAQSection() {
  const faqContainer = document.getElementById('faq-list');
  const paginationContainer = document.querySelector('.faq-pagination');
  if (!faqContainer || !paginationContainer) {
    // console.warn('Conteneur FAQ ou pagination non trouvé');
    return;
  }

  // Paramètres de pagination
  const ITEMS_PER_PAGE = 5;
  let currentPage = 1;
  let currentFilter = 'all';

  // Icones
  const expandIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-500 dark:text-gray-400">
    <path d="M6 9l6 6 6-6"/>
  </svg>`;
  
  const collapseIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-500 dark:text-gray-400">
    <path d="M6 15l6-6 6 6"/>
  </svg>`;

  // Fonction pour rendre les items FAQ
  function renderFAQItems(page = 1, filter = 'all') {
    const filteredFAQ = filter === 'all' ? MOCK_FAQ : MOCK_FAQ.filter(faq => faq.category === filter);
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedFAQ = filteredFAQ.slice(startIndex, endIndex);

    faqContainer.innerHTML = paginatedFAQ.map((faq, index) => `
      <div class="faq-item bg-gradient-to-br from-gray-50/50 to-white/50 dark:from-gray-900/50 dark:to-gray-800/50 backdrop-blur-sm rounded-2xl mb-6 overflow-hidden border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1" data-category="${faq.category}" data-aos="fade-up" data-aos-delay="${index * 100}">
        <button class="faq-toggle w-full text-left p-6 flex justify-between items-center focus:outline-none focus:ring-0 rounded-t-2xl transition-all duration-300 group" aria-expanded="false" aria-controls="faq-content-${startIndex + index}">
          <div class="flex items-center gap-4">
            <div class="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <i class="bi ${faq.icon} text-green-600 dark:text-green-400 text-xl"></i>
            </div>
            <div class="text-left">
              <span class="text-lg font-semibold text-gray-900 dark:text-white block group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">${faq.question}</span>
              <span class="text-xs text-gray-500 dark:text-gray-400 mt-1 inline-block px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800">
                ${faq.category}
              </span>
            </div>
          </div>
          <span class="faq-icon ml-4 flex-shrink-0 group-hover:scale-125 transition-transform duration-300">${expandIcon}</span>
        </button>
        <div id="faq-content-${startIndex + index}" class="faq-content hidden px-6 pb-6">
          <div class="pl-16 border-l-2 border-green-200 dark:border-green-800/50 ml-4">
            <div class="relative">
              <div class="absolute -left-8 top-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                <div class="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400"></div>
              </div>
              <p class="faq-answer-text text-gray-700 dark:text-gray-300 leading-relaxed text-base pl-4 mb-6 min-h-[60px]"></p>
            </div>
            <div class="flex flex-wrap gap-3 mt-4 pl-4">
              <a href="#contact" class="flex items-center hidden lg:flex gap-2 py-2.5 bg-white dark:bg-gray-600/30 shadow-xl border-2 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white py-3 px-4 rounded-xl font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                Besoin de précisions ?
                
              </a>
              <a href="#contact" class="flex shadow-xl  items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 transform hover:-translate-y-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M13 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V9l-7-7z"></path>
                  <path d="M13 3v6h6"></path>
                </svg>
                Demander un devis
              </a>
            </div>
          </div>
        </div>
      </div>
    `).join('');

    const totalPages = Math.ceil(filteredFAQ.length / ITEMS_PER_PAGE);
    paginationContainer.innerHTML = `
      <div class="flex items-center gap-2">
        <button class="faq-prev-page no-border bg-gradient-to-r from-green-500 to-emerald-600 w-10 h-10 rounded-xl  text-gray-700 dark:text-gray-300 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105" ${currentPage === 1 ? 'disabled' : ''}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 18l-6-6 6-6"></path>
          </svg>
        </button>
        <div class="flex items-center gap-2">
          ${Array.from({ length: totalPages }, (_, i) => `
            <button class="faq-page-btn no-border w-10 h-10 rounded-xl flex items-center justify-center font-medium transition-all duration-300 hover:scale-105 ${
              i + 1 === currentPage 
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/25' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }" data-page="${i + 1}">
              ${i + 1}
            </button>
          `).join('')}
        </div>
        <button class="faq-next-page no-border w-10 h-10 rounded-xl bg-gradient-to-r from-green-500  to-emerald-600 text-gray-700 dark:text-gray-300 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105" ${currentPage === totalPages ? 'disabled' : ''}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 18l6-6-6-6"></path>
          </svg>
        </button>
      </div>
    `;

    // Gestion des toggles avec effet de typing
    const toggles = faqContainer.querySelectorAll('.faq-toggle');
    toggles.forEach(button => {
      button.addEventListener('click', () => {
        const content = button.nextElementSibling;
        const icon = button.querySelector('.faq-icon');
        const isExpanded = content.classList.contains('hidden');
        const parent = button.closest('#faq-list');
        const textElement = content.querySelector('.faq-answer-text');
        const faqIndex = parseInt(content.id.replace('faq-content-', '')) % MOCK_FAQ.length;
        const answerText = filteredFAQ[faqIndex].answer;

        // Fermer tous les autres
        parent.querySelectorAll('.faq-content').forEach(otherContent => {
          if (otherContent !== content && !otherContent.classList.contains('hidden')) {
            otherContent.classList.add('hidden');
            const otherButton = otherContent.previousElementSibling;
            otherButton.querySelector('.faq-icon').innerHTML = expandIcon;
            otherButton.setAttribute('aria-expanded', 'false');
            if (otherContent.querySelector('.faq-answer-text')) {
              otherContent.querySelector('.faq-answer-text').innerHTML = '';
            }
          }
        });

        // Toggle actuel
        content.classList.toggle('hidden');
        icon.innerHTML = isExpanded ? collapseIcon : expandIcon;
        button.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');

        // Animation d'ouverture
        if (isExpanded) {
          content.style.maxHeight = '0';
          content.style.overflow = 'hidden';
          setTimeout(() => {
            content.style.maxHeight = '500px';
            setTimeout(() => {
              content.style.maxHeight = 'none';
            }, 500);
          }, 10);
          
          // Effet de typing
          typeAnswer(textElement, answerText, 5);
        } else {
          textElement.innerHTML = answerText;
        }
      });
    });

    // Gestion de la pagination
    paginationContainer.querySelectorAll('.faq-page-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        currentPage = parseInt(btn.dataset.page);
        renderFAQItems(currentPage, currentFilter);
      });
    });

    paginationContainer.querySelector('.faq-prev-page')?.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        renderFAQItems(currentPage, currentFilter);
      }
    });

    paginationContainer.querySelector('.faq-next-page')?.addEventListener('click', () => {
      if (currentPage < Math.ceil(filteredFAQ.length / ITEMS_PER_PAGE)) {
        currentPage++;
        renderFAQItems(currentPage, currentFilter);
      }
    });
  }

  // Gestion des filtres
  const filterButtons = document.querySelectorAll('.faq-filter-btn');
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      currentFilter = button.dataset.filter;
      currentPage = 1;

      filterButtons.forEach(btn => {
        btn.classList.remove('bg-gradient-to-r', 'from-green-500', 'to-emerald-600', 'text-white', 'shadow-lg', 'shadow-green-500/25');
        btn.classList.add('bg-gray-100', 'dark:bg-gray-800', 'text-gray-700', 'dark:text-gray-300');
      });
      
      button.classList.remove('bg-gray-100', 'dark:bg-gray-800', 'text-gray-700', 'dark:text-gray-300');
      button.classList.add('bg-gradient-to-r', 'from-green-500', 'to-emerald-600', 'text-white', 'shadow-lg', 'shadow-green-500/25');

      renderFAQItems(currentPage, currentFilter);
    });
  });

  // Initialisation
  renderFAQItems(currentPage, currentFilter);
}


/**
* Initializes the team section with a carousel, filters, and modal functionality.
* Ensures accessibility, lazy loading, and smooth animations for a professional experience.
*/
function initTeamSection() {
            const teamContainer = document.getElementById('team-list');
            const modal = document.getElementById('team-modal');
            const header = document.getElementById('blurred-header');
            const modalContent = document.getElementById('modal-content');
            const modalClose = document.getElementById('modal-close');

            if (!teamContainer || !modal || !modalContent || !modalClose) {
               // console.warn('Team container or modal elements not found');
                return;
            }

            let currentFilter = 'all';
            let swiperInstance = null;

            /**
             * Anime le cercle de progression.
             * @param {HTMLElement} circleElement - L'élément <circle> à animer.
             * @param {number} value - La valeur cible (0-100).
             */
            function animateCircularProgress(circleElement, value) {
                const radius = circleElement.r.baseVal.value;
                const circumference = 2 * Math.PI * radius;
                const offset = circumference - (value / 100) * circumference;

                circleElement.style.strokeDasharray = `${circumference} ${circumference}`;
                // Initialise l'offset pour l'animation
                circleElement.style.strokeDashoffset = circumference; 

                setTimeout(() => {
                    circleElement.style.transition = 'stroke-dashoffset 1.5s ease-out';
                    circleElement.style.strokeDashoffset = offset;
                }, 50);

                // Animation du compteur de valeur
                const valueDisplay = circleElement.closest('.circular-progress').querySelector('.progress-value');
                if (valueDisplay) {
                    let start = 0;
                    const end = value;
                    const duration = 1500;
                    const increment = end / (duration / 20);

                    const timer = setInterval(() => {
                        start += increment;
                        if (start >= end) {
                            start = end;
                            clearInterval(timer);
                        }
                        valueDisplay.textContent = `${Math.round(start)}%`;
                    }, 20);
                }
            }


            /**
             * Renders team cards based on the selected filter and reinitializes the Swiper carousel.
             * @param {string} filter - The category to filter by ('all', 'management', 'cleaning', 'technical')
             */
            function renderTeamCards(filter = 'all') {


                const filteredTeam = filter === 'all' ? MOCK_TEAM : MOCK_TEAM.filter(member => member.roleCategory === filter);


                teamContainer.innerHTML = filteredTeam.map((member, index) => `
                    <div class="swiper-slide">
                        <div class="team-card bg-ll-white-800 dark:bg-ll-black-950 rounded-3xl border border-blue-600/20 dark:border-ll-medium-gray shadow-lg p-6 flex flex-col items-start hover:shadow-xl transition-all duration-300 transform "  ">
                            <div class="flex items-center space-x-4 mb-4">
                                <img src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" data-src="${member.image}" class="w-20 h-20 rounded-full object-cover border-2 border-blue-400 lazy" alt="Photo de ${member.name}" loading="lazy">
                                <div>
                                    <h4 class="text-lg font-cinzel font-semibold text-gray-900 dark:text-white">${member.name}</h4>
                                    <p class="text-sm text-blue-600 dark:text-blue-400">${member.role}</p>
                                </div>
                            </div>
                            <div class="mb-4 w-full">
                                ${member.skills.slice(0, 3).map(skill => `
                                    <div class="flex items-center justify-between text-sm text-gray-700 dark:text-gray-300 mb-2">
                                        <span class="flex items-center">
                                            <span class="dark:text-blue-400">${skill.icon}</span>
                                            <span class="ml-2">${skill.name}</span>
                                        </span>
                                        <span>${skill.level}%</span>
                                    </div>
                                `).join('')}
                            </div>
                           <button
                              class="team-modal-btn inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 dark:bg-transparent border-blue-400 border hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                              data-member-id="${member.name.replace(/\s+/g, '-').toLowerCase()}"
                              aria-label="Voir le profil de ${member.name}"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white transition-transform duration-200 group-hover:translate-x-1" fill="currentColor" viewBox="0 0 24 24">
                               <g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-.696-3.534c.63 0 1.332-.288 2.196-1.458l.911-1.22a.334.334 0 0 0-.074-.472.38.38 0 0 0-.505.06l-1.475 1.679a.241.241 0 0 1-.279.061.211.211 0 0 1-.12-.244l1.858-7.446a.499.499 0 0 0-.575-.613l-3.35.613a.35.35 0 0 0-.276.258l-.086.334a.25.25 0 0 0 .243.312h1.73l-1.476 5.922c-.054.234-.144.63-.144.918 0 .666.396 1.296 1.422 1.296zm1.83-10.536c.702 0 1.242-.414 1.386-1.044.036-.144.054-.306.054-.414 0-.504-.396-.972-1.134-.972-.702 0-1.242.414-1.386 1.044a1.868 1.868 0 0 0-.054.414c0 .504.396.972 1.134.972z" ></path></g>
                              </svg>
                              <span>En savoir plus</span>
                            </button>

                        </div>
                    </div>
                `).join('');

                // Lazy load images
                const lazyImages = document.querySelectorAll('img.lazy');
                const observer = new IntersectionObserver((entries, observer) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            img.src = img.dataset.src;
                            img.classList.add('loaded');
                            observer.unobserve(img);
                        }
                    });
                }, { rootMargin: '100px' });
                lazyImages.forEach(img => observer.observe(img));

                // Destroy existing Swiper instance if it exists
                if (swiperInstance) swiperInstance.destroy(true, true);

                // Initialize Swiper
                swiperInstance = new Swiper('.team-swiper', {
                    slidesPerView: 1,
                    spaceBetween: 16,
                    centeredSlides: true,
                    loop: filteredTeam.length >= 4,
                    autoplay: filteredTeam.length >= 4 ? { 
                        delay: 5000, 
                        disableOnInteraction: false 
                    } : false,
                    pagination: {
                        el: '.team-swiper-pagination',
                        clickable: true,
                        bulletClass: 'swiper-pagination-bullet w-3 h-3 bg-gray-300 dark:bg-gray-600 opacity-70 transition-all',
                        bulletActiveClass: 'swiper-pagination-bullet-active bg-white scale-125 opacity-100',
                      renderBullet: (index, className) => `<span class="${className} w-3 h-3 bg-gray-600 dark:bg-gray-400 rounded-full transition-all duration-300 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Aller diapositive ${index + 1}"></span>`,
    
                    },
                    breakpoints: {
                        640: { slidesPerView: 1, spaceBetween: 16, centeredSlides: true },
                        768: { slidesPerView: 2, spaceBetween: 20, centeredSlides: false },
                        1024: { slidesPerView: 3, spaceBetween: 24, centeredSlides: false },
                        1280: { slidesPerView: 4, spaceBetween: 24, centeredSlides: false }
                    },
                    a11y: {
                        enabled: true,
                        prevSlideMessage: 'Membre précédent',
                        nextSlideMessage: 'Membre suivant',
                        paginationBulletMessage: 'Aller au membre {{index}}'
                    }
                });

               

                // Attach modal button listeners
                document.querySelectorAll('.team-modal-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const memberId = btn.dataset.memberId;
                        const member = MOCK_TEAM.find(m => m.name.replace(/\s+/g, '-').toLowerCase() === memberId);

                        if (member) {
                            // Génération des classes de couleur dynamiques pour la performance
                            const getPerformanceColorClass = (value) => {
                                if (value >= 90) return 'text-green-500';
                                if (value >= 80) return 'text-blue-600 dark:text-blue-400';
                                if (value >= 70) return 'text-yellow-500';
                                return 'text-red-500';
                            };

                            modalContent.innerHTML = `
                                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
                                    <div class="space-y-6">
                                        <div class="text-center">
                                            <img src="${member.image}" class="w-32 h-32 rounded-full object-cover mx-auto mb-4 border-4 border-blue-200 dark:border-gray-600 shadow-md" alt="Photo de ${member.name}">
                                            <h3 class="text-2xl font-cinzel font-bold text-gray-900 dark:text-white">${member.name}</h3>
                                            <p class="text-blue-600 dark:text-blue-400 font-medium">${member.role}</p>
                                            <div class="mt-2 flex items-center justify-center text-sm text-gray-600 dark:text-gray-400">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                ${member.yearsExperience} ans d'expérience
                                            </div>
                                            <div class="mt-2 flex items-center justify-center text-sm text-gray-600 dark:text-gray-400">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                </svg>
                                                ${member.projectsCompleted} projets réalisés
                                            </div>
                                        </div>
                                        <div class="bg-blue-50 dark:bg-gray-700 p-4 rounded-xl shadow-sm">
                                            <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                En Action
                                            </h4>
                                            <div class="grid grid-cols-3 gap-2">
                                                ${member.actionImages.map(img => `
                                                    <img src="${img}" class="w-full h-20 object-cover rounded-lg" alt="Photo d'action de ${member.name}" loading="lazy">
                                                `).join('')}
                                            </div>
                                        </div>
                                        <div class="bg-blue-50 dark:bg-gray-700 p-4 rounded-xl shadow-sm">
                                            <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                                Compétences
                                            </h4>
                                            <div id="skills-progress" class="grid grid-cols-2 gap-4">
                                                ${member.skills.map(skill => `
                                                    <div class="flex flex-col items-center" data-skill-level="${skill.level}">
                                                        <div class="circular-progress w-20 h-20">
                                                            <svg class="w-full h-full" viewBox="0 0 100 100">
                                                                <circle class="text-gray-200 dark:text-gray-600 stroke-current" stroke-width="8" cx="50" cy="50" r="40" fill="transparent" />
                                                                <circle class="circular-progress-circle skill-progress-circle text-blue-600 dark:text-blue-400 stroke-current" stroke-width="8" stroke-linecap="round" cx="50" cy="50" r="40" fill="transparent" style="transition: stroke-dashoffset 1.5s ease-out;" />
                                                            </svg>
                                                            <div class="progress-value text-base font-cinzel font-bold text-gray-900 dark:text-white">0%</div>

                                                        </div>
                                                        <p class="mt-2 text-sm text-center text-gray-700 dark:text-gray-300 flex items-center justify-center">
                                                            ${skill.icon}
                                                            <span class="ml-1">${skill.name}</span>
                                                        </p>
                                                    </div>
                                                `).join('')}



                                            </div>
                                        </div>
                                        <div class="bg-blue-50 dark:bg-gray-700 p-4 rounded-xl shadow-sm">
                                            <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                </svg>
                                                Certifications
                                            </h4>
                                            <ul class="space-y-2">
                                                ${member.certifications.map(cert => `
                                                    <li class="flex items-start text-sm text-gray-700 dark:text-gray-300">
                                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        ${cert}
                                                    </li>
                                                `).join('')}
                                            </ul>
                                        </div>
                                    </div>
                                    <div class="space-y-6">
                                        <div class="bg-white dark:bg-gray-700 p-4 rounded-xl shadow-sm">
                                            <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                Présentation
                                            </h4>
                                            <p class="text-gray-700 dark:text-gray-300 leading-relaxed">${member.bio}</p>
                                            <div class="mt-4 space-y-2">
                                                <p class="text-sm text-gray-600 dark:text-gray-400">
                                                    <span class="font-medium">Disponibilité :</span> ${member.availability}
                                                </p>
                                                <p class="text-sm text-gray-600 dark:text-gray-400">
                                                    <span class="font-medium">Formation :</span> ${member.education.join(', ')}
                                                </p>
                                                <p class="text-sm text-gray-600 dark:text-gray-400">
                                                    <span class="font-medium">Langues :</span> ${member.languages.join(', ')}
                                                </p>
                                            </div>
                                        </div>
                                        <div class="bg-white dark:bg-gray-700 p-4 rounded-xl shadow-sm">
                                            <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                </svg>
                                                Indicateurs de Performance
                                            </h4>
                                            <div id="performance-progress" class="grid grid-cols-2 gap-4">
                                                ${Object.entries(member.performance).map(([key, value]) => `
                                                    <div class="flex flex-col items-center" data-performance-value="${value}">
                                                        <div class="circular-progress w-20 h-20">
                                                            <svg class="w-full h-full" viewBox="0 0 100 100">
                                                                <circle class="text-gray-200 dark:text-gray-600 stroke-current" stroke-width="8" cx="50" cy="50" r="40" fill="transparent" />
                                                                <circle class="circular-progress-circle performance-progress-circle ${getPerformanceColorClass(value)} stroke-current" stroke-width="8" stroke-linecap="round" cx="50" cy="50" r="40" fill="transparent" style="transition: stroke-dashoffset 1.5s ease-out;" />
                                                            </svg>
                                                            <div class="progress-value text-base font-cinzel font-bold text-gray-900 dark:text-white">0%</div>
                                                        </div>
                                                        <p class="mt-2 text-sm text-center text-gray-700 dark:text-gray-300">${key}</p>
                                                    </div>
                                                `).join('')}
                                            </div>
                                        </div>
                                        <div class="bg-white dark:bg-gray-700 p-4 rounded-xl shadow-sm">
                                            <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 005.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                                Contact & Réseaux
                                            </h4>
                                            <div class="flex flex-col sm:flex-row gap-3">
                                                <a href="${member.socialLinks.linkedin}" class="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors" target="_blank" rel="noopener noreferrer" aria-label="Profil LinkedIn de ${member.name}">
                                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                                                    </svg>
                                                    LinkedIn
                                                </a>
                                                <a href="mailto:${member.socialLinks.email}" class="flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors" aria-label="Envoyer un email à ${member.name}">
                                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                    </svg>
                                                    Email
                                                </a>
                                                <a href="tel:${member.socialLinks.phone}" class="flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors" aria-label="Appeler ${member.name}">
                                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                    </svg>
                                                    Téléphone
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `;

                            modal.classList.add('active');
                            header.classList.remove('z-30'); // Supprimer la classe 'z-30' pour éviter un conflit de z-index avec la modale
                            document.body.style.overflow = 'hidden';

                            if (swiperInstance.autoplay.running) {
                                swiperInstance.autoplay.stop();
                            }

                            // **CORRECTION DES ANIMATIONS DES CERLCE DE PROGRESSION**

                            setTimeout(() => {
                                // 1. Animation des Compétences
                                const skillContainers = modalContent.querySelectorAll('#skills-progress > div');
                                skillContainers.forEach(container => {
                                    const circle = container.querySelector('.skill-progress-circle');
                                    const value = parseInt(container.dataset.skillLevel);
                                    if (circle) animateCircularProgress(circle, value);
                                });

                                // 2. Animation des Indicateurs de Performance
                                const performanceContainers = modalContent.querySelectorAll('#performance-progress > div');
                                performanceContainers.forEach(container => {
                                    const circle = container.querySelector('.performance-progress-circle');
                                    const value = parseInt(container.dataset.performanceValue);
                                    if (circle) animateCircularProgress(circle, value);
                                });
                            }, 100);
                        }
                    });
                });
            }

            // Gestion des filtres
            const filterButtons = document.querySelectorAll('.team-filter-btn');
            filterButtons.forEach(button => {
                button.addEventListener('click', () => {
                    if (button.dataset.filter === currentFilter) return;
                    currentFilter = button.dataset.filter;
                    filterButtons.forEach(btn => {
                        btn.classList.remove('active', 'bg-blue-600', 'text-white');
                        btn.classList.add('bg-white', 'dark:bg-ll-black/20', 'text-gray-700', 'dark:text-gray-200');
                    });
                    button.classList.add('active', 'bg-blue-600', 'text-white');
                    button.classList.remove('bg-white', 'dark:bg-ll-black/20', 'text-gray-700', 'dark:text-gray-200');
                    renderTeamCards(currentFilter);
                   
                   
                });
            });

      


            // Gestion de la fermeture de la modale
            function closeModal() {
                modal.classList.remove('active');
                header.classList.remove('z-30'); // Retirer la classe 'z-30' si la modale est inactive
                document.body.style.overflow = 'auto';

                // Nettoyer les styles d'animation pour les prochaines ouvertures
                modalContent.querySelectorAll('.circular-progress-circle').forEach(circle => {
                    circle.style.transition = 'none';
                    circle.style.strokeDashoffset = circle.r.baseVal.value * 2 * Math.PI; // Réinitialiser
                });
                modalContent.querySelectorAll('.progress-value').forEach(el => el.textContent = '0%');


                setTimeout(() => {
                    if (swiperInstance && MOCK_TEAM.length >= 4) {
                        swiperInstance.autoplay.start();
                    }
                }, 500);
            }

            modalClose.addEventListener('click', closeModal);

            modal.addEventListener('click', e => {
                if (e.target === modal) {
                    closeModal();
                }
            });

            document.addEventListener('keydown', e => {
                if (e.key === 'Escape' && modal.classList.contains('active')) {
                    closeModal();
                }
            });

            // Initialisation
            renderTeamCards(currentFilter);
            
}


/**
 * Initialise la section Partenaires avec deux lignes de défilement infini et modal au clic
 */
function initPartnersSection() {
  const partnersSection = document.getElementById('partners');
  if (!partnersSection) return;

  // Create modal element if not exists
  let modal = document.getElementById('partner-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'partner-modal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden';
    modal.innerHTML = `
      <div class="modal-content bg-white dark:bg-ll-black/20 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 overflow-hidden max-h-[90vh] overflow-y-auto transform scale-95 transition-transform duration-500">
    
      <button id="close-modal" class="modal-close absolute top-4 right-4 z-10 bg-white dark:bg-gray-700 rounded-xl p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shadow-md" aria-label="Fermer la modale">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      
        <div class="text-center mb-6">
          <img id="modal-logo" class="w-24 h-24 mx-auto rounded-full object-cover border-4 border-ll-blue shadow-md" alt="Logo Partenaire">
          <h3 id="modal-name" class="text-2xl font-cinzel font-bold text-ll-black dark:text-ll-white mt-4"></h3>
        </div>
        <div class="space-y-4">
          <h4 class="text-lg font-semibold text-ll-blue dark:text-ll-blue flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Notre Partenariat
          </h4>
          <p id="modal-description" class="text-ll-text-gray dark:text-ll-medium-gray leading-relaxed"></p>
          <a id="modal-website" href="#" target="_blank" rel="noopener noreferrer" class="block bg-ll-blue text-white py-3 rounded-lg hover:bg-ll-dark-blue transition-colors duration-300 shadow-md flex items-center justify-center gap-2 font-semibold">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-18 0m18 0a9 9 0 00-18 0m18 0v.01M3 12a9 9 0 0118 0m-18 0v-.01" />
            </svg>
            Visiter le site
          </a>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    document.getElementById('close-modal').addEventListener('click', closeModal);
  }

  function closeModal() {
    const modalContent = modal.querySelector('div');
    modalContent.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
      modal.classList.add('hidden');
      modalContent.classList.remove('scale-95', 'opacity-0');
    }, 300);
  }

  function openModal(partner) {
    document.getElementById('modal-logo').src = partner.logo;
    document.getElementById('modal-name').textContent = partner.name;
    document.getElementById('modal-description').textContent = partner.description;
    document.getElementById('modal-website').href = partner.website;
    modal.classList.remove('hidden');
    const modalContent = modal.querySelector('div');
    setTimeout(() => {
      modalContent.classList.remove('scale-95', 'opacity-0');
    }, 10);
  }

  // Create two marquee lines
  const marqueeContainer = document.createElement('div');
  marqueeContainer.className = 'space-y-8 marquee-container lg:w-[50rem] relative';
  marqueeContainer.innerHTML = `
    <div class="marquee-wrapper relative flex overflow-hidden">
      <ul class="marquee flex animate-marquee-left"></ul>
    </div>
    <div class="marquee-wrapper relative flex overflow-hidden">
      <ul class="marquee flex animate-marquee-right"></ul>
    </div>
  `;

  document.getElementById('partners-list').replaceWith(marqueeContainer);

  const marqueeLeft = marqueeContainer.querySelector('.animate-marquee-left');
  const marqueeRight = marqueeContainer.querySelector('.animate-marquee-right');

  function renderPartners(marquee, partners) {
    const items = partners.map(partner => `
      <li class="flex-shrink-0 mx-8 partner-item" role="button" tabindex="0" aria-label="${partner.name}">
        <img src="${partner.logo}" alt="${partner.name}" class="w-32 h-auto object-contain cursor-pointer filter grayscale rounded rounded-xl hover:grayscale-0 transition-filter duration-300">
        <p class="text-sm text-ll-black dark:text-ll-white mt-2 text-center font-semibold">${partner.name}</p>
      </li>
    `).join('');
    marquee.innerHTML = items + items;
  }

  renderPartners(marqueeLeft, MOCK_PARTNERS);
  renderPartners(marqueeRight, MOCK_PARTNERS.slice().reverse());

  // Tooltip (simple)
  const tooltipEl = document.createElement('div');
  tooltipEl.id = 'partner-tooltip';
  tooltipEl.className = 'fixed hidden bg-ll-white dark:bg-sidebar-dark p-4 rounded-lg shadow-lg z-50 transition-opacity duration-300 max-w-xs w-fit text-sm';
  document.body.appendChild(tooltipEl);

  let tooltipTimeout;

// Affiche le tooltip
function showTooltip(e, partner) {
  clearTimeout(tooltipTimeout);

  const rect = e.currentTarget.getBoundingClientRect();

  tooltipEl.innerHTML = `
    <h4 class="font-bold text-base">${partner.name}</h4>
    <p class="text-sm mt-1">${partner.description.slice(0, 100)}...</p>
  `;

  tooltipEl.classList.remove('hidden');
  tooltipEl.style.opacity = '0';

  const offset = 12;
  tooltipEl.style.left = `${rect.left + rect.width / 2}px`;
  tooltipEl.style.top = `${rect.top - offset}px`;
  tooltipEl.style.transform = 'translate(-50%, -100%)';

  setTimeout(() => {
    tooltipEl.style.opacity = '1';
  }, 10);
}

// Cache le tooltip avec délai
function hideTooltip() {
  tooltipEl.style.opacity = '0';
  tooltipTimeout = setTimeout(() => {
    tooltipEl.classList.add('hidden');
  }, 200);
}

// Event listeners
marqueeContainer.querySelectorAll('.partner-item').forEach(li => {
  const index = Array.from(li.parentElement.children).indexOf(li) % MOCK_PARTNERS.length;
  const partner = MOCK_PARTNERS[index];

  li.addEventListener('mouseenter', (e) => {
    li.parentElement.style.animationPlayState = 'paused';
    showTooltip(e, partner);
  });

  li.addEventListener('mouseleave', () => {
    li.parentElement.style.animationPlayState = 'running';
    hideTooltip();
  });

  li.addEventListener('click', () => openModal(partner));

  li.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') openModal(partner);
  });
});


}


const EQUIPMENT_DATA = [
    {
        id: 'vacuum',
        name: 'Aspirateur Professionnel',
        image: '/assets/images/equipments/vacuum.png',
        description: 'Aspirateur haute performance pour surfaces variées avec filtration HEPA avancée.'
    },
    {
        id: 'mop',
        name: 'Système de Nettoyage Microfibre',
        image: '/assets/images/equipments/mop.png',
        description: 'Balai à microfibre réutilisable, optimal pour tous types de sols sans traces.'
    },
    {
        id: 'spray',
        name: 'Pulvérisateur Professionnel',
        image: '/assets/images/equipments/spray.png',
        description: 'Pulvérisateur haute pression pour application uniforme de produits de nettoyage.'
    },
    {
        id: 'bucket',
        name: 'Seau de Nettoyage',
        image: '/assets/images/equipments/bucket.png',
        description: 'Seau ergonomique avec essorage intégré pour maximum d\'efficacité.'
    },
    {
        id: 'cloth',
        name: 'Chiffons Microfibre',
        image: '/assets/images/equipments/cloth.png',
        description: 'Chiffons ultra-absorbants, durables et réutilisables pour tous les nettoyages.'
    },
    {
        id: 'polisher',
        name: 'Polisseuse Automatique',
        image: '/assets/images/equipments/polisher.png',
        description: 'Machine de polissage professionnelle pour finitions brillantes et durables.'
    },
    {
        id: 'brush',
        name: 'Brosse Robuste',
        image: '/assets/images/equipments/brush.png',
        description: 'Brosse résistante à poils naturels pour brossage intensif des surfaces.'
    },
    {
        id: 'duster',
        name: 'Plumeau Antipoussière',
        image: '/assets/images/equipments/duster.png',
        description: 'Plumeau électrostatique capturant la poussière sans la disperser.'
    },
    {
        id: 'scraper',
        name: 'Raclette Professionnelle',
        image: '/assets/images/equipments/scraper.png',
        description: 'Raclette fine lame pour enlever résidus et traces sans endommager les surfaces.'
    },
    {
        id: 'pressure_washer',
        name: 'Nettoyeur Haute Pression',
        image: '/assets/images/equipments/pressure_washer.png',
        description: 'Système haute pression puissant pour nettoyage en profondeur des surfaces extérieures.'
    },
    {
        id: 'steam_cleaner',
        name: 'Nettoyeur Vapeur',
        image: '/assets/images/equipments/steam_cleaner.png',
        description: 'Nettoyage vapeur écologique tuant 99.9% des bactéries sans chimie agressive.'
    },
    {
        id: 'floor_machine',
        name: 'Machine à Laver les Sols',
        image: '/assets/images/equipments/floor_machine.png',
        description: 'Machine professionnelle de nettoyage sols automatisée haute performance.'
    },
    {
        id: 'window_squeegee',
        name: 'Raclette à Vitres',
        image: '/assets/images/equipments/window_squeegee.png',
        description: 'Raclette caoutchouc premium pour vitres sans traces et brillantes.'
    },
    {
        id: 'industrial_vacuum',
        name: 'Aspirateur Industriel',
        image: '/assets/images/equipments/industrial_vacuum.png',
        description: 'Aspirateur grande capacité pour zones de grand volume de débris.'
    },
    {
        id: 'disinfectant_sprayer',
        name: 'Pulvérisateur Désinfectant',
        image: '/assets/images/equipments/disinfectant_sprayer.png',
        description: 'Système de pulvérisation pour produits désinfectants antimicrobiens.'
    },
    {
        id: 'microfiber_cloth',
        name: 'Chiffon Microfibre Spécialisé',
        image: '/assets/images/equipments/microfiber_cloth.png',
        description: 'Microfibre premium avec des propriétés antistatiques et antisalissures.'
    },
    {
        id: 'feather_duster',
        name: 'Plumeau à Poussière',
        image: '/assets/images/equipments/feather_duster.png',
        description: 'Plumeau poils naturels pour époussetage délicat des surfaces sensibles.'
    },
    {
        id: 'car_vacuum',
        name: 'Aspirateur Auto',
        image: '/assets/images/equipments/car_vacuum.png',
        description: 'Aspirateur portatif adapté aux espaces restreints des véhicules.'
    }
];


/**
 * Initialise la section Équipements avec animation défilement infini
 */
function initEquipmentSection() {
    const equipmentSection = document.getElementById('equipment');
    if (!equipmentSection) return;

    // Créer l'élément modal s'il n'existe pas
    let modal = document.getElementById('equipment-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'equipment-modal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden';
        modal.innerHTML = `
            <div class="modal-content bg-white dark:bg-ll-black rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 overflow-hidden max-h-[90vh] overflow-y-auto transform scale-95 transition-transform duration-500">
                <button id="close-equipment-modal" class="modal-close absolute top-4 right-4 z-10 bg-white dark:bg-ll-black/30 shadow-xl sdhadow-white rounded-xl p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shadow-md" aria-label="Fermer la modale">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                
                <div class="text-center mb-6">
                     <img 
                        id="equipment-modal-image"
                        data-fallback="/assets/images/equipments/fallback.png"
                        class="w-full h-full object-contain filter transition-all duration-500 rounded-xl group-hover:filter-none loading-image lazy-load"
                        loading="lazy"
                        onerror="this.src='/assets/images/equipments/fallback.png'; this.classList.remove('filter', 'blur-sm')"
                        onload="this.classList.remove('filter', 'blur-sm', 'loading-image'); this.classList.add('loaded')"
                    >
                    <h3 id="equipment-modal-name" class="text-2xl font-cinzel font-bold text-ll-black dark:text-ll-white mt-4"></h3>
                </div>
                <div class="space-y-4">
                    <h4 class="text-lg font-semibold text-ll-white flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
                        </svg>
                        Caractéristiques
                    </h4>
                    <p id="equipment-modal-description" class="text-ll-text-gray dark:text-ll-medium-gray leading-relaxed"></p>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeEquipmentModal();
        });

        document.getElementById('close-equipment-modal').addEventListener('click', closeEquipmentModal);
    }

    function closeEquipmentModal() {
        const modalContent = modal.querySelector('div');
        modalContent.classList.add('scale-95', 'opacity-0');
        setTimeout(() => {
            modal.classList.add('hidden');
            modalContent.classList.remove('scale-95', 'opacity-0');
        }, 300);
    }

    function openEquipmentModal(equipment) {
        document.getElementById('equipment-modal-image').src = equipment.image;
        document.getElementById('equipment-modal-name').textContent = equipment.name;
        document.getElementById('equipment-modal-description').textContent = equipment.description;
        modal.classList.remove('hidden');
        const modalContent = modal.querySelector('div');
        setTimeout(() => {
            modalContent.classList.remove('scale-95', 'opacity-0');
        }, 10);
    }

    // Créer le conteneur marquee
    const marqueeContainer = document.createElement('div');
    marqueeContainer.className = 'space-y-8 marquee-container';
    marqueeContainer.innerHTML = `
        <div class="marquee-wrapper relative flex overflow-hidden rounded-xl">
            <ul class="marquee flex animate-marquee-left"></ul>
        </div>
        <div class="marquee-wrapper relative flex overflow-hidden rounded-xl">
            <ul class="marquee flex animate-marquee-right"></ul>
        </div>
    `;

    document.getElementById('equipment-list').replaceWith(marqueeContainer);

    const marqueeLeft = marqueeContainer.querySelector('.animate-marquee-left');
    const marqueeRight = marqueeContainer.querySelector('.animate-marquee-right');

    function renderEquipment(marquee, equipment) {
        const fallbackImage = '/assets/images/equipments/fallback.png';

        const items = equipment.map(item => `
            <li class="flex-shrink-0 mx-4 equipment-item" role="button" tabindex="0" aria-label="${item.name}" data-equipment-name="${item.name}">
                <div class="bg-white rounded-xl hover:shadow-xl transition-all duration-300 cursor-pointer w-[15rem] dark:bg-gray-600/30 border boder-1 border-gray-200 dark:border-gray-600">
                    <div class="relative overflow-hidden rounded-lg h-40 flex items-center justify-center">
                       <img 
                            src="${item.image}"
                            data-fallback="${fallbackImage}"
                            alt="${item.name}"
                            class="w-full h-full object-contain no-lightbox p-2 transition-all duration-500 filter-none loading-image lazy-load"
                            loading="lazy"
                            onerror="this.src='${fallbackImage}'; this.classList.remove('filter', 'blur-sm')"
                            onload="this.classList.remove('filter', 'blur-sm', 'loading-image'); this.classList.add('loaded')"
                        />
                    </div>
                    <span class="text-sm text-ll-black italic dark:text-ll-white mt-3 text-center line-clamp-2">${item.name}</span>
                </div>
            </li>
        `).join('');
        marquee.innerHTML = items + items; // Duplication pour l'effet infini
    }

    renderEquipment(marqueeLeft, EQUIPMENT_DATA);
    renderEquipment(marqueeRight, EQUIPMENT_DATA.slice().reverse());

    const tooltipEl = document.createElement('div');
    tooltipEl.id = 'equipment-tooltip';
    tooltipEl.className = 'fixed hidden bg-ll-white dark:bg-ll-black p-4 rounded-lg shadow-lg z-50 transition-opacity duration-300 max-w-xs w-fit text-sm border-l-4 border-ll-blue';
    document.body.appendChild(tooltipEl);

    let tooltipTimeout;

    function showTooltip(e, equipment) {
        clearTimeout(tooltipTimeout);
        const rect = e.currentTarget.getBoundingClientRect();

        tooltipEl.innerHTML = `
            <h4 class="font-bold text-base text-ll-black dark:text-ll-white">${equipment.name}</h4>
            <p class="text-sm mt-1 text-ll-text-gray dark:text-ll-medium-gray">${equipment.description.slice(0, 100)}...</p>
        `;

        tooltipEl.classList.remove('hidden');
        tooltipEl.style.opacity = '0';

        const offset = 12;
        tooltipEl.style.left = `${rect.left + rect.width / 2}px`;
        tooltipEl.style.top = `${rect.top - offset}px`;
        tooltipEl.style.transform = 'translate(-50%, -100%)';

        setTimeout(() => {
            tooltipEl.style.opacity = '1';
        }, 10);
    }

    function hideTooltip() {
        tooltipEl.style.opacity = '0';
        tooltipTimeout = setTimeout(() => {
            tooltipEl.classList.add('hidden');
        }, 200);
    }

    // Event listeners pour tous les éléments d'équipement
    marqueeContainer.querySelectorAll('.equipment-item').forEach(li => {
        const equipmentName = li.getAttribute('data-equipment-name');
        // Trouver l'équipement correspondant dans EQUIPMENT_DATA
        const equipment = EQUIPMENT_DATA.find(item => item.name === equipmentName);

        if (!equipment) return;

        li.addEventListener('mouseenter', (e) => {
            li.parentElement.style.animationPlayState = 'paused';
            showTooltip(e, equipment);
        });

        li.addEventListener('mouseleave', () => {
            li.parentElement.style.animationPlayState = 'running';
            hideTooltip();
        });

        li.addEventListener('click', () => openEquipmentModal(equipment));

        li.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') openEquipmentModal(equipment);
        });
    });
}

document.addEventListener('DOMContentLoaded', initEquipmentSection);

/**
 * Initialise la section Blog avec carrousel
 */
function initBlogSection() {
  const blogContainer = document.getElementById('blog-list');
  if (!blogContainer) {
   // console.warn('Conteneur blog non trouvé');
    return;
  }

  blogContainer.innerHTML = MOCK_BLOG_POSTS.map(
    (post, index) => `
      <div class="swiper-slide">
        <div class="blog-card bg-white dark:bg-ll-black/20 rounded-xl shadow-lg p-6 transform transition-transform duration-300 hover:scale-105 hover:shadow-neon-blue" data-aos="flip-up" data-aos-delay="${index * 100}">
          <img src="${post.image}" data-src="${post.image}" class="w-full h-48 object-cover rounded-t-xl mb-4 lazy" alt="Image de l'article ${post.title}">
          <h4 class="text-lg font-semibold text-gray-900 dark:text-white">${post.title}</h4>
          <p class="text-gray-500 dark:text-gray-400 text-sm">${post.date}</p>
          <p class="text-gray-600 dark:text-gray-300 mt-2 line-clamp-3">${post.content}</p>
          <button class="mt-4 text-blue-600 hover:text-blue-700 font-semibold read-more" data-post-id="${post.id}" aria-label="Lire l'article ${post.title}">
            Lire plus
          </button>
        </div>
      </div>
    `
  ).join('');

  lazyLoadImages(document.querySelectorAll('.blog-card img.lazy'));

  const swiperOptions = {
    slidesPerView: 1,
    spaceBetween: 24,
    loop: MOCK_BLOG_POSTS.length >= 3,
    autoplay: MOCK_BLOG_POSTS.length >= 3 ? { delay: 4500, disableOnInteraction: false } : false,
    pagination: {
      el: '.blog-swiper-pagination',
      clickable: true,
      renderBullet: (index, className) =>
        `<span class="${className} w-2.5 h-2.5 bg-gray-400 dark:bg-gray-600 rounded-full transition-all duration-300 hover:bg-blue-600 shadow-neon-blue focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Aller à l'article ${index + 1}"></span>`,
    },
    breakpoints: {
      640: { slidesPerView: 2, spaceBetween: 16 },
      1024: { slidesPerView: 3, spaceBetween: 24 },
    },
    a11y: {
      enabled: true,
      prevSlideMessage: 'Article précédent',
      nextSlideMessage: 'Article suivant',
      paginationBulletMessage: 'Aller à l’article {{index}}',
    },
  };

  new Swiper('.blog-swiper', swiperOptions);

  document.querySelectorAll('.read-more').forEach(button => {
    button.addEventListener('click', () => {
      const postId = button.dataset.postId;
      const post = MOCK_BLOG_POSTS.find(p => p.id === postId);
      if (post) {
        openBlogModal(post);
      }
    });
  });
}

/**
 * Ouvre une modale pour un article de blog
 * @param {Object} post - Données de l'article
 */
function openBlogModal(post) {
  const modal = document.createElement('div');
  modal.id = 'blog-modal';
  modal.className =
    'fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4 transition-opacity duration-300 opacity-0 backdrop-blur-sm';
  modal.innerHTML = `
    <div class="bg-white dark:bg-ll-black/20 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto transform scale-95 transition-transform duration-500 relative border border-blue-500/30 shadow-neon-blue">
      <div class="sticky top-0 bg-white dark:bg-ll-black/20 p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center rounded-t-2xl">
        <h3 class="text-xl font-cinzel font-bold text-gray-900 dark:text-white shadow-neon-blue">${post.title}</h3>
        <button class="close-blog-modal text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xl focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Fermer la modale">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6L6 18"></path><path d="M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      <div class="p-6">
        <img src="${post.image}" alt="Image de l'article ${post.title}" class="w-full h-64 object-cover rounded-xl mb-4 lazy">
        <p class="text-gray-500 dark:text-gray-400 text-sm mb-4">${post.date}</p>
        <p class="text-gray-600 dark:text-gray-300">${post.content}</p>
        <div class="mt-6 flex justify-end">
          <button class="close-blog-modal px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-neon-blue focus:outline-none focus:ring-2 focus:ring-blue-500">
            Fermer
          </button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  lazyLoadImages(modal.querySelectorAll('img.lazy'));

  setTimeout(() => {
    modal.classList.remove('opacity-0');
    modal.classList.add('opacity-100');
    modal.querySelector('.bg-white, .dark\\:bg-ll-black/20').classList.remove('scale-95');
    modal.querySelector('.bg-white, .dark\\:bg-ll-black/20').classList.add('scale-100');
  }, 10);

  const closeModal = () => {
    modal.classList.remove('opacity-100');
    modal.classList.add('opacity-0');
    modal.querySelector('.bg-white, .dark\\:bg-ll-black/20').classList.remove('scale-100');
    modal.querySelector('.bg-white, .dark\\:bg-ll-black/20').classList.add('scale-95');
    setTimeout(() => modal.remove(), 500);
    document.body.style.overflow = 'auto';
  };

  modal.querySelectorAll('.close-blog-modal').forEach(btn => {
    btn.addEventListener('click', closeModal);
  });

  modal.addEventListener('click', e => {
    if (e.target === modal) {
      closeModal();
    }
  });

  modal.querySelector('.close-blog-modal').focus();
  document.body.style.overflow = 'hidden';
}

/**
 * Initialise la section Événements avec carrousel
 */
function initEventsSection() {
  const eventsContainer = document.getElementById('events-list');
  if (!eventsContainer) {
   // console.warn('Conteneur événements non trouvé');
    return;
  }

  eventsContainer.innerHTML = MOCK_EVENTS.map(
    (event, index) => `
      <div class="swiper-slide">
        <div class="event-card bg-white dark:bg-ll-black/20 rounded-xl shadow-lg p-6 transform transition-transform duration-300 hover:scale-105 hover:shadow-neon-blue" data-aos="flip-up" data-aos-delay="${index * 100}">
          <h4 class="text-lg font-semibold text-gray-900 dark:text-white">${event.title}</h4>
          <p class="text-gray-500 dark:text-gray-400 text-sm">${event.date} - ${event.location}</p>
          <p class="text-gray-600 dark:text-gray-300 mt-2">${event.description}</p>
        </div>
      </div>
    `
  ).join('');

  const swiperOptions = {
    slidesPerView: 1,
    spaceBetween: 24,
    loop: MOCK_EVENTS.length >= 3,
    autoplay: MOCK_EVENTS.length >= 3 ? { delay: 4000, disableOnInteraction: false } : false,
    pagination: {
      el: '.events-swiper-pagination',
      clickable: true,
      renderBullet: (index, className) =>
        `<span class="${className} w-2.5 h-2.5 bg-gray-400 dark:bg-gray-600 rounded-full transition-all duration-300 hover:bg-blue-600 shadow-neon-blue focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Aller à l'événement ${index + 1}"></span>`,
    },
    breakpoints: {
      640: { slidesPerView: 2, spaceBetween: 16 },
      1024: { slidesPerView: 3, spaceBetween: 24 },
    },
    a11y: {
      enabled: true,
      prevSlideMessage: 'Événement précédent',
      nextSlideMessage: 'Événement suivant',
      paginationBulletMessage: 'Aller à l’événement {{index}}',
    },
  };

  new Swiper('.events-swiper', swiperOptions);
}

/**
 * Initialise la section Galerie avec lightbox
 */
function initGallerySection() {
  const galleryContainer = document.getElementById('gallery-list');
  if (!galleryContainer) {
    //console.warn('Conteneur galerie non trouvé');
    return;
  }

  galleryContainer.innerHTML = MOCK_GALLERY.map(
    (item, index) => `
      <div class="gallery-item relative overflow-hidden rounded-xl shadow-lg transform transition-transform duration-300 hover:scale-105 hover:shadow-neon-blue" data-aos="zoom-in" data-aos-delay="${index * 100}">
        <img src="${item.src}" data-src="${item.src}" class="w-full h-64 object-cover lazy" alt="${item.alt}">
        <button class="gallery-lightbox absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500" data-image="${item.src}" aria-label="Ouvrir ${item.alt} en plein écran">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8 3H5a2 2 0 0 0-2 2v3"></path><path d="M21 8V5a2 2 0 0 0-2-2h-3"></path><path d="M3 16v3a2 2 0 0 0 2 2h3"></path><path d="M16 21h3a2 2 0 0 0 2-2v-3"></path>
          </svg>
        </button>
      </div>
    `
  ).join('');

  lazyLoadImages(document.querySelectorAll('.gallery-item img.lazy'));

  document.querySelectorAll('.gallery-lightbox').forEach(button => {
    button.addEventListener('click', () => {
      openLightbox(button.dataset.image);
    });
  });
}

/**
 * Initialise la section Statistiques avec animations de comptage
 */
function initStatsSection() {
  const statsContainer = document.getElementById('stats-list');
  const loadingIndicator = document.getElementById('stats-loading');
  if (!statsContainer) {
    // console.warn('Conteneur statistiques non trouvé');
    return;
  }

  // Génère les cartes à partir des données
  statsContainer.innerHTML = MOCK_STATS.map((stat, index) => `
    <div class="stat-card bg-white gap-4 dark:bg-ll-black rounded-2xl border border-ll-black/20 dark:border-gray-600/50 shadow-lg p-6 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left transition-all duration-500 hover:shadow-xl hover:shadow-indigo-500/20" data-aos="fade-up" data-aos-delay="${index * 100}">
      
      <div class="relative w-[140px] h-[140px] mb-2">
                <canvas id="stats-canvas-${index}" class="w-full h-full absolute inset-0"></canvas>
                <div class="absolute inset-0 flex items-center justify-center z-10">
                    <div class="rounded-full p-4 ">
                      ${stat.svg}
                    </div>
                </div>
            </div>

      <div class="flex-1 mt-4 sm:mt-0">
        <p class="text-lg font-semibold text-ll-black dark:text-ll-white">${stat.label}</p>
        <p class="text-slate-500 dark:text-slate-400 text-sm mt-1">${stat.description}</p>
        <div class="flex items-baseline mt-2">
          <span id="stats-value-${index}" class="text-4xl font-cinzel font-bold text-ll-black dark:text-ll-white mr-2">0</span>
        </div>
      </div>
    </div>
  `).join('');

  loadingIndicator?.classList.add('hidden');

  const alreadyAnimated = new Set(); // Pour ne pas relancer l'animation plusieurs fois

  MOCK_STATS.forEach((stat, index) => {
    const statCard = statsContainer.children[index];

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !alreadyAnimated.has(index)) {
          animateCanvasCounter(index, stat.value, stat.unit);
          animateStatValue(index, stat.value, stat.unit);
          alreadyAnimated.add(index); // Marque comme déjà animé
        }
      });
    }, { threshold: 0.5 });

    observer.observe(statCard);

    // Réagir aux changements de thème
    const handleThemeChange = () => {
      const canvas = document.getElementById(`stats-canvas-${index}`);
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Réinitialiser et relancer l'animation si déjà animé
        if (alreadyAnimated.has(index)) {
          animateCanvasCounter(index, stat.value, stat.unit);
        }
      }
    };

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', handleThemeChange);
    window.addEventListener('storage', handleThemeChange);

    // Efface le canvas si hors champ
    const fadeOutObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) {
          const canvas = document.getElementById(`stats-canvas-${index}`);
          if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }
        }
      });
    }, { threshold: 0 });

    fadeOutObserver.observe(statCard);
  });

                        
  /**
   * Animation du canvas (cercle animé avec effet de pulse)
   */
  function animateCanvasCounter(index, target, unit) {
    const canvas = document.getElementById(`stats-canvas-${index}`);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const size = canvas.clientWidth;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const radius = (size / 2) - 10;
    const centerX = size / 2;
    const centerY = size / 2;

    let current = 0;
    const increment = target / 100;
    let animationFrameId;
    let pulsePhase = 0;
    let isCountingComplete = false;

    // Détection et suivi du thème
    let themeToApply = detectTheme();
    let fontColor = getFontColor(themeToApply);
    let glowColor = themeToApply === 'dark' ? 'rgba(99, 102, 241, 0.3)' : 'rgba(37, 99, 235, 0.3)';

    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#2563EB');
    gradient.addColorStop(1, '#90EE90');

    function detectTheme() {
      const savedTheme = localStorage.getItem('theme');
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return savedTheme !== null ? savedTheme : (systemPrefersDark ? 'dark' : 'light');
    }

    function getFontColor(theme) {
      return theme === 'dark' ? '#FDFDFC' : '#1B1B18';
    }

    function handleThemeChange() {
      const newTheme = detectTheme();
      if (newTheme !== themeToApply) {
        themeToApply = newTheme;
        fontColor = getFontColor(themeToApply);
        glowColor = themeToApply === 'dark' ? 'rgba(99, 102, 241, 0.3)' : 'rgba(37, 99, 235, 0.3)';
      }
    }

    // Réagir aux changements de thème
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', handleThemeChange);
    window.addEventListener('storage', handleThemeChange);

    function draw() {
      ctx.clearRect(0, 0, size, size);

      // Cercle de fond
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = themeToApply === 'dark' ? '#374151' : '#EDEDEC';
      ctx.lineWidth = 8;
      ctx.stroke();

      // Arc de progression
      const progress = isCountingComplete ? 1 : current / target;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, -Math.PI / 2, (2 * Math.PI * progress) - Math.PI / 2);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 8;
      ctx.stroke();

      // Effet de pulse
      const pulseScale = 1 + 0.05 * Math.sin(pulsePhase);
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.scale(pulseScale, pulseScale);
      ctx.translate(-centerX, -centerY);
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius - 4, 0, 2 * Math.PI);
      ctx.strokeStyle = glowColor;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      pulsePhase += 0.05;

      // Incrémentation de la valeur
      if (!isCountingComplete && current < target) {
        current += increment;
        if (current >= target) {
          current = target;
          isCountingComplete = true;
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    }

    draw();
  }

  /**
   * Animation du texte de la statistique (compteur)
   */
  function animateStatValue(index, target, unit) {
    const valueElement = document.getElementById(`stats-value-${index}`);
    if (!valueElement) return;

    let current = 0;
    const increment = target / 100;
    let animationFrameId;

    function updateValue() {
      current += increment;
      if (current >= target) {
        current = target;
        valueElement.textContent = Math.floor(current) + (unit || '');
        cancelAnimationFrame(animationFrameId);
        return;
      }
      valueElement.textContent = Math.floor(current) + (unit || '');
      animationFrameId = requestAnimationFrame(updateValue);
    }

    updateValue();
  }
}



/**
 * Initialise la section Tarification avec grille
 */
function initPricingSection() {
  const pricingContainer = document.getElementById('pricing-list');
  if (!pricingContainer) {
  //  console.warn('Conteneur tarification non trouvé');
    return;
  }

  pricingContainer.innerHTML = MOCK_PRICING.map(
    (plan, index) => `
      <div class="pricing-card bg-white dark:bg-ll-black/20 rounded-xl shadow-lg p-6 transform transition-transform duration-300 hover:scale-105 hover:shadow-neon-blue" data-aos="flip-up" data-aos-delay="${index * 100}">
        <h4 class="text-lg font-semibold text-gray-900 dark:text-white">${plan.name}</h4>
        <p class="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">${plan.price}€</p>
        <ul class="text-gray-600 dark:text-gray-300 mt-4 space-y-2">
          ${plan.features.map(feature => `<li class="flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-500"><path d="M20 6L9 17l-5-5"></path></svg>${feature}</li>`).join('')}
        </ul>
        <button class="mt-6 bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors shadow-neon-blue focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Choisir le plan ${plan.name}">
          Choisir
        </button>
      </div>
    `
  ).join('');
}

/**
 * Initialise la section Contacts avec grille
 */
function initContactsSection() {
  const contactsContainer = document.getElementById('contacts-list');
  if (!contactsContainer) {
   // console.warn('Conteneur contacts non trouvé');
    return;
  }

  contactsContainer.innerHTML = MOCK_CONTACTS.map(
    (contact, index) => `
      <div class="contact-card bg-white dark:bg-ll-black/20 rounded-xl shadow-lg p-6 transform transition-transform duration-300 hover:scale-105 hover:shadow-neon-blue" data-aos="fade-up" data-aos-delay="${index * 100}">
        <h4 class="text-lg font-semibold text-gray-900 dark:text-white">${contact.name}</h4>
        <p class="text-gray-600 dark:text-gray-300 mt-2"><a href="mailto:${contact.email}" class="hover:text-blue-600">${contact.email}</a></p>
        <p class="text-gray-600 dark:text-gray-300"><a href="tel:${contact.phone}" class="hover:text-blue-600">${contact.phone}</a></p>
      </div>
    `
  ).join('');
}




function initWhyUsSection() {
  const whyUsContainer = document.getElementById('why-us-list');
  if (!whyUsContainer) {
   // console.warn('Conteneur "Pourquoi Nous Choisir" non trouvé');
    return;
  }

  // Assurez-vous que WHY_US_DATA.reasons existe et est un tableau
  const reasons = Object.values(WHY_US_DATA);

  whyUsContainer.innerHTML = reasons.map((reason, index) => `
   <div class="service-card group relative rounded-xl overflow-hidden h-80 bg-white dark:bg-ll-black/20 shadow-md hover:shadow-xl transition-all duration-300" data-aos="fade-up" data-aos-delay="${index * 150}"> 
      <div 
        class="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-in-out group-hover:scale-110" 
        style="background-image: url('${reason.image}');"
      ></div>
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

      <div class="absolute bottom-0 left-0 right-0 p-6 text-white">
        <div class="relative h-48">
        
          <div class="initial-content absolute bottom-0 left-0 w-full transition-all duration-500 ease-out group-hover:-translate-y-full group-hover:opacity-0">
            <div class="icon-container w-14 h-14 rounded-full flex items-center justify-center mb-4  ${reason.color || 'text-white'}">
              ${reason.icon === 'team' ? '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 508 508" xml:space="preserve" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <circle style="fill:#90DFAA;" cx="254" cy="254" r="254"></circle> <g> <path style="fill:#2C9984;" d="M379.2,408c0,0,2,7.6-0.8,9.6c0,0-2.8,0.8-2.8,4.8c0,0,0,4.8-6,4.4c0,0-16.4,2-18.8-2 c0,0-1.6-2-0.8-5.6l18.8-7.2L379.2,408z"></path> <path style="fill:#2C9984;" d="M376.8,396.8c0,0,7.2,6,2,14c0,0-3.6,5.2-4,7.6c0,0,0.4,8-8,6c0,0-8.4-6-14.4-1.2 c0,0-4.4-0.4-2.4-6.4c0,0,4.8-6,7.6-11.6c0,0,1.6-1.2,0.8-5.6L376.8,396.8z"></path> <path style="fill:#2C9984;" d="M396,408c0,0-2,7.6,0.8,9.6c0,0,2.8,0.8,2.8,4.8c0,0,0,4.8,6,4.4c0,0,16.4,2,18.8-2 c0,0,1.6-2,0.8-5.6l-18.8-7.2L396,408z"></path> <path style="fill:#2C9984;" d="M398.4,396.8c0,0-7.2,6-2,14c0,0,3.6,5.2,4,7.6c0,0-0.4,8,8,6c0,0,8.4-6,14.4-1.2 c0,0,4.4-0.4,2.4-6.4c0,0-4.8-6-7.6-11.6c0,0-1.6-1.2-0.8-5.6L398.4,396.8z"></path> <polygon style="fill:#2C9984;" points="370.4,131.2 386.8,195.2 403.2,131.2 "></polygon> <polygon style="fill:#2C9984;" points="391.6,138 393.6,131.2 381.6,131.2 383.6,138 "></polygon> <polygon style="fill:#2C9984;" points="391.6,138 387.6,138 383.6,138 375.6,186.8 387.6,195.2 399.6,186.8 "></polygon> <path style="fill:#2C9984;" d="M356.8,220.8c-2.8,16.8-6.4,46.4-0.8,81.2c0,0,5.2,79.6,0.4,97.2c0,0,9.6,16.8,26,0 c0,0,0.4-131.2,4.8-136.4v-42H356.8z"></path> <path style="fill:#2C9984;" d="M387.6,220.8v41.6c4.4,5.6,4.8,136.4,4.8,136.4c16.8,16.8,26,0,26,0c-4.8-17.6,0.4-97.2,0.4-97.2 c5.6-34.8,2.4-64.4-0.8-81.2h-30.4V220.8z"></path> <polygon style="fill:#2C9984;" points="400.4,122.4 374.4,122.4 370.8,131.2 402.8,131.2 "></polygon> <path style="fill:#2C9984;" d="M372,128l-29.2,10.8c0,0,17.6,53.6,10,89.6c0,0-3.2,18.4-0.8,32.4c0,0,20.4,14.8,28,1.2 c0,0,10.4-32.4,8.4-64l-9.2-24.4L372,128z"></path> <path style="fill:#2C9984;" d="M374.4,122.4l-14,15.2l5.2,2.4l-4,4c0,0,13.2,40.4,26.8,54.4C388.4,198,373.6,135.6,374.4,122.4z"></path> <path style="fill:#2C9984;" d="M403.2,128l29.2,10.8c0,0-17.6,53.6-10,89.6c0,0,3.2,18.4,0.8,32.4c0,0-20.4,14.8-28,1.2 c0,0-10.4-32.4-8.4-64l9.2-24.4L403.2,128z"></path> <path style="fill:#2C9984;" d="M400.4,122.4l14,15.2l-5.2,2.4l4,4c0,0-13.2,40.4-26.8,54.4C386.4,198,401.2,135.6,400.4,122.4z"></path> <circle style="fill:#2C9984;" cx="391.6" cy="200.8" r="2.8"></circle> <polygon style="fill:#2C9984;" points="405.2,177.2 410,169.2 417.6,174.8 "></polygon> <rect x="403.171" y="174.42" transform="matrix(-0.9789 0.2042 -0.2042 -0.9789 850.0986 265.1172)" style="fill:#2C9984;" width="16.4" height="4"></rect> <path style="fill:#2C9984;" d="M434,256c0.4,3.2,0.4,5.6,0.4,5.6c0.8,0.8,2.8,3.6,2.8,3.6c4,3.2,2,5.6,2,5.6l0.4,2.4 c0.8,1.2,0.4,3.2,0.4,3.2c-2,4-3.6,0.8-3.6,0.8c-2.4,2.8-3.6-0.8-3.6-0.8c-2.8,1.2-3.6-1.6-3.6-1.6s-4.8,0.8-4-10.4 c0.4-2.8,0.4-5.6,0-8.4L434,256L434,256z"></path> <path style="fill:#2C9984;" d="M429.6,267.2c0-0.4,0.4-2,0.4-2c-0.8,2.4,2,3.6,2,3.6c-0.4,0-0.4-1.6-0.4-1.6c0.4,2,3.6,3.2,3.6,3.2 c0.4-1.2,1.6-2,1.6-2c-0.8,1.2-0.8,2-0.8,2c0.4,0,1.2,0.8,1.2,0.8c-0.8-0.8-1.2,0-1.2,0c1.6,0.4,1.2,2,1.2,2c0-1.6-0.8-1.2-0.8-1.2 c0.8,0.8,0.4,1.6,0.4,1.6c0-1.2-1.6-1.2-1.6-1.2c0.8-1.2,0-0.8,0-0.8c-1.2-2-2,0-2,0.8h-0.4c0.8-2,0-2.4,0-2.4 c-1.2-1.2-1.6,0.8-1.6,0.8c0,3.2-2,4.4-2,4.4h-0.4c1.2-0.4,2-2.4,2-2.4c1.2-3.2-0.4-3.2-0.4-3.2c-2.4-0.4-2,2-2,2 c-0.8,0.4-2.4,0-2.4,0c0.4,0,1.2-0.4,1.2-0.4c0.8-0.8-0.4-2.4-0.4-2.4c0.8,0.8,3.6,0.8,3.6,0.8C431.2,268.8,430,267.6,429.6,267.2 l-0.4,0.8c0-0.4-0.8-2.4-0.8-2.4C428.8,265.6,429.6,266.8,429.6,267.2z"></path> <path style="fill:#2C9984;" d="M439.2,271.6c0,0-0.4,0.4-1.2,2.4c0,0-0.4,0.4-0.4,0.8c-0.4,0.4-0.8,0.8-1.6,0.8 c-0.8-0.4-2-0.4-2.8-0.4c0,0-0.8,0-1.6,0c-0.4,0-0.8-0.4-0.8-0.8c0.4-0.8,0.8-1.6,2-2c0,0,1.6-0.4,2,0c0,0-2.4-0.8-3.6,0.8 c0,0-1.6,1.6-0.4,2c0,0,3.6,0,4,0.4c0,0,1.6,0.8,2.4-0.4c0,0,0.4-1.6,2-1.2c0,0-0.4-0.4-1.2-0.4 C438.4,273.6,438.8,272.4,439.2,271.6z"></path> <path style="fill:#2C9984;" d="M436,275.2c0,0.8,0.4,2.8,0.4,2.8c-0.4-0.4-0.4-0.8-0.4-0.8c0,0.4-0.4,0.4-0.4,0.4 c0.4-1.2,0-2.4,0-2.4H436z"></path> <path style="fill:#2C9984;" d="M432.8,276.8C432.4,276.8,432.4,276.8,432.8,276.8c-0.4-0.4-0.4-0.4-0.4,0c0.4-0.8,0.4-2,0.4-2h0.4 C433.2,276,432.8,276.8,432.8,276.8z"></path> <rect x="423.6" y="250.4" style="fill:#2C9984;" width="12" height="8.4"></rect> <path style="fill:#2C9984;" d="M341.6,256c-0.4,3.2-0.4,5.6-0.4,5.6c-1.2,0.4-3.2,3.6-3.2,3.6c-4,3.2-2,5.6-2,5.6l-0.4,2.4 c-0.8,1.2-0.4,3.2-0.4,3.2c2,4,3.6,0.8,3.6,0.8c2.4,2.8,3.6-0.8,3.6-0.8c2.8,1.2,3.6-1.6,3.6-1.6s4.8,0.8,4-10.4 c-0.4-2.8-0.4-5.6,0-8.4L341.6,256L341.6,256z"></path> <path style="fill:#2C9984;" d="M345.6,267.2c0-0.4-0.4-2-0.4-2c0.8,2.4-2,3.6-2,3.6c0.4,0,0.4-1.6,0.4-1.6c-0.4,2-3.6,3.2-3.6,3.2 c-0.4-1.2-1.6-2-1.6-2c0.8,1.2,0.8,2,0.8,2c-0.4,0-1.2,0.8-1.2,0.8c0.8-0.8,1.2,0,1.2,0c-1.6,0.4-1.2,2-1.2,2 c0-1.6,0.8-1.2,0.8-1.2c-0.8,0.8-0.4,1.6-0.4,1.6c0-1.2,1.6-1.2,1.6-1.2c-0.8-1.2,0-0.8,0-0.8c1.2-2,2,0,2,0.8h0.4 c-0.8-2,0-2.4,0-2.4c1.2-1.2,1.6,0.8,1.6,0.8c0,3.2,2,4.4,2,4.4h0.4c-1.2-0.4-2-2.4-2-2.4c-1.2-3.2,0.4-3.2,0.4-3.2 c2.4-0.4,2,2,2,2c0.8,0.4,2.4,0,2.4,0c-0.4,0-1.2-0.4-1.2-0.4c-0.8-0.8,0.4-2.4,0.4-2.4c-0.8,0.8-3.6,0.8-3.6,0.8 C344.4,268.8,345.6,267.6,345.6,267.2l0.4,0.8c0-0.4,0.8-2.4,0.8-2.4C346.4,265.6,346,266.8,345.6,267.2z"></path> <path style="fill:#2C9984;" d="M336,271.6c0,0,0.4,0.4,1.2,2.4c0,0,0,0.4,0.4,0.8s0.8,0.8,1.6,0.8c0.8-0.4,2-0.4,2.8-0.4 c0,0,0.8,0,1.6,0c0.4,0,0.8-0.4,0.8-0.8c-0.4-0.8-0.8-1.6-2-2c0,0-1.6-0.4-2,0c0,0,2.4-0.8,3.6,0.8c0,0,1.6,1.6,0.4,2 c0,0-3.6,0-4,0.4c0,0-1.6,0.8-2.4-0.4c0,0-0.4-1.6-2-1.2c0,0,0.4-0.4,1.2-0.4C336.8,273.6,336.8,272.4,336,271.6z"></path> <path style="fill:#2C9984;" d="M339.2,275.2c0,0.8-0.4,2.8-0.4,2.8c0.4-0.4,0.4-0.8,0.4-0.8c0,0.4,0.4,0.4,0.4,0.4 c-0.4-1.2,0-2.4,0-2.4H339.2z"></path> <path style="fill:#2C9984;" d="M342.8,276.8C342.8,276.8,343.2,276.8,342.8,276.8c0.4-0.4,0.4-0.4,0.4,0c-0.4-0.8-0.4-2-0.4-2h-0.4 C342.4,276,342.8,276.8,342.8,276.8z"></path> <rect x="340" y="250.4" style="fill:#2C9984;" width="12" height="8.4"></rect> <path style="fill:#2C9984;" d="M438,255.2h-16.8c0,0-0.4-43.6,2-51.6c0,0,0.8-8.4-1.2-15.2c2.8-26,10.4-49.2,10.8-49.6 C432.4,138.4,440.8,160,438,255.2z"></path> <path style="fill:#2C9984;" d="M336.8,255.2H354c0,0,0.4-43.6-2-51.6c0,0-0.8-8.4,1.2-15.2c-2.8-26-10.4-49.2-10.8-49.6 C342.8,138.4,334.4,160,336.8,255.2z"></path> <ellipse style="fill:#2C9984;" cx="387.6" cy="119.2" rx="11.2" ry="12"></ellipse> <path style="fill:#2C9984;" d="M398.4,117.2c0,0,2,10.4-10.8,14.4c0,0,7.2,1.6,10.4,10.4C398,142,406.8,128,398.4,117.2z"></path> <path style="fill:#2C9984;" d="M376.8,117.2c0,0-2,10.4,10.8,14.4c0,0-7.2,1.6-10.4,10.4C377.2,142,368.4,128,376.8,117.2z"></path> <path style="fill:#2C9984;" d="M403.2,108c-1.6,4.4-2,7.2-2.4,8l0,0c-3.6,4.8-8,8-13.2,8c-4.8,0-8.8-2.8-12.4-7.2 c-7.2-9.2-2.4-25.6-2.4-25.6c3.6,4.4,15.6,4.4,15.6,4.4c-4.8-0.8-6-4.4-6-4.8c0.8,2.4,12.4,4,12.4,4 C407.2,96.4,403.2,108,403.2,108z"></path> <path style="fill:#2C9984;" d="M380.8,73.6c0,0,16.4-6.4,24.4,8.4c8.8,15.6-2.4,32.8-4.4,34c0,0,0.4-2.8,2.4-8c0,0,4-11.6-8-13.6 c0,0-11.6-1.6-12.4-4c0,0,0.8,4,6,5.2c0,0-12-0.4-15.6-4.4c0,0-5.2,16.8,2.4,25.6c0,0-12.8-10.4-11.2-26 C364.4,90.8,363.6,69.2,380.8,73.6z"></path> </g> <g> <path style="fill:#E6E9EE;" d="M318.8,414.4c0,0,2,7.6-0.8,10c0,0-3.2,0.8-2.8,5.2c0,0,0,4.8-6.4,4.8c0,0-17.2,2-19.6-2 c0,0-2-2.4-0.8-5.6l19.6-7.2L318.8,414.4z"></path> <path style="fill:#E6E9EE;" d="M316.4,402.8c0,0,7.2,6.4,2,14.4c0,0-4,5.2-4,8c0,0,0.4,8.4-8.4,6.4c0,0-8.8-6.4-15.2-1.2 c0,0-4.4-0.4-2.4-6.8c0,0,5.2-6.4,8-12.4c0,0,1.6-1.2,0.8-5.6L316.4,402.8z"></path> <path style="fill:#E6E9EE;" d="M336.4,414.4c0,0-2,7.6,0.8,10c0,0,3.2,0.8,2.8,5.2c0,0,0,4.8,6.4,4.8c0,0,17.2,2,19.6-2 c0,0,2-2.4,0.8-5.6l-19.6-7.2L336.4,414.4z"></path> <path style="fill:#E6E9EE;" d="M339.2,402.8c0,0-7.2,6.4-2,14.4c0,0,4,5.2,4,8c0,0-0.4,8.4,8.4,6.4c0,0,8.8-6.4,15.2-1.2 c0,0,4.4-0.4,2.4-6.8c0,0-5.2-6.4-8-12.4c0,0-1.6-1.2-0.8-5.6L339.2,402.8z"></path> <polygon style="fill:#E6E9EE;" points="309.6,126.4 326.8,192.8 344,126.4 "></polygon> <polygon style="fill:#E6E9EE;" points="331.6,133.6 334,126.4 321.2,126.4 323.6,133.6 "></polygon> <polygon style="fill:#E6E9EE;" points="331.6,133.6 327.6,133.6 323.6,133.6 314.8,184 327.6,192.8 340.4,184 "></polygon> <path style="fill:#E6E9EE;" d="M295.6,219.6c-3.2,17.2-6.4,48.4-0.8,84.4c0,0,5.2,83.2,0.4,101.6c0,0,9.6,17.6,27.2,0 c0,0,0.4-136.8,5.2-142.4v-43.6H295.6z"></path> <path style="fill:#E6E9EE;" d="M327.6,219.6v43.6c4.8,5.6,5.2,142.4,5.2,142.4c17.2,17.6,27.2,0,27.2,0 c-4.8-18.4,0.4-101.6,0.4-101.6c5.6-36,2.4-67.2-0.8-84.4H327.6z"></path> <polygon style="fill:#E6E9EE;" points="341.2,116.8 314,116.8 310,126.4 343.2,126.4 "></polygon> <path style="fill:#E6E9EE;" d="M311.2,122.8L280.8,134c0,0,18.4,56,10.4,93.6c0,0-3.2,18.8-0.8,33.6c0,0,21.2,15.2,29.2,1.2 c0,0,10.8-33.6,8.8-66.4l-9.6-25.6L311.2,122.8z"></path> <path style="fill:#E6E9EE;" d="M314,116.8l-14.8,15.6l5.6,2.4l-4.4,4c0,0,13.6,42,28,56.4C328.4,195.6,313.2,130.4,314,116.8z"></path> <path style="fill:#E6E9EE;" d="M344,122.8l30.4,11.2c0,0-18.4,56-10.4,93.6c0,0,3.2,18.8,0.8,33.6c0,0-21.2,15.2-29.2,1.2 c0,0-10.8-33.6-8.8-66.4l9.6-25.6L344,122.8z"></path> <path style="fill:#E6E9EE;" d="M341.2,116.8l14.8,15.6l-5.6,2.4l4.4,4c0,0-13.6,42-28,56.4C326.4,195.6,342,130.4,341.2,116.8z"></path> <circle style="fill:#E6E9EE;" cx="332" cy="198.8" r="3.2"></circle> <polygon style="fill:#E6E9EE;" points="346,174 351.2,165.6 359.2,171.6 "></polygon> <rect x="343.946" y="171.214" transform="matrix(-0.9789 0.2042 -0.2042 -0.9789 733.0341 270.786)" style="fill:#E6E9EE;" width="17.2" height="4"></rect> <path style="fill:#E6E9EE;" d="M376,256.4c0.4,3.2,0.4,5.6,0.4,5.6c0.8,0.8,3.2,4,3.2,4c4.4,3.6,2,6,2,6l0.4,2.8 c1.2,1.2,0.4,3.2,0.4,3.2c-2,4.4-4,0.8-4,0.8c-2.4,3.2-4-0.8-4-0.8c-2.8,1.2-3.6-1.6-3.6-1.6s-5.2,0.8-4-11.2c0.4-2.8,0.4-6,0-8.8 H376z"></path> <path style="fill:#E6E9EE;" d="M371.6,268c0-0.4,0.4-2.4,0.4-2.4c-0.8,2.4,2,4,2,4c-0.4,0-0.4-1.6-0.4-1.6c0.4,2,4,3.6,4,3.6 c0.4-1.2,1.6-2,1.6-2c-1.2,0.8-1.2,2-1.2,2c0.8,0,1.2,0.8,1.2,0.8c-0.8-0.8-1.2,0-1.2,0c1.6,0.4,1.2,2,1.2,2c0-1.6-1.2-1.6-1.2-1.6 c0.8,0.8,0.4,1.6,0.4,1.6c0-1.2-1.6-1.6-1.6-1.6c0.8-1.2,0-0.8,0-0.8c-1.2-2-2,0-2,0.8h-0.4c0.8-2,0-2.4,0-2.4 c-1.6-1.2-1.6,0.8-1.6,0.8c0,3.2-2,4.4-2,4.4H370c1.2-0.4,2-2.4,2-2.4c1.2-3.2-0.4-3.6-0.4-3.6c-2.8-0.4-2,2-2,2 c-1.2,0.4-2.4,0-2.4,0c0.4,0,1.2-0.8,1.2-0.8c0.8-0.8-0.4-2.8-0.4-2.8c0.8,0.8,3.6,0.8,3.6,0.8c1.6,0,0.4-1.6,0.4-1.6l-0.8,0.4 c0-0.4-0.8-2.4-0.8-2.4C370.8,266.4,371.2,267.6,371.6,268z"></path> <path style="fill:#E6E9EE;" d="M381.6,272.4c0,0-0.4,0.4-1.2,2.4c0,0-0.4,0.4-0.4,0.8c-0.4,0.8-0.8,0.8-1.6,0.8 c-0.8-0.4-2-0.4-2.8-0.4c0,0-0.8,0-1.6,0c-0.4,0-0.8-0.4-0.8-0.8c0.4-0.8,0.8-1.6,2.4-2c0,0,1.6-0.4,2,0c0,0-2.4-0.8-4,0.8 c0,0-1.6,1.6-0.4,2.4c0,0,4,0,4,0.4c0,0,1.6,0.8,2.4-0.4c0,0,0.4-1.6,2-1.6c0,0-0.4-0.4-1.2-0.4 C380.8,274.4,380.8,273.2,381.6,272.4z"></path> <path style="fill:#E6E9EE;" d="M378.4,276.4c-0.4,0.8,0.4,2.8,0.4,2.8c-0.4-0.4-0.4-0.8-0.4-0.8c0,0.4-0.4,0.4-0.4,0.4 c0.4-1.2,0-2.8,0-2.8h0.4V276.4z"></path> <path style="fill:#E6E9EE;" d="M374.4,278L374.4,278c0,0,0,0-0.4,0c0.4-0.8,0.4-2,0.4-2h0.4C375.2,276.8,374.4,278,374.4,278z"></path> <rect x="365.2" y="250.4" style="fill:#E6E9EE;" width="12.8" height="8.8"></rect> <path style="fill:#E6E9EE;" d="M279.6,256.4c-0.4,3.2-0.4,5.6-0.4,5.6c-0.8,0.8-3.2,4-3.2,4c-4.4,3.6-2,6-2,6v2.4 c-1.2,1.2-0.4,3.2-0.4,3.2c2,4.4,4,0.8,4,0.8c2.4,3.2,4-0.8,4-0.8c2.8,1.2,3.6-1.6,3.6-1.6s5.2,0.8,4-11.2c-0.4-2.8-0.4-6,0-8.8 h-9.6V256.4z"></path> <path style="fill:#E6E9EE;" d="M284,268c0-0.4-0.4-2.4-0.4-2.4c0.8,2.4-2,4-2,4c0.4,0,0.4-1.6,0.4-1.6c-0.4,2-4,3.6-4,3.6 c-0.4-1.2-1.6-2-1.6-2c0.8,1.2,1.2,2,1.2,2c-0.8,0-1.2,0.8-1.2,0.8c0.8-0.8,1.2,0,1.2,0c-1.6,0.4-1.2,2-1.2,2 c0-1.6,1.2-1.6,1.2-1.6c-0.8,0.8-0.4,1.6-0.4,1.6c0-1.2,1.6-1.6,1.6-1.6c-0.8-1.2,0-0.8,0-0.8c1.2-2,2,0,2,0.8h0.4 c-0.8-2,0-2.4,0-2.4c1.6-1.2,1.6,0.8,1.6,0.8c0,3.2,2,4.4,2,4.4h0.8c-1.6-0.4-2-2.4-2-2.4c-1.2-3.2,0.4-3.6,0.4-3.6 c2.8-0.4,2,2,2,2c1.2,0.4,2.4,0,2.4,0c-0.4,0-1.2-0.8-1.2-0.8c-0.8-0.8,0.4-2.8,0.4-2.8c-0.4,2-3.6,2-3.6,2c-1.6,0-0.4-1.6-0.4-1.6 l0.8,0.4c0-0.4,0.8-2.4,0.8-2.4C284.8,266.4,284.4,267.6,284,268z"></path> <path style="fill:#E6E9EE;" d="M274,272.4c0,0,0.4,0.4,1.2,2.4c0,0,0.4,0.4,0.4,0.8c0.4,0.8,0.8,0.8,1.6,0.8c0.8-0.4,2-0.4,2.8-0.4 c0,0,0.8,0,1.6,0c0.4,0,0.8-0.4,0.8-0.8c-0.4-0.8-0.8-1.6-2.4-2c0,0-1.6-0.4-2,0c0,0,2.4-0.8,4,0.8c0,0,1.6,1.6,0.4,2.4 c0,0-4,0-4,0.4c0,0-1.6,0.8-2.4-0.4c0,0-0.4-1.6-2-1.6c0,0,0.4-0.4,1.2-0.4C274.8,274.4,274.8,273.2,274,272.4z"></path> <path style="fill:#E6E9EE;" d="M277.2,276.4c0.4,0.8-0.4,2.8-0.4,2.8c0.4-0.4,0.4-0.8,0.4-0.8c0,0.4,0.4,0.4,0.4,0.4 c-0.4-1.2,0-2.8,0-2.8h-0.4V276.4z"></path> <path style="fill:#E6E9EE;" d="M281.2,278L281.2,278c0.4-0.4,0.4-0.4,0.4,0c-0.4-0.8-0.4-2-0.4-2h-0.4 C280.4,276.8,281.2,278,281.2,278z"></path> <rect x="278" y="250.4" style="fill:#E6E9EE;" width="12.8" height="8.8"></rect> <path style="fill:#E6E9EE;" d="M380.4,255.6h-17.6c0,0-0.4-45.2,2-54c0,0,0.8-8.8-1.6-16c3.2-27.2,10.8-51.2,11.2-52 C374.4,134,383.2,156.4,380.4,255.6z"></path> <path style="fill:#E6E9EE;" d="M274.8,255.6h17.6c0,0,0.4-45.2-2-54c0,0-0.8-8.8,1.6-16c-3.2-27.2-10.8-51.2-11.2-52 C280.8,134,272,156.4,274.8,255.6z"></path> <ellipse style="fill:#E6E9EE;" cx="327.6" cy="113.6" rx="11.6" ry="12.4"></ellipse> <path style="fill:#E6E9EE;" d="M338.8,111.6c0,0,2.4,10.8-11.2,14.8c0,0,7.6,1.6,10.8,10.8C338.8,137.2,347.6,123.2,338.8,111.6z"></path> <path style="fill:#E6E9EE;" d="M316.4,111.6c0,0-2.4,10.8,11.2,14.8c0,0-7.6,1.6-10.8,10.8C316.8,137.2,308,123.2,316.4,111.6z"></path> <path style="fill:#E6E9EE;" d="M344,102c-1.6,4.8-2,7.6-2.4,8l0,0c-3.6,5.2-8.4,8.4-13.6,8.4c-4.8,0-9.2-2.8-12.8-7.6 c-7.6-9.6-2.4-26.8-2.4-26.8c4,4.4,16.4,4.8,16.4,4.8c-5.2-0.8-6-4.8-6.4-5.2C324,86,335.6,88,335.6,88C348,90,344,102,344,102z"></path> <path style="fill:#E6E9EE;" d="M320.8,66c0,0,16.8-6.8,25.6,8.4c9.2,16.4-2.4,34-4.8,35.6c0,0,0.8-2.8,2.4-8.4c0,0,4-12-8.4-14 c0,0-12-1.6-12.8-4.4c0,0,0.8,4.4,6.4,5.2c0,0-12.4-0.4-16.4-4.8c0,0-5.2,17.6,2.4,26.8c0,0-13.2-10.8-11.6-27.2 C303.6,84,302.8,61.6,320.8,66z"></path> </g> <g> <path style="fill:#2C9984;" d="M128.8,408c0,0-2,7.6,0.8,9.6c0,0,2.8,0.8,2.8,4.8c0,0,0,4.8,6,4.4c0,0,16.4,2,18.8-2 c0,0,1.6-2,0.8-5.6l-18.8-7.2L128.8,408z"></path> <path style="fill:#2C9984;" d="M131.2,396.8c0,0-7.2,6-2,14c0,0,3.6,5.2,4,7.6c0,0-0.4,8,8,6c0,0,8.4-6,14.4-1.2 c0,0,4.4-0.4,2.4-6.4c0,0-4.8-6-7.6-11.6c0,0-1.6-1.2-0.8-5.6L131.2,396.8z"></path> <path style="fill:#2C9984;" d="M112,408c0,0,2,7.6-0.8,9.6c0,0-2.8,0.8-2.8,4.8c0,0,0,4.8-6,4.4c0,0-16.4,2-18.8-2 c0,0-1.6-2-0.8-5.6l18.8-7.2L112,408z"></path> <path style="fill:#2C9984;" d="M109.6,396.8c0,0,7.2,6,2,14c0,0-3.6,5.2-4,7.6c0,0,0.4,8-8,6c0,0-8.4-6-14.4-1.2 c0,0-4.4-0.4-2.4-6.4c0,0,4.8-6,7.6-11.6c0,0,1.6-1.2,0.8-5.6L109.6,396.8z"></path> <polygon style="fill:#2C9984;" points="137.6,131.2 121.2,195.2 104.8,131.2 "></polygon> <polygon style="fill:#2C9984;" points="116.4,138 114.4,131.2 126.4,131.2 124.4,138 "></polygon> <polygon style="fill:#2C9984;" points="116.4,138 120.4,138 124.4,138 132.4,186.8 120.4,195.2 108.4,186.8 "></polygon> <path style="fill:#2C9984;" d="M151.2,220.8c2.8,16.8,6.4,46.4,0.8,81.2c0,0-5.2,79.6-0.4,97.2c0,0-9.6,16.8-26,0 c0,0-0.4-131.2-4.8-136.4v-42H151.2z"></path> <path style="fill:#2C9984;" d="M120.4,220.8v41.6c-4.4,5.6-4.8,136.4-4.8,136.4c-16.8,16.8-26,0-26,0c4.4-17.2-0.4-96.8-0.4-96.8 c-5.6-34.8-2.4-64.4,0.8-81.2H120.4z"></path> <polygon style="fill:#2C9984;" points="107.6,122.4 133.6,122.4 137.2,131.2 105.2,131.2 "></polygon> <path style="fill:#2C9984;" d="M136,128l29.2,10.8c0,0-17.6,53.6-10,89.6c0,0,3.2,18.4,0.8,32.4c0,0-20.4,14.8-28,1.2 c0,0-10.4-32.4-8.4-64l9.2-24.4L136,128z"></path> <path style="fill:#2C9984;" d="M133.6,122.4l14,15.2l-5.2,2.4l4,4c0,0-13.2,40.4-26.8,54.4C119.6,198,134.4,135.6,133.6,122.4z"></path> <path style="fill:#2C9984;" d="M104.8,128l-29.2,10.8c0,0,17.6,53.6,10,89.6c0,0-3.2,18.4-0.8,32.4c0,0,20.4,14.8,28,1.2 c0,0,10.4-32.4,8.4-64l-9.2-24.4L104.8,128z"></path> <path style="fill:#2C9984;" d="M107.6,122.4l-14,15.2l5.2,2.4l-4,4c0,0,13.2,40.4,26.8,54.4C121.6,198,106.8,135.6,107.6,122.4z"></path> <circle style="fill:#2C9984;" cx="116.4" cy="200.8" r="2.8"></circle> <polygon style="fill:#2C9984;" points="102.8,177.2 98,169.2 90.4,174.8 "></polygon> <rect x="88.15" y="174.55" transform="matrix(0.9789 0.2042 -0.2042 0.9789 38.0829 -15.9549)" style="fill:#2C9984;" width="16.4" height="4"></rect> <path style="fill:#2C9984;" d="M74,256c-0.4,3.2-0.4,5.6-0.4,5.6c-0.8,0.8-2.8,3.6-2.8,3.6c-4,3.2-2,5.6-2,5.6l-0.4,2.4 c-0.8,1.2-0.4,3.2-0.4,3.2c2,4,3.6,0.8,3.6,0.8c2.4,2.8,3.6-0.8,3.6-0.8c2.8,1.2,3.6-1.6,3.6-1.6s4.8,0.8,4-10.4 c-0.4-2.8-0.4-5.6,0-8.4L74,256L74,256z"></path> <path style="fill:#2C9984;" d="M78.4,267.2c0-0.4-0.4-2-0.4-2c0.8,2.4-2,3.6-2,3.6c0.4,0,0.4-1.6,0.4-1.6c-0.4,2-3.6,3.2-3.6,3.2 c-0.4-1.2-1.6-2-1.6-2c0.8,1.2,0.8,2,0.8,2c-0.4,0-1.2,0.8-1.2,0.8c0.8-0.8,1.2,0,1.2,0c-1.6,0.4-1.2,2-1.2,2 c0-1.6,0.8-1.2,0.8-1.2c-0.8,0.8-0.4,1.6-0.4,1.6c0-1.2,1.6-1.2,1.6-1.2c-0.8-1.2,0-0.8,0-0.8c1.2-2,2,0,2,0.8h0.4 c-0.8-2,0-2.4,0-2.4c1.2-1.2,1.6,0.8,1.6,0.8c0,3.2,2,4.4,2,4.4h0.4c-1.2-0.4-2-2.4-2-2.4c-1.2-3.2,0.4-3.2,0.4-3.2 c2.4-0.4,2,2,2,2c0.8,0.4,2.4,0,2.4,0c-0.4,0-1.2-0.4-1.2-0.4c-0.4-1.2,1.2-2.8,1.2-2.8c-0.8,0.8-3.6,0.8-3.6,0.8 C76.8,268.8,78,267.6,78.4,267.2l0.4,0.8c0-0.4,0.8-2.4,0.8-2.4C79.2,265.6,78.4,266.8,78.4,267.2z"></path> <path style="fill:#2C9984;" d="M68.8,271.6c0,0,0.4,0.4,1.2,2.4c0,0,0.4,0.4,0.4,0.8c0.4,0.4,0.8,0.8,1.6,0.8 c0.8-0.4,2-0.4,2.8-0.4c0,0,0.8,0,1.6,0c0.4,0,0.8-0.4,0.8-0.8c-0.4-0.8-0.8-1.6-2-2c0,0-1.6-0.4-2,0c0,0,2.4-0.8,3.6,0.8 c0,0,1.6,1.6,0.4,2c0,0-3.6,0-4,0.4c0,0-1.6,0.8-2.4-0.4c0,0-0.4-1.6-2-1.2c0,0,0.4-0.4,1.2-0.4C69.6,273.6,69.2,272.4,68.8,271.6z "></path> <path style="fill:#2C9984;" d="M72,275.2c0,0.8-0.4,2.8-0.4,2.8c0.4-0.4,0.4-0.8,0.4-0.8c0,0.4,0.4,0.4,0.4,0.4 c-0.4-1.2,0-2.4,0-2.4H72z"></path> <path style="fill:#2C9984;" d="M75.2,276.8C75.6,276.8,75.6,276.8,75.2,276.8c0.4-0.4,0.4-0.4,0.4,0c-0.4-0.8-0.4-2-0.4-2h-0.4 C74.8,276,75.2,276.8,75.2,276.8z"></path> <rect x="72.4" y="250.4" style="fill:#2C9984;" width="12" height="8.4"></rect> <path style="fill:#2C9984;" d="M166.4,256c0.4,3.2,0.4,5.6,0.4,5.6c0.8,0.8,2.8,3.6,2.8,3.6c4,3.2,2,5.6,2,5.6l0.4,2.4 c0.8,1.2,0.4,3.2,0.4,3.2c-2,4-3.6,0.8-3.6,0.8c-2.4,2.8-3.6-0.8-3.6-0.8c-2.8,1.2-3.6-1.6-3.6-1.6s-4.8,0.8-4-10.4 c0.4-2.8,0.4-5.6,0-8.4L166.4,256L166.4,256z"></path> <path style="fill:#2C9984;" d="M162.4,267.2c0-0.4,0.4-2,0.4-2c-0.8,2.4,2,3.6,2,3.6c-0.4,0-0.4-1.6-0.4-1.6c0.4,2,3.6,3.2,3.6,3.2 c0.4-1.2,1.6-2,1.6-2c-0.8,1.2-0.8,2-0.8,2c0.4,0,1.2,0.8,1.2,0.8c-0.8-0.8-1.2,0-1.2,0c1.6,0.4,1.2,2,1.2,2c0-1.6-0.8-1.2-0.8-1.2 c0.8,0.8,0.4,1.6,0.4,1.6c0-1.2-1.6-1.2-1.6-1.2c0.8-1.2,0-0.8,0-0.8c-1.2-2-2,0-2,0.8h-0.4c0.8-2,0-2.4,0-2.4 c-1.2-1.2-1.6,0.8-1.6,0.8c0,3.2-2,4.4-2,4.4h-0.4c1.2-0.4,2-2.4,2-2.4c1.2-3.2-0.4-3.2-0.4-3.2c-2.4-0.4-2,2-2,2 c-0.8,0.4-2.4,0-2.4,0c0.4,0,1.2-0.4,1.2-0.4c0.8-0.8-0.4-2.4-0.4-2.4c0.8,0.8,3.6,0.8,3.6,0.8 C163.6,268.8,162.4,267.6,162.4,267.2L162,268c0-0.4-0.8-2.4-0.8-2.4C161.6,265.6,162,266.8,162.4,267.2z"></path> <path style="fill:#2C9984;" d="M172,271.6c0,0-0.4,0.4-1.2,2.4c0,0,0,0.4-0.4,0.8s-0.8,0.8-1.6,0.8c-0.8-0.4-2-0.4-2.8-0.4 c0,0-0.8,0-1.6,0c-0.4,0-0.8-0.4-0.8-0.8c0.4-0.8,0.8-1.6,2-2c0,0,1.6-0.4,2,0c0,0-2.4-0.8-3.6,0.8c0,0-1.6,1.6-0.4,2 c0,0,3.6,0,4,0.4c0,0,1.6,0.8,2.4-0.4c0,0,0.4-1.6,2-1.2c0,0-0.4-0.4-1.2-0.4C171.2,273.6,171.2,272.4,172,271.6z"></path> <path style="fill:#2C9984;" d="M168.8,275.2c0,0.8,0.4,2.8,0.4,2.8c-0.4-0.4-0.4-0.8-0.4-0.8c0,0.4-0.4,0.4-0.4,0.4 c0.4-1.2,0-2.4,0-2.4H168.8z"></path> <path style="fill:#2C9984;" d="M165.2,276.8C165.2,276.8,164.8,276.8,165.2,276.8c-0.4-0.4-0.4-0.4-0.4,0c0.4-0.8,0.4-2,0.4-2h0.4 C165.6,276,165.2,276.8,165.2,276.8z"></path> <rect x="156" y="250.4" style="fill:#2C9984;" width="12" height="8.4"></rect> <path style="fill:#2C9984;" d="M70,255.2h16.8c0,0,0.4-43.6-2-51.6c0,0-0.8-8.4,1.2-15.2c-2.8-26-10.4-49.2-10.8-49.6 C75.6,138.4,67.2,160,70,255.2z"></path> <path style="fill:#2C9984;" d="M171.2,255.2H154c0,0-0.4-43.6,2-51.6c0,0,0.8-8.4-1.2-15.2c2.8-26,10.4-49.2,10.8-49.6 C165.2,138.4,173.6,160,171.2,255.2z"></path> <ellipse style="fill:#2C9984;" cx="120.4" cy="119.2" rx="11.2" ry="12"></ellipse> <path style="fill:#2C9984;" d="M109.6,117.2c0,0-2,10.4,10.8,14.4c0,0-7.2,1.6-10.4,10.4C110,142,101.2,128,109.6,117.2z"></path> <path style="fill:#2C9984;" d="M131.2,117.2c0,0,2,10.4-10.8,14.4c0,0,7.2,1.6,10.4,10.4C130.8,142,139.6,128,131.2,117.2z"></path> <path style="fill:#2C9984;" d="M104.8,108c1.6,4.4,2,7.2,2.4,8l0,0c3.6,4.8,8,8,13.2,8c4.8,0,8.8-2.8,12.4-7.2 c7.2-9.2,2.4-25.6,2.4-25.6c-3.6,4.4-15.6,4.4-15.6,4.4c4.8-0.8,6-4.4,6-4.8c-0.8,2.4-12.4,4-12.4,4 C100.8,96.4,104.8,108,104.8,108z"></path> <path style="fill:#2C9984;" d="M127.2,73.6c0,0-16.4-6.4-24.4,8.4c-8.8,15.6,2.4,32.8,4.4,34c0,0-0.4-2.8-2.4-8c0,0-4-11.6,8-13.6 c0,0,11.6-1.6,12.4-4c0,0-0.8,4-6,5.2c0,0,12-0.4,15.6-4.4c0,0,5.2,16.8-2.4,25.6c0,0,12.8-10.4,11.2-26 C143.6,90.8,144.4,69.2,127.2,73.6z"></path> </g> <g> <path style="fill:#E6E9EE;" d="M189.2,414.4c0,0-2,7.6,0.8,10c0,0,3.2,0.8,2.8,5.2c0,0,0,4.8,6.4,4.8c0,0,17.2,2,19.6-2 c0,0,2-2.4,0.8-5.6l-19.6-7.2L189.2,414.4z"></path> <path style="fill:#E6E9EE;" d="M191.6,402.8c0,0-7.2,6.4-2,14.4c0,0,4,5.2,4,8c0,0-0.4,8.4,8.4,6.4c0,0,8.8-6.4,15.2-1.2 c0,0,4.4-0.4,2.4-6.8c0,0-5.2-6.4-8-12.4c0,0-1.6-1.2-0.8-5.6L191.6,402.8z"></path> <path style="fill:#E6E9EE;" d="M171.6,414.4c0,0,2,7.6-0.8,10c0,0-3.2,0.8-2.8,5.2c0,0,0,4.8-6.4,4.8c0,0-17.2,2-19.6-2 c0,0-2-2.4-0.8-5.6l19.6-7.2L171.6,414.4z"></path> <path style="fill:#E6E9EE;" d="M168.8,402.8c0,0,7.2,6.4,2,14.4c0,0-4,5.2-4,8c0,0,0.4,8.4-8.4,6.4c0,0-8.8-6.4-15.2-1.2 c0,0-4.4-0.4-2.4-6.8c0,0,5.2-6.4,8-12.4c0,0,1.6-1.2,0.8-5.6L168.8,402.8z"></path> <polygon style="fill:#E6E9EE;" points="198.4,126.4 181.2,192.8 164,126.4 "></polygon> <polygon style="fill:#E6E9EE;" points="176.4,133.6 174,126.4 186.8,126.4 184.4,133.6 "></polygon> <polygon style="fill:#E6E9EE;" points="176.4,133.6 180.4,133.6 184.4,133.6 193.2,184 180.4,192.8 167.6,184 "></polygon> <path style="fill:#E6E9EE;" d="M212.4,219.6c3.2,17.2,6.4,48.4,0.8,84.4c0,0-5.2,83.2-0.4,101.6c0,0-9.6,17.6-27.2,0 c0,0-0.4-136.8-5.2-142.4v-43.6H212.4z"></path> <path style="fill:#E6E9EE;" d="M180.4,219.6v43.6c-4.8,5.6-5.2,142.4-5.2,142.4c-17.2,17.6-27.2,0-27.2,0 c4.8-18.4-0.4-101.6-0.4-101.6c-5.6-36-2.4-67.2,0.8-84.4H180.4z"></path> <polygon style="fill:#E6E9EE;" points="166.8,116.8 194,116.8 198,126.4 164.8,126.4 "></polygon> <path style="fill:#E6E9EE;" d="M196.8,122.8l30.4,11.2c0,0-18.4,56-10.4,93.6c0,0,3.2,18.8,0.8,33.6c0,0-21.2,15.2-29.2,1.2 c0,0-10.8-33.6-8.8-66.4l9.6-25.6L196.8,122.8z"></path> <path style="fill:#E6E9EE;" d="M194,116.8l14.8,15.6l-5.6,2.4l4.4,4c0,0-13.6,42-28,56.4C179.6,195.6,194.8,130.4,194,116.8z"></path> <path style="fill:#E6E9EE;" d="M164,122.8L133.6,134c0,0,18.4,56,10.4,93.6c0,0-3.2,18.8-0.8,33.6c0,0,21.2,15.2,29.2,1.2 c0,0,10.8-33.6,8.8-66.4l-9.6-25.6L164,122.8z"></path> <path style="fill:#E6E9EE;" d="M166.8,116.8L152,132.4l5.6,2.4l-4.4,4c0,0,13.6,42,28,56.4C181.6,195.6,166,130.4,166.8,116.8z"></path> <circle style="fill:#E6E9EE;" cx="176" cy="198.8" r="3.2"></circle> <polygon style="fill:#E6E9EE;" points="162,174 156.8,165.6 148.8,171.6 "></polygon> <rect x="146.805" y="171.596" transform="matrix(0.9789 0.2042 -0.2042 0.9789 38.7239 -28.0766)" style="fill:#E6E9EE;" width="17.2" height="4"></rect> <path style="fill:#E6E9EE;" d="M132,256.4c-0.4,3.2-0.4,5.6-0.4,5.6c-0.8,0.8-3.2,4-3.2,4c-4.4,3.6-2,6-2,6l-0.4,2.8 c-1.2,1.2-0.4,3.2-0.4,3.2c2,4.4,4,0.8,4,0.8c2.4,3.2,4-0.8,4-0.8c2.8,1.2,3.6-1.6,3.6-1.6s5.2,0.8,4-11.2c-0.4-2.8-0.4-6,0-8.8 H132z"></path> <path style="fill:#E6E9EE;" d="M136.4,268c0-0.4-0.4-2.4-0.4-2.4c0.8,2.4-2,4-2,4c0.4,0,0.4-1.6,0.4-1.6c-0.4,2-4,3.6-4,3.6 c-0.4-1.2-1.6-2-1.6-2c0.8,1.2,1.2,2,1.2,2c-0.8,0-1.2,0.8-1.2,0.8c0.8-0.8,1.2,0,1.2,0c-1.6,0.4-1.2,2-1.2,2 c0-1.6,1.2-1.6,1.2-1.6c-0.8,0.8-0.4,1.6-0.4,1.6c0-1.2,1.6-1.6,1.6-1.6c-0.8-1.2,0-0.8,0-0.8c1.2-2,2,0,2,0.8h0.4 c-0.8-2,0-2.4,0-2.4c1.6-1.2,1.6,0.8,1.6,0.8c0,3.2,2,4.4,2,4.4h0.8c-1.2-0.4-2-2.4-2-2.4c-1.2-3.2,0.4-3.6,0.4-3.6 c2.8-0.4,2,2,2,2c1.2,0.4,2.4,0,2.4,0c-0.4,0-1.2-0.8-1.2-0.8c-0.8-0.8,0.4-2.8,0.4-2.8c-0.4,2-3.6,2-3.6,2c-1.6,0-0.4-1.6-0.4-1.6 l0.8,0.4c0-0.4,0.8-2.4,0.8-2.4C137.2,266.4,136.8,267.6,136.4,268z"></path> <path style="fill:#E6E9EE;" d="M126.4,272.4c0,0,0.4,0.4,1.2,2.4c0,0,0.4,0.4,0.4,0.8c0.4,0.8,0.8,0.8,1.6,0.8 c0.8-0.4,2-0.4,2.8-0.4c0,0,0.8,0,1.6,0c0.4,0,0.8-0.4,0.8-0.8c-0.4-0.8-0.8-1.6-2.4-2c0,0-1.6-0.4-2,0c0,0,2.4-0.8,4,0.8 c0,0,1.6,1.6,0.4,2.4c0,0-4,0-4,0.4c0,0-1.6,0.8-2.4-0.4c0,0-0.4-1.6-2-1.6c0,0,0.4-0.4,1.2-0.4 C127.2,274.4,127.2,273.2,126.4,272.4z"></path> <path style="fill:#E6E9EE;" d="M129.6,276.4c0.4,0.8-0.4,2.8-0.4,2.8c0.4-0.4,0.4-0.8,0.4-0.8c0,0.4,0.4,0.4,0.4,0.4 c-0.4-1.2,0-2.8,0-2.8h-0.4V276.4z"></path> <path style="fill:#E6E9EE;" d="M133.6,278L133.6,278c0.4-0.4,0.4-0.4,0.4,0c-0.4-0.8-0.4-2-0.4-2h-0.4 C132.8,276.8,133.6,278,133.6,278z"></path> <rect x="130.4" y="250.4" style="fill:#E6E9EE;" width="12.8" height="8.8"></rect> <path style="fill:#E6E9EE;" d="M228.4,256.4c0.4,3.2,0.4,5.6,0.4,5.6c0.8,0.8,3.2,4,3.2,4c4.4,3.6,2,6,2,6l0.4,2.8 c1.2,1.2,0.4,3.2,0.4,3.2c-2,4.4-4,0.8-4,0.8c-2.4,3.2-4-0.8-4-0.8c-2.8,1.2-3.6-1.6-3.6-1.6s-5.2,0.8-4-11.2c0.4-2.8,0.4-6,0-8.8 H228.4z"></path> <path style="fill:#E6E9EE;" d="M224,268c0-0.4,0.4-2.4,0.4-2.4c-0.8,2.4,2,4,2,4c-0.4,0-0.4-1.6-0.4-1.6c0.4,2,4,3.6,4,3.6 c0.4-1.2,1.6-2,1.6-2c-0.8,1.2-1.2,2-1.2,2c0.8,0,1.2,0.8,1.2,0.8c-0.8-0.8-1.2,0-1.2,0c1.6,0.4,1.2,2,1.2,2c0-1.6-1.2-1.6-1.2-1.6 c0.8,0.8,0.4,1.6,0.4,1.6c0-1.2-1.6-1.6-1.6-1.6c0.8-1.2,0-0.8,0-0.8c-1.2-2-2,0-2,0.8h-0.4c0.8-2,0-2.4,0-2.4 c-1.6-1.2-1.6,0.8-1.6,0.8c0,3.2-2,4.4-2,4.4h-0.8c1.6-0.4,2-2.4,2-2.4c1.2-3.2-0.4-3.6-0.4-3.6c-2.4,0.4-2,2.8-2,2.8 c-1.2,0.4-2.4,0-2.4,0c0.4,0,1.2-0.8,1.2-0.8c0.8-0.8-0.4-2.8-0.4-2.8c0.8,0.8,3.6,0.8,3.6,0.8c1.6,0,0.4-1.6,0.4-1.6l-0.8,0.4 c0-0.4-0.8-2.4-0.8-2.4C223.2,266.4,223.6,267.6,224,268z"></path> <path style="fill:#E6E9EE;" d="M234,272.4c0,0-0.4,0.4-1.2,2.4c0,0-0.4,0.4-0.4,0.8c-0.4,0.8-0.8,0.8-1.6,0.8 c-0.8-0.4-2-0.4-2.8-0.4c0,0-0.8,0-1.6,0c-0.4,0-0.8-0.4-0.8-0.8c0.4-0.8,0.8-1.6,2.4-2c0,0,1.6-0.4,2,0c0,0-2.4-0.8-4,0.8 c0,0-1.6,1.6-0.4,2.4c0,0,4,0,4,0.4c0,0,1.6,0.8,2.4-0.4c0,0,0.4-1.6,2-1.6c0,0-0.4-0.4-1.2-0.4C233.2,274.4,233.2,273.2,234,272.4 z"></path> <path style="fill:#E6E9EE;" d="M230.8,276.4c-0.4,0.8,0.4,2.8,0.4,2.8c-0.4-0.4-0.4-0.8-0.4-0.8c0,0.4-0.4,0.4-0.4,0.4 c0.4-1.2,0-2.8,0-2.8h0.4V276.4z"></path> <path style="fill:#E6E9EE;" d="M226.8,278L226.8,278c-0.4-0.4-0.4-0.4-0.4,0c0.4-0.8,0.4-2,0.4-2h0.4 C227.6,276.8,226.8,278,226.8,278z"></path> <rect x="217.6" y="250.4" style="fill:#E6E9EE;" width="12.8" height="8.8"></rect> <path style="fill:#E6E9EE;" d="M127.6,255.6h17.6c0,0,0.4-45.2-2-54c0,0-0.8-8.8,1.6-16c-2.8-27.2-10.8-51.2-11.2-51.6 C133.6,134,124.8,156.4,127.6,255.6z"></path> <path style="fill:#E6E9EE;" d="M233.2,255.6h-17.6c0,0-0.4-45.2,2-54c0,0,0.8-8.8-1.6-16c3.2-27.2,10.8-51.2,11.2-52 C227.2,134,236,156.4,233.2,255.6z"></path> <ellipse style="fill:#E6E9EE;" cx="180.4" cy="113.6" rx="11.6" ry="12.4"></ellipse> <path style="fill:#E6E9EE;" d="M169.2,111.6c0,0-2.4,10.8,11.2,14.8c0,0-7.6,1.6-10.8,10.8C169.2,137.2,160.4,123.2,169.2,111.6z"></path> <path style="fill:#E6E9EE;" d="M191.6,111.6c0,0,2.4,10.8-11.2,14.8c0,0,7.6,1.6,10.8,10.8C191.2,137.2,200,123.2,191.6,111.6z"></path> <path style="fill:#E6E9EE;" d="M164,102c1.6,4.8,2,7.6,2.4,8l0,0c3.6,5.2,8.4,8.4,13.6,8.4c4.8,0,9.2-2.8,12.8-7.6 c7.6-9.6,2.4-26.8,2.4-26.8c-4,4.4-16.4,4.8-16.4,4.8c5.2-0.8,6-4.8,6.4-5.2C184,86,172.4,88,172.4,88C160,90,164,102,164,102z"></path> <path style="fill:#E6E9EE;" d="M187.2,66c0,0-16.8-6.8-25.6,8.4c-9.2,16.4,2.4,34,4.8,35.6c0,0-0.8-2.8-2.4-8.4c0,0-4-12,8.4-14 c0,0,12-1.6,12.8-4.4c0,0-0.8,4.4-6.4,5.2c0,0,12.4-0.4,16.4-4.8c0,0,5.2,17.6-2.4,26.8c0,0,13.2-10.8,11.6-27.2 C204.4,84,205.2,61.6,187.2,66z"></path> </g> <g> <path style="fill:#324A5E;" d="M242.8,453.6c0,0,2.8,9.6-1.2,12.4c0,0-4,0.8-3.6,6.4c0,0,0,6-8,5.6c0,0-21.2,2.4-24-2.4 c0,0-2.4-2.8-0.8-7.2l24.4-9.2L242.8,453.6z"></path> <path style="fill:#324A5E;" d="M239.6,439.2c0,0,9.2,7.6,2.4,18c0,0-4.8,6.4-4.8,10c0,0,0.8,10.4-10.4,8c0,0-11.2-8-18.4-1.2 c0,0-5.6-0.4-2.8-8c0,0,6.4-8,10-15.2c0,0,2.4-1.6,1.2-7.2L239.6,439.2z"></path> <path style="fill:#324A5E;" d="M264.8,453.6c0,0-2.8,9.6,1.2,12.4c0,0,4,0.8,3.6,6.4c0,0,0,6,8,5.6c0,0,21.2,2.4,24-2.4 c0,0,2.4-2.8,0.8-7.2l-24.4-9.2L264.8,453.6z"></path> <path style="fill:#324A5E;" d="M268,439.2c0,0-9.2,7.6-2.4,18c0,0,4.8,6.4,4.8,10c0,0-0.8,10.4,10.4,8c0,0,11.2-8,18.4-1.2 c0,0,5.6-0.4,2.8-8c0,0-6.4-8-10-15.2c0,0-2.4-1.6-1.2-7.2L268,439.2z"></path> </g> <polygon style="fill:#E6E9EE;" points="231.6,96.8 252.8,179.2 273.6,96.8 "></polygon> <polygon style="fill:#F1543F;" points="258.8,106 261.6,96.8 246,96.8 248.8,106 "></polygon> <polygon style="fill:#FF7058;" points="258.8,106 254,106 248.8,106 238,168.4 254,179.2 269.6,168.4 "></polygon> <g> <path style="fill:#2B3B4E;" d="M214,212.4c-4,21.6-8,60-0.8,104.4c0,0,6.4,102.8,0.4,125.6c0,0,12,21.6,33.6,0 c0,0,0.8-169.2,6.4-176v-54H214z"></path> <path style="fill:#2B3B4E;" d="M253.6,212.4v54c5.6,7.2,6.4,176,6.4,176c21.6,21.6,33.6,0,33.6,0c-6-22.8,0.4-125.6,0.4-125.6 c7.2-44.8,2.8-83.2-0.8-104.4H253.6z"></path> </g> <polygon style="fill:#CED5E0;" points="270.4,85.6 236.8,85.6 232,96.8 273.2,96.8 "></polygon> <path style="fill:#324A5E;" d="M233.6,92.8L196,106.4c0,0,22.8,69.2,12.8,115.6c0,0-4,23.6-0.8,41.6c0,0,26,18.8,36.4,1.2 c0,0,13.2-41.6,11.2-82.4L244,150.8L233.6,92.8z"></path> <path style="fill:#2B3B4E;" d="M236.8,85.6l-18.4,19.6l6.8,3.2l-5.2,4.8c0,0,17.2,52,34.8,70C254.8,182.8,236,102.4,236.8,85.6z"></path> <path style="fill:#324A5E;" d="M274,92.8l37.6,13.6c0,0-22.8,69.2-12.8,115.6c0,0,4,23.6,0.8,41.6c0,0-26,18.8-36.4,1.2 c0,0-13.2-41.6-11.2-82.4l11.6-31.6L274,92.8z"></path> <g> <path style="fill:#2B3B4E;" d="M270.4,85.6l18.4,19.6L282,108l5.2,4.8c0,0-17.2,52-34.8,70C252.4,182.8,271.6,102.4,270.4,85.6z"></path> <circle style="fill:#2B3B4E;" cx="258.8" cy="186.8" r="3.6"></circle> </g> <polygon style="fill:#FFFFFF;" points="276.8,156.4 282.8,145.6 292.8,152.8 "></polygon> <rect x="274.018" y="152.807" transform="matrix(-0.9789 0.2042 -0.2042 -0.9789 594.9732 249.4189)" style="fill:#2B3B4E;" width="21.199" height="5.2"></rect> <g> <path style="fill:#FFD05B;" d="M313.6,258c0.4,4,0.4,6.8,0.4,6.8c1.2,1.2,4,4.8,4,4.8c5.2,4.4,2.4,7.6,2.4,7.6l0.4,3.2 c1.2,1.6,0.4,4,0.4,4c-2.8,5.2-4.8,0.8-4.8,0.8c-3.2,3.6-4.8-0.8-4.8-0.8c-3.6,1.6-4.8-2-4.8-2s-6.4,0.8-4.8-13.6 c0.4-3.2,0.4-7.2,0-11.2h11.6V258z"></path> <path style="fill:#FFD05B;" d="M308,272.4c0-0.8,0.4-2.8,0.4-2.8c-0.8,2.8,2.4,4.8,2.4,4.8c-0.4,0-0.4-2-0.4-2 c0.4,2.4,4.8,4.4,4.8,4.4c0.8-1.6,2-2.8,2-2.8c-1.2,1.2-1.2,2.8-1.2,2.8c0.8,0,1.6,0.8,1.6,0.8c-1.2-0.8-1.6,0-1.6,0 c2,0.4,1.2,2.4,1.2,2.4c0-2-1.2-1.6-1.2-1.6c1.2,0.8,0.8,2,0.8,2c0-1.6-2-1.6-2-1.6c0.8-1.2,0.4-1.2,0.4-1.2 c-1.6-2.4-2.4,0.4-2.8,1.2c-0.4,0-0.4,0-0.8,0.4c1.2-2.4,0-2.8,0-2.8c-1.6-1.6-2,0.8-2,0.8c0,4-2.8,5.6-2.8,5.6H306 c1.6-0.8,2.4-2.8,2.4-2.8c1.6-4-0.4-4.4-0.4-4.4c-3.2-0.4-2.4,2.4-2.4,2.4c-1.2,0.4-2.8,0.4-2.8,0.4c0.8-0.4,1.2-0.8,1.2-0.8 c1.2-1.2-0.8-3.2-0.8-3.2c0.8,0.8,4.4,0.8,4.4,0.8c1.6,0,0.4-2,0.4-2l-0.8,0.4c0-0.4-0.8-2.8-0.8-2.8 C307.2,270.4,308,272,308,272.4z"></path> <path style="fill:#FFD05B;" d="M320.8,278c0,0-0.8,0.4-1.6,2.8c0,0-0.4,0.4-0.4,1.2c-0.4,0.8-1.2,1.2-2,0.8 c-1.2-0.4-2.4-0.8-3.6-0.4c0,0-1.2,0-2,0s-1.2-0.4-0.8-1.2c0.4-0.8,1.2-2,2.8-2.4c0,0,2-0.4,2.8,0c0,0-3.2-1.2-4.8,0.8 c0,0-2,2-0.4,2.8c0,0,4.8,0,5.2,0.4c0,0,2,0.8,2.8-0.4c0,0,0.4-2,2.4-1.6c0,0-0.8-0.4-1.6-0.4C319.6,280.4,320,279.2,320.8,278z"></path> <path style="fill:#FFD05B;" d="M316.4,282.8c-0.4,0.8,0.8,3.6,0.8,3.6c-0.4-0.4-0.8-0.8-0.8-0.8c-0.4,0.4-0.4,0.4-0.8,0.8 c0.4-1.2,0-3.2,0-3.2h0.8V282.8z"></path> <path style="fill:#FFD05B;" d="M312,284.8C311.6,284.8,311.6,284.4,312,284.8c-0.4-0.4-0.4-0.4-0.4-0.4c0.4-0.8,0.4-2.4,0.4-2.4 h0.8C312.8,283.6,312,284.8,312,284.8z"></path> </g> <rect x="300" y="250.4" style="fill:#FFFFFF;" width="15.6" height="10.8"></rect> <g> <path style="fill:#FFD05B;" d="M194.4,258c-0.4,4-0.4,6.8-0.4,6.8c-1.2,1.2-4,4.8-4,4.8c-5.2,4.4-2.4,7.6-2.4,7.6l-0.4,3.2 c-1.2,1.6-0.4,4-0.4,4c2.8,5.2,4.8,0.8,4.8,0.8c3.2,3.6,4.8-0.8,4.8-0.8c3.6,1.6,4.8-2,4.8-2s6.4,0.8,4.8-13.6 c-0.4-3.2-0.4-7.2,0-11.2h-11.6V258z"></path> <path style="fill:#FFD05B;" d="M200,272.4c0-0.8-0.4-2.8-0.4-2.8c0.8,2.8-2.4,4.8-2.4,4.8c0.4,0,0.4-2,0.4-2 c-0.4,2.4-4.8,4.4-4.8,4.4c-0.8-1.6-2-2.8-2-2.8c1.2,1.2,1.2,2.8,1.2,2.8c-0.8,0-1.6,0.8-1.6,0.8c1.2-0.8,1.6,0,1.6,0 c-2,0.4-1.2,2.4-1.2,2.4c0-2,1.2-1.6,1.2-1.6c-1.2,0.8-0.8,2-0.8,2c0-1.6,2-1.6,2-1.6c-0.8-1.2-0.4-1.2-0.4-1.2 c1.6-2.4,2.4,0.4,2.8,1.2c0.4,0,0.4,0,0.8,0.4c-1.2-2.4,0-2.8,0-2.8c1.6-1.6,2,0.8,2,0.8c0,4,2.8,5.6,2.8,5.6h0.8 c-1.6-0.8-2.4-2.8-2.4-2.8c-1.6-4,0.4-4.4,0.4-4.4c3.2-0.4,2.4,2.4,2.4,2.4c1.2,0.4,2.8,0.4,2.8,0.4c-0.8-0.4-1.2-0.8-1.2-0.8 c-1.2-1.2,0.8-3.2,0.8-3.2c-0.8,0.8-4.4,0.8-4.4,0.8c-1.6,0-0.4-2-0.4-2l0.8,0.4c0-0.4,0.8-2.8,0.8-2.8 C200.8,270.4,200,272,200,272.4z"></path> <path style="fill:#FFD05B;" d="M187.2,278c0,0,0.8,0.4,1.6,2.8c0,0,0.4,0.4,0.4,1.2c0.4,0.8,1.2,1.2,2,0.8c1.2-0.4,2.4-0.8,3.6-0.4 c0,0,1.2,0,2,0s1.2-0.4,0.8-1.2c-0.4-0.8-1.2-2-2.8-2.4c0,0-2-0.4-2.8,0c0,0,3.2-1.2,4.8,0.8c0,0,2,2,0.4,2.8c0,0-4.8,0-5.2,0.4 c0,0-2,0.8-2.8-0.4c0,0-0.4-2-2.4-1.6c0,0,0.8-0.4,1.6-0.4C188.4,280.4,188,279.2,187.2,278z"></path> <path style="fill:#FFD05B;" d="M191.6,282.8c0.4,0.8-0.8,3.6-0.8,3.6c0.4-0.4,0.8-0.8,0.8-0.8c0.4,0.4,0.4,0.4,0.8,0.8 c-0.4-1.2,0-3.2,0-3.2h-0.8V282.8z"></path> <path style="fill:#FFD05B;" d="M196,284.8C196.4,284.8,196.4,284.4,196,284.8c0.4-0.4,0.4-0.4,0.4-0.4c-0.4-0.8-0.4-2.4-0.4-2.4 h-0.8C195.2,283.6,196,284.8,196,284.8z"></path> </g> <rect x="192" y="250.4" style="fill:#FFFFFF;" width="15.6" height="10.8"></rect> <g> <path style="fill:#324A5E;" d="M319.2,256.8h-22c0,0-0.4-56,2.4-66.8c0,0,0.8-11.2-1.6-19.6c4-33.6,13.6-63.6,13.6-64 C311.6,106.4,322.4,134,319.2,256.8z"></path> <path style="fill:#324A5E;" d="M188.4,256.8h22c0,0,0.4-56-2.4-66.8c0,0-0.8-11.2,1.6-19.6c-4-33.6-13.6-63.6-13.6-64 C196,106.4,184.8,134,188.4,256.8z"></path> </g> <ellipse style="fill:#F9B54C;" cx="254" cy="81.6" rx="14.4" ry="15.6"></ellipse> <g> <path style="fill:#FFFFFF;" d="M267.6,78.4c0,0,2.8,13.6-14,18.4c0,0,9.6,2,13.6,13.6C267.6,110.4,278.4,92.8,267.6,78.4z"></path> <path style="fill:#FFFFFF;" d="M240,78.4c0,0-2.8,13.6,14,18.4c0,0-9.6,2-13.6,13.6C240.4,110.4,229.2,92.8,240,78.4z"></path> </g> <path style="fill:#FFD05B;" d="M274,66.8c-2,6-2.8,9.2-2.8,10l0,0c-4.4,6.4-10.4,10.4-16.8,10.4c-6,0-11.6-3.6-16-9.2 c-9.6-11.6-2.8-33.2-2.8-33.2c4.8,5.6,20,5.6,20,5.6c-6.4-0.8-7.6-6-7.6-6.4c1.2,3.2,16,5.2,16,5.2C279.2,52,274,66.8,274,66.8z"></path> <path style="fill:#324A5E;" d="M245.2,22.4c0,0,20.8-8.4,31.6,10.8c11.2,20.4-2.8,42.4-6,44c0,0,0.8-3.6,2.8-10.4 c0,0,5.2-15.2-10.4-17.2c0,0-14.8-2-16-5.2c0,0,1.2,5.6,7.6,6.4c0,0-15.2-0.4-20-5.6c0,0-6.4,21.6,2.8,33.2c0,0-16.4-13.2-14.4-33.6 C224,44.8,222.8,16.8,245.2,22.4z"></path> </g></svg>' : reason.icon}
            </div>
            <h3 class="text-2xl font-bold font-sans tracking-tight">${reason.title}</h3>
            <p class="text-gray-200 text-sm mb-4">${reason.description}</p>
          </div>

          <div class="hover-content absolute bottom-0 left-0 w-full opacity-0 translate-y-8 transition-all duration-500 ease-out group-hover:opacity-100 group-hover:translate-y-0">
            <h4 class="text-xl font-bold font-sans tracking-tight mb-2">${reason.title}</h4>
            <p class="text-gray-200 text-sm mb-4">${reason.hoverDescription}</p>
            ${reason.stats ? `
              <div class="border-t border-white/20 pt-3">
                <span class="text-xs font-semibold text-gray-300 uppercase tracking-wider">${reason.stats.label}</span>
                <p class="text-2xl font-bold">${reason.stats.value}</p>
              </div>
            ` : ''}
          </div>
          
        </div>
      </div>
    </div>
  `).join('');

  // L'observateur pour l'animation de flottement reste utile
  const observers = [];
  document.querySelectorAll('.reason-card').forEach(card => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const iconContainer = card.querySelector('.icon-container');
        if (iconContainer) {
          iconContainer.style.animation = entry.isIntersecting 
            ? 'float 3s ease-in-out infinite' 
            : 'none';
        }
      });
    }, { threshold: 0.3 }); // Déclenche quand 30% de la carte est visible
    observer.observe(card);
    observers.push(observer);
  });
}





// Toggle loading state for before/after showcase
function toggleBeforeAfterLoading(show) {
  const loadingEl = document.getElementById('before-after-loading');
  const beforeAfterList = document.getElementById('before-after-list');
  if (loadingEl && beforeAfterList) {
    loadingEl.classList.toggle('hidden', !show);
    beforeAfterList.classList.toggle('hidden', show);
  }
}

/**
 * Renders before/after showcase from JSON data.
 */
async function renderBeforeAfter() {
  const beforeAfterList = document.getElementById('before-after-list');
  const loadingEl = document.getElementById('before-after-loading');
  if (!beforeAfterList || !loadingEl) return;

  toggleBeforeAfterLoading(true);

  try {
    // Fetch JSON data securely
    const response = await fetch('/assets/json/mock/before-after.json', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'same-origin'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const showcases = data.showcases || [];

    if (showcases.length === 0) {
      beforeAfterList.innerHTML = '<p class="text-center text-gray-500">Aucune transformation disponible pour le moment.</p>';
      toggleBeforeAfterLoading(false);
      return;
    }

    const beforeAfterItems = showcases.map((showcase, index) => {
      const before = showcase.before || { url: '', description: '' };
      const after = showcase.after || { url: '', description: '' };
      const title = showcase.title || 'Transformation';

      return `
        <div class="before-after-container relative overflow-hidden rounded-xl shadow-lg border border-ll-black/20 dark:border-white/50" data-aos="fade-up" data-aos-delay="100">
                    <img src="${before.url}" alt="${before.description}" class="before w-full h-64 object-cover">
                    <img src="${after.url}" alt="${after.description}" class="after w-full h-64 object-cover absolute top-0 left-0">
                    <div class="comparaison-slider absolute top-0 h-full w-1 bg-blue-600 cursor-ew-resize"></div>
                </div>  
      `;
    });

    beforeAfterList.innerHTML = beforeAfterItems.join('');
    initBeforeAfterSliders();
  } catch (error) {
    console.error('Erreur lors du chargement des données before/after:', error);
    beforeAfterList.innerHTML = '<p class="text-center text-red-500">Erreur lors du chargement des transformations. Veuillez réessayer plus tard.</p>';
  } finally {
    toggleBeforeAfterLoading(false);
  }
}

/**
 * Initialise les sliders avant/après avec accessibilité et sécurité améliorées
 */
function initBeforeAfterSliders() {
  document.querySelectorAll('.before-after-container').forEach(container => {
    const beforeImg = container.querySelector('.before');
    const afterImg = container.querySelector('.after');
    const slider = container.querySelector('.comparaison-slider');

    if (!beforeImg || !afterImg || !slider) {
      console.warn('Éléments du slider avant/après non trouvés');
      return;
    }

    let isDragging = false;
    let startX = 0;

    const updateSlider = x => {
      const rect = container.getBoundingClientRect();
      const percentage = Math.max(0, Math.min(100, ((x - rect.left) / rect.width) * 100));
      afterImg.style.clipPath = `polygon(${percentage}% 0%, 100% 0%, 100% 100%, ${percentage}% 100%)`;
      slider.style.left = `${percentage}%`;
      slider.setAttribute('aria-valuenow', percentage.toFixed(0));
    };

    const startDragging = e => {
      e.preventDefault();
      isDragging = true;
      startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
      document.body.style.touchAction = 'none'; // Prevent page scroll while dragging
    };

    const dragging = e => {
      if (!isDragging) return;
      const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
      const deltaX = clientX - startX;
      const deltaY = e.type.includes('touch') ? e.touches[0].clientY - startY : 0;

      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        stopDragging();
        return;
      }

      e.preventDefault();
      updateSlider(clientX);
      startX = clientX; // Update start for smoother drag
    };

    const stopDragging = () => {
      isDragging = false;
      document.body.style.touchAction = 'auto'; // Restore page scroll
    };

    // Attach events only to slider handle
    slider.addEventListener('mousedown', startDragging);
    slider.addEventListener('touchstart', startDragging, { passive: false });

    document.addEventListener('mousemove', dragging);
    document.addEventListener('touchmove', dragging, { passive: false });

    document.addEventListener('mouseup', stopDragging);
    document.addEventListener('touchend', stopDragging);
    document.addEventListener('touchcancel', stopDragging);

    // Keyboard accessibility
    slider.setAttribute('tabindex', '0');
    slider.setAttribute('role', 'slider');
    slider.setAttribute('aria-valuemin', '0');
    slider.setAttribute('aria-valuemax', '100');
    slider.setAttribute('aria-valuenow', '50');
    slider.setAttribute('aria-label', 'Contrôle du slider avant/après');

    slider.addEventListener('keydown', e => {
      const rect = container.getBoundingClientRect();
      let percentage = parseFloat(slider.style.left || '50');
      if (e.key === 'ArrowLeft') {
        percentage = Math.max(0, percentage - 5);
      } else if (e.key === 'ArrowRight') {
        percentage = Math.min(100, percentage + 5);
      } else {
        return;
      }
      updateSlider(rect.left + (rect.width * percentage) / 100);
    });

    // Initialize slider position
    updateSlider(container.getBoundingClientRect().left + container.getBoundingClientRect().width / 2);

    // Error handling for images
    beforeImg.addEventListener('error', () => {
      beforeImg.src = '/assets/images/image.png';
      beforeImg.alt = 'Image avant indisponible';
    });

    afterImg.addEventListener('error', () => {
      afterImg.src = '/assets/images/logo.png';
      afterImg.alt = 'Image après indisponible';
    });
  });
}







/**
 * Initialise les modales vidéo avec gestion plein écran et effets futuristes.
 * Version Ultra-Performante et Modulaire (Refonte complète).
 * * - Suppression des listeners redondants (dblclick)
 * - Gestion unifiée des événements 'click' pour éviter les conflits simple/double clic
 * - Optimisation de la gestion des gestes tactiles (passifs si possible)
 * - Amélioration de la gestion de l'inactivité et du plein écran
 * - Utilisation de l'API Pointer Events pour la barre de progression (plus robuste)
 */
export function initVideoModal() {
    // --- 1. INITIALISATION DU DOM (Améliorée pour responsive : vidéo full sur petit écran) ---
    const videoModal = document.createElement('div');
    videoModal.id = 'video-modal';
    // Utilisation de 'aria-modal' pour l'accessibilité
    videoModal.className = 'fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-0 sm:p-2 sm:p-4 transition-all duration-500 backdrop-blur-xl hidden modal-overlay overflow-auto';
    videoModal.setAttribute('role', 'dialog');
    videoModal.setAttribute('aria-modal', 'true');
    videoModal.setAttribute('aria-labelledby', 'video-title');
    
    videoModal.innerHTML = `
        <div class="modal-content bg-gradient-to-b from-black/80 to-black/100 text-white w-full h-full sm:max-w-[95vw] sm:max-h-[95vh] relative overflow-hidden neon-glow rounded-2xl shadow-2xl transition-all duration-300 group/parent">
            <h2 id="video-title" class="absolute top-2 sm:top-4 left-2 sm:left-4 z-10 text-xs sm:text-xl md:text-2xl font-bold text-white truncate max-w-[70%] sm:max-w-[60%] lg:max-w-[50%] bg-black/40 px-2 py-1 sm:px-3 sm:py-1 rounded-lg backdrop-blur-sm shadow-md hidden xs:block" aria-live="polite"></h2>
            
            <button class="close-video-modal modal-close absolute top-2 sm:top-4 right-2 sm:right-4 z-10 bg-white/90 dark:bg-gray-700/90 rounded-xl p-1 sm:p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50" aria-label="Fermer la modale vidéo">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sm:w-6 sm:h-6">
                    <path d="M18 6L6 18"></path><path d="M6 6l12 12"></path>
                </svg>
            </button>
            
            <div class="video-player-container relative w-full h-screen sm:h-[60vh] sm:h-[70vh] md:h-[80vh] flex items-center justify-center touch-manipulation">
                <video id="modal-video" class="w-full h-full max-h-[80vh] object-contain rounded-xl shadow-2xl cursor-pointer transition-filter duration-200" preload="metadata" poster="/assets/images/logo.png" muted tabindex="0" aria-label="Lecteur vidéo principal">
                    <source src="" type="video/mp4">
                    Votre navigateur ne supporte pas la balise vidéo.
                </video>
                <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none rounded-xl"></div>
                <div id="gesture-indicator" class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/30 backdrop-blur-md text-white px-4 py-2 rounded-full opacity-0 transition-opacity duration-300 pointer-events-none text-lg sm:text-2xl font-semibold"></div>
            </div>
            
            <div class="video-controls absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 sm:p-4 opacity-0 transition-opacity duration-300 group-hover/parent:opacity-100 pointer-events-none group-hover/parent:pointer-events-auto neon-glow">
                <div class="flex items-center justify-between w-full flex-col sm:flex-row gap-2 sm:gap-0">
                    <div class="flex justify-center sm:justify-start w-full sm:w-auto">
                        <button id="play-pause-btn" class="text-white p-2 sm:p-3 rounded-full hover:bg-white/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 neon-glow" aria-label="Lecture/Pause" aria-controls="modal-video">
                            <svg id="play-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sm:w-6 sm:h-6"><circle cx="12" cy="12" r="10"></circle><polygon points="10,8 16,12 10,16"></polygon></svg>
                            <svg id="pause-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="hidden sm:w-6 sm:h-6"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                        </button>
                    </div>
                    
                    <div class="progress-container flex-1 mx-2 sm:mx-4 relative w-full sm:w-auto">
                        <div class="progress-bar bg-white/20 rounded-full h-1.5 sm:h-2 cursor-pointer relative overflow-visible" id="progress-bar">
                            <div class="progress-fill bg-gradient-to-r from-blue-400 to-blue-600 h-full rounded-full transition-all duration-200" id="progress-fill" style="width: 0%"></div>
                            <div class="progress-thumb absolute top-1/2 w-3 h-3 bg-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-opacity duration-200 shadow-lg neon-glow" id="progress-thumb" style="left: 0%"></div>
                        </div>
                        <div class="time-display text-xs text-white/70 mt-1 flex justify-between">
                            <span id="current-time" aria-live="off">0:00</span>
                            <span id="duration">0:00</span>
                        </div>
                    </div>
                    
                    <div class="flex justify-center sm:justify-end w-full sm:w-auto gap-2 relative">
                        <div class="volume-control relative group">
                            <button id="mute-btn" class="text-white p-2 sm:p-3 rounded-full hover:bg-white/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 neon-glow" aria-label="Couper/Rétablir le son" aria-controls="modal-video" aria-expanded="false">
                                <svg id="volume-up-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sm:w-6 sm:h-6"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
                                <svg id="volume-mute-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="hidden sm:w-6 sm:h-6"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="22" y1="22" x2="2" y2="2"></line></svg>
                            </button>
                            <div class="volume-slider-container absolute bottom-full right-0 mb-2 hidden group-hover:block group-focus-within:block bg-black/90 rounded-lg p-2 shadow-lg z-10 min-w-[100px]">
                                <input type="range" id="volume-slider" min="0" max="100" value="100" class="w-full h-1.5 rounded-lg appearance-none bg-white/20 cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:shadow-md" aria-label="Contrôle du volume">
                                <div class="volume-label text-xs text-white/80 text-center mt-1" id="volume-label">100%</div>
                            </div>
                        </div>
                        
                        <button class="fullscreen-video bg-black/60 text-white p-2 sm:p-3 rounded-xl hover:bg-black/80 transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 neon-glow" aria-label="Passer en plein écran">
                           <svg id="fullscreen-open-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sm:w-6 sm:h-6">
                              <path d="M8 3H5a2 2 0 0 0-2 2v3"></path>
                              <path d="M21 8V5a2 2 0 0 0-2-2h-3"></path>
                              <path d="M3 16v3a2 2 0 0 0 2 2h3"></path>
                              <path d="M16 21h3a2 2 0 0 0 2-2v-3"></path>
                          </svg>
                            <svg id="fullscreen-close-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="hidden sm:w-6 sm:h-6">
                                <path d="M15 3h6v6"></path><path d="M18 6l-6 6"></path><path d="M9 21H3v-6"></path><path d="M6 18l6-6"></path><path d="M3 9V3h6"></path><path d="M6 6l6 6"></path><path d="M21 15v6h-6"></path><path d="M18 18l-6-6"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(videoModal);

    // --- 2. RÉFÉRENCES ET VARIABLES D'ÉTAT ---
    const modalVideo = document.getElementById('modal-video');
    const videoTitle = document.getElementById('video-title');
    const closeButton = videoModal.querySelector('.close-video-modal');
    const fullscreenButton = videoModal.querySelector('.fullscreen-video');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    const muteBtn = document.getElementById('mute-btn');
    const volumeUpIcon = document.getElementById('volume-up-icon');
    const volumeMuteIcon = document.getElementById('volume-mute-icon');
    const fullscreenOpenIcon = document.getElementById('fullscreen-open-icon');
    const fullscreenCloseIcon = document.getElementById('fullscreen-close-icon');
    const progressBar = document.getElementById('progress-bar');
    const progressFill = document.getElementById('progress-fill');
    const progressThumb = document.getElementById('progress-thumb');
    const currentTimeEl = document.getElementById('current-time');
    const durationEl = document.getElementById('duration');
    const modalContent = videoModal.querySelector('.modal-content');
    const gestureIndicator = document.getElementById('gesture-indicator');
    const volumeSlider = document.getElementById('volume-slider');
    const volumeLabel = document.getElementById('volume-label');

    let brightnessLevel = 1;
    let autoPauseTimer = null;
    let clickTimeout = null;
    let lastClickTime = 0;
    const clickDelay = 300; // Délai pour détecter double-clic
    let touchStartX = 0, touchStartY = 0;
    let lastTouchX = 0, lastTouchY = 0;
    let isSwiping = false;
    let isKeyboardInteraction = false; // Flag pour détecter interaction clavier et éviter conflits bouton

    // --- 3. FONCTIONS UTILITAIRES ---

    /** Formate le temps en minutes:secondes. */
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    /** Met à jour la luminosité via filtre CSS. */
    const updateBrightness = (level) => {
        brightnessLevel = Math.max(0.1, Math.min(2, level)); // Limites 10% à 200%
        modalVideo.style.filter = `brightness(${brightnessLevel})`;
    };

    /** Affiche temporairement un indicateur de geste (volume, luminosité, seek). */
    const showGestureIndicator = (text) => {
        gestureIndicator.textContent = text;
        gestureIndicator.classList.add('opacity-100');
        clearTimeout(gestureIndicator.timer);
        gestureIndicator.timer = setTimeout(() => {
            gestureIndicator.classList.remove('opacity-100');
        }, 800);
    };

    /** Met à jour l'affichage du volume. */
    const updateVolumeDisplay = () => {
        const volumePercent = Math.round(modalVideo.volume * 100);
        volumeSlider.value = volumePercent;
        volumeLabel.textContent = `${volumePercent}%`;
    };

    // --- 4. GESTION LECTURE/PAUSE/VOLUME (Améliorée pour éviter conflits bouton) ---

    /** Gère l'auto-pause sur inactivité. */
    const startAutoPauseTimer = () => {
        clearTimeout(autoPauseTimer);
        if (!modalVideo.paused) {
            autoPauseTimer = setTimeout(() => {
                modalVideo.pause();
                updatePlayPauseIcon(false);
            }, 5000);
        }
    };
    const clearAutoPauseTimer = () => clearTimeout(autoPauseTimer);

    /** Met à jour les icônes Play/Pause de manière synchrone. */
    const updatePlayPauseIcon = (isPlaying) => {
        // Force la mise à jour immédiate pour éviter les lags
        requestAnimationFrame(() => {
            playIcon.classList.toggle('hidden', isPlaying);
            pauseIcon.classList.toggle('hidden', !isPlaying);
            playPauseBtn.setAttribute('aria-label', isPlaying ? 'Pause' : 'Lecture');
        });
    };

    /** Met à jour les icônes Mute/Unmute. */
    const updateMuteIcon = (isMuted) => {
        volumeUpIcon.classList.toggle('hidden', isMuted);
        volumeMuteIcon.classList.toggle('hidden', !isMuted);
        muteBtn.setAttribute('aria-label', isMuted ? 'Rétablir le son' : 'Couper le son');
    };

    /** Toggle Play/Pause (avec flag pour clavier). */
    const togglePlayPause = () => {
        // Si interaction clavier, ignorer les conflits potentiels avec le bouton
        if (isKeyboardInteraction) {
            isKeyboardInteraction = false;
        }
        if (modalVideo.paused) {
            modalVideo.play().catch(error => console.error('Erreur de lecture vidéo:', error));
            updatePlayPauseIcon(true);
            startAutoPauseTimer();
        } else {
            modalVideo.pause();
            updatePlayPauseIcon(false);
            clearAutoPauseTimer();
        }
    };

    // Événement clic sur bouton play/pause (dédié, sans conflit)
    playPauseBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Empêche la propagation vers la vidéo
        togglePlayPause();
    });

    // Unifier les événements de clic sur la vidéo (simple clic pour contrôles, double pour toggle)
    modalVideo.addEventListener('click', (e) => {
        const now = Date.now();
        const delta = now - lastClickTime;
        lastClickTime = now;

        if (delta < clickDelay) {
            // Double-clic détecté : Toggle play/pause
            clearTimeout(clickTimeout);
            clickTimeout = null;
            togglePlayPause();
            e.preventDefault(); // Empêche l'action par défaut du double-clic
        } else {
            // Premier clic : Délai pour confirmer simple clic (afficher contrôles)
            clickTimeout = setTimeout(() => {
                if (!isSwiping) {
                    // Simple clic : Afficher contrôles (géré par group-hover)
                }
            }, clickDelay);
        }
        isSwiping = false; // Reset pour le prochain clic
        clearAutoPauseTimer(); // Interagit avec le lecteur
    });

    /** Toggle Mute. */
    const toggleMute = () => {
        modalVideo.muted = !modalVideo.muted;
        updateMuteIcon(modalVideo.muted);
        updateVolumeDisplay(); // Sync avec slider
        showGestureIndicator(modalVideo.muted ? '🔇 Muted' : '🔊 Unmuted');
    };
    muteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMute();
    });

    // Gestion du slider volume
    volumeSlider.addEventListener('input', (e) => {
        const volume = parseInt(e.target.value) / 100;
        modalVideo.volume = volume;
        modalVideo.muted = volume === 0;
        updateVolumeDisplay();
        updateMuteIcon(modalVideo.muted);
        clearAutoPauseTimer();
    });

    // Écouteurs de la vidéo pour synchronisation
    modalVideo.addEventListener('play', () => {
        updatePlayPauseIcon(true);
        startAutoPauseTimer();
    });
    modalVideo.addEventListener('pause', () => {
        updatePlayPauseIcon(false);
        clearAutoPauseTimer();
    });
    modalVideo.addEventListener('volumechange', () => {
        // Synchroniser l'icône muet si le volume est à 0 ou muet
        updateMuteIcon(modalVideo.muted || modalVideo.volume === 0);
        updateVolumeDisplay();
    });

    // --- 5. GESTION BARRE DE PROGRESSION (Pointer Events pour robustesse) ---

    let isSeeking = false;

    /** Met à jour la progression et l'affichage du temps. */
    const updateProgress = () => {
        if (modalVideo.duration) {
            const progress = (modalVideo.currentTime / modalVideo.duration) * 100;
            progressFill.style.width = `${progress}%`;
            progressThumb.style.left = `${progress}%`;
            
            // Affichage du temps
            currentTimeEl.textContent = formatTime(modalVideo.currentTime);
            durationEl.textContent = formatTime(modalVideo.duration);
            
            // Afficher le 'thumb' quand pause ou fin
            progressThumb.classList.toggle('opacity-100', modalVideo.paused || progress >= 100 || isSeeking);
        }
    };

    /** Calcule et applique le temps de seek. */
    const seekToPosition = (clientX) => {
        const rect = progressBar.getBoundingClientRect();
        let pos = (clientX - rect.left) / rect.width;
        pos = Math.max(0, Math.min(1, pos)); // Clamp entre 0 et 1
        modalVideo.currentTime = pos * modalVideo.duration;
    };

    progressBar.addEventListener('pointerdown', (e) => {
        isSeeking = true;
        seekToPosition(e.clientX);
        modalVideo.pause(); // Pause pendant le seek
        document.body.style.userSelect = 'none'; // Empêche la sélection de texte pendant le drag
        progressThumb.classList.add('scale-150'); // Effet visuel
        clearAutoPauseTimer();
    });

    document.addEventListener('pointermove', (e) => {
        if (isSeeking) {
            seekToPosition(e.clientX);
        }
    });

    document.addEventListener('pointerup', () => {
        if (isSeeking) {
            isSeeking = false;
            if (!modalVideo.paused) {
                modalVideo.play().catch(error => console.error('Erreur de lecture vidéo:', error));
                startAutoPauseTimer();
            }
            document.body.style.userSelect = 'auto';
            progressThumb.classList.remove('scale-150');
        }
    });

    modalVideo.addEventListener('timeupdate', updateProgress);
    modalVideo.addEventListener('loadedmetadata', updateProgress);

    // --- 6. GESTION DES GESTES TACTILES (Swipe - Affinée pour haut/bas) ---

    const SWIPE_THRESHOLD_X = 50; // Pixels
    const SWIPE_THRESHOLD_Y = 30; // Pixels
    const VOLUME_STEP = 0.05; // Plus fin pour gestes
    const BRIGHTNESS_STEP = 0.05;
    const SEEK_STEP = 5; // Secondes plus fin

    modalVideo.addEventListener('touchstart', (e) => {
        // On n'agit que si un seul doigt
        if (e.touches.length === 1) {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            lastTouchX = touchStartX;
            lastTouchY = touchStartY;
            isSwiping = false; // Réinitialisation de l'état de swipe
            clearAutoPauseTimer();
        }
    }, { passive: true }); // Passive: true pour le 'touchstart' initial (meilleure performance de scroll)

    modalVideo.addEventListener('touchmove', (e) => {
        if (e.touches.length !== 1) return;

        const touchEndX = e.touches[0].clientX;
        const touchEndY = e.touches[0].clientY;
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(deltaY);
        
        const currentDeltaX = touchEndX - lastTouchX;
        const currentDeltaY = touchEndY - lastTouchY;

        // Si le mouvement est significatif
        if (absDeltaX > SWIPE_THRESHOLD_X || absDeltaY > SWIPE_THRESHOLD_Y) {
            e.preventDefault(); // Empêche le défilement (scroll) natif
            isSwiping = true;

            // Détection du geste principal (on favorise l'axe dominant)
            if (absDeltaX > absDeltaY) {
                // Swipe Horizontal (Seek)
                const seekAmount = (currentDeltaX > 0 ? SEEK_STEP : -SEEK_STEP);
                modalVideo.currentTime = Math.max(0, Math.min(modalVideo.duration, modalVideo.currentTime + seekAmount));
                showGestureIndicator(`↔️ Seek ${seekAmount > 0 ? '+' : ''}${seekAmount}s`);
            } else {
                // Swipe Vertical (haut pour augmenter, bas pour diminuer)
                const windowWidth = window.innerWidth;
                const isUpward = currentDeltaY < 0; // Vers le haut si deltaY négatif
                if (touchStartX > windowWidth * 0.5) {
                    // Côté droit: Volume
                    const volumeDelta = isUpward ? VOLUME_STEP : -VOLUME_STEP;
                    modalVideo.volume = Math.max(0, Math.min(1, modalVideo.volume + volumeDelta));
                    const volumePercent = Math.round(modalVideo.volume * 100);
                    showGestureIndicator(`🔊 Volume: ${volumePercent}% ${isUpward ? '↑' : '↓'}`);
                } else {
                    // Côté gauche: Luminosité
                    const brightnessDelta = isUpward ? BRIGHTNESS_STEP : -BRIGHTNESS_STEP;
                    updateBrightness(brightnessLevel + brightnessDelta);
                    const brightnessPercent = Math.round(brightnessLevel * 100);
                    showGestureIndicator(`💡 Brightness: ${brightnessPercent}% ${isUpward ? '↑' : '↓'}`);
                }
            }
        }
        
        lastTouchX = touchEndX;
        lastTouchY = touchEndY;
    }, { passive: false }); // Passive: false pour permettre preventDefault

    // --- 7. GESTION PLEIN ÉCRAN ---

    fullscreenButton.addEventListener('click', () => {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            // Demande le plein écran sur le conteneur pour inclure les contrôles
            const targetElement = modalContent; 
            if (targetElement.requestFullscreen) {
                targetElement.requestFullscreen();
            } else if (targetElement.webkitRequestFullscreen) { /* Safari */
                targetElement.webkitRequestFullscreen();
            } else if (targetElement.msRequestFullscreen) { /* IE11 */
                targetElement.msRequestFullscreen();
            }
        }
    });

    // Écouteur fullscreen change pour ajuster les icônes
    document.addEventListener('fullscreenchange', () => {
        const isFullscreen = !!document.fullscreenElement;
        fullscreenOpenIcon.classList.toggle('hidden', isFullscreen);
        fullscreenCloseIcon.classList.toggle('hidden', !isFullscreen);
        // Ajout d'une classe pour les styles spécifiques au plein écran si besoin
        modalContent.classList.toggle('is-fullscreen', isFullscreen);
    });

    // --- 8. FERMETURE & INITIALISATION ---

    /** Ferme la modale et réinitialise l'état. */
    const closeModal = () => {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
        videoModal.classList.remove('open');
        clearAutoPauseTimer();
        
        setTimeout(() => {
            videoModal.classList.add('hidden');
            modalVideo.pause();
            modalVideo.currentTime = 0;
            modalVideo.muted = true; // Rétablir le 'muted' au repos
            modalVideo.volume = 1; // Rétablir le volume par défaut interne
            updateBrightness(1); // Reset luminosité
            updatePlayPauseIcon(false);
            updateMuteIcon(true);
            updateVolumeDisplay();
            document.body.style.overflow = 'auto';
            modalContent.classList.remove('group/parent'); // Retire le hover/interaction
        }, 500); // 500ms pour correspondre à la transition CSS
    };

    closeButton.addEventListener('click', closeModal);

    // Fermeture par clic en dehors du contenu
    videoModal.addEventListener('click', e => {
        if (e.target === videoModal) {
            closeModal();
        }
    });

    // --- 9. NAVIGATION CLAVIER (Améliorée avec flag pour interactions) ---

    const handleKeydown = (e) => {
        if (videoModal.classList.contains('hidden')) return; 

        isKeyboardInteraction = true; // Flag pour interactions clavier

        switch (e.key) {
            case 'Escape':
                e.preventDefault();
                closeModal();
                break;
            case ' ':
                e.preventDefault(); // Empêche le défilement de la page
                togglePlayPause();
                break;
            case 'ArrowRight':
                e.preventDefault();
                modalVideo.currentTime = Math.min(modalVideo.duration, modalVideo.currentTime + SEEK_STEP);
                break;
            case 'ArrowLeft':
                e.preventDefault();
                modalVideo.currentTime = Math.max(0, modalVideo.currentTime - SEEK_STEP);
                break;
            case 'ArrowUp':
                e.preventDefault();
                modalVideo.volume = Math.min(1, modalVideo.volume + VOLUME_STEP);
                showGestureIndicator(`🔊 Volume: ${Math.round(modalVideo.volume * 100)}% ↑`);
                break;
            case 'ArrowDown':
                e.preventDefault();
                modalVideo.volume = Math.max(0, modalVideo.volume - VOLUME_STEP);
                showGestureIndicator(`🔊 Volume: ${Math.round(modalVideo.volume * 100)}% ↓`);
                break;
            case 'f':
            case 'F':
                e.preventDefault();
                fullscreenButton.click();
                break;
            case 'm':
            case 'M':
                e.preventDefault();
                toggleMute();
                break;
        }
        clearAutoPauseTimer(); // Toute interaction clavier réinitialise le timer
    };
    document.addEventListener('keydown', handleKeydown);

    // --- 10. GESTION FIN DE VIDÉO ET OUVERTURE ---

    modalVideo.addEventListener('ended', () => {
        updatePlayPauseIcon(false);
        // On ferme 2s après la fin
        setTimeout(closeModal, 2000); 
    });

    /**
     * Expose la fonction pour ouvrir la modale vidéo.
     * @param {string} videoSrc - URL de la source vidéo.
     * @param {string} [title=''] - Titre de la vidéo.
     */
    window.openVideoModal = (videoSrc, title = '') => {
        videoModal.classList.remove('hidden');
        // Utilisation de requestAnimationFrame pour forcer le reflow avant l'ajout de la classe 'open'
        requestAnimationFrame(() => videoModal.classList.add('open'));
        
        modalVideo.src = videoSrc;
        videoTitle.textContent = title;
        modalVideo.load();
        
        // Initialisation des états au moment de l'ouverture
        modalVideo.muted = false; // Rétablit le son à l'ouverture (meilleure UX)
        updatePlayPauseIcon(true);
        updateMuteIcon(false);
        updateBrightness(1); 
        updateVolumeDisplay();
        progressFill.style.width = '0%';
        currentTimeEl.textContent = '0:00';
        durationEl.textContent = '0:00';
        
        // La lecture doit être initiée par l'utilisateur pour l'autoplay
        modalVideo.play().catch(error => {
            console.warn('Autoplay bloqué, l\'utilisateur doit cliquer sur Play.');
            modalVideo.muted = false; // Maintient le mute à 'false' pour un play user-initiated
            updatePlayPauseIcon(false); // Affiche le bouton Play
        });
        
        document.body.style.overflow = 'hidden';
        modalContent.classList.add('group/parent'); // Active l'état de contrôle visible
        startAutoPauseTimer();
    };
}


// Constantes globales
const INACTIVITY_CLOSE_DELAY = 5000;
let filterInactivityTimer = null;
const modals = []; // Tableau pour stocker les références des modales


/**
 * Initialise la modale des avis minimum (étoiles)
 */
function initReviewsModal() {
    const reviewsModal = document.createElement('div');
    reviewsModal.className = 'fixed inset-0 bg-black/50 z-50 hidden flex items-center justify-center p-4';
    reviewsModal.innerHTML = `
        <div class="modal-content  bg-white/50 dark:bg-ll-black  p-6 md:p-8 rounded-2xl shadow-2xl max-w-md w-full mx-auto overflow-hidden max-h-[90vh] overflow-y-auto transform transition-transform duration-500 scale-95 opacity-0">
            <h3 class="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                Sélectionner le nombre minimum d'avis
            </h3>
            <div id="modal-reviews-grid" class="space-y-6">
                <button id="zero-reviews-option" class="reviews-option flex items-center justify-center p-4 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/50 transition-all duration-300 w-full text-left focus:outline-none focus:ring-2 focus:ring-blue-500 group glass-effect" data-reviews="0">
                    <div class="flex items-center gap-3">
                        <span class="text-lg">☆☆☆☆☆</span>
                        <span id="zero-reviews-name" class="text-sm font-medium text-gray-900 dark:text-white">0 étoiles (Tous les services)</span>
                    </div>
                </button>
                <div class="star-row flex justify-center gap-2" id="star-row">
                    ${[...Array(5)].map((_, i) => `
                        <svg class="star-svg cursor-pointer transition-all duration-300" data-level="${i + 1}" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                    `).join('')}
                </div>
            </div>
            <div class="selection-label text-center mt-4 text-gray-600 dark:text-gray-300" id="selection-label">
                Cliquez sur une étoile pour sélectionner
            </div>
            <div class="tooltip text-center mt-2 text-sm text-gray-500 dark:text-gray-400 hidden" id="tooltip"></div>
            <div class="flex justify-center mt-6 gap-4">
                <button id="reviews-modal-cancel" class="px-6 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white rounded-xl hover:bg-gray-400 dark:hover:bg-gray-500 transition-all">Annuler</button>
                <button id="reviews-modal-confirm" class="px-6 py-2 bg-ll-blue text-white rounded-xl hover:shadow-lg neon-glow transition-all">Confirmer</button>
            </div>
        </div>
    `;
    document.body.appendChild(reviewsModal);
    modals.push(reviewsModal);

    const stars = [
        { id: 0, name: '0 étoiles (Tous les services)', icon: '☆☆☆☆☆', minReviews: 0, filled: false },
        { id: 1, name: '1 étoile', icon: '⭐☆☆☆☆', minReviews: 10, filled: true },
        { id: 2, name: '2 étoiles', icon: '⭐⭐☆☆☆', minReviews: 25, filled: true },
        { id: 3, name: '3 étoiles', icon: '⭐⭐⭐☆☆', minReviews: 50, filled: true },
        { id: 4, name: '4 étoiles', icon: '⭐⭐⭐⭐☆', minReviews: 75, filled: true },
        { id: 5, name: '5 étoiles', icon: '⭐⭐⭐⭐⭐', minReviews: 100, filled: true }
    ];

    const reviewLevels = {
        0: { min: 0, label: stars[0].name },
        1: { min: 10, label: stars[1].name },
        2: { min: 25, label: stars[2].name },
        3: { min: 50, label: stars[3].name },
        4: { min: 75, label: stars[4].name },
        5: { min: 100, label: stars[5].name }
    };

    const levelMap = Object.fromEntries(Object.entries(reviewLevels).map(([k, v]) => [v.min, parseInt(k)]));

    const starRow = reviewsModal.querySelector('#star-row');
    const selectionLabel = reviewsModal.querySelector('#selection-label');
    const tooltip = reviewsModal.querySelector('#tooltip');
    const zeroOption = reviewsModal.querySelector('#zero-reviews-option');
    const content = reviewsModal.querySelector('.modal-content');

    function updateStarDisplay(hoveredLevel = null, selectedLevel = null) {
        const fillLevel = hoveredLevel || selectedLevel || 0;

        starRow.querySelectorAll('.star-svg').forEach(star => {
            const level = parseInt(star.dataset.level);
            star.setAttribute('fill', level <= fillLevel ? '#fbbf24' : 'none');
            star.setAttribute('stroke', level <= fillLevel ? '#fbbf24' : '#d1d5db');
        });

        const currentLevel = hoveredLevel || selectedLevel || 0;
        selectionLabel.textContent = reviewLevels[currentLevel].label;
        if (hoveredLevel) {
            tooltip.textContent = `Survolez : au moins ${reviewLevels[currentLevel].min} avis`;
            tooltip.classList.remove('hidden');
        } else if (selectedLevel) {
            tooltip.textContent = `Filtre actif : au moins ${reviewLevels[currentLevel].min} avis`;
            tooltip.classList.remove('hidden');
        } else {
            tooltip.classList.add('hidden');
        }

        zeroOption.classList.toggle('selected', currentLevel === 0);
        zeroOption.classList.toggle('bg-ll-blue', currentLevel === 0);
        zeroOption.classList.toggle('text-white', currentLevel === 0);
        zeroOption.querySelector('span.text-lg').textContent = stars[0].icon;
        document.getElementById('zero-reviews-name').textContent = stars[0].name;
    }

    zeroOption.addEventListener('click', () => {
        starRow.querySelectorAll('.star-svg').forEach(star => star.classList.remove('selected'));
        updateStarDisplay(null, 0);
    });

    starRow.addEventListener('mouseenter', (e) => {
        const hoveredStar = e.target.closest('.star-svg');
        if (hoveredStar) {
            const level = parseInt(hoveredStar.dataset.level);
            updateStarDisplay(level);
        }
    }, true);

    starRow.addEventListener('mouseleave', () => {
        let selectedLevel = null;
        starRow.querySelectorAll('.star-svg').forEach(star => {
            if (star.classList.contains('selected')) {
                selectedLevel = parseInt(star.dataset.level);
            }
        });
        updateStarDisplay(null, selectedLevel || 0);
    });

    starRow.addEventListener('click', (e) => {
        const clickedStar = e.target.closest('.star-svg');
        if (clickedStar) {
            starRow.querySelectorAll('.star-svg').forEach(star => star.classList.remove('selected'));
            clickedStar.classList.add('selected');
            const level = parseInt(clickedStar.dataset.level);
            updateStarDisplay(null, level);
        }
    });

    function closeReviewsModal() {
        content.classList.remove('scale-100', 'opacity-100');
        setTimeout(() => {
            reviewsModal.classList.add('hidden');
            let currentMinReviews = getCurrentFilters().reviewsMin || 0;
            let currentLevel = levelMap[currentMinReviews] || 0;
            updateStarDisplay(null, currentLevel);
        }, 300);
    }

    function confirmReviewsSelection() {
        let selectedLevel = 0;
        const selectedStar = starRow.querySelector('.star-svg.selected');
        if (selectedStar) {
            selectedLevel = parseInt(selectedStar.dataset.level);
        }

        const minReviews = reviewLevels[selectedLevel].min;
        const reviewsName = reviewLevels[selectedLevel].label;

        document.getElementById('selected-reviews').textContent = reviewsName;
        let input = document.querySelector('input[name="reviews"]');
        if (!input) {
            input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'reviews';
            document.getElementById('reviews-trigger').appendChild(input);
        }
        input.value = minReviews;

        updateActiveFilters();
        updateServices();
        closeReviewsModal();
    }

    reviewsModal.querySelector('#reviews-modal-cancel').addEventListener('click', closeReviewsModal);
    reviewsModal.querySelector('#reviews-modal-confirm').addEventListener('click', confirmReviewsSelection);

    const reviewTrigger = document.getElementById('reviews-trigger');
    if (reviewTrigger) {
        reviewTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            reviewsModal.classList.remove('hidden');
            setTimeout(() => {
                content.classList.add('scale-100', 'opacity-100');
                let currentMinReviews = getCurrentFilters().reviewsMin || 0;
                let currentLevel = levelMap[currentMinReviews] || 0;
                if (currentLevel > 0) {
                    starRow.querySelector(`[data-level="${currentLevel}"]`)?.classList.add('selected');
                }
                updateStarDisplay(null, currentLevel);
            }, 10);
        });
    }

    reviewsModal.addEventListener('click', (e) => {
        if (e.target === reviewsModal) closeReviewsModal();
    });
}

/**
 * Initialise la modale des catégories
 */
function initCategoryModal() {
    const categoryModal = document.createElement('div');
    categoryModal.className = 'fixed inset-0 bg-black/50 z-50 hidden flex items-center justify-center p-4';
    categoryModal.innerHTML = `
        <div class="modal-content  bg-white/50 dark:bg-ll-black  p-6 md:p-8 rounded-2xl shadow-2xl max-w-5xl w-full mx-auto overflow-hidden max-h-[90vh] overflow-y-auto transform transition-transform duration-500 scale-95 opacity-0">
            <h3 class="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <path d="M3 9h18"></path><path d="M9 21v-12"></path>
                </svg>
                Sélectionner une catégorie
            </h3>
            <input type="text" id="modal-category-search" class="w-full p-3 mb-4 pl-12 pr-28 py-3 bg-ll-white/50 dark:bg-ll-black/20 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-colors duration-200" placeholder="Rechercher une catégorie...">
            <div id="modal-category-grid" class="category-grid"></div>
            <div class="flex justify-center mt-6 gap-4">
                <button id="category-modal-cancel" class="px-6 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white rounded-xl hover:bg-gray-400 dark:hover:bg-gray-500 transition-all">Annuler</button>
                <button id="category-modal-confirm" class="px-6 py-2 bg-ll-blue text-white rounded-xl hover:shadow-lg neon-glow transition-all">Confirmer</button>
            </div>
        </div>
    `;
    document.body.appendChild(categoryModal);
    modals.push(categoryModal);

    const categories = MOCK_CATEGORIES;

    const grid = categoryModal.querySelector('#modal-category-grid');
    grid.innerHTML = categories.map(category => `
        <button class="category-option no-border flex items-center gap-3 p-4 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/50 transition-all duration-300 w-full text-left focus:outline-none focus:ring-2 focus:ring-blue-500 group glass-effect ${category.id === getCurrentFilters().category ? 'selected bg-ll-blue text-white' : ''}" data-category="${category.id}">
            <span class="text-2xl transform group-hover:scale-110 transition-transform">${category.icon}</span>
            <span class="text-sm font-medium text-gray-900 dark:text-white flex-1">${category.name}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path>
            </svg>
        </button>
    `).join('');

    const searchInput = categoryModal.querySelector('#modal-category-search');
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        grid.querySelectorAll('.category-option').forEach(option => {
            const name = option.querySelector('span:nth-child(2)').textContent.toLowerCase();
            option.style.display = name.includes(term) ? 'flex' : 'none';
        });
    });

    grid.addEventListener('click', (e) => {
        const option = e.target.closest('.category-option');
        if (option) {
            grid.querySelectorAll('.category-option').forEach(s => s.classList.remove('selected', 'bg-ll-blue', 'text-white'));
            option.classList.add('selected', 'bg-ll-blue', 'text-white');
        }
    });

    function closeCategoryModal() {
        const content = categoryModal.querySelector('.modal-content');
        content.classList.remove('scale-100', 'opacity-100');
        setTimeout(() => categoryModal.classList.add('hidden'), 300);
    }

    function confirmCategorySelection() {
        const selected = grid.querySelector('.category-option.selected');
        if (selected) {
            const categoryId = selected.dataset.category;
            const categoryName = selected.querySelector('span:nth-child(2)').textContent;
            document.getElementById('selected-category').textContent = categoryName;
            let input = document.querySelector('input[name="category"]');
            if (!input) {
                input = document.createElement('input');
                input.type = 'hidden';
                input.name = 'category';
                document.getElementById('category-trigger').appendChild(input);
            }
            input.value = categoryId;
            updateActiveFilters();
            updateServices();
        }
        closeCategoryModal();
    }

    categoryModal.querySelector('#category-modal-cancel').addEventListener('click', closeCategoryModal);
    categoryModal.querySelector('#category-modal-confirm').addEventListener('click', confirmCategorySelection);

    const categoryTrigger = document.getElementById('category-trigger');
    if (categoryTrigger) {
        categoryTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            categoryModal.classList.remove('hidden');
            setTimeout(() => categoryModal.querySelector('.modal-content').classList.add('scale-100', 'opacity-100'), 10);
        });
    }

    categoryModal.addEventListener('click', (e) => {
        if (e.target === categoryModal) closeCategoryModal();
    });
}

/**
 * Initialise la modale de fréquence
 */
function initFrequencyModal() {
    const frequencyModal = document.createElement('div');
    frequencyModal.className = 'fixed inset-0 bg-black/50 z-50 hidden flex items-center justify-center p-4';
    frequencyModal.innerHTML = `
        <div class="modal-content  bg-white/50 dark:bg-ll-black  p-6 md:p-8 rounded-2xl shadow-2xl max-w-md w-full mx-auto overflow-hidden max-h-[90vh] overflow-y-auto transform transition-transform duration-500 scale-95 opacity-0">
            <h3 class="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
                Sélectionner une fréquence
            </h3>
            <div id="modal-frequency-grid" class="space-y-3"></div>
            <div class="flex justify-center mt-6 gap-4">
                <button id="frequency-modal-cancel" class="px-6 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white rounded-xl hover:bg-gray-400 dark:hover:bg-ll-black/500 transition-all">Annuler</button>
                <button id="frequency-modal-confirm" class="px-6 py-2 bg-ll-blue text-white rounded-xl hover:shadow-lg neon-glow transition-all">Confirmer</button>
            </div>
        </div>
    `;
    document.body.appendChild(frequencyModal);
    modals.push(frequencyModal);

    const frequencies = [
        { id: 'all', name: 'Toutes', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-ll-white"><path d="M3 3h18v18H3z"></path><path d="M12 8v8"></path><path d="M8 12h8"></path></svg>` },
        { id: 'régulier', name: 'Régulier', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-ll-white"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>` },
        { id: 'ponctuel', name: 'Ponctuel', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-ll-white"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>` }
    ];

    const grid = frequencyModal.querySelector('#modal-frequency-grid');
    grid.innerHTML = frequencies.map(freq => `
        <label class="flex items-center cursor-pointer hover:bg-ll-black/50 dark:hover:bg-gray-700 p-4 rounded-xl transition-all w-full ${freq.id === getCurrentFilters().frequency ? 'bg-ll-blue text-white' : ''}">
            <input type="radio" name="frequency" value="${freq.id}" class="form-radio text-ll-blue focus:ring-ll-blue sr-only" ${freq.id === getCurrentFilters().frequency ? 'checked' : ''}>
            <div class="flex items-center gap-3 ml-3 flex-1">
                <span class="text-2xl">${freq.icon}</span>
                <span class="text-sm font-medium text-gray-900 dark:text-white">${freq.name}</span>
            </div>
        </label>
    `).join('');

    grid.querySelectorAll('label').forEach(label => {
        label.addEventListener('click', function (e) {
            if (e.target.tagName.toLowerCase() === 'input') return;
            grid.querySelectorAll('input[type="radio"]').forEach(input => input.checked = false);
            this.querySelector('input[type="radio"]').checked = true;
            grid.querySelectorAll('label').forEach(l => l.classList.remove('bg-ll-blue', 'text-white'));
            this.classList.add('bg-ll-blue', 'text-white');
        });
    });

    function closeFrequencyModal() {
        const content = frequencyModal.querySelector('.modal-content');
        content.classList.remove('scale-100', 'opacity-100');
        setTimeout(() => frequencyModal.classList.add('hidden'), 300);
    }

    function confirmFrequencySelection() {
        const selectedRadio = grid.querySelector('input[name="frequency"]:checked');
        if (selectedRadio) {
            const freqName = selectedRadio.closest('label').querySelector('span:last-child').textContent;
            document.getElementById('selected-frequency').textContent = freqName;
            let input = document.querySelector('input[name="frequency"]');
            if (!input) {
                input = document.createElement('input');
                input.type = 'hidden';
                input.name = 'frequency';
                document.getElementById('frequency-trigger').appendChild(input);
            }
            input.value = selectedRadio.value;
            updateActiveFilters();
            updateServices();
        }
        closeFrequencyModal();
    }

    frequencyModal.querySelector('#frequency-modal-cancel').addEventListener('click', closeFrequencyModal);
    frequencyModal.querySelector('#frequency-modal-confirm').addEventListener('click', confirmFrequencySelection);

    const frequencyTrigger = document.getElementById('frequency-trigger');
    if (frequencyTrigger) {
        frequencyTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            frequencyModal.classList.remove('hidden');
            setTimeout(() => frequencyModal.querySelector('.modal-content').classList.add('scale-100', 'opacity-100'), 10);
        });
    }

    frequencyModal.addEventListener('click', (e) => {
        if (e.target === frequencyModal) closeFrequencyModal();
    });
}

/**
 * Initialise la modale de difficulté
 */
function initDifficultyModal() {
    const difficultyModal = document.createElement('div');
    difficultyModal.className = 'fixed inset-0 bg-black/50 z-50 hidden flex items-center justify-center p-4';
    difficultyModal.innerHTML = `
        <div class="modal-content  bg-white/50 dark:bg-ll-black  p-6 md:p-8 rounded-2xl shadow-2xl max-w-md w-full mx-auto overflow-hidden max-h-[90vh] overflow-y-auto transform transition-transform duration-500 scale-95 opacity-0">
            <h3 class="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
                Sélectionner un niveau de difficulté
            </h3>
            <div id="modal-difficulty-grid" class="space-y-3"></div>
            <div class="flex justify-center mt-6 gap-4">
                <button id="difficulty-modal-cancel" class="px-6 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white rounded-xl hover:bg-gray-400 dark:hover:bg-ll-black/500 transition-all">Annuler</button>
                <button id="difficulty-modal-confirm" class="px-6 py-2 bg-ll-blue text-white rounded-xl hover:shadow-lg neon-glow transition-all">Confirmer</button>
            </div>
        </div>
    `;
    document.body.appendChild(difficultyModal);
    modals.push(difficultyModal);

    const difficulties = [
        { id: 'all', name: 'Tous', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-ll-white hover:text-ll-dark-blue"><path d="M3 3h18v18H3z"></path><path d="M12 8v8"></path><path d="M8 12h8"></path></svg>` },
        { id: 'easy', name: 'Facile', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-ll-white hover:text-ll-dark-blue"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><path d="M9 9h.01"></path><path d="M15 9h.01"></path></svg>` },
        { id: 'medium', name: 'Moyen', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-ll-white hover:text-ll-dark-blue"><circle cx="12" cy="12" r="10"></circle><path d="M8 14h8"></path><path d="M9 9h.01"></path><path d="M15 9h.01"></path></svg>` },
        { id: 'hard', name: 'Difficile', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-ll-white"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5-2 4-2 4 2 4 2"></path><path d="M9 9h.01"></path><path d="M15 9h.01"></path></svg>` }
    ];

    const grid = difficultyModal.querySelector('#modal-difficulty-grid');
    grid.innerHTML = difficulties.map(diff => `
        <label class="flex items-center cursor-pointer hover:bg-ll-black/50 dark:hover:bg-gray-700 p-4 rounded-xl transition-all w-full ${diff.id === getCurrentFilters().difficulty ? 'bg-ll-blue text-white' : ''}">
            <input type="radio" name="difficulty" value="${diff.id}" class="form-radio text-ll-blue focus:ring-ll-blue sr-only" ${diff.id === getCurrentFilters().difficulty ? 'checked' : ''}>
            <div class="flex items-center gap-3 ml-3 flex-1">
                <span class="text-2xl text-white">${diff.icon}</span>
                <span class="text-sm font-medium text-gray-900 dark:text-white">${diff.name}</span>
            </div>
        </label>
    `).join('');

    grid.querySelectorAll('label').forEach(label => {
        label.addEventListener('click', function (e) {
            if (e.target.tagName.toLowerCase() === 'input') return;
            grid.querySelectorAll('input[type="radio"]').forEach(input => input.checked = false);
            this.querySelector('input[type="radio"]').checked = true;
            grid.querySelectorAll('label').forEach(l => l.classList.remove('bg-ll-blue', 'text-white'));
            this.classList.add('bg-ll-blue', 'text-white');
        });
    });

    function closeDifficultyModal() {
        const content = difficultyModal.querySelector('.modal-content');
        content.classList.remove('scale-100', 'opacity-100');
        setTimeout(() => difficultyModal.classList.add('hidden'), 300);
    }

    function confirmDifficultySelection() {
        const selectedRadio = grid.querySelector('input[name="difficulty"]:checked');
        if (selectedRadio) {
            const diffName = selectedRadio.closest('label').querySelector('span:last-child').textContent;
            document.getElementById('selected-difficulty').textContent = diffName;
            let input = document.querySelector('input[name="difficulty"]');
            if (!input) {
                input = document.createElement('input');
                input.type = 'hidden';
                input.name = 'difficulty';
                document.getElementById('difficulty-trigger').appendChild(input);
            }
            input.value = selectedRadio.value;
            updateActiveFilters();
            updateServices();
        }
        closeDifficultyModal();
    }

    difficultyModal.querySelector('#difficulty-modal-cancel').addEventListener('click', closeDifficultyModal);
    difficultyModal.querySelector('#difficulty-modal-confirm').addEventListener('click', confirmDifficultySelection);

    const difficultyTrigger = document.getElementById('difficulty-trigger');
    if (difficultyTrigger) {
        difficultyTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            difficultyModal.classList.remove('hidden');
            setTimeout(() => difficultyModal.querySelector('.modal-content').classList.add('scale-100', 'opacity-100'), 10);
        });
    }

    difficultyModal.addEventListener('click', (e) => {
        if (e.target === difficultyModal) closeDifficultyModal();
    });
}

/**
 * Initialise le temporisateur d'inactivité du panneau de filtres
 */
function initFilterInactivityTimer() {
    const filterPanel = document.getElementById('filter-panel');
    const openBtn = document.getElementById('open-filter-panel');
    const servicesList = document.getElementById('services-list');

    if (!filterPanel) {
        console.warn('Filter panel element not found, skipping initFilterInactivityTimer.');
        return;
    }

    const startTimer = () => {
        clearTimeout(filterInactivityTimer);
        filterInactivityTimer = setTimeout(() => {
            if (!modals.some(modal => !modal.classList.contains('hidden'))) {
                filterPanel.classList.add('opacity-0', 'scale-95');
                setTimeout(() => {
                    filterPanel.classList.add('hidden');
                    filterPanel.classList.remove('opacity-0', 'scale-95');
                }, 300);
            }
        }, INACTIVITY_CLOSE_DELAY);
    };

    const clearTimer = () => {
        clearTimeout(filterInactivityTimer);
        filterPanel.classList.remove('opacity-0', 'scale-95');
    };

    filterPanel.addEventListener('mouseenter', clearTimer);
    filterPanel.addEventListener('mouseleave', startTimer);
    filterPanel.addEventListener('click', clearTimer);
    filterPanel.addEventListener('scroll', clearTimer);
    filterPanel.addEventListener('touchstart', clearTimer);
    filterPanel.addEventListener('touchmove', clearTimer);

    if (servicesList) {
        servicesList.addEventListener('click', clearTimer);
        servicesList.addEventListener('scroll', clearTimer);
        servicesList.addEventListener('touchstart', clearTimer);
        servicesList.addEventListener('touchmove', clearTimer);
    }

    if (openBtn) {
        openBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (filterPanel.classList.contains('hidden')) {
                filterPanel.classList.remove('hidden');
                filterPanel.classList.add('opacity-0', 'scale-95');
                filterPanel.offsetHeight;
                filterPanel.classList.remove('opacity-0', 'scale-95');
                clearTimer();
                startTimer();
            } else {
                filterPanel.classList.add('opacity-0', 'scale-95');
                setTimeout(() => {
                    filterPanel.classList.add('hidden');
                    filterPanel.classList.remove('opacity-0', 'scale-95');
                }, 300);
                clearTimer();
            }
        });
    }

    const filterInputs = filterPanel.querySelectorAll('input, button, select');
    filterInputs.forEach(input => {
        input.addEventListener('change', clearTimer);
        input.addEventListener('click', clearTimer);
        input.addEventListener('touchstart', clearTimer);
    });

    document.addEventListener('click', (e) => {
        if (!filterPanel.contains(e.target) && e.target !== openBtn && !filterPanel.classList.contains('hidden') && !modals.some(modal => !modal.classList.contains('hidden'))) {
            filterPanel.classList.add('opacity-0', 'scale-95');
            setTimeout(() => {
                filterPanel.classList.add('hidden');
                filterPanel.classList.remove('opacity-0', 'scale-95');
            }, 300);
            clearTimer();
        }
    });

    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (!modal.classList.contains('hidden')) {
                clearTimer();
            }
        });
    });
}


/**
 * Initialise la recherche - DEBOUNCE ET AUTO-UPDATE (sidebar + detail complet à chaque saisie)
 */
function initSearch() {
    const searchInput = document.getElementById('service-search');
    const clearButton = document.getElementById('clear-search');
    if (!searchInput || !clearButton) return;

    let searchTimeout;
    
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(async () => {
            await updateServices(); 
            highlightSearchTerms({});
        }, 300);
        
        if (e.target.value) {
            searchInput.parentElement?.classList.add('neon-glow');
            clearButton.classList.remove('hidden');
        } else {
            searchInput.parentElement?.classList.remove('neon-glow');
            clearButton.classList.add('hidden');
        }
    });

    clearButton.addEventListener('click', () => {
        searchInput.value = '';
        searchInput.focus();
        clearButton.classList.add('hidden');
        updateServices();
        // Reset highlights sur clear
        resetHighlights();
    });
}

/**
 * Initialise interactions - AVEC AUTO-UPDATE SUR FILTRES
 */
export function initServiceInteractions() {
    initFilterInactivityTimer();
    const resetBtn = document.getElementById('reset-filters');
    if (resetBtn) resetBtn.addEventListener('click', resetAllFilters);
    
    initCategoryModal(); 
    initReviewsModal(); 
    initFrequencyModal();
    initDifficultyModal();

    initSearch(); 

    initFilterListeners();
    initSearch();
    
    document.querySelectorAll('input[name="frequency"], input[name="difficulty"]').forEach(radio => {
        radio.addEventListener('change', updateServices);
    });
}

let isUpdating = false;
let lastFiltersHash = '';

/**
 * Met à jour l'affichage des filtres actifs - AVEC AUTO-UPDATE
 */
function updateActiveFilters() {
    if (isUpdating) return;
    isUpdating = true;

    const activeFiltersContainer = document.getElementById('active-filters');
    if (!activeFiltersContainer) {
        isUpdating = false;
        return;
    }

    const filters = getCurrentFilters();
    const filtersHash = JSON.stringify(filters);
    if (filtersHash === lastFiltersHash) {
        isUpdating = false;
        return;
    }
    lastFiltersHash = filtersHash;

    activeFiltersContainer.replaceChildren();
    const activeFilters = [];

    if (filters.category && filters.category !== 'all') {
        const categoryName = document.getElementById('selected-category')?.textContent || 'Catégorie';
        activeFilters.push({ type: 'category', value: filters.category, label: categoryName, color: 'blue' });
    }

    if (filters.frequency && filters.frequency !== 'all') {
        const frequencyName = document.getElementById('selected-frequency')?.textContent || 'Fréquence';
        activeFilters.push({ type: 'frequency', value: filters.frequency, label: frequencyName, color: 'green' });
    }

    if (filters.difficulty && filters.difficulty !== 'all') {
        const difficultyName = document.getElementById('selected-difficulty')?.textContent || 'Difficulté';
        activeFilters.push({ type: 'difficulty', value: filters.difficulty, label: difficultyName, color: 'purple' });
    }

    if (filters.reviewsMin > 0) {
        activeFilters.push({ type: 'reviews', value: filters.reviewsMin, label: `Min. ${filters.reviewsMin} avis`, color: 'yellow' });
    }

    if (activeFilters.length > 0) {
        const fragment = document.createDocumentFragment();
        activeFilters.forEach(filter => {
            const span = document.createElement('span');
            span.className = `inline-flex items-center gap-2 bg-${filter.color}-100/50 dark:bg-${filter.color}-900/50 text-${filter.color}-800 dark:text-${filter.color}-200 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 cursor-pointer remove-filter glass-effect neon-glow`;
            span.dataset.type = filter.type;
            span.innerHTML = `
                ${filter.label}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="hover:scale-110 transition-transform">
                    <path d="M18 6L6 18"></path><path d="M6 6l12 12"></path>
                </svg>
            `;
            fragment.appendChild(span);
        });
        activeFiltersContainer.appendChild(fragment);
        activeFiltersContainer.classList.remove('hidden');
    } else {
        activeFiltersContainer.classList.add('hidden');
    }

    isUpdating = false;
}


/**
 * Supprime un filtre et déclenche une mise à jour
 */
function removeFilter(filterType) {
    if (isUpdating) return;
    isUpdating = true;

    switch (filterType) {
        case 'category':
            const categoryDisplay = document.getElementById('selected-category');
            if (categoryDisplay) categoryDisplay.textContent = 'Toutes les catégories';
            document.querySelector('input[name="category"]')?.remove();
            break;
        case 'frequency':
            const frequencyDisplay = document.getElementById('selected-frequency');
            if (frequencyDisplay) frequencyDisplay.textContent = 'Toutes les fréquences';
            const freqAll = document.querySelector('input[name="frequency"][value="all"]');
            if (freqAll) freqAll.checked = true;
            document.querySelector('input[name="frequency"][type="hidden"]')?.remove();
            break;
        case 'difficulty':
            const difficultyDisplay = document.getElementById('selected-difficulty');
            if (difficultyDisplay) difficultyDisplay.textContent = 'Tous les niveaux';
            const diffAll = document.querySelector('input[name="difficulty"][value="all"]');
            if (diffAll) diffAll.checked = true;
            document.querySelector('input[name="difficulty"][type="hidden"]')?.remove();
            break;
        case 'reviews':
            const reviewsInput = document.getElementById('reviewsMin-input');
            if (reviewsInput) reviewsInput.value = '0';
            const reviewsHidden = document.querySelector('input[name="reviews"]');
            if (reviewsHidden) reviewsHidden.remove();
            const reviewsDisplay = document.getElementById('selected-reviews');
            if (reviewsDisplay) reviewsDisplay.textContent = '0 étoiles';
            const starDisplay = document.getElementById('reviews-star-display');
            if (starDisplay) starDisplay.innerHTML = renderStarRatingForReviews(0);
            break;
    }

    updateActiveFilters();
    updateServices();
    isUpdating = false;
}


/**
 * Récupère les filtres actuels - ROBUSTE
 */
function getCurrentFilters() {
    return {
        category: document.querySelector('input[name="category"]')?.value || 'all',
        frequency: document.querySelector('input[name="frequency"]:checked')?.value || 'all',
        difficulty: document.querySelector('input[name="difficulty"]:checked')?.value || 'all',
        reviewsMin: parseInt(document.querySelector('input[name="reviews"]')?.value || 0) || 0,
        search: document.getElementById('service-search')?.value.trim() || ''
    };
}

/**
 * Réinitialise tous les filtres et déclenche une mise à jour complète
 */
function resetAllFilters() {
    if (isUpdating) return; // Protection contre la récursion
    isUpdating = true;

    // Reset category
    const categoryDisplay = document.getElementById('selected-category');
    if (categoryDisplay) categoryDisplay.textContent = 'Toutes les catégories';
    const categoryInput = document.querySelector('input[name="category"]');
    if (categoryInput) categoryInput.remove();

    // Reset frequency
    const frequencyDisplay = document.getElementById('selected-frequency');
    if (frequencyDisplay) frequencyDisplay.textContent = 'Toutes les fréquences';
    const frequencyInputs = document.querySelectorAll('input[name="frequency"]');
    frequencyInputs.forEach(input => input.checked = input.value === 'all');
    const frequencyHidden = document.querySelector('input[name="frequency"][type="hidden"]');
    if (frequencyHidden) frequencyHidden.remove();

    // Reset difficulty
    const difficultyDisplay = document.getElementById('selected-difficulty');
    if (difficultyDisplay) difficultyDisplay.textContent = 'Tous les niveaux';
    const difficultyInputs = document.querySelectorAll('input[name="difficulty"]');
    difficultyInputs.forEach(input => input.checked = input.value === 'all');
    const difficultyHidden = document.querySelector('input[name="difficulty"][type="hidden"]');
    if (difficultyHidden) difficultyHidden.remove();

    // Reset reviews
    const reviewsInput = document.getElementById('reviewsMin-input');
    if (reviewsInput) reviewsInput.value = '0';
    const reviewsHidden = document.querySelector('input[name="reviews"]');
    if (reviewsHidden) reviewsHidden.remove();
    const reviewsDisplay = document.getElementById('selected-reviews');
    if (reviewsDisplay) reviewsDisplay.textContent = '0 étoiles';
    const starDisplay = document.getElementById('reviews-star-display');
    if (starDisplay) starDisplay.innerHTML = renderStarRatingForReviews(0);

    // Reset search
    const searchInput = document.getElementById('service-search');
    const clearBtn = document.getElementById('clear-search');
    if (searchInput) searchInput.value = '';
    if (clearBtn) clearBtn.classList.add('hidden');

    // Forcer la suppression des badges
    const activeFiltersContainer = document.getElementById('active-filters');
    if (activeFiltersContainer) {
        activeFiltersContainer.replaceChildren();
        activeFiltersContainer.classList.add('hidden');
    }

    lastFiltersHash = '';

    updateActiveFilters();
    updateServices();
    isUpdating = false;
}



/**
 * Débounce pour limiter les appels à updateServices
 */
const debouncedUpdateServices = debounce(() => {
    updateServices();
}, 300);

/**
 * Fonction de débouncing générique
 */
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}


/**
 * Initialise les écouteurs pour la mise à jour en temps réel
 */
function initFilterListeners() {
    const searchInput = document.getElementById('service-search');
    const reviewsInput = document.getElementById('reviewsMin-input');
    const categoryInputs = document.querySelectorAll('input[name="category"]');
    const frequencyInputs = document.querySelectorAll('input[name="frequency"]');
    const difficultyInputs = document.querySelectorAll('input[name="difficulty"]');
    const resetButton = document.getElementById('reset-filters');
    const clearSearchButton = document.getElementById('clear-search');

    // Écouteur pour la recherche
    if (searchInput) {
        searchInput.addEventListener('input', debouncedUpdateServices);
    }

    // Écouteur pour les avis minimum
    if (reviewsInput) {
        reviewsInput.addEventListener('change', () => {
            const display = document.getElementById('reviews-star-display');
            if (display) display.innerHTML = renderStarRatingForReviews(parseInt(reviewsInput.value) || 0);
            debouncedUpdateServices();
        });
    }

    // Écouteurs pour les inputs radio (catégorie, fréquence, difficulté)
    [categoryInputs, frequencyInputs, difficultyInputs].forEach(inputGroup => {
        inputGroup.forEach(input => {
            input.addEventListener('change', debouncedUpdateServices);
        });
    });

    // Écouteur pour réinitialiser tous les filtres
    if (resetButton) {
        resetButton.addEventListener('click', resetAllFilters);
    }

    // Écouteur pour effacer la recherche
    if (clearSearchButton) {
        clearSearchButton.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            clearSearchButton.classList.add('hidden');
            debouncedUpdateServices();
        });
    }

    const activeFiltersContainer = document.getElementById('active-filters');
    if (activeFiltersContainer) {
        activeFiltersContainer.addEventListener('click', (e) => {
            const button = e.target.closest('.remove-filter');
            if (button) {
                const filterType = button.dataset.type;
                removeFilter(filterType);
            }
        });
    }
}

/**
 * Rend les étoiles pour l'affichage des avis min (similaire à renderStarRating)
 */
function renderStarRatingForReviews(rating) {
    return Array.from({ length: 5 }, (_, i) => `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="${i < rating / 20 ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" class="text-yellow-400">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
    `).join('');
}

/**
 * Met à jour l'affichage des services - ULTRA SYNCHRO
 */
export async function updateServices() {
    await toggleServicesLoading(true);
    isUpdating = true;

    try {
        const filters = getCurrentFilters();
        const services = await loadServices(filters);

        renderServicesSidebar(services);
        updateActiveFilters();

        const detailContainer = document.getElementById('service-detail-container');
        if (services.length > 0) {
            hideNoServicesMessage();
            setServiceIndex(services.length > currentServiceIndex ? currentServiceIndex : 0);
            renderServiceDetail(services[currentServiceIndex], currentServiceIndex, services.length);

            if (detailContainer) {
                const existingContent = detailContainer.querySelector('.service-detail-content');
                if (existingContent) {
                    existingContent.classList.remove('hidden');
                    existingContent.style.zIndex = '0';
                }
            }
        } else {
            showNoServicesMessage();
            if (detailContainer) {
                const existingContent = detailContainer.querySelector('.service-detail-content');
                if (existingContent) {
                    existingContent.classList.add('hidden');
                }
            }
        }

        const servicesCount = document.getElementById('services-count');
        if (servicesCount) servicesCount.textContent = services.length;

    } catch (error) {
        console.error('Erreur lors du chargement des services:', error);
        showNotification('Erreur lors du chargement des services.', 'error');
        renderServicesSidebar([]);
        showNoServicesMessage();
    } finally {
        await toggleServicesLoading(false, allFilteredServices.length === 0); 
        isUpdating = false;
    }
}

/**
 * Affiche le message "Aucun service trouvé" - ROBUSTE ET OPAQUE
 */
export function showNoServicesMessage() {
    const grid = document.getElementById('services-display-grid');
    if (!grid) {
        console.warn('Grid element not found, skipping showNoServicesMessage.');
        return;
    }

    grid.classList.add('hidden');

    let noServicesDiv = document.getElementById('no-services-display');
    if (!noServicesDiv) {
        noServicesDiv = document.createElement('div');
        noServicesDiv.id = 'no-services-display';
        noServicesDiv.className = 'col-span-full text-center py-20';
        noServicesDiv.innerHTML = `
            <div class="max-w-md mx-auto p-8">
                <svg class="text-gray-400 dark:text-white mx-auto mb-6 animate-pulse" width="80" height="80" viewBox="0 0 74.34 74.34" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g>
            <path fill="currentColor" d="M29.52,53.303h-8.945c-0.552,0-1,0.448-1,1v8.104c0,0.343,0.176,0.662,0.466,0.845l4.473,2.826 c0.163,0.103,0.349,0.155,0.534,0.155s0.371-0.052,0.534-0.155l4.473-2.826c0.29-0.183,0.466-0.502,0.466-0.845v-8.104 C30.52,53.751,30.072,53.303,29.52,53.303z M28.52,61.856l-3.473,2.194l-3.473-2.194v-6.553h6.945V61.856z M22.81,28.413 c0.925,8.32,7.514,12.07,11.993,12.07c4.479,0,11.067-3.75,11.993-12.07c1.333-0.702,3.13-2.447,3.039-5.548 c-0.018-0.599-0.071-2.419-1.406-2.924c-1.313-0.497-2.638,0.819-2.891,1.088c-0.377,0.404-0.356,1.037,0.047,1.414 s1.037,0.357,1.414-0.047c0.175-0.187,0.482-0.424,0.686-0.521c0.056,0.151,0.134,0.462,0.151,1.05 c0.085,2.891-2.028,3.759-2.238,3.838l-3.894,0.853c-4.581-0.493-9.221-0.493-13.801,0l-3.901-0.854 c-0.295-0.116-2.315-1.014-2.232-3.836c0.017-0.588,0.095-0.899,0.151-1.05c0.192,0.092,0.486,0.311,0.686,0.521 c0.377,0.403,1.01,0.423,1.414,0.047c0.403-0.377,0.424-1.01,0.047-1.414c-0.252-0.269-1.572-1.589-2.891-1.088 c-1.335,0.504-1.389,2.325-1.406,2.924C19.679,25.967,21.477,27.712,22.81,28.413z M24.92,29.009l1.998,0.438l0.589,5.339 C26.295,33.365,25.331,31.47,24.92,29.009z M42.097,34.785l0.589-5.339l1.998-0.438C44.273,31.47,43.309,33.365,42.097,34.785z M40.667,29.515l-0.795,7.198c-0.002,0.017,0.005,0.032,0.004,0.048c-1.835,1.225-3.776,1.722-5.074,1.722 c-1.296,0-3.232-0.496-5.064-1.716l-0.8-7.252C32.833,29.149,36.77,29.149,40.667,29.515z M29.438,42.722l-2.902,1.362l-0.255-4.656 c-0.03-0.552-0.509-0.976-1.053-0.944c-0.551,0.03-0.974,0.502-0.944,1.053l0.053,0.972c-3.428,1.238-6.537,3.485-8.878,6.368 c-0.137-0.803-0.428-1.572-1.058-2.206c-0.255-0.257-0.565-0.466-0.905-0.648v-7.55c0.279,0.079,0.586,0.216,0.861,0.458 c0.67,0.587,1.009,1.63,1.009,3.101V43.2c0,0.552,0.448,1,1,1s1-0.448,1-1v-3.167c0-2.072-0.569-3.621-1.691-4.604 c-0.728-0.638-1.544-0.897-2.185-0.996c-0.016-0.538-0.452-0.971-0.994-0.971H1c-0.552,0-1,0.448-1,1V37.5c0,0.552,0.448,1,1,1h3.09 c0.14,1.476,0.632,4.212,2.33,5.737c-0.201,0.135-0.402,0.269-0.568,0.436c-1.194,1.201-1.185,2.886-1.177,4.372l0.001,6.94 c0,1.83,0.909,3.448,2.297,4.437c-0.578,0.87-1.148,1.603-1.145,1.603c-3.024,3.302-2.698,9.679-2.683,9.949 c0.03,0.529,0.468,0.943,0.999,0.943h13.131c0.53,0,0.968-0.414,0.999-0.943c0.015-0.27,0.341-6.648-2.662-9.925 c-0.011-0.013-0.945-1.112-1.641-2.204c0.992-0.987,1.606-2.353,1.606-3.86l0.001-5.84c2.064-3.39,5.257-6.083,8.874-7.535 l0.168,3.065c0.018,0.332,0.2,0.633,0.485,0.804c0.158,0.094,0.335,0.142,0.513,0.142c0.145,0,0.29-0.031,0.425-0.095l4.245-1.992 c0.5-0.235,0.715-0.83,0.48-1.33C30.533,42.702,29.937,42.489,29.438,42.722z M2,35.461h1.13V36.5H2V35.461z M9.391,43.338 c-3.29,0-3.357-5.784-3.357-5.842C6.03,36.98,5.633,36.57,5.13,36.519v-1.059h6.366v7.879l-1.361-0.001c-0.003,0-0.006,0-0.009,0 c-0.003,0-0.005,0-0.008,0L9.391,43.338z M6.675,49.034c-0.006-1.203-0.013-2.34,0.595-2.951c0.49-0.493,1.448-0.743,2.845-0.744 l0.024,0c1.397,0.002,2.355,0.251,2.844,0.744c0.406,0.409,0.536,1.054,0.577,1.795h-2.325c-0.552,0-1,0.448-1,1s0.448,1,1,1h2.343 l0,1.821h-2.343c-0.552,0-1,0.448-1,1s0.448,1,1,1h2.342l0,1.688h-2.342c-0.552,0-1,0.448-1,1s0.448,1,1,1h2.037 c-0.539,1.204-1.743,2.047-3.145,2.047c-1.902,0-3.45-1.548-3.45-3.45L6.675,49.034z M5.133,70.917 c0.007-0.393,0.031-0.897,0.079-1.451h10.995c0.048,0.553,0.071,1.058,0.078,1.451H5.133z M14.115,63.374 c0.974,1.063,1.509,2.608,1.808,4.091H5.501c0.305-1.494,0.853-3.057,1.852-4.149c0.037-0.047,0.767-0.981,1.456-2.049 c0.423,0.105,0.862,0.168,1.317,0.168c0.78,0,1.52-0.167,2.191-0.464C13.089,62.17,14.047,63.296,14.115,63.374z M21.2,16.754v1.046 c0,0.552,0.448,1,1,1s1-0.448,1-1v-1.37c2.995-1.182,7.331-2.308,11.602-2.308c4.271,0,8.607,1.126,11.602,2.308v1.37 c0,0.552,0.448,1,1,1s1-0.448,1-1v-1.046c0.266-0.186,0.428-0.489,0.428-0.815V5.24c0-0.395-0.232-0.753-0.594-0.914 c-3.156-1.404-8.343-2.904-13.436-2.904c-5.094,0-10.281,1.5-13.436,2.904c-0.361,0.161-0.594,0.519-0.594,0.914v10.698 C20.772,16.264,20.935,16.567,21.2,16.754z M22.772,5.9c2.999-1.241,7.556-2.477,12.03-2.477c4.474,0,9.03,1.236,12.03,2.477v8.546 c-3.169-1.208-7.635-2.325-12.03-2.325c-4.396,0-8.86,1.117-12.03,2.325V5.9z M73.34,32.94h-25.23c-0.552,0-1,0.448-1,1v3.523 c0,0.552,0.448,1,1,1h2.335l9.721,6.916v9.426c-1.676,0.08-2.913,0.494-3.715,1.301c-1.194,1.201-1.185,2.886-1.177,4.372 l0.001,6.94c0,3.005,2.445,5.45,5.45,5.45s5.45-2.445,5.45-5.45l0.001-6.94c0.008-1.486,0.017-3.171-1.177-4.372 c-0.658-0.662-1.595-1.068-2.833-1.239v-9.516c4.234-3.308,7.866-6.118,8.861-6.888h2.313c0.552,0,1-0.448,1-1V33.94 C74.34,33.387,73.892,32.94,73.34,32.94z M64.176,60.468l-0.001,6.951c0,1.902-1.548,3.45-3.45,3.45 c-1.402,0-2.606-0.844-3.145-2.047h2.037c0.552,0,1-0.448,1-1s-0.448-1-1-1h-2.342l0-1.688h2.342c0.552,0,1-0.448,1-1s-0.448-1-1-1 h-2.343l0-1.821h2.343c0.552,0,1-0.448,1-1s-0.448-1-1-1h-2.325c0.041-0.741,0.171-1.386,0.577-1.795 c0.491-0.494,1.453-0.745,2.856-0.745s2.365,0.25,2.856,0.745C64.189,58.128,64.183,59.264,64.176,60.468z M72.34,36.463h-1.654 c-0.221,0-0.436,0.073-0.611,0.208c0,0-4.039,3.119-8.937,6.944l-9.794-6.968c-0.169-0.12-0.372-0.185-0.58-0.185h-1.654V34.94 h23.23V36.463z M45.023,42.462l-0.176,3.212c-0.018,0.332-0.2,0.633-0.485,0.804c-0.158,0.094-0.335,0.142-0.513,0.142 c-0.145,0-0.29-0.031-0.425-0.095l-4.245-1.992c-0.5-0.235-0.715-0.83-0.48-1.33c0.234-0.501,0.831-0.715,1.33-0.48l2.902,1.362 l0.255-4.656c0.03-0.552,0.502-0.974,1.053-0.944c0.551,0.03,0.974,0.502,0.944,1.053l-0.046,0.835 c5.806,1.963,10.629,6.745,12.592,12.492c0.179,0.522-0.101,1.091-0.623,1.27c-0.107,0.037-0.216,0.054-0.323,0.054 c-0.416,0-0.804-0.262-0.946-0.677C54.129,48.515,50.015,44.334,45.023,42.462z M35.802,47.247v24.44c0,0.552-0.448,1-1,1 s-1-0.448-1-1v-24.44c0-0.552,0.448-1,1-1S35.802,46.695,35.802,47.247z M48.725,30.049h24c0.552,0,1,0.448,1,1s-0.448,1-1,1h-24 c-0.552,0-1-0.448-1-1S48.172,30.049,48.725,30.049z"/>
          </g>
        </svg>
                <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Aucun service trouvé</h3>
                <p class="text-gray-600 dark:text-gray-300 mb-8">Aucun service ne correspond à vos critères de recherche. Essayez de modifier vos filtres.</p>
                <button id="reset-search-filters" class="bg-gradient-to-r from-ll-blue to-blue-600 text-white py-3 px-6 rounded-xl hover:from-blue-600 hover:to-ll-dark-blue transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 neon-glow">
                    Réinitialiser les filtres
                </button>
            </div>
        `;
        grid.parentNode.insertBefore(noServicesDiv, grid.nextSibling);
    }
    noServicesDiv.classList.remove('hidden');

    const resetBtn = document.getElementById('reset-search-filters');
    if (resetBtn && !resetBtn._listenerAdded) {
        if (typeof resetAllFilters === 'function') {
            resetBtn.addEventListener('click', resetAllFilters);
        } else {
            resetBtn.addEventListener('click', () => {
                console.log('Filtres réinitialisés.');
                updateServices();
            });
        }
        resetBtn._listenerAdded = true;
    }
}

/**
 * Cache le message "Aucun service trouvé" et réaffiche les détails
 */
export function hideNoServicesMessage() {
    const grid = document.getElementById('services-display-grid');
    const noServicesDiv = document.getElementById('no-services-display');
    if (!grid) {
        console.warn('Grid element not found, skipping hideNoServicesMessage.');
        return;
    }

    grid.classList.remove('hidden');
    if (noServicesDiv) {
        noServicesDiv.classList.add('hidden');
    }
}





function initEco(){

  const ecoContainer = document.getElementById('eco-list');
  if (!ecoContainer) {
    //console.warn('Conteneur "Engagement Écologique" non trouvé');
    return;
  }

 
  const commitments = ECO_DATA.ecoCommitments;

  // Populate the eco section
  ecoContainer.innerHTML = commitments.map((commitment, index) => `
    <div class="eco-card relative group p-6 rounded-2xl border border-ll-black/20 dark:border-white/50 bg-white dark:bg-ll-black shadow-lg hover:shadow-green-500/30 transform hover:scale-[1.03] transition-all duration-500 cursor-pointer overflow-hidden" data-aos="fade-up" data-aos-delay="${index * 100}" data-lottie-url="${commitment.lottieUrl}">
      <div class="relative w-40 h-20 mx-auto mb-4 flex items-center justify-center">
        <div class="icon-container absolute transition-opacity duration-500 group-hover:opacity-0">${commitment.icon}</div>
        <div class="lottie-container w-[100px] absolute opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
      </div>
      <h3 class="text-xl font-bold mb-2 text-center text-ll-black dark:text-ll-white group-hover:text-green-700 dark:group-hover:text-green-500 transition-colors duration-300">${commitment.title}</h3>
      <div class="content-container mt-4 overflow-hidden h-auto group-hover:h-auto transition-all duration-500 ease-in-out">
        <p class="text-center text-gray-700 dark:text-gray-300 transform  group-hover:translate-y-0 transition-transform duration-500 ease-out">${commitment.description}</p>
      </div>
      <div class="bubble-container absolute inset-0 pointer-events-none"></div>
    </div>
  `).join('');

  const cards = document.querySelectorAll('.eco-card');
  cards.forEach(card => {
    const icon = card.querySelector('.icon-container');
    const lottieContainer = card.querySelector('.lottie-container');
    const bubbleContainer = card.querySelector('.bubble-container');
    let lottieAnimation = null;
    let isHovering = false;

    // IntersectionObserver for Lottie animations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !lottieAnimation) {
          const lottieUrl = card.dataset.lottieUrl;
          if (lottieUrl) {
            lottieAnimation = lottie.loadAnimation({
              container: lottieContainer,
              renderer: 'svg',
              loop: true,
              autoplay: false,
              path: lottieUrl
            });
            observer.unobserve(card);
          }
        }
      });
    }, { threshold: 0.2 });
    observer.observe(card);

    // Bubble animation on hover
    const createBubble = () => {
      const bubble = document.createElement('div');
      bubble.className = 'bubble absolute bg-green-500/10 dark:bg-green-400/10 rounded-full';
      const size = Math.random() * 20 + 10;
      bubble.style.width = `${size}px`;
      bubble.style.height = `${size}px`;
      bubble.style.left = `${Math.random() * 100}%`;
      bubble.style.top = `${Math.random() * 100}%`;
      bubble.style.opacity = '0';
      bubbleContainer.appendChild(bubble);

      bubble.animate([
        { transform: 'translateY(0) scale(0)', opacity: 0.5 },
        { transform: `translateY(-${Math.random() * 100 + 50}px) scale(1)`, opacity: 0 }
      ], {
        duration: 1000 + Math.random() * 1000,
        easing: 'ease-out'
      }).onfinish = () => bubble.remove();
    };

    // Hover event listeners
    card.addEventListener('mouseenter', () => {
      isHovering = true;
      if (icon) icon.style.opacity = '0';
      if (lottieContainer) lottieContainer.style.opacity = '1';
      if (lottieAnimation) lottieAnimation.play();
      const bubbleInterval = setInterval(createBubble, 300);
      card.dataset.bubbleInterval = bubbleInterval;
    });

    card.addEventListener('mouseleave', () => {
      isHovering = false;
      setTimeout(() => {
        if (!isHovering) {
          if (icon) icon.style.opacity = '1';
          if (lottieContainer) lottieContainer.style.opacity = '0';
          if (lottieAnimation) lottieAnimation.stop();
          // Stop bubble animation
          clearInterval(card.dataset.bubbleInterval);
          bubbleContainer.innerHTML = '';
        }
      }, 300);
    });
  });

}

function initAbout() {
    
  
    let themeState = {
        themeToApply: detectTheme(),
        fontColor: getFontColor(detectTheme()),
        glowColor: getGlowColor(detectTheme())
    };

    function detectTheme() {
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        return savedTheme !== null ? savedTheme : (systemPrefersDark ? 'dark' : 'light');
    }

    function getFontColor(theme) {
        return theme === 'dark' ? '#FDFDFC' : '#1B1B18';
    }

    function getGlowColor(theme) {
        return theme === 'dark' ? 'rgba(99, 102, 241, 0.3)' : 'rgba(37, 99, 235, 0.3)';
    }

    function handleThemeChange() {
        const newTheme = detectTheme();
        if (newTheme !== themeState.themeToApply) {
            themeState.themeToApply = newTheme;
            themeState.fontColor = getFontColor(newTheme);
            themeState.glowColor = getGlowColor(newTheme);
        }
    }

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', handleThemeChange);
    window.addEventListener('storage', handleThemeChange);

    // Initialisation du DOM
    const statsContainer = document.getElementById('company-stats');
    if (!statsContainer) {

        return;
    }

    const uniqueStats = [];
    const seenLabels = new Set();
    MOCK_STATS.slice(0,4).forEach(stat => {
        if (!seenLabels.has(stat.label)) {
            uniqueStats.push(stat);
            seenLabels.add(stat.label);
        }
    });

    statsContainer.innerHTML = uniqueStats.map((stat, index) => `
        <div class="stat-item flex flex-col items-center">
            <div class="relative w-[140px] h-[140px] aspect-square  mb-2">
                <canvas id="stat-canvas-${index}"  class="w-full h-full absolute "></canvas>
                <div class="absolute inset-0 flex items-center justify-center z-10">
                    <div class="rounded-full p-4 shadow-md">
                      ${stat.svg}
                    </div>
                </div>
            </div>


            <div class="stat-number text-2xl font-cinzel font-bold text-ll-black dark:text-ll-white" id="stat-value-${index}">0</div>
            <div class="stat-label text-sm text-center text-ll-text-gray dark:text-ll-medium-gray">${stat.label}</div>
        </div>
    `).join('');

    const typingContainer = document.getElementById('typing-text');
    if (typingContainer) {
        const paragraphs = typingContainer.querySelectorAll('p');
        let currentPara = 0;
        let currentChar = 0;
        const textArray = Array.from(paragraphs).map(p => p.textContent);
        
        paragraphs.forEach(p => p.textContent = '');

        function type() {
            if (currentPara < textArray.length) {
                const currentText = textArray[currentPara];
                if (currentChar < currentText.length) {
                    paragraphs[currentPara].textContent += currentText[currentChar];
                    currentChar++;
                    type();
                } else {
                    currentChar = 0;
                    currentPara++;
                   type();
                }
            }
        }
        setTimeout(type, 30);
    }

    const lottieSlides = document.querySelectorAll('.lottie-slide');
    let currentSlide = 0;


lottieSlides.forEach((slide, index) => {
    const lottieUrl = slide.dataset.lottieUrl;
    const imgUrl = slide.dataset.imgUrl;
    
    if (imgUrl) {
        slide.innerHTML = `<img src="${imgUrl}" alt="" class="w-full h-full no-lightbox object-contain" />`;
    } else if (lottieUrl) {
        lottie.loadAnimation({
            container: slide,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            path: lottieUrl
        });
    }
});

   function showNextSlide() {
    lottieSlides.forEach((slide, index) => {
        const anim = slide.querySelector('svg')?.parentNode?.__animation;
        if (index === currentSlide) {
            slide.style.opacity = '1';
            if (anim) anim.play();
        } else {
            slide.style.opacity = '0';
            if (anim) anim.stop();
        }
    });
    currentSlide = (currentSlide + 1) % lottieSlides.length;
    setTimeout(showNextSlide, 5000);
}



    if (lottieSlides.length > 0) {
        showNextSlide();
    }

    // Canvas Stats Animation
    uniqueStats.forEach((stat, index) => {
        const statItem = statsContainer.children[index];
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                
                    animateCanvasCounter(index, stat.value, stat.unit);
                    animateStatValue(index, stat.value, stat.unit);
                    observer.unobserve(statItem);
                }
            });
        }, { threshold: 0.5 });
        observer.observe(statItem);
    });



  function animateCanvasCounter(index, target, unit) {
    const canvas = document.getElementById(`stat-canvas-${index}`);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    function resizeCanvas() {
        const rect = canvas.getBoundingClientRect();
        const size = rect.width; // largeur réelle du parent
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        ctx.scale(dpr, dpr);
        return size;
    }

    let size = resizeCanvas();
    const radius = size / 2.8; // rayon ajusté dynamiquement
    const centerX = size / 2;
    const centerY = size / 2;

    let current = 0;
    const increment = target / 100;
    let pulsePhase = 0;
    let isCountingComplete = false;

    let themeToApply = detectTheme();
    let fontColor = getFontColor(themeToApply);
    let glowColor = themeToApply === 'dark' ? 'rgba(99, 102, 241, 0.3)' : 'rgba(37, 99, 235, 0.3)';

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#2563EB');
    gradient.addColorStop(1, '#90EE90');

    function handleThemeChange() {
        const newTheme = detectTheme();
        if (newTheme !== themeToApply) {
            themeToApply = newTheme;
            fontColor = getFontColor(themeToApply);
            glowColor = themeToApply === 'dark' ? 'rgba(99, 102, 241, 0.3)' : 'rgba(37, 99, 235, 0.3)';
        }
    }

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', handleThemeChange);
    window.addEventListener('storage', handleThemeChange);

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Cercle de fond
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = themeToApply === 'dark' ? '#374151' : '#EDEDEC';
        ctx.lineWidth = 8;
        ctx.stroke();

        // Arc progression
        const progress = isCountingComplete ? 1 : current / target;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, -Math.PI / 2, (2 * Math.PI * progress) - Math.PI / 2);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 8;
        ctx.stroke();

        // Effet pulse
        const pulseScale = 1 + 0.05 * Math.sin(pulsePhase);
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.scale(pulseScale, pulseScale);
        ctx.translate(-centerX, -centerY);
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius - 4, 0, 2 * Math.PI);
        ctx.strokeStyle = glowColor;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();

        pulsePhase += 0.05;

        // Incrément valeur
        if (!isCountingComplete && current < target) {
            current += increment;
            if (current >= target) {
                current = target;
                isCountingComplete = true;
            }
        }

        requestAnimationFrame(draw);
    }

    draw();

    // Gérer redimensionnement (responsivité)
    const resizeObserver = new ResizeObserver(() => {
        ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform
        size = resizeCanvas();
    });
    resizeObserver.observe(canvas);
}



    function animateStatValue(index, target, unit) {
        const valueElement = document.getElementById(`stat-value-${index}`);
        if (!valueElement) return;

        let current = 0;
        const increment = target / 100;
        let animationFrameId;

        function updateValue() {
            current += increment;
            if (current >= target) {
                current = target;
                valueElement.textContent = Math.floor(current) + (unit || '');
                cancelAnimationFrame(animationFrameId);
                return;
            }
            valueElement.textContent = Math.floor(current) + (unit || '');
            animationFrameId = requestAnimationFrame(updateValue);
        }

        updateValue();
    }
}

/**
 * Initialisation globale
 */
document.addEventListener('DOMContentLoaded', async() => {

  initHeroCarousel();
  await loadMockData();

    initServiceInteractions();
    await updateServices();


  initAbout();
  initTestimonialsCarousel();
  initFAQSection();
  initTeamSection();
  initPartnersSection();
  initBlogSection();
  initEventsSection();
  initGallerySection();
  initStatsSection();
  initPricingSection();
  initContactsSection();
 // initBeforeAfterSliders();
 // initParticles();
 // initScrollAnimations();
  initVideoModal();
  initWhyUsSection();
  initEco();
  renderBeforeAfter();

  



   
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in-up', 'neon-glow');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observer les éléments de services
    document.querySelectorAll('.service-card, .glass-effect').forEach(el => {
        observer.observe(el);
    });

    // Animation pour étoiles sur hover
    document.addEventListener('mouseover', (e) => {
        if (e.target.classList.contains('star-filled') || e.target.classList.contains('star-empty')) {
            e.target.style.transform = 'scale(1.2) rotate(5deg)';
            e.target.style.filter = 'drop-shadow(0 0 10px #fbbf24)';
        }
    });

    document.addEventListener('mouseout', (e) => {
        if (e.target.classList.contains('star-filled') || e.target.classList.contains('star-empty')) {
            e.target.style.transform = 'scale(1)';
            e.target.style.filter = 'none';
        }
    });

    

// Sélectionne les images pour lightbox, en excluant celles de sections spécifiques (ex. : footer, header, ou avec classe .no-lightbox)
const images = Array.from(
  document.querySelectorAll(
    'img.lightbox-img, #services img, .gallery img, img' 
    + ':not(.no-lightbox):not(#partners img):not(.footer img):not(#footer img)'
  )
);

if (images.length === 0) return;

const srcList = images.map(el => el.getAttribute('data-src') || el.src);
const altList = images.map(el => el.getAttribute('alt') || '');

if (srcList.length === 0) return;

images.forEach((img, index) => {
  img.style.cursor = 'zoom-in';
  img.addEventListener('click', () => {
    openLightbox(srcList, index, altList);
  });
});


const heroSection = document.getElementById("hero");
const services = document.getElementById("services");
const header = document.getElementById("blurred-header");
const name = document.getElementById("name-entreprise");
const entreprise = document.getElementById("entreprise");
const main = document.getElementById("top");


if (heroSection && header && services) {
  let lastScrollY = window.scrollY; 
  let isHeaderHidden = false;

  const applyHeroStyles = () => {
    entreprise.classList.add("gradiant");
    entreprise.classList.remove("header-btn");
    name.classList.remove("back-text");
    header.classList.add("bg-ll-white/50", "dark:bg-ll-black/50");
    header.classList.remove("bg-transparent", "dark:bg-transparent");
 header.classList.add("header-light-style");
  
    
  };

  const resetHeroStyles = () => {
    entreprise.classList.remove("gradiant");
    entreprise.classList.add("header-btn");
    name.classList.add("back-text");
    header.classList.add("bg-transparent", "dark:bg-transparent");
    header.classList.remove("bg-ll-white/50", "dark:bg-ll-black/50");
     header.classList.remove("header-light-style");

    
  };

  const onScroll = () => {
    const heroBottom = heroSection.getBoundingClientRect().bottom;
    const servicesRect = services.getBoundingClientRect();
    const servicesTop = servicesRect.top;
    const headerHeight = header.offsetHeight;

    const isPastHero = heroBottom <= headerHeight;
    const isOnServices = servicesTop <= headerHeight && servicesTop >= -services.offsetHeight;


    
    // --- Détection direction du scroll ---
    const currentScrollY = window.scrollY;
    if (currentScrollY > lastScrollY && currentScrollY > headerHeight) {
      // scroll vers le bas
      if (!isHeaderHidden) {
        header.classList.add("translate-y-[-100%]", "transition-transform", "duration-500");
        isHeaderHidden = true;
      }
    } else {
      // scroll vers le haut
      if (isHeaderHidden) {
        header.classList.remove("translate-y-[-100%]");
        isHeaderHidden = false;
      }
    }
    lastScrollY = currentScrollY;

    // --- Effets Hero & Services ---
    if (isPastHero || isOnServices) {
      applyHeroStyles();
    } else {
      resetHeroStyles();
    }
  };

  // ✅ Survol de la section services
  services.addEventListener("mouseenter", applyHeroStyles);
  services.addEventListener("mouseleave", onScroll);

  // ✅ Scroll et resize
  onScroll();
  window.addEventListener("scroll", onScroll);
  window.addEventListener("resize", onScroll);
}



const backToTopBtn = document.getElementById('back-to-top');

if (backToTopBtn && main) {
  // Fonction pour scroller en haut
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  const handleScroll = () => {
    const heroHeight = main.offsetHeight;
    if (window.scrollY > heroHeight) {
      backToTopBtn.classList.remove('hidden');
    } else {
      backToTopBtn.classList.add('hidden');
    }
  };

  // Événements
  window.addEventListener('scroll', handleScroll);
  handleScroll(); // Appel initial
}




});

window.addEventListener("DOMContentLoaded", () => {
    const lottie = document.querySelector("lottie-player");
    if (!lottie) return;

    

    // Créer wrapper autour du lottie
    const wrapper = document.createElement("div");
    wrapper.className = "lottie-wrapper";

    // Insérer wrapper avant Lottie
    lottie.parentNode.insertBefore(wrapper, lottie);
    wrapper.appendChild(lottie);

    // Créer le placeholder
    const placeholder = document.createElement("div");
    placeholder.className = "lottie-placeholder";
    wrapper.appendChild(placeholder);

    // Fonction pour cacher le placeholder
    const hidePlaceholder = () => {
        placeholder.style.opacity = "0";
        placeholder.style.transition = "opacity 0.1s";
        setTimeout(() => placeholder.remove(), 400);
    };

    // ⚡ Événements fiables pour Lottie
    lottie.addEventListener("ready", hidePlaceholder);
    lottie.addEventListener("play", hidePlaceholder);

    // ⚡ Si Lottie est déjà prêt → retirer immédiatement
    setTimeout(() => {
        if (lottie.isReady) hidePlaceholder();
    }, 500);
});
