'use strict';

(function () {
    const DIST_Y = 60;
    const DIST_X = 150;
    const NODE_RADIUS = 15;
    const SIGNAL_RADIUS = 7;
    const ANIM_DURATION = 700;
    const MARGIN_X = 210;
    const MARGIN_Y = NODE_RADIUS;

    const $fragment = $('#deep-network-diagram-fragment');
    const a = document.getElementById('deep-network-diagram');

    const layers = [
        {num: 3, color: '#E05E30'},
        {num: 6},
        {num: 6},
        {num: 5},
        {num: 2, color: '#444488'}
    ];
    const maxNodes = layers.reduce((max, layer) => Math.max(max, layer.num), 0);
    
    const rad2deg = rad => rad * 180 / Math.PI;

    const nodeX = layer => MARGIN_X + layer * DIST_X;
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

        const x = (x1 + x2) / 2;
        const y = (y1 + y2) / 2;
        const angle = Math.atan2(y2 - y1, x2 - x1);

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
            duration: ANIM_DURATION,
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
    function animateNextStep() {
        animSteps[animStep].forEach(shape => shape.play());
        animStep = (animStep + 1) % animSteps.length;
        setTimeout(animateNextStep, ANIM_DURATION - 50 + (animStep === 0 ? 1000 : 0));
    }
    
    let animating = false;
    $fragment.on('show', () => {
        if (!animating) {
            animating = true;
            setTimeout(animateNextStep, 500);
        }
    });
})();
