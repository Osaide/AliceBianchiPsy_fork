# Piano di Sviluppo e Note per la Navigazione Mobile Avanzata (Toggle + Menu a Ventaglio)

Questo documento delinea i passaggi, le considerazioni tecniche e le strategie per prevenire conflitti di merge durante l'implementazione di una navigazione mobile migliorata per il sito della Dott.ssa Alice Bianchi. Fa riferimento e espande le discussioni in `AGENT.MD`.

**Branch di Lavoro Dedicato (Futuro):** `feat/mobile-nav-revamp` (o simile)

## 1. Obiettivo Principale

Sostituire l'attuale navigazione mobile (barra fissa inferiore derivata dall'header desktop) con:
*   Un **pulsante toggle dedicato** (`.mobile-nav-toggle`), posizionato fisso in basso al centro dello schermo per massima ergonomia.
*   Un **contenitore di menu** (`.mobile-menu-container`) che appare sopra il toggle, con le voci di menu disposte a **ventaglio/curva verso l'alto**.
*   L'header desktop tradizionale (`<header>`) sarà nascosto su mobile per massimizzare lo spazio verticale per i contenuti.

## 2. Modifiche Strutturali HTML (`index.html`)

**Priorità: Isolare le modifiche per minimizzare conflitti di merge.**

*   **Nuovi Elementi HTML (Cruciale: fuori dall' `<header>`):**
    *   Aggiungere i seguenti elementi come figli diretti del `<body>`, preferibilmente verso la fine, prima dello script del footer, per chiarezza e per evitare problemi di stacking contest con l'header sticky:
        ```html
        <!-- Mobile Navigation Toggle -->
        <button class="mobile-nav-toggle" aria-label="Apri menu" aria-expanded="false" aria-controls="mobileMenuContainer">
            <!-- Icona per il toggle (es. SVG hamburger o custom) -->
            <svg class="icon-menu" viewBox="0 0 24 24">...</svg>
            <svg class="icon-close" viewBox="0 0 24 24" style="display:none;">...</svg>
        </button>

        <!-- Mobile Menu Container -->
        <div class="mobile-menu-container" id="mobileMenuContainer" role="dialog" aria-modal="true" aria-labelledby="mobileMenuTitle" hidden>
            <!-- <h2 id="mobileMenuTitle" class="visually-hidden">Menu Principale</h2> -->
            <ul id="mobile-menu-items">
                <!-- Le voci di menu saranno popolate qui (vedi sotto) -->
            </ul>
        </div>
        ```
    *   **Popolamento Voci di Menu**: Le voci `<li><a href="...">...</a></li>` dentro `#mobile-menu-items` dovranno replicare quelle della navigazione desktop. È FONDAMENTALE che gli `href` puntino agli stessi ID di sezione (es. `#chi-sono`, `#servizi`).
        *   *Nota per il merge*: Se le sezioni o gli ID cambiano nel branch principale, questi link dovranno essere aggiornati di conseguenza nel branch della navbar mobile.

*   **Considerazioni sulla Navigazione Desktop Esistente**:
    *   L'attuale `<nav>` dentro `<header>` dovrà essere nascosta specificamente per schermi mobili tramite CSS. Non va rimossa dall'HTML per non impattare la versione desktop.

## 3. Modifiche CSS (`style.css` o nuovo file `mobile-nav.css`)

**Strategia: Utilizzare selettori specifici e classi dedicate per la nuova navigazione mobile per evitare di sovrascrivere stili desktop o altri componenti.**

*   **Nascondere Navigazione Desktop su Mobile**:
    ```css
    @media (max-width: 768px) { /* O il breakpoint scelto */
        header nav { /* La navigazione desktop originale */
            display: none !important; /* !important per assicurare la sovrascrittura se necessario, ma usare con cautela */
        }
        /* Rimuovere/azzerare il padding-bottom dal body e header che era stato aggiunto per la vecchia nav mobile fissa */
        body {
            padding-bottom: 0;
        }
        header { /* L'header sticky desktop */
            padding-bottom: 15px; /* Ripristina il suo padding originale se modificato */
            /* Considerare se nascondere completamente l'header su mobile se il toggle è l'unica navigazione */
            /* display: none; */
        }
    }
    ```
    *   *Nota per il merge*: Verificare che questi override non creino problemi se gli stili base dell'header o del body vengono modificati nel frattempo sul branch principale.

*   **Stili per `.mobile-nav-toggle`**:
    *   `position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);`
    *   `z-index: 1100;` (superiore ad altri elementi, ma inferiore al menu se si sovrappongono)
    *   Aspetto: circolare, dimensioni (es. `width: 60px; height: 60px;`), colori da `brand.md`, ombra, transizioni.
    *   Icone interne (hamburger/close): gestione della visibilità tramite classe sul bottone.

*   **Stili per `.mobile-menu-container`**:
    *   `position: fixed; bottom: 90px; left: 50%; transform: translateX(-50%);` (o posizione desiderata sopra il toggle)
    *   `z-index: 1200;` (superiore al toggle e overlay)
    *   Nascosto di default: `visibility: hidden; opacity: 0; transform: translate(-50%, 20px) scale(0.95);` (esempio per animazione)
    *   Stato aperto (es. con classe `.is-open`): `visibility: visible; opacity: 1; transform: translate(-50%, 0) scale(1);`
    *   Transizioni per `opacity`, `transform`, `visibility`.
    *   Dimensioni, sfondo (potrebbe usare variabili glassmorphism), `border-radius`.

*   **Stili per `#mobile-menu-items` e `li` (Effetto Ventaglio)**:
    *   Questa è la parte più complessa e richiede sperimentazione.
    *   `ul`: `list-style: none; padding: 0; margin: 0; display: flex; justify-content: center; align-items: flex-end;` (base per la disposizione)
    *   `li`:
        *   Posizionamento assoluto relativo al `.mobile-menu-container` o uso di `transform` per la disposizione.
        *   Esempio per *i*-esimo item (da adattare con JS o `nth-child` se il numero di item è fisso):
            *   `transform: rotate(VAR_ANGOLO_ITEM) translate(VAR_DISTANZA_Y_ITEM) rotate(-VAR_ANGOLO_ITEM_NEGATIVO_PER_TESTO_DRITTO);`
            *   Angoli e distanze calcolati per creare l'arco.
        *   Transizioni per l'apparizione/sparizione degli item quando il menu si apre/chiude (es. `staggered animations`).
    *   `a`: Stile dei link (colore, padding, `text-decoration`).

*   **Overlay (Opzionale, ma raccomandato)**:
    ```html
    <!-- Da inserire nel body, gestito da JS -->
    <!-- <div class="mobile-menu-overlay" hidden></div> -->
    ```
    ```css
    .mobile-menu-overlay {
        position: fixed;
        top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 1150; /* Tra toggle e menu container */
        opacity: 0; visibility: hidden; transition: opacity 0.3s, visibility 0.3s;
    }
    .mobile-menu-overlay.is-visible {
        opacity: 1; visibility: visible;
    }
    ```

## 4. Logica JavaScript (`script.js` o nuovo file)

*   **Selezione Elementi DOM**: Toggle, contenitore menu, (opzionale) overlay, icone menu/close.
*   **Gestione Evento Click sul Toggle**:
    *   Prevenire default se è un link.
    *   Alternare classe `.is-open` su `.mobile-menu-container`.
    *   Alternare classe `.is-active` (o simile) su `.mobile-nav-toggle` per cambiare icona.
    *   Aggiornare `aria-expanded` sul toggle.
    *   Mostrare/nascondere `.mobile-menu-container` e (opzionale) `.mobile-menu-overlay`.
*   **Gestione Chiusura Menu**:
    *   Click su un link del menu: chiudere il menu.
    *   Click sull'overlay: chiudere il menu.
    *   (Opzionale) Tasto `Escape`: chiudere il menu.
*   **Dinamica Staggered Animation (Opzionale avanzato)**:
    *   Se si desidera un'animazione "a cascata" per le voci del menu all'apertura, JS può aggiungere delay progressivi o classi animate agli `<li>`.

## 5. Prevenzione Conflitti di Merge e Note di Compatibilità

*   **Isolamento del Codice**:
    *   **HTML**: I nuovi elementi sono aggiunti alla fine del `<body>`, minimizzando la possibilità di conflitti diretti con modifiche strutturali in altre parti del `index.html`. Il rischio maggiore è se il `<body>` stesso viene ristrutturato pesantemente.
    *   **CSS**: Usare nomi di classe molto specifici per i nuovi componenti (es. `mobile-nav-toggle`, `mobile-menu-container`, `mobile-menu-item`). Evitare di modificare stili globali o di componenti esistenti non direttamente correlati alla navigazione mobile. Se si crea un `mobile-nav.css` separato e lo si importa, i conflitti saranno limitati a quel file.
    *   **JS**: Racchiudere la nuova logica in funzioni ben definite o in un modulo. Evitare di modificare funzioni JS esistenti a meno che non sia strettamente necessario.
*   **Variabili CSS**: Continuare a usare le variabili CSS definite in `:root` per coerenza (`--color-primary-green`, ecc.). Se vengono aggiunte nuove variabili globali nel branch principale, considerare se possono essere utili per la navbar mobile.
*   **Breakpoint Consistenti**: Assicurarsi che il breakpoint usato per attivare la nuova navigazione mobile (es. `768px`) sia lo stesso usato per nascondere la navigazione desktop e altri adattamenti mobile. Se i breakpoint generali del sito cambiano, questo andrà aggiornato.
*   **Dipendenze dalle Voci di Menu**: La nuova navbar mobile dipenderà dalla struttura e dagli `href` delle voci di menu. Se la navigazione principale del sito (sezioni, link) cambia, la navbar mobile dovrà essere aggiornata per riflettere tali cambiamenti. Questo è più un task di manutenzione post-merge che un conflitto di merge diretto, ma è importante notarlo.
*   **Test Post-Merge**: Dopo aver mergiato `feat/mobile-nav-revamp` in `main` (o nel branch di sviluppo principale), sarà cruciale un test completo:
    *   Verificare che la navigazione desktop non sia stata intaccata.
    *   Verificare che la nuova navigazione mobile funzioni come previsto.
    *   Verificare che la vecchia navigazione mobile sia completamente disattivata.
    *   Controllare la console per errori JS.

## 6. Test

*   Multipiattaforma e multidispositivo (reale e simulatori).
*   Diverse dimensioni di viewport.
*   Orientamento portrait e landscape.
*   Accessibilità: navigazione da tastiera, screen reader (VoiceOver, NVDA).
*   Verificare che gli `href` portino alle sezioni corrette.

Questo piano mira a essere una guida completa. Alcuni dettagli CSS e JS, specialmente per l'animazione a ventaglio, richiederanno prototipazione e aggiustamenti iterativi durante lo sviluppo effettivo nel branch dedicato.
