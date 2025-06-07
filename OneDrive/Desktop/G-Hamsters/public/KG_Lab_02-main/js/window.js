const getElement = document.querySelector.bind(document);
const lockImg = getElement("#canvas-lock");


 
class Window {
    constructor(
        controlPanel,
        windowButton,
        controlButton = undefined,
        isMenuItem = true
    ) {
        this.controlPanel =  controlPanel;
        this.windowButton = windowButton;
        this.controlButton = controlButton;
        this.isMenuItem = isMenuItem;


        if (this.isMenuItem) {
            this.windowButton[0].onclick = this.openWindow.bind(this);
            this.windowButton[1].onclick = this.openWindow.bind(this);
        } else 
            this.windowButton.onclick = this.openWindow.bind(this);
    }

    changeDisplay(isOn) {
        let displayDir = isOn ? "flex" : "none";

        this.controlPanel.style.display = displayDir;
        if (this.isMenuItem) {
            this.windowButton[0].classList.toggle("active");
            //
            windows.menu.windowButton.classList.toggle("active");
            windows.menu.windowButton.style.pointerEvents = "auto";
            //
        } else if (this !== windows.projects)
            this.windowButton.classList.toggle("active");
    }

    closeCurrentWindow() {
        this.changeDisplay(false);
    };
    
    openWindow() {
        if (this === windows.projects) {
            if (currentWindow !== windows.projects) {
                buttonProjectIcon.src = "https://firebasestorage.googleapis.com/v0/b/noa2-8fefc.appspot.com/o/Dima%2Fback.png?alt=media&token=7e2d1cf7-0bc1-4fcb-9413-c07b87316a53";
                windows.menu.windowButton.classList.add("passive");
                windows.pentool.windowButton.classList.add("passive");
                windows.info.windowButton.classList.add("passive");
                prevProj = currentProject;
                currentProject.closeProject();
                preCurrentWindow = currentWindow;
            } else {
                buttonProjectIcon.src = "https://firebasestorage.googleapis.com/v0/b/noa2-8fefc.appspot.com/o/Dima%2Fprojects.png?alt=media&token=5e3035da-15f3-45ff-9453-5826336e8e5d";
                if (preCurrentWindow.isMenuItem) 
                    sidePanelMenu.style.display = "flex";
                preCurrentWindow.openWindow();
                prevProj.openProject();

                return;
            }
        } else if (currentWindow === windows.projects) {
            buttonProjectIcon.src = "https://firebasestorage.googleapis.com/v0/b/noa2-8fefc.appspot.com/o/Dima%2Fprojects.png?alt=media&token=5e3035da-15f3-45ff-9453-5826336e8e5d";
        }
 
        if (this === windows.menu) {
            sidePanelMenu.style.display = "flex";
        } else if ((currentWindow === windows.menu || currentWindow.isMenuItem) && this.isMenuItem !== true) {
            sidePanelMenu.style.display = "none";
        }
    
        currentWindow.closeCurrentWindow();   
        currentWindow = this;
        this.changeDisplay(true);
    }
}
let prevProj = undefined; 

const menuControlBody = getElement("#control-body-menu");
const windows = {
    projects: new Window(
        getElement("#control-main-projects"),
        getElement("#control-button-projects"),
        getElement("#control-button-create"),
        false
    ),

    menu: new Window(
        getElement("#control-main-menu"),
        getElement("#control-button-menu"),
        undefined,
        false
    ),
    
    pentool: new Window(
        getElement("#control-main-pentool"  ),
        getElement("#control-button-pentool"),
        getElement("#control-button-delete" ),
        false
    ),

    method: new Window(
        getElement("#control-main-method"),
        [
            getElement("#control-button-method"),
            menuControlBody.children[0]
        ],
        undefined
    ),

    recursive: new Window(
        getElement("#control-main-recursive"),
        [
            getElement("#control-button-recursive"),
            menuControlBody.children[1]
        ],
        getElement("#control-button-start")
    ),

    points: new Window(
        getElement("#control-main-points"),
        [
            getElement("#control-button-points"),
            menuControlBody.children[2]
        ],
        getElement("#control-button-points")
    ),

    polynom: new Window(
        getElement("#control-main-polynom"),
        [
            getElement("#control-button-polynom"),
            menuControlBody.children[3]
        ],
        getElement("#control-button-polynom")
    ),

    matrix: new Window(
        getElement("#control-main-matrix"),
        [
            getElement("#control-button-matrix"),
            menuControlBody.children[4]
        ],
        getElement("#control-button-matrix")
    ),

    pallete: new Window(
        getElement("#control-main-pallete"),
        [
            getElement("#control-button-pallete"),
            menuControlBody.children[5]
        ],
        getElement("#control-button-reset")
    ),

    info: new Window(
        getElement("#control-main-info"),
        getElement("#control-button-info"),
        undefined,
        false
    )
}


// windows.pallete.controlButton.addEventListener("click", resetColors);
const MethodType = {
    PARAMETRIC: "parametric",
    RECURSIVE: "recursive",
    MATRIX: "matrix"
};
let selectedMethod = MethodType.PARAMETRIC;

document.querySelectorAll('#control-body-method .menu-item').forEach((menuItem) => {
    menuItem.addEventListener('click', () => {
        const radioInput = menuItem.querySelector('input[type="radio"]');
        if (radioInput) {
        radioInput.checked = true; 
        selectedMethod = radioInput.value;
        }
    });
});

let preCurrentWindow;
let currentWindow = windows.projects;
let currentProject;
let projects = [];

let controlBodyProjects =  getElement("#control-body-projects");
let buttonCreateProject = getElement("#control-button-create");
let buttonProjectIcon = getElement("#icon-button-projects");
let sidePanelMenu = getElement("#side-panel-menu");

buttonCreateProject.addEventListener("click", createProjectItem);

function createProjectItem() {
    const container = controlBodyProjects;

    const menuItem = document.createElement("div");
    menuItem.classList.add("menu-item");
            
    const lineBlock = document.createElement("div");
    lineBlock.classList.add("line-block");

    const input = document.createElement("input");
    input.type = "text";
    input.classList.add("project-name");

    const deleteIcon = document.createElement("img");
    deleteIcon.src = "https://firebasestorage.googleapis.com/v0/b/noa2-8fefc.appspot.com/o/Dima%2Fdelete.png?alt=media&token=76abb2e4-e488-4f15-90b9-91e5a863a0d8";
    deleteIcon.alt = "delete project";
    deleteIcon.classList.add("project-icon");

    lineBlock.appendChild(input);
    lineBlock.appendChild(deleteIcon);

    const canvas = document.createElement("canvas");
    canvas.classList.add("canvas-preview");

    menuItem.appendChild(lineBlock);
    menuItem.appendChild(canvas);

    container.prepend(menuItem);

    let project = new Project (
        menuItem,
        input,
        deleteIcon,
        canvas
    )
    projects.push(project);

    menuItem.dataset.project = project;

    return project;
}

class Project {
    static projectCounter = 0;
    constructor(
        menuItem, 
        input, 
        deleteIcon, 
        canvas
    ) {
        this.id = ++Project.projectCounter;
        this.name = "Project_" + this.id;

        this.menuItem = menuItem;
        this.menuItem.addEventListener("click", () => this.openProject());
        this.menuItem.addEventListener("mouseenter", () => {
            if (!this.isClear)
            this.drawThis();
        } );
        this.menuItem.addEventListener("mouseleave", () => {

            if (!currentProject || currentWindow === windows.projects)
                clearCanv();
        });

        this.input = input;
        this.isInputFocused = false;
        this.input.value = this.name;
        this.input.addEventListener("change", (event) => this.changeName(event));
        this.input.addEventListener("focus", () => this.isInputFocused = true);
        this.input.addEventListener("blur", () => {
            setTimeout(() => {
                this.isInputFocused = false
            }, 150);
        });

        this.deleteIcon = deleteIcon;
        this.deleteIcon.addEventListener("click", () => this.deleteProject());

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.canvas.width = sizeCanvas.x;
        this.canvas.height = sizeCanvas.y;
    
        this.segments = [];
        this.curves = [];
        this.param = {
            maxGridSize: 29 * coefC,
            minGridSize: 14 * coefC,
            curGridSize: (maxGridSize + minGridSize) / 2,
            curDivsNumbr: 0,
            curDivsValue: 1,
            dragOffset: new Pair(0, 0),
            colors: new Colors()
        }
        this.isClear = true;
    }

    drawThis() {
        currentProject = this;
        currentCurve = undefined;
        updateGlueToggle();

        currentPoint = undefined;
        currentSegment = undefined;
        currentMaxPolynoms.value = 0;
        startPolynomInput.value = 0;
        endPolynomInput.value = 0;

        maxGridSize = this.param.maxGridSize;
        minGridSize = this.param.minGridSize;
        curGridSize = this.param.curGridSize;
        curDivsNumbr = this.param.curDivsNumbr;
        curDivsValue = this.param.curDivsValue;
        dragOffset = this.param.dragOffset;
        colors = this.param.colors;

        if (prevProj !== this) {
            pointPanel.innerHTML = "";
            tableBodyPoint.innerHTML = '';
            tableBody.innerHTML = '';
        }

        colors.setCurveColors();
        updateCanvasSize();
        drawSystem();
        drawCurve()
    }

    openProject() {
        if (this.deleteIcon.contains(event.target)) return;
        if (this.input.contains(event.target)) return;
        if (this.isInputFocused) return;
        this.isClear = false;
        windows.projects.windowButton.classList.remove("passive");
        windows.menu.windowButton.classList.remove("passive");
        windows.pentool.windowButton.classList.remove("passive");
        windows.info.windowButton.classList.remove("passive");

        this.drawThis();
        blockCanvas(false);

        windows.menu.openWindow();
    }

    closeProject() {
        let srcWidth = canvasMainCurve.width;
        let srcHeight = canvasMainCurve.height;
        let dstWidth = this.canvas.width;
        let dstHeight = this.canvas.height;

        let scale = Math.min(dstWidth / srcWidth, dstHeight / srcHeight);
    
        let drawWidth = srcWidth * scale;
        let drawHeight = srcHeight * scale;
    
        let offsetX = (dstWidth - drawWidth) / 2;
        let offsetY = (dstHeight - drawHeight) / 2;

        this.ctx.clearRect(0, 0, dstWidth, dstHeight);

        currentCurve = undefined;
        updateGlueToggle();

        currentSegment = undefined;
        currentMaxPolynoms.value = 0;
        startPolynomInput.value = 0;
        endPolynomInput.value = 0;
        drawCurve(true);
        

        this.ctx.drawImage(
            canvasMainCurve,
            0, 0, srcWidth, srcHeight,   
            offsetX, offsetY, drawWidth, drawHeight  
        );

        blockCanvas(true);
        clearCanv();
        this.param = {
            maxGridSize: maxGridSize,
            minGridSize: minGridSize,
            curGridSize: curGridSize,
            curDivsNumbr: curDivsNumbr,
            curDivsValue: curDivsValue,
            dragOffset: dragOffset,
            colors: colors
        }
        currentProject = undefined;
    }

    deleteProject() {
        const res = confirm(
            'Are you sure to delete project "' + this.name + '"?'
        );
        if (!res) return;

        if (currentProject === this) {
            windows.projects.windowButton.classList.add("passive");
            clearCanv();
        }

        const index = projects.findIndex(
            (project) => project.id === this.id
        );
        
        if (index !== -1) {
            projects.splice(index, 1);
            this.menuItem.remove();
        }

        if (currentProject === this) {
            currentProject = undefined;
            buttonControlProject.style.display = "none";
        }
    }

    changeName() {
        if (this.input.value.trim() !== "") {
            this.name = this.input.value;
        } else {
            this.input.value = this.name;
        }
    }
}

function clearCanv() {
    ctx.clearRect(0, 0, canvasMain.width, canvasMain.height);
    ctxCur.clearRect(0, 0, canvasMainCurve.width, canvasMainCurve.height);
}

function blockCanvas(isBlock) {
    if (isBlock) {
        canvasMainCurve.style.pointerEvents = "none";
        lockImg.style.display = "flex";
        sider.style.display = "none";

    } else {
        canvasMainCurve.style.pointerEvents = "auto";
        lockImg.style.display = "none";        
        sider.style.display = "flex";

    }
}

const controlPanel = document.getElementById("control-panel");
const resizeHandle = document.getElementById("control-panel-resize");

let isResizing = false;
let startX = 0;
let startWidth = 0;

const minWidth = 330;
const maxWidth = 630;

resizeHandle.addEventListener("mousedown", (event) => {
  event.preventDefault();

  const rect = resizeHandle.getBoundingClientRect();
  const withinHandle =
    event.clientX >= rect.left &&
    event.clientX <= rect.right &&
    event.clientY >= rect.top &&
    event.clientY <= rect.bottom;

  if (!withinHandle) {
    return; 
  }

  isResizing = true;
  prevX = event.clientX;

  document.body.style.cursor = "ew-resize"; 
  document.body.style.userSelect = "none"; 

  document.addEventListener("mousemove", resizePanel);
  document.addEventListener("mouseup", stopResizing);
});

function resizePanel(event) {
    if (!isResizing) return;
  
    const deltaX = event.clientX - prevX;
    prevX = event.clientX; 
    
    let newWidth = controlPanel.offsetWidth + deltaX;
    if (newWidth < minWidth) newWidth = minWidth;
    if (newWidth > maxWidth) newWidth = maxWidth;
  
    controlPanel.style.width = `${newWidth}px`;
  }
function stopResizing() {
  if (!isResizing) return;

  isResizing = false;

  document.body.style.cursor = "";
  document.body.style.userSelect = "";

  document.removeEventListener("mousemove", resizePanel);
  document.removeEventListener("mouseup", stopResizing);
}

const sider = getElement("#canvas-glue");
const glueToggle = getElement("#glue-toggle");
const glueSlider = getElement("#slider");


function updateGlueToggle() {
if (currentCurve) {
    glueToggle.disabled = true;
    glueToggle.style.pointerEvents = "none";
    glueSlider.style.cursor = "default";
    glueSlider.classList.add("disabled"); 
    glueSlider.setAttribute("data-tooltip", "Неможливо обрати режим для вже створеної кривої."); 
} else {
    glueToggle.disabled = false;
    glueToggle.style.pointerEvents = "auto";
    glueSlider.style.cursor = "pointer";
    glueSlider.classList.remove("disabled"); 
    glueSlider.removeAttribute("data-tooltip"); 
}
}

glueToggle.addEventListener("change", () => {

});
