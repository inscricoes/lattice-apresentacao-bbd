function createInterface() {
  // TEXTO
  inputStringTextarea = select("#input--top-left");
  inputStringTextarea.value(inputString);

  lineHeightSubButton = select("#line-height-subtract").mousePressed(() => updateLineHeight(-0.05));
  lineHeightAddButton = select("#line-height-add").mousePressed(() => updateLineHeight(0.05));
  lineHeightValue = select("#line-height-value");

  updateTextButton = select("#text-update").mousePressed(updateText);

  // LATTICE
  columnsSubButton = select("#columns-subtract").mousePressed(() => updateLatticeColumns(-1));
  columnsAddButton = select("#columns-add").mousePressed(() => updateLatticeColumns(1));
  columnsValue = select("#columns-value");
  rowsSubButton = select("#rows-subtract").mousePressed(() => updateLatticeRows(-1));
  rowsAddButton = select("#rows-add").mousePressed(() => updateLatticeRows(1));
  rowsValue = select("#rows-value");

  // KEYFRAMES
  keyframeSubButton = select("#keyframe-subtract").mousePressed(() => changeKeyframe(-1));
  keyframeAddButton = select("#keyframe-add").mousePressed(() => changeKeyframe(1));
  keyframeValue = select("#keyframe-value");
  changeKeyframe();

  maxKeyframeSubButton = select("#max-keyframe-subtract").mousePressed(() => updateMaxKeyframe(-1));
  maxKeyframeAddButton = select("#max-keyframe-add").mousePressed(() => updateMaxKeyframe(1));
  maxKeyframeValue = select("#max-keyframe-value");

  animationTransitionInput = select("#animation-transition").input(resetPlayAnimation);
  animationStaticInput = select("#animation-static").input(resetPlayAnimation);

  exponentSubButton = select("#exponent-subtract").mousePressed(() => updateExponent(-0.5));
  exponentAddButton = select("#exponent-add").mousePressed(() => updateExponent(0.5));
  exponentValue = select("#exponent-value");
  updateExponent();

  copyPreviousKeyframeButton = select("#keyframe-copy-previous").mousePressed(() => lattice.copyKeyframe(-1));
  copyNextKeyframeButton = select("#keyframe-copy-next").mousePressed(() => lattice.copyKeyframe(1));
  resetCurrentKeyframeButton = select("#keyframe-reset-current").mousePressed(() => lattice.resetDisplacement(latticeIndex));
  resetAllKeyframesButton = select("#keyframe-reset-all").mousePressed(() => lattice.resetDisplacement());

  randomizeButton = select("#keyframe-randomize").mousePressed(randomizeKeyframe);

  // PREVIEW
  toggleVisibilityButton = select("#visibility-toggle").mousePressed(toggleVisibility);
  playAnimationButton = select("#animation-play").mousePressed(togglePlayAnimation);
  playAnimationButtonHTML = playAnimationButton.child('p');
  interpolationTypeInput = select("#animation-interpolation");

  // CORES
  textR = select("#text-r-input").input(updateColor);
  textG = select("#text-g-input").input(updateColor);
  textB = select("#text-b-input").input(updateColor);

  backgroundR = select("#bg-r-input").input(updateColor);
  backgroundG = select("#bg-g-input").input(updateColor);
  backgroundB = select("#bg-b-input").input(updateColor);

  // IMAGEM
  buttonPNG = select("#png").mousePressed(saveImage);

  // VÍDEO
  buttonMP4 = select("#mp4").mousePressed(startRecording);
  buttonMP4Text = buttonMP4.child('p');
  canvasContainer = select("#canvas-container");
}

function updateText() {
  if (playAnimation || recording) return;

  letter = [];
  inputString = inputStringTextarea.value();
  lineHeight = fontSize * lineHeightFac;
  createLetters(inputString, fontSize, lineHeight);
  createLattice(columns, rows);
}

function updateLineHeight(amount = 0) {
  if (playAnimation || recording) return;

  lineHeightFac = constrain(Number((lineHeightFac + amount).toFixed(2)), 0.5, 2);
  lineHeightValue.html(`${lineHeightFac.toFixed(2)}`);
  updateText();
}

function updateLatticeColumns(amount) {
  if (playAnimation || recording) return;

  columns = constrain(columns + amount, 2, 12);
  columnsValue.html(`${columns}`);
  createLattice(columns, rows);
}

function updateLatticeRows(amount) {
  if (playAnimation || recording) return;

  rows = constrain(rows + amount, 2, 12);
  rowsValue.html(`${rows}`);
  createLattice(columns, rows);
}

function changeKeyframe(amount = 0) {
  if (playAnimation || recording) return;

  if (amount === 0) latticeIndex = 0;
  else latticeIndex = constrain(latticeIndex + amount, 0, maxLatticeIndex - 1);
  keyframeValue.html(`${latticeIndex + 1}`);
}

function updateMaxKeyframe(amount) {
  if (playAnimation || recording) return;

  maxLatticeIndex = constrain(maxLatticeIndex + amount, 2, latticeIndexCap);
  maxKeyframeValue.html(`${maxLatticeIndex}`);
  if (latticeIndex >= maxLatticeIndex) {
    latticeIndex = constrain(latticeIndex, 0, maxLatticeIndex);
    keyframeValue.html(`${latticeIndex}`);
  }
}

function updateExponent(amount = 0) {
  if (recording) return;

  factorExponent = constrain(Number((factorExponent + amount).toFixed(1)), 1, 8);
  exponentValue.html(`${factorExponent.toFixed(1)}`);
}

function randomizeKeyframe() {
  lattice.randomizeDisplacement(latticeIndex);
}

function updateColor() {
  if (recording) return;

  let txr = textR.value() || 0;
  let txg = textG.value() || 0;
  let txb = textB.value() || 0;
  textColor = color(txr, txg, txb);

  let bgr = backgroundR.value() || 0;
  let bgg = backgroundG.value() || 0;
  let bgb = backgroundB.value() || 0;
  bgColor = color(bgr, bgg, bgb);
}

function toggleVisibility() {
  if (playAnimation || recording) return;
  latticeDisplay = (latticeDisplay + 1) % 3;
}

function togglePlayAnimation(forceState = undefined) {
  if (typeof forceState === 'boolean') playAnimation = forceState;
  else if (recording) return;
  else playAnimation = !playAnimation;

  if (playAnimation) {
    updateAnimationParameters();
    let buttonString = pageLanguage === 'en' ? 'stop animation' : 'parar animação';
    playAnimationButtonHTML.html(buttonString);
  } else {
    changeKeyframe(0);
    let buttonString = pageLanguage === 'en' ? 'play animation' : 'começar animação';
    playAnimationButtonHTML.html(buttonString);
  }
}

let resetAnimationTimeout;
function resetPlayAnimation() {
  if (resetAnimationTimeout) clearTimeout(resetAnimationTimeout);

  resetAnimationTimeout = setTimeout(() => {
    if (!playAnimation) return;
    updateAnimationParameters();
    changeKeyframe(0);
  }, 500);
}

function updateAnimationParameters() {
  if (recording) return;

  currentFrame = 0;
  keyframeCurrent = 0;
  latticeIndex = 0;
  animationTransition = animationTransitionInput.value() !== '' ? Number(animationTransitionInput.value()) : Number(animationTransitionInput.attribute('placeholder'));
  animationTransition = max(animationTransition, 1);
  animationStatic = animationStaticInput.value() !== '' ? Number(animationStaticInput.value()) : Number(animationStaticInput.attribute('placeholder'));
  keyframeTime = animationTransition + animationStatic;
  maxFrame = keyframeTime * maxLatticeIndex;
}

function interpolationMenu() {
  interpolationType = Number(interpolationTypeInput.value().substring("interpolation-".length));
}

function saveImage() {
  // desenhar imagem na resolução final
  push();
  let newRatio = 1 / scalling;
  resizeCanvas(1920, 1080);
  scale(newRatio);
  background(bgColor);
  for (let l of letter) l.show();
  save(mainCanvas, "lattice.png");

  // reverter para resolução original
  pop();
  getCanvasSize();
  resizeCanvas(canvasSize[0], canvasSize[1]);
}

function toggleAnchorVisibility() {
  animatePixelOffset = !animatePixelOffset;
  if (animatePixelOffset) buttonAnimateOffset.addClass('ui-button-selected');
  else buttonAnimateOffset.removeClass('ui-button-selected');
}