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
    }
    if (!trigger) {
        console.warn("#nav-trigger NON TROVATO! Il toggle non funzionerà via click.");
    }
    if (sections.length === 0) {
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
            console.log("  Controller chiuso durante resize, aggiornato solo maxScroll. MaxScroll attuale:", maxScroll.toFixed(2));
        }
        console.log("--- Fine Evento resize ---");
    });

    console.log("--- Setup iniziale script completato ---");
    console.log("Sezioni valide per lo snapping:", Array.from(sections).map(s => s.id));
});