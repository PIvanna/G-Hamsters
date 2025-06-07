
const colorInputs = document.querySelectorAll('input[type="color"]');
colorInputs.forEach((input) => {
    input.addEventListener("input", () => {
        colors.getUserCurveColors();
        drawCurve();
    }); 
    input.addEventListener("focus", () => {
        canvasMainCurve.style.pointerEvents = "none";
        lockImg.style.display = "flex";
        sider.style.display = "none";
    });
    input.addEventListener("blur", () => {
        canvasMainCurve.style.pointerEvents = "auto";
        lockImg.style.display = "none";
        sider.style.display = "flex";

    });
})

const buttonResetPallete = document.querySelector("#control-button-reset");
buttonResetPallete.addEventListener("click", () => {
    colors.setStandartCurveColors();
    drawCurve();
})

class Colors {
    constructor() {
        this.setStandartCurveColors();

        this.lineSystem     = "#4f4d4d";
        this.lineGridBold   = "#afafaf";
        this.lineGridNormal = "#dbdbdb";
        this.black          = "#000000";
        this.white          = "#ffffff";
    }

    setStandartCurveColors() {
        this.activeCurve    = "#000000";
        this.nonActiveCurve = "#4f4d4d";
        this.activeSegment  = "#67deff";
        this.basePoint      = "#67deff";
        this.controlPoint   = "#51b1cc";
        this.tangentLine    = "#51b1cc";
        this.nonTangentLine = "#dbdbdb";

        this.setCurveColors();
    }

    setCurveColors() {
        colorInputs[0].value = this.activeCurve;
        colorInputs[1].value = this.nonActiveCurve;
        colorInputs[2].value = this.activeSegment;
        colorInputs[3].value = this.basePoint;
        colorInputs[4].value = this.controlPoint;
        colorInputs[5].value = this.tangentLine;
        colorInputs[6].value = this.nonTangentLine;
    }

    getUserCurveColors() {
        this.activeCurve    = colorInputs[0].value,
        this.nonActiveCurve = colorInputs[1].value,
        this.activeSegment  = colorInputs[2].value,
        this.basePoint      = colorInputs[3].value,
        this.controlPoint   = colorInputs[4].value,
        this.tangentLine    = colorInputs[5].value,
        this.nonTangentLine = colorInputs[6].value
    }
    
}
  
let colors = new Colors();