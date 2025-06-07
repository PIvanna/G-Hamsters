const GAME_LEVELS = [
    {
        id: 1,
        name: "Ознайомчий Спуск",
        roadSegments: [ 
            new Point(10, 20),  
            new Point(30, 10),  
            new Point(70, 90),  
            new Point(90, 75)   
        ],
        edgeBonuses: [ 
            { t: 0.05, id: "eb1-start", value: 25, type: 'edge' },
            { t: 0.95, id: "eb1-end", value: 25, type: 'edge' }
        ],
        bonuses: [ 
            { t: 0.3, value: 10, id: "b1-1", type: 'normal' },
            { t: 0.5, value: 10, id: "b1-2", type: 'normal' },
            { t: 0.7, value: 10, id: "b1-3", type: 'normal' }
        ],
        maxUserPoints: 7 
    },
    {
        id: 2,
        name: "Гострий Зигзаг",
        roadSegments: [ 
            new Point(15, 80), 
            new Point(40, 10), 
            new Point(60, 90), 
            new Point(85, 20)
        ],
        edgeBonuses: [
            { t: 0.05, id: "eb2-start", value: 30, type: 'edge' },
            { t: 0.95, id: "eb2-end", value: 30, type: 'edge' }
        ],
        bonuses: [
            { t: 0.25, value: 10, id: "b2-1", type: 'normal' }, 
            { t: 0.5, value: 10, id: "b2-2", type: 'normal' }, 
            { t: 0.75, value: 10, id: "b2-3", type: 'normal' }
        ],
        maxUserPoints: 10 
    },
    {
        id: 3,
        name: "Пласка S-Хвиля", 
        roadSegments: [
            new Point(50, 80),   
            new Point(10, 60),  
            new Point(20, 40),  
            new Point(80, 40),  
            new Point(90, 60), 
            new Point(50, 20)
        ],
        edgeBonuses: [ 
            { t: 0.03, id: "eb3-start", value: 35, type: 'edge' },
            { t: 0.97, id: "eb3-end", value: 35, type: 'edge' }
        ],
        bonuses: [ 
            { t: 0.18, value: 15, id: "b3-1", type: 'normal' },
            { t: 0.38, value: 15, id: "b3-2", type: 'normal' },
            { t: 0.62, value: 15, id: "b3-3", type: 'normal' },
            { t: 0.82, value: 15, id: "b3-4", type: 'normal' }
        ],
        maxUserPoints: 13 
    },
    {
        id: 4,
        name: "Компактна Петля", 
        roadSegments: [ 
            new Point(20, 50), 
            new Point(10, 15),  
            new Point(50, 5), 
            new Point(90, 15),
            new Point(80, 50), 
            new Point(50, 70) 
        ],
        edgeBonuses: [ 
            { t: 0.03, id: "eb4-start", value: 40, type: 'edge' },
            { t: 0.97, id: "eb4-end", value: 40, type: 'edge' }   
        ],
        bonuses: [ 
            { t: 0.20, value: 20, id: "b4-1", type: 'normal' },
            { t: 0.40, value: 20, id: "b4-2", type: 'normal' },
            { t: 0.60, value: 20, id: "b4-3", type: 'normal' },
            { t: 0.80, value: 20, id: "b4-4", type: 'normal' }
        ],
        maxUserPoints: 13 
    },
    {
        id: 5,
        name: "Гірський Серпантин", 
        roadSegments: [ 
            new Point(10, 80),  
            new Point(30, 20), 
            new Point(50, 90), 
            new Point(70, 10),
            new Point(90, 70)
        ], 
        edgeBonuses: [ 
            { t: 0.02, id: "eb5-start", value: 50, type: 'edge' },
            { t: 0.98, id: "eb5-end", value: 50, type: 'edge' }
        ],
        bonuses: [ 
            { t: 0.15, value: 20, id: "b5-1", type: 'normal' },
            { t: 0.35, value: 25, id: "b5-2", type: 'normal' },
            { t: 0.55, value: 20, id: "b5-3", type: 'normal' },
            { t: 0.75, value: 25, id: "b5-4", type: 'normal' }
        ],
        maxUserPoints: 16 
    },
    {
        id: 6,
        name: "Подвійний Віраж", 
        roadSegments: [ 
            new Point(10, 30), 
            new Point(40, 10), 
            new Point(60, 30), 
            new Point(40, 90), 
            new Point(90, 70), 
            new Point(70, 50)
        ],
        edgeBonuses: [
            { t: 0.01, id: "eb6-start", value: 60, type: 'edge' },
            { t: 0.99, id: "eb6-end", value: 60, type: 'edge' }
        ],
        bonuses: [
            { t: 0.18, value: 25, id: "b6-1", type: 'normal' },
            { t: 0.38, value: 30, id: "b6-2", type: 'normal' },
            { t: 0.58, value: 25, id: "b6-3", type: 'normal' },
            { t: 0.78, value: 30, id: "b6-4", type: 'normal' }
        ],
        maxUserPoints: 16
    }
];