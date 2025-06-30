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

    // Verifica esistenza elementi critici (Step 4 del piano)
    // Verifica esistenza elementi critici
    console.log("--- Verifica elementi DOM critici ---");
    console.log("#nav-trigger:", trigger ? "Trovato" : "NON TROVATO");
    console.log("#wave-controller:", waveController ? "Trovato" : "NON TROVATO");
    console.log("#wave-drag-handle:", dragHandle ? "Trovato" : "NON TROVATO");
    console.log("#wave-svg:", waveSvg ? "Trovato" : "NON TROVATO");
    console.log("main section[id] count:", sections.length);
    if (waveController) console.log("#wave-controller initial offsetWidth:", waveController.offsetWidth);
    console.log("--- Fine Verifica elementi DOM critici ---");

    if (!waveController || !dragHandle) {
        console.error("Navigazione a Onda: Impossibile trovare #wave-controller o #wave-drag-handle. Funzionalità compromessa.");
        return;
        return; // Elementi fondamentali per il drag mancanti
    }
    if (!trigger) {
        console.warn("#nav-trigger NON TROVATO! Il toggle non funzionerà via click.");
    }
    if (sections.length === 0) {
        console.warn("Navigazione a Onda: Nessuna <section id='...'> trovata dentro <main>. Lo snapping alle sezioni sarà disabilitato.")
    }
    if (!waveSvg) {
        console.warn("#wave-svg NON TROVATO! L'animazione dell'onda non funzionerà.");
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
        maxScroll = Math.max(0, document.body.scrollHeight - window.innerHeight);
        console.log(`updateMaxScroll: body.scrollHeight=${document.body.scrollHeight}, window.innerHeight=${window.innerHeight}, maxScroll=${maxScroll.toFixed(2)}`);
    }

    // Step 3: Utilizza waveController.offsetWidth per i calcoli
    function calculateSnapPositions(referenceWidth) {
        console.log("--- Inizio calculateSnapPositions ---");
        sectionSnapXValues = [];
        updateMaxScroll();

        const currentRefWidth = referenceWidth;
        console.log(`calculateSnapPositions: referenceWidth=${currentRefWidth.toFixed(2)}, maxScroll=${maxScroll.toFixed(2)}`);
        // if (draggableInstance) {
        //     console.log(`  GSAP Draggable internal: minX=${draggableInstance.minX?.toFixed(2)}, maxX=${draggableInstance.maxX?.toFixed(2)}`);
        // }

        if (currentRefWidth === 0) {
            console.warn("calculateSnapPositions: referenceWidth è 0. Impossibile calcolare snap points.");
            if (sections.length > 0 || maxScroll > 0) sectionSnapXValues.push(0);
            console.log("Posizioni X di snap (referenceWidth è 0):", sectionSnapXValues);
            console.log("--- Fine calculateSnapPositions (referenceWidth è 0) ---");
            return;
        }

        if (maxScroll <= 0) {
            console.warn("maxScroll è 0 o negativo. Lo snapping sarà solo all'inizio (0) e alla fine (referenceWidth).");
            sectionSnapXValues.push(0);
            sectionSnapXValues.push(currentRefWidth);
            sectionSnapXValues = [...new Set(sectionSnapXValues)].sort((a, b) => a - b);
            console.log("Posizioni X di snap (maxScroll <= 0):", sectionSnapXValues.map(v => v.toFixed(2)));
            console.log("--- Fine calculateSnapPositions (maxScroll <= 0) ---");
            return;
        }

        // console.log("Calcolo snap per sezioni:");
        sections.forEach((section, index) => {
            const sectionTop = section.offsetTop;
            let snapX = (sectionTop / maxScroll) * currentRefWidth;
            snapX = Math.max(0, Math.min(snapX, currentRefWidth)); // Clamp
            sectionSnapXValues.push(snapX);
            // console.log(`  Sezione ${index} ('${section.id}'): offsetTop=${sectionTop.toFixed(2)}, snapX=${snapX.toFixed(2)}`);
        });

        if (currentRefWidth > 0) {
            if (!sectionSnapXValues.find(val => Math.abs(val - 0) < 0.01)) {
                sectionSnapXValues.push(0);
            }
            if (!sectionSnapXValues.find(val => Math.abs(val - currentRefWidth) < 0.01)) {
                sectionSnapXValues.push(currentRefWidth);
            }
        }

        sectionSnapXValues = [...new Set(sectionSnapXValues)].sort((a, b) => a - b);
        console.log("Posizioni X di snap finali:", sectionSnapXValues.map(v => v.toFixed(2)));
        console.log("--- Fine calculateSnapPositions ---");
    }

    function initializeDraggable() {
        console.log("--- Inizio initializeDraggable ---");
        if (draggableInstance) {
            console.log("Draggable già inizializzato. Chiamo update(true) e calculateSnapPositions.");
            draggableInstance.update(true);
            calculateSnapPositions(waveController.offsetWidth);
            console.log("--- Fine initializeDraggable (già inizializzato) ---");
            return;
        }
        
        console.log("Registrazione plugin Draggable...");
        gsap.registerPlugin(Draggable);
        updateMaxScroll();
        console.log("Creazione istanza Draggable. waveController.offsetWidth:", waveController.offsetWidth, "dragHandle.offsetWidth:", dragHandle.offsetWidth);

        draggableInstance = Draggable.create(dragHandle, {
            type: "x",
            bounds: waveController,
            edgeResistance: 0.65,
            onPressInit: function() { // Step 4: Log getBoundingClientRect
                console.log("--- Draggable onPressInit ---");
                const wcRect = waveController.getBoundingClientRect();
                // const dhRect = dragHandle.getBoundingClientRect(); // dragHandle non ha dimensioni proprie se è solo un overlay
                console.log("  waveController Rect:", JSON.stringify(wcRect));
                // console.log("  dragHandle Rect:", JSON.stringify(dhRect));
                this.update(true);
                updateMaxScroll();
                calculateSnapPositions(waveController.offsetWidth);
                console.log(`  onPressInit: GSAP this.x=${this.x.toFixed(2)}, GSAP this.minX=${this.minX?.toFixed(2)}, GSAP this.maxX=${this.maxX?.toFixed(2)}, maxScroll=${maxScroll.toFixed(2)}`);
                // this.startPointerX = this.pointerX; // GSAP lo fa già con this.startX
                console.log(`  onPressInit: GSAP this.startX=${this.startX.toFixed(2)}, GSAP this.startY=${this.startY.toFixed(2)}`);
                console.log("--- Fine Draggable onPressInit ---");
            },
            onDrag: function() { // Step 3: Logica onDrag corretta
                const controllerWidth = waveController.offsetWidth;
                if (controllerWidth === 0) {
                    if (typeof this.noWidthWarn === 'undefined') { // Logga l'avviso solo una volta
                        console.warn("onDrag: controllerWidth è 0. Drag non possibile.");
                        this.noWidthWarn = true;
                    }
                    return;
                }

                const controllerRect = waveController.getBoundingClientRect();
                let pointerXRelativeToController = this.pointerX - controllerRect.left;
                pointerXRelativeToController = Math.max(0, Math.min(pointerXRelativeToController, controllerWidth)); // Clamp

                const progress = (controllerWidth > 0) ? (pointerXRelativeToController / controllerWidth) : 0;

                if (typeof this.dragSampleCount === 'undefined') this.dragSampleCount = 0;
                this.dragSampleCount++;
                if (this.dragSampleCount % 15 === 0) { // Logga meno frequentemente (Step 4)
                    // console.log(`onDrag (camp.): pointerX=${this.pointerX.toFixed(2)}, controllerX=${controllerRect.left.toFixed(2)}, relPointerX=${pointerXRelativeToController.toFixed(2)}, progress=${progress.toFixed(3)}`);
                }

                const scrollToY = progress * maxScroll;
                window.scrollTo(0, scrollToY);

                if (waveSvg) { // Animazione SVG (Step 4)
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
                        // if (this.dragSampleCount % 60 === 0) { // Logga path SVG molto meno frequentemente (Step 4)
                        //      console.log(`  SVG Path d (camp.): ${newPathD.substring(0,100)}...`);
                        // }
                        wavePath.setAttribute('d', newPathD);
                    }
                }
            },
            onDragEnd: function() {
                const controllerWidth = waveController.offsetWidth;
                const controllerRect = waveController.getBoundingClientRect();
                let finalPointerXRelativeToController = this.pointerX - controllerRect.left;
                finalPointerXRelativeToController = Math.max(0, Math.min(finalPointerXRelativeToController, controllerWidth));
                console.log(`--- Draggable onDragEnd --- finalPointerXRelativeToController: ${finalPointerXRelativeToController.toFixed(2)} (valore per lo snap logico)`);
            },
            snap: { // Step 3: Logica snap.x corretta
                x: function(endValue) {
                    const controllerWidth = waveController.offsetWidth;
                    if (controllerWidth === 0) {
                        console.warn("Snap: controllerWidth è 0. Impossibile eseguire snap logico.");
                        return endValue;
                    }

                    const controllerRect = waveController.getBoundingClientRect();
                    let currentPointerX = this.pointerX - controllerRect.left;
                    currentPointerX = Math.max(0, Math.min(currentPointerX, controllerWidth));

                    console.log(`--- Snap Inizio --- endValue (GSAP this.x)=${endValue.toFixed(2)}, CALCOLATO currentPointerX=${currentPointerX.toFixed(2)}`);

                    if (sectionSnapXValues.length === 0) {
                        console.warn(`Snap: Nessun punto di snap (${sectionSnapXValues.length}). Lo scroll rimane alla posizione corrente del dito.`);
                        console.log(`--- Snap Fine (nessun punto) ---`);
                        return endValue;
                    }

                    let closestSnapValue = sectionSnapXValues[0];
                    let minDifference = Math.abs(currentPointerX - closestSnapValue);
                    // console.log(`  Snap Loop: Iniziale closestSnapValue=${closestSnapValue.toFixed(2)} (basato su currentPointerX), minDifference=${minDifference.toFixed(2)}`);

                    for (let i = 0; i < sectionSnapXValues.length; i++) {
                        const currentSnapPoint = sectionSnapXValues[i];
                        const difference = Math.abs(currentPointerX - currentSnapPoint);
                        // if (this.vars.snapDebug) { // Log condizionale (Step 4)
                        //     console.log(`    Checking snapPoint ${currentSnapPoint.toFixed(2)}, difference con currentPointerX=${difference.toFixed(2)}`);
                        // }
                        if (difference < minDifference) {
                            minDifference = difference;
                            closestSnapValue = currentSnapPoint;
                            // if (this.vars.snapDebug) {
                            //     console.log(`      Nuovo closestSnapValue: ${closestSnapValue.toFixed(2)}, minDifference=${minDifference.toFixed(2)}`);
                            // }
                        }
                    }
                    console.log(`Snap: Valore puntatore ${currentPointerX.toFixed(2)} -> Snap logico a ${closestSnapValue.toFixed(2)} (valore X sull'onda)`);

                    if (controllerWidth > 0 && maxScroll > 0) {
                        const snapProgress = closestSnapValue / controllerWidth;
                        const snapToY = snapProgress * maxScroll;
                        console.log(`  Animazione ScrollTo: Y=${snapToY.toFixed(2)} (progress: ${snapProgress.toFixed(3)})`);
                        gsap.to(window, {
                            duration: 0.4,
                            scrollTo: { y: snapToY, autoKill: true },
                            ease: "power2.out",
                            onComplete: () => console.log("  Animazione ScrollTo completata.")
                        });
                    } else {
                        console.log("  Snapping (animazione scroll) non eseguito: controllerWidth o maxScroll sono 0.");
                    }

                    console.log(`--- Snap Fine ---`);
                    return endValue;
                }
                // snapDebug: true // Flag per log condizionali (Step 4) - Rimosso, i log diretti sono più semplici
            }
        })[0];

        if (draggableInstance) {
            console.log("GSAP Draggable inizializzato sull'handle. Istanza:", draggableInstance);
            if (waveController.classList.contains('is-active') && waveController.offsetWidth > 0) {
                console.log("Controller già attivo e visibile all'inizializzazione di Draggable.");
                draggableInstance.update(true);
                calculateSnapPositions(waveController.offsetWidth);
            }
        } else {
            console.error("Errore critico: Istanza Draggable non creata.");
        }
        console.log("--- Fine initializeDraggable ---");
    }

    function toggleNavController() {
        console.log("--- toggleNavController CHIAMATA! ---");
        const preToggleWcRect = waveController.getBoundingClientRect(); // Step 4: Log getBoundingClientRect
        console.log("  Stato Pre-Toggle: body.wave-nav-active?", body.classList.contains('wave-nav-active'), ", waveController.is-active?", waveController.classList.contains('is-active'));
        console.log(`  waveController Pre-Toggle: offsetWidth=${waveController.offsetWidth}, Rect=${JSON.stringify(preToggleWcRect)}`);
        const preToggleComputed = getComputedStyle(waveController); // Step 4: Log getComputedStyle
        console.log(`  waveController Pre-Toggle Computed: transform=${preToggleComputed.transform}, visibility=${preToggleComputed.visibility}`);

        body.classList.toggle('wave-nav-active');
        waveController.classList.toggle('is-active');
        const isActive = waveController.classList.contains('is-active');
        
        console.log("  Stato Post-Toggle: Controller di navigazione ", isActive ? "APERTO" : "CHIUSO");
        const postToggleWcRect = waveController.getBoundingClientRect(); // Step 4
        console.log(`  waveController Post-Toggle: offsetWidth=${waveController.offsetWidth}, Rect=${JSON.stringify(postToggleWcRect)}`);
        const postToggleComputed = getComputedStyle(waveController); // Step 4
        console.log(`  waveController Post-Toggle Computed: transform=${postToggleComputed.transform}, visibility=${postToggleComputed.visibility}`);


=======
    // Variabile per maxScroll, aggiornata anche al resize
    let maxScroll = document.body.scrollHeight - window.innerHeight;

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

            // Mappa la posizione verticale della sezione a una posizione X sull'onda
            let snapX = (sectionTop / maxScroll) * currentMaxX;
            snapX = Math.max(0, Math.min(snapX, currentMaxX)); // Clamp tra 0 e currentMaxX

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
                calculateSnapPositions(waveController.offsetWidth);
            }

            setTimeout(() => {
                console.log("  --- Timeout (150ms) post-apertura controller ---");
                const timeoutWcRect = waveController.getBoundingClientRect(); // Step 4
                console.log(`    waveController nel timeout: offsetWidth=${waveController.offsetWidth}, Rect=${JSON.stringify(timeoutWcRect)}`);
                if (draggableInstance) { // Step 4: Controllo if draggableInstance
                    console.log("    Aggiorno Draggable e ricalcolo snap nel timeout.");
                    draggableInstance.update(true);
                    calculateSnapPositions(waveController.offsetWidth);
                } else {
                    console.warn("    Draggable non trovato nel timeout post-apertura, tentativo di reinizializzazione.");
                    initializeDraggable();
                    if (draggableInstance) {
                        draggableInstance.update(true);
                        calculateSnapPositions(waveController.offsetWidth);
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
        }
        console.log("--- Fine toggleNavController ---");
    }

    if (trigger) {
        console.log("Associazione event listener 'click' a #nav-trigger.");
        trigger.addEventListener('click', toggleNavController);
    }

    const initialComputedStyle = getComputedStyle(waveController);
    const initialMatrix = new DOMMatrixReadOnly(initialComputedStyle.transform);
    const initialIsVisiblyTransformed = Math.abs(initialMatrix.m42) < 1;

    if (initialComputedStyle.visibility !== 'hidden' && initialIsVisiblyTransformed) {
        console.warn("Wave controller sembra visibile di default (visibility non hidden E transformY è circa 0).");
        if (!waveController.classList.contains('is-active')) {
            console.warn("  Aggiungo .is-active a waveController e body per coerenza.");
            waveController.classList.add('is-active');
            body.classList.add('wave-nav-active');
        }
        if (!draggableInstance) {
            console.warn("  Inizializzo Draggable dato che il controller è visibile di default.");
            initializeDraggable();
        }
    } else if (waveController.classList.contains('is-active')) {
        console.warn("Wave controller ha .is-active (magari da refresh pagina) ma Draggable potrebbe non essere inizializzato (o non visibile). Tento inizializzazione.");
        if (!draggableInstance) initializeDraggable();
    }

    window.addEventListener('resize', () => {
        console.log("--- Evento resize rilevato ---");
        const isActive = waveController.classList.contains('is-active'); // Step 4: Log stato controller
        console.log("  waveController.is-active durante resize:", isActive);
        console.log("  waveController.offsetWidth durante resize:", waveController.offsetWidth); // Step 4
        if (isActive) {
            console.log("  Controller attivo durante resize, ricalcolo.");
            if (draggableInstance) { // Step 4: Controllo if draggableInstance
                console.log("  Aggiorno Draggable e ricalcolo snap per resize.");
                draggableInstance.update(true);
                calculateSnapPositions(waveController.offsetWidth);
            } else {
                console.warn("  Draggable non esiste durante resize, anche se controller è attivo. Tento inizializzazione.");
                initializeDraggable();
            }
        } else {
            updateMaxScroll(); // Step 4: Log maxScroll
                 console.log("  --- Fine Timeout post-apertura controller ---");
            }, 150);
        } else {
            console.log("  Controller è INATTIVO.");
            // Potresti voler disabilitare il Draggable quando non visibile per performance, se necessario
            // if (draggableInstance) {
            //     console.log("  Disabilitazione Draggable.");
            //     draggableInstance.disable();
            // }
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
});
});
