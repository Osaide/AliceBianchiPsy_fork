# Sito Web Dott.ssa Alice Bianchi

Questo repository contiene il codice sorgente per la landing page statica della Dott.ssa Alice Bianchi, Psicologa e Psicologa dello Sport.

## 1. Panoramica del Progetto

Il sito è una landing page statica costruita con HTML, CSS (con variabili CSS) e JavaScript vanilla per piccole interattività. L'obiettivo è presentare i servizi della Dott.ssa Bianchi, il suo approccio, e fornire informazioni di contatto.

Il branding mira a comunicare professionalità, accoglienza, crescita e benessere. Per i dettagli specifici su colori, tipografia e tone of voice, fare riferimento al file `brand.md`.

## 2. Struttura e Convenzioni dei File

-   **`index.html`**: File HTML principale. Contiene la struttura completa del sito.
-   **`style.css`**: Foglio di stile principale. Contiene tutte le regole CSS, incluse le variabili globali (colori, font, transizioni) definite in `:root`.
-   **`serenity.css`**: Foglio di stile specifico per l'animazione di background "Serenity".
-   **`serenity.js`**: Script per la logica dell'animazione di background "Serenity" (basata su p5.js e shader GLSL).
-   **`brand.md`**: Documento che descrive le linee guida di branding (palette colori, tipografia, ecc.).
-   **`AGENT.MD`**: File con linee guida specifiche per agenti AI che lavorano sul progetto. Contiene dettagli tecnici e di contesto aggiuntivi.
-   **`img/`**: Directory contenente tutte le immagini del sito.
-   **JavaScript**: Gli script principali sono `serenity.js` e la logica per il menu mobile (attualmente inline in `index.html` o in file JS dedicati se evolvono). Altri script minori (es. aggiornamento anno nel footer) sono inline in `index.html`.

## 3. Linee Guida di Stile e CSS

-   **Variabili CSS**: Il progetto utilizza estensivamente le variabili CSS definite in `:root` (in `style.css`) per colori, font e tempi di transizione. Questo approccio facilita la manutenzione e garantisce coerenza visiva.
    -   Colori principali: `--color-primary-green`, `--color-secondary-beige`, `--color-bg-light`, `--color-text-dark`.
    -   Colori accento: Varianti come `--color-accent-coral-vivid`, `--color-accent-coral-pastel`, ecc.
-   **Responsive Design**: Il sito è progettato per essere completamente responsive, con breakpoint principali a `768px`, `480px`, e `380px`. Particolare attenzione è data alla leggibilità e usabilità su schermi piccoli.
-   **Effetti Visivi Notevoli**:
    *   **Glassmorphism**: Utilizzato sull'header sticky.
    *   **Animazioni di Entrata**: Effetto `fadeInUp` per le sezioni principali.
    *   **Serenity Animation Background**: Animazione WebGL full-screen (vedi sezione dedicata).

## 4. Navigazione Mobile

L'attuale implementazione della navigazione mobile (per schermi <= `768px`) prevede:
-   Un **pulsante toggle** (`.mobile-nav-toggle`) fisso in basso al centro dello schermo.
-   Al tocco, un **contenitore di menu** (`.mobile-menu-container`) appare sopra il toggle, con le voci di menu disposte a **ventaglio/curva**.
-   La navigazione desktop tradizionale è nascosta su mobile.
-   **Importante**: Il markup HTML per questi elementi di navigazione mobile è stato posizionato come figlio diretto del `<body>` per evitare problemi di stacking context con l'header sticky.

Per dettagli più approfonditi sull'implementazione e sui selettori CSS/JS chiave, consultare `AGENT.MD` e `docs/NAVIGAZIONE_MOBILE_PLAN.md`.

## 5. JavaScript

-   Utilizzato principalmente per interattività UI (menu mobile, animazione Serenity) e piccoli aggiornamenti dinamici (anno nel footer).
-   Si preferisce JavaScript vanilla per mantenere il sito leggero, con eccezioni per librerie specifiche come p5.js per l'animazione Serenity.

## 6. Configurazione Form di Contatto

Il form di contatto in `index.html` utilizza Formspree.
L'endpoint nell'attributo `action` del form (`<form action="https://formspree.io/f/TUO_CODICE_FORMSPREE" ...>`) deve essere aggiornato con un codice Formspree valido.

**È necessario sostituire `TUO_CODICE_FORMSPREE` con il codice effettivo fornito da Formspree.**

## 7. Animazione Serenity Background

È stata integrata una animazione WebGL full-screen denominata "Serenity" come effetto di background.
-   **Tecnologie**: HTML (struttura e script shader), CSS (`serenity.css` per posizionamento), JavaScript vanilla e p5.js (`serenity.js` per logica e rendering), GLSL (script shader).
-   **File Principali**: `serenity.js`, `serenity.css`. Gli script shader sono inline in `index.html` (`#vertShader`, `#fragShader`).
-   **Obiettivo**: Fornire un elemento visivo dinamico e astratto.
-   **Considerazioni**: Monitorare performance su dispositivi meno potenti. Il contenuto principale del sito ha `z-index` più alti per garantire leggibilità sopra l'animazione.

## 8. Sviluppi Futuri e Aree di Miglioramento

Il file `AGENT.MD` contiene una sezione "Task Futuri / Aree di Miglioramento" che include:
-   Evoluzione della navigazione mobile (es. radiale).
-   Ottimizzazione performance immagini.
-   Miglioramenti accessibilità (a11y).
-   Implementazione dati strutturati (SEO).

## 9. Lavorare con Agenti AI (come Jules)

Il file `AGENT.MD` contiene anche una sezione "Come Interagire con l'Agente (Jules)" con consigli utili per fornire istruzioni efficaci e feedback dettagliato quando si utilizzano assistenti AI per lo sviluppo di questo progetto. Si raccomanda di consultarlo.

---
