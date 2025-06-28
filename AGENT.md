# AGENT.MD - Linee Guida per lo Sviluppo del Sito della Dott.ssa Alice Bianchi

Questo documento fornisce linee guida e contesto per agenti AI (come Jules) che lavorano su questo progetto.

## 1. Panoramica del Progetto

Il sito è una landing page statica per la Dott.ssa Alice Bianchi, Psicologa e Psicologa dello Sport. L'obiettivo è presentare i suoi servizi, il suo approccio, e fornire informazioni di contatto. Il sito è costruito con HTML, CSS (con variabili CSS) e JavaScript vanilla per piccole interattività.

Il branding mira a comunicare professionalità, accoglienza, crescita e benessere, utilizzando una palette di colori naturali (verde salvia, beige) con accenti corallo. Fare riferimento a `brand.md` per i dettagli sul branding.

## 2. Struttura e Convenzioni dei File

-   **`index.html`**: File HTML principale. Contiene la struttura del sito.
-   **`style.css`**: Foglio di stile principale. Contiene tutte le regole CSS, incluse le variabili globali (colori, font, transizioni) definite in `:root`.
-   **`brand.md`**: Contiene le linee guida di branding definite dall'utente (palette, tipografia, tone of voice). **Consultare sempre questo file per le scelte di design.**
-   **`AGENT.MD`**: Questo file. Contiene istruzioni specifiche per l'agente AI.
-   **`img/`**: Directory per le immagini (attualmente contiene placeholder).
-   **JavaScript**: Script minori sono inline in `index.html` in fondo al `<body>` (es. aggiornamento anno, logica menu mobile). Per funzionalità più complesse, valutare la creazione di un file `script.js` separato e collegarlo.

## 3. Linee Guida di Stile e CSS

-   **Variabili CSS**: Utilizzare estensivamente le variabili CSS definite in `:root` in `style.css` per colori, font, e tempi di transizione. Questo facilita la manutenzione e la coerenza.
    -   Colori principali: `--color-primary-green`, `--color-secondary-beige`, `--color-bg-light`, `--color-text-dark`.
    -   Colori accento: Usare le varianti `--color-accent-coral-vivid`, `--color-accent-coral-pastel`, `--color-accent-coral-glow`, ecc.
    -   Transizioni: `--transition-smooth`, `--transition-fast`.
-   **Responsive Design**: Il sito deve essere completamente responsive. Attualmente ci sono breakpoint principali a `768px` (tablet/mobile landscape), `480px` (mobile portrait), e `380px` (mobile small). Prestare particolare attenzione alla leggibilità, alla dimensione degli elementi interattivi (tap targets) e all'usabilità su schermi piccoli.
-   **Effetti Visivi Implementati**:
    *   **Glassmorphism**: Utilizzato sull'header sticky. Variabili: `--color-glass-bg`, `--color-glass-border`, `--blur-intensity`. Usare con parsimonia per non impattare la performance o la leggibilità.
    *   **Animazioni di Entrata**: Effetto `fadeInUp` per le sezioni principali e alcune card per un caricamento progressivo.
    *   **Interazioni Hover**: Effetti di trasformazione (translate, scale, rotate) e `box-shadow` su card, bottoni e immagini per fornire feedback visivo su desktop. Questi effetti sono generalmente disabilitati o ridotti su mobile.
    *   **Bottoni Principali (`.button-primary`)**: Stile "outline" di base (bordo e testo colorati, sfondo trasparente), con riempimento di colore e effetto "glow" all'hover/focus.
    *   **Serenity Animation Background**: Un effetto di background full-screen WebGL implementato utilizzando p5.js e shader GLSL.
        *   **File Principali**:
            *   `serenity.js`: Contiene la logica p5.js per inizializzare il canvas, caricare gli shader, e passare loro le uniformi (es. `uTime`, `uResolution`, colori). Il canvas è appeso al div `#serenity-animation-background` in `index.html`.
            *   `serenity.css`: Definisce gli stili per `#serenity-animation-background` (posizionamento fisso, full-screen, z-index basso per stare dietro al contenuto), per il canvas stesso, e per il contenitore di testo `.serenity-text-container` (attualmente contiene un `h1` vuoto).
            *   Gli script degli shader (vertex e fragment) sono inclusi direttamente in `index.html` con ID `#vertShader` e `#fragShader`.
        *   **Considerazioni per lo Sviluppo Futuro (Agente)**:
            *   **Parametri Animazione**: Colori, velocità (`uTime` in `serenity.js`), e altri parametri degli shader (es. `AMOUNT`, `scale` in `#fragShader`) possono essere modificati per alterare l'aspetto dell'animazione.
            *   **Performance**: Essendo un'animazione WebGL full-screen, monitorare la performance su dispositivi meno potenti. Eventuali ottimizzazioni potrebbero riguardare la complessità degli shader o la frequenza di aggiornamento.
            *   **Conflitti di Stile**: L'animazione è intesa come background. Assicurarsi che il contenuto principale del sito (header, main, footer) mantenga `z-index` e sfondi appropriati per garantire la leggibilità. Attualmente, il contenuto principale ha `z-index` più alti e sfondi opachi/traslucidi.
            *   **Testo Sovrapposto**: Il `<h1>` in `.serenity-text-container` è attualmente vuoto (`&nbsp;`). Può essere utilizzato per testo o altri elementi da sovrapporre direttamente all'animazione, separati dal contenuto principale del sito.
-   **Tipografia**: Fare riferimento a `brand.md` e alle variabili font in `:root`. Attualmente:
    *   `Montserrat` per corpo del testo e titoli.
    *   `Dancing Script` per il logo (`.logo`).
-   **Coerenza e Pulizia**: Mantenere uno stile visivo pulito, moderno, arioso (uso di spazio bianco) e coerente con il branding definito. Evitare complessità non necessarie.

## 4. Navigazione Mobile

-   **Obiettivo Utente**: Una navigazione mobile facilmente accessibile con il pollice, posizionata stabilmente nella parte inferiore dello schermo, con un'apertura a ventaglio/curva degli item di menu.
-   **Implementazione Attuale**: Su schermi <= `768px`:
    -   La navigazione desktop tradizionale (classe `.main-nav-desktop` all'interno dell'`<header>`) viene nascosta (`display: none;`).
    -   Un pulsante toggle circolare (`.mobile-nav-toggle`) è visibile e **posizionato fisso in basso al centro dello schermo** (`position: fixed; bottom: 10px; left: 50%; transform: translateX(-50%);`). Questo posizionamento è stato scelto per massima ergonomia e raggiungibilità con il pollice.
    -   Al tocco di questo pulsante, un contenitore di menu (`.mobile-menu-container`) appare. Questo contenitore è posizionato fisso e parte da una base leggermente sopra il toggle (`bottom: 70px;`), centrato orizzontalmente.
    -   Le voci di menu (`ul` dentro `.mobile-menu-container`, idealmente con ID `#mobile-menu-items`, e i suoi `li`) al suo interno sono disposte dinamicamente tramite trasformazioni CSS (`translateX`, `translateY`, `rotate`) per formare una **curva a ventaglio verso l'alto**, ma contenuta in altezza per rimanere nell'area di interazione del pollice. L'item centrale della curva è il punto più alto.
-   **Motivazione Strutturale HTML CRUCIALE**: Per garantire che `position: fixed` del `.mobile-nav-toggle` e del `.mobile-menu-container` si riferisca correttamente al viewport e non sia "intrappolato" da contesti di stacking/posizionamento creati dall'`<header>` (che usa `position: sticky` e `backdrop-filter`), **è stato necessario che l'utente spostasse il markup del `.mobile-nav-toggle` e del `.mobile-menu-container` fuori dall'`<header>` e li rendesse figli diretti del `<body>`** (o di un wrapper neutro a livello principale del DOM). Questa modifica strutturale è fondamentale. Se il toggle appare in alto, verificare questa struttura HTML.
-   **Selettori Chiave (CSS & JS)**:
    *   Pulsante Toggle: `.mobile-nav-toggle`
    *   Contenitore Menu Mobile: `.mobile-menu-container`
    *   Lista Voci Menu Mobile: `ul` all'interno di `.mobile-menu-container` (es. `#mobile-menu-items`)
    *   Classe per menu aperto: `.is-open` (applicata a `.mobile-menu-container` via JS)
    *   Classe per toggle attivo: `.is-active` (applicata a `.mobile-nav-toggle` via JS)
-   **Interazione**: Il menu si apre e chiude con un singolo tap sul toggle. La chiusura avviene anche toccando una delle voci del menu. Non è implementata la pressione prolungata.

## 5. JavaScript

-   **Utilizzo**: Principalmente per interattività UI come il toggle del menu mobile e l'aggiornamento dell'anno nel footer.
-   **Vanilla JS**: Preferire JavaScript puro per mantenere il sito leggero e senza dipendenze esterne, a meno di specifiche necessità per funzionalità più complesse.
-   **Selezione Elementi**: Utilizzare selettori precisi (classi o ID). Se la struttura HTML della navigazione mobile viene modificata, aggiornare i selettori in JS.
-   **Accessibilità**: Aggiornare gli attributi ARIA (es. `aria-expanded` sul toggle) quando si manipola lo stato di elementi interattivi.

## 6. Form di Contatto

-   Il form in `index.html` utilizza Formspree.
-   **Azione Richiesta dall'Utente**: L'endpoint `https://formspree.io/f/TUO_CODICE_FORMSPREE` nell'attributo `action` del form deve essere aggiornato con un codice Formspree valido fornito dall'utente.
-   La checkbox per il consenso alla privacy è `required`.

## 7. Immagini e Contenuti

-   Molte immagini nel codice HTML sono placeholder (es. `img/hero-background-placeholder.jpg`, `img/alice-bianchi-profilo.jpg`, ecc.). Queste dovranno essere sostituite con immagini definitive fornite dall'utente.
-   I percorsi delle immagini sono relativi alla directory `img/`. Assicurarsi che le immagini siano presenti in tale directory.
-   Testi e contenuti specifici (come testimonianze, dettagli dei servizi) sono presenti ma potrebbero necessitare di aggiornamenti o conferme da parte dell'utente.

## 8. Task Futuri / Aree di Miglioramento (basati sulla discussione con l'utente)

-   **Navigazione Radiale Mobile (Avanzata)**: L'utente ha espresso interesse per una navigazione mobile radiale più sofisticata. L'attuale implementazione a "ventaglio" è un primo passo. Ulteriori sviluppi potrebbero richiedere JavaScript più complesso per calcolare posizioni dinamicamente e gestire interazioni touch/swipe più elaborate.
-   **Effetti Visivi Avanzati (es. Three.js, Shaders)**: L'utente ha menzionato interesse per effetti come "liquid glass" (richiederebbe stack React/Three.js). Questo rappresenterebbe un cambio significativo nello stack tecnologico del progetto e andrebbe pianificato separatamente.
-   **Ottimizzazione Performance Immagini**: Una volta disponibili le immagini finali, utilizzare formati moderni (WebP con fallback), compressione adeguata, e l'attributo `srcset` per fornire immagini responsive e ottimizzare i tempi di caricamento.
-   **Lazy Loading Immagini**: Già implementato con `loading="lazy"` per le immagini principali. Verificare l'efficacia e considerare se applicarlo ad altre risorse.
-   **Accessibilità (a11y)**: Eseguire controlli di accessibilità più approfonditi (contrasto colori, navigazione da tastiera completa per tutti gli elementi interattivi, test con screen reader).
-   **Dati Strutturati (SEO)**: Considerare l'aggiunta di Schema.org markup per migliorare la comprensione del contenuto da parte dei motori di ricerca (es. per `LocalBusiness`, `Person`, `Service`).

## 9. Come Interagire con l'Agente (Jules)

-   **Precisione nelle Richieste**: Sii il più specifico possibile riguardo a posizionamenti (es. "il toggle mobile deve essere a 10px dal bordo inferiore"), comportamenti (es. "il menu deve chiudersi al click su un item"), ed effetti visivi desiderati.
-   **Motivazioni**: Quando possibile, spiega il "perché" dietro una richiesta, specialmente se riguarda l'esperienza utente (es. "il toggle deve essere in basso per l'ergonomia del pollice"). Questo aiuta l'agente a comprendere meglio il contesto e a suggerire soluzioni più appropriate.
-   **Feedback Dettagliato e Tempestivo**: Dopo ogni iterazione o commit, fornisci feedback specifici il prima possibile. Indica cosa funziona bene e cosa necessita di modifiche. Screenshots, video o descrizioni precise dei problemi riscontrati (es. "il toggle appare ancora in alto su laptop e il menu X si apre fuori schermo in basso a sinistra") sono fondamentali per una rapida risoluzione.
-   **Modifiche Strutturali HTML**: Per modifiche significative alla struttura del DOM (come lo spostamento della navigazione mobile fuori dall'header), è cruciale che queste vengano comunicate chiaramente. Idealmente, l'utente esegue queste modifiche strutturali nel file HTML, e l'agente adatta CSS/JS. Se l'agente deve suggerire la modifica HTML, è importante che l'utente la confermi e la applichi prima che l'agente proceda con CSS/JS che dipendono da essa. **Verificare sempre che i selettori CSS e JS corrispondano alla struttura HTML effettiva.**
-   **Risorse**: Se vengono introdotte nuove risorse (immagini, font), specifica i percorsi e i nomi dei file.
-   **Priorità**: Se ci sono più richieste, indicare le priorità può aiutare l'agente a concentrarsi prima sulle modifiche più importanti.
---
```
