// canvas
let mode = window.innerWidth > 600 ? 'wide' : 'square';
let canvasSize = mode === 'wide' ? [1920, 1080] : [1080, 1080];
let scalling;
const padding = 20;
const uiWidth = 310;

// text
let inputString = pageLanguage === 'en' ? "WHAT IS IT\nYOU NOTICE" : "DESCOBRI\nSUAS CORES";
let font;
const fontSize = mode === 'wide' ? 120 : 50;
let lineHeightFac = 0.9;
let lineHeight = fontSize * lineHeightFac;
let letter = [];
const sample = mode === 'wide' ? 0.5 : 0.5; // quantidade de detalhe
const sampleError = 1.05; // o sampleError compensa a distância variável entre os pontos criados

// color
let textColor;
let bgColor;

// lattice
let lattice;
let latticeIndex = 0;
let maxLatticeIndex = 4;
const latticeIndexCap = 12;
let boundingBox = [];
let latticeDisplay = 0;
let columns = 6;
let rows = 3;
let originPos, pivotPos, movePoint;
const threshold = 50;
let restrictX, restrictY;

// animation
let currentFrame = 0;
let playAnimation = false;
let animationTransition = 10;
let animationStatic = 20;
let interpolationType = 0;
let factorExponent = 4;
let maxFrame, keyframeTime, keyframeCurrent;

// video export
let encoder;
const fps = 30;
let recording = false;
let recordedFrames = 0;

function preload() {
    font = loadFont("fonts/DMSans-Black.ttf");
    setupMP4Encoder();
}

function setup() {
    // canvas
    getCanvasSize();
    mainCanvas = createCanvas(canvasSize[0], canvasSize[1]).parent('#canvas-project');
    canvas.oncontextmenu = (e) => { e.preventDefault(); e.stopPropagation(); } // remover botão direito
    frameRate(fps);
    pixelDensity(1);
    createInterface();
    updateColor();

    // texto
    createLetters(inputString, fontSize, lineHeight);
    createLattice(columns, rows);
}

function getCanvasSize() {
    if (window.innerWidth > 600) {
        let canvasRatio = mode === 'wide' ? 1080 / 1920 : 1080 / 1080;
        let minCanvasWidth = window.innerWidth - uiWidth - padding;
        let minCanvasHeight = window.innerHeight - padding;
        let canvasSize1 = [minCanvasWidth, minCanvasWidth * canvasRatio];
        let canvasSize2 = [minCanvasHeight / canvasRatio, minCanvasHeight];
        canvasSize = [min(canvasSize1[0], canvasSize2[0]), min(canvasSize1[1], canvasSize2[1])];
        canvasSize = [max(canvasSize[0], 360), max(canvasSize[1], 360 * canvasRatio)];
        scalling = map(canvasSize[1], 0, 1080, 0, 1);
    } else {
        let canvasRatio = 1080 / 1080;
        let canvasWidth = window.innerWidth - padding * 2;
        canvasSize = [canvasWidth, canvasWidth];
        scalling = map(canvasSize[1], 0, 1080, 0, 1);
    }
}

function windowResized() {
    if (recording) return;
    getCanvasSize();
    resizeCanvas(canvasSize[0], canvasSize[1]);
}

function draw() {
    background(bgColor);

    // animar
    if (playAnimation) {
        let transitionStep = min(currentFrame % keyframeTime, animationTransition);
        let transitionFactor = transitionStep / animationTransition;
        let interpolatedFactor;

        switch (interpolationType) {
            case 0:
                let interpolatedEaseInOut = transitionFactor < 0.5 ?
                    pow(transitionFactor * 2, factorExponent) / 2 :
                    1 - pow((1 - (transitionFactor - 0.5) * 2), factorExponent) / 2;
                interpolatedFactor = interpolatedEaseInOut;
                break;
            case 1:
                let interpolatedEaseOut = 1 - (1 - transitionFactor) ** factorExponent;
                interpolatedFactor = interpolatedEaseOut;
                break;
            case 2:
                let interpolatedEaseIn = transitionFactor ** factorExponent;
                interpolatedFactor = interpolatedEaseIn;
                break;
            case 3:
                interpolatedFactor = transitionFactor;
                break;
        }

        latticeIndex = (keyframeCurrent + interpolatedFactor) % maxLatticeIndex;

        currentFrame++;
        if (currentFrame % keyframeTime === 0) keyframeCurrent++;
        if (currentFrame === maxFrame) updateAnimationParameters();
    }

    // letras e lattice
    for (let l of letter) {
        l.update();
        l.show();
    }
    if (!playAnimation) lattice.show();

    // restringir movimento
    if (keyIsDown(SHIFT)) restrictX = true;
    else restrictX = false;
    if (keyIsDown(CONTROL)) restrictY = true;
    else restrictY = false;

    // gravação
    if (recording) recordVideo();
}