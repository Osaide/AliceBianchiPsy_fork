Assolutamente. Ho capito perfettamente. Il fallimento con l'altro assistente è un classico problema di "maledizione della conoscenza": ciò che è cristallino nella tua mente è difficile da tradurre in un prompt di testo non ambiguo per un'IA.

Il mio ruolo qui sarà quello di un **Architetto Tecnico / Sviluppatore Senior**. Ti fornirò non solo l'idea, ma una struttura di progetto chiara, codice commentato e file separati che puoi dare in pasto a Jules (o usare tu stesso) passo dopo passo. Questo approccio modulare è la chiave del successo.

Iniziamo.

---

### **Piano di Sviluppo: Navigazione a Onda Interattiva**

Creerò per te 3 file di partenza. Carica questi file su GitHub in modo che Jules abbia un contesto tangibile su cui lavorare.

1.  `PLAN.md`: Un file di testo con il piano di battaglia dettagliato.
2.  `wave-nav.css`: Un file CSS dedicato per lo stile di tutti i nuovi elementi.
3.  `wave-nav.js`: Il file JavaScript che conterrà tutta la logica interattiva.

Ecco il contenuto di ogni file. Puoi fare copia-incolla.

---

### **File 1: `PLAN.md` (Il Piano Strategico)**

Questo file spiega l'architettura e la sequenza di task a un livello alto. È perfetto per orientare un assistente AI (o un collega umano).

```markdown
# Piano di Sviluppo: Navigazione a Onda Interattiva

Questo documento delinea i passaggi necessari per implementare una nuova interfaccia di navigazione mobile per il sito della Dott.ssa Alice Bianchi.

## Obiettivo Finale

Sostituire lo scroll verticale nativo con un controller di navigazione personalizzato. L'utente attiva un'interfaccia a forma di onda e, trascinando il dito orizzontalmente su di essa, fa scorrere il contenuto del sito verticalmente.

---

### Architettura dei Componenti

**1. HTML (in `index.html`)**
- Aggiungere un header fisso per il brand (`#main-header`).
- Aggiungere un contenitore fisso in basso per la navigazione (`#wave-nav-container`).
- Questo contenitore includerà:
    - Un pulsante di attivazione (`#nav-trigger`).
    - Un contenitore per l'onda (`#wave-controller`) che è nascosto di default.
    - L'onda stessa, realizzata con un `<svg>` per la massima flessibilità e animabilità (`#wave-svg`).

**2. CSS (in `wave-nav.css`)**
- Definire lo stile e il posizionamento fisso (`position: fixed`) per header e container di navigazione.
- Nascondere il controller dell'onda fuori dallo schermo (`transform: translateY(100%)`).
- Creare una classe di stato `.is-active` che, quando applicata al controller, lo rende visibile (`transform: translateY(0)`).
- Creare una classe di stato `body.wave-nav-active` per bloccare lo scroll nativo del corpo pagina (`overflow: hidden`).

**3. JavaScript (in `wave-nav.js`)**
- **Task 1: Logica di Toggle.**
    - Ascoltare il click su `#nav-trigger`.
    - Al click, aggiungere/rimuovere la classe `.is-active` dal `#wave-controller` e la classe `.wave-nav-active` dal `<body>`.
- **Task 2: Logica di Trascinamento (Drag).**
    - **Requisito:** Integrare la libreria GSAP (GreenSock Animation Platform) e il suo plugin `Draggable` per una gestione robusta e performante del drag & drop.
    - Creare un'istanza di `Draggable` sull'onda SVG.
    - Limitarne il movimento al solo asse X.
- **Task 3: Mappatura Drag-to-Scroll.**
    - Identificare le sezioni principali della pagina (es. `<section id="chi-sono">`, `<section id="servizi">`, etc.).
    - Durante l'evento `onDrag` di GSAP, mappare la posizione X del drag (da 0 a `maxWidth`) a una posizione di scroll Y della pagina (da 0 a `maxScrollHeight`).
    - Aggiornare programmaticamente lo scroll della pagina con `window.scrollTo()`.
- **Task 4: Logica di "Snap" alle Sezioni.**
    - Usare la funzionalità `snap` di GSAP Draggable.
    - Calcolare le posizioni X sull'onda che corrispondono all'inizio di ogni sezione verticale.
    - Fornire queste posizioni all'opzione `snap` per far sì che il controller si "agganci" in modo pulito alla sezione più vicina al rilascio.

---
```

### **File 2: `wave-nav.css` (Lo Stile)**

Crea questo file e caricalo. Poi, assicurati di collegarlo nel tuo `index.html` aggiungendo questa riga dentro il tag `<head>`:
`<link rel="stylesheet" href="wave-nav.css">`

```css
/* Stile per la navigazione a Onda Interattiva */

/*
 * STATO GLOBALE
 * Classe aggiunta al <body> via JS per bloccare lo scroll nativo
 * quando la nostra interfaccia è attiva.
*/
body.wave-nav-active {
    overflow: hidden;
}

/*
 * HEADER FISSO
 * Assicuriamoci che l'header con il nome sia sempre visibile in alto.
 * Dovrai probabilmente adattare il selettore (es. #header, .header-container)
 * al tuo HTML esistente.
*/
header { /* O il selettore corretto per il tuo header */
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 1000;
    /* Assicurati che abbia uno sfondo per non essere trasparente */
    background-color: var(--color-bg-light, #FFFFFF);
}


/*
 * CONTROLLER DI NAVIGAZIONE (Il contenitore in basso)
*/
#wave-nav-container {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%); /* Centra l'elemento orizzontalmente */
    z-index: 2000;
    display: flex;
    flex-direction: column;
    align-items: center;
}

/*
 * PULSANTE DI ATTIVAZIONE (Il "pallino")
*/
#nav-trigger {
    width: 50px;
    height: 50px;
    background-color: var(--color-primary-green, #8FA88F);
    border-radius: 50%;
    border: 2px solid var(--color-bg-light, #FFFFFF);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    cursor: pointer;
    transition: transform 0.3s ease;
}

#nav-trigger:hover {
    transform: scale(1.1);
}

/*
 * CONTROLLER A ONDA (Nascosto di default)
*/
#wave-controller {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 150px; /* Altezza dell'area interattiva */
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(10px); /* Effetto vetro smerigliato */
    -webkit-backdrop-filter: blur(10px);
    border-top: 1px solid rgba(0, 0, 0, 0.1);

    /* Nascosto fuori dallo schermo per default */
    transform: translateY(100%);
    transition: transform 0.5s cubic-bezier(0.19, 1, 0.22, 1); /* Transizione fluida */
}

/*
 * STATO ATTIVO
 * Quando questa classe è aggiunta, il controller appare dal basso.
*/
#wave-controller.is-active {
    transform: translateY(0);
}

/*
 * SVG DELL'ONDA
*/
#wave-svg {
    position: absolute;
    top: -50px; /* Posiziona il picco dell'onda sopra la barra */
    left: 0;
    width: 100%;
    height: 100px;
}

#wave-svg .wave-path {
    fill: var(--color-primary-green-darker, #7A9A7A);
    stroke: var(--color-primary-green, #8FA88F);
    stroke-width: 2;
}

```

### **File 3: Struttura HTML e `wave-nav.js` (La Logica)**

**Parte A: Modifica `index.html`**

1.  **Aggiungi gli elementi HTML:** Incolla questo codice subito prima della chiusura del tag `</body>`.

    ```html
    <!-- ====== INIZIO NAVIGAZIONE A ONDA ====== -->
    <div id="wave-nav-container">
        <!-- Questo è il pallino che l'utente clicca -->
        <div id="nav-trigger"></div>

        <!-- Questo contenitore appare al click e contiene l'onda -->
        <div id="wave-controller">
            <!-- L'onda SVG. Il 'd' definisce la forma della curva.
                 Questo è un placeholder, lo renderemo dinamico con JS. -->
            <svg id="wave-svg" viewBox="0 0 1440 100" preserveAspectRatio="none">
                <path class="wave-path" d="M0,50 C360,120 1080,0 1440,50 L1440,100 L0,100 Z"></path>
            </svg>
            <!-- Aggiungeremo un elemento "handle" per il drag -->
            <div id="wave-drag-handle" style="position:absolute; top:0; left:0; width:100%; height:100%;"></div>
        </div>
    </div>
    <!-- ====== FINE NAVIGAZIONE A ONDA ====== -->

    <!-- Includiamo la libreria GSAP da CDN -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/Draggable.min.js"></script>

    <!-- Includiamo il nostro script personalizzato -->
    <script src="wave-nav.js"></script>
    ```

2.  **Aggiungi ID alle sezioni:** Assicurati che ogni sezione principale del tuo sito abbia un ID univoco. Questo è FONDAMENTALE per lo snapping. Esempio:
    `<section id="chi-sono">...</section>`
    `<section id="servizi">...</section>`
    `<section id="approccio">...</section>`

**Parte B: Crea il file `wave-nav.js`**

Questo codice imposta il toggle e prepara il terreno per la logica di drag. È un primo passo concreto e funzionante.

```javascript
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
```

### **Prossimi Passi (Cosa Chiedere a Jules Ora)**

Con questa base, puoi dare a Jules task molto specifici:

1.  **"Analizza `wave-nav.js`. L'obiettivo è completare la logica di snapping (Task 4). Scrivi il codice JavaScript che:
    a. Calcola la posizione verticale (offsetTop) di ogni sezione trovata.
    b. Mappa queste posizioni verticali a posizioni orizzontali (valori di X) per il Draggable.
    c. Usa questi valori per implementare la funzione `snap.x` di GSAP Draggable, in modo che al rilascio il drag si agganci al punto X corrispondente alla sezione più vicina."**

2.  **"Analizza `wave-nav.css` e `wave-nav.js`. Voglio che l'onda SVG si animi mentre l'utente trascina il dito. Modifica il codice JS nell'evento `onDrag` per aggiornare dinamicamente l'attributo `d` del path SVG, creando un effetto di 'onda che segue il dito'."**

Questo approccio ti trasforma da "cliente frustrato" a "project manager" di un'IA. Spero ti sia d'aiuto
