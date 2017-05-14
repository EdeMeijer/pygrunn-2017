'use strict';

(function () {
    const SAMPLE_RADIUS = 7;
    const MARGIN_X = 250;
    const HEIGHT = 300;
    const WIDTH = 500;

    const COL_ORANGE = '#E05E30';
    const COL_BLUE = '#444488';
    const COL_GREEN = '#3c9f3d';

    bindLinearRegression('linear-regression-slide', 'linear-regression-diagram');

    bindLogisticRegression('logistic-regression-slide', 'logistic-regression-diagram');

    bindDecisionTrees('decision-trees-slide', 'decision-trees-diagram');

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

    function rnd(seed) {
        let m_w = typeof seed === 'undefined' ? 123456789 : seed;
        let m_z = 987654321;
        const mask = 0xffffffff;

        return function () {
            m_z = (36969 * (m_z & 65535) + (m_z >> 16)) & mask;
            m_w = (18000 * (m_w & 65535) + (m_w >> 16)) & mask;
            let result = ((m_z << 16) + m_w) & mask;
            result /= 4294967296;
            return result + 0.5;
        }
    }

    function randomNormal(rng) {
        const u = 1 - rng();
        const v = 1 - rng();
        return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    }

    function rad2deg(rad) {
        return rad * 180 / Math.PI;
    }

    function lineOptions(x1, y1, x2, y2) {
        const x = (x1 + x2) / 2;
        const y = (y1 + y2) / 2;

        const angle = Math.atan2(y2 - y1, x2 - x1);
        const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

        return {
            left: 0,
            top: 0,
            x: x,
            y: y,
            shape: 'line',
            radius: length / 2,
            angle: rad2deg(angle)
        };
    }

    function addGridLine(parent, x1, y1, x2, y2) {
        const opt = lineOptions(x1, y1, x2, y2);
        opt.parent = parent;
        opt.strokeWidth = 2.5;
        opt.isShowStart = true;
        opt.stroke = '#AAA';

        return new mojs.Shape(opt);
    }

    function addSample(parent, x, y, color) {
        return new mojs.Shape({
            parent: parent,
            left: x,
            top: y,
            shape: 'circle',
            isShowStart: true,
            fill: color,
            radius: SAMPLE_RADIUS,
        })
    }

    function predictLineOptions(intercept, slope) {
        return lineOptions(MARGIN_X, HEIGHT - intercept, MARGIN_X + WIDTH, HEIGHT - (intercept + WIDTH * slope));
    }

    function addPredictionLine(parent, intercepts, slopes) {
        const opt = predictLineOptions(intercepts[0], slopes[0]);
        opt.parent = parent;
        opt.strokeWidth = 5;
        opt.isShowStart = true;
        opt.stroke = COL_BLUE;
        opt.duration = 1000;

        let shape = new mojs.Shape(opt);

        for (let i = 1; i < intercepts.length; i++) {
            const opt2 = predictLineOptions(intercepts[i], slopes[i]);
            opt2.duration = 2000;
            shape = shape.then(opt2);
        }

        return shape;
    }

    function bindLinearRegression(fragmentOrSlideId, elementId) {
        const $fragmentOrSlide = $('#' + fragmentOrSlideId);
        const parent = document.getElementById(elementId);

        addGridLine(parent, MARGIN_X, 0, MARGIN_X, HEIGHT);
        addGridLine(parent, MARGIN_X, HEIGHT, MARGIN_X + WIDTH, HEIGHT);

        const random = rnd(12345);

        const intercept = 40;
        const slope = 0.4;

        for (let x = 30; x < WIDTH - 15; x += random() * 30) {
            const y = intercept + x * slope + randomNormal(random) * (5 + x * 0.1);
            addSample(parent, MARGIN_X + x, HEIGHT - y, COL_ORANGE);
        }

        const predictLine = addPredictionLine(
            parent,
            [0, intercept],
            [0.1, slope]
        );

        $fragmentOrSlide.on('show', () => {
            predictLine.play();
        });

        $fragmentOrSlide.on('hide', () => {
            predictLine.reset();
        });
    }

    function bindLogisticRegression(fragmentOrSlideId, elementId) {
        const $fragmentOrSlide = $('#' + fragmentOrSlideId);
        const parent = document.getElementById(elementId);

        addGridLine(parent, MARGIN_X, 0, MARGIN_X, HEIGHT);
        addGridLine(parent, MARGIN_X, HEIGHT, MARGIN_X + WIDTH, HEIGHT);

        const random = rnd(12345);
        const random2 = rnd(1234);

        const intercept = 250;
        const slope = -0.5;

        for (let i = 0; i < 40; i++) {
            const x = random() * WIDTH;
            const y = random() * (HEIGHT - 10) + 10;
            const boundary = intercept + x * slope + randomNormal(random2) * 30;
            const color = y >= boundary ? COL_ORANGE : COL_GREEN;
            addSample(parent, MARGIN_X + x, HEIGHT - y, color);
        }

        const predictLine = addPredictionLine(
            parent,
            [0, intercept],
            [0.3, slope]
        );

        $fragmentOrSlide.on('show', () => {
            predictLine.play();
        });

        $fragmentOrSlide.on('hide', () => {
            predictLine.reset();
        });
    }

    function bindDecisionTrees(fragmentOrSlideId, elementId) {
        const $fragmentOrSlide = $('#' + fragmentOrSlideId);
        const $parent = $('#' + elementId);

        $parent.find('div').hide();

        $fragmentOrSlide.on('show', () => {
            setTimeout(() => {
                $('#dt-q1').fadeIn();
                
                setTimeout(() => {
                    $('#dt-r1').fadeIn();
                    $('#dt-q2').fadeIn();

                    setTimeout(() => {
                        $('#dt-r2').fadeIn();
                        $('#dt-q3').fadeIn();

                        setTimeout(() => {
                            $('#dt-r3').fadeIn();
                            $('#dt-q4').fadeIn();

                            setTimeout(() => {
                                $('#dt-r4').fadeIn();
                                $('#dt-r5').fadeIn();
                            }, 200)
                        }, 200)
                    }, 200)
                }, 200)
            }, 500)
        });

        $fragmentOrSlide.on('hide', () => {
            setTimeout(() => $parent.find('div').hide(), 500);
        });
    }

    function bindNeuralNet(fragmentOrSlideId, elementId, layerSizes, options) {
        const DIST_Y = 65;
        const NODE_RADIUS = 15;
        const SIGNAL_RADIUS = 7;
        const MARGIN_Y = NODE_RADIUS;

        const $fragmentOrSlide = $('#' + fragmentOrSlideId);
        const parent = document.getElementById(elementId);

        const marginX = options.marginX || 0;
        const distX = options.distX || 150;
        const animDuration = options.animDuration || 700;

        const layers = layerSizes.map(size => ({num: size}));
        layers[0].color = COL_ORANGE;
        layers[layers.length - 1].color = COL_BLUE;

        const maxNodes = layers.reduce((max, layer) => Math.max(max, layer.num), 0);

        const nodeX = layer => marginX + layer * distX;
        const nodeY = (layer, node) => MARGIN_Y + DIST_Y * ((maxNodes - layers[layer].num) / 2 + node);

        const addNode = (layer, node) => {
            const color = layers[layer].color || '#777';
            return new mojs.Shape({
                parent: parent,
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
            const opt = lineOptions(nodeX(layer1), nodeY(layer1, node1), nodeX(layer2), nodeY(layer2, node2));
            opt.parent = parent;
            opt.strokeWidth = 1.5;
            opt.isShowStart = true;
            opt.stroke = '#FFF';
            opt.opacity = 0.2;

            new mojs.Shape(opt);
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
                parent: parent,
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

        $fragmentOrSlide.on('show', () => {
            nextAnimTimeout = setTimeout(animateNextStep, 1000);
        });

        $fragmentOrSlide.on('hide', () => {
            animStep = 0;
            if (nextAnimTimeout !== null) {
                clearTimeout(nextAnimTimeout);
                nextAnimTimeout = null;
            }
        });
    }
})();
