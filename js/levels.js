const Levels = {
    // Mode 1: VS Computer
    computer: [
        {
            id: 'c1',
            level: 1,
            title: "Getting Started",
            description: "Easy AI. Practice your moves.",
            aiDifficulty: 'easy',
            p1Walls: 10,
            p2Walls: 5
        },
        {
            id: 'c2',
            level: 2,
            title: "Learning the Ropes",
            description: "Easy AI with more walls.",
            aiDifficulty: 'easy',
            p1Walls: 10,
            p2Walls: 8
        },
        {
            id: 'c3',
            level: 3,
            title: "A Fair Fight",
            description: "Medium AI. Think carefully.",
            aiDifficulty: 'medium',
            p1Walls: 10,
            p2Walls: 10
        },
        {
            id: 'c4',
            level: 4,
            title: "Uphill Battle",
            description: "Medium AI, but you have fewer walls.",
            aiDifficulty: 'medium',
            p1Walls: 8,
            p2Walls: 10
        },
        {
            id: 'c5',
            level: 5,
            title: "The Master",
            description: "Hard AI. No mistakes allowed.",
            aiDifficulty: 'hard',
            p1Walls: 8,
            p2Walls: 10
        }
    ],

    // Mode 2: VS Friend (Local Multiplayer)
    friend: [
        {
            id: 'f1',
            level: 1,
            title: "Classic",
            description: "Standard rules. 10 walls each.",
            p1Walls: 10,
            p2Walls: 10
        },
        {
            id: 'f2',
            level: 2,
            title: "Speed Run",
            description: "Fewer walls, more racing. 6 walls each.",
            p1Walls: 6,
            p2Walls: 6
        },
        {
            id: 'f3',
            level: 3,
            title: "Fortress",
            description: "Lots of walls. 15 walls each.",
            p1Walls: 15,
            p2Walls: 15
        },
        {
            id: 'f4',
            level: 4,
            title: "Asymmetric",
            description: "P1 has 12 walls, P2 has 8.",
            p1Walls: 12,
            p2Walls: 8
        },
        {
            id: 'f5',
            level: 5,
            title: "Pure Pathfinding",
            description: "Only 3 walls each. Find the shortest path.",
            p1Walls: 3,
            p2Walls: 3
        }
    ]
};
