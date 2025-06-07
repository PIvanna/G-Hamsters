const colorSchemes =
{
    classic:
    [
        "#421E0F", "#19071A", "#09012F", "#040449", "#000764", "#0C2C8A",
        "#1852B1", "#397DD1", "#86B5E5", "#D3ECF8", "#F1E9BF", "#F8C95F",
        "#FFAA00", "#CC8000", "#995700", "#6A3403"
    ],

    rainbow:
    [
        "#800080", "#0000FF", "#00FFFF", "#00FF00", 
        "#FFFF00", "#FF8000", "#FF0000", "#FF0080"
    ],

    thermal:
    [
        "#30003B", "#480057", "#60006F", "#700070", "#80005E", "#8C003C", "#98001E", "#A8000F",
        "#B81800", "#C42800", "#D03800", "#DC4800", "#E05000", "#E86000", "#F07000", "#F87800",
        "#FF7800", "#FF8800", "#FFA020", "#FFB830", "#FFC840", "#FFE160", "#FFF580", "#FFFFC0"
    ],


    grayscale:
    [
        "#181818", "#202020", "#282828", "#303030", "#383838",
        "#404040", "#484848", "#505050", "#585858", "#606060", "#686868", "#707070", "#787878",
        "#808080", "#888888", "#909090", "#989898", "#A0A0A0", "#A8A8A8", "#B0B0B0", "#B8B8B8",
        "#C0C0C0", "#C8C8C8", "#D0D0D0", "#D8D8D8", "#E0E0E0", "#E8E8E8", "#F0F0F0", "#F8F8F8",
        "#FFFFFF"
    ],


    blue_yellow:
    [
        "#000049", "#000555", "#000C66", "#002577", "#003A8C", "#004F9E", "#0063B2",
        "#0077C4", "#0091D8", "#00A4DD", "#00B8E6", "#30C6EC", "#60D2F4", "#80D8F5",
        "#9BD2F5", "#B8DADB", "#D7E3DE", "#F4EBA5", "#FFEDAF", "#FFE57A", "#FFDE64",
        "#FFD433", "#FFC300", "#F8B200", "#F0AA00", "#E19900", "#DC8C00", "#C87500",
        "#B45500"
    ]
};

let colors = colorSchemes.classic;
let setColor = "black"

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });

const canvasSpinner = document.getElementById("canvas-spinner");

canvas.width = 1170;
canvas.height = 690;

let fractalType = fillMandelbrotPixel;
let kmax = 100;
let initZr = 0;
let initZi = 0;
let constCr = 0;
let constCi = 0;
let bailout = 2;
let form1 = f1;
let form2 = f1;
let pow1 = 1;
let pow2 = 1;

let center = { x: canvas.width  / 2,
                                  y: canvas.height / 2 };

let isCanvasClear = true;

let centerR = 0;
let centerI = 0;
let scale = 1 / (canvas.width / 4);
let rotationAngle = 0;

document.getElementById("btn-draw").addEventListener("click", () =>
{
    isCanvasClear = false;
    centerR = 0;
    centerI = 0;
    scale = 1 / (canvas.width / 4);
    rotationAngle = 0;

    showCanvasSpinner();
    setTimeout(() =>
    {
        drawFractal();
        hideCanvasSpinner();
    }, 10);
});

document.getElementById("btn-location").addEventListener("click", () =>
{
    if (!isCanvasClear)
    {
        showCanvasSpinner();
        setTimeout(() =>
        {
            drawFractal();
            hideCanvasSpinner();
        }, 10);
    }
    else
    {
        alert("Спочатку намалюйте фрактал, щоб застосувати цю дію");
    }
});


function showCanvasSpinner()
{
    canvasSpinner.style.display = "block";
}
function hideCanvasSpinner()
{
    canvasSpinner.style.display = "none";
}

canvas.addEventListener("dblclick", event =>
{
    if (canvasSpinner.style.display === "block") return;

    if (!isCanvasClear && !isAnimating)
    {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        let [r, i] = canvasToComplex(mouseX, mouseY);

        centerR = r;
        centerI = i;

        scale *= 0.5;

        drawFractal();

        showCanvasSpinner();
        setTimeout(() =>
        {
            drawFractalChunked(false);
        }, 1);
    }
});

canvas.addEventListener("contextmenu", event =>
{
    event.preventDefault();
    if (canvasSpinner.style.display === "block") return;

    if (!isCanvasClear && !isAnimating)
    {
        const rect = canvas.getBoundingClientRect();
        const mouseX = (event.clientX - rect.left);
        const mouseY = (event.clientY - rect.top);

        let [r, i] = canvasToComplex(mouseX, mouseY);

        centerR = r;
        centerI = i;

        scale /= 0.5;

        showCanvasSpinner();
        setTimeout(() =>
        {
            drawFractalChunked(false);
        }, 1);
    }
});

canvas.addEventListener("wheel", (event) =>
{
    event.preventDefault();
    if (canvasSpinner.style.display === "block") return;

    if (!isCanvasClear && !isAnimating)
    {
        const zoomIntensity = 0.2;
        const mouseX = event.offsetX;
        const mouseY = event.offsetY;

        const [worldX, worldY] = canvasToComplex(mouseX, mouseY);

        const delta = event.deltaY / 100;
        const factor = 1 + delta * zoomIntensity;
        scale *= factor;

        centerR = worldX + (centerR - worldX) * factor;
        centerI = worldY + (centerI - worldY) * factor;

        drawFractal(true);

        clearTimeout(window.renderTimeout);
        window.renderTimeout = setTimeout(() =>
        {
            showCanvasSpinner();

            setTimeout(() =>
            {
                drawFractalChunked(false);
            }, 1);
        }, 500);
    }
});

document.getElementById("fractal-type").addEventListener("change", fractalTypeChanged);
document.getElementById("color-theme").addEventListener("change", colorThemeChanged);
document.getElementById("setColor").addEventListener("change", setColorChanged);
document.getElementById("maxIter").addEventListener("input", maxIterChanged);
document.getElementById("initZr").addEventListener("input", initZrChanged);
document.getElementById("initZi").addEventListener("input", initZiChanged);
document.getElementById("constCr").addEventListener("input", constCrChanged);
document.getElementById("constCi").addEventListener("input", constCiChanged);
document.getElementById("bailout").addEventListener("input", bailoutChanged);
document.getElementById("formula1").addEventListener("change", formula1Changed);
document.getElementById("formula2").addEventListener("change", formula2Changed);
document.getElementById("pow1").addEventListener("input", pow1Changed);
document.getElementById("pow2").addEventListener("input", pow2Changed);

document.getElementById("maxIter").addEventListener("blur", event =>
{
    if (document.getElementById("maxIter").classList.contains("invalid"))
    {
        kmax = 100;
        document.getElementById("maxIter").value = 100;
        document.getElementById("maxIter").classList.remove("invalid");
    }
});
document.getElementById("initZr").addEventListener("blur", event =>
{
    if (document.getElementById("initZr").classList.contains("invalid"))
    {
        initZr = 0;
        document.getElementById("initZr").value = 0;
        document.getElementById("initZr").classList.remove("invalid");
    }
});
document.getElementById("initZi").addEventListener("blur", event =>
{
    if (document.getElementById("initZi").classList.contains("invalid"))
    {
        initZi = 0;
        document.getElementById("initZi").value = 0;
        document.getElementById("initZi").classList.remove("invalid");
    }
});
document.getElementById("constCr").addEventListener("blur", event =>
{
    if (document.getElementById("constCr").classList.contains("invalid"))
    {
        constCr = 0;
        document.getElementById("constCr").value = 0;
        document.getElementById("constCr").classList.remove("invalid");
    }
});
document.getElementById("constCi").addEventListener("blur", event =>
{
    if (document.getElementById("constCi").classList.contains("invalid"))
    {
        constCi = 0;
        document.getElementById("constCi").value = 0;
        document.getElementById("constCi").classList.remove("invalid");
    }
});
document.getElementById("bailout").addEventListener("blur", event =>
{
    if (document.getElementById("bailout").classList.contains("invalid"))
    {
        bailout = 2;
        document.getElementById("bailout").value = 2;
        document.getElementById("bailout").classList.remove("invalid");
    }
});
document.getElementById("pow1").addEventListener("blur", event =>
{
    if (document.getElementById("pow1").classList.contains("invalid"))
    {
        pow1 = 1;
        document.getElementById("pow1").value = 1;
        document.getElementById("pow1").classList.remove("invalid");
    }
});
document.getElementById("pow2").addEventListener("blur", event =>
{
    if (document.getElementById("pow2").classList.contains("invalid"))
    {
        pow2 = 1;
        document.getElementById("pow2").value = 1;
        document.getElementById("pow2").classList.remove("invalid");
    }
});

document.addEventListener("DOMContentLoaded", () =>
{
    const tabs = document.querySelectorAll(".tab");
    const buttons = document.querySelectorAll(".tab-buttons button");

    buttons.forEach((btn, index) =>
    {
        btn.addEventListener('click', () =>
        {
            if (isAnimating) return;


            buttons.forEach(b => b.classList.remove("active"));
            tabs.forEach(t => t.classList.remove("active"));

            btn.classList.add("active");
            tabs[index].classList.add("active");
        });
    });

    buttons[0].click();
    fractalTypeChanged();
});

function fractalTypeChanged()
{
    let strFractalType = document.getElementById("fractal-type").value;
    if (strFractalType === "mandelbrot")
    {
        fractalType = fillMandelbrotPixel;
        document.getElementById("initZ").style.display = "block";
        document.getElementById("initC").style.display = "none";

        document.getElementById("form1-cont").style.display = "grid";
        document.getElementById("pow1-cont").style.display  = "grid";
        document.getElementById("form2-cont").style.display = "grid";
        document.getElementById("pow2-cont").style.display  = "grid";
    }
    else if (strFractalType === "julia")
    {
        fractalType = fillJuliaPixel;
        document.getElementById("initZ").style.display = "none";
        document.getElementById("initC").style.display = "block";

        document.getElementById("form1-cont").style.display = "grid";
        document.getElementById("pow1-cont").style.display  = "grid";
        document.getElementById("form2-cont").style.display = "grid";
        document.getElementById("pow2-cont").style.display  = "grid";
    }
    else if (strFractalType === "burning-ship") 
    { 
        fractalType = fillBurningShipPixel;
        document.getElementById("initZ").style.display = "block";
        document.getElementById("initC").style.display = "none";

        document.getElementById("form1-cont").style.display = "none";
        document.getElementById("pow1-cont").style.display  = "none";
        document.getElementById("form2-cont").style.display = "none";
        document.getElementById("pow2-cont").style.display  = "none";
    }
    updateAnimParams(strFractalType);
}

function colorThemeChanged()
{
    const clrTheme = document.getElementById("color-theme").value;

    switch (clrTheme)
    {
        case "classic":
            colors = colorSchemes.classic;
            break;
        case "rainbow":
            colors = colorSchemes.rainbow;
            break;
        case "thermal":
            colors = colorSchemes.thermal;
            break;
        case "grayscale":
            colors = colorSchemes.grayscale;
            break;
        case "blue_yellow":
            colors = colorSchemes.blue_yellow;
            break;
    }
}

function setColorChanged()
{
    setColor = document.getElementById("setColor").value;
}

function updateAnimParams(type)
{
    const animParam = document.getElementById("animParam");
    while (animParam.firstChild)
    {
        animParam.removeChild(animParam.firstChild);
    }

    const kOption = document.createElement("option");
    kOption.value = "k";
    kOption.textContent = "Кількість ітерацій";
    animParam.appendChild(kOption);

    if (type === "mandelbrot" || type === "burning-ship")
    {
        const zrOption = document.createElement("option");
        zrOption.value = "zr";
        zrOption.textContent = "Дійсна частина (Zr)";
        animParam.appendChild(zrOption);

        const ziOption = document.createElement("option");
        ziOption.value = "zi";
        ziOption.textContent = "Уявна частина (Zi)";
        animParam.appendChild(ziOption);
    }
    else if (type === "julia")
    {
        const crOption = document.createElement("option");
        crOption.value = "cr";
        crOption.textContent = "Дійсна частина (Cr)";
        animParam.appendChild(crOption);

        const ciOption = document.createElement("option");
        ciOption.value = "ci";
        ciOption.textContent = "Уявна частина (Ci)";
        animParam.appendChild(ciOption);
    }

    const rOption = document.createElement("option");
    rOption.value = "r";
    rOption.textContent = "Поріг втечі";
    animParam.appendChild(rOption);

    animParam.dispatchEvent(new Event("change"));
}

function maxIterChanged()
{
    let num = parseInt(document.getElementById("maxIter").value);
    if (num)
    {
        if (num > 5000)
        {
            document.getElementById("maxIter").value = 5000;
            kmax = 5000;
        }
        else if (num < 0)
        {
            document.getElementById("maxIter").value = 0;
            kmax = 0;
        }
        else
        {
            document.getElementById("maxIter").value = num;
            kmax = num;
        }

        document.getElementById("maxIter").classList.remove("invalid");
    }
    else
    {
        document.getElementById("maxIter").classList.add("invalid");
    }
}

function initZrChanged()
{
    if (!isNaN(parseFloat(document.getElementById("initZr").value)))
    {
        initZr = parseFloat(document.getElementById("initZr").value);

        document.getElementById("initZr").classList.remove("invalid");
    }
    else
    {
        document.getElementById("initZr").classList.add("invalid");
    }
}

function initZiChanged()
{
    if (!isNaN(parseFloat(document.getElementById("initZi").value)))
    {
        initZi = parseFloat(document.getElementById("initZi").value);

        document.getElementById("initZi").classList.remove("invalid");
    }
    else
    {
        document.getElementById("initZi").classList.add("invalid");
    }
}

function constCrChanged()
{
    if (!isNaN(parseFloat(document.getElementById("constCr").value)))
    {
        constCr = parseFloat(document.getElementById("constCr").value);

        document.getElementById("constCr").classList.remove("invalid");
    }
    else
    {
        document.getElementById("constCr").classList.add("invalid");
    }
}

function constCiChanged()
{
    if (!isNaN(parseFloat(document.getElementById("constCi").value)))
    {
        constCi = parseFloat(document.getElementById("constCi").value);

        document.getElementById("constCi").classList.remove("invalid");
    }
    else
    {
        document.getElementById("constCi").classList.add("invalid");
    }
}

function bailoutChanged()
{
    let num = parseFloat(document.getElementById("bailout").value)
    if (!isNaN(num))
    {
        if (num < 0.1)
        {
            bailout = 0.1;
            document.getElementById("bailout").value = 0.1;
        }
        else if (num > 5000)
        {
            bailout = 5000;
            document.getElementById("bailout").value = 5000;
        }
        else
        {
            bailout = num;
            document.getElementById("bailout").value = num;
        }

        document.getElementById("bailout").classList.remove("invalid");
    }
    else
    {
        document.getElementById("bailout").classList.add("invalid");
    }
}

function formula1Changed()
{
    let strForm1 = document.getElementById("formula1").value;

    switch (strForm1)
    {
        case "1":
            form1 = f1;
            break;
        case "z":
            form1 = z;
            break;
        case "sinz":
            form1 = SinZ;
            break;
        case "cosz":
            form1 = CosZ;
            break;
        case "tgz":
            form1 = TgZ;
            break;
        case "ctgz":
            form1 = CtgZ;
            break;
        case "shz":
            form1 = ShZ;
            break;
        case "chz":
            form1 = ChZ;
            break;
    }
}

function formula2Changed()
{
    let strForm2 = document.getElementById("formula2").value;

    switch (strForm2)
    {
        case "1":
            form2 = f1;
            break;
        case "z":
            form2 = z;
            break;
        case "sinz":
            form2 = SinZ;
            break;
        case "cosz":
            form2 = CosZ;
            break;
        case "tgz":
            form2 = TgZ;
            break;
        case "ctgz":
            form2 = CtgZ;
            break;
        case "shz":
            form2 = ShZ;
            break;
        case "chz":
            form2 = ChZ;
            break;
    }
}

function pow1Changed()
{
    let num = parseFloat(document.getElementById("pow1").value);
    if (!isNaN(num))
    {
        if (num < -20)
        {
            pow1 = -20;
            document.getElementById("pow1").value = -20;
        }
        else if (num > 20)
        {
            pow1 = 20;
            document.getElementById("pow1").value = 20;
        }
        else
        {
            pow1 = num;
            document.getElementById("pow1").value = num;
        }

        document.getElementById("pow1").classList.remove("invalid");
    }
    else
    {
        document.getElementById("pow1").classList.add("invalid");
    }
}

function pow2Changed()
{
    let num = parseFloat(document.getElementById("pow2").value);
    if (!isNaN(num))
    {
        if (num < -20)
        {
            pow2 = -20;
            document.getElementById("pow2").value = -20;
        }
        else if (num > 20)
        {
            pow2 = 20;
            document.getElementById("pow2").value = 20;
        }
        else
        {
            pow2 = num;
            document.getElementById("pow2").value = num;
        }

        document.getElementById("pow2").classList.remove("invalid");
    }
    else
    {
        document.getElementById("pow2").classList.add("invalid");
    }
}

// rotation

document.getElementById("centerRe").addEventListener("input", centerReChanged);
document.getElementById("centerIm").addEventListener("input", centerImChanged);
document.getElementById("zoom").addEventListener("input", zoomChanged);
document.getElementById("rotationAngle").addEventListener("input", rotationAngleChanged);

document.getElementById("centerRe").addEventListener("blur", () =>
{
    if (document.getElementById("centerRe").classList.contains("invalid"))
    {
        centerR = 0;
        document.getElementById("centerRe").value = 0;
        document.getElementById("centerRe").classList.remove("invalid");
    }
});

document.getElementById("centerIm").addEventListener("blur", () =>
{
    if (document.getElementById("centerIm").classList.contains("invalid"))
    {
        centerI = 0;
        document.getElementById("centerIm").value = 0;
        document.getElementById("centerIm").classList.remove("invalid");
    }
});

document.getElementById("zoom").addEventListener("blur", () =>
{
    if (document.getElementById("zoom").classList.contains("invalid"))
    {
        scale =  1 / (canvas.width / 4);
        document.getElementById("zoom").value = 1;
        document.getElementById("zoom").classList.remove("invalid");
    }
});

document.getElementById("rotationAngle").addEventListener("blur", () =>
{
    if (document.getElementById("rotationAngle").classList.contains("invalid"))
    {
        rotationAngle = 0;
        document.getElementById("rotationAngle").value = 0;
        document.getElementById("rotationAngle").classList.remove("invalid");
    }
});

function centerReChanged()
{
    let num = parseFloat(document.getElementById("centerRe").value);
    if (!isNaN(num))
    {
        centerR = num;
        document.getElementById("centerRe").classList.remove("invalid");
    }
    else
    {
        document.getElementById("centerRe").classList.add("invalid");
    }
}

function centerImChanged()
{
    let num = parseFloat(document.getElementById("centerIm").value);
    if (!isNaN(num))
    {
        centerI = num;
        document.getElementById("centerIm").classList.remove("invalid");
    }
    else
    {
        document.getElementById("centerIm").classList.add("invalid");
    }
}

function zoomChanged()
{
    let num = parseFloat(document.getElementById("zoom").value);
    if (!isNaN(num))
    {
        scale = 1 / num / (canvas.width / 4);
        document.getElementById("zoom").classList.remove("invalid");
    }
    else
    {
        document.getElementById("zoom").classList.add("invalid");
    }
}

function rotationAngleChanged()
{
    let num = parseFloat(document.getElementById("rotationAngle").value);
    if (!isNaN(num))
    {
        rotationAngle = num;
        document.getElementById("rotationAngle").classList.remove("invalid");
    }
    else
    {
        document.getElementById("rotationAngle").classList.add("invalid");
    }
}

// animation
let animParam = "k";
let animInit = 0;
let animLast = 0;
let animStep = 0.05;
let frames;
const EPSILON = 0.0000000001;

document.getElementById("animParam").addEventListener("change", () =>
{
    animParam = document.getElementById("animParam").value;
    let labAnimInit = document.getElementById("lab-anim-init");
    let labAnimLast = document.getElementById("lab-anim-last");

    document.getElementById("anim-init").removeAttribute("min");
    document.getElementById("anim-last").removeAttribute("min");

    switch (animParam)
    {
        case "k":
            labAnimInit.textContent = "Почат. к. ітер:";
            labAnimLast.textContent = "Кінцева к. ітер:";
            break;
        case "zr":
            labAnimInit.textContent = "Початкове Zr:";
            labAnimLast.textContent = "Кінцеве Zr:";
            break;
        case "zi":
            labAnimInit.textContent = "Початкове Zi:";
            labAnimLast.textContent = "Кінцевe Zi:";
            break;
        case "cr":
            labAnimInit.textContent = "Початкове Cr:";
            labAnimLast.textContent = "Кінцева Cr:";
            break;
        case "ci":
            labAnimInit.textContent = "Початкове Ci:";
            labAnimLast.textContent = "Кінцевe Ci:";
            break;
        case "r":
            labAnimInit.textContent = "Початковий поріг:";
            labAnimLast.textContent = "Кінцевий поріг:";
            document.getElementById("anim-init").min = 0;
            document.getElementById("anim-last").min = 0;
            break;
    }
});

document.getElementById("anim-init").addEventListener("input", () =>
{
    let num = parseFloat(document.getElementById("anim-init").value);
    if (!isNaN(num))
    {
        if (num < 0 && (animParam === "k" || animParam === "r"))
        {
            document.getElementById("anim-init").classList.add("invalid");
        }
        else
        {
            animInit = num;
            document.getElementById("anim-init").classList.remove("invalid");
        }
    }
    else
    {
        document.getElementById("anim-init").classList.add("invalid");
    }
});

document.getElementById("anim-init").addEventListener("blur", () =>
{
    if (document.getElementById("anim-init").classList.contains("invalid"))
    {
        animInit = 0;
        document.getElementById("anim-init").value = 0;
        document.getElementById("anim-init").classList.remove("invalid");
    }
    else if (animParam === "k" || animParam === "r")
    {
        animInit = Math.floor(animInit);
        document.getElementById("anim-last").value = animInit;
    }
});

document.getElementById("anim-last").addEventListener("input", () =>
{
    let num = parseFloat(document.getElementById("anim-last").value);
    if (!isNaN(num))
    {
        if (num < 0 && (animParam === "k" || animParam === "r"))
        {
            document.getElementById("anim-last").classList.add("invalid");
        }
        else
        {
            animLast = num;
            document.getElementById("anim-last").classList.remove("invalid");
        }
    }
    else
    {
        document.getElementById("anim-last").classList.add("invalid");
    }
});

document.getElementById("anim-last").addEventListener("blur", () =>
{
    if (document.getElementById("anim-last").classList.contains("invalid"))
    {
        animLast = 0;
        document.getElementById("anim-last").value = 0;
        document.getElementById("anim-last").classList.remove("invalid");
    }
    else if (animParam === "k" || animParam === "r")
    {
        animLast = Math.floor(animLast);
        document.getElementById("anim-last").value = animLast;
    }

});

document.getElementById("anim-step").addEventListener("input", () =>
{
    let num = parseFloat(document.getElementById("anim-step").value);
    if (!isNaN(num))
    {
        if (num <= 0.00001)
        {
            document.getElementById("anim-step").classList.add("invalid");
        }
        else
        {
            animStep = num;
            document.getElementById("anim-step").classList.remove("invalid");
        }
    }
    else
    {
        document.getElementById("anim-step").classList.add("invalid");
    }
});

document.getElementById("anim-step").addEventListener("blur", () =>
{
    if (document.getElementById("anim-step").classList.contains("invalid"))
    {
        animStep = 0.05;
        document.getElementById("anim-step").value = 0.05;
        document.getElementById("anim-step").classList.remove("invalid");
    }
});

document.getElementById("btn-anim").addEventListener("click", () =>
{
    if (!isCanvasClear && !isAnimating)
    {
        document.getElementById("btn-anim").style.cursor = "not-allowed";
        document.querySelectorAll(".tab-buttons button")[0].style.cursor = "not-allowed";
        document.querySelectorAll(".tab-buttons button")[1].style.cursor = "not-allowed";

        animFractal();
    }
    else
    {
        alert("Спочатку намалюйте фрактал, щоб застосувати цю дію");
    }
});

let isAnimating = false;
let cancelRequested = false;
const progressContainer = document.getElementById("progress-container");
const progressBar = document.getElementById("fractal-progress");
const btnCancel = document.getElementById("btn-cancel");
const progressLabel = document.getElementById("progress-label");

btnCancel.addEventListener("click", () =>
{
    cancelRequested = true;
    progressLabel.textContent = "Зупиняється...";
});

function animFractal()
{
    isAnimating = true;

    document.getElementById("")

    frames = new Array(0);
    cancelRequested = false;

    progressContainer.style.display = "flex";
    progressBar.value = 0;
    progressBar.max = 1;
    progressLabel.textContent = "Генерується...";

    let isForward = true;
    if (animInit > animLast)
    {
        isForward = false;
    }

    let temp;
    switch (animParam)
    {
        case "k":
            temp = kmax;
            kmax = animInit;
            break;
        case "zr":
            temp = initZr;
            initZr = animInit;
            break;
        case "zi":
            temp = initZi;
            initZi = animInit;
            break;
        case "cr":
            temp = constCr;
            constCr = animInit;
            break;
        case "ci":
            temp = constCi;
            constCi = animInit;
            break;
        case "r":
            temp = bailout;
            bailout = animInit;
            break;
    }

    let totalFrames = 1;
    if (animStep > 0)
    {
        totalFrames = Math.floor(Math.abs((animLast - animInit) / animStep)) + 1;
    }
    progressBar.max = totalFrames;

    let frIndex = 0;
    let done = false;

    function generateFrame()
    {
        if (cancelRequested)
        {
            done = true;
            progressLabel.textContent = "Анімацію зупинено";
            setTimeout(() => { progressContainer.style.display = "none"; }, 700);

            switch (animParam)
            {
                case "k":  kmax    = temp; break;
                case "zr": initZr  = temp; break;
                case "zi": initZi  = temp; break;
                case "cr": constCr = temp; break;
                case "ci": constCi = temp; break;
                case "r":  bailout = temp; break;
            }

            isAnimating = false;
            document.getElementById("btn-anim").style.cursor = "pointer";
            document.querySelectorAll(".tab-buttons button")[0].style.cursor = "pointer";
            document.querySelectorAll(".tab-buttons button")[1].style.cursor = "pointer";

            return;
        }

        let i = 0;
        frames.push(new ImageData(canvas.width, canvas.height));
        for (let y = 0; y < canvas.height; y++)
        {
            for (let x = 0; x < canvas.width; x++)
            {
                const color = fractalType(x, y);
                let [r, g, b] = hexToRGB(color);

                frames[frIndex].data[i++] = r;
                frames[frIndex].data[i++] = g;
                frames[frIndex].data[i++] = b;
                frames[frIndex].data[i++] = 255;
            }
        }

        frIndex++;
        progressBar.value = frIndex;
        progressLabel.textContent = `Кадр ${frIndex} з ${totalFrames}`;

        if (!changeAnimParam(isForward) || done)
        {
            document.getElementById("slider").max = frames.length - 1;
            document.getElementById("slider").disabled = false;
            progressLabel.textContent = "Готово!";
            setTimeout(() => { progressContainer.style.display = "none"; }, 700);

            switch (animParam)
            {
                case "k":  kmax    = temp; break;
                case "zr": initZr  = temp; break;
                case "zi": initZi  = temp; break;
                case "cr": constCr = temp; break;
                case "ci": constCi = temp; break;
                case "r":  bailout = temp; break;
            }

            isAnimating = false;
            document.getElementById("btn-anim").style.cursor = "pointer";
            document.querySelectorAll(".tab-buttons button")[0].style.cursor = "pointer";
            document.querySelectorAll(".tab-buttons button")[1].style.cursor = "pointer";

            return;
        }
        else
        {
            setTimeout(generateFrame, 10);
        }
    }

    generateFrame();
}

document.getElementById("slider").addEventListener("input", () =>
{
    ctx.putImageData(frames[document.getElementById("slider").value], 0, 0);
});

document.getElementById("slider").addEventListener("input", () =>
{
    ctx.putImageData(frames[document.getElementById("slider").value], 0, 0);
});

function changeAnimParam(isForward)
{
    switch (animParam)
    {
        case "k":
            (isForward) ? kmax    += animStep : kmax    -= animStep;
            return (isForward) ? kmax < animLast   : kmax > animLast;
        case "zr":
            (isForward) ? initZr  += animStep : initZr  -= animStep;
            return (isForward) ? initZr < animLast + EPSILON : initZr > animLast - EPSILON;
        case "zi":
            (isForward) ? initZi  += animStep : initZi  -= animStep;
            return (isForward) ? initZi < animLast + EPSILON : initZi > animLast - EPSILON;
        case "cr":
            (isForward) ? constCr += animStep : constCr  -= animStep;
            return (isForward) ? constCr < animLast + EPSILON : constCr > animLast - EPSILON;
        case "ci":
            (isForward) ? constCi += animStep : constCi  -= animStep;
            return (isForward) ? constCi < animLast + EPSILON : constCi > animLast - EPSILON;
        case "r":
            (isForward) ? bailout += animStep : bailout  -= animStep;
            return (isForward) ? bailout < animLast + EPSILON : bailout > animLast - EPSILON;
    }
}

function drawFractal(lowQuality = false)
{
    document.getElementById("centerRe").value = centerR;
    document.getElementById("centerIm").value = centerI;
    document.getElementById("zoom").value = 1 / scale * 4 / canvas.width;
    document.getElementById("rotationAngle").value = rotationAngle;

    document.getElementById("slider").disabled = true;

    let i = 0;

    let step = lowQuality ? 8 : 1;

    let frame = new ImageData(canvas.width, canvas.height);
    for (let y = 0; y < canvas.height; y += step)
    {
        for (let x = 0; x < canvas.width; x += step)
        {
            const color = fractalType(x, y);
            let [r, g, b] = hexToRGB(color);

            if (!lowQuality)
            {
                frame.data[i++] = r;
                frame.data[i++] = g;
                frame.data[i++] = b;
                frame.data[i++] = 255;
            }
            else
            {
                ctx.fillStyle = `rgb(${r},${g},${b})`;
                ctx.fillRect(x, y, step, step);
            }
        }
    }

    if (!lowQuality)
    {
        ctx.putImageData(frame, 0, 0);
    }
}

function drawFractalChunked(lowQuality = false)
{
    document.getElementById("centerRe").value = centerR;
    document.getElementById("centerIm").value = centerI;
    document.getElementById("zoom").value = 1 / scale * 4 / canvas.width;
    document.getElementById("rotationAngle").value = rotationAngle;

    document.getElementById("slider").disabled = true;

    const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const step = lowQuality ? 8 : 1;
    let y = 0;
    let i = 0;

    function processNextChunk()
    {
        const startTime = performance.now();
        const chunkSize = 10;

        for (let chunk = 0; chunk < chunkSize && y < canvas.height; chunk++, y += step)
        {
            for (let x = 0; x < canvas.width; x += step)
            {
                const color = fractalType(x, y);
                let [r, g, b] = hexToRGB(color);

                if (!lowQuality)
                {
                    const pixelIndex = (y * canvas.width + x) * 4;
                    frame.data[pixelIndex] = r;
                    frame.data[pixelIndex + 1] = g;
                    frame.data[pixelIndex + 2] = b;
                    frame.data[pixelIndex + 3] = 255;
                }
                else
                {
                    ctx.fillStyle = `rgb(${r},${g},${b})`;
                    ctx.fillRect(x, y, step, step);
                }
            }
        }

        if (y < canvas.height)
        {
            ctx.putImageData(frame, 0, 0);
            requestAnimationFrame(processNextChunk);
        }
        else
        {
            if (!lowQuality)
            {
                ctx.putImageData(frame, 0, 0);
            }
            hideCanvasSpinner();
        }
    }

    requestAnimationFrame(processNextChunk);
}

function rotate(x, y, angle) {
    const radians = (Math.PI / 180) * angle;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    const dx = x - center.x;
    const dy = y - center.y;
    const nx = dx * cos - dy * sin + center.x;
    const ny = dx * sin + dy * cos + center.y;
    return [Math.round(nx), Math.round(ny)];
}

function hexToRGB(color)
{
    if (color === "black")
    {
        return [0, 0, 0];
    }
    const r = parseInt(color.substring(1, 3), 16);
    const g = parseInt(color.substring(3, 5), 16);
    const b = parseInt(color.substring(5, 7), 16);
    return [r, g, b];
}

function canvasToComplex(x, y)
{
    let [nx, ny] = rotate(x, y, rotationAngle);

    let r = centerR +  (nx - center.x) * scale;
    let i = centerI + -(ny - center.y) * scale;
    return [r, i];
}

function fillMandelbrotPixel(x, y)
{
    let [cr, ci] = canvasToComplex(x, y);
    let [zr, zi] = [initZr, initZi];

    for (let k = 0; k < kmax; k++)
    {
        let [nextZr1, nextZi1] = form1(zr, zi);
        let [nextZr2, nextZi2] = form2(zr, zi);

        [nextZr1, nextZi1] = pow1 ? complexPow(nextZr1, nextZi1, pow1) : [nextZr1, nextZi1];
        [nextZr2, nextZi2] = pow2 ? complexPow(nextZr2, nextZi2, pow2) : [nextZr2, nextZi2];

        let [nextZr, nextZi] = complexMul(nextZr1, nextZi1, nextZr2, nextZi2);

        zr = nextZr + cr;
        zi = nextZi + ci;

        if (zr * zr + zi * zi > bailout * bailout)
        {
            return colors[k % colors.length];
        }
    }
    return setColor;
}
function fillJuliaPixel(x, y)
{
    let [zr, zi] = canvasToComplex(x, y);

    for (let k = 0; k < kmax; k++)
    {
        let [nextZr1, nextZi1] = form1(zr, zi);
        let [nextZr2, nextZi2] = form2(zr, zi);

        [nextZr1, nextZi1] = pow1 ? complexPow(nextZr1, nextZi1, pow1) : [nextZr1, nextZi1];
        [nextZr2, nextZi2] = pow2 ? complexPow(nextZr2, nextZi2, pow2) : [nextZr2, nextZi2];

        let [nextZr, nextZi] = complexMul(nextZr1, nextZi1, nextZr2, nextZi2);

        zr = nextZr + constCr;
        zi = nextZi + constCi;

        if (zr * zr + zi * zi > bailout * bailout)
        {
            return colors[k % colors.length];
        }
    }
    return setColor;
}

function fillBurningShipPixel(x, y)
{
    let [cr, ci] = canvasToComplex(x, y);
    let [zr, zi] = [initZr, initZi];

    for (let k = 0; k < kmax; k++)
    {
        // (|a| + i|b|)^2 = a^2 - b^2 + 2 * i * |a| * |b|
        let nextZr = zr * zr - zi * zi + cr;
        let nextZi = 2 * Math.abs(zr) * Math.abs(zi) + ci;

        zr = nextZr;
        zi = nextZi;

        if (zr * zr + zi * zi > bailout * bailout)
        {
            return colors[k % colors.length];
        }
    }
    return setColor;
}

function complexPow(re, im, power)
{
    const r     = Math.sqrt(re * re + im * im);
    const theta = Math.atan2(im, re);

    const rPowered = Math.pow(r, power);
    const angle    = theta * power;

    const newRe = rPowered * Math.cos(angle);
    const newIm = rPowered * Math.sin(angle);

    return [newRe, newIm];
}

function complexMul(zr1, zi1, zr2, zi2)
{
    const zr = zr1 * zr2 - zi1 * zi2;
    const zi = zr1 * zi2 + zi1 * zr2;
    return [zr, zi];
}

function f1(zr, zi)
{
    return [1, 0];
}

function z(zr, zi)
{
    return [zr, zi];
}

function SinZ(zr, zi)
{
    let newZr = Math.sin(zr) * Math.cosh(zi);
    let newZi = Math.cos(zr) * Math.sinh(zi);

    return [newZr, newZi];
}

function CosZ(zr, zi)
{
    let newZr =  Math.cos(zr) * Math.cosh(zi);
    let newZi = -Math.sin(zr) * Math.sinh(zi);

    return [newZr, newZi];
}

function TgZ(zr, zi)
{
    let denom = Math.cos(2 * zr) + Math.cosh(2 * zi);
    let newZr = Math.sin(2 * zr)  / denom;
    let newZi = Math.sinh(2 * zi) / denom;

    return [newZr, newZi];
}

function CtgZ(zr, zi)
{
    let [sr, si] = SinZ(zr, zi); // sin(z)
    let [cr, ci] = CosZ(zr, zi); // cos(z)

    let denom = sr * sr + si * si;

    if (denom === 0) 
    {
        return [NaN, NaN];
    }

    let newZr = (cr * sr + ci * si) / denom;
    let newZi = (ci * sr - cr * si) / denom;

    return [newZr, newZi];
}

function ShZ(zr, zi)
{
    let newZr = Math.sinh(zr) * Math.cos(zi);
    let newZi = Math.cosh(zr) * Math.sin(zi);

    return [newZr, newZi];
}

function ChZ(zr, zi)
{
    let newZr = Math.cosh(zr) * Math.cos(zi);
    let newZi = Math.sinh(zr) * Math.sin(zi);

    return [newZr, newZi];
}

let isPlaying = false;
let playInterval = null;
let playDirection = 1; // 1 - вперед, -1 - назад

document.getElementById("btn-play").addEventListener("click", () => 
{
    if (!frames || frames.length === 0) 
    {
        alert("Спочатку створіть анімацію");
        return;
    }

    if (isPlaying) 
    {
        clearInterval(playInterval);
        isPlaying = false;
        document.getElementById("btn-play").textContent = "Відтворити";
    } 
    else 
    {
        isPlaying = true;
        document.getElementById("btn-play").textContent = "Зупинити";
        
        playInterval = setInterval(() => {
            let slider = document.getElementById("slider");
            let currentFrame = parseInt(slider.value);
            
            if (currentFrame >= frames.length - 1) 
            {
                playDirection = -1;
            } 
            else if (currentFrame <= 0) 
            {
                playDirection = 1;
            }
            
            currentFrame += playDirection;
            slider.value = currentFrame;
            ctx.putImageData(frames[currentFrame], 0, 0);
        }, 70);
    }
});

function animFractal() 
{
    if (isPlaying) 
    {
        clearInterval(playInterval);
        isPlaying = false;
        document.getElementById("btn-play").textContent = "Відтворити";
    }
    playDirection = 1;
    
    isAnimating = true;

    document.getElementById("")

    frames = new Array(0);
    cancelRequested = false;

    progressContainer.style.display = "flex";
    progressBar.value = 0;
    progressBar.max = 1;
    progressLabel.textContent = "Генерується...";

    let isForward = true;
    if (animInit > animLast)
    {
        isForward = false;
    }

    let temp;
    switch (animParam)
    {
        case "k":
            temp = kmax;
            kmax = animInit;
            break;
        case "zr":
            temp = initZr;
            initZr = animInit;
            break;
        case "zi":
            temp = initZi;
            initZi = animInit;
            break;
        case "cr":
            temp = constCr;
            constCr = animInit;
            break;
        case "ci":
            temp = constCi;
            constCi = animInit;
            break;
        case "r":
            temp = bailout;
            bailout = animInit;
            break;
    }

    let totalFrames = 1;
    if (animStep > 0)
    {
        totalFrames = Math.floor(Math.abs((animLast - animInit) / animStep)) + 1;
    }
    progressBar.max = totalFrames;

    let frIndex = 0;
    let done = false;

    function generateFrame()
    {
        if (cancelRequested)
        {
            done = true;
            progressLabel.textContent = "Анімацію зупинено";
            setTimeout(() => { progressContainer.style.display = "none"; }, 700);

            switch (animParam)
            {
                case "k":  kmax    = temp; break;
                case "zr": initZr  = temp; break;
                case "zi": initZi  = temp; break;
                case "cr": constCr = temp; break;
                case "ci": constCi = temp; break;
                case "r":  bailout = temp; break;
            }

            isAnimating = false;
            document.getElementById("btn-anim").style.cursor = "pointer";
            document.querySelectorAll(".tab-buttons button")[0].style.cursor = "pointer";
            document.querySelectorAll(".tab-buttons button")[1].style.cursor = "pointer";

            return;
        }

        let i = 0;
        frames.push(new ImageData(canvas.width, canvas.height));
        for (let y = 0; y < canvas.height; y++)
        {
            for (let x = 0; x < canvas.width; x++)
            {
                const color = fractalType(x, y);
                let [r, g, b] = hexToRGB(color);

                frames[frIndex].data[i++] = r;
                frames[frIndex].data[i++] = g;
                frames[frIndex].data[i++] = b;
                frames[frIndex].data[i++] = 255;
            }
        }

        frIndex++;
        progressBar.value = frIndex;
        progressLabel.textContent = `Кадр ${frIndex} з ${totalFrames}`;

        if (!changeAnimParam(isForward) || done)
        {
            document.getElementById("slider").max = frames.length - 1;
            document.getElementById("slider").disabled = false;
            progressLabel.textContent = "Готово!";
            setTimeout(() => { progressContainer.style.display = "none"; }, 700);

            switch (animParam)
            {
                case "k":  kmax    = temp; break;
                case "zr": initZr  = temp; break;
                case "zi": initZi  = temp; break;
                case "cr": constCr = temp; break;
                case "ci": constCi = temp; break;
                case "r":  bailout = temp; break;
            }

            isAnimating = false;
            document.getElementById("btn-anim").style.cursor = "pointer";
            document.querySelectorAll(".tab-buttons button")[0].style.cursor = "pointer";
            document.querySelectorAll(".tab-buttons button")[1].style.cursor = "pointer";

            return;
        }
        else
        {
            setTimeout(generateFrame, 10);
        }
    }

    generateFrame();
}

document.getElementById("btn-save").addEventListener("click", () =>
{
    let image = canvas.toDataURL();
    let aDownloadLink = document.createElement('a');
    aDownloadLink.download = 'image.png';
    aDownloadLink.href = image;
    aDownloadLink.click();
});

document.getElementById("canvas").addEventListener("mousemove", (e) =>
{
    if (isCanvasClear || isAnimating) return;

    let rect = canvas.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    let [re, im] = canvasToComplex(x, y);
    document.getElementById("mouse-re").textContent = re.toFixed(10);
    document.getElementById("mouse-im").textContent = im.toFixed(10);
});