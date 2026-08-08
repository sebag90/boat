import { ref } from 'vue'

export const currentLocale = ref(localStorage.getItem('app_locale') || 'en')

export const setLocale = (lang) => {
  currentLocale.value = lang
  localStorage.setItem('app_locale', lang)
}

export const toggleLocale = () => {
  setLocale(currentLocale.value === 'en' ? 'it' : 'en')
}

const dictionary = {
  en: {
    // Header & Nav
    dashboard_title: "Yacht Master Dashboard",
    select_vessel: "Select Vessel",
    no_vessel_selected: "No Vessel Selected",
    register_new_vessel: "Register New Vessel",
    logout: "Logout",
    nav_logbook: "Log Book",
    nav_documents: "Documents Locker",
    nav_maintenance: "Maintenance",
    nav_todo: "To-Do list",
    nav_shopping: "Shopping Cargo",
    nav_settings: "Settings",

    // Login
    login_title: "Shipboard Login",
    login_subtitle: "Access your vessel logbook, maintenance records, and ship documents",
    username: "Username",
    password: "Password",
    sign_in: "Sign In to Fleet",
    authenticating: "Authenticating...",
    server_api_host: "Server API Host",
    save_settings: "Save Settings",

    // General Actions
    cancel: "Cancel",
    save: "Save",
    save_changes: "Save Changes",
    delete: "Delete",
    edit: "Modify / Edit",
    modify: "Modify",
    close: "Close",
    clear_all: "Clear All",
    click_to_upload: "Click to upload",
    or_drag_drop: "or drag and drop",
    selected_files: "Selected Files",
    search_placeholder: "Search...",

    // Logbook
    logbook_title: "Ship's Log Book",
    logbook_subtitle: "Record sea passages, auto-track GPS waypoints, and calculate nautical miles & speeds",
    record_new_voyage: "Record New Voyage",
    record_first_voyage: "Record First Voyage",
    total_distance_logged: "Total Distance Logged",
    no_voyages_recorded: "No Voyages Recorded Yet",
    no_voyages_sub: "Start building your vessel's logbook! Record passage origins, destinations, crew members, and live GPS waypoints.",
    voyage_passage: "Record New Passage",
    date_of_passage: "Date of Passage",
    crew_members: "Crew Members",
    start_port: "Start Port",
    goal_destination: "Goal / Destination",
    voyage_notes: "Voyage Notes & Observations",
    initial_gps_waypoint: "Initial GPS Waypoint",
    capture_gps_sub: "Capture current location as start point upon creation",
    get_gps_location: "Get GPS Location",
    location_captured: "Location Captured",
    locating: "Locating...",
    solo_voyage: "Solo Voyage",
    crew_label: "Crew",
    view_log: "View Log",
    voyage_details: "Passage Log Details",
    passage_summary: "Passage Summary & Distance",
    total_distance: "Total Distance",
    avg_speed: "Avg Speed",
    passage_time: "Passage Time",
    waypoints_recorded: "Waypoints Recorded",
    add_waypoint: "Add Waypoint Now",
    auto_gps_tracker: "Auto GPS Tracker",
    start_auto_track: "Start Auto-Tracker",
    stop_auto_track: "Stop Auto-Tracker",
    delete_voyage: "Delete Passage Log",

    // Documents
    documents_title: "Ship's Document Locker",
    documents_subtitle: "Store maintenance manuals, vessel registration, safety certs & operating guides",
    store_new_document: "Store New Document",
    store_first_document: "Store First Document",
    doc_title: "Document Title",
    doc_files: "Upload Files / Images (PDF, Docs, Images)",
    notes_details: "Notes & Details (Markdown allowed)",
    search_documents: "Case-insensitive search title, notes or filename...",
    no_documents_found: "No Documents Found",
    no_documents_sub: "No documents match your filter in the ship's locker. Click below to add manuals, guides, or certificates.",
    store_document_btn: "Store Document",

    // Maintenance
    maint_title: "Service & Maintenance History",
    maint_subtitle: "Track oil changes, impeller replacements, repairs, and service receipts",
    log_maint_job: "Log Maintenance Job",
    log_first_maint: "Log First Service Job",
    service_title: "Service Title",
    service_date: "Service Date",
    receipt_attachment: "Receipt / Invoice Attachments (PDF / Images)",
    job_description: "Job Description & Parts Used (Markdown allowed)",
    no_maint_logged: "No Maintenance Logged Yet",
    no_maint_sub: "Keep your vessel shipshape! Record engine services, gear replacements, and store invoice receipts.",
    log_service_btn: "Log Service Job",

    // To-Do
    todo_title: "Ship's To-Do List",
    todo_subtitle: "Manage vessel maintenance tasks, deck checklists, and safety checks",
    add_todo_task: "Add To-Do Task",
    add_first_task: "Add First Task",
    task_description: "Task Description (Markdown allowed)",
    upload_attachments: "Upload Attachments / Images (Optional)",
    no_todos: "All Tasks Completed!",
    no_todos_sub: "All clear on deck. Add new tasks, inspection items, or gear checks to your fleet list.",
    add_task_btn: "Add Task",
    pending: "Pending",
    total: "Total",

    // Shopping
    shopping_title: "Shopping Cargo List",
    shopping_subtitle: "Track required vessel gear, chandlery parts, and provision orders",
    add_cargo_item: "Add Item to Buy",
    add_first_cargo: "Add First Cargo Item",
    item_name: "Item Name",
    shop_web_link: "Shop Web Link (Optional)",
    upload_images_files: "Upload Images / Files (Optional)",
    item_description: "Description & Specifications (Markdown allowed)",
    no_shopping: "Cargo Hold Fully Stocked!",
    no_shopping_sub: "No items on the shopping list. Ready for sailing! Add items to buy before your next voyage.",
    add_cargo_btn: "Add Cargo Item",
    to_buy: "To Buy",
    shop_link: "Shop Link",

    // Settings
    settings_title: "Vessel Settings & Decommissioning",
    vessel_name: "Vessel Name",
    vessel_description: "Vessel Description / Specs",
    update_vessel: "Update Vessel Info",
    danger_zone: "Danger Zone",
    decommission_vessel: "Decommission (Delete) Vessel",
    decommission_warning: "Permanently delete this vessel and all associated logs, documents, maintenance history, tasks, and cargo lists. This action cannot be undone.",

    // Fleet Empty State
    welcome_skipper: "Welcome Aboard, Skipper!",
    no_vessels: "No vessels registered in your fleet yet. Add your first yacht to begin logging voyages, storing manuals, and managing maintenance!",
    register_first_vessel: "Register First Yacht",
    select_from_fleet: "Select a Vessel from Fleet",
    choose_yacht: "Choose a yacht from the top dropdown selector or register a new boat.",

    // Footer
    locale_europe: "Europe Locale (DD-MM-YYYY)",
    copyright: "Shipboard Logbook & Fleet Locker"
  },
  it: {
    // Header & Nav
    dashboard_title: "Cruscotto Comandante",
    select_vessel: "Seleziona Imbarcazione",
    no_vessel_selected: "Nessuna Barca Selezionata",
    register_new_vessel: "Registra Nuova Barca",
    logout: "Esci",
    nav_logbook: "Giornale di Bordo",
    nav_documents: "Archivio Documenti",
    nav_maintenance: "Manutenzione",
    nav_todo: "Cose da Fare",
    nav_shopping: "Lista Spesa & Cambusa",
    nav_settings: "Impostazioni",

    // Login
    login_title: "Accesso Bordo",
    login_subtitle: "Accedi al giornale di bordo, ai registri di manutenzione e ai documenti della nave",
    username: "Nome utente",
    password: "Password",
    sign_in: "Accedi alla Flotta",
    authenticating: "Autenticazione in corso...",
    server_api_host: "Host Server API",
    save_settings: "Salva Impostazioni",

    // General Actions
    cancel: "Annulla",
    save: "Salva",
    save_changes: "Salva Modifiche",
    delete: "Elimina",
    edit: "Modifica",
    modify: "Modifica",
    close: "Chiudi",
    clear_all: "Rimuovi Tutti",
    click_to_upload: "Clicca per caricare",
    or_drag_drop: "o trascina e rilascia",
    selected_files: "File Selezionati",
    search_placeholder: "Cerca...",

    // Logbook
    logbook_title: "Giornale di Bordo",
    logbook_subtitle: "Registra le rotte di navigazione, traccia i waypoint GPS e calcola miglia e velocità",
    record_new_voyage: "Registra Nuova Navigazione",
    record_first_voyage: "Registra Prima Navigazione",
    total_distance_logged: "Distanza Totale Registrata",
    no_voyages_recorded: "Nessuna Navigazione Registrata",
    no_voyages_sub: "Inizia il giornale di bordo! Registra porti di partenza, destinazione, equipaggio e waypoint GPS.",
    voyage_passage: "Registra Nuova Rotta",
    date_of_passage: "Data di Navigazione",
    crew_members: "Membri Equipaggio",
    start_port: "Porto di Partenza",
    goal_destination: "Porto di Arrivo / Destinazione",
    voyage_notes: "Note di Navigazione & Osservazioni",
    initial_gps_waypoint: "Waypoint GPS Iniziale",
    capture_gps_sub: "Acquisisci la posizione attuale come punto di partenza",
    get_gps_location: "Rileva Posizione GPS",
    location_captured: "Posizione Acquisita",
    locating: "Rilevamento in corso...",
    solo_voyage: "Navigazione in Solitaria",
    crew_label: "Equipaggio",
    view_log: "Vedi Registro",
    voyage_details: "Dettagli Navigazione",
    passage_summary: "Riepilogo Rotta & Distanza",
    total_distance: "Distanza Totale",
    avg_speed: "Velocità Media",
    passage_time: "Tempo di Navigazione",
    waypoints_recorded: "Waypoint Registrati",
    add_waypoint: "Aggiungi Waypoint Ora",
    auto_gps_tracker: "Tracciatore GPS Automatico",
    start_auto_track: "Avvia Tracciamento Auto",
    stop_auto_track: "Interrompi Tracciamento",
    delete_voyage: "Elimina Registro Navigazione",

    // Documents
    documents_title: "Archivio Documenti Barca",
    documents_subtitle: "Conserva manuali di manutenzione, licenza di navigazione, certificati e guide operative",
    store_new_document: "Salva Nuovo Documento",
    store_first_document: "Salva Primo Documento",
    doc_title: "Titolo Documento",
    doc_files: "Carica File / Immagini (PDF, Documenti, Foto)",
    notes_details: "Note & Dettagli (Formato Markdown consentito)",
    search_documents: "Cerca per titolo, note o nome file (non distingue maiuscole/minuscole)...",
    no_documents_found: "Nessun Documento Trovato",
    no_documents_sub: "Nessun documento corrisponde alla ricerca. Clicca sotto per aggiungere manuali o certificati.",
    store_document_btn: "Salva Documento",

    // Maintenance
    maint_title: "Registro Manutenzione",
    maint_subtitle: "Traccia cambi olio, sostituzione giranti, riparazioni e fatture di servizio",
    log_maint_job: "Registra Manutenzione",
    log_first_maint: "Registra Prima Manutenzione",
    service_title: "Titolo Intervento",
    service_date: "Data Intervento",
    receipt_attachment: "Allegati Ricevuta / Fattura (PDF / Immagini)",
    job_description: "Descrizione Lavoro & Ricambi Usati (Markdown consentito)",
    no_maint_logged: "Nessuna Manutenzione Registrata",
    no_maint_sub: "Mantieni la barca in perfette condizioni! Registra i tagliandi motore e conserva le ricevute.",
    log_service_btn: "Registra Intervento",

    // To-Do
    todo_title: "Lista Cose da Fare",
    todo_subtitle: "Gestisci i compiti di manutenzione, liste di controllo ponte e verifiche di sicurezza",
    add_todo_task: "Aggiungi Compito",
    add_first_task: "Aggiungi Primo Compito",
    task_description: "Descrizione Compito (Markdown consentito)",
    upload_attachments: "Carica Allegati / Immagini (Opzionale)",
    no_todos: "Tutti i Compiti Completati!",
    no_todos_sub: "Tutto in ordine a bordo! Aggiungi nuovi compiti o controlli da effettuare.",
    add_task_btn: "Aggiungi Compito",
    pending: "In sospeso",
    total: "Totale",

    // Shopping
    shopping_title: "Lista Spesa & Equipaggiamento",
    shopping_subtitle: "Traccia materiale di rispetto, ricambi di marineria e cambusa da acquistare",
    add_cargo_item: "Aggiungi Articolo",
    add_first_cargo: "Aggiungi Primo Articolo",
    item_name: "Nome Articolo",
    shop_web_link: "Link Negozio Web (Opzionale)",
    upload_images_files: "Carica Immagini / File (Opzionale)",
    item_description: "Descrizione & Specifiche (Markdown consentito)",
    no_shopping: "Stiva Completamente Fornita!",
    no_shopping_sub: "Nessun articolo nella lista spesa. Pronti per salpare! Aggiungi articoli prima della prossima uscita.",
    add_cargo_btn: "Aggiungi Articolo",
    to_buy: "Da Acquistare",
    shop_link: "Link Prodotto",

    // Settings
    settings_title: "Impostazioni Barca & Disarmo",
    vessel_name: "Nome Barca",
    vessel_description: "Descrizione / Specifiche Barca",
    update_vessel: "Aggiorna Dati Barca",
    danger_zone: "Zona Pericolo",
    decommission_vessel: "Disarma (Elimina) Barca",
    decommission_warning: "Elimina permanentemente questa barca e tutti i registri, documenti, manutenzioni e liste spesa associati. Questa azione non può essere annullata.",

    // Fleet Empty State
    welcome_skipper: "Benvenuto a Bordo, Comandante!",
    no_vessels: "Nessuna imbarcazione registrata nella flotta. Aggiungi il tuo primo yacht per iniziare a registrare le navigazioni!",
    register_first_vessel: "Registra Prima Barca",
    select_from_fleet: "Seleziona un'Imbarcazione dalla Flotta",
    choose_yacht: "Scegli uno yacht dal menu a tendina in alto o registra una nuova barca.",

    // Footer
    locale_europe: "Formato Europeo (GG-MM-AAAA)",
    copyright: "Giornale di Bordo & Flotta Yacht"
  }
}

export const t = (key) => {
  const lang = currentLocale.value
  if (dictionary[lang] && dictionary[lang][key]) {
    return dictionary[lang][key]
  }
  if (dictionary.en && dictionary.en[key]) {
    return dictionary.en[key]
  }
  return key
}
