function setupMP4Encoder() {
  HME.createH264MP4Encoder().then(enc => {
    encoder = enc;
    encoder.outputFilename = 'Lattice-Animation';
    encoder.width = mode === 'wide' ? 1920 : 1080;
    encoder.height = 1080;
    encoder.frameRate = fps;
    encoder.kbps = 5000000; // taxa de dados ≈ 70 mbps
    encoder.quantizationParameter = 20; // 10 = melhor qualidade, 51 = melhor compressão
    encoder.groupOfPictures = 5; // diminuir para ações mais rápidas
    encoder.initialize();
  });
}

function startRecording() {
  canvasContainer.addClass('canvas-container-recording');
  togglePlayAnimation(true);
  resizeCanvas(1920, 1080);
  recording = true;
}

function stopRecording() {
  canvasContainer.removeClass('canvas-container-recording');
  togglePlayAnimation(false);
  getCanvasSize();
  resizeCanvas(canvasSize[0], canvasSize[1]);
  recording = false;
}

function recordVideo() {
  let newRatio = 1 / scalling;
  scale(newRatio);
  background(bgColor);
  for (let l of letter) l.show();

  // let videoProgress = ceil(recordedFrames * 100 / maxFrame);
  // buttonMP4Text.html(`recording... ${videoProgress}%`);

  encoder.addFrameRgba(drawingContext.getImageData(0, 0, encoder.width, encoder.height).data);
  recordedFrames++;

  if (recordedFrames === maxFrame) {
    recording = false;
    recordedFrames = 0;
    encoder.finalize();
    // let mp4String = pageLanguage === 'en' ? 'download mp4' : 'baixar mp4';
    // buttonMP4Text.html(mp4String);

    const uint8Array = encoder.FS.readFile(encoder.outputFilename);
    const anchor = document.createElement('a');
    anchor.href = URL.createObjectURL(new Blob([uint8Array], { type: 'video/mp4' }));
    anchor.download = encoder.outputFilename;
    anchor.click();
    encoder.delete();
    setupMP4Encoder();
    stopRecording();
  }
}