/**
 * @file loadServices.js
 * @description Charge et gère les données des services avec mise en cache et fallback sur données mock
 * @version Ultra Mega Puissante: Fixed null DOM errors, synced sidebar/details, auto-reset index on filters, robust error handling, enhanced navigation
 */

import { getStoredToken, showNotification } from '../modules/utils.js';
import api from '../api.js';
import { hideNoServicesMessage, showNoServicesMessage } from '../animations/animation.js';

// Configuration du cache ultra-robuste
const SERVICES_CACHE_KEY = 'servicesDataCache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Icônes des services (étendu et optimisé)
const serviceIcons = {
    bureaux: '🏢',
    residentiel: '🏠',
    commercial: '🛍️',
    industriel: '🏭',
    medical: '🏥',
    hotelier: '🏨',
    education: '🎓',
    restaurant: '🍽️',
    sport: '💪',
    evenementiel: '🎪',
    piscine: '🏊',
    vitres: '🔍',
    facade: '🏛️',
    parking: '🅿️',
    jardin: '🌿'
};

export const equipmentIcons = {
    vacuum: {
        name: 'Aspirateur',
        image: '/assets/images/equipments/vacuum.png'
    },
    mop: {
        name: 'Balai',
        image: '/assets/images/equipments/mop.png'
    },
    spray: {
        name: 'Pulvérisateur',
        image: '/assets/images/equipments/spray.png'
    },
    broom: {
        name: 'Balai',
        image: '/assets/images/equipments/broom.png'
    },
    bucket: {
        name: 'Seau',
        image: '/assets/images/equipments/bucket.png'
    },
    cloth: {
        name: 'Chiffon',
        image: '/assets/images/equipments/cloth.png'
    },
    polisher: {
        name: 'Polisseuse',
        image: '/assets/images/equipments/polisher.png'
    },
    brush: {
        name: 'Brosse',
        image: '/assets/images/equipments/brush.png'
    },
    duster: {
        name: 'Plumeau',
        image: '/assets/images/equipments/duster.png'
    },
    scraper: {
        name: 'Raclette',
        image: '/assets/images/equipments/scraper.png'
    },
    pressure_washer: {
        name: 'Nettoyeur haute pression',
        image: '/assets/images/equipments/pressure_washer.png'
    },
    steam_cleaner: {
        name: 'Nettoyeur vapeur',
        image: '/assets/images/equipments/steam_cleaner.png'
    },
    floor_machine: {
        name: 'Machine à laver les sols',
        image: '/assets/images/equipments/floor_machine.png'
    },
    car_machine: {
        name: 'Machine à laver les voitures',
        image: '/assets/images/equipments/car_machine.png'
    },
    feather_duster: {
        name: 'Plumeau à poussière',
        image: '/assets/images/equipments/feather_duster.png'
    },
    microfiber_cloth: {
        name: 'Chiffon microfibre',
        image: '/assets/images/equipments/microfiber_cloth.png'
    },
    window_squeegee: {
        name: 'Raclette à vitres',
        image: '/assets/images/equipments/window_squeegee.png'
    },
    industrial_vacuum: {
        name: 'Aspirateur industriel',
        image: '/assets/images/equipments/industrial_vacuum.png'
    },
    disinfectant_sprayer: {
        name: 'Pulvérisateur désinfectant',
        image: '/assets/images/equipments/disinfectant_sprayer.png'
    },
    uv_sanitizer: {
        name: 'Sanitiseur UV',
        image: '/assets/images/equipments/uv_sanitizer.png'
    },
    medical_waste_container: {
        name: 'Conteneur déchets médicaux',
        image: '/assets/images/equipments/medical_waste_container.png'
    },
    car_vacuum: {
        name: 'Aspirateur auto',
        image: '/assets/images/equipments/car_vacuum.png'
    },
    fallback: {
        name: 'L&L Ouest Services',
        image: '/assets/images/equipments/fallback.png'
    },
};


let MOCK_SERVICES = [];
export let allFilteredServices = [];
let currentServiceIndex = 0;
let paginationVisiblePages = 5;
let lastFiltersHash = '';

/**
 * Toggle le loading overlay - ROBUSTE: Cache complètement les détails derrière et réapparaît si services disponibles
 * @param {boolean} show - Afficher ou masquer le loading
 * @param {boolean} [noServices=false] - Forcer l'affichage du message no-services
 */
export async function toggleServicesLoading(show, noServices = false) {
    const grid = document.getElementById('services-display-grid');
    if (!grid) {
      // console.warn('Grid element not found, skipping toggleServicesLoading.');
        return;
    }

    if (show) {
        grid.classList.add('hidden');

        let loadingDiv = document.getElementById('services-loading-display');
        if (!loadingDiv) {
            loadingDiv = document.createElement('div');
            loadingDiv.id = 'services-loading-display';
            loadingDiv.className = 'col-span-full text-center py-20';
            loadingDiv.innerHTML = `
                <div class="max-w-md mx-auto p-8">
                    <svg class="text-gray-400 dark:text-white mx-auto mb-6 animate-pulse" width="80" height="80" viewBox="0 0 74.34 74.34" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <!-- SVG content remains unchanged -->
                    </svg>
                    <p class="text-gray-600 dark:text-gray-300 mt-4">Chargement des services...</p>
                </div>
            `;
            grid.parentNode.insertBefore(loadingDiv, grid.nextSibling);
        }
        loadingDiv.classList.remove('hidden');

        const noServicesDiv = document.getElementById('no-services-display');
        if (noServicesDiv) {
            noServicesDiv.classList.add('hidden');
        }
    } else {
        const loadingDiv = document.getElementById('services-loading-display');
        if (loadingDiv) {
            loadingDiv.classList.add('hidden');
        }

        if (noServices || allFilteredServices.length === 0) {
            showNoServicesMessage();
        } else {
            grid.classList.remove('hidden');
            hideNoServicesMessage();
        }
    }
}



/**
 * Gère les images manquantes avec fallback et retry
 * @param {HTMLElement} imgElement - L'élément image
 */
export function handleImageError(imgElement) {
    const originalSrc = imgElement.dataset.src;
    const fallbackSrc = imgElement.dataset.fallback || '/assets/images/equipments/fallback.png';
    
    if (imgElement.src !== fallbackSrc) {
        imgElement.src = fallbackSrc;
        imgElement.classList.remove('filter', 'blur-sm', 'loading-image');
        
        setTimeout(() => {
            const retryImg = new Image();
            retryImg.onload = () => {
                imgElement.src = originalSrc;
                imgElement.classList.remove('filter', 'blur-sm');
            };
            retryImg.src = originalSrc;
        }, 2000);
    }
}


/**
 * Charge les services mock depuis JSON avec retry et fallback
 */
async function loadMockServices(retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch('/assets/json/mock/mock-services.json');
            if (response.ok) {
                const data = await response.json();
                MOCK_SERVICES = data.services.map(service => ({
                    ...service,
                     icon: serviceIcons[service.category] || serviceIcons.bureaux,
                        equipment: (service.equipment || ['vacuum', 'mop', 'spray']).map(eqId => {
                            const eq = equipmentIcons[eqId] || equipmentIcons.vacuum;
                            return { 
                            name: eq.name, 
                                image: eq.image || '/assets/images/equipments/fallback.png'
                            };
                        }),
                    certification: service.certification || getRandomCertification(),
                    garantie: service.garantie || '30 jours',
                    delai_intervention: service.delai_intervention || getRandomInterventionTime(),
                    zone_intervention: service.zone_intervention || 'Île-de-France',
                    images: service.images || [{ url: '/assets/images/placeholder.jpg', type: 'after' }],
                    features: service.features || ['Service professionnel', 'Équipé moderne'],
                    members: service.members || [{ name: 'Équipe Pro', role: 'Nettoyeurs', photo: '/assets/images/instrument.png' }],
                    availability: service.availability || { isAvailable: true, schedule: [{ day: 'Lun-Ven', hours: ['9h-18h'] }] },
                    rating: service.rating || 4.5,
                    reviews: service.reviews || 100,
                    difficulty: service.difficulty || 'medium',
                    frequency: service.frequency || 'hebdomadaire'
                }));
                return;
            }
        } catch (error) {
          //  console.warn(`Mock load attempt ${i + 1} failed:`, error);
            if (i === retries - 1) {
                console.error('All mock load attempts failed');
                showNotification('Erreur lors du chargement des données mock.', 'error');
                MOCK_SERVICES = [];
            }
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }
}

loadMockServices();

/**
 * Retourne une certification aléatoire
 */
function getRandomCertification() {
    const certifications = ['NF X50-900', 'ISO 9001', 'Qualibat', 'Ecocert', 'Label Origine France Garantie'];
    return certifications[Math.floor(Math.random() * certifications.length)];
}

/**
 * Retourne un délai d'intervention aléatoire
 */
function getRandomInterventionTime() {
    const delais = ['24h', '48h', '72h', '1 semaine'];
    return delais[Math.floor(Math.random() * delais.length)];
}

/**
 * Charge tous les services avec filtres, cache, et auto-reset index si filtres changent
 * @param {Object} filters - Filtres appliqués
 */
export async function loadServices(filters = {}) {
    await toggleServicesLoading(true);

    const filtersHash = JSON.stringify(filters);
    const filtersChanged = filtersHash !== lastFiltersHash;
    lastFiltersHash = filtersHash;

    try {
        const token = getStoredToken();
        let services;

        if (!token) {
            console.log('No token, using mock data.');
            services = [...MOCK_SERVICES];
        } else {
            let cachedData = getCachedServices();
            if (cachedData && !filtersChanged) {
                console.log('Using cached data.');
                services = [...cachedData];
            } else {
                console.log('Fetching from API...');
                const apiData = await api.service.getAllServices(1, 100, filters).catch(err => {
                 //   console.warn('API fetch failed, fallback to mock:', err);
                    return null;
                });

                if (apiData?.services && apiData.services.length > 0) {
                    services = apiData.services.map(service => ({
                        ...service,
                        icon: serviceIcons[service.category] || serviceIcons.bureaux,
                        equipment: (service.equipment || ['vacuum', 'mop', 'spray']).map(eqId => {
                            const eq = equipmentIcons[eqId] || equipmentIcons.vacuum;
                            return { icon: eq.svg, name: eq.name };
                        }),
                        images: service.images || [{ url: '/assets/images/placeholder.jpg', type: 'after' }],
                        features: service.features || ['Service professionnel', 'Équipé moderne'],
                        members: service.members || [{ name: 'Équipe Pro', role: 'Nettoyeurs', photo: '/assets/images/instrument.png' }],
                        availability: service.availability || { isAvailable: true, schedule: [{ day: 'Lun-Ven', hours: ['9h-18h'] }] },
                        rating: service.rating || 4.5,
                        reviews: service.reviews || 100,
                        difficulty: service.difficulty || 'medium',
                        frequency: service.frequency || 'hebdomadaire'
                    }));
                    cacheServices(services);
                } else {
                    console.log('API empty, using mock.');
                    services = [...MOCK_SERVICES];
                }
            }
        }

        allFilteredServices = applyFilters(services, filters);

        if (allFilteredServices.length > 0) {
            preloadEquipmentImages(allFilteredServices).then(() => {
                if (allFilteredServices[currentServiceIndex]) {
                    renderServiceDetail(allFilteredServices[currentServiceIndex], currentServiceIndex, allFilteredServices.length);
                }
            });
        }

        if (filtersChanged && allFilteredServices.length > 0) {
            currentServiceIndex = 0;
        } else if (allFilteredServices.length === 0) {
            currentServiceIndex = 0;
        } else if (currentServiceIndex >= allFilteredServices.length) {
            currentServiceIndex = allFilteredServices.length - 1;
        }

        return allFilteredServices;

    } catch (error) {
        console.error('Error loading services:', error);
        showNotification('Erreur lors du chargement des services.', 'error');
        allFilteredServices = applyFilters(MOCK_SERVICES, filters);
        currentServiceIndex = 0;
        return allFilteredServices;
    } finally {
        await toggleServicesLoading(false, allFilteredServices.length === 0);
    }
}

/**
 * Applique les filtres avancés avec optimisation
 */
function applyFilters(services, filters) {
    const { category, frequency, difficulty, reviewsMin, search } = filters;

    return services.filter(service => {
        if (category && category !== 'all' && service.category !== category) return false;
        if (frequency && frequency !== 'all' && service.frequency !== frequency) return false;
        if (difficulty && difficulty !== 'all' && service.difficulty !== difficulty) return false;
        if (reviewsMin && service.reviews < reviewsMin) return false;

        if (search) {
            const lowerSearch = search.toLowerCase();
            if (!service.name.toLowerCase().includes(lowerSearch) &&
                !service.description.toLowerCase().includes(lowerSearch) &&
                !service.features.some(feature => feature.toLowerCase().includes(lowerSearch))) {
                return false;
            }
        }

        return true;
    });
}

/**
 * Met en cache les services avec TTL
 */
function cacheServices(services) {
    try {
        if (!services || !Array.isArray(services)) return;
        const cacheData = { data: services, timestamp: Date.now() };
        localStorage.setItem(SERVICES_CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
        console.error('Cache error:', error);
    }
}

/**
 * Récupère les services en cache s'ils sont valides
 */
function getCachedServices() {
    try {
        const cached = localStorage.getItem(SERVICES_CACHE_KEY);
        if (!cached) return null;

        const { data, timestamp } = JSON.parse(cached);
        if (!Array.isArray(data) || Date.now() - timestamp > CACHE_TTL) {
            localStorage.removeItem(SERVICES_CACHE_KEY);
            return null;
        }
        return data;
    } catch (error) {
        console.error('Retrieve cache error:', error);
        localStorage.removeItem(SERVICES_CACHE_KEY);
        return null;
    }
}

/**
 * Rend la liste des services dans le panneau de filtres
 * @param {Array} services - Liste des services à afficher
 */
export function renderServicesSidebar(services) {
    const listContainer = document.getElementById('services-list');
    const servicesCount = document.getElementById('services-count');
    if (!listContainer || !servicesCount) {
      //  console.warn('Services list elements not found, skipping render.');
        return;
    }

    servicesCount.textContent = services.length;

    listContainer.innerHTML = services.map((service, index) => {
    const afterImage = service.images?.find(img => img.type === 'after') || { url: '/assets/images/logo.png' };
    const categoryLabel = service.category ? `<span class="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">${service.category}</span>` : '';

    return `
        <button class="service-list-item flex-shrink-0 w-44 sm:w-64 text-left p-2 my-4 rounded-xl border border-white/20 dark:border-gray-600/50 backdrop-blur-sm transition-all duration-300 group ${
            index === currentServiceIndex ? 'border-white/50 bg-white/50 dark:bg-gray-600/30 shadow-xl ring-1 ring-white/30' : 'bg-white/50 dark:bg-gray-600/30'
        }" data-service-index="${index}">
            <div class="flex flex-col gap-2 sm:gap-3 h-full">
                <img src="${afterImage.url}" alt="${service.name}" class="w-full h-20 sm:h-24 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300">
                <div class="flex-1 min-h-0">
                    <h4 class="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">${service.name}</h4>
                    <div class="flex items-center gap-1 sm:gap-2 mt-1">
                        <div class="flex text-yellow-400 text-xs">
                            ${renderStarRating(service.rating)}
                        </div>
                        <span class="text-xs text-gray-500 dark:text-gray-400">(${service.reviews})</span>
                    </div>
                </div>
                <div class="flex items-center justify-between pt-2 border-t border-gray-200/50 dark:border-gray-600/50">
                    <div class="flex items-center gap-1 sm:gap-2">
                        <span class="text-lg transform group-hover:scale-110 transition-transform">${service.icon}</span>
                        ${categoryLabel}
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" class="sm:w-3.5 sm:h-3.5 text-ll-blue opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-0.5 sm:group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M5 12h14"/><path d="M12 5l7 7-7 7"/>
                    </svg>
                </div>
            </div>
        </button>
    `;
}).join('');

listContainer.querySelectorAll('.service-list-item').forEach((item, index) => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const direction = index > currentServiceIndex ? 'next' : index < currentServiceIndex ? 'prev' : null;
        const delta = Math.abs(index - currentServiceIndex);
        if (direction) {
            navigateService(direction, delta);
        } else {
            renderServiceDetail(services[index], index, services.length);
        }

        listContainer.querySelectorAll('.service-list-item').forEach((el, i) => {
    if (i === currentServiceIndex) {
        // ÉLÉMENT ACTIF (sélectionné)
        el.classList.remove(
            'bg-white/50', 
            'dark:bg-ll-black/20', 
            'border-gray-200', 
            'dark:border-gray-700/50',
            'shadow-md'
        );
        el.classList.add(
            'bg-white/50', 
            'dark:bg-gray-600/30',
            'border-2',
            'border-blue-500',        
            'dark:border-blue-400',
            'shadow-xl',
            'ring-4',
            'ring-blue-500/20',
            'dark:ring-blue-400/30',
            'z-10',
            'scale-105',
            'transition-all',
            'duration-300'
        );
    } else {
        // ÉLÉMENTS INACTIFS
        el.classList.remove(
            'bg-white/50', 
            'dark:bg-gray-600/30',
            'border-2',
            'border-blue-500',
            'dark:border-blue-400',
            'shadow-xl',
            'ring-4',
            'ring-blue-500/20',
            'scale-105'
        );
        el.classList.add(
        'bg-white/50', 
            'dark:bg-gray-600/30',
            'border',
            'border-gray-300',       
            'dark:border-gray-700/60',
            'shadow-md',
            'hover:border-gray-400',
            'dark:hover:border-gray-600',
            'hover:bg-white/90',
            'dark:hover:bg-gray-800/70',
            'transition-all',
            'duration-300'
        );
    }
});
    });
});

    updateMobileServiceSelector(services);
    renderServicePagination(services.length);

    if (services.length > 0 && currentServiceIndex < services.length) {
        renderServiceDetail(services[currentServiceIndex], currentServiceIndex, services.length);
    } else if (services.length === 0) {
        showNoServicesMessage();
    }

    highlightSearchTerms({});
}

/**
 * Rend la pagination des services
 * @param {number} totalServices - Nombre total de services
 */
function renderServicePagination(totalServices) {
    const paginationContainer = document.getElementById('service-pagination');
    const pagesContainer = document.getElementById('service-pages');
    if (!paginationContainer || !pagesContainer || totalServices < 2) {
        if (paginationContainer) paginationContainer.classList.add('hidden');
        return;
    }

    const totalPages = totalServices;
    const currentPage = currentServiceIndex + 1;
    const maxVisible = paginationVisiblePages;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }

    let pagesHTML = '';

    if (startPage > 1) {
        pagesHTML += `<button class="service-page-btn px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-medium hover:bg-ll-blue hover:text-white transition-all duration-300 transform hover:scale-105" data-page="1">1</button>`;
        if (startPage > 2) {
            pagesHTML += `<span class="pagination-ellipsis mx-1 text-sm">...</span>`;
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        pagesHTML += `
            <button class="service-page-btn px-4 py-2 rounded-full ${i === currentPage ? 'bg-ll-blue text-white shadow-lg neon-glow' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'} font-medium hover:bg-ll-blue hover:text-white transition-all duration-300 transform hover:scale-105" data-page="${i}">
                ${i}
            </button>
        `;
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            pagesHTML += `<span class="pagination-ellipsis mx-0 text-sm">...</span>`;
        }
        pagesHTML += `<button class="service-page-btn px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-medium hover:bg-ll-blue hover:text-white transition-all duration-300 transform hover:scale-105" data-page="${totalPages}">${totalPages}</button>`;
    }

    pagesContainer.innerHTML = pagesHTML;
    paginationContainer.classList.remove('hidden');

    const prevBtn = document.getElementById('service-prev');
    const nextBtn = document.getElementById('service-next');
    if (prevBtn) prevBtn.onclick = () => navigateService('prev');
    if (nextBtn) nextBtn.onclick = () => navigateService('next');

    pagesContainer.querySelectorAll('.service-page-btn').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            const page = parseInt(btn.dataset.page);
            if (page !== currentPage && !isNaN(page)) {
                const delta = page - currentPage;
                navigateService(delta > 0 ? 'next' : 'prev', Math.abs(delta));
            }
        };
    });

    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = currentPage === totalPages;
}

/**
 * Met à jour le sélecteur mobile
 * @param {Array} services - Liste des services
 */
function updateMobileServiceSelector(services) {
    const mobileSelector = document.getElementById('mobile-service-selector');
    if (!mobileSelector) return;

    mobileSelector.innerHTML = '<option value="">Sélectionnez un service</option>' +
        services.map((service, index) => `
            <option value="${index}" ${index === currentServiceIndex ? 'selected' : ''}>
                ${service.name} (${service.rating} ⭐)
            </option>
        `).join('');

    const handler = mobileSelector._changeHandler;
    if (handler) mobileSelector.removeEventListener('change', handler);
    mobileSelector._changeHandler = (e) => {
        const selectedIndex = parseInt(e.target.value);
        if (!isNaN(selectedIndex) && services[selectedIndex]) {
            const delta = selectedIndex - currentServiceIndex;
            navigateService(delta > 0 ? 'next' : 'prev', Math.abs(delta));
        }
    };
    mobileSelector.addEventListener('change', mobileSelector._changeHandler);
}



/**
 * Rend le détail d'un service
 * @param {Object} service - Service à afficher
 * @param {number} index - Index du service
 * @param {number} total - Nombre total de services
 */
export function renderServiceDetail(service, index = 0, total = 1) {
    const container = document.getElementById('service-detail-container');
    if (!container) {
     //   console.warn('Detail container not found, skipping render.');
        return;
    }

    service = service || {
        name: 'Service par défaut',
        description: 'Description par défaut.',
        images: [{ url: '/assets/images/placeholder.jpg', type: 'after', description: 'Description par défaut' }],
        features: ['Feature 1'],
        equipment: [{ icon: '🧹', name: 'Default' }],
        members: [{ name: 'Équipe', role: 'Pro', photo: '/assets/images/instrument.png' }],
        availability: { isAvailable: true, schedule: [{ day: 'Lun-Ven', hours: ['9h-18h'] }] },
        rating: 4.5,
        reviews: 100,
        difficulty: 'medium',
        certification: 'Non spécifié',
        garantie: 'Non spécifié',
        delai_intervention: 'Non spécifié',
        zone_intervention: 'Non spécifié'
    };

    currentServiceIndex = index;

    const imagesWrapper = document.getElementById('service-images');
    if (imagesWrapper) {
        imagesWrapper.innerHTML = service.images.map((img, imgIndex) => `
            <div class="swiper-slide relative">
                <img src="${img.url}" alt="${img.description || service.name}" class="w-full h-64 md:h-80 lg:h-96 object-cover rounded-xl" loading="lazy" onerror="this.src='/assets/images/logo.png'">
               
            </div>
        `).join('');

        if (window.Swiper) {
            const swiperEl = document.querySelector('.service-image-swiper');
            if (swiperEl && swiperEl.swiper && typeof swiperEl.swiper.destroy === 'function') {
                try {
                    swiperEl.swiper.destroy(true, true);
                } catch (err) {
                //    console.warn('Error destroying previous Swiper instance:', err);
                }
            }

            setTimeout(() => {
                if (swiperEl) {
                    try {
                        const newSwiper = new window.Swiper('.service-image-swiper', {
                            slidesPerView: 1,
                            spaceBetween: 0,
                            pagination: {
                                el: '.swiper-pagination',
                                clickable: true,
                                renderBullet: (index, className) => `<span class="${className} !w-3 !h-3 !bg-white/50 !opacity-50 hover:!opacity-100 !transition-all"></span>`
                            },
                            navigation: {
                                nextEl: '.swiper-button-next',
                                prevEl: '.swiper-button-prev',
                            },
                            loop: service.images.length > 1,
                            lazy: true,
                            autoplay: service.images.length > 1 ? {
                                delay: 5000,
                                disableOnInteraction: false,
                            } : false,
                            effect: 'fade',
                            fadeEffect: { crossFade: true }
                        });
                        swiperEl.swiper = newSwiper;
                    } catch (swiperErr) {
                        console.error('Error initializing Swiper:', swiperErr);
                    }
                }
            }, 150);
        }
    }

    const updateServiceHeader = (nameSelector, descSelector, ratingSelector, ratingValueSelector, reviewsSelector, difficultySelector) => {
        const nameEl = document.querySelector(nameSelector);
        const descEl = document.querySelector(descSelector);
        const ratingEl = document.querySelector(ratingSelector);
        const ratingValueEl = document.querySelector(ratingValueSelector);
        const reviewsEl = document.querySelector(reviewsSelector);
        const difficultyEl = document.querySelector(difficultySelector);

        if (nameEl) nameEl.textContent = service.name;
        if (descEl) descEl.textContent = service.description;
        if (ratingEl) ratingEl.innerHTML = renderStarRating(service.rating);
        if (ratingValueEl) ratingValueEl.textContent = service.rating.toFixed(1);
        if (reviewsEl) reviewsEl.textContent = `${service.reviews} avis`;

        if (difficultyEl) {
            const difficultyColors = { easy: 'difficulty-easy', medium: 'difficulty-medium', hard: 'difficulty-hard' };
            const difficultyText = { easy: 'Facile', medium: 'Moyen', hard: 'Difficile' };
            difficultyEl.textContent = difficultyText[service.difficulty] || 'Moyen';
            Object.values(difficultyColors).forEach(cls => difficultyEl.classList.remove(cls));
            difficultyEl.classList.add(difficultyColors[service.difficulty] || 'difficulty-medium');
        }
    };

    updateServiceHeader(
        '.service-name-mobile', '.service-description-mobile',
        '.service-rating-mobile', '.service-rating-value-mobile',
        '.service-reviews-mobile', '.service-difficulty-mobile'
    );

    updateServiceHeader(
        '.service-name-desktop', '.service-description-desktop',
        '.service-rating-desktop', '.service-rating-value-desktop',
        '.service-reviews-desktop', '.service-difficulty-desktop'
    );

    const featuresList = document.querySelector('.service-features-content');
    if (featuresList) {
        featuresList.innerHTML = service.features.map(feature => `
            <li class="flex items-center  gap-3 p-3 bg-white/50 dark:bg-gray-600/30 rounded-lg hover:bg-white dark:hover:bg-gray-600 transition-colors group">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-500 flex-shrink-0">
                    <path d="M20 6 9 17l-5-5"></path>
                </svg>
                <span class="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">${feature}</span>
            </li>
        `).join('');
    }

const equipmentEl = document.querySelector('.service-equipment-content');
if (equipmentEl) {
    equipmentEl.innerHTML = service.equipment.map(eq => {
        const fallbackImage = '/assets/images/equipments/fallback.png';
        const imageSrc = eq.image || fallbackImage;
        
        return `
            <div class="text-center group cursor-pointer transform transition-all duration-300">
                <div class="bg-white dark:bg-gray-600/30 rounded-xl p-3 shadow-lg hover:shadow-xl relative h-full flex flex-col">
                    <div class="relative w-full aspect-square mb-2 mx-auto overflow-hidden flex-shrink-0">
                        <img 
                            src="${imageSrc}"
                            data-fallback="${fallbackImage}"
                            alt="${eq.name}"
                            class="w-full h-full object-contain p-2 transition-all duration-500 filter-none loading-image lazy-load"
                            loading="lazy"
                            onerror="this.src='${fallbackImage}'; this.classList.remove('filter', 'blur-sm')"
                            onload="this.classList.remove('filter', 'blur-sm', 'loading-image'); this.classList.add('loaded')"
                        />
                        <!-- Indicateur de chargement -->
                        <div class="absolute inset-0 flex items-center justify-center loading-overlay">
                            <div class="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    </div>
                    <div class="flex-1 flex items-center justify-center min-h-[2.5rem]">
                        <span class="text-xs text-gray-600 dark:text-gray-400 font-medium capitalize">${eq.name}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}





    const membersEl = document.querySelector('.service-members-content');
    if (membersEl) {
        membersEl.innerHTML = service.members.map(member => `
            <div class="flex items-center gap-4 p-4 bg-white/50 dark:bg-gray-600/30 rounded-xl hover:bg-white dark:hover:bg-gray-600 transition-all duration-300 group">
                <img src="${member.photo}" alt="${member.name}" class="w-12 h-12 md:w-16 md:h-16 rounded-xl object-cover border-2 border-transparent group-hover:border-ll-blue transition-colors" onerror="this.src='/assets/images/instrument.png'">
                <div class="flex-1">
                    <p class="font-semibold text-gray-900 dark:text-white group-hover:text-ll-blue transition-colors">${member.name}</p>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">${member.role}</p>
                    <div class="flex gap-1 mt-2">
                        ${Array.from({ length: 5 }, (_, i) => `
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="${i < 4 ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-yellow-400">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                            </svg>
                        `).join('')}
                    </div>
                </div>
            </div>
        `).join('');
    }

    const availabilityEl = document.querySelector('.service-availability-text');
    const scheduleEl = document.querySelector('.service-schedule-content');
    //if (availabilityEl) {
      //  availabilityEl.textContent = service.availability.isAvailable ?
        //    '✅ Service disponible immédiatement' : '❌ Service temporairement indisponible';
   // }
    if (scheduleEl) {
        scheduleEl.innerHTML = service.availability.schedule.map(sch => `
            <li class="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-600/30 rounded-lg hover:bg-white dark:hover:bg-gray-600 transition-colors">
                <span class="font-medium text-gray-700 dark:text-gray-300 capitalize">${sch.day}</span>
                <span class="dark:text-ll-white text-ll-black font-semibold">${sch.hours.join(' - ')}</span>
            </li>
        `).join('');
    }

    const certEl = document.querySelector('.service-certification-content');
    const guarEl = document.querySelector('.service-garantie-content');
    const delaiEl = document.querySelector('.service-delai-content');
    const zoneEl = document.querySelector('.service-zone-content');
    if (certEl) certEl.textContent = service.certification || 'Non spécifié';
    if (guarEl) guarEl.textContent = service.garantie || 'Non spécifié';
    if (delaiEl) delaiEl.textContent = service.delai_intervention || 'Non spécifié';
    if (zoneEl) zoneEl.textContent = service.zone_intervention || 'Non spécifié';

    const bookButton = document.querySelector('.service-book-btn');
    const demoButton = document.querySelector('.service-demo-btn');
    const moreInfoButton = document.querySelector('.service-more-info-btn');

    if (bookButton) {
        bookButton.onclick = () => {
            window.location.href = `/services?service=${service.id || index}&reserve=true`;
        };
    }

    if (demoButton) {
        demoButton.onclick = () => {
            if (window.openVideoModal && service.videoDemo) {
                window.openVideoModal(service.videoDemo, service.name);
            } else {
                showNotification('Démonstration vidéo non disponible pour ce service.', 'info');
            }
        };
    }

    if (moreInfoButton) {
        moreInfoButton.href = `/services?service=${service.id || index}`;
    }

    highlightSearchTerms(service);
    updateMobileServiceSelector(allFilteredServices);
}



/**
 * Fonction utilitaire pour précharger les images avec effet de flou
 * @param {Array} services - Liste des services
 */
async function preloadEquipmentImages(services) {
    const imagePromises = [];
    const loadedImages = new Set();
    
    services.forEach(service => {
        if (service.equipment && Array.isArray(service.equipment)) {
            service.equipment.forEach(eq => {
                if (eq.image && !loadedImages.has(eq.image)) {
                    loadedImages.add(eq.image);
                    
                    // Créer une promesse pour chaque image
                    const promise = new Promise((resolve) => {
                        const img = new Image();
                        img.src = eq.image;
                        
                        img.onload = () => {
                            resolve({ src: eq.image, success: true });
                        };
                        
                        img.onerror = () => {
                            // Essayer le fallback
                            const fallbackImg = new Image();
                            fallbackImg.src = '/assets/images/equipments/fallback.png';
                            eq.image = '/assets/images/equipments/fallback.png';
                            resolve({ src: eq.image, success: false });
                        };
                    });
                    
                    imagePromises.push(promise);
                }
            });
        }
    });
    
    try {
        await Promise.allSettled(imagePromises);
        console.log('Images préchargées avec succès');
    } catch (error) {
    //    console.warn('Certaines images n\'ont pas pu être préchargées:', error);
    }
}



/**
 * Met en surbrillance les termes de recherche
 * @param {Object} service - Service courant
 */
export function highlightSearchTerms(service) {
    const searchTerm = document.getElementById('service-search')?.value?.trim();
    if (!searchTerm) {
        resetHighlights();
        return;
    }

    function highlightElement(element, textSelector = null) {
        if (!element) return;
        let targetText;
        if (textSelector) {
            const textElements = element.querySelectorAll(textSelector);
            textElements.forEach(el => {
                targetText = el.textContent || el.innerText;
                if (targetText) {
                    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
                    el.innerHTML = targetText.replace(regex, '<span class="text-yellow-500 font-bold" style="text-shadow: 0 0 8px rgba(255, 193, 7, 0.6);">$1</span>');
                }
            });
        } else {
            targetText = element.textContent || element.innerText;
            if (targetText) {
                const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
                element.innerHTML = targetText.replace(regex, '<span class="text-yellow-500 font-bold" style="text-shadow: 0 0 8px rgba(255, 193, 7, 0.6);">$1</span>');
            }
        }
    }

    resetHighlights();

    ['.service-name-mobile', '.service-name-desktop'].forEach(selector => highlightElement(document.querySelector(selector)));
    ['.service-description-mobile', '.service-description-desktop'].forEach(selector => highlightElement(document.querySelector(selector)));
    highlightElement(document.querySelector('.service-features-content'), 'li span');
    highlightElement(document.querySelector('.service-equipment-content'), 'div span');

    const membersContainer = document.querySelector('.service-members-content');
    if (membersContainer) {
        membersContainer.querySelectorAll('p').forEach(p => highlightElement(p));
    }

    ['.service-certification-content', '.service-garantie-content', '.service-delai-content', '.service-zone-content'].forEach(selector => highlightElement(document.querySelector(selector)));
    highlightElement(document.querySelector('.service-availability-text'));
    highlightElement(document.querySelector('.service-schedule-content'), 'li span');

    const sidebarItems = document.querySelectorAll('.service-sidebar-item');
    sidebarItems.forEach(item => {
        highlightElement(item.querySelector('h4'));
        highlightElement(item.querySelector('span.text-xs'));
    });
}

/**
 * Reset tous les highlights
 */
export function resetHighlights() {
    const allHighlighted = document.querySelectorAll('[style*="text-shadow"], .text-yellow-500');
    allHighlighted.forEach(el => {
        if (el.tagName === 'SPAN' && el.parentNode) {
            const text = el.textContent;
            el.parentNode.replaceChild(document.createTextNode(text), el);
        } else {
            el.innerHTML = el.textContent;
        }
    });
}

// Compteur global pour garantir des identifiants SVG uniques
let starGradientCounter = 0;

function renderStarRating(rating, prefix = '') {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    const uniqueId = `${prefix}-${starGradientCounter++}`;

    let stars = '';

    // Étoiles pleines
    for (let i = 0; i < fullStars; i++) {
        stars += `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="url(#gold-gradient-${uniqueId}-${i})" stroke="currentColor" stroke-width="1" class="star-filled hover:scale-110 transition-all duration-300" data-rating="${i + 1}" aria-hidden="true">
                <defs>
                    <linearGradient id="gold-gradient-${uniqueId}-${i}" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#fbbf24"/>
                        <stop offset="100%" stop-color="#f59e0b"/>
                    </linearGradient>
                </defs>
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
        `;
    }

    // Étoile à moitié remplie
    if (hasHalfStar) {
        stars += `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="url(#half-gold-${uniqueId})" stroke="currentColor" stroke-width="1" class="star-filled hover:scale-110 transition-all duration-300" aria-hidden="true">
                <defs>
                    <linearGradient id="half-gold-${uniqueId}" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="50%" stop-color="#fbbf24"/>
                        <stop offset="50%" stop-color="transparent"/>
                    </linearGradient>
                </defs>
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
        `;
    }

    // Étoiles vides
    for (let i = 0; i < emptyStars; i++) {
        stars += `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E5E7EB dark:stroke-gray-600" stroke-width="2" class="star-empty hover:scale-110 transition-all duration-300" data-rating="${fullStars + (hasHalfStar ? 1 : 0) + i + 1}" aria-hidden="true">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
        `;
    }

    return stars;
}


function handleResize() {
    if (allFilteredServices.length > 0 && currentServiceIndex < allFilteredServices.length) {
        renderServiceDetail(allFilteredServices[currentServiceIndex], currentServiceIndex, allFilteredServices.length);
        renderServicesSidebar(allFilteredServices);
    }
}

window.addEventListener('resize', handleResize);


/**
 * Navigue vers le service précédent/suivant
 * @param {string} direction - 'prev' ou 'next'
 * @param {number} delta - Nombre de services à sauter
 */
export function navigateService(direction, delta = 1) {
    const total = allFilteredServices.length;
    if (total === 0) return;

    let newIndex = currentServiceIndex;
    if (direction === 'prev') {
        newIndex = Math.max(0, currentServiceIndex - delta);
    } else if (direction === 'next') {
        newIndex = Math.min(total - 1, currentServiceIndex + delta);
    }

    if (newIndex !== currentServiceIndex) {
        currentServiceIndex = newIndex;
        renderServiceDetail(allFilteredServices[currentServiceIndex], currentServiceIndex, total);
        renderServicesSidebar(allFilteredServices);
    }
}

export function getServiceIndex() {
    return currentServiceIndex;
}

export function setServiceIndex(index) {
    currentServiceIndex = Math.max(0, Math.min(index, allFilteredServices.length - 1));
}

export default {
    loadServices,
    renderServicesSidebar,
    renderServiceDetail,
    navigateService,
    toggleServicesLoading,
    getServiceIndex,
    setServiceIndex,
    highlightSearchTerms,
    resetHighlights
};