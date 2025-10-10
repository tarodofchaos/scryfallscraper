import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  en: {
    translation: {
      // Header
      "app.title": "MTG Marketplace",
      "app.tagline": "Trade • Collect • Discover",
      "nav.search": "Search",
      "nav.inventory": "Inventory", 
      "nav.marketplace": "Marketplace",
      "auth.login": "Login with Google",
      "auth.logout": "Logout",
      
      // Search
      "search.title": "Discover Magic Cards",
      "search.subtitle": "Search through thousands of Magic: The Gathering cards",
      "search.placeholder": "Search for cards (e.g., lightning bolt set:m11)",
      "search.button": "Search",
      "search.loading": "Searching through thousands of cards...",
      "search.noResults": "No cards found",
      "search.noResultsSubtitle": "Try adjusting your search terms",
      "search.results": "Search Results",
      "search.resultsCount": "{{count}} card found",
      "search.resultsCount_plural": "{{count}} cards found",
      "search.suggestions.loading": "Loading suggestions...",
      "search.suggestions.noResults": "No suggestions found",
      
      // Cards
      "card.addToInventory": "Add to Inventory",
      "card.contactSeller": "Contact Seller",
      "card.available": "Available",
      "card.by": "by",
      
      // Add Card Modal
      "addCard.title": "Add Card to Collection",
      "addCard.condition": "Condition",
      "addCard.language": "Language",
      "addCard.quantity": "Quantity",
      "addCard.set": "Set",
      "addCard.setPlaceholder": "Search for a set...",
      "addCard.printing": "Select Printing",
      "addCard.addToCollection": "Add to Collection",
      "addCard.adding": "Adding...",
      
      // Inventory
      "inventory.title": "Your Collection",
      "inventory.subtitle": "Manage your Magic: The Gathering card inventory",
      "inventory.empty.title": "Your inventory is empty",
      "inventory.empty.subtitle": "Start building your collection by searching for cards",
      "inventory.empty.action": "Browse Cards",
      "inventory.refresh": "Refresh",
      "inventory.itemsCount": "{{count}} item",
      "inventory.itemsCount_plural": "{{count}} items",
      "inventory.quickList.title": "Quick List Cards",
      "inventory.quickList.subtitle": "Select a card to create a listing",
      "inventory.listForSale": "List for Sale",
      "inventory.batch": "Batch",
      "inventory.batchList.title": "Batch List Selected Cards",
      "inventory.batchList.selected": "{{count}} card selected",
      "inventory.batchList.selected_plural": "{{count}} cards selected",
      "inventory.batchList.price": "Price (EUR)",
      "inventory.batchList.quantity": "Quantity per Card",
      "inventory.batchList.action": "List All Selected Cards",
      "inventory.modal.title": "List {{cardName}}",
      "inventory.modal.price": "Price (EUR)",
      "inventory.modal.quantity": "Quantity",
      "inventory.modal.maxAvailable": "Max: {{max}} available",
      "inventory.modal.create": "List for Sale",
      "inventory.modal.creating": "Creating...",
      "inventory.modal.cancel": "Cancel",
      "inventory.delete": "Delete",
      "inventory.deleteConfirm.title": "Delete from Collection",
      "inventory.deleteConfirm.message": "This will permanently remove this card from your inventory. This action cannot be undone.",
      "inventory.deleteConfirm.delete": "Delete Permanently",
      "inventory.deleteConfirm.deleting": "Deleting...",
      "inventory.bulkDelete": "Bulk Delete",
      "inventory.bulkDelete.selected": "{{count}} item selected",
      "inventory.bulkDelete.selected_plural": "{{count}} items selected",
      "inventory.bulkDelete.confirm": "Delete Selected Items",
      "inventory.bulkDelete.confirmMessage": "This will permanently remove {{count}} item(s) from your inventory. This action cannot be undone.",
      "inventory.table.card": "Card",
      "inventory.table.set": "Set",
      "inventory.table.qty": "Qty",
      "inventory.table.cond": "Cond",
      "inventory.table.lang": "Lang",
      "inventory.table.actions": "Actions",
      
      // Listings
      "listings.delete": "Delete",
      "listings.deleteConfirm.title": "Delete Listing",
      "listings.deleteConfirm.message": "This will permanently remove this listing from the marketplace. This action cannot be undone.",
      "listings.deleteConfirm.delete": "Delete Permanently",
      "listings.deleteConfirm.deleting": "Deleting...",
      "listings.bulkDelete": "Bulk Delete",
      "listings.bulkDelete.selected": "{{count}} listing selected",
      "listings.bulkDelete.selected_plural": "{{count}} listings selected",
      "listings.bulkDelete.confirm": "Delete Selected Listings",
      "listings.bulkDelete.confirmMessage": "This will permanently remove {{count}} listing(s) from the marketplace. This action cannot be undone.",
      
      // Marketplace
      "marketplace.title": "MTG Marketplace",
      "marketplace.subtitle": "Discover and trade Magic: The Gathering cards with other collectors",
      "marketplace.empty.title": "No listings available",
      "marketplace.empty.subtitle": "Be the first to list your cards for sale",
      "marketplace.empty.action": "List Your Cards",
      "marketplace.available": "Available Cards",
      "marketplace.listingsCount": "{{count}} listing available",
      "marketplace.listingsCount_plural": "{{count}} listings available",
      
      // Common
      "common.loading": "Loading...",
      "common.error": "Error",
      "common.success": "Success",
      "common.cancel": "Cancel",
      "common.save": "Save",
      "common.delete": "Delete",
      "common.edit": "Edit",
      "common.close": "Close",
      "common.yes": "Yes",
      "common.no": "No",
      
      // Deck Import
      "deckImport.button": "Import Deck",
      "deckImport.title": "Import Deck from Online Tools",
      "deckImport.sourceLabel": "Select Source Platform",
      "deckImport.textLabel": "Paste Your Deck List",
      "deckImport.urlLabel": "Enter Deck URL",
      "deckImport.inputMode.text": "Text List",
      "deckImport.inputMode.url": "URL",
      "deckImport.placeholder": "Paste your deck list here...\n\nExample:\n1 Lightning Bolt (M11)\n4 Counterspell (LEA)\n2 Jace, the Mind Sculptor",
      "deckImport.urlPlaceholder": "Paste the URL to your deck...\n\nExample:\nhttps://archidekt.com/decks/123456",
      "deckImport.urlNote": "Note: URL fetching is not yet implemented. Please use the text list option for now.",
      "deckImport.preview.title": "Preview",
      "deckImport.preview.cards": "cards",
      "deckImport.preview.button": "Preview Cards",
      "deckImport.import.button": "Import to Inventory",
      "deckImport.importing": "Importing...",
      "deckImport.success.message": "Import completed! {{success}} cards added successfully, {{errors}} cards could not be found.",
      "deckImport.errors.emptyText": "Please enter a deck list to import.",
      "deckImport.errors.noCardsFound": "No cards found in the provided text. Please check the format.",
      "deckImport.errors.parseError": "Error parsing the deck list. Please check the format.",
      "deckImport.errors.importError": "Error importing cards. Please try again.",
      "deckImport.errors.urlNotSupported": "URL fetching is not yet implemented. Please use the text list option.",
      "deckImport.errors.urlFetchError": "Error fetching deck from URL. Please try again.",
      
      // Footer
      "footer.disclaimer": "Prices shown come from Scryfall; EUR values typically reflect Cardmarket. Not affiliated with Wizards of the Coast, Hasbro, Scryfall, or Cardmarket.",
      "footer.copyright": "© 2024 MTG Marketplace. All rights reserved."
    }
  },
  es: {
    translation: {
      // Header
      "app.title": "Mercado MTG",
      "app.tagline": "Intercambia • Colecciona • Descubre",
      "nav.search": "Buscar",
      "nav.inventory": "Inventario",
      "nav.marketplace": "Mercado",
      "auth.login": "Iniciar sesión con Google",
      "auth.logout": "Cerrar sesión",
      
      // Search
      "search.title": "Descubre Cartas Mágicas",
      "search.subtitle": "Busca entre miles de cartas de Magic: The Gathering",
      "search.placeholder": "Buscar cartas (ej., lightning bolt set:m11)",
      "search.button": "Buscar",
      "search.loading": "Buscando entre miles de cartas...",
      "search.noResults": "No se encontraron cartas",
      "search.noResultsSubtitle": "Intenta ajustar tus términos de búsqueda",
      "search.results": "Resultados de Búsqueda",
      "search.resultsCount": "{{count}} carta encontrada",
      "search.resultsCount_plural": "{{count}} cartas encontradas",
      "search.suggestions.loading": "Cargando sugerencias...",
      "search.suggestions.noResults": "No se encontraron sugerencias",
      
      // Cards
      "card.addToInventory": "Agregar al Inventario",
      "card.contactSeller": "Contactar Vendedor",
      "card.available": "Disponible",
      "card.by": "por",
      
      // Add Card Modal
      "addCard.title": "Agregar Carta a la Colección",
      "addCard.condition": "Estado",
      "addCard.language": "Idioma",
      "addCard.quantity": "Cantidad",
      "addCard.set": "Set",
      "addCard.setPlaceholder": "Buscar un set...",
      "addCard.printing": "Seleccionar Impresión",
      "addCard.addToCollection": "Agregar a la Colección",
      "addCard.adding": "Agregando...",
      
      // Inventory
      "inventory.title": "Tu Colección",
      "inventory.subtitle": "Gestiona tu inventario de cartas de Magic: The Gathering",
      "inventory.empty.title": "Tu inventario está vacío",
      "inventory.empty.subtitle": "Comienza a construir tu colección buscando cartas",
      "inventory.empty.action": "Explorar Cartas",
      "inventory.refresh": "Actualizar",
      "inventory.itemsCount": "{{count}} artículo",
      "inventory.itemsCount_plural": "{{count}} artículos",
      "inventory.quickList.title": "Listar Cartas Rápidamente",
      "inventory.quickList.subtitle": "Selecciona una carta para crear una lista",
      "inventory.listForSale": "Listar para Venta",
      "inventory.batch": "Lote",
      "inventory.batchList.title": "Listar Cartas Seleccionadas en Lote",
      "inventory.batchList.selected": "{{count}} carta seleccionada",
      "inventory.batchList.selected_plural": "{{count}} cartas seleccionadas",
      "inventory.batchList.price": "Precio (EUR)",
      "inventory.batchList.quantity": "Cantidad por Carta",
      "inventory.batchList.action": "Listar Todas las Cartas Seleccionadas",
      "inventory.modal.title": "Listar {{cardName}}",
      "inventory.modal.price": "Precio (EUR)",
      "inventory.modal.quantity": "Cantidad",
      "inventory.modal.maxAvailable": "Máx: {{max}} disponibles",
      "inventory.modal.create": "Listar para Venta",
      "inventory.modal.creating": "Creando...",
      "inventory.modal.cancel": "Cancelar",
      "inventory.delete": "Eliminar",
      "inventory.deleteConfirm.title": "Eliminar de la Colección",
      "inventory.deleteConfirm.message": "Esto eliminará permanentemente esta carta de tu inventario. Esta acción no se puede deshacer.",
      "inventory.deleteConfirm.delete": "Eliminar Permanentemente",
      "inventory.deleteConfirm.deleting": "Eliminando...",
      "inventory.bulkDelete": "Eliminación Masiva",
      "inventory.bulkDelete.selected": "{{count}} artículo seleccionado",
      "inventory.bulkDelete.selected_plural": "{{count}} artículos seleccionados",
      "inventory.bulkDelete.confirm": "Eliminar Artículos Seleccionados",
      "inventory.bulkDelete.confirmMessage": "Esto eliminará permanentemente {{count}} artículo(s) de tu inventario. Esta acción no se puede deshacer.",
      "inventory.table.card": "Carta",
      "inventory.table.set": "Set",
      "inventory.table.qty": "Cant",
      "inventory.table.cond": "Estado",
      "inventory.table.lang": "Idioma",
      "inventory.table.actions": "Acciones",
      
      // Listings
      "listings.delete": "Eliminar",
      "listings.deleteConfirm.title": "Eliminar Listado",
      "listings.deleteConfirm.message": "Esto eliminará permanentemente este listado del mercado. Esta acción no se puede deshacer.",
      "listings.deleteConfirm.delete": "Eliminar Permanentemente",
      "listings.deleteConfirm.deleting": "Eliminando...",
      "listings.bulkDelete": "Eliminación Masiva",
      "listings.bulkDelete.selected": "{{count}} listado seleccionado",
      "listings.bulkDelete.selected_plural": "{{count}} listados seleccionados",
      "listings.bulkDelete.confirm": "Eliminar Listados Seleccionados",
      "listings.bulkDelete.confirmMessage": "Esto eliminará permanentemente {{count}} listado(s) del mercado. Esta acción no se puede deshacer.",
      
      // Marketplace
      "marketplace.title": "Mercado MTG",
      "marketplace.subtitle": "Descubre e intercambia cartas de Magic: The Gathering con otros coleccionistas",
      "marketplace.empty.title": "No hay listados disponibles",
      "marketplace.empty.subtitle": "Sé el primero en listar tus cartas para la venta",
      "marketplace.empty.action": "Listar Tus Cartas",
      "marketplace.available": "Cartas Disponibles",
      "marketplace.listingsCount": "{{count}} listado disponible",
      "marketplace.listingsCount_plural": "{{count}} listados disponibles",
      
      // Common
      "common.loading": "Cargando...",
      "common.error": "Error",
      "common.success": "Éxito",
      "common.cancel": "Cancelar",
      "common.save": "Guardar",
      "common.delete": "Eliminar",
      "common.edit": "Editar",
      "common.close": "Cerrar",
      "common.yes": "Sí",
      "common.no": "No",
      
      // Deck Import
      "deckImport.button": "Importar Mazo",
      "deckImport.title": "Importar Mazo desde Herramientas Online",
      "deckImport.sourceLabel": "Seleccionar Plataforma de Origen",
      "deckImport.textLabel": "Pega tu Lista de Mazo",
      "deckImport.urlLabel": "Ingresa URL del Mazo",
      "deckImport.inputMode.text": "Lista de Texto",
      "deckImport.inputMode.url": "URL",
      "deckImport.placeholder": "Pega tu lista de mazo aquí...\n\nEjemplo:\n1 Lightning Bolt (M11)\n4 Counterspell (LEA)\n2 Jace, the Mind Sculptor",
      "deckImport.urlPlaceholder": "Pega la URL de tu mazo...\n\nEjemplo:\nhttps://archidekt.com/decks/123456",
      "deckImport.urlNote": "Nota: La obtención de URLs aún no está implementada. Por favor usa la opción de lista de texto por ahora.",
      "deckImport.preview.title": "Vista Previa",
      "deckImport.preview.cards": "cartas",
      "deckImport.preview.button": "Vista Previa de Cartas",
      "deckImport.import.button": "Importar al Inventario",
      "deckImport.importing": "Importando...",
      "deckImport.success.message": "¡Importación completada! {{success}} cartas agregadas exitosamente, {{errors}} cartas no se pudieron encontrar.",
      "deckImport.errors.emptyText": "Por favor ingresa una lista de mazo para importar.",
      "deckImport.errors.noCardsFound": "No se encontraron cartas en el texto proporcionado. Por favor verifica el formato.",
      "deckImport.errors.parseError": "Error al analizar la lista de mazo. Por favor verifica el formato.",
      "deckImport.errors.importError": "Error al importar cartas. Por favor intenta de nuevo.",
      "deckImport.errors.urlNotSupported": "La obtención de URLs aún no está implementada. Por favor usa la opción de lista de texto.",
      "deckImport.errors.urlFetchError": "Error al obtener el mazo desde la URL. Por favor intenta de nuevo.",
      
      // Footer
      "footer.disclaimer": "Los precios mostrados provienen de Scryfall; los valores en EUR típicamente reflejan Cardmarket. No afiliado con Wizards of the Coast, Hasbro, Scryfall, o Cardmarket.",
      "footer.copyright": "© 2024 Mercado MTG. Todos los derechos reservados."
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'es', // Default to Spanish
    lng: 'es', // Start with Spanish
    debug: false,
    
    interpolation: {
      escapeValue: false, // React already does escaping
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    }
  });

export default i18n;
