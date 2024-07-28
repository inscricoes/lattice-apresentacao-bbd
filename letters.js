function createLetters(originalStrg, fntSize, lineHeight) {
    // separar string em linhas e calcular largura da caixa delimitadora
    const lineWidth = [];
    const splitStrg = split(originalStrg, "\n");
    let boxWidth = 0;
    textFont(font);
    textSize(fntSize);
    textLeading(lineHeight);
    for (let i = 0; i < splitStrg.length; i++) {
        lineWidth.push(textWidth(splitStrg[i]));
        boxWidth = max(boxWidth, lineWidth[i]);
    }

    for (let s = 0; s < splitStrg.length; s++) {
        // converter texto em pontos
        let textConvert = font.textToPoints(splitStrg[s], 45, 0, fntSize, { sampleFactor: sample });
        let textPoints = [];

        // mapear forma e contornos das letras
        let boundary = 0; // identificar limite da letra
        let shapeIndex = 0; // definir forma e contorno
        const maxDistance = sampleError / sample;

        // criar primeira letra (antes do for loop)
        letter.push(new Letter(shapeIndex, s));
        
        // converter objeto em vetor
        for (let i = 0; i < textConvert.length; i++) {
            textPoints[i] = createVector(textConvert[i].x, textConvert[i].y);

            // testar se a forma perdeu continuidade
            if (i != 0 && textPoints[i].dist(textPoints[i - 1]) > maxDistance) {

                // juntar forma atual com a antiga caso as duas se cruzem
                if (letter.length - 2 > 0 && letter[letter.length - 2].points[shapeIndex] !== undefined) {
                    let lastBoundaryMax = letter[letter.length - 2].points[shapeIndex]
                        .reduce((max, currentVector) => {
                            return currentVector.x > max.x ? currentVector : max;
                        }).x;
                    let currentBoundaryMin = letter[letter.length - 1].points[shapeIndex]
                        .reduce((min, currentVector) => {
                            return currentVector.x < min.x ? currentVector : min;
                        }).x;

                    if (letter[letter.length - 1].line === letter[letter.length - 2].line
                        && lastBoundaryMax > currentBoundaryMin) {
                        // copiar pontos da letra atual para a anterior
                        let lastShapeIndex = letter[letter.length - 2].points.length;
                        letter[letter.length - 2].points[lastShapeIndex] = [];
                        letter[letter.length - 2].displace[lastShapeIndex] = [];
                        letter[letter.length - 2].factor[lastShapeIndex] = [];
                        for (j = 0; j < letter[letter.length - 1].points[shapeIndex].length; j++) {
                            letter[letter.length - 2].points[lastShapeIndex].push(letter[letter.length - 1].points[shapeIndex][j]);
                            letter[letter.length - 2].displace[lastShapeIndex].push(createVector(0, 0));
                            letter[letter.length - 2].factor[lastShapeIndex].push(createVector(0, 0));
                        }

                        // remover letra atual
                        letter.pop();
                        shapeIndex = lastShapeIndex;
                    }
                }

                // nova letra ou novo contorno
                if (textPoints[i].x > boundary) {
                    // nova letra
                    shapeIndex = 0;
                    letter.push(new Letter(shapeIndex, s));
                } else {
                    // novo contorno
                    shapeIndex++;
                    letter[letter.length - 1].points[shapeIndex] = [];
                    letter[letter.length - 1].displace[shapeIndex] = [];
                    letter[letter.length - 1].factor[shapeIndex] = [];
                }
            }

            // registrar nova posição de ponto na letra atual: letter[index].points[caminho][posição]
            letter[letter.length - 1].points[shapeIndex].push(createVector(textPoints[i].x + width / 2, textPoints[i].y + height / 2));
            letter[letter.length - 1].displace[shapeIndex].push(createVector(0, 0));
            letter[letter.length - 1].factor[shapeIndex].push(createVector(0, 0));

            // atualizar limites da letra
            boundary = max(boundary, textPoints[i].x);
        }
    }

    // centralizar e posicionar letras de acordo com as quebras de linha
    let minX, minY, maxX, maxY; // temporary values
    for (let l = 0; l < letter.length; l++) {
        for (let i = 0; i < letter[l].points.length; i++) {
            for (let j = 0; j < letter[l].points[i].length; j++) {
                letter[l].points[i][j].sub(0, letter[l].line * -lineHeight);
                minX = min(minX, letter[l].points[i][j].x);
                minY = min(minY, letter[l].points[i][j].y);
                maxX = max(maxX, letter[l].points[i][j].x);
                maxY = max(maxY, letter[l].points[i][j].y);
            }
        }
    }

    let midX = (minX + maxX) / 2;
    let midY = (minY + maxY) / 2;

    for (let l = 0; l < letter.length; l++) {
        for (let i = 0; i < letter[l].points.length; i++) {
            for (let j = 0; j < letter[l].points[i].length; j++) {
                let offsetX = (maxX - minX - lineWidth[letter[l].line]) / 2;
                let x = midX - width / 2 - offsetX;
                let y = midY - height / 2;
                letter[l].points[i][j].sub(x, y);
            }
        }
    }
}

class Letter {
    constructor(newIndex, line) {
        // associar linha
        this.line = line;
        // criar forma + contorno e posição dos pontos
        this.points = [];
        this.points[newIndex] = [];
        // associar deslocamento a cada ponto existente
        this.displace = [];
        this.displace[newIndex] = [];
        // criar fator da posição
        this.factor = [];
        this.factor[newIndex] = [];
    }

    getFactor() {
        for (let i = 0; i < this.points.length; i++) {
            for (let j = 0; j < this.points[i].length; j++) {
                let factorX = map(this.points[i][j].x, lattice.minX, lattice.maxX, 0, 1);
                let factorY = map(this.points[i][j].y, lattice.minY, lattice.maxY, 0, 1);
                this.factor[i][j].set(createVector(factorX, factorY));
            }
        }
    }

    update() {

        for (let i = 0; i < this.points.length; i++) {
            for (let j = 0; j < this.points[i].length; j++) {
                let offsetX = 0;
                let offsetY = 0;

                for (let c = 0; c < columns - 1; c++) { // em vez de um for loop, o melhor seria guardar os valores c, r e fatores pra cada ponto das letras
                    for (let r = 0; r < rows - 1; r++) {
                        let factorX1 = c / (columns - 1);
                        let factorX2 = (c + 1) / (columns - 1);
                        let factorY1 = r / (rows - 1);
                        let factorY2 = (r + 1) / (rows - 1);

                        if (
                            this.factor[i][j].x >= factorX1 &&
                            this.factor[i][j].x <= factorX2 &&
                            this.factor[i][j].y >= factorY1 &&
                            this.factor[i][j].y <= factorY2) {

                            if (latticeIndex % 1 === 0) {
                                // keyframe
                                let offsetX1 = map(this.factor[i][j].x, factorX1, factorX2, lattice.displace[c][r][latticeIndex].x, lattice.displace[c + 1][r][latticeIndex].x);
                                let offsetX2 = map(this.factor[i][j].x, factorX1, factorX2, lattice.displace[c][r + 1][latticeIndex].x, lattice.displace[c + 1][r + 1][latticeIndex].x);
                                offsetX = map(this.factor[i][j].y, factorY1, factorY2, offsetX1, offsetX2);

                                let offsetY1 = map(this.factor[i][j].y, factorY1, factorY2, lattice.displace[c][r][latticeIndex].y, lattice.displace[c][r + 1][latticeIndex].y);
                                let offsetY2 = map(this.factor[i][j].y, factorY1, factorY2, lattice.displace[c + 1][r][latticeIndex].y, lattice.displace[c + 1][r + 1][latticeIndex].y);
                                offsetY = map(this.factor[i][j].x, factorX1, factorX2, offsetY1, offsetY2);

                            } else {
                                // interpolação
                                let lif = floor(latticeIndex); // lattice index floored
                                let lic = ceil(latticeIndex) % maxLatticeIndex; // lattice index ceiled
                                let factor = latticeIndex % 1;
                                let displace00 = p5.Vector.lerp(lattice.displace[c][r][lif], lattice.displace[c][r][lic], factor);
                                let displace01 = p5.Vector.lerp(lattice.displace[c][r + 1][lif], lattice.displace[c][r + 1][lic], factor);
                                let displace10 = p5.Vector.lerp(lattice.displace[c + 1][r][lif], lattice.displace[c + 1][r][lic], factor);
                                let displace11 = p5.Vector.lerp(lattice.displace[c + 1][r + 1][lif], lattice.displace[c + 1][r + 1][lic], factor);

                                let offsetX1 = map(this.factor[i][j].x, factorX1, factorX2, displace00.x, displace10.x);
                                let offsetX2 = map(this.factor[i][j].x, factorX1, factorX2, displace01.x, displace11.x);
                                offsetX = map(this.factor[i][j].y, factorY1, factorY2, offsetX1, offsetX2);

                                let offsetY1 = map(this.factor[i][j].y, factorY1, factorY2, displace00.y, displace01.y);
                                let offsetY2 = map(this.factor[i][j].y, factorY1, factorY2, displace10.y, displace11.y);
                                offsetY = map(this.factor[i][j].x, factorX1, factorX2, offsetY1, offsetY2);
                            }

                        }
                    }
                }

                this.displace[i][j].set(offsetX, offsetY);
            }
        }
    }

    show() {
        noStroke();
        fill(textColor);
        beginShape();
        for (let i = 0; i < this.points.length; i++) {
            if (i == 0) {
                // desenhar forma externa
                for (let j = 0; j < this.points[i].length; j++) {
                    vertex(
                        this.points[i][j].x + this.displace[i][j].x,
                        this.points[i][j].y + this.displace[i][j].y
                    );
                }
            } else {
                // desenhar contornos
                beginContour();
                for (let j = 0; j < this.points[i].length; j++) {
                    vertex(
                        this.points[i][j].x + this.displace[i][j].x,
                        this.points[i][j].y + this.displace[i][j].y
                    );
                }
                endContour();
            }
        }
        endShape();
    }
}