'use strict';

(function () {
    const SAMPLE_RADIUS = 7;
    const HEIGHT = 300;
    const WIDTH = 500;

    const COL_ORANGE = '#E05E30';
    const COL_BLUE = '#444488';
    const COL_GREEN = '#3c9f3d';

    bindLinearRegression('linear-regression-slide', 'linear-regression-diagram', 250);

    bindLogisticRegression('logistic-regression-slide', 'logistic-regression-diagram', 250);

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

    bindGradientDescent('gd-fragment', 'gd-diagram');

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

    function lineUpdateOptions(x1, y1, x2, y2) {
        const x = (x1 + x2) / 2;
        const y = (y1 + y2) / 2;

        const angle = Math.atan2(y2 - y1, x2 - x1);
        const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

        return {
            x: x,
            y: y,
            radius: length / 2,
            angle: rad2deg(angle)
        };
    }

    function lineOptions(x1, y1, x2, y2) {
        const opt = lineUpdateOptions(x1, y1, x2, y2);
        opt.left = 0;
        opt.top = 0;
        opt.shape = 'line';
        opt.strokeLinecap = 'round';
        return opt;
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

    function addPredictionLine(parent, intercepts, slopes, marginX) {
        const opt = lineOptions(marginX, HEIGHT - intercepts[0], marginX + WIDTH, HEIGHT - (intercepts[0] + WIDTH * slopes[0]));
        opt.parent = parent;
        opt.strokeWidth = 5;
        opt.isShowStart = true;
        opt.stroke = COL_BLUE;
        opt.duration = 1000;

        let shape = new mojs.Shape(opt);

        for (let i = 1; i < intercepts.length; i++) {
            shape = updatePredictLine(shape, intercepts[i], slopes[i], null, marginX)
        }

        return shape;
    }

    function addStepLine(parent, x1, y1, x2, y2, marginX, delay) {
        const opt = lineOptions(marginX + x1, HEIGHT - y1, marginX + x1 + (x2 - x1) * 0.001, HEIGHT - (y1 + (y2 - y1) * 0.001));
        opt.parent = parent;
        opt.strokeWidth = 5;
        opt.isShowStart = false;
        opt.stroke = '#FFF';
        opt.duration = delay;
        opt.strokeOpacity = 0;

        const opt2 = lineUpdateOptions(marginX + x1, HEIGHT - y1, marginX + x2, HEIGHT - y2);
        opt2.duration = 250;

        return new mojs.Shape(opt).then({strokeOpacity: 1.0, duration: 10}).then(opt2);
    }

    function updatePredictLine(shape, intercept, slope, duration, marginX) {
        const opt2 = lineUpdateOptions(marginX, HEIGHT - intercept, marginX + WIDTH, HEIGHT - (intercept + WIDTH * slope));
        opt2.duration = duration || 2000;
        return shape.then(opt2);
    }

    function bindLinearRegression(fragmentOrSlideId, elementId, marginX) {
        const $fragmentOrSlide = $('#' + fragmentOrSlideId);
        const parent = document.getElementById(elementId);

        addGridLine(parent, marginX, 0, marginX, HEIGHT);
        addGridLine(parent, marginX, HEIGHT, marginX + WIDTH, HEIGHT);

        const random = rnd(12345);

        const intercept = 40;
        const slope = 0.4;

        for (let x = 30; x < WIDTH - 15; x += random() * 30) {
            const y = intercept + x * slope + randomNormal(random) * (5 + x * 0.1);
            addSample(parent, marginX + x, HEIGHT - y, COL_ORANGE);
        }

        const predictLine = addPredictionLine(
            parent,
            [0, intercept],
            [0.1, slope],
            marginX
        );

        $fragmentOrSlide.on('show', () => {
            predictLine.play();
        });

        $fragmentOrSlide.on('hide', () => {
            predictLine.reset();
        });
    }

    function bindLogisticRegression(fragmentOrSlideId, elementId, marginX) {
        const $fragmentOrSlide = $('#' + fragmentOrSlideId);
        const parent = document.getElementById(elementId);

        addGridLine(parent, marginX, 0, marginX, HEIGHT);
        addGridLine(parent, marginX, HEIGHT, marginX + WIDTH, HEIGHT);

        const random = rnd(12345);
        const random2 = rnd(1234);

        const intercept = 250;
        const slope = -0.5;

        for (let i = 0; i < 40; i++) {
            const x = random() * WIDTH;
            const y = random() * (HEIGHT - 10) + 10;
            const boundary = intercept + x * slope + randomNormal(random2) * 30;
            const color = y >= boundary ? COL_ORANGE : COL_GREEN;
            addSample(parent, marginX + x, HEIGHT - y, color);
        }

        const predictLine = addPredictionLine(
            parent,
            [0, intercept],
            [0.3, slope],
            marginX
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
            opt.opacity = 0.3;

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

    function bindGradientDescent(fragmentOrSlideId, elementId) {
        const $fragmentOrSlide = $('#' + fragmentOrSlideId);
        const parent = document.getElementById(elementId);

        const MARGIN_X = 450;

        addGridLine(parent, MARGIN_X, 0, MARGIN_X, HEIGHT);
        addGridLine(parent, MARGIN_X, HEIGHT, MARGIN_X + WIDTH, HEIGHT);

        const random = rnd(12345);

        const realIntercept = 0.13333;
        const realSlope = 0.4;

        const points = [];
        for (let x = 0.05; x < (WIDTH / HEIGHT); x += random() * 0.05) {
            const y = realIntercept + x * realSlope + randomNormal(random) * (0.015 + x * 0.1);
            points.push({x, y});
            addSample(parent, MARGIN_X + x * HEIGHT, (1 - y) * HEIGHT, COL_ORANGE);
        }

        const learningRate = 0.1;
        let params = {intercept: 0.4, slope: -0.6};

        const gradient = (params) => {
            let iGrad = 0.0;
            let sGrad = 0.0;
            const n = points.length;
            points.forEach(point => {
                const yHat = (params.slope * point.x) + params.intercept;
                const error = point.y - yHat;
                iGrad += -(2 / n) * error;
                sGrad += -(2 / n) * point.x * error;
            });
            return [iGrad, sGrad];
        };

        const gradientStep = () => {
            const grad = gradient(params);
            return {
                intercept: params.intercept - (learningRate * grad[0]),
                slope: params.slope - (learningRate * grad[1])
            };
        };

        const SAMPLES_DIM = 300;

        const I_MIN = -0.4;
        const I_MAX = 1.2;
        const S_MIN = -0.7;
        const S_MAX = 0.7;

        const sampleError = () => {
            const errors = [];
            
            for (let y = SAMPLES_DIM - 1; y >= 0; y--) {
                const slope = S_MIN + (S_MAX - S_MIN) * (y / SAMPLES_DIM);
                for (let x = 0; x < SAMPLES_DIM; x ++) {
                    const intercept = I_MIN + (I_MAX - I_MIN) * (x / SAMPLES_DIM);
                    let err = 0;
                    points.forEach(point => {
                        const yHat = (slope * point.x) + intercept;
                        err += Math.pow(point.y - yHat, 2);
                    });
                    

                    errors.push(Math.sqrt(err));
                }
            }
            return errors;
        };

        const $errPlot = $('<canvas id="error-plot" width="300" height="300">');
        const errPlot = $errPlot[0];
        const ctx = errPlot.getContext("2d");
        const imgData = ctx.getImageData(0, 0, SAMPLES_DIM, SAMPLES_DIM);
        const data = imgData.data;

        const errValues = sampleError();
        let maxErr = 0;
        let minErr = Infinity;
        errValues.forEach(err => {
            if (err > maxErr) {
                maxErr = err;
            }
            if (err < minErr) {
                minErr = err;
            }
        });

        const colorScale = chroma.scale([
            "#381e3c",
            '#2b55c0',
            '#178a42',
            '#b6ad23',
            '#d45919',
            '#d40800',
        ]).mode('lab');
        
        const colorCache = {};
        
        for (let i = 0; i < errValues.length; i++) {
            const err = errValues[i] / maxErr;
            const idx = i * 4;
            const colorCacheKey = Math.round(err * 25) / 25;
            if (colorCache[colorCacheKey] === undefined) {
                colorCache[colorCacheKey] = colorScale(colorCacheKey);
            }
            const col = colorCache[colorCacheKey];
            data[idx] = col.get('rgb.r');
            data[idx + 1] = col.get('rgb.g');
            data[idx + 2] = col.get('rgb.b');
            data[idx + 3] = 255
        }
        ctx.putImageData(imgData, 0, 0);

        $(parent).append($errPlot);

        const recordSteps = [0, 1, 2, 4, 8, 16, 30, 50,75, 512];
        let predictLine = addPredictionLine(parent, [params.intercept * HEIGHT], [params.slope], MARGIN_X);
        let stepLines = [];

        let prevParams = params;
        for (let i = 0; i <= 512; i++) {
            params = gradientStep();
            
            if (recordSteps.indexOf(i) > -1) {
                predictLine = updatePredictLine(predictLine, params.intercept * HEIGHT, params.slope, 250, MARGIN_X);
                predictLine = updatePredictLine(predictLine, params.intercept * HEIGHT, params.slope, 500, MARGIN_X);
                
                const x1 = ((prevParams.intercept - I_MIN) / (I_MAX - I_MIN)) * SAMPLES_DIM;
                const y1 = ((prevParams.slope - S_MIN) / (S_MAX - S_MIN)) * SAMPLES_DIM;
                const x2 = ((params.intercept - I_MIN) / (I_MAX - I_MIN)) * SAMPLES_DIM;
                const y2 = ((params.slope - S_MIN) / (S_MAX - S_MIN)) * SAMPLES_DIM;
                
                stepLines.push(addStepLine(parent, x1, y1, x2, y2, 60, 1000 + recordSteps.indexOf(i) * 750));
                prevParams = params;
            }
        }

        $fragmentOrSlide.on('show', () => {
            predictLine.play();
            stepLines.forEach(l => l.play());
        });

        $fragmentOrSlide.on('hide', () => {
            predictLine.reset();
            stepLines.forEach(l => l.stop());
            stepLines.forEach(l => l.reset());
        });
    }
})();
