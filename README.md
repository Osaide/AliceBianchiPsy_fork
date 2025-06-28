# AliceBianchiPsy_fork

## Configurazione Form Contatto

Ricordarsi di configurare il form di contatto in `index.html`.
Attualmente, l'attributo `action` del form è impostato su:
`https://formspree.io/f/TUO_CODICE_FORMSPREE`

È necessario sostituire `TUO_CODICE_FORMSPREE` con il codice effettivo fornito da Formspree dopo aver registrato e configurato il form sul loro sito.

## Serenity Animation Background

È stata integrata una animazione WebGL full-screen denominata "Serenity" come effetto di background per l'intero sito.
Questa animazione è costruita utilizzando:
- HTML per la struttura base e gli script dei shader.
- CSS per il posizionamento e lo styling del contenitore dell'animazione e del testo sovrapposto.
- JavaScript vanilla e la libreria p5.js per la logica dell'animazione, il rendering del canvas e la gestione degli shader.
- GLSL (OpenGL Shading Language) per gli script dei vertex e fragment shader che generano l'effetto visivo.

L'animazione è progettata per essere un elemento visivo dinamico e astratto che aggiunge profondità e movimento all'esperienza utente. I file principali associati a questa funzionalità sono `serenity.js` e `serenity.css`.