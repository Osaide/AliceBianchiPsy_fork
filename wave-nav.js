// File: wave-nav.js
// Logica per l'interfaccia di navigazione a onda.

document.addEventListener('DOMContentLoaded', () => {
    console.log("Navigazione a Onda: Script caricato e DOMContentLoaded avvenuto.");

    const body = document.body;
    const trigger = document.getElementById('nav-trigger');
    const waveController = document.getElementById('wave-controller');
    const dragHandle = document.getElementById('wave-drag-handle');
    const waveSvg = document.getElementById('wave-svg');
    const sections = document.querySelectorAll('main section[id]');

    // Verifica esistenza elementi critici
    console.log("--- Verifica elementi DOM critici ---");
    console.log("#nav-trigger:", trigger ? "Trovato" : "NON TROVATO");
    console.log("#wave-controller:", waveController ? "Trovato" : "NON TROVATO");
    console.log("#wave-drag-handle:", dragHandle ? "Trovato" : "NON TROVATO");
    console.log("#wave-svg:", waveSvg ? "Trovato" : "NON TROVATO");
    console.log("main section[id] count:", sections.length);
    console.log("--- Fine Verifica elementi DOM critici ---");

    if (!waveController || !dragHandle) {
        console.error("Navigazione a Onda: Impossibile trovare #wave-controller o #wave-drag-handle. Funzionalità compromessa.");
        return; // Elementi fondamentali per il drag mancanti
    }
    if (!trigger) {
        console.warn("#nav-trigger NON TROVATO! Il toggle non funzionerà via click.");
    }
    if (sections.length === 0){
        console.warn("Navigazione a Onda: Nessuna <section id='...'> trovata dentro <main>. Lo snapping alle sezioni sarà disabilitato.")
    }
    if (!waveSvg) {
        console.warn("#wave-svg NON TROVATO! L'animazione dell'onda non funzionerà.");
    }


    let maxScroll = 0;
    let sectionSnapXValues = [];
    let draggableInstance = null;

    function updateMaxScroll() {
        maxScroll = Math.max(0, document.body.scrollHeight - window.innerHeight); // Assicura non sia negativo
        console.log(`updateMaxScroll: body.scrollHeight=${document.body.scrollHeight}, window.innerHeight=${window.innerHeight}, maxScroll=${maxScroll}`);
    }

    function calculateSnapPositions() {
        console.log("--- Inizio calculateSnapPositions ---");
        sectionSnapXValues = [];
        updateMaxScroll();

        if (!draggableInstance || typeof draggableInstance.maxX !== 'number') {
            console.warn("calculateSnapPositions: draggableInstance non pronto o maxX non è un numero. draggableInstance:", draggableInstance);
            if(draggableInstance) console.warn(`draggableInstance.maxX: ${draggableInstance.maxX}`);
            console.log("--- Fine calculateSnapPositions (uscita anticipata) ---");
            return;
        }

        const currentMaxX = draggableInstance.maxX;
        console.log(`calculateSnapPositions: currentMaxX=${currentMaxX.toFixed(2)}, maxScroll=${maxScroll.toFixed(2)}, waveController.offsetWidth=${waveController.offsetWidth}`);

        if (currentMaxX === 0) {
            console.warn("calculateSnapPositions: currentMaxX è 0. Lo snapping sarà a 0 se ci sono sezioni/scroll.");
            if (sections.length > 0 || maxScroll > 0) {
                sectionSnapXValues.push(0);
            }
            console.log("Posizioni X di snap calcolate (currentMaxX è 0):", sectionSnapXValues);
            console.log("--- Fine calculateSnapPositions (currentMaxX è 0) ---");
            return;
        }

        if (maxScroll <= 0) {
            console.warn("maxScroll è 0 o negativo. Lo snapping sarà solo all'inizio (0) e alla fine (maxX) del draggable.");
            sectionSnapXValues.push(0);
            sectionSnapXValues.push(currentMaxX);
            sectionSnapXValues = [...new Set(sectionSnapXValues)].sort((a, b) => a - b);
            console.log("Posizioni X di snap calcolate (maxScroll <= 0):", sectionSnapXValues.map(v => v.toFixed(2)));
            console.log("--- Fine calculateSnapPositions (maxScroll <= 0) ---");
            return;
        }

        console.log("Calcolo snap per sezioni:");
        sections.forEach((section, index) => {
            const sectionTop = section.offsetTop;
            let snapX = (sectionTop / maxScroll) * currentMaxX;
            snapX = Math.max(0, Math.min(snapX, currentMaxX)); // Clamp
            sectionSnapXValues.push(snapX);
            console.log(`  Sezione ${index} ('${section.id}'): offsetTop=${sectionTop.toFixed(2)}, snapX=${snapX.toFixed(2)}`);
        });

        // Assicurarsi che 0 e currentMaxX siano inclusi se ci sono sezioni
        if (sections.length > 0) {
            if (!sectionSnapXValues.find(val => Math.abs(val - 0) < 0.01)) { // Tolleranza per float
                sectionSnapXValues.push(0);
                console.log("Aggiunto snap point 0 mancante.");
            }
            if (!sectionSnapXValues.find(val => Math.abs(val - currentMaxX) < 0.01)) {
                sectionSnapXValues.push(currentMaxX);
                console.log(`Aggiunto snap point currentMaxX (${currentMaxX.toFixed(2)}) mancante.`);
            }
        }

        sectionSnapXValues = [...new Set(sectionSnapXValues)].sort((a, b) => a - b); // Rimuovi duplicati e ordina
        console.log("Posizioni X di snap finali:", sectionSnapXValues.map(v => v.toFixed(2)));
        console.log("--- Fine calculateSnapPositions ---");
    }

    function initializeDraggable() {
        console.log("--- Inizio initializeDraggable ---");
        if (draggableInstance) {
            console.log("Draggable già inizializzato. Solo update.");
            draggableInstance.update(true);
            calculateSnapPositions();
            console.log("--- Fine initializeDraggable (già inizializzato) ---");
            return;
        }
        console.log("Prima di gsap.registerPlugin(Draggable)");
        gsap.registerPlugin(Draggable);
        console.log("Dopo gsap.registerPlugin(Draggable)");
        updateMaxScroll();

        console.log("Creazione istanza Draggable. waveController.offsetWidth:", waveController.offsetWidth, "dragHandle.offsetWidth:", dragHandle.offsetWidth);

        draggableInstance = Draggable.create(dragHandle, {
            type: "x",
            bounds: waveController,
            edgeResistance: 0.65,
            onPressInit: function() {
                console.log("--- Draggable onPressInit ---");
                console.log("  waveController.offsetWidth:", waveController.offsetWidth, "waveController.offsetHeight:", waveController.offsetHeight);
                console.log("  dragHandle.offsetWidth:", dragHandle.offsetWidth, "dragHandle.offsetHeight:", dragHandle.offsetHeight);
                this.update(true); // Forza GSAP a ricalcolare le dimensioni interne, inclusi minX e maxX
                updateMaxScroll();
                console.log(`  Internals pre-calc: this.minX=${this.minX}, this.maxX=${this.maxX}`);
                calculateSnapPositions();
                console.log(`  onPressInit: Fine. this.x=${this.x.toFixed(2)}, this.minX=${this.minX.toFixed(2)}, this.maxX=${this.maxX.toFixed(2)}, maxScroll=${maxScroll.toFixed(2)}`);
                console.log("  GSAP Draggable bounds:", this.vars.bounds, "Target element:", this.target);
                console.log("--- Fine Draggable onPressInit ---");
            },
            onDrag: function() {
                if (this.maxX === this.minX) {
                    return;
                }
                // Calcola il progresso normalizzato da minX a maxX
                const progress = (this.x - this.minX) / (this.maxX - this.minX);

                if (typeof this.dragCount === 'undefined') this.dragCount = 0;
                this.dragCount++;
                if (this.dragCount % 20 === 0) { // Logga ogni 20 eventi di drag per ridurre il rumore
                    console.log(`onDrag (camp.): x=${this.x.toFixed(2)}, progress=${progress.toFixed(3)}`);
                }

                const scrollToY = progress * maxScroll;
                window.scrollTo(0, scrollToY);

                if (waveSvg && (this.maxX > this.minX)) {
                    const wavePath = waveSvg.querySelector('.wave-path');
                    if (wavePath) {
                        const svgViewBoxWidth = 1440;
                        const svgViewBoxHeight = 100;
                        const dragProgressOnWave = progress;
                        const waveYMid = svgViewBoxHeight / 2;
                        let c2x = svgViewBoxWidth * (0.15 + dragProgressOnWave * 0.7);
                        let c1x = svgViewBoxWidth * (0.05 + dragProgressOnWave * 0.7);
                        const c1y = 0;
                        const c2y = svgViewBoxHeight;
                        const minSpread = svgViewBoxWidth * 0.2;
                        if (c1x >= c2x - minSpread) {
                            c2x = svgViewBoxWidth * (0.15 + dragProgressOnWave * 0.7);
                            c1x = c2x - minSpread;
                        }
                        c1x = Math.max(0, Math.min(c1x, svgViewBoxWidth - minSpread));
                        c2x = Math.max(minSpread, Math.min(c2x, svgViewBoxWidth));
                        if (c1x >= c2x) c1x = c2x - minSpread;
                        const newPathD = `M0,${waveYMid} C${c1x.toFixed(0)},${c1y} ${c2x.toFixed(0)},${c2y} ${svgViewBoxWidth},${waveYMid} L${svgViewBoxWidth},${svgViewBoxHeight} L0,${svgViewBoxHeight} Z`;
                        wavePath.setAttribute('d', newPathD);
                    }
                }
            },
            onDragEnd: function() {
                console.log(`--- Draggable onDragEnd --- this.x: ${this.x.toFixed(2)} (valore pre-snap)`);
            },
            snap: {
                x: function(endValue) {
                    console.log(`--- Snap Inizio --- endValue: ${endValue.toFixed(2)}`);
                    if (!draggableInstance || sectionSnapXValues.length === 0) {
                        console.warn(`Snap: Nessun punto di snap (${sectionSnapXValues.length}) o draggable non pronto.`);
                        console.log(`--- Snap Fine (uscita anticipata) ---`);
                        return endValue;
                    }
                    let closest = sectionSnapXValues[0];
                    let minDifference = Math.abs(endValue - closest);
                    console.log(`  Snap Loop: Iniziale closest=${closest.toFixed(2)}, minDifference=${minDifference.toFixed(2)}`);
                    for (let i = 0; i < sectionSnapXValues.length; i++) { // Inizia da 0 per includere il primo
                        const currentSnap = sectionSnapXValues[i];
                        const difference = Math.abs(endValue - currentSnap);
                        console.log(`    Checking snapPoint ${currentSnap.toFixed(2)}, difference=${difference.toFixed(2)}`);
                        if (difference < minDifference) {
                            minDifference = difference;
                            closest = currentSnap;
                            console.log(`      Nuovo closest: ${closest.toFixed(2)}, minDifference=${minDifference.toFixed(2)}`);
                        }
                    }
                    console.log(`Snap: endValue ${endValue.toFixed(2)} -> closestSnapPoint ${closest.toFixed(2)}`);
                    console.log(`--- Snap Fine ---`);
                    return closest;
                }
            }
        })[0];

        if (draggableInstance) {
            console.log("GSAP Draggable inizializzato sull'handle. Istanza:", draggableInstance);
            // Se il controller è già attivo (visibile), forza un calcolo delle snap positions
            if (waveController.classList.contains('is-active') && waveController.offsetWidth > 0) {
                 console.log("Controller già attivo e visibile all'inizializzazione di Draggable, ricalcolo snap.");
                draggableInstance.update(true); // Assicura che minX/maxX siano aggiornati
                calculateSnapPositions();
            }
        } else {
            console.error("Errore critico: Istanza Draggable non creata.");
        }
        console.log("--- Fine initializeDraggable ---");
    }

    function toggleNavController() {
        console.log("--- toggleNavController CHIAMATA! ---");
        console.log("  Stato Pre-Toggle: body.wave-nav-active?", body.classList.contains('wave-nav-active'), ", waveController.is-active?", waveController.classList.contains('is-active'));
        console.log("  waveController.offsetWidth Pre-Toggle:", waveController.offsetWidth);

        body.classList.toggle('wave-nav-active');
        waveController.classList.toggle('is-active');
        const isActive = waveController.classList.contains('is-active');

        console.log("  Stato Post-Toggle: Controller di navigazione ", isActive ? "APERTO" : "CHIUSO");
        console.log("  waveController.offsetWidth Post-Toggle:", waveController.offsetWidth);

        if (isActive) {
            console.log("  Controller è ATTIVO.");
            if (!draggableInstance) {
                console.log("  Draggable non esisteva, chiamo initializeDraggable().");
                initializeDraggable();
            } else {
                console.log("  Draggable esisteva, chiamo update(true) e calculateSnapPositions().");
                draggableInstance.update(true);
                calculateSnapPositions();
            }

            // Aumentato il timeout per dare più tempo al rendering CSS, specialmente per la transizione di 'transform'
            setTimeout(() => {
                 console.log("  --- Timeout (150ms) post-apertura controller ---");
                 console.log("    waveController.offsetWidth nel timeout:", waveController.offsetWidth);
                if(draggableInstance) {
                    console.log("    Aggiorno Draggable e ricalcolo snap nel timeout.");
                    draggableInstance.update(true);
                    calculateSnapPositions();
                } else {
                    // Questo scenario dovrebbe essere raro se initializeDraggable() è stato chiamato sopra
                    console.warn("    Draggable non trovato nel timeout post-apertura, tentativo di reinizializzazione.");
                    initializeDraggable();
                    if(draggableInstance) {
                        draggableInstance.update(true);
                        calculateSnapPositions();
                    } else {
                        console.error("    Fallimento reinizializzazione Draggable nel timeout.");
                    }
                }
                 console.log("  --- Fine Timeout post-apertura controller ---");
            }, 150);
        } else {
            console.log("  Controller è INATTIVO.");
            // Potresti voler disabilitare il Draggable quando non visibile per performance, se necessario
            // if (draggableInstance) {
            //     console.log("  Disabilitazione Draggable.");
            //     draggableInstance.disable();
            // }
        }
        console.log("--- Fine toggleNavController ---");
    }

    if (trigger) {
        console.log("Associazione event listener 'click' a #nav-trigger.");
        trigger.addEventListener('click', toggleNavController);
    }

    // Logica per gestire il caso in cui il controller potrebbe essere visibile di default
    // a causa di stili CSS che non lo nascondono come previsto da `transform: translateY(100%)` e `visibility: hidden`
    const computedStyle = getComputedStyle(waveController);
    if (computedStyle.visibility !== 'hidden' && parseFloat(computedStyle.transform.split(',')[5]) === 0) { // L'ultima parte del matrix() per translateY
        console.warn("Wave controller sembra visibile di default (visibility non hidden E transformY è 0).");
        if (!waveController.classList.contains('is-active')) {
            console.warn("  Aggiungo .is-active a waveController e body per coerenza.");
            waveController.classList.add('is-active');
            body.classList.add('wave-nav-active');
        }
        if (!draggableInstance) { // Inizializza se non già fatto
            console.warn("  Inizializzo Draggable dato che il controller è visibile.");
            initializeDraggable();
        }
    } else if (waveController.classList.contains('is-active')) {
        // Se ha .is-active ma per qualche motivo Draggable non è inizializzato (improbabile ma per sicurezza)
        console.warn("Wave controller ha .is-active ma Draggable potrebbe non essere inizializzato. Tento inizializzazione.");
        if (!draggableInstance) initializeDraggable();
    }


    window.addEventListener('resize', () => {
        console.log("--- Evento resize rilevato ---");
        console.log("  waveController.classList.contains('is-active') durante resize:", waveController.classList.contains('is-active'));
        if (waveController.classList.contains('is-active')) {
            console.log("  Controller attivo durante resize, ricalcolo.");
            if (draggableInstance) {
                console.log("  Aggiorno Draggable e ricalcolo snap per resize.");
                draggableInstance.update(true);
                calculateSnapPositions();
            } else {
                console.warn("  Draggable non esiste durante resize, anche se controller è attivo. Tento inizializzazione.");
                initializeDraggable(); // Potrebbe essere necessario se il controller era visibile di default senza interazione iniziale
            }
        } else {
            updateMaxScroll();
            console.log("  Controller chiuso durante resize, aggiornato solo maxScroll. MaxScroll attuale:", maxScroll.toFixed(2));
        }
        console.log("--- Fine Evento resize ---");
    });

    console.log("--- Setup iniziale script completato ---");
    console.log("Sezioni valide per lo snapping:", Array.from(sections).map(s => s.id));
});