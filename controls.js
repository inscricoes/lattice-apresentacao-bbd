function mouseDragged() {
    if (recording) return;
    if (latticeIndex % 1 !== 0) return;

    let currentPos, mouseOffset;

    switch (mouseButton) {
        case LEFT: // mover único ponto
            if (originPos === undefined) {
                originPos = createVector(mouseX, mouseY);

                let lowerDistance = threshold;
                for (let c = 0; c < columns; c++) {
                    for (let r = 0; r < rows; r++) {
                        let distance = p5.Vector.add(lattice.control[c][r], lattice.displace[c][r][latticeIndex]).dist(originPos);
                        if (distance < threshold && distance < lowerDistance) {
                            movePoint = [c, r];
                            lowerDistance = distance;
                        }
                    }
                }
            }
            if (movePoint === undefined) return;

            currentPos = createVector(mouseX, mouseY);
            mouseOffset = p5.Vector.sub(currentPos, lattice.control[movePoint[0]][movePoint[1]]);
            if (restrictX) mouseOffset.y = lattice.displace[movePoint[0]][movePoint[1]][latticeIndex].y;
            if (restrictY) mouseOffset.x = lattice.displace[movePoint[0]][movePoint[1]][latticeIndex].x;
            lattice.displace[movePoint[0]][movePoint[1]][latticeIndex].set(mouseOffset);
            break;

        case RIGHT: // mover todos os pontos
            if (originPos === undefined) {
                originPos = createVector(mouseX, mouseY);
                originalDisplace = [];
                for (let c = 0; c < columns; c++) {
                    originalDisplace[c] = [];
                    for (let r = 0; r < rows; r++) {
                        originalDisplace[c][r] = p5.Vector.copy(lattice.displace[c][r][latticeIndex]);
                    }
                }
            }

            currentPos = createVector(mouseX, mouseY);
            mouseOffset = p5.Vector.sub(currentPos, originPos);
            if (restrictX) mouseOffset.y = 0;
            if (restrictY) mouseOffset.x = 0;
            for (let c = 0; c < columns; c++) {
                for (let r = 0; r < rows; r++) {
                    let newDisplace = p5.Vector.add(originalDisplace[c][r], mouseOffset);
                    lattice.displace[c][r][latticeIndex].set(newDisplace);
                }
            }
            break;
        case CENTER:
            let zoomAmount = createVector((mouseX - pmouseX), (pmouseY - mouseY));
            zoomAmount.mult(0.005);

            for (let c = 0; c < columns; c++) {
                for (let r = 0; r < rows; r++) {
                    let controlZoom = p5.Vector.copy(lattice.control[c][r]);
                    controlZoom.sub(width / 2, height / 2);
                    controlZoom.mult(zoomAmount);

                    let displaceZoom = p5.Vector.copy(lattice.displace[c][r][latticeIndex]);
                    displaceZoom.mult(zoomAmount);

                    totalZoom = p5.Vector.add(controlZoom, displaceZoom);

                    if (keyIsDown(CONTROL)) totalZoom.x *= 0;
                    if (keyIsDown(SHIFT)) totalZoom.y *= 0;

                    lattice.displace[c][r][latticeIndex].add(totalZoom);
                }
            }
            break;
    }
}

function mouseReleased() {
    originPos = undefined;
    movePoint = undefined;
}

function keyTyped() {
    if (recording) return;

    // evitar funções caso digitando texto
    const activeElement = document.activeElement;
    if ((activeElement.tagName === 'INPUT' && activeElement.type === 'text') ||
        (activeElement.tagName === 'TEXTAREA')) {
        return;
    }
    if (playAnimation) return;

    switch (key.toLowerCase()) {
        case 'h': // esconder/ revelar lattice
            toggleVisibility();
            break;
        case 's': // salvar imagem
            saveImage();
            break;
        case 'd': // debug
            print("debug!! (does nothing lol)");
            break;
    }
}

function keyPressed() {
    // evitar funções caso digitando texto
    const activeElement = document.activeElement;
    if ((activeElement.tagName === 'INPUT' && activeElement.type === 'text') ||
        (activeElement.tagName === 'TEXTAREA')) {
        return;
    }

    if (keyCode === 32 && !recording) togglePlayAnimation();

    if (recording || playAnimation) return;

    switch (keyCode) {
        case UP_ARROW:
            changeKeyframe(1);
            break;
        case RIGHT_ARROW:
            changeKeyframe(1);
            break;
        case DOWN_ARROW:
            changeKeyframe(-1);
            break;
        case LEFT_ARROW:
            changeKeyframe(-1);
            break;
        case BACKSPACE:
            if (latticeIndex % 1 === 0) lattice.resetDisplacement(latticeIndex);
            break;
    }
}

function mouseWheel(event) {
    if (recording) return;
    if (latticeIndex % 1 !== 0) return;
    if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) return;

    let zoomAmount = -event.delta * 0.00025;

    for (let c = 0; c < columns; c++) {
        for (let r = 0; r < rows; r++) {
            let controlZoom = p5.Vector.copy(lattice.control[c][r]);
            controlZoom.sub(width / 2, height / 2);
            controlZoom.mult(zoomAmount);

            let displaceZoom = p5.Vector.copy(lattice.displace[c][r][latticeIndex]);
            displaceZoom.mult(zoomAmount);

            totalZoom = p5.Vector.add(controlZoom, displaceZoom);

            if (keyIsDown(CONTROL)) totalZoom.x *= 0;
            if (keyIsDown(SHIFT)) totalZoom.y *= 0;

            lattice.displace[c][r][latticeIndex].add(totalZoom);
        }
    }
}

// remover zoom
document.addEventListener('wheel', event => {
    if (event.ctrlKey) event.preventDefault();
}, { passive: false });

// remover scroll do espaço
document.addEventListener('keydown', event => {
    if (event.key === ' ' || event.code === 'Space') {
        const activeElement = document.activeElement;
        if ((activeElement.tagName !== 'INPUT' || activeElement.type !== 'text') &&
            (activeElement.tagName !== 'TEXTAREA')) {
            event.preventDefault();
        }
    }
});