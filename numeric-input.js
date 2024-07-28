function rgbInput(input) {
  input.value = input.value.replace(/[^0-9]/g, ''); // manter apenas números
  input.value = input.value.replace(/^0+(?=[1-9])/, ''); // remover zeros à esquerda
  if (input.value > 255) input.value = 255;
}

function latticeNumberInput(input) {
  input.value = input.value.replace(/[^0-9]/g, ''); // manter apenas números
  input.value = input.value.replace(/^0+(?=[1-9])/, ''); // remover zeros à esquerda
  if (input.value > 12) input.value = 20;
  if (input.value === '' || input.value === 0) input.value = '';
}

function timeInput(input) {
  input.value = input.value.replace(/[^0-9]/g, ''); // manter apenas números
  input.value = input.value.replace(/^0+(?=[1-9])/, ''); // remover zeros à esquerda
}

document.querySelectorAll('.ui-input-color').forEach(input => {
  input.addEventListener("focus", function () { this.select() });
});