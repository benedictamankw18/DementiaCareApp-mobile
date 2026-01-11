/**
 * Internationalization Service
 * Dementia Care Mobile Application
 * 
 * Custom i18n implementation for multi-language support
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Translation strings
const translations = {
  'en': {
    // Common
    'common.ok': 'OK',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',

    // Dashboard
    'dashboard.title': 'Care Dashboard',
    'dashboard.subtitle': 'Manage your patients',
    'dashboard.recentAlerts': 'Recent Alerts',
    'dashboard.yourPatients': 'Your Patients',
    'dashboard.noPatients': 'No patients assigned yet',
    'dashboard.activity': 'Activity',
    'dashboard.location': 'Location',
    'dashboard.failedToLoad': 'Failed to load dashboard data',
    'dashboard.couldNotOpenMaps': 'Could not open Google Maps',

    // SOS Alerts
    'sos.emergency': 'Emergency SOS Alert',
    'sos.triggered': 'Patient has triggered an emergency SOS alert',
    'sos.critical': 'CRITICAL',
    'sos.viewOnMap': 'View on Map',

    // Location
    'location.title': 'Patient Location',
    'location.viewOnMap': 'View on Map',
    'location.openMaps': 'Open in Google Maps',
    'location.openMapsDescription': 'Open location in Google Maps for detailed navigation',
    'location.currentLocation': 'Current Location',
    'location.address': 'Address',
    'location.coordinates': 'Coordinates',
    'location.accuracy': 'Accuracy',
    'location.lastUpdated': 'Last Updated',
    'location.refreshLocation': 'Refresh Location',
    'location.history': 'Location History',
    'location.noHistory': 'No location history available',
    'location.safeZones': 'Safe Zones',
    'location.radius': 'Radius',
    'location.couldNotOpenMaps': 'Could not open Google Maps',

    // Settings
    'settings.title': 'Settings',
    'settings.language': 'Language',
    'settings.selectLanguage': 'Select Language',
    'settings.saveChanges': 'Save Changes',
    'settings.languageSaved': 'Language preference saved!',
    'settings.failedToSave': 'Failed to save language preference',
    'settings.english': 'English',
    'settings.spanish': 'Español',
    'settings.french': 'Français',
    'settings.german': 'Deutsch',

    // Status
    'status.active': 'Active',
    'status.idle': 'Idle',
    'status.offline': 'Offline',

    // Time
    'time.justNow': 'just now',
    'time.minutesAgo': '{{count}} minutes ago',
    'time.hoursAgo': '{{count}} hours ago',
    'time.daysAgo': '{{count}} days ago',
    'time.aWeekAgo': 'a week ago',

    // Activity
    'activity.title': 'Activity',
    'activity.logActivity': 'Log Activity',
    'activity.createReminder': 'Create Reminder',
    'activity.noActivities': 'No activities found',
    'activity.today': 'Today',
    'activity.week': 'This Week',
    'activity.allTime': 'All Time',
    'activity.activityTitle': 'Activity Title',
    'activity.description': 'Description',
    'activity.activityType': 'Activity Type',
    'activity.reminderTitle': 'Reminder Title',
    'activity.reminderType': 'Reminder Type',
    'activity.addActivity': 'Add Activity',
    'activity.success': 'Success',
    'activity.addActivitySuccess': 'Activity added successfully',
    'activity.createReminderSuccess': 'Reminder created successfully',
    'activity.validationError': 'Validation',
    'activity.pleaseEnterTitle': 'Please enter activity title',
    'activity.pleaseEnterReminderTitle': 'Please enter reminder title',
    'activity.failedToAdd': 'Failed to add activity',
    'activity.failedToCreate': 'Failed to create reminder',
    'activity.placeholderMorningWalk': 'e.g., Morning Walk',
    'activity.placeholderAddDetails': 'Add details about the activity',
    'activity.placeholderReminder': 'e.g., Take Medication',
    'activity.placeholderReminderDetails': 'Add details about the reminder',

    // Profile
    'profile.personalInformation': 'Personal Information',
    'profile.fullName': 'Full Name',
    'profile.enterFullName': 'Enter your full name',
    'profile.phone': 'Phone Number',
    'profile.enterPhone': 'Enter your phone number',
    'profile.accessibilitySettings': 'Accessibility Settings',
    'profile.fontSize': 'Font Size',
    'profile.fontSizeDefault': 'Font size (default: 16)',
    'profile.currentSize': 'Current size: {{size}}px',
    'profile.highContrastMode': 'High Contrast Mode',
    'profile.improveReadability': 'Improves readability with stronger color contrast',
    'profile.nameRequired': 'Name is required',
    'profile.profileUpdated': 'Profile updated',
    'profile.failedToUpdate': 'Failed to update profile',
    'profile.saveChanges': 'Save Changes',
    'profile.saving': 'Saving...',
    // Notifications
    'notifications.schedule': 'Notification Schedule',
    'notifications.startTime': 'Start Time',
    'notifications.endTime': 'End Time',
    'notifications.helperText': 'Notifications will only be sent between these times',
    'notifications.invalidTimeRange': 'Invalid Time Range',
    'notifications.endTimeAfterStart': 'End time must be at least 1 minute after start time',
    'notifications.saved': 'Notification time saved!',
    'notifications.failedToSave': 'Failed to save notification time',
    'notifications.hour': 'Hour',
    'notifications.minute': 'Minute',
    'notifications.period': 'Period',
    'notifications.selectTime': 'Select Time',

    // Privacy Policy
    'privacy.title': 'Privacy Policy',
    'privacy.intro': 'Introduction',
    'privacy.section1': 'The Dementia Care Application ("we" or "us" or "our") operates the Dementia Care mobile application (the "Service"). This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.',
    'privacy.collection': 'Information Collection and Use',
    'privacy.section2': 'We collect several different types of information for various purposes to provide and improve our Service to you.',
    'privacy.typesOfData': 'Types of data collected:',
    'privacy.personalInfo': 'Personal Information (name, email, phone, address)',
    'privacy.usageData': 'Usage Data (how you interact with the application)',
    'privacy.locationData': 'Location Data (GPS coordinates with your permission)',
    'privacy.healthInfo': 'Health Information (dementia care-related data)',
    'privacy.useOfData': 'Use of Data',
    'privacy.section3': 'The Dementia Care Application uses the collected data for various purposes:',
    'privacy.provideService': 'To provide and maintain our Service',
    'privacy.notifyChanges': 'To notify you about changes to our Service',
    'privacy.interactiveFeatures': 'To allow you to participate in interactive features',
    'privacy.customerSupport': 'To provide customer support',
    'privacy.analysis': 'To gather analysis or valuable information',
    'privacy.security': 'Security of Data',
    'privacy.section4': 'The security of your data is important to us but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal data, we cannot guarantee its absolute security.',
    'privacy.changes': 'Changes to This Privacy Policy',
    'privacy.section5': 'We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "effective date" at the top of this Privacy Policy.',
    'privacy.contact': 'Contact Us',
    'privacy.section6': 'If you have any questions about this Privacy Policy, please contact us at support@dementiacareapp.com',
    'privacy.lastUpdated': 'Last Updated: January 2026',

    // Settings Screen
    'settings.email': 'Email',
    'settings.phone': 'Phone',
    'settings.editProfile': 'Edit Profile',
    'settings.notifications': 'Notifications',
    'settings.reminderAlerts': 'Reminder Alerts',
    'settings.reminderAlertsDesc': 'Get notified about patient medication reminders',
    'settings.criticalAlerts': 'Critical Alerts',
    'settings.criticalAlertsDesc': 'Get notified about SOS and emergency alerts',
    'settings.appUpdates': 'App Updates',
    'settings.appUpdatesDesc': 'Receive notifications about app updates and new features',
    'settings.locationTracking': 'Location Tracking',
    'settings.locationTrackingDesc': 'Allow location data tracking for patient safety',
    'settings.preferences': 'Preferences',
    'settings.theme': 'Theme',
    'settings.language': 'Language',
    'settings.notificationTime': 'Notification Time',
    'settings.about': 'About',
    'settings.appVersion': 'App Version',
    'settings.termsOfService': 'Terms of Service',
    'settings.viewTerms': 'View Terms',
    'settings.privacyPolicy': 'Privacy Policy',
    'settings.viewPolicy': 'View Policy',
    'settings.logout': 'Logout',
    'settings.logoutConfirm': 'Are you sure you want to logout?',
    'settings.logoutError': 'Failed to logout. Please try again.',

    // Theme Screen
    'theme.chooseTheme': 'Choose Theme',
    'theme.light': 'Light Theme',
    'theme.dark': 'Dark Theme',
    'theme.auto': 'Auto (System)',
    'theme.saved': 'Theme preference saved and applied!',
    'theme.failedToSave': 'Failed to save theme preference',  },

  'es': {
    // Common
    'common.ok': 'OK',
    'common.cancel': 'Cancelar',
    'common.save': 'Guardar',
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.success': 'Éxito',

    // Dashboard
    'dashboard.title': 'Panel de Control',
    'dashboard.subtitle': 'Administra tus pacientes',
    'dashboard.recentAlerts': 'Alertas Recientes',
    'dashboard.yourPatients': 'Tus Pacientes',
    'dashboard.noPatients': 'Sin pacientes asignados',
    'dashboard.activity': 'Actividad',
    'dashboard.location': 'Ubicación',
    'dashboard.failedToLoad': 'Error al cargar el panel',
    'dashboard.couldNotOpenMaps': 'No se pudo abrir Google Maps',

    // SOS Alerts
    'sos.emergency': 'Alerta SOS de Emergencia',
    'sos.triggered': 'El paciente ha activado una alerta SOS de emergencia',
    'sos.critical': 'CRÍTICO',
    'sos.viewOnMap': 'Ver en Mapa',

    // Location
    'location.title': 'Ubicación del Paciente',
    'location.viewOnMap': 'Ver en Mapa',
    'location.openMaps': 'Abrir en Google Maps',
    'location.openMapsDescription': 'Abra la ubicación en Google Maps para una navegación detallada',
    'location.currentLocation': 'Ubicación Actual',
    'location.address': 'Dirección',
    'location.coordinates': 'Coordenadas',
    'location.accuracy': 'Precisión',
    'location.lastUpdated': 'Última Actualización',
    'location.refreshLocation': 'Actualizar Ubicación',
    'location.history': 'Historial de Ubicación',
    'location.noHistory': 'Sin historial de ubicación disponible',
    'location.safeZones': 'Zonas Seguras',
    'location.radius': 'Radio',
    'location.couldNotOpenMaps': 'No se pudo abrir Google Maps',

    // Settings
    'settings.title': 'Configuración',
    'settings.language': 'Idioma',
    'settings.selectLanguage': 'Seleccionar Idioma',
    'settings.saveChanges': 'Guardar Cambios',
    'settings.languageSaved': '¡Preferencia de idioma guardada!',    'settings.failedToSave': 'No se pudo guardar la preferencia de idioma',
    'settings.english': 'English',
    'settings.spanish': 'Español',
    'settings.french': 'Français',
    'settings.german': 'Deutsch',
    // Status
    'status.active': 'Activo',
    'status.idle': 'Inactivo',
    'status.offline': 'Desconectado',

    // Time
    'time.justNow': 'hace poco',
    'time.minutesAgo': 'hace {{count}} minutos',
    'time.hoursAgo': 'hace {{count}} horas',
    'time.daysAgo': 'hace {{count}} días',
    'time.aWeekAgo': 'hace una semana',

    // Activity
    'activity.title': 'Actividad',
    'activity.logActivity': 'Registrar Actividad',
    'activity.createReminder': 'Crear Recordatorio',
    'activity.noActivities': 'No hay actividades',
    'activity.today': 'Hoy',
    'activity.week': 'Esta Semana',
    'activity.allTime': 'Todo el Tiempo',
    'activity.activityTitle': 'Título de Actividad',
    'activity.description': 'Descripción',
    'activity.activityType': 'Tipo de Actividad',
    'activity.reminderTitle': 'Título del Recordatorio',
    'activity.reminderType': 'Tipo de Recordatorio',
    'activity.addActivity': 'Agregar Actividad',
    'activity.success': 'Éxito',
    'activity.addActivitySuccess': 'Actividad agregada exitosamente',
    'activity.createReminderSuccess': 'Recordatorio creado exitosamente',
    'activity.validationError': 'Validación',
    'activity.pleaseEnterTitle': 'Por favor ingrese el título de la actividad',
    'activity.pleaseEnterReminderTitle': 'Por favor ingrese el título del recordatorio',
    'activity.failedToAdd': 'Error al agregar actividad',
    'activity.failedToCreate': 'Error al crear recordatorio',
    'activity.placeholderMorningWalk': 'p. ej., Caminata Matutina',
    'activity.placeholderAddDetails': 'Agregue detalles sobre la actividad',
    'activity.placeholderReminder': 'p. ej., Tomar Medicamento',
    'activity.placeholderReminderDetails': 'Agregue detalles sobre el recordatorio',

    // Profile
    'profile.personalInformation': 'Información Personal',
    'profile.fullName': 'Nombre Completo',
    'profile.enterFullName': 'Ingrese su nombre completo',
    'profile.phone': 'Número de Teléfono',
    'profile.enterPhone': 'Ingrese su número de teléfono',
    'profile.accessibilitySettings': 'Configuración de Accesibilidad',
    'profile.fontSize': 'Tamaño de Fuente',
    'profile.fontSizeDefault': 'Tamaño de fuente (predeterminado: 16)',
    'profile.currentSize': 'Tamaño actual: {{size}}px',
    'profile.highContrastMode': 'Modo de Alto Contraste',
    'profile.improveReadability': 'Mejora la legibilidad con mayor contraste de colores',
    'profile.nameRequired': 'El nombre es requerido',
    'profile.profileUpdated': 'Perfil actualizado',
    'profile.failedToUpdate': 'Error al actualizar el perfil',
    'profile.saveChanges': 'Guardar Cambios',
    'profile.saving': 'Guardando...',
    // Notifications
    'notifications.schedule': 'Cronograma de Notificaciones',
    'notifications.startTime': 'Hora de Inicio',
    'notifications.endTime': 'Hora de Finalización',
    'notifications.helperText': 'Las notificaciones solo se enviarán entre estas horas',
    'notifications.invalidTimeRange': 'Rango de Tiempo Inválido',
    'notifications.endTimeAfterStart': 'La hora de finalización debe ser al menos 1 minuto después de la hora de inicio',
    'notifications.saved': '¡Hora de notificación guardada!',
    'notifications.failedToSave': 'Error al guardar la hora de notificación',
    'notifications.hour': 'Hora',
    'notifications.minute': 'Minuto',
    'notifications.period': 'Período',
    'notifications.selectTime': 'Seleccionar Hora',

    // Privacy Policy
    'privacy.title': 'Política de Privacidad',
    'privacy.intro': 'Introducción',
    'privacy.section1': 'La Aplicación de Cuidado de Demencia ("nosotros" u "nuestro") opera la aplicación móvil Dementia Care (el "Servicio"). Esta página le informa sobre nuestras políticas respecto a la recopilación, uso y divulgación de datos personales cuando utiliza nuestro Servicio y las opciones que tiene asociadas con esos datos.',
    'privacy.collection': 'Recopilación y Uso de Información',
    'privacy.section2': 'Recopilamos varios tipos diferentes de información para diversos propósitos con el fin de proporcionarle y mejorar nuestro Servicio.',
    'privacy.typesOfData': 'Tipos de datos recopilados:',
    'privacy.personalInfo': 'Información Personal (nombre, correo electrónico, teléfono, dirección)',
    'privacy.usageData': 'Datos de Uso (cómo interactúa con la aplicación)',
    'privacy.locationData': 'Datos de Ubicación (coordenadas GPS con su permiso)',
    'privacy.healthInfo': 'Información de Salud (datos relacionados con el cuidado de la demencia)',
    'privacy.useOfData': 'Uso de Datos',
    'privacy.section3': 'La Aplicación de Cuidado de Demencia utiliza los datos recopilados para varios propósitos:',
    'privacy.provideService': 'Para proporcionar y mantener nuestro Servicio',
    'privacy.notifyChanges': 'Para notificarle cambios en nuestro Servicio',
    'privacy.interactiveFeatures': 'Para permitirle participar en funciones interactivas',
    'privacy.customerSupport': 'Para proporcionar soporte al cliente',
    'privacy.analysis': 'Para recopilar análisis o información valiosa',
    'privacy.security': 'Seguridad de Datos',
    'privacy.section4': 'La seguridad de sus datos es importante para nosotros, pero recuerde que ningún método de transmisión por Internet o método de almacenamiento electrónico es 100% seguro. Aunque nos esforzamos por utilizar medios comercialmente aceptables para proteger sus datos personales, no podemos garantizar su seguridad absoluta.',
    'privacy.changes': 'Cambios en Esta Política de Privacidad',
    'privacy.section5': 'Podemos actualizar nuestra Política de Privacidad de vez en cuando. Le notificaremos de cualquier cambio publicando la nueva Política de Privacidad en esta página y actualizando la "fecha efectiva" en la parte superior de esta Política de Privacidad.',
    'privacy.contact': 'Contáctenos',
    'privacy.section6': 'Si tiene alguna pregunta sobre esta Política de Privacidad, comuníquese con nosotros en support@dementiacareapp.com',
    'privacy.lastUpdated': 'Última Actualización: Enero 2026',

    // Settings Screen
    'settings.email': 'Correo Electrónico',
    'settings.phone': 'Teléfono',
    'settings.editProfile': 'Editar Perfil',
    'settings.notifications': 'Notificaciones',
    'settings.reminderAlerts': 'Alertas de Recordatorio',
    'settings.reminderAlertsDesc': 'Reciba notificaciones sobre recordatorios de medicamentos del paciente',
    'settings.criticalAlerts': 'Alertas Críticas',
    'settings.criticalAlertsDesc': 'Reciba notificaciones sobre alertas SOS y de emergencia',
    'settings.appUpdates': 'Actualizaciones de Aplicación',
    'settings.appUpdatesDesc': 'Reciba notificaciones sobre actualizaciones de la aplicación y nuevas características',
    'settings.locationTracking': 'Seguimiento de Ubicación',
    'settings.locationTrackingDesc': 'Permitir el seguimiento de datos de ubicación para la seguridad del paciente',
    'settings.preferences': 'Preferencias',
    'settings.theme': 'Tema',
    'settings.language': 'Idioma',
    'settings.notificationTime': 'Hora de Notificación',
    'settings.about': 'Acerca de',
    'settings.appVersion': 'Versión de la Aplicación',
    'settings.termsOfService': 'Términos de Servicio',
    'settings.viewTerms': 'Ver Términos',
    'settings.privacyPolicy': 'Política de Privacidad',
    'settings.viewPolicy': 'Ver Política',
    'settings.logout': 'Cerrar Sesión',
    'settings.logoutConfirm': '¿Está seguro de que desea cerrar la sesión?',
    'settings.logoutError': 'Error al cerrar la sesión. Por favor, inténtelo de nuevo.',

    // Theme Screen
    'theme.chooseTheme': 'Elegir Tema',
    'theme.light': 'Tema Claro',
    'theme.dark': 'Tema Oscuro',
    'theme.auto': 'Automático (Sistema)',
    'theme.saved': '¡Preferencia de tema guardada y aplicada!',
    'theme.failedToSave': 'Error al guardar la preferencia del tema',  },

  'fr': {
    // Common
    'common.ok': 'OK',
    'common.cancel': 'Annuler',
    'common.save': 'Enregistrer',
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.success': 'Succès',

    // Dashboard
    'dashboard.title': 'Tableau de Bord',
    'dashboard.subtitle': 'Gérez vos patients',
    'dashboard.recentAlerts': 'Alertes Récentes',
    'dashboard.yourPatients': 'Vos Patients',
    'dashboard.noPatients': 'Aucun patient assigné',
    'dashboard.activity': 'Activité',
    'dashboard.location': 'Localisation',
    'dashboard.failedToLoad': 'Erreur lors du chargement du tableau de bord',
    'dashboard.couldNotOpenMaps': 'Impossible d\'ouvrir Google Maps',

    // SOS Alerts
    'sos.emergency': 'Alerte SOS d\'Urgence',
    'sos.triggered': 'Le patient a déclenché une alerte SOS d\'urgence',
    'sos.critical': 'CRITIQUE',
    'sos.viewOnMap': 'Voir sur la Carte',

    // Location
    'location.title': 'Localisation du Patient',
    'location.viewOnMap': 'Voir sur la Carte',
    'location.openMaps': 'Ouvrir dans Google Maps',
    'location.openMapsDescription': 'Ouvrir le lieu dans Google Maps pour une navigation détaillée',
    'location.currentLocation': 'Localisation Actuelle',
    'location.address': 'Adresse',
    'location.coordinates': 'Coordonnées',
    'location.accuracy': 'Précision',
    'location.lastUpdated': 'Dernière Mise à Jour',
    'location.refreshLocation': 'Actualiser la Localisation',
    'location.history': 'Historique de Localisation',
    'location.noHistory': 'Aucun historique de localisation disponible',
    'location.safeZones': 'Zones de Sécurité',
    'location.radius': 'Rayon',
    'location.couldNotOpenMaps': 'Impossible d\'ouvrir Google Maps',

    // Settings
    'settings.title': 'Paramètres',
    'settings.language': 'Langue',
    'settings.selectLanguage': 'Sélectionner la Langue',
    'settings.saveChanges': 'Enregistrer les Modifications',
    'settings.languageSaved': 'Préférence de langue enregistrée!',    'settings.failedToSave': 'Impossible d\'enregistrer la préférence de langue',
    'settings.english': 'English',
    'settings.spanish': 'Español',
    'settings.french': 'Français',
    'settings.german': 'Deutsch',
    // Status
    'status.active': 'Actif',
    'status.idle': 'Inactif',
    'status.offline': 'Hors Ligne',

    // Time
    'time.justNow': 'à l\'instant',
    'time.minutesAgo': 'il y a {{count}} minutes',
    'time.hoursAgo': 'il y a {{count}} heures',
    'time.daysAgo': 'il y a {{count}} jours',
    'time.aWeekAgo': 'il y a une semaine',

    // Activity
    'activity.title': 'Activité',
    'activity.logActivity': 'Enregistrer Activité',
    'activity.createReminder': 'Créer Rappel',
    'activity.noActivities': 'Aucune activité trouvée',
    'activity.today': 'Aujourd\'hui',
    'activity.week': 'Cette Semaine',
    'activity.allTime': 'Tout le Temps',
    'activity.activityTitle': 'Titre de l\'Activité',
    'activity.description': 'Description',
    'activity.activityType': 'Type d\'Activité',
    'activity.reminderTitle': 'Titre du Rappel',
    'activity.reminderType': 'Type de Rappel',
    'activity.addActivity': 'Ajouter Activité',
    'activity.success': 'Succès',
    'activity.addActivitySuccess': 'Activité ajoutée avec succès',
    'activity.createReminderSuccess': 'Rappel créé avec succès',
    'activity.validationError': 'Validation',
    'activity.pleaseEnterTitle': 'Veuillez entrer le titre de l\'activité',
    'activity.pleaseEnterReminderTitle': 'Veuillez entrer le titre du rappel',
    'activity.failedToAdd': 'Erreur lors de l\'ajout d\'activité',
    'activity.failedToCreate': 'Erreur lors de la création du rappel',
    'activity.placeholderMorningWalk': 'p. ex., Promenade Matinale',
    'activity.placeholderAddDetails': 'Ajouter des détails sur l\'activité',
    'activity.placeholderReminder': 'p. ex., Prendre un Médicament',
    'activity.placeholderReminderDetails': 'Ajouter des détails sur le rappel',

    // Profile
    'profile.personalInformation': 'Informations Personnelles',
    'profile.fullName': 'Nom Complet',
    'profile.enterFullName': 'Entrez votre nom complet',
    'profile.phone': 'Numéro de Téléphone',
    'profile.enterPhone': 'Entrez votre numéro de téléphone',
    'profile.accessibilitySettings': 'Paramètres d\'Accessibilité',
    'profile.fontSize': 'Taille de Police',
    'profile.fontSizeDefault': 'Taille de police (par défaut: 16)',
    'profile.currentSize': 'Taille actuelle: {{size}}px',
    'profile.highContrastMode': 'Mode de Contraste Élevé',
    'profile.improveReadability': 'Améliore la lisibilité avec un contraste de couleur plus fort',
    'profile.nameRequired': 'Le nom est requis',
    'profile.profileUpdated': 'Profil mis à jour',
    'profile.failedToUpdate': 'Erreur lors de la mise à jour du profil',
    'profile.saveChanges': 'Enregistrer les Modifications',
    'profile.saving': 'Enregistrement...',
    // Notifications
    'notifications.schedule': 'Calendrier des Notifications',
    'notifications.startTime': 'Heure de Début',
    'notifications.endTime': 'Heure de Fin',
    'notifications.helperText': 'Les notifications ne seront envoyées que pendant ces heures',
    'notifications.invalidTimeRange': 'Plage Horaire Invalide',
    'notifications.endTimeAfterStart': 'L\'heure de fin doit être au moins 1 minute après l\'heure de début',
    'notifications.saved': 'Heure de notification enregistrée!',
    'notifications.failedToSave': 'Erreur lors de l\'enregistrement de l\'heure de notification',
    'notifications.hour': 'Heure',
    'notifications.minute': 'Minute',
    'notifications.period': 'Période',
    'notifications.selectTime': 'Sélectionner l\'Heure',

    // Privacy Policy
    'privacy.title': 'Politique de Confidentialité',
    'privacy.intro': 'Introduction',
    'privacy.section1': 'L\'Application de Soins de la Démence ("nous", "notre") exploite l\'application mobile Dementia Care (le "Service"). Cette page vous informe sur nos politiques concernant la collecte, l\'utilisation et la divulgation de données personnelles lorsque vous utilisez notre Service et les choix dont vous disposez en relation avec ces données.',
    'privacy.collection': 'Collecte et Utilisation des Informations',
    'privacy.section2': 'Nous collectons plusieurs types d\'informations différentes à diverses fins pour vous fournir et améliorer notre Service.',
    'privacy.typesOfData': 'Types de données collectées:',
    'privacy.personalInfo': 'Informations Personnelles (nom, email, téléphone, adresse)',
    'privacy.usageData': 'Données d\'Utilisation (comment vous interagissez avec l\'application)',
    'privacy.locationData': 'Données de Localisation (coordonnées GPS avec votre permission)',
    'privacy.healthInfo': 'Informations de Santé (données relatives aux soins de la démence)',
    'privacy.useOfData': 'Utilisation des Données',
    'privacy.section3': 'L\'Application de Soins de la Démence utilise les données collectées à plusieurs fins:',
    'privacy.provideService': 'Pour fournir et maintenir notre Service',
    'privacy.notifyChanges': 'Pour vous informer des modifications à notre Service',
    'privacy.interactiveFeatures': 'Pour vous permettre de participer à des fonctionnalités interactives',
    'privacy.customerSupport': 'Pour fournir un support client',
    'privacy.analysis': 'Pour collecter des analyses ou des informations précieuses',
    'privacy.security': 'Sécurité des Données',
    'privacy.section4': 'La sécurité de vos données nous est importante, mais rappelez-vous qu\'aucune méthode de transmission sur Internet ou méthode de stockage électronique n\'est 100% sécurisée. Bien que nous nous efforçons d\'utiliser des moyens commercialement acceptables pour protéger vos données personnelles, nous ne pouvons pas garantir sa sécurité absolue.',
    'privacy.changes': 'Modifications de Cette Politique de Confidentialité',
    'privacy.section5': 'Nous pouvons mettre à jour notre Politique de Confidentialité de temps en temps. Nous vous informerons de tout changement en publiant la nouvelle Politique de Confidentialité sur cette page et en mettant à jour la "date effective" en haut de cette Politique de Confidentialité.',
    'privacy.contact': 'Nous Contacter',
    'privacy.section6': 'Si vous avez des questions sur cette Politique de Confidentialité, veuillez nous contacter à support@dementiacareapp.com',
    'privacy.lastUpdated': 'Dernière Mise à Jour: Janvier 2026',

    // Settings Screen
    'settings.email': 'Email',
    'settings.phone': 'Téléphone',
    'settings.editProfile': 'Éditer le Profil',
    'settings.notifications': 'Notifications',
    'settings.reminderAlerts': 'Alertes de Rappel',
    'settings.reminderAlertsDesc': 'Recevez des notifications sur les rappels de médicaments du patient',
    'settings.criticalAlerts': 'Alertes Critiques',
    'settings.criticalAlertsDesc': 'Recevez des notifications sur les alertes SOS et d\'urgence',
    'settings.appUpdates': 'Mises à Jour de l\'Application',
    'settings.appUpdatesDesc': 'Recevez des notifications sur les mises à jour et les nouvelles fonctionnalités de l\'application',
    'settings.locationTracking': 'Suivi de Localisation',
    'settings.locationTrackingDesc': 'Autoriser le suivi des données de localisation pour la sécurité du patient',
    'settings.preferences': 'Préférences',
    'settings.theme': 'Thème',
    'settings.language': 'Langue',
    'settings.notificationTime': 'Heure de Notification',
    'settings.about': 'À Propos',
    'settings.appVersion': 'Version de l\'Application',
    'settings.termsOfService': 'Conditions d\'Utilisation',
    'settings.viewTerms': 'Voir les Conditions',
    'settings.privacyPolicy': 'Politique de Confidentialité',
    'settings.viewPolicy': 'Voir la Politique',
    'settings.logout': 'Déconnexion',
    'settings.logoutConfirm': 'Êtes-vous sûr de vouloir vous déconnecter?',
    'settings.logoutError': 'Erreur lors de la déconnexion. Veuillez réessayer.',

    // Theme Screen
    'theme.chooseTheme': 'Choisir un Thème',
    'theme.light': 'Thème Clair',
    'theme.dark': 'Thème Sombre',
    'theme.auto': 'Automatique (Système)',
    'theme.saved': 'Préférence de thème enregistrée et appliquée!',
    'theme.failedToSave': 'Erreur lors de l\'enregistrement de la préférence de thème',  },

  'de': {
    // Common
    'common.ok': 'OK',
    'common.cancel': 'Abbrechen',
    'common.save': 'Speichern',
    'common.loading': 'Wird geladen...',
    'common.error': 'Fehler',
    'common.success': 'Erfolg',

    // Dashboard
    'dashboard.title': 'Pflegepanel',
    'dashboard.subtitle': 'Verwalten Sie Ihre Patienten',
    'dashboard.recentAlerts': 'Aktuelle Warnungen',
    'dashboard.yourPatients': 'Ihre Patienten',
    'dashboard.noPatients': 'Keine Patienten zugewiesen',
    'dashboard.activity': 'Aktivität',
    'dashboard.location': 'Standort',
    'dashboard.failedToLoad': 'Fehler beim Laden des Panels',
    'dashboard.couldNotOpenMaps': 'Google Maps konnte nicht geöffnet werden',

    // SOS Alerts
    'sos.emergency': 'SOS-Notfall-Warnung',
    'sos.triggered': 'Patient hat eine SOS-Notfall-Warnung ausgelöst',
    'sos.critical': 'KRITISCH',
    'sos.viewOnMap': 'Auf Karte Anzeigen',

    // Location
    'location.title': 'Patientenstandort',
    'location.viewOnMap': 'Auf Karte Anzeigen',
    'location.openMaps': 'In Google Maps Öffnen',
    'location.openMapsDescription': 'Standort in Google Maps für detaillierte Navigation öffnen',
    'location.currentLocation': 'Aktueller Standort',
    'location.address': 'Adresse',
    'location.coordinates': 'Koordinaten',
    'location.accuracy': 'Genauigkeit',
    'location.lastUpdated': 'Zuletzt Aktualisiert',
    'location.refreshLocation': 'Standort Aktualisieren',
    'location.history': 'Standortverlauf',
    'location.noHistory': 'Kein Standortverlauf verfügbar',
    'location.safeZones': 'Sichere Zonen',
    'location.radius': 'Radius',
    'location.couldNotOpenMaps': 'Google Maps konnte nicht geöffnet werden',

    // Settings
    'settings.title': 'Einstellungen',
    'settings.language': 'Sprache',
    'settings.selectLanguage': 'Sprache Auswählen',
    'settings.saveChanges': 'Änderungen Speichern',
    'settings.languageSaved': 'Spracheinstellung gespeichert!',    'settings.failedToSave': 'Spracheinstellung konnte nicht gespeichert werden',
    'settings.english': 'English',
    'settings.spanish': 'Español',
    'settings.french': 'Français',
    'settings.german': 'Deutsch',
    // Status
    'status.active': 'Aktiv',
    'status.idle': 'Untätig',
    'status.offline': 'Offline',

    // Time
    'time.justNow': 'gerade eben',
    'time.minutesAgo': 'vor {{count}} Minuten',
    'time.hoursAgo': 'vor {{count}} Stunden',
    'time.daysAgo': 'vor {{count}} Tagen',
    'time.aWeekAgo': 'vor einer Woche',

    // Activity
    'activity.title': 'Aktivität',
    'activity.logActivity': 'Aktivität Protokollieren',
    'activity.createReminder': 'Erinnerung Erstellen',
    'activity.noActivities': 'Keine Aktivitäten gefunden',
    'activity.today': 'Heute',
    'activity.week': 'Diese Woche',
    'activity.allTime': 'Immer',
    'activity.activityTitle': 'Aktivitätstitel',
    'activity.description': 'Beschreibung',
    'activity.activityType': 'Aktivitätstyp',
    'activity.reminderTitle': 'Erinnerungstitel',
    'activity.reminderType': 'Erinnerungstyp',
    'activity.addActivity': 'Aktivität Hinzufügen',
    'activity.success': 'Erfolg',
    'activity.addActivitySuccess': 'Aktivität erfolgreich hinzugefügt',
    'activity.createReminderSuccess': 'Erinnerung erfolgreich erstellt',
    'activity.validationError': 'Validierung',
    'activity.pleaseEnterTitle': 'Bitte geben Sie einen Aktivitätstitel ein',
    'activity.pleaseEnterReminderTitle': 'Bitte geben Sie einen Erinnerungstitel ein',
    'activity.failedToAdd': 'Fehler beim Hinzufügen der Aktivität',
    'activity.failedToCreate': 'Fehler beim Erstellen der Erinnerung',
    'activity.placeholderMorningWalk': 'z. B. Morgenwanderung',
    'activity.placeholderAddDetails': 'Fügen Sie Details zur Aktivität hinzu',
    'activity.placeholderReminder': 'z. B. Medikament Einnehmen',
    'activity.placeholderReminderDetails': 'Fügen Sie Details zur Erinnerung hinzu',

    // Profile
    'profile.personalInformation': 'Persönliche Informationen',
    'profile.fullName': 'Vollständiger Name',
    'profile.enterFullName': 'Geben Sie Ihren vollständigen Namen ein',
    'profile.phone': 'Telefonnummer',
    'profile.enterPhone': 'Geben Sie Ihre Telefonnummer ein',
    'profile.accessibilitySettings': 'Eingabehilfen',
    'profile.fontSize': 'Schriftgröße',
    'profile.fontSizeDefault': 'Schriftgröße (Standard: 16)',
    'profile.currentSize': 'Aktuelle Größe: {{size}}px',
    'profile.highContrastMode': 'Modus mit hohem Kontrast',
    'profile.improveReadability': 'Verbessert die Lesbarkeit mit stärkerem Farbkontrast',
    'profile.nameRequired': 'Name ist erforderlich',
    'profile.profileUpdated': 'Profil aktualisiert',
    'profile.failedToUpdate': 'Fehler beim Aktualisieren des Profils',
    'profile.saveChanges': 'Änderungen Speichern',
    'profile.saving': 'Wird gespeichert...',

    // Notifications
    'notifications.schedule': 'Benachrichtigungsplan',
    'notifications.startTime': 'Startzeit',
    'notifications.endTime': 'Endzeit',
    'notifications.helperText': 'Benachrichtigungen werden nur zwischen diesen Zeiten gesendet',
    'notifications.invalidTimeRange': 'Ungültiger Zeitbereich',
    'notifications.endTimeAfterStart': 'Die Endzeit muss mindestens 1 Minute nach der Startzeit liegen',
    'notifications.saved': 'Benachrichtigungszeit gespeichert!',
    'notifications.failedToSave': 'Fehler beim Speichern der Benachrichtigungszeit',
    'notifications.hour': 'Stunde',
    'notifications.minute': 'Minute',
    'notifications.period': 'Zeitraum',
    'notifications.selectTime': 'Zeit Auswählen',

    // Privacy Policy
    'privacy.title': 'Datenschutzrichtlinie',
    'privacy.intro': 'Einführung',
    'privacy.section1': 'Die Dementia Care-Anwendung ("wir", "unser") betreibt die Dementia Care-Mobilanwendung (der "Dienst"). Diese Seite informiert Sie über unsere Richtlinien bezüglich der Erfassung, Verwendung und Offenlegung personenbezogener Daten, wenn Sie unseren Dienst nutzen, und die damit verbundenen Wahlmöglichkeiten.',
    'privacy.collection': 'Informationserfassung und -verwendung',
    'privacy.section2': 'Wir erfassen verschiedene Arten von Informationen für verschiedene Zwecke, um unseren Dienst bereitzustellen und zu verbessern.',
    'privacy.typesOfData': 'Erfasste Datentypen:',
    'privacy.personalInfo': 'Persönliche Informationen (Name, E-Mail, Telefon, Adresse)',
    'privacy.usageData': 'Nutzungsdaten (wie Sie mit der Anwendung interagieren)',
    'privacy.locationData': 'Standortdaten (GPS-Koordinaten mit Ihrer Zustimmung)',
    'privacy.healthInfo': 'Gesundheitsinformationen (Daten zur Demenzbetreuung)',
    'privacy.useOfData': 'Verwendung von Daten',
    'privacy.section3': 'Die Dementia Care-Anwendung verwendet die erfassten Daten für verschiedene Zwecke:',
    'privacy.provideService': 'Um unseren Dienst bereitzustellen und zu warten',
    'privacy.notifyChanges': 'Um Sie über Änderungen an unserem Dienst zu benachrichtigen',
    'privacy.interactiveFeatures': 'Um Sie die Teilnahme an interaktiven Funktionen zu ermöglichen',
    'privacy.customerSupport': 'Um Kundenunterstützung zu leisten',
    'privacy.analysis': 'Um Analysen oder wertvolle Informationen zu sammeln',
    'privacy.security': 'Datensicherheit',
    'privacy.section4': 'Die Sicherheit Ihrer Daten ist uns wichtig, aber beachten Sie, dass keine Übertragungsmethode über das Internet oder elektronische Speichermethode zu 100% sicher ist. Obwohl wir uns bemühen, handelsübliche Mittel zum Schutz Ihrer personenbezogenen Daten zu verwenden, können wir deren absolute Sicherheit nicht garantieren.',
    'privacy.changes': 'Änderungen dieser Datenschutzrichtlinie',
    'privacy.section5': 'Wir können unsere Datenschutzrichtlinie von Zeit zu Zeit aktualisieren. Wir werden Sie über Änderungen benachrichtigen, indem wir die neue Datenschutzrichtlinie auf dieser Seite veröffentlichen und das "Gültig ab"-Datum oben in dieser Datenschutzrichtlinie aktualisieren.',
    'privacy.contact': 'Kontaktieren Sie Uns',
    'privacy.section6': 'Wenn Sie Fragen zu dieser Datenschutzrichtlinie haben, wenden Sie sich bitte unter support@dementiacareapp.com an uns',
    'privacy.lastUpdated': 'Zuletzt aktualisiert: Januar 2026',

    // Settings Screen
    'settings.email': 'E-Mail',
    'settings.phone': 'Telefon',
    'settings.editProfile': 'Profil Bearbeiten',
    'settings.notifications': 'Benachrichtigungen',
    'settings.reminderAlerts': 'Erinnerungswarnungen',
    'settings.reminderAlertsDesc': 'Erhalten Sie Benachrichtigungen über Medikamentenerinnerungen für Patienten',
    'settings.criticalAlerts': 'Kritische Warnungen',
    'settings.criticalAlertsDesc': 'Erhalten Sie Benachrichtigungen über SOS- und Notfallwarnungen',
    'settings.appUpdates': 'App-Updates',
    'settings.appUpdatesDesc': 'Erhalten Sie Benachrichtigungen über App-Updates und neue Funktionen',
    'settings.locationTracking': 'Standortverfolgung',
    'settings.locationTrackingDesc': 'Ermöglichen Sie die Standortverfolgung für die Patientensicherheit',
    'settings.preferences': 'Einstellungen',
    'settings.theme': 'Thema',
    'settings.language': 'Sprache',
    'settings.notificationTime': 'Benachrichtigungszeit',
    'settings.about': 'Über',
    'settings.appVersion': 'App-Version',
    'settings.termsOfService': 'Nutzungsbedingungen',
    'settings.viewTerms': 'Bedingungen Anzeigen',
    'settings.privacyPolicy': 'Datenschutzrichtlinie',
    'settings.viewPolicy': 'Richtlinie Anzeigen',
    'settings.logout': 'Abmelden',
    'settings.logoutConfirm': 'Sind Sie sicher, dass Sie sich abmelden möchten?',
    'settings.logoutError': 'Fehler beim Abmelden. Bitte versuchen Sie es erneut.',

    // Theme Screen
    'theme.chooseTheme': 'Design Auswählen',
    'theme.light': 'Helles Design',
    'theme.dark': 'Dunkles Design',
    'theme.auto': 'Automatisch (System)',
    'theme.saved': 'Design-Einstellung gespeichert und angewendet!',
    'theme.failedToSave': 'Fehler beim Speichern der Design-Einstellung',
  },
};

// Language state
let currentLanguage = 'en';

/**
 * Initialize i18n with saved language preference
 */
export const initializeI18n = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem('preference_language');
    if (savedLanguage && translations[savedLanguage.toLowerCase()]) {
      currentLanguage = savedLanguage.toLowerCase();
      console.log('[i18nService] Initialized with language:', savedLanguage);
    } else {
      currentLanguage = 'en';
    }
  } catch (error) {
    console.error('[i18nService] Error initializing i18n:', error);
    currentLanguage = 'en';
  }
};

/**
 * Get translated string
 * @param {string} key - Translation key (e.g., 'dashboard.title')
 * @param {object} options - Options for interpolation
 * @returns {string} Translated string
 */
export const t = (key, options = {}) => {
  try {
    // Get the translation from current language
    const langTranslations = translations[currentLanguage];
    let translation = langTranslations?.[key];

    // Fallback to English if not found
    if (!translation) {
      translation = translations['en']?.[key];
    }

    // If still not found, return the key itself
    if (!translation) {
      console.warn(`[i18nService] Missing translation for key: ${key}`);
      return key;
    }

    // Handle interpolation (e.g., {{count}})
    if (options && Object.keys(options).length > 0) {
      let interpolated = translation;
      Object.keys(options).forEach((optionKey) => {
        const placeholder = `{{${optionKey}}}`;
        interpolated = interpolated.replace(placeholder, options[optionKey]);
      });
      return interpolated;
    }

    return translation;
  } catch (error) {
    console.error(`[i18nService] Error translating key ${key}:`, error);
    return key;
  }
};

/**
 * Set language
 * @param {string} language - Language code ('en', 'es', 'fr', 'de')
 */
export const setLanguage = async (language) => {
  try {
    const langCode = language.toLowerCase();
    if (translations[langCode]) {
      currentLanguage = langCode;
      await AsyncStorage.setItem('preference_language', langCode);
      console.log('[i18nService] Language set to:', langCode);
      return true;
    }
    console.warn(`[i18nService] Unsupported language: ${language}`);
    return false;
  } catch (error) {
    console.error('[i18nService] Error setting language:', error);
    return false;
  }
};

/**
 * Get current language
 * @returns {string} Current language code
 */
export const getCurrentLanguage = () => {
  return currentLanguage;
};

/**
 * Get available languages
 * @returns {array} Array of available language codes
 */
export const getAvailableLanguages = () => {
  return Object.keys(translations);
};

export default {
  t,
  setLanguage,
  getCurrentLanguage,
  getAvailableLanguages,
  initializeI18n,
};
