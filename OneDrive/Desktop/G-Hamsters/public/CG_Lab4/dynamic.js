const fromSelect = document.getElementById("fromSelect");
const toSelect = document.getElementById("toSelect");

const isModify = document.getElementById("modify-container");

// Список дозволених конверсій
const validConversions = {
  rgb: ["lab", "hsb", "xyz", "cmy", "hsl"],
  lab: ["rgb", "xyz"],
  hsb: ["rgb"],
  xyz: ["rgb", "lab"],
  cmy: ["rgb"],
  hsl: ["rgb"],
};

function updateToSelect() {
  const from = fromSelect.value;
  const options = validConversions[from];

  toSelect.innerHTML = "";

  options.forEach((opt) => {
    const optionEl = document.createElement("option");
    optionEl.value = opt;
    optionEl.textContent = opt.toUpperCase();
    toSelect.appendChild(optionEl);
  });
}

fromSelect.addEventListener("change", updateToSelect);
updateToSelect();

//===================================

var MODEL_EDIT = "LAB";

const modelSliders = {
  LAB: {
    name: "LAB",
    components: [
      { label: "L", min: -100, max: 100 },
      { label: "A", min: -127, max: 127 },
      { label: "B", min: -127, max: 127 },
    ],
  },
  RGB: {
    name: "RGB",
    components: [
      { label: "R", min: -255, max: 255 },
      { label: "G", min: -255, max: 255 },
      { label: "B", min: -255, max: 255 },
    ],
  },
};

function updateEditorSliders(modelKey) {
  
  const model = modelSliders[modelKey];
  MODEL_EDIT = modelKey;

  model.components.forEach((component, index) => {
    const i = index + 1;

    document.getElementById(`component-${i}-name`).innerText =
      component.label + ":";

    // Оновити input[type=range]
    const slider = document.getElementById(`component-${i}-slider`);
    slider.min = component.min;
    slider.max = component.max;
    slider.value = 0;

    // Оновити input[type=number]
    const input = document.getElementById(`component-${i}-input`);
    input.min = component.min;
    input.max = component.max;
    input.value = 0;
  });
}

document.querySelectorAll('input[name="modMode"]').forEach((input) => {
  input.addEventListener("change", () => {
    updateEditorSliders(input.value);
  });
});

document.querySelectorAll(".slider-wrapper").forEach((wrapper) => {
  const range = wrapper.querySelector("input[type=range]");
  const number = wrapper.querySelector("input[type=number]");

  if (range && number) {
    // Коли змінюється слайдер — оновлюємо поле
    range.addEventListener("input", () => {
      number.value = range.value;
      //console.log("change inputer");
    });

    // Зміна input (число)
    number.addEventListener("input", () => {
      range.value = number.value;
      //console.log("change slider");
    });
  }
});


window.addEventListener("DOMContentLoaded", () => {
  updateEditorSliders("LAB");
});

function ResetHSB() {
   
  document.getElementById("hueMin").value = 0;
  document.getElementById("hueMax").value = 360;
  document.getElementById("saturationChange").value = 0;
  document.getElementById("brightnessChange").value = 0;

  updateHSBDisplay("hueMin");
  updateHSBDisplay("hueMax");
  updateHSBDisplay("saturationChange");
  updateHSBDisplay("brightnessChange");
  convertC1ToC2();
}


document.querySelectorAll('.increase, .decrease').forEach(button => {

  
 const targetId = button.dataset.target;
 button.addEventListener('click', () => {
    const slider = document.getElementById(targetId);
    if (!slider) return;
 console.log("change _-----___");
    const step = 1;
    const min = parseInt(slider.min);
    const max = parseInt(slider.max);
    let currentValue = parseInt(slider.value);

    // Змінюємо значення
    currentValue += button.classList.contains('increase') ? step : -step;
    currentValue = Math.max(min, Math.min(max, currentValue));
    slider.value = currentValue;

     const inputId = targetId.replace("slider", "input");
    const input = document.getElementById(inputId);
    if (!input) {
      console.error(`Input with id ${inputId} not found.`);
      return; // Якщо input не знайдений, припиняємо виконання.
    }

     input.value = slider.value;
  });

   const slider = document.getElementById(targetId);
  if (slider) {
    slider.addEventListener('input', () => {
     const inputId = targetId.replace("slider", "input");
    const input = document.getElementById(inputId);
    if (!input) {
      console.error(`Input with id ${inputId} not found.`);
      return; // Якщо input не знайдений, припиняємо виконання.
    }

     input.value = slider.value;
     

    });
  }



});

// Оновлення відображення значення для H/S/B
function updateHSBDisplay(sliderId) {
  const slidersIdMap = {
    hueMin: "hueMin-input",
    hueMax: "hueMax-input",
    saturationChange: "saturation-input",
    brightnessChange: "brightness-input",
  };

  const slider = document.getElementById(sliderId);
  const inputField_ID = slidersIdMap[sliderId];
  const inputField = document.getElementById(inputField_ID);

  if (slider && inputField) {
    inputField.value = slider.value;
  }
}

//----------------------------------------------------------------


 const hueMin = document.getElementById('hueMin-slider');
  const hueMax = document.getElementById('hueMax-slider');
 

  document.querySelectorAll('.hue-buttons').forEach(btn => {
    btn.addEventListener('click', () => {
      const center = parseInt(btn.dataset.hue, 10);
      const delta = 10;

      let start = center - delta;
      let end = center + delta;

      if (start < 0) start = 0;
      if (end > 360) end = 360;

      hueMin.value = start;
      hueMax.value = end;

     hueMin.dispatchEvent(new Event('input'));
    hueMax.dispatchEvent(new Event('input'));
    
  
    });
  });


//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

const label = document.getElementById("toggleConvert");
const container = document.getElementById("convert-settings");
const arrow = label.querySelector(".arrow-icon");

label.addEventListener("click", () => {
  container.classList.toggle("open");
  arrow.classList.toggle("rotated");
});

const toggleInfo = document.getElementById("toggleInfo");
const collapsibleInfo = document.getElementById("convert-info");
const arrowInfo = toggleInfo.querySelector(".arrow-icon");

toggleInfo.addEventListener("click", () => {
  collapsibleInfo.classList.toggle("open");
  arrowInfo.classList.toggle("rotated");
});

const toggleModifyConvert = document.getElementById("toggleModifyConvert");
const collapsibleMCovert = document.getElementById("modify-convert-container");
const arrowMConvert = toggleModifyConvert.querySelector(".arrow-icon");

toggleModifyConvert.addEventListener("click", () => {
  collapsibleMCovert.classList.toggle("open");
  arrowMConvert.classList.toggle("rotated");
});

const toggleColorEdit = document.getElementById("toggleColorEdit");
const collapsibleColorEdit = document.getElementById("color-edit-container");
const arrowColorEdit = toggleColorEdit.querySelector(".arrow-icon");

toggleColorEdit.addEventListener("click", () => {
  collapsibleColorEdit.classList.toggle("open");
  arrowColorEdit.classList.toggle("rotated");
});

const toggleColorPalette = document.getElementById("toggleColorPalette");
const collapsibleColorPalette = document.getElementById(
  "color-palette-container"
);
const arrowColorPalette = toggleColorPalette.querySelector(".arrow-icon");

toggleColorPalette.addEventListener("click", () => {
  collapsibleColorPalette.classList.toggle("open");
  arrowColorPalette.classList.toggle("rotated");
});

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
function checkModifyConvertAvailability() {
  const from = document.getElementById("fromSelect").value;
  const to = document.getElementById("toSelect").value;
  const modifyBlock = document.getElementById("modify-convert-container");
  const modifyLabel = document.getElementById("toggleModifyConvert");

  const editColorBlock = document.getElementById("color-edit-container");
  const editColorLabel = document.getElementById("toggleColorEdit");

  const isRgbToLab = from === "rgb" && to === "lab";
  const isLabToRgb = from === "lab" && to === "rgb";
  const isRGBtoHSB = from === "rgb" && to === "hsb";
  const isHSBtoRGB = from === "hsb" && to === "rgb";

  if (isRgbToLab || isLabToRgb) {
    modifyBlock.style.display = "block";
    modifyLabel.style.display = "block";
    isModify.style.display = "block";
  } else {
    modifyBlock.style.display = "none";
    modifyLabel.style.display = "none";
     isModify.style.display = "none";
  }

  if (isRGBtoHSB || isHSBtoRGB) {
    editColorBlock.style.display = "block";
    editColorLabel.style.display = "block";
  } else {
    editColorBlock.style.display = "none";
    editColorLabel.style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("fromSelect")
    .addEventListener("change", checkModifyConvertAvailability);
  document
    .getElementById("toSelect")
    .addEventListener("change", checkModifyConvertAvailability);

  checkModifyConvertAvailability();
});
