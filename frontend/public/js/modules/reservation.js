/**
 * @file reservation.js
 * @description Module de gestion du formulaire de réservation pour L&L Ouest Services.
 * Gère la validation en temps réel, la soumission, et la persistance des données.
 * Simplifié pour ne conserver que les informations essentielles à la réservation.
 * @module reservation
 * @version 2.0.0
 * @fixes Suppression des options supplémentaires, emoji-picker, et validation complexe. Focus sur les champs essentiels.
 */

import api from '../api.js';
import { loadUserData } from '../loadData.js';
import { showNotification, validateField, showLoadingDialog, formatDate, handleApiError, validateFieldInitial } from './utils.js';

const reservation = {
  /**
   * Initialise le module de réservation.
   * @function init
   */
  init() {
    const form = document.getElementById('reservation-form');
    if (!form) {
      console.warn('Formulaire de réservation non trouvé.');
      return;
    }
    this.bindReservationForm();
    this.loadFormData();
  },

  /**
   * Ouvre la modale de réservation avec préremplissage service/user.
   * @function openReservationModal
   * @param {Object} service - Données du service.
   * @param {Object} user - Données utilisateur (optionnel).
   */
  openReservationModal(service, user = null) {
    this.init();
    const modal = document.getElementById('reservation-modal');
    if (!modal) {
      console.warn('Modale de réservation non trouvée.');
      return;
    }

    // Préremplir champs cachés
    document.getElementById('reservation-service-id').value = service.id || 'default';
    document.getElementById('reservation-service-name').value = service.name || '';
    document.getElementById('reservation-service-category').value = service.category || '';

    // Préremplir user si connecté
    if (user) {
      document.getElementById('reservation-name').value = user.name || '';
      document.getElementById('reservation-email').value = user.email || '';
      document.getElementById('reservation-phone').value = user.phone?.replace('+33 ', '') || '';
    }

    // Mise à jour titre modale
    document.getElementById('reservation-modal-title').textContent = `Réserver "${service.name}"`;
    document.getElementById('reservation-modal-subtitle').textContent = `Remplissez le formulaire pour réserver votre service de ${service.category.charAt(0).toUpperCase() + service.category.slice(1)}`;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // Validation initiale
    this.initialValidation(document.getElementById('reservation-form'));
  },

  /**
   * Vérifie si un email est valide en format.
   * @function isValidEmailFormat
   * @param {string} email - L'adresse email à valider.
   * @returns {boolean} True si le format est valide.
   */
  isValidEmailFormat(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Sauvegarde les données du formulaire dans localStorage.
   * @function saveFormData
   */
    saveFormData() {
        const form = document.getElementById('reservation-form');
        if (!form) return;

        const formData = new FormData(form);
        const reservationData = {
            name: formData.get('name')?.trim() || '',
            email: formData.get('email')?.trim() || '',
            phone: formData.get('phone')?.trim() || '',
            date: formData.get('date') || '',
            hour: formData.get('hour') || '', 
            address: formData.get('address')?.trim() || '',
            message: formData.get('message')?.trim() || '',
            serviceId: formData.get('serviceId') || '',
            serviceName: formData.get('serviceName') || '',
            serviceCategory: formData.get('serviceCategory') || '',
        };
        localStorage.setItem('reservationFormData', JSON.stringify(reservationData));
    },


  /**
   * Charge les données du formulaire depuis localStorage.
   * @function loadFormData
   */
  loadFormData() {
    const form = document.getElementById('reservation-form');
    if (!form) return;

    const savedData = localStorage.getItem('reservationFormData');
    if (savedData) {
        const reservationData = JSON.parse(savedData);
        form.querySelector('[name="name"]').value = reservationData.name || '';
        form.querySelector('[name="email"]').value = reservationData.email || '';
        form.querySelector('[name="phone"]').value = reservationData.phone ? reservationData.phone.replace('+33 ', '') : '';
        form.querySelector('[name="date"]').value = reservationData.date || '';
        form.querySelector('[name="hour"]').value = reservationData.hour || '';
        form.querySelector('[name="address"]').value = reservationData.address || '';
        form.querySelector('[name="message"]').value = reservationData.message || '';
        form.querySelector('[name="serviceId"]').value = reservationData.serviceId || '';
        form.querySelector('[name="serviceName"]').value = reservationData.serviceName || '';
        form.querySelector('[name="serviceCategory"]').value = reservationData.serviceCategory || '';
    }
},

  /**
   * Affiche un message d'erreur ou de validation pour un champ.
   * @function showFieldError
   * @param {string} field - Nom du champ.
   * @param {string|null} message - Message d'erreur ou de validation.
   */
  showFieldError(field, message) {
    const input = document.querySelector(`[name="${field}"]`);
    if (!input) {
      console.warn(`Champ ${field} non trouvé`);
      return;
    }

    const errorElement = input.parentElement?.querySelector('.reservation-error') || input.parentElement?.parentElement?.querySelector('.reservation-error');
    if (!errorElement) {
      console.warn(`Élément d'erreur pour le champ ${field} non trouvé`);
      return;
    }

    input.classList.remove(
      'border-red-500', 'focus:border-red-500', 'focus:ring-red-500/50',
      'border-green-500', 'focus:border-green-500', 'focus:ring-green-500/50',
      'border-gray-300', 'dark:border-gray-600'
    );

    if (message) {
      if (message.includes('fa-check-circle')) {
        errorElement.innerHTML = `<span class="text-green-500">${message}</span>`;
        errorElement.classList.remove('text-red-500', 'hidden');
        errorElement.classList.add('text-green-500', 'block');
        input.classList.add('border-green-500', 'focus:border-green-500', 'focus:ring-green-500/50');
      } else {
        errorElement.innerHTML = `<span class="text-red-500"><i class="fas fa-times-circle mr-1"></i>${message}</span>`;
        errorElement.classList.remove('text-green-500', 'hidden');
        errorElement.classList.add('text-red-500', 'block');
        input.classList.add('border-red-500', 'focus:border-red-500', 'focus:ring-red-500/50');
      }
    } else {
      errorElement.innerHTML = '';
      errorElement.classList.add('hidden');
      errorElement.classList.remove('text-red-500', 'text-green-500');
      input.classList.add('border-gray-300', 'dark:border-gray-600', 'focus:border-blue-500', 'focus:ring-blue-500/50');
    }
  },

  /**
   * Met à jour l'état du bouton de soumission.
   * @function updateSubmitButtonState
   * @param {HTMLElement} form - Le formulaire.
   * @param {HTMLElement} submitButton - Le bouton de soumission.
   * @param {boolean} isInitialLoad - Indique si c'est un chargement initial.
   */
  updateSubmitButtonState(form, submitButton, isInitialLoad = false) {
    const formData = new FormData(form);
    const reservationData = {
        name: formData.get('name')?.trim() || '',
        email: formData.get('email')?.trim() || '',
        phone: formData.get('phone')?.trim() ? `+33 ${formData.get('phone').trim().replace(/\s+/g, ' ')}` : '',
        date: formData.get('date') || '',
        hour: formData.get('hour') || '',
        address: formData.get('address')?.trim() || '',
        message: formData.get('message')?.trim() || '',
        serviceId: formData.get('serviceId') || '',
        serviceName: formData.get('serviceName') || '',
        serviceCategory: formData.get('serviceCategory') || '',
    };

    const errors = this.validateForm(reservationData, isInitialLoad);
    const isValid = Object.keys(errors).length === 0;


    submitButton.disabled = !isValid;
    submitButton.classList.toggle('opacity-50', !isValid);
    submitButton.classList.toggle('cursor-not-allowed', !isValid);

    if (!submitButton.innerHTML.includes('Envoi...')) {
        submitButton.innerHTML = `
            <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Confirmer la Réservation
        `;
    }
},

  /**
   * Effectue la validation initiale du formulaire.
   * @function initialValidation
   * @param {HTMLElement} form - Le formulaire.
   */
  initialValidation(form) {
    const formData = new FormData(form);
    const reservationData = {
        name: formData.get('name')?.trim() || '',
        email: formData.get('email')?.trim() || '',
        phone: formData.get('phone')?.trim() ? `+33 ${formData.get('phone').trim()}` : '',
        date: formData.get('date') || '',
        hour: formData.get('hour') || '',
        address: formData.get('address')?.trim() || '',
        message: formData.get('message')?.trim() || '',
        serviceId: formData.get('serviceId') || '',
        serviceName: formData.get('serviceName') || '',
        serviceCategory: formData.get('serviceCategory') || '',
    };

    form.querySelectorAll('input:not([type="hidden"]), textarea, select').forEach(input => {
        const field = input.name;
        let value = input.value.trim();
        if (field === 'phone' && value) value = `+33 ${value}`;
        
        const error = validateFieldInitial(field, value, false ,true);
       
      this.showFieldError(
          field,
          error || (value ? `${this.getFieldName(field)} valide <i class="fas fa-check-circle ml-1 text-green-500"></i>` : '')
      );


    });

    this.updateSubmitButtonState(form, document.getElementById('reservation-submit'), true);
},

  /**
   * Retourne le nom du champ en français.
   * @function getFieldName
   * @param {string} field - Nom du champ en anglais.
   * @returns {string} Nom du champ en français.
   */
  getFieldName(field) {
    const fieldNames = {
      name: 'Nom',
      email: 'Email',
      phone: 'Téléphone',
      date: 'Date',
      hour: 'Heure',
      frequency: 'Fréquence',
      address: 'Adresse',
      message: 'Instructions',
      serviceId: 'Service ID',
      serviceName: 'Nom du Service',
      serviceCategory: 'Catégorie du Service',
    };
    return fieldNames[field.toLowerCase()] || field;
  },

  /**
   * Lie le formulaire de réservation.
   * @function bindReservationForm
   */
  bindReservationForm() {
    const form = document.getElementById('reservation-form');
    if (!form) {
      console.warn('Formulaire de réservation introuvable');
      return;
    }

    const submitButton = form.querySelector('#reservation-submit');
    if (!submitButton) {
      console.warn('Bouton de soumission introuvable');
      return;
    }

    let isSubmitting = false;

    submitButton.disabled = true;
    submitButton.classList.add('opacity-50', 'cursor-not-allowed');

    form.querySelectorAll('input:not([type="hidden"]), textarea, select').forEach(input => {
     input.addEventListener('input', () => {
    const field = input.name;
    let value = input.value.trim();
    if (field === 'phone' && value) value = `+33 ${value.replace(/\s+/g, ' ').trim()}`;
   
    let error = null;
    if (field === 'message' && value) {
        if (value.length > 1000) error = 'Les instructions ne peuvent pas dépasser 1000 caractères.';
    } else if (field === 'date') {
        if (!value) error = 'La date est requise.';
       
    } else if (field === 'hour') {

    if (!value) {
        error = 'L\'horaire est requis.';
    } else {
        const dateValue = form.querySelector('[name="date"]').value;
        const hourError = this.validateHourForToday(dateValue, value);
        if (hourError) error = hourError;
    }


    } else if (field === 'address') {
        if (!value) error = 'L\'adresse est requise.';
    } else {
        error = validateField(field, value, false, true, true);
    }

      this.showFieldError(
          field,
          error || (value ? `${this.getFieldName(field)} valide <i class="fas fa-check-circle ml-1 text-green-500"></i>` : '')
      );
  

    this.updateSubmitButtonState(form, submitButton);
    this.saveFormData();
});
    });

    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (submitButton.disabled || isSubmitting) {
        console.log('Soumission bloquée : bouton désactivé ou soumission en cours');
        return;
      }

      isSubmitting = true;
      submitButton.disabled = true;
      submitButton.classList.add('opacity-50', 'cursor-not-allowed');
      submitButton.innerHTML = `
        <svg class="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Envoi...
      `;

      try {
        const formData = new FormData(form);
        let phoneValue = formData.get('phone')?.trim() || '';
        if (phoneValue) phoneValue = `+33 ${phoneValue.replace(/\s+/g, ' ').trim()}`;


        const reservationData = {
          id: crypto.randomUUID(),
          serviceId: formData.get('serviceId') || '',
          serviceName: formData.get('serviceName') || '',
          serviceCategory: formData.get('serviceCategory') || '',
          name: formData.get('name')?.trim() || '',
          email: formData.get('email')?.trim() || '',
          phone: phoneValue,
          date: formData.get('date') || '',
          hour: formData.get('hour') || '',
          address: formData.get('address')?.trim() || '',
          message: formData.get('message')?.trim() || '',
          createdAt: new Date().toISOString(),
      };

        const errors = this.validateForm(reservationData);
        if (Object.keys(errors).length > 0) {
          Object.entries(errors).forEach(([field, message]) => this.showFieldError(field, message));
          showNotification('Veuillez corriger les erreurs dans le formulaire.', 'error');
          isSubmitting = false;
          this.updateSubmitButtonState(form, submitButton);
          return;
        }

       // this.closeReservationModal();
        const confirmed = await this.showPreConfirmationModal(reservationData);
        if (!confirmed) {
          this.openReservationModal(localStorage.getItem('serviceSelected'),await loadUserData());
          isSubmitting = false;
          submitButton.innerHTML = `
            <i class="fas fa-paper-plane mr-2" aria-hidden="true"></i>
            <span>Réserver</span>
          `;
          this.updateSubmitButtonState(form, submitButton);
          return;
        }

        await showLoadingDialog('Envoi de votre réservation...', 'Cleaning');
        await api.contact.createReservation(reservationData);

        form.reset();
        this.clearFieldErrors();
        localStorage.removeItem('reservationFormData');

        submitButton.innerHTML = `
          <i class="fas fa-paper-plane mr-2" aria-hidden="true"></i>
          <span>Réserver</span>
        `;

        await this.showConfirmationModal(reservationData);
        this.closeReservationModal();
      } catch (error) {
        let errorMessage = error.message || 'Erreur lors de l’envoi de la réservation.';
        if (error.status === 429) {
          errorMessage = 'Trop de tentatives. Veuillez réessayer plus tard.';
        }
        showNotification(errorMessage, 'error');
      } finally {
        isSubmitting = false;
        this.updateSubmitButtonState(form, submitButton);
      }
    });
  },

  /**
   * Valide les données du formulaire.
   * @function validateForm
   * @param {Object} data - Données du formulaire.
   * @param {boolean} isInitialLoad - Indique si c'est un chargement initial.
   * @returns {Object} Erreurs de validation.
   */
  validateForm(data, isInitialLoad = false) {
    const errors = {};

    const nameError = validateField('name', data.name, false, true, true);
    if (nameError) errors.name = nameError;

    const emailError = validateField('email', data.email, false, true, true);
    if (emailError) errors.email = emailError;

    const phoneError = validateField('phone', data.phone, false, true, true);
    if (phoneError && data.phone) errors.phone = phoneError;

    if (!data.date) errors.date = 'La date est requise.';

if (!data.hour) {
    errors.hour = 'L\'horaire est requis.';
} else if (data.date) {
    const hourError = this.validateHourForToday(data.date, data.hour);
    if (hourError) errors.hour = hourError;
}

    if (!data.address || data.address.trim() === '') {
        errors.address = 'L\'adresse est requise.';
    } 
    if (data.message && data.message.length > 1000) {
        errors.message = 'Les instructions ne peuvent pas dépasser 1000 caractères.';
    }

    if (!data.serviceId) errors.serviceId = 'ID du service requis.';
    if (!data.serviceName || data.serviceName.trim() === '') errors.serviceName = 'Nom du service requis.';
    if (!data.serviceCategory || data.serviceCategory.trim() === '') errors.serviceCategory = 'Catégorie du service requise.';

    return errors;
},


/**
 * Valide si l'horaire sélectionné est disponible pour aujourd'hui.
 * @function validateHourForToday
 * @param {string} date - Date sélectionnée (format YYYY-MM-DD)
 * @param {string} hour - Horaire sélectionné
 * @returns {string|null} Message d'erreur ou null si valide
 */
validateHourForToday(date, hour) {
    const selectedDate = new Date(date);
    const today = new Date();
    
    if (selectedDate.toDateString() === today.toDateString()) {
        const currentHour = today.getHours();
        const currentMinutes = today.getMinutes();
        
        if (hour === 'flexible') return null;
        
        const startHourStr = hour.split('-')[0];
        const [startHour, startMinutes] = startHourStr.split(':').map(Number);
        
        const currentTotalMinutes = currentHour * 60 + currentMinutes;
        const startTotalMinutes = startHour * 60 + startMinutes;
        
        if (startTotalMinutes <= currentTotalMinutes) {
            return 'Ce créneau horaire est déjà passé pour aujourd\'hui. Veuillez choisir un horaire ultérieur ou l\'option "Heure flexible".';
        }
        
     //   const timeDifference = startTotalMinutes - currentTotalMinutes;
       // if (timeDifference < 120) { 
         //   return 'Pour une réservation aujourd\'hui, merci de choisir un créneau avec au moins 2 heures d\'avance.';
     //   }
    }
    
    return null;
},

  /**
   * Efface les erreurs des champs.
   * @function clearFieldErrors
   */
  clearFieldErrors() {
    const form = document.getElementById('reservation-form');
    if (!form) return;

    const errorElements = form.querySelectorAll('.reservation-error');
    errorElements.forEach(el => {
      el.textContent = '';
      el.classList.add('hidden');
      el.classList.remove('text-red-500', 'text-green-500');
    });

    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach((input) => {
      input.classList.remove(
        'border-red-500', 'focus:border-red-500', 'focus:ring-red-500/50',
        'border-green-500', 'focus:border-green-500', 'focus:ring-green-500/50'
      );
      input.classList.add('border-gray-300', 'dark:border-gray-600', 'focus:border-blue-500', 'focus:ring-blue-500/50');
    });
  },

  /**
   * Affiche la modale de pré-confirmation.
   * @function showPreConfirmationModal
   * @param {Object} reservationData - Données de la réservation.
   * @returns {Promise<boolean>} Confirmation de l'utilisateur.
   */
  async showPreConfirmationModal(reservationData) {
    const isDark = document.documentElement.classList.contains('dark');
    


  const bgMain = isDark ? '#1F2937' : '#FFFFFF'; 
  const bgContent = isDark ? 'bg-gray-800' : 'bg-gray-50';
  const textTitle = isDark ? 'text-blue-300' : 'text-ll-blue';
  const textLabel = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderSubtle = isDark ? 'border-gray-700/50' : 'border-gray-300/50';

    const confirmationSvg = `
      <svg class="w-10 h-10 text-ll-blue dark:text-ll-light-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
      </svg>
    `;

    try {
        const { isConfirmed } = await Swal.fire({
            title: `<span class="text-xl sm:text-2xl font-extrabold ${textTitle}">Confirmation de votre réservation</span>`,
            html: `
                <div class="${bgContent} p-4 sm:p-8 rounded-3xl shadow-2xl w-full max-w-full mx-auto font-sans text-left overflow-y-auto max-h-[75vh]">
                    <div class="flex items-start mb-6 pb-4 border-b ${borderSubtle}">
                        <div class="p-2 ${bgMain} rounded-xl shadow-inner mr-4">
                            <img src="/assets/images/logo.png" alt="L&L Ouest Services Logo" class="h-10 w-10 object-contain rounded-lg">
                        </div>
                        <div>
                            <h2 class="text-xl font-bold ${textTitle}">Récapitulatif de la réservation</h2>
                            <p class="text-sm ${textLabel} mt-1">Planifiée pour: ${reservationData.date}</p>
                        </div>
                    </div>
                    
                    <div class="flex justify-center mb-6">
                        ${confirmationSvg}
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div class="${bgMain} p-5 rounded-2xl shadow-lg border ${borderSubtle} transition-all duration-300 hover:shadow-xl">
                            <h3 class="text-lg font-semibold mb-4 ${textTitle} flex items-center">
                                <i class="fas fa-user-circle mr-2"></i> Vos Coordonnées
                            </h3>
                            <div class="grid grid-cols-1 gap-3">
                                ${['name', 'email', 'phone', 'address'].map(key => `
                                    <div>
                                        <label class="block text-xs font-bold ${textLabel} uppercase">${key === 'name' ? 'Nom' : key === 'email' ? 'Email' : key === 'phone' ? 'Téléphone' : 'Adresse'}</label>
                                        <p class="mt-0.5 text-base font-medium text-gray-800 dark:text-gray-200 break-words">${reservationData[key] || 'Non renseigné'}</p>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <div class="${bgMain} p-5 rounded-2xl shadow-lg border ${borderSubtle} transition-all duration-300 hover:shadow-xl">
                            <h3 class="text-lg font-semibold mb-4 ${textTitle} flex items-center">
                                <i class="fas fa-calendar-check mr-2"></i> Détails de la Réservation
                            </h3>
                            <div class="grid grid-cols-1 gap-3">
                                <div>
                                    <label class="block text-xs font-bold ${textLabel} uppercase">Service</label>
                                    <p class="mt-0.5 text-base font-medium text-gray-800 dark:text-gray-200">${reservationData.serviceName} (${reservationData.serviceCategory})</p>
                                </div>
                                <div>
                                    <label class="block text-xs font-bold ${textLabel} uppercase">Date</label>
                                    <p class="mt-0.5 text-base font-medium text-gray-800 dark:text-gray-200">${reservationData.date}</p>
                                </div>
                                <div>
                                    <label class="block text-xs font-bold ${textLabel} uppercase">Horaire</label>
                                    <p class="mt-0.5 text-base font-medium text-gray-800 dark:text-gray-200">${reservationData.hour || 'À définir'}</p>
                                </div>
                                <div>
                                    <label class="block text-xs font-bold ${textLabel} uppercase">Instructions</label>
                                    <div class="mt-0.5 p-3 rounded-xl ${bgContent} border ${borderSubtle} max-h-32 overflow-y-auto shadow-inner">
                                        <p class="text-sm whitespace-pre-wrap text-gray-800 dark:text-gray-200">${reservationData.message || 'Aucune'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="text-center mt-4">
                        <p class="text-sm italic ${textLabel}">
                            Veuillez vérifier l'exactitude de ces informations. Vous recevrez une confirmation par email.
                        </p>
                    </div>
                </div>
            `,
            icon: undefined,
            showCancelButton: true,
            confirmButtonText: '<i class="fas fa-paper-plane mr-2"></i> Confirmer et réserver',
            cancelButtonText: '<i class="fas fa-edit mr-2"></i> Modifier',
            confirmButtonColor: '#1e90ff',
            cancelButtonColor: '#6b7280',
            width: '100%',
            customClass: {
                popup: 'swal-wide rounded-3xl shadow-xl w-full max-w-lg md:max-w-3xl',
                confirmButton: 'px-8 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-[1.02] shadow-lg',
                cancelButton: 'px-8 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-[1.02] shadow-lg',
                title: 'pt-4',
            },
            background: bgMain,
            color: isDark ? '#FDFDFC' : '#1B1B18',
            showClass: { popup: 'animate__animated animate__zoomIn' },
            hideClass: { popup: 'animate__animated animate__zoomOut' },
            // Ajouter ce callback
            willClose: () => {
                // Cette fonction sera appelée quand la modale se ferme
                const form = document.getElementById('reservation-form');
                const submitButton = document.getElementById('reservation-submit');
                if (form && submitButton) {
                    // Remettre le bouton dans son état initial
                    this.updateSubmitButtonState(form, submitButton, false);
                }
            }
        });

        return isConfirmed;
    } catch (error) {
        console.error('Erreur dans showPreConfirmationModal:', error);
        // En cas d'erreur, réinitialiser aussi le bouton
        const form = document.getElementById('reservation-form');
        const submitButton = document.getElementById('reservation-submit');
        if (form && submitButton) {
            this.updateSubmitButtonState(form, submitButton, false);
        }
        return false;
    }
},

  /**
   * Affiche la modale de confirmation après envoi.
   * @function showConfirmationModal
   * @param {Object} reservationData - Données de la réservation.
   * @returns {Promise<void>}
   */
  async showConfirmationModal(reservationData) {
    const isDark = document.documentElement.classList.contains('dark');


  const bgMain = isDark ? '#1F2937' : '#FFFFFF'; 
  const bgContent = isDark ? 'bg-gray-800' : 'bg-gray-50';
  const textTitle = isDark ? 'text-blue-300' : 'text-ll-blue';
  const textLabel = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderSubtle = isDark ? 'border-gray-700/50' : 'border-gray-300/50';
  
    const successSvg = `
      <svg class="w-10 h-10 text-ll-dark-green dark:text-ll-light-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
      </svg>
    `;

    await Swal.fire({
      title: `<span class="text-xl sm:text-2xl font-extrabold ${textTitle}">Réservation confirmée !</span>`,
      html: `
        <div class="${bgContent} p-4 sm:p-8 rounded-3xl shadow-2xl w-full max-w-full mx-auto font-sans text-left overflow-y-auto max-h-[75vh]">
          <div class="flex items-start mb-6 pb-4 border-b ${borderSubtle}">
            <div class="p-2 ${bgMain} rounded-xl shadow-inner mr-4">
              <img src="/assets/images/logo.png" alt="L&L Ouest Services Logo" class="h-10 w-10 object-contain rounded-lg">
            </div>
            <div>
              <h2 class="text-xl font-bold ${textTitle}">Confirmation de réservation</h2>
              <p class="text-sm ${textLabel} mt-1">Planifiée pour: ${reservationData.date}</p>
            </div>
          </div>
          
          <div class="flex justify-center mb-6">
            ${successSvg}
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div class="${bgMain} p-5 rounded-2xl shadow-lg border ${borderSubtle} transition-all duration-300 hover:shadow-xl">
              <h3 class="text-lg font-semibold mb-4 ${textTitle} flex items-center">
                  <i class="fas fa-calendar-check mr-2"></i> Détails de la Réservation
              </h3>
              <div class="grid grid-cols-1 gap-3">
                  <div>
                      <label class="block text-xs font-bold ${textLabel} uppercase">Service</label>
                      <p class="mt-0.5 text-base font-medium text-gray-800 dark:text-gray-200">${reservationData.serviceName} (${reservationData.serviceCategory})</p>
                  </div>
                  <div>
                      <label class="block text-xs font-bold ${textLabel} uppercase">Date</label>
                      <p class="mt-0.5 text-base font-medium text-gray-800 dark:text-gray-200">${reservationData.date}</p>
                  </div>
                  <div>
                      <label class="block text-xs font-bold ${textLabel} uppercase">Horaire</label>
                      <p class="mt-0.5 text-base font-medium text-gray-800 dark:text-gray-200">${reservationData.hour || 'À définir'}</p>
                  </div>
                  <div>
                      <label class="block text-xs font-bold ${textLabel} uppercase">Instructions</label>
                      <div class="mt-0.5 p-3 rounded-xl ${bgContent} border ${borderSubtle} max-h-32 overflow-y-auto shadow-inner">
                          <p class="text-sm whitespace-pre-wrap text-gray-800 dark:text-gray-200">${reservationData.message || 'Aucune'}</p>
                      </div>
                  </div>
              </div>
          </div>
          </div>

          <div class="text-center mt-4">
            <div class="flex justify-center items-center gap-2 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-ll-dark-blue dark:text-ll-light-blue">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <p class="text-sm font-medium text-gray-800 dark:text-gray-200">
                Votre réservation a été envoyée. Veuillez vérifier votre boîte mail (<strong>${reservationData.email}</strong>) pour la confirmation.
              </p>
            </div>
            <p class="text-sm italic ${textLabel}">
              Merci pour votre réservation. Nous vous contacterons sous 24h pour confirmer.
            </p>
          </div>
        </div>
      `,
      icon: undefined,
      showConfirmButton: true,
      confirmButtonText: '<i class="fas fa-times mr-2"></i> Fermer',
      confirmButtonColor: '#1e90ff',
      width: '100%',
      customClass: {
        popup: 'swal-wide rounded-3xl shadow-xl w-full max-w-lg md:max-w-3xl',
        confirmButton: 'px-8 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-[1.02] shadow-lg',
        title: 'pt-4',
      },
      background: bgMain,
      color: isDark ? '#FDFDFC' : '#1B1B18',
      showClass: { popup: 'animate__animated animate__zoomIn' },
      hideClass: { popup: 'animate__animated animate__zoomOut' }
    });
  },

  /**
   * Ferme la modale de réservation.
   * @function closeReservationModal
   */
  closeReservationModal() {
    const modal = document.getElementById('reservation-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = 'auto';
    }
  },
};

// Bind global pour fermeture modale
document.addEventListener('DOMContentLoaded', () => {
  const closeBtn = document.getElementById('reservation-modal-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => reservation.closeReservationModal());
  }

  const modal = document.getElementById('reservation-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) reservation.closeReservationModal();
    });
  }

  const cancelBtn = document.getElementById('reservation-cancel');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => reservation.closeReservationModal());
  }
});

export default reservation;
