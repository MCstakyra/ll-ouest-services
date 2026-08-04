# ll-Ouest-Services

Prestation de services de nettoyage professionnel

## Structure du projet

```text
project-root/
│
├── backend/
│   ├── config/
│   │   ├── firebase.js              # Configuration Firebase (Auth, Firestore, Storage, Messaging)
│   │   └── config.js                # Configuration générale (ports, URLs, etc.)
│   │
│   ├── controllers/
│   │   ├── authController.js        # Authentification (login, register, logout)
│   │   ├── contactController.js     # Gestion des formulaires de contact
│   │   ├── serviceController.js     # CRUD des services
│   │   ├── reviewController.js      # Gestion des avis clients
│   │   ├── chatController.js        # Chat temps réel (WebSockets)
│   │   ├── notificationController.js# Notifications push/email
│   │   └── adminController.js       # Dashboard administrateur
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js        # Vérification JWT (Firebase Auth)
│   │   ├── errorMiddleware.js       # Gestion globale des erreurs
│   │   ├── rateLimitMiddleware.js   # Protection contre les attaques (Rate Limiting)
│   │   └── corsMiddleware.js        # Configuration CORS
│   │
│   ├── models/
│   │   ├── userModel.js             # Utilisateurs
│   │   ├── serviceModel.js          # Services
│   │   ├── reviewModel.js           # Avis clients
│   │   ├── contactModel.js          # Demandes de contact
│   │   └── chatMessageModel.js      # Messages du chat
│   │
│   ├── repositories/
│   │   ├── userRepo.js              # Accès aux utilisateurs (Firestore)
│   │   ├── serviceRepo.js           # Accès aux services
│   │   ├── reviewRepo.js            # Accès aux avis
│   │   ├── contactRepo.js           # Accès aux contacts
│   │   └── chatRepo.js              # Accès aux messages du chat
│   │
│   ├── routes/
│   │   ├── authRoutes.js            # Routes d'authentification
│   │   ├── contactRoutes.js         # Routes des formulaires de contact
│   │   ├── serviceRoutes.js         # Routes des services
│   │   ├── reviewRoutes.js          # Routes des avis
│   │   ├── chatRoutes.js            # Routes du chat
│   │   ├── notificationRoutes.js    # Routes des notifications
│   │   └── adminRoutes.js           # Routes du tableau de bord
│   │
│   ├── services/
│   │   ├── emailService.js          # Envoi d'emails
│   │   ├── notificationService.js   # Notifications Firebase
│   │   ├── storageService.js        # Gestion des fichiers
│   │   └── loggerService.js         # Journalisation
│   │
│   ├── utils/
│   │   ├── errorUtils.js            # Gestion des erreurs
│   │   ├── validationUtils.js       # Validation des données
│   │   └── helperUtils.js           # Fonctions utilitaires
│   │
│   ├── app.js                       # Point d'entrée Express + Socket.io
│   ├── .env                         # Variables d'environnement
│   └── package.json                 # Dépendances backend
│
├── frontend/
│   ├── public/
│   │   ├── index.html               # Accueil
│   │   ├── about.html               # À propos
│   │   ├── services.html            # Services
│   │   ├── realizations.html        # Réalisations
│   │   ├── reviews.html             # Avis clients
│   │   ├── contact.html             # Contact
│   │   ├── mentions.html            # Mentions légales
│   │   └── admin.html               # Dashboard administrateur
│   │
│   ├── css/
│   │   └── tailwind.css             # Styles Tailwind CSS
│   │
│   ├── js/
│   │   ├── main.js                  # Script principal
│   │   ├── auth.js                  # Authentification
│   │   ├── contact.js               # Formulaire de contact
│   │   ├── chat.js                  # Chat temps réel
│   │   ├── map.js                   # Carte Leaflet
│   │   ├── admin.js                 # Dashboard administrateur
│   │   ├── notifications.js         # Notifications Firebase
│   │   └── utils.js                 # Fonctions utilitaires
│   │
│   ├── assets/
│   │   ├── images/
│   │   │   └── logo.png             # Logo de l'entreprise
│   │   ├── videos/                  # Vidéos
│   │   └── icons/                   # Icônes
│   │
│   └── tailwind.config.js           # Configuration Tailwind
│
├── .gitignore                       # Fichiers ignorés par Git
├── README.md                        # Documentation du projet
└── deploy.sh                        # Script de déploiement
```
