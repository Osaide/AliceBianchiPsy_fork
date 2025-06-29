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

    // Variabile per maxScroll, aggiornata anche al resize
    let maxScroll = document.body.scrollHeight - window.innerHeight;

    // -- TASK 4: CALCOLO POSIZIONI PER SNAPPING --
    let sectionSnapXValues = [];
    let draggableInstance; // Per accedere a maxX dopo l'inizializzazione

    // Funzione per ricalcolare le posizioni di snap
    function calculateSnapPositions() {
        sectionSnapXValues = []; // Resetta i valori
        // Assicurati che draggableInstance e draggableInstance.maxX esistano
        const currentMaxX = draggableInstance && typeof draggableInstance.maxX === 'number'
                            ? draggableInstance.maxX
                            : (waveController.offsetWidth - (dragHandle.offsetWidth || 0));

        if (maxScroll <= 0) {
            console.warn("maxScroll è 0 o negativo. Lo snapping sarà all'inizio se ci sono sezioni, altrimenti disabilitato.");
            if (sections.length > 0) {
                sectionSnapXValues.push(0); // Snap all'inizio
            }
            console.log("Posizioni X di snap calcolate (maxScroll <= 0):", sectionSnapXValues);
            return;
        }

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            // Mappa la posizione verticale della sezione a una posizione X sull'onda
            let snapX = (sectionTop / maxScroll) * currentMaxX;
            snapX = Math.max(0, Math.min(snapX, currentMaxX)); // Clamp tra 0 e currentMaxX
            sectionSnapXValues.push(snapX);
        });
        // Aggiungi uno snap point per la fine esatta dello scroll, se non già vicino all'ultima sezione
        if (sections.length > 0 && currentMaxX > 0) {
             const lastSnap = sectionSnapXValues[sectionSnapXValues.length -1];
             if (currentMaxX - lastSnap > currentMaxX * 0.05) { // Se c'è un margine significativo alla fine
                 sectionSnapXValues.push(currentMaxX);
             } else { // Altrimenti, assicurati che l'ultimo snap sia esattamente maxX
                 sectionSnapXValues[sectionSnapXValues.length -1] = currentMaxX;
             }
        } else if (sections.length === 0 && currentMaxX > 0) {
            // Se non ci sono sezioni, permetti snap all'inizio e alla fine del draggable
            sectionSnapXValues.push(0);
            sectionSnapXValues.push(currentMaxX);
        }


        // Rimuovi duplicati e ordina (anche se l'ordine dovrebbe essere già corretto)
        sectionSnapXValues = [...new Set(sectionSnapXValues)].sort((a, b) => a - b);
        console.log("Posizioni X di snap calcolate:", sectionSnapXValues);
    }

    // Crea l'istanza di Draggable
    draggableInstance = Draggable.create(dragHandle, {
        type: "x",
        bounds: waveController,
        edgeResistance: 0.65, // Aggiunge un po' di resistenza ai bordi
        onPress: function() {
            // Potrebbe essere utile ricalcolare qui se le dimensioni cambiano mentre il controller è nascosto
            maxScroll = document.body.scrollHeight - window.innerHeight;
            // this.update() ricalcola le dimensioni/posizioni interne di Draggable
            this.update(true);
            calculateSnapPositions(); // Ricalcola gli snap points basati su maxX aggiornato
            console.log("Draggable onPress: maxX=", this.maxX, "maxScroll=", maxScroll);
        },
        onDrag: function() {
            if (this.maxX === 0) return; // Evita divisione per zero se maxX non è ancora calcolato o è 0
            const progress = this.x / this.maxX;
            const scrollToY = progress * maxScroll;
            window.scrollTo(0, scrollToY);

            // -- TASK: ANIMAZIONE ONDA --
            const wavePath = document.querySelector('#wave-svg .wave-path');
            if (wavePath && this.maxX > 0) { // Assicurati che maxX sia valido
                // Dimensioni viewBox SVG: "0 0 1440 100"
                // Path originale di riferimento: "M0,50 C360,120 1080,0 1440,50 L1440,100 L0,100 Z"
                
                const svgViewBoxWidth = 1440; // Larghezza come da viewBox
                const svgViewBoxHeight = 100; // Altezza come da viewBox (per la parte dell'onda)
                
                const dragProgress = this.x / this.maxX; // Progresso normalizzato del drag (0-1)

                // Y di base per l'inizio e la fine dell'onda (metà altezza del viewBox dell'onda)
                const waveYMid = svgViewBoxHeight / 2; // = 50

                // X del punto di controllo della "valle" (C2X)
                // Vogliamo che la valle segua il dito.
                // La facciamo variare tra circa 15% e 85% della larghezza del viewBox.
                let c2x = svgViewBoxWidth * (0.15 + dragProgress * 0.7);

                // X del punto di controllo della "cresta" (C1X)
                // La facciamo muovere in modo complementare, un po' più a sinistra della valle.
                // Varia tra circa 5% e 75% della larghezza.
                let c1x = svgViewBoxWidth * (0.05 + dragProgress * 0.7);

                // Y dei punti di controllo:
                // c1y (cresta) sarà in alto (valore Y piccolo, es. 0 o negativo se l'SVG è posizionato più in basso)
                // c2y (valle) sarà in basso (valore Y grande, es. svgViewBoxHeight)
                const c1y = 0; // Punto più alto della cresta (top del viewBox)
                const c2y = svgViewBoxHeight; // Punto più basso della valle (bottom del viewBox)

                // Assicuriamo che c1x sia sempre minore di c2x per una forma d'onda corretta
                // e che non siano troppo vicini o troppo lontani.
                const minSpread = svgViewBoxWidth * 0.2; // Minima distanza orizzontale tra i punti di controllo
                
                if (c1x >= c2x - minSpread) {
                    // Se c1x è troppo vicino o ha superato c2x (considerando lo spread)
                    // riposizionali mantenendo il dragProgress come guida principale per c2x
                    c2x = svgViewBoxWidth * (0.15 + dragProgress * 0.7); // Ricalcola c2x
                    c1x = c2x - minSpread; // Posiziona c1x a sinistra di c2x con lo spread minimo
                }

                // Clamp finale per assicurare che i punti di controllo rimangano entro limiti ragionevoli del viewBox
                c1x = Math.max(0, Math.min(c1x, svgViewBoxWidth - minSpread));
                c2x = Math.max(minSpread, Math.min(c2x, svgViewBoxWidth));
                 if (c1x >= c2x) c1x = c2x - minSpread; // Ultimo check


                const newPathD = `M0,${waveYMid} C${c1x},${c1y} ${c2x},${c2y} ${svgViewBoxWidth},${waveYMid} L${svgViewBoxWidth},${svgViewBoxHeight} L0,${svgViewBoxHeight} Z`;
                wavePath.setAttribute('d', newPathD);
            }
        },
        onDragEnd: function() {
            console.log("Drag terminato. Posizione X finale (post-snap): ", this.x);
        },
        snap: {
            x: function(endValue) { // Deve essere una funzione regolare per 'this' corretto se si accede a draggableInstance
                if (!draggableInstance || sectionSnapXValues.length === 0) {
                    console.warn("Nessun punto di snap calcolato o istanza draggable non pronta.");
                    return endValue;
                }

                // Trova il punto di snap più vicino
                let closest = sectionSnapXValues[0];
                let minDifference = Math.abs(endValue - closest);

                for (let i = 1; i < sectionSnapXValues.length; i++) {
                    const currentSnap = sectionSnapXValues[i];
                    const difference = Math.abs(endValue - currentSnap);

                    if (difference < minDifference) {
                        minDifference = difference;
                        closest = currentSnap;
                    }
                }
                console.log(`Snap: Valore finale ${endValue}, Snap a ${closest}`);
                // GSAP animerà automaticamente lo scroll verso la posizione 'closest'
                // perché onDrag è ancora chiamato durante l'animazione dello snap.
                return closest;
            }
        }
    })[0];

    // Calcola le posizioni di snap iniziali dopo che Draggable è stato creato
    // e ha avuto la possibilità di calcolare il suo maxX.
    // Un piccolo timeout può aiutare se le dimensioni non sono immediatamente disponibili.
    setTimeout(() => {
        if (draggableInstance) {
            draggableInstance.update(true); // Forza aggiornamento interno di Draggable
            maxScroll = document.body.scrollHeight - window.innerHeight; // Ricalcola maxScroll
            calculateSnapPositions();
        } else {
            console.error("Istanza Draggable non creata correttamente.");
        }
    }, 100); // Un breve ritardo per assicurare che il DOM sia completamente renderizzato


    // Ricalcola le posizioni di snap al ridimensionamento della finestra
    window.addEventListener('resize', () => {
        maxScroll = document.body.scrollHeight - window.innerHeight;
        if (draggableInstance) {
            draggableInstance.update(true); // Aggiorna le dimensioni interne di Draggable
            calculateSnapPositions();
        }
    });

    console.log("GSAP Draggable inizializzato sull'handle.");
    console.log("Sezioni trovate:", Array.from(sections).map(s => s.id));

});
