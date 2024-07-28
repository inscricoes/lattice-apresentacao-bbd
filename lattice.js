function createLattice(c, r) {
    columns = c;
    rows = r;
    lattice = new Lattice();
    for (let l of letter) l.getFactor();
}

class Lattice {
    constructor() {
        this.minX;
        this.minY;
        this.maxX;
        this.maxY;
        for (let l = 0; l < letter.length; l++) {
            for (let i = 0; i < letter[l].points.length; i++) {
                for (let j = 0; j < letter[l].points[i].length; j++) {
                    this.minX = min(this.minX, letter[l].points[i][j].x);
                    this.minY = min(this.minY, letter[l].points[i][j].y);
                    this.maxX = max(this.maxX, letter[l].points[i][j].x);
                    this.maxY = max(this.maxY, letter[l].points[i][j].y);
                }
            }
        }

        this.control = [];
        for (let c = 0; c < columns; c++) {
            this.control[c] = [];
            for (let r = 0; r < rows; r++) {
                let factorX = c / (columns - 1);
                let factorY = r / (rows - 1);
                let x = map(factorX, 0, 1, this.minX, this.maxX);
                let y = map(factorY, 0, 1, this.minY, this.maxY);
                this.control[c][r] = createVector(x, y);
            }
        }

        this.displace;
        this.resetDisplacement();
    }

    resetDisplacement(index = null) {
        if (index === null) { // resetar todos keyframes
            this.displace = [];
            for (let c = 0; c < columns; c++) {
                this.displace[c] = [];
                for (let r = 0; r < rows; r++) {
                    this.displace[c][r] = [];
                    for (let i = 0; i < latticeIndexCap; i++) this.displace[c][r][i] = createVector(0, 0);
                }
            }
        } else { // resetar keyframe atual
            for (let c = 0; c < columns; c++) {
                for (let r = 0; r < rows; r++) {
                    this.displace[c][r][index] = createVector(0, 0);
                }
            }
        }
    }

    randomizeDisplacement(index = null) {
        if (index === null) return;

        let displaceX = ((this.maxX - this.minX) / columns) * 0.5;
        let displaceY = ((this.maxY - this.minY) / rows) * 0.85;

        for (let c = 0; c < columns; c++) {
            for (let r = 0; r < rows; r++) {
                let leftFactor = c === 0 ? 2 : 1;
                let rightFactor = c === columns - 1 ? 2 : 1;
                let bottomFactor = r === 0 ? 2 : 1;
                let topFactor = r === rows - 1 ? 2 : 1;
                this.displace[c][r][index].set(
                    random(-displaceX * leftFactor, displaceX * rightFactor),
                    random(-displaceY * bottomFactor, displaceY * topFactor)
                );
            }
        }
    }

    copyKeyframe(source) {
        let sourceIndex = (latticeIndex + source + maxLatticeIndex) % maxLatticeIndex;
        for (let c = 0; c < columns; c++) {
            for (let r = 0; r < rows; r++) {
                this.displace[c][r][latticeIndex] = p5.Vector.copy(this.displace[c][r][sourceIndex]);
            }
        }
    }

    show() {
        if (latticeIndex % 1 !== 0) return;

        let currentPos = createVector(mouseX, mouseY);

        switch (latticeDisplay) {
            case 0: // pontos
                noFill();
                stroke(255, 0, 0);
                strokeWeight(8);
                beginShape(POINTS);
                for (let c = 0; c < columns; c++) {
                    for (let r = 0; r < rows; r++) {
                        let x = this.control[c][r].x + this.displace[c][r][latticeIndex].x;
                        let y = this.control[c][r].y + this.displace[c][r][latticeIndex].y;
                        vertex(x, y);
                    }
                }
                endShape(CLOSE);
                break;

            case 1: // mesh
                noFill();
                stroke(255, 0, 0, 120);
                strokeWeight(3);
                for (let c = 0; c < columns - 1; c++) {
                    for (let r = 0; r < rows; r++) {
                        let x1 = this.control[c][r].x + this.displace[c][r][latticeIndex].x;
                        let y1 = this.control[c][r].y + this.displace[c][r][latticeIndex].y;
                        let x2 = this.control[c + 1][r].x + this.displace[c + 1][r][latticeIndex].x;
                        let y2 = this.control[c + 1][r].y + this.displace[c + 1][r][latticeIndex].y;
                        line(x1, y1, x2, y2)
                    }
                }
                for (let c = 0; c < columns; c++) {
                    for (let r = 0; r < rows - 1; r++) {
                        let x1 = this.control[c][r].x + this.displace[c][r][latticeIndex].x;
                        let y1 = this.control[c][r].y + this.displace[c][r][latticeIndex].y;
                        let x2 = this.control[c][r + 1].x + this.displace[c][r + 1][latticeIndex].x;
                        let y2 = this.control[c][r + 1].y + this.displace[c][r + 1][latticeIndex].y;
                        line(x1, y1, x2, y2)
                    }
                }
                break;

            case 2: // pontos próximos
                noFill();
                stroke(255, 0, 0);
                strokeWeight(8);
                for (let c = 0; c < columns; c++) {
                    for (let r = 0; r < rows; r++) {
                        let pos = p5.Vector.add(lattice.control[c][r], lattice.displace[c][r][latticeIndex])
                        if (pos.dist(currentPos) < threshold) point(pos.x, pos.y);
                    }
                }
                break;
        }
    }
}