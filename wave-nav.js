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

    // -- TASK 4: CALCOLO POSIZIONI PER SNAPPING --
    let sectionSnapXValues = [];
    let draggableInstance; // Per accedere a maxX dopo l'inizializzazione

    // Funzione per ricalcolare le posizioni di snap (utile se il layout cambia dinamicamente)
    function calculateSnapPositions() {
        sectionSnapXValues = []; // Resetta i valori
        const currentMaxX = draggableInstance ? draggableInstance.maxX : (waveController.offsetWidth - (dragHandle.offsetWidth || 0)); // Fallback for offsetWidth if handle is display:none initially

        if (maxScroll <= 0) {
            console.warn("maxScroll is 0 or less. Snapping will be to the start if sections exist, or disabled.");
            if (sections.length > 0) {
                sectionSnapXValues.push(0); // Snap to the beginning
            }
            // If no sections, sectionSnapXValues remains empty, snap will return endValue.
            console.log("Posizioni X di snap calcolate (maxScroll <= 0):", sectionSnapXValues);
            return;
        }

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            // Mappa la posizione verticale della sezione a una posizione X sull'onda
            // (sectionTop / maxScroll) ci dà il progresso di scroll (0 a 1)
            // Moltiplichiamo per currentMaxX per ottenere la posizione X corrispondente sull'handle
            let snapX = (sectionTop / maxScroll) * currentMaxX;

            // Assicurati che snapX non superi maxX (può succedere per l'ultima sezione se maxScroll è leggermente off)
            snapX = Math.min(snapX, currentMaxX);
            // Assicurati che snapX non sia negativo se sectionTop è 0 e currentMaxX è 0 (improbabile con maxX di Draggable)
            snapX = Math.max(0, snapX);
            sectionSnapXValues.push(snapX);
        });
        console.log("Posizioni X di snap calcolate:", sectionSnapXValues);
    }


    // Crea l'istanza di Draggable
    draggableInstance = Draggable.create(dragHandle, {
        type: "x", // Permetti il drag solo sull'asse X
        bounds: waveController, // Limita il drag all'interno del suo contenitore
        
        onDrag: function() {
            // Mappa la posizione X del drag allo scroll Y della pagina
            const progress = this.x / this.maxX;
            const scrollToY = progress * maxScroll;
            window.scrollTo(0, scrollToY);

            // -- TASK: ANIMAZIONE ONDA --
            const wavePath = document.querySelector('#wave-svg .wave-path');
            if (wavePath) {
                // Valori originali per riferimento: M0,50 C360,120 1080,0 1440,50 L1440,100 L0,100 Z
                // viewBox="0 0 1440 100"

                // Il punto di controllo che definisce il "dip" dell'onda è il secondo (1080,0)
                // Vogliamo che la X di questo punto di controllo si muova con il drag.
                // this.x va da 0 a this.maxX (pixel)
                // Lo mappiamo allo spazio viewBox dell'SVG (0 a 1440)
                const svgWidth = 1440; // Larghezza definita nel viewBox
                let controlPointX = (this.x / this.maxX) * svgWidth;

                // Manteniamo gli altri punti di controllo e coordinate come da design originale
                // o li aggiustiamo leggermente per un effetto più dinamico.
                // Il primo punto di controllo (C360,120) definisce la cresta iniziale.
                // Potremmo farlo muovere in opposizione o scalarlo. Per ora, lo teniamo fisso.
                const originalC1X = 360;
                const originalC1Y = 120;
                const originalC2Y = 0; // L'altezza del "dip"

                // Rendiamo il primo punto di controllo leggermente reattivo per un effetto più fluido
                // Si muoverà meno del punto principale del "dip"
                let responsiveC1X = originalC1X + (this.x / this.maxX) * (svgWidth / 4) - (svgWidth / 8);
                responsiveC1X = Math.max(0, Math.min(svgWidth, responsiveC1X)); // Clamp

                // Il punto finale dell'onda (1440,50)
                const endPointX = svgWidth;
                const midY = 50; // Altezza media dell'onda

                // Costruisci il nuovo attributo 'd'
                // M0,50 C(C1X),(C1Y) (C2X),(C2Y) (EndX),50 L(EndX),100 L0,100 Z
                const newPathD = `M0,${midY} C${responsiveC1X},${originalC1Y} ${controlPointX},${originalC2Y} ${endPointX},${midY} L${endPointX},100 L0,100 Z`;
                wavePath.setAttribute('d', newPathD);
            }
        },

        onDragEnd: function() {
            // Non è più necessario un log specifico qui, lo snap gestirà il fine drag.
            console.log("Drag terminato. Posizione X finale (post-snap): ", this.x);
        },
        
        snap: {
             x: (endValue) => {
                if (sectionSnapXValues.length === 0) {
                    console.warn("Nessun punto di snap calcolato.");
                    return endValue; // Nessun punto a cui agganciarsi
                }

                // Trova il punto di snap più vicino
                let closest = sectionSnapXValues[0];
                let closestDistance = Math.abs(endValue - closest);

                for (let i = 1; i < sectionSnapXValues.length; i++) {
                    const distance = Math.abs(endValue - sectionSnapXValues[i]);
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        closest = sectionSnapXValues[i];
                    }
                }
                console.log(`Snap: Valore finale ${endValue}, Snap a ${closest}`);
                return closest;
             }
        }
    })[0]; // Accedi al primo (e unico) elemento dell'array restituito da Draggable.create

    // Calcola le posizioni di snap dopo che Draggable è stato inizializzato e ha calcolato maxX
    // È importante farlo dopo, perché this.maxX non è disponibile prima
    if (draggableInstance) {
        calculateSnapPositions();
    } else {
        console.error("Istanza Draggable non creata correttamente.");
    }

    // Ricalcola le posizioni di snap al ridimensionamento della finestra,
    // poiché maxScroll e potenzialmente maxX potrebbero cambiare.
    window.addEventListener('resize', () => {
        // Ricalcola maxScroll e aggiorna la variabile globale (o ripassala se preferisci)
        maxScroll = document.body.scrollHeight - window.innerHeight;

        if (draggableInstance) {
            // GSAP Draggable updates its own maxX if bounds are window-relative or element-relative and that element resizes.
            // Calling update() ensures internal values are refreshed if bounds depend on complex calcs.
            // For simple bounds like 'waveController', it's usually automatic.
            // draggableInstance.update(true); // Potentially force update if issues arise with maxX
            calculateSnapPositions(); // Recalculate snap points with new maxScroll and potentially new maxX
        }
    });

    console.log("GSAP Draggable inizializzato sull'handle.");
    console.log("Sezioni trovate:", Array.from(sections).map(s => s.id));

});