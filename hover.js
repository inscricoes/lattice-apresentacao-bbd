let hoverText;
const hoverOffset = 25;
const sizeBuffer = 48;
let windowWidth = window.innerWidth - hoverOffset;
let hoverMousePos = { x: undefined, y: undefined };
let hoverTextContent;

window.onload = function () {
  // SETUP
  hoverText = document.createElement("div");
  hoverText.id = "hover-text";
  document.body.appendChild(hoverText);
  hoverText.classList.add("hover-text")
  hoverText.innerHTML = "";
  hoverText.style.display = "none";

  // carregar informações
  infoHover();

  window.addEventListener('mousemove', (event) => {
    hoverMousePos = { x: event.pageX, y: event.pageY };
  });

  // atualizar posição em tempo real
  let clientScrollY = 0;
  document.addEventListener('mousemove', (event) => clientScrollY = event.clientY);
  document.addEventListener('scroll', () => hoverMousePos.y = window.scrollY + clientScrollY);

  // RUN
  setInterval(() => {
    let hoverTextWidth = hoverText.offsetWidth;
    let hoverTextHeight = hoverText.offsetHeight;
    let boundsWidth = window.innerWidth - hoverOffset + 20;
    let boundsHeight = window.innerHeight - hoverOffset + 20;

    // let hoverLeftPos = hoverMousePos.x + hoverOffset;
    // if (hoverMousePos.x > boundsWidth - hoverTextWidth) hoverLeftPos = hoverMousePos.x - hoverOffset - hoverTextWidth;
    let hoverLeftPos = hoverMousePos.x - hoverOffset - hoverTextWidth;
    if (hoverTextWidth < sizeBuffer) hoverLeftPos = -boundsWidth;
    hoverText.style.left = `${hoverLeftPos}px`;

    let hoverTopPos = hoverMousePos.y;
    if (hoverMousePos.y > boundsHeight - hoverTextHeight) hoverTopPos = hoverMousePos.y + hoverOffset - hoverTextHeight;
    hoverText.style.top = `${hoverTopPos}px`;

    if (hoverTextContent !== undefined) hoverText.innerHTML = hoverTextContent;
  }, 1);
}

function infoHover() {
  const hoverList = pageLanguage === 'en' ?
    [
      "CAUTION!<br>any changes to the text<br>will reset all keyframes",
      "CAUTION!<br>any changes to the lattice<br>will reset all keyframes",
      "LEFT CLICK:<br>moves a single point<br><br>RIGHT CLICK:<br>moves all points at once<br><br>MIDDLE BUTTON:<br>scales freely<br><br>MOUSE SCROLL:<br>zooms in and out<br><br>SHIFT / CONTROL:<br>retricts transform to an axis"
    ] :
    [
      "ATENÇÃO!<br>qualquer mudando ao texto<br>resetará todos os keyframes",
      "ATENÇÃO!<br>qualquer mudando ao lattice<br>resetará todos os keyframes",
      "BOTÃO ESQUERDO:<br>move um único ponto<br><br>BOTÃO DIREITO:<br>move todos os pontos<br><br>BOTÃO DO MEIO:<br>escala livremente<br><br>SCROLL DO MOUSE:<br>escala o tamanho do texto<br><br>SHIFT / CONTROL:<br>retringe transformação a um eixo"
    ];

  const covers = document.querySelectorAll('.hover-info');
  for (let i = 0; i < covers.length; i++) {
    // mouse
    covers[i].addEventListener('mouseenter', () => hoverAppear(`${hoverList[i]}`));
    covers[i].addEventListener('mouseleave', hoverDisappear);
    // touch
    covers[i].addEventListener('touchstart', () => hoverAppear(`${hoverList[i]}`));
    covers[i].addEventListener('touchend', hoverDisappear);
  }

  function hoverAppear(hoverString) {
    hoverTextContent = hoverString;
    hoverText.style.display = "block";
  }

  function hoverDisappear() {
    hoverTextContent = "";
    hoverText.style.display = "none";
  }
}