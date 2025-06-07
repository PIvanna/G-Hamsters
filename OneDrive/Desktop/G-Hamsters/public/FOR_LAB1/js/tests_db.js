class CTestResults {
  constructor(correctAnswers, errorAnswers, timePass) {
    this.correctAnswers = correctAnswers;
    this.errorAnswers = errorAnswers;
    this.timePass = timePass;
  }
}

const test1 = {
  id: "test-1",
  title: "Тест 1: Визначення правильного коду для малювання фігур",
  description:
    "Оберіть правильний варіант коду, який відповідає зображенню на канві.",
  questions: [
    {
      id: "1",
      question:
        "Який варіант коду правильно малює фігуру? <br> (значення STEP відповідає розміру однієї клітинки)",
      options: [
        {
          code: `c.fillRect( STEP*3, canvas.height-STEP*5, STEP*4, STEP*3);`,
          correct: true,
        },
        {
          code: `c.fillRect( STEP*4, canvas.height-STEP*3, STEP*4, STEP*4);`,
          correct: false,
        },
        {
          code: `c.strokeRect( STEP*3, canvas.height-STEP*5, STEP*4, STEP*4);`,
          correct: false,
        },
        {
          code: `c.fillRect( STEP*3, canvas.height-STEP*5, STEP*2, STEP*2);`,
          correct: false,
        },
      ],
    },
    {
      id: "2",
      question:
        "Який варіант коду правильно малює вузький вертикальний прямокутник?",
      options: [
        {
          code: `c.fillRect(STEP*4, canvas.height - STEP*2, STEP, STEP*2);`,
          correct: false,
        },
        {
          code: `c.fillRect(STEP*3, canvas.height - STEP*4, STEP, STEP*2);`,
          correct: false,
        },
        {
          code: `c.fillRect(STEP*4, canvas.height - STEP*4, STEP*2, STEP);`,
          correct: false,
        },
        {
          code: `c.fillRect(STEP*4, canvas.height - STEP*4, STEP, STEP*2);`,
          correct: true,
        },
      ],
    },
    {
      id: "3",
      question: "Який код правильно малює маленький квадрат для вікна?",
      options: [
        {
          code: `c.fillRect(STEP*5, canvas.height - STEP*4, STEP*2, STEP);`,
          correct: false,
        },
        {
          code: `c.fillRect(STEP*5.5, canvas.height - STEP*4, STEP, STEP);`,
          correct: true,
        },
        {
          code: `c.fillRect(STEP*6, canvas.height - STEP*4, STEP, STEP*2);`,
          correct: false,
        },
        {
          code: `c.fillRect(STEP*5.5, canvas.height - STEP*5, STEP, STEP);`,
          correct: false,
        },
      ],
    },
    {
      id: "4",
      question:
        "Який код малює горизонтальний прямокутник для зображення трави?",
      options: [
        {
          code: `c.fillRect(0, canvas.height - STEP*2, canvas.width, STEP*2);`,
          correct: false,
        },
        {
          code: `c.fillRect(0, canvas.height - STEP*3, canvas.width, STEP);`,
          correct: false,
        },
        {
          code: `c.fillRect(0, canvas.height - STEP*2, STEP*3, STEP);`,
          correct: false,
        },
        {
          code: `c.fillRect(0, canvas.height - STEP*2, canvas.width, STEP);`,
          correct: true,
        },
      ],
    },
    {
      id: "5",
      question: "Який код малює трикутний-дах коричневого кольору?",
      options: [
        {
          code: `c.beginPath();<br> 
  c.moveTo(STEP*2, canvas.height-STEP*6);<br> 
  c.lineTo(STEP*5, canvas.height-STEP*8);<br> 
  c.lineTo(STEP*8, canvas.height-STEP*6);<br> 
  c.closePath();<br> 
  c.fillStyle = "#a52a2a";<br> 
  c.fill();<br> `,
          correct: false,
        },
        {
          code: `c.fillRect(STEP*5, canvas.height-STEP*7, STEP*2, STEP*2);`,
          correct: false,
        },
        {
          code: `c.beginPath();<br> 
  c.moveTo(STEP*2, canvas.height-STEP*5);<br> 
  c.lineTo(STEP*5, canvas.height-STEP*7);<br> 
  c.lineTo(STEP*8, canvas.height-STEP*5);<br> 
  c.closePath();<br> 
  c.fillStyle = "#a52a2a";<br> 
  c.fill();<br> `,
          correct: true,
        },
        {
          code: `c.strokeRect(STEP*2, canvas.height-STEP*5, STEP*6, STEP*2);`,
          correct: false,
        },
      ],
    },
  ],
};

const test2 = {
  id: "test-2",
  title: "Тест 2: Розпізнавання елементів малюнка будинку",
  description:
    "Оберіть правильний варіант коду, який відповідає зазначеному на малюнку елементу.",
  questions: [
    {
      id: "1",
      question:
        "Який варіант коду правильно малює стіни будинку? <br> (значення STEP відповідає розміру однієї клітинки)",
      options: [
        {
          code: `c.fillRect(STEP * 2.5, canvas.height - STEP * 5, STEP * 5, STEP * 3);`,
          correct: true,
        },
        {
          code: `c.fillRect(STEP * 4, canvas.height - STEP * 5, STEP * 4, STEP * 4);`,
          correct: false,
        },
        {
          code: `c.fillRect(STEP * 3.5, canvas.height - STEP * 4, STEP * 4.5, STEP * 4);`,
          correct: false,
        },
        {
          code: `c.strokeRect(STEP * 2.5, canvas.height - STEP * 5, STEP * 4, STEP * 4);`,
          correct: false,
        },
      ],
    },

    {
      id: "2",
      question:
        "Який варіант коду правильно малює дах будинку у формі трикутника?",
      options: [
        {
          code: `c.beginPath();  <br>
c.moveTo(STEP * 2, canvas.height - STEP * 5); <br>
c.lineTo(STEP * 5, canvas.height - STEP * 7);  <br>
c.lineTo(STEP * 8, canvas.height - STEP * 5);  <br>
c.closePath();  <br>
c.fill();  <br>
`,
          correct: true,
        },
        {
          code: `c.beginPath();  <br>
c.moveTo(STEP * 2, canvas.height - STEP * 6);  <br>
c.lineTo(STEP * 5, canvas.height - STEP * 8);  <br>
c.lineTo(STEP * 8, canvas.height - STEP * 6);  <br>
c.closePath();  <br>
c.fill();  <br>
`,
          correct: false,
        },
        {
          code: `c.fillTriangle(STEP * 2, canvas.height - STEP * 7, STEP * 6, STEP * 2);  <br>
`,
          correct: false,
        },
        {
          code: `c.beginPath();  <br>
c.moveTo(STEP * 3, canvas.height - STEP * 5); <br>
c.lineTo(STEP * 5, canvas.height - STEP * 7);  <br>
c.lineTo(STEP * 7, canvas.height - STEP * 5);  <br>
c.closePath();  <br>
c.fill();  <br>
`,
          correct: false,
        },
      ],
    },

    {
      id: "3",
      question: "Який варіант коду правильно малює двері та ручку на будинку?",
      options: [
        {
          code: `c.fillRect(STEP * 4.5, canvas.height - STEP * 4, STEP, STEP * 2);  <br>
c.beginPath(); <br>
c.arc(STEP * 5.4, canvas.height - STEP*3, 5, 0, 2 * Math.PI);  <br>
c.fill(); <br>
`,
          correct: true,
        },
        {
          code: `c.fillRect(STEP * 4.5, canvas.height - STEP * 4, STEP , STEP*2);  <br>

c.beginPath();  <br>
c.arc(STEP * 5.4, canvas.height - STEP * 3, 5, 0, Math.PI);  <br>
c.fill();  <br>
`,
          correct: false,
        },
        {
          code: `c.fillRect(STEP * 5, canvas.height - STEP * 3, STEP, STEP * 2);  <br>

c.beginPath();  <br>
c.circle(STEP * 5.5, canvas.height - STEP * 1.5, 5, 0, 2 * Math.PI);  <br>
c.fill();  <br>
`,
          correct: false,
        },
        {
          code: `c.fillRect(STEP * 4.5, canvas.height - STEP * 3, STEP*2, STEP);  <br>

c.beginPath();  <br>
c.arc(STEP * 5.4, canvas.height - STEP * 2, 5, 0, 2 * Math.PI);  <br>
c.fill();  <br>
`,
          correct: false,
        },
      ],
    },
    {
      id: "4",
      question: "Який варіант коду правильно малює вікна на будинку?",
      options: [
        {
          code: `c.fillRect(STEP * 4, canvas.height - STEP * 3, STEP * 2, STEP);  <br>
                c.fillRect(STEP * 6, canvas.height - STEP * 5, STEP, STEP);  <br>`,
          correct: false,
        },
        {
          code: `c.fillRect(STEP * 3.2, canvas.height - STEP * 4, STEP, STEP);  <br>
              c.fillRect(STEP * 5.8, canvas.height - STEP * 4, STEP, STEP);  <br>`,
          correct: true,
        },
        {
          code: `c.fillRect(STEP * 3.2, canvas.height - STEP * 4, STEP * 1.5, STEP * 2);  <br>
              c.fillRect(STEP * 5.8, canvas.height - STEP * 4, STEP * 0.5, STEP * 2);  <br>`,
          correct: false,
        },
        {
          code: `c.fillRect(STEP * 3, canvas.height - STEP * 5, STEP, STEP * 2);  <br>
            c.fillRect(STEP * 6, canvas.height - STEP * 4, STEP, STEP);  <br>`,
          correct: false,
        },
      ],
    },

    {
      id: "5",
      question: "Який варіант коду правильно малює раміки на вікнах?",
      options: [
        {
          code: `

c.beginPath();  <br>
c.moveTo(STEP * 3.2 + STEP / 2, canvas.height - STEP * 4);  <br>
c.lineTo(STEP * 3.2 + STEP / 2, canvas.height - STEP * 3);  <br>
c.moveTo(STEP * 3.2, canvas.height - STEP * 3.5);  <br>
c.lineTo(STEP * 4.2, canvas.height - STEP * 3.5);  <br>
c.stroke();  <br>

c.beginPath();  <br>
c.moveTo(STEP * 5.8 + STEP / 2, canvas.height - STEP * 4);  <br>
c.lineTo(STEP * 5.8 + STEP / 2, canvas.height - STEP * 3);  <br>
c.moveTo(STEP * 5.8, canvas.height - STEP * 3.5);  <br>
c.lineTo(STEP * 6.8, canvas.height - STEP * 3.5);  <br>
c.stroke();`,
          correct: true,
        },
        {
          code: `

c.beginPath();  <br>
c.moveTo(STEP * 3, canvas.height - STEP * 4);  <br>
c.lineTo(STEP * 3, canvas.height - STEP * 3);  <br>
c.moveTo(STEP * 3, canvas.height - STEP * 3.5);  <br>
c.lineTo(STEP * 4, canvas.height - STEP * 3.5);  <br>
c.stroke();  <br>`,
          correct: false,
        },
        {
          code: `
c.beginPath();  <br>
c.moveTo(STEP * 4, canvas.height - STEP * 5);  <br>
c.lineTo(STEP * 4, canvas.height - STEP * 3);  <br>
c.moveTo(STEP * 4, canvas.height - STEP * 4);  <br>
c.lineTo(STEP * 5, canvas.height - STEP * 4);  <br>

c.moveTo(STEP * 5.8, canvas.height - STEP * 4);  <br>
c.lineTo(STEP * 5.8, canvas.height - STEP * 3);  <br>
c.moveTo(STEP * 5.8, canvas.height - STEP * 3.5);  <br>
c.lineTo(STEP * 6.8, canvas.height - STEP * 3.5);  <br>
c.stroke();  <br>`,
          correct: false,
        },
        {
          code: `
c.beginPath();  <br>
c.moveTo(STEP * 6, canvas.height - STEP * 4);  <br>
c.lineTo(STEP * 6, canvas.height - STEP * 3);  <br>
c.moveTo(STEP * 6, canvas.height - STEP * 3.5);  <br>
c.lineTo(STEP * 7, canvas.height - STEP * 3.5);  <br>
c.stroke();  <br>`,
          correct: false,
        },
      ],
    },
    {
      id: "6",
      question: "Який варіант коду правильно малює сонце?",
      options: [
        {
          code: `
            c.arc(STEP * 2, STEP*2, STEP, 0, Math.PI * 2);  <br>
            c.fill();  <br>`,
          correct: true,
        },
        {
          code: `
          c.rect(STEP, STEP, STEP, 0 ,  Math.PI * 2);  <br>
          c.fill();  <br>`,
          correct: false,
        },
        {
          code: `
        c.moveTo(STEP * 1, STEP);  <br>
        c.lineTo(STEP * 2, STEP * 2);  <br>
        c.stroke();  <br>`,
          correct: false,
        },
        {
          code: `
        c.circle(STEP * 1, STEP, STEP / 2, STEP, 0, 0, Math.PI);  <br>
        c.fill();`,
          correct: false,
        },
      ],
    },
    {
      id: "7",
      question:
        "Який варіант коду правильно малює 2 нижні півпрозорі кола диму?",
      options: [
        {
          code: `c.globalAlpha = 0.3;  <br>
           
            c.arc(STEP * 6.75, canvas.height - STEP * 7, 8, 0, Math.PI * 2);  <br>
            c.fill();  <br>
            c.beginPath(); <br>
            c.arc(STEP * 6.8, canvas.height - STEP * 7.5, 10, 0, Math.PI * 2);  <br>
            c.fill();  <br>
            c.globalAlpha = 1;`,
          correct: true,
        },
        {
          code: `
          c.globalAlpha = 0.3; <br>
        
          c.arc(STEP * 6.75, canvas.height - STEP * 7, 8, 0, Math.PI * 2); <br>
          c.fill();  <br>
          c.beginPath();  <br>
          c.arc(STEP * 6.8, canvas.height - STEP * 7.5, 10, 0, Math.PI * 2);  <br>
          c.fill();  <br>`,
          correct: false, // globalAlpha не скинуто в 1, що може вплинути на наступний малюнок
        },
        {
          code: `c.globalAlpha = 0.3; <br>
       
        c.arc(STEP * 6.75, canvas.height - STEP * 7, 8, 0, Math.PI); <br>
        c.fill();  <br>
        c.beginPath();  <br>
        c.arc(STEP * 6.8, canvas.height - STEP * 7.5, 10, 0, Math.PI);  <br>
        c.fill();  <br>
        c.globalAlpha = 1;  <br>`,
          correct: false, // arc малює не повні кола (Math.PI замість 2*Math.PI)
        },
        {
          code: `c.globalAlpha = 1;  <br>
       
        c.arc(STEP * 6.75, canvas.height - STEP * 7, 8, 0, Math.PI * 2);  <br>
        c.fill();  <br>
        c.beginPath();  <br>
        c.arc(STEP * 6.8, canvas.height - STEP * 7.5, 10, 0, Math.PI * 2);  <br>
        c.fill();`,
          correct: false, // глобальна прозорість не встановлена (globalAlpha = 1)
        },
      ],
    },
    {
      id: "8",
      question:
        "Який варіант коду правильно малює зелений ґрунт у нижній частині полотна? <br> (значення STEP відповідає розміру однієї клітинки)",
      options: [
        {
          code: "c.fillRect(0, canvas.height - STEP * 2, canvas.width, STEP);",
          correct: true,
        },
        {
          code: "c.fillRect(0, canvas.height - STEP, canvas.width, STEP * 2);",
          correct: false,
        },
        {
          code: "c.fillRect(0, canvas.height - STEP * 3, canvas.width, STEP);",
          correct: false,
        },
        {
          code: "c.fillRect(0, canvas.height - STEP * 2, canvas.width, STEP*2);",
          correct: false,
        },
      ],
    },
  ],
};

const test3 = {
  id: "test-3",
  title: "Тест 3: Поетапне малювання кораблика",
  description:
    "Оберіть правильний варіант коду для кожного етапу функції drawPartTest3(step).",
  questions: [
    {
      id: "1",
      question: "Який код у випадку правильно малює воду?",
      options: [
        {
          code: `c.fillRect(0, canvas.height - STEP * 2, canvas.width, STEP);`,
          correct: true,
        },
        {
          code: `c.fillRect(0, canvas.height - STEP * 2, canvas.width, STEP);`,
          correct: false,
        },
        {
          code: `c.fillRect(0, canvas.height - STEP * 2, canvas.width, STEP);`,
          correct: false,
        },
        {
          code: `c.fillRect(0, canvas.height - STEP, canvas.width, STEP);`,
          correct: false,
        },
      ],
    },
    {
      id: "2",
      question: "Який код у випадку правильно малює ліве вітрило?",
      options: [
        {
          code: `c.beginPath();<br>c.moveTo(STEP * 5, canvas.height - STEP * 8);<br>c.lineTo(STEP * 3.5, canvas.height - STEP * 4);<br>c.lineTo(STEP * 5, canvas.height - STEP * 4);<br>c.closePath();<br>c.fill();<br>c.stroke();`,
          correct: true,
        },
        {
          code: `c.beginPath();<br>c.moveTo(STEP * 4.5, canvas.height - STEP * 7);<br>c.lineTo(STEP * 3, canvas.height - STEP * 3);<br>c.lineTo(STEP * 4.5, canvas.height - STEP * 3);<br>c.closePath();<br>c.fill();<br>c.stroke();`,
          correct: false,
        },
        {
          code: `c.beginPath();<br>c.moveTo(STEP * 5, canvas.height - STEP * 8);<br>c.lineTo(STEP * 3.5, canvas.height - STEP * 4);<br>c.lineTo(STEP * 5, canvas.height - STEP * 4);<br>c.closePath();<br>c.stroke();`,
          correct: false,
        },
        {
          code: `c.beginPath();<br>c.moveTo(STEP * 5, canvas.height - STEP * 7);<br>c.lineTo(STEP * 3.5, canvas.height - STEP * 4);<br>c.lineTo(STEP * 5, canvas.height - STEP * 4);<br>c.closePath();<br>c.fill();<br>c.stroke();`,
          correct: false,
        },
      ],
    },
    {
      id: "3",
      question: "Який код у випадку правильно малює праве вітрило?",
      options: [
        {
          code: `c.beginPath();<br>c.moveTo(STEP * 5, canvas.height - STEP * 7);<br>c.lineTo(STEP * 5, canvas.height - STEP * 4);<br>c.lineTo(STEP * 6.5, canvas.height - STEP * 4);<br>c.closePath();<br>c.fill();<br>c.stroke();`,
          correct: true,
        },
        {
          code: `c.beginPath();<br>c.moveTo(STEP * 5, canvas.height - STEP * 8);<br>c.lineTo(STEP * 5, canvas.height - STEP * 4);<br>c.lineTo(STEP * 6, canvas.height - STEP * 4);<br>c.closePath();<br>c.fill();<br>c.stroke();`,
          correct: false,
        },
        {
          code: `c.beginPath();<br>c.moveTo(STEP * 5, canvas.height - STEP * 7);<br>c.lineTo(STEP * 5, canvas.height - STEP * 5);<br>c.lineTo(STEP * 6.5, canvas.height - STEP * 5);<br>c.closePath();<br>c.fill();<br>c.stroke();`,
          correct: false,
        },
        {
          code: `c.beginPath();<br>c.arc(STEP * 5, canvas.height - STEP * 6, 20, 0, 2 * Math.PI);<br>c.fill();<br>c.stroke();`,
          correct: false,
        },
      ],
    },
    {
      id: "4",
      question: "Який код у випадку правильно малює сонце?",
      options: [
        {
          code: `c.beginPath();<br>c.arc(canvas.width - STEP * 1.5, STEP * 1.2, STEP * 0.8, 0, 2 * Math.PI);<br>c.fill();<br>c.stroke();`,
          correct: true,
        },
        {
          code: `c.beginPath();<br>c.arc(canvas.width - STEP * 1.5, STEP * 1.2, STEP, 0, Math.PI);<br>c.fill();`,
          correct: false,
        },
        {
          code: `c.beginPath();<br>c.arc(canvas.width - STEP * 1.5, STEP * 1.2, STEP * 0.8, 0, 2 * Math.PI);<br>c.stroke();`,
          correct: false,
        },
        {
          code: `c.fillRect(canvas.width - STEP * 1.5, STEP * 1.2, STEP * 1, STEP * 1);`,
          correct: false,
        },
      ],
    },
    {
      id: "5",
      question: "Який код правильно малює короткий відрізок щогли?",
      options: [
        {
          code: `c.beginPath();<br>c.moveTo(STEP * 5, canvas.height - STEP * 4);<br>c.lineTo(STEP * 5, canvas.height - STEP * 3);<br>c.stroke();`,
          correct: true,
        },
        {
          code: `c.beginPath();<br>c.moveTo(STEP * 3, canvas.height - STEP * 4);<br>c.lineTo(STEP * 3, canvas.height - STEP * 3);<br>c.stroke();`,
          correct: false,
        },
        {
          code: `c.moveTo(STEP * 5, canvas.height - STEP * 4);<br>c.lineTo(STEP * 5, canvas.height - STEP * 2);<br>c.stroke();`,
          correct: false,
        },
        {
          code: `c.beginPath();<br>c.moveTo(STEP * 5, canvas.height - STEP * 5);<br>c.lineTo(STEP * 5, canvas.height - STEP * 3);<br>c.stroke();`,
          correct: false,
        },
      ],
    },
    {
      id: "6",
      question:
        "Який код у випадку правильно малює корпус корабля складної форми?",
      options: [
        {
          code: `c.beginPath();<br>c.moveTo(STEP * 3.5, canvas.height - STEP * 2);<br>c.lineTo(STEP * 3, canvas.height - STEP * 3);<br>c.lineTo(STEP * 7.5, canvas.height - STEP * 3);<br>c.lineTo(STEP * 7, canvas.height - STEP * 2);<br>c.fill();<br>c.stroke();`,
          correct: true,
        },
        {
          code: `c.beginPath();<br>c.moveTo(STEP * 3.5, canvas.height - STEP * 2);<br>c.lineTo(STEP * 3, canvas.height - STEP * 3);<br>c.lineTo(STEP * 7.5, canvas.height - STEP * 3);<br>c.lineTo(STEP * 7, canvas.height - STEP * 2);<br>c.closePath();<br>c.fill();<br>c.stroke();`,
          correct: false,
        },
        {
          code: `c.fillRect(STEP * 3.5, canvas.height - STEP * 3, STEP * 4, STEP);<br>c.stroke();`,
          correct: false,
        },
        {
          code: `c.beginPath();<br>c.moveTo(STEP * 3.5, canvas.height - STEP * 1);<br>c.lineTo(STEP * 3, canvas.height - STEP * 2);<br>c.stroke();`,
          correct: false,
        },
      ],
    },
  ],
};

const TESTS_MAP = new Map();
TESTS_MAP.set("test1", test1);
TESTS_MAP.set("test2", test2);
TESTS_MAP.set("test3", test3);
