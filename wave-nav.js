// File: wave-nav.js
// Logica per l'interfaccia di navigazione a onda.

// Attende che il documento sia completamente caricato
document.addEventListener('DOMContentLoaded', () => {

    console.log("Navigazione a Onda: Script caricato.");

    // -- SELEZIONE DEGLI ELEMENTI DEL DOM --
    const body = document.body;
    const trigger = document.getElementById('nav-trigger');
    const waveController = document.getElementById('wave-controller');
    const dragHandle = document.getElementById('wave-drag-handle');
    
    // Seleziona tutte le sezioni principali del sito
    const sections = document.querySelectorAll('main section[id]');

    // Controlla se gli elementi essenziali esistono
    if (!trigger || !waveController || !dragHandle || sections.length === 0) {
        console.error("Navigazione a Onda: Impossibile trovare uno o più elementi essenziali (trigger, controller, handle, o sezioni).");
        return;
    }

    // -- TASK 1: LOGICA DI TOGGLE (APRI/CHIUDI) --
    // Questa funzione gestisce l'apertura e la chiusura del pannello.
    function toggleNavController() {
        body.classList.toggle('wave-nav-active');
        waveController.classList.toggle('is-active');
        console.log("Controller di navigazione ", waveController.classList.contains('is-active') ? "aperto" : "chiuso");
    }

    // Associa la funzione all'evento click del trigger
    trigger.addEventListener('click', toggleNavController);

    // -- TASK 2 & 3: SETUP DRAG-TO-SCROLL (con GSAP) --
    // Registra il plugin Draggable
    gsap.registerPlugin(Draggable);

    // Calcola l'altezza massima di scroll
    const maxScroll = body.scrollHeight - window.innerHeight;

    // Crea l'istanza di Draggable
    Draggable.create(dragHandle, {
        type: "x", // Permetti il drag solo sull'asse X
        bounds: waveController, // Limita il drag all'interno del suo contenitore
        
        onDrag: function() {
            // Mappa la posizione X del drag allo scroll Y della pagina
            // this.x è la posizione corrente del drag
            // this.minX e this.maxX sono i limiti calcolati da GSAP
            const progress = this.x / this.maxX; // Calcola il progresso (da 0 a 1)
            const scrollToY = progress * maxScroll; // Mappa il progresso all'altezza di scroll
            
            window.scrollTo(0, scrollToY);
        },

        // -- TASK 4: SETUP DELLO SNAPPING --
        onDragEnd: function() {
            // Logica di Snap (da implementare)
            // Qui calcoleremo a quale sezione "agganciare" lo scroll
            console.log("Drag terminato. Posizione X: ", this.x);
        },
        
        // La configurazione dello snap vera e propria verrà inserita qui.
        // Lo faremo nel prossimo step, dopo aver calcolato le posizioni delle sezioni.
        snap: {
             x: (endValue) => {
                 // Per ora, solo un log. Svilupperemo la logica qui.
                 console.log("Valore finale potenziale:", endValue);
                 // ...logica per calcolare lo snap point più vicino...
                 return endValue; // Per ora non fa nulla
             }
        }
    });

    console.log("GSAP Draggable inizializzato sull'handle.");
    console.log("Sezioni trovate:", Array.from(sections).map(s => s.id));

});