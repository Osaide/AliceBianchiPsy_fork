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