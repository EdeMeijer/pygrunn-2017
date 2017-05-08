'use strict';

(function () {
    const DIST_Y = 60;
    const NODE_RADIUS = 15;
    const SIGNAL_RADIUS = 7;
    const MARGIN_Y = NODE_RADIUS;

    bindNeuralNet(
        'ann-slide',
        'ann-diagram',
        [3, 6, 2],
        {
            marginX: 205,
            distX: 300
        }
    );

    bindNeuralNet(
        'deep-network-diagram-fragment', 
        'deep-network-diagram',
        [3, 6, 6, 5, 4, 2],
        {
            marginX: 135,
            animDuration: 400
        }
    );
    
    function bindNeuralNet(
        fragmentOrSlideId, 
        elementId, 
        layerSizes,
        options
    ) {
        const fragmentOrSlide = $('#' + fragmentOrSlideId);
        const a = document.getElementById(elementId);
        
        const marginX = options.marginX || 0;
        const distX = options.distX || 150;
        const animDuration = options.animDuration || 700;
        
        const layers = layerSizes.map(size => ({num: size}));
        layers[0].color = '#E05E30';
        layers[layers.length - 1].color = '#444488';
        
        const maxNodes = layers.reduce((max, layer) => Math.max(max, layer.num), 0);

        const rad2deg = rad => rad * 180 / Math.PI;

        const nodeX = layer => marginX + layer * distX;
        const nodeY = (layer, node) => MARGIN_Y + DIST_Y * ((maxNodes - layers[layer].num) / 2 + node);

        const addNode = (layer, node) => {
            const color = layers[layer].color || '#777';
            return new mojs.Shape({
                parent: a,
                left: nodeX(layer),
                top: nodeY(layer, node),
                shape: 'circle',
                isShowStart: true,
                fill: {[color]: '#FFF'},
                radius: NODE_RADIUS,
                duration: 2
            }).then({
                fill: {'#FFF': color},
                duration: 500
            });
        };

        const addConnection = (layer1, node1, layer2, node2) => {
            const x1 = nodeX(layer1);
            const y1 = nodeY(layer1, node1);
            const x2 = nodeX(layer2);
            const y2 = nodeY(layer2, node2);

            const x = (x1 + x2) / 2;
            const y = (y1 + y2) / 2;

            const angle = Math.atan2(y2 - y1, x2 - x1);
            const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

            new mojs.Shape({
                parent: a,
                left: x,
                top: y,
                strokeWidth: 1.5,
                shape: 'line',
                isShowStart: true,
                stroke: '#FFF',
                opacity: 0.2,
                radius: length / 2,
                angle: rad2deg(angle)
            });
        };

        const addSignal = (layer1, node1, layer2, node2) => {
            const x1 = nodeX(layer1);
            const y1 = nodeY(layer1, node1);
            const x2 = nodeX(layer2);
            const y2 = nodeY(layer2, node2);

            const angle = Math.atan2(y2 - y1, x2 - x1);
            const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
            const durationRatio = Math.pow(length / (x2 - x1), 0.35);

            return new mojs.Shape({
                parent: a,
                left: x1,
                top: y1,
                x: {0: x2 - x1},
                y: {0: y2 - y1},
                shape: 'line',
                stroke: '#FFF',
                opacity: 0.4,
                radius: SIGNAL_RADIUS,
                angle: rad2deg(angle),
                // duration: Math.sqrt(length) * 40,
                duration: animDuration * durationRatio,
                easing: x => x
            });
        };

        const animSteps = [];
        for (let l = 0; l < layers.length; l++) {
            animSteps.push([]);
        }

        // Draw connnections
        for (let l = 1; l < layers.length; l++) {
            const layer = layers[l];
            const prevLayer = layers[l - 1];
            for (let pn = 0; pn < prevLayer.num; pn++) {
                for (let n = 0; n < layer.num; n++) {
                    addConnection(l - 1, pn, l, n);
                }
            }
        }

        // Draw signals
        for (let l = 1; l < layers.length; l++) {
            const layer = layers[l];
            const prevLayer = layers[l - 1];
            for (let pn = 0; pn < prevLayer.num; pn++) {
                for (let n = 0; n < layer.num; n++) {
                    animSteps[l - 1].push(addSignal(l - 1, pn, l, n));
                }
            }
        }

        // Draw nodes
        for (let l = 0; l < layers.length; l++) {
            const layer = layers[l];
            for (let n = 0; n < layer.num; n++) {
                animSteps[l].push(addNode(l, n));
            }
        }

        // Handle animations
        let animStep = 0;
        let nextAnimTimeout = null;

        function animateNextStep() {
            animSteps[animStep].forEach(shape => shape.play());
            animStep = (animStep + 1) % animSteps.length;
            nextAnimTimeout = setTimeout(animateNextStep, animDuration * 0.95 + (animStep === 0 ? 1000 : 0));
        }

        fragmentOrSlide.on('show', () => {
            nextAnimTimeout = setTimeout(animateNextStep, 500);
        });

        fragmentOrSlide.on('hide', () => {
            animStep = 0;
            if (nextAnimTimeout !== null) {
                clearTimeout(nextAnimTimeout);
                nextAnimTimeout = null;
            }
        });
    }
})();
