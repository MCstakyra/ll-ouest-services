/**
 * @file contactValidation.js
 * @description Schémas Joi pour valider les opérations sur les messages de contact et les réservations dans L&L Ouest Services.
 * @module utils/validation/contactValidation
 */

const Joi = require('joi');

/**
 * Schéma pour les messages de contact.
 * @type {Joi.ObjectSchema}
 */
const contactSchema = Joi.object({
  id: Joi.string().required().description('Identifiant unique du message'),
  userId: Joi.string().optional().allow(null).description('ID de l\'utilisateur (optionnel)'),
  name: Joi.string().min(2).max(100).required().description('Nom de la personne'),
  email: Joi.string().email().required().max(255).description('Email de contact'),
  phone: Joi.string().pattern(/^\+33[\s\-]?[1-9](?:[\s\-]?\d{2}){4}$/).allow(null, '').optional().description('Numéro de téléphone international'),
  message: Joi.string().min(1).max(10000).required().description('Message envoyé'),
  subjects: Joi.string().min(3).max(100).optional().description('Objet du message'),
  createdAt: Joi.string().isoDate().default(() => new Date().toISOString()).description('Date de création'),
}).label('ContactSchema');

/**
 * Schéma pour l'ID de contact ou de réservation.
 * @type {Joi.ObjectSchema}
 */
const idSchema = Joi.object({
  id: Joi.string().required().description('Identifiant unique du message de contact ou de la réservation'),
}).label('IdSchema');

/**
 * Schéma pour la pagination.
 * @type {Joi.ObjectSchema}
 */
const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).description('Numéro de page'),
  limit: Joi.number().integer().min(1).max(100).default(10).description('Limite par page'),
}).label('PaginationSchema');

/**
 * Schéma pour la réponse à un message de contact ou une réservation.
 * @type {Joi.ObjectSchema}
 */
const replySchema = Joi.object({
  reply: Joi.string().min(1).max(2000).required().description('Contenu de la réponse'),
  repliedBy: Joi.string().min(2).max(100).required().description('Nom de l\'administrateur qui répond'),
}).label('ReplySchema');

/**
 * Schéma pour les réservations (format mis à jour).
 * @type {Joi.ObjectSchema}
 */
const reservationSchema = Joi.object({
  id: Joi.string().required().description('Identifiant unique de la réservation'),
  serviceId: Joi.string().required().description('ID du service réservé'),
  serviceName: Joi.string().min(2).max(100).required().description('Nom du service réservé'),
  serviceCategory: Joi.string().min(2).max(50).required().description('Catégorie du service réservé'),
  userId: Joi.string().optional().allow(null).description('ID de l\'utilisateur (optionnel)'),
  name: Joi.string().min(2).max(100).required().description('Nom du client'),
  email: Joi.string().email().required().max(255).description('Email du client'),
  phone: Joi.string().pattern(/^\+33[\s\-]?[1-9](?:[\s\-]?\d{2}){4}$/).allow(null, '').optional().description('Numéro de téléphone international'),
  date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required().description('Date souhaitée de l\'intervention (format YYYY-MM-DD)'),
  hour: Joi.string().required().description('Horaire de réservation'),
  address: Joi.string().min(5).max(200).required().description('Adresse d\'intervention'),
  message: Joi.string().min(1).max(1000).required().description('Instructions ou message spécial'),
  createdAt: Joi.string().isoDate().default(() => new Date().toISOString()).description('Date de création'),
  clientHtmlTemplate: Joi.string().optional().description('Template HTML pour email client'),
  adminHtmlTemplate: Joi.string().optional().description('Template HTML pour email admin'),
  reply: Joi.string().allow(null, '').optional().description('Réponse de l\'administrateur'),
  repliedAt: Joi.string().isoDate().allow(null).optional().description('Date de réponse'),
  status: Joi.string().valid('pending', 'confirmed', 'completed', 'cancelled', 'deleted', 'replied', 'created_email_failed', 'spam', 'closed').default('pending').description('Statut de la réservation'),
  emailStatus: Joi.object({
    clientSent: Joi.boolean().default(false),
    adminSent: Joi.boolean().default(false),
    clientMessageId: Joi.string().optional(),
    adminMessageId: Joi.string().optional(),
    sentAt: Joi.string().isoDate().optional(),
  }).optional(),
  updatedAt: Joi.string().isoDate().optional().description('Date de mise à jour'),
  updatedBy: Joi.string().optional().allow(null).description('Utilisateur ayant mis à jour'),
  deletedAt: Joi.string().isoDate().optional().description('Date de suppression'),
  deletedBy: Joi.string().optional().allow(null).description('Utilisateur ayant supprimé'),
  errorMessage: Joi.string().optional().allow('', null).description('Message d\'erreur'),
}).label('ReservationSchema');

module.exports = {
  contactSchema,
  idSchema,
  paginationSchema,
  replySchema,
  reservationSchema,
};