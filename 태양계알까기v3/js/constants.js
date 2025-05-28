// 게임 상수 및 설정
export const GAME_CONFIG = {
    CANVAS_WIDTH: 1200,
    CANVAS_HEIGHT: 800,
    FPS: 60,
    MAX_POWER: 15,
    DAMPING: 0.98,
    GRAVITY_CONSTANT: 0.5,
    COLLISION_DAMPING: 0.8,
    BOUNDARY_MARGIN: 50,
    PARTICLE_COUNT: 20,
    TRAIL_LENGTH: 10
};

// 게임 상태
export const GAME_STATES = {
    MENU: 'menu',
    DRAFT: 'draft',
    PLAY: 'play',
    GAME_OVER: 'gameOver'
};

// 게임 모드
export const GAME_MODES = {
    MARBLES: 'marbles',
    CURLING: 'curling'
};

// 플레이어
export const PLAYERS = {
    P1: 'P1',
    P2: 'P2'
};

// 행성 데이터
export const PLANETS_DATA = {
    sun: {
        name: '태양',
        radius: 25,
        mass: 100,
        density: 1.41,
        gravity: 274,
        color: '#FFD700',
        textureColors: ['#FFD700', '#FFA500', '#FF4500'],
        type: 'star',
        description: '태양계의 중심에 있는 항성',
        rotationPeriod: 25.4,
        axialTilt: 7.25
    },
    mercury: {
        name: '수성',
        radius: 8,
        mass: 15,
        density: 5.43,
        gravity: 3.7,
        color: '#8C7853',
        textureColors: ['#8C7853', '#A0522D', '#696969'],
        type: 'rocky',
        description: '태양에 가장 가까운 행성',
        rotationPeriod: 58.6,
        axialTilt: 0.034
    },
    venus: {
        name: '금성',
        radius: 12,
        mass: 25,
        density: 5.24,
        gravity: 8.87,
        color: '#FFC649',
        textureColors: ['#FFC649', '#FFB347', '#FF8C00'],
        type: 'rocky',
        description: '뜨거운 온실효과로 유명한 행성',
        rotationPeriod: 243,
        axialTilt: 177.4
    },
    earth: {
        name: '지구',
        radius: 14,
        mass: 30,
        density: 5.52,
        gravity: 9.8,
        color: '#6B93D6',
        textureColors: ['#6B93D6', '#228B22', '#8B4513', '#FFFFFF'],
        type: 'terrestrial',
        description: '생명이 존재하는 우리의 고향 행성',
        rotationPeriod: 1,
        axialTilt: 23.44
    },
    mars: {
        name: '화성',
        radius: 11,
        mass: 20,
        density: 3.93,
        gravity: 3.71,
        color: '#CD5C5C',
        textureColors: ['#CD5C5C', '#A0522D', '#8B4513'],
        type: 'rocky',
        description: '붉은 행성으로 불리는 화성',
        rotationPeriod: 1.03,
        axialTilt: 25.19
    },
    jupiter: {
        name: '목성',
        radius: 35,
        mass: 80,
        density: 1.33,
        gravity: 24.79,
        color: '#D2691E',
        textureColors: ['#D2691E', '#CD853F', '#F4A460', '#DEB887'],
        type: 'gas',
        description: '태양계에서 가장 큰 행성',
        rotationPeriod: 0.41,
        axialTilt: 3.13
    },
    saturn: {
        name: '토성',
        radius: 30,
        mass: 65,
        density: 0.69,
        gravity: 10.44,
        color: '#FAD5A5',
        textureColors: ['#FAD5A5', '#DEB887', '#F5DEB3'],
        type: 'gas',
        description: '아름다운 고리를 가진 행성',
        rotationPeriod: 0.45,
        axialTilt: 26.73,
        hasRings: true
    },
    uranus: {
        name: '천왕성',
        radius: 20,
        mass: 45,
        density: 1.27,
        gravity: 8.69,
        color: '#4FD0E4',
        textureColors: ['#4FD0E4', '#87CEEB', '#B0E0E6'],
        type: 'ice',
        description: '옆으로 누워서 자전하는 특이한 행성',
        rotationPeriod: 0.72,
        axialTilt: 97.77
    },
    neptune: {
        name: '해왕성',
        radius: 18,
        mass: 40,
        density: 1.64,
        gravity: 11.15,
        color: '#4169E1',
        textureColors: ['#4169E1', '#1E90FF', '#6495ED'],
        type: 'ice',
        description: '태양계에서 가장 먼 행성',
        rotationPeriod: 0.67,
        axialTilt: 28.32
    }
};

// 컬링 모드 설정
export const CURLING_CONFIG = {
    ROUNDS: 3,
    SHOTS_PER_ROUND: 3,
    HOUSE_RADIUS: [40, 80, 120], // 내부, 중간, 외부 원
    HOUSE_SCORES: [3, 2, 1], // 각 원의 점수
    HOUSE_CENTER: { x: 600, y: 400 }
};

// UI 설정
export const UI_CONFIG = {
    POWER_BAR: {
        x: 50,
        y: 50,
        width: 200,
        height: 20
    },
    PLANET_GRID: {
        cols: 3,
        rows: 3,
        cellSize: 120,
        startX: 300,
        startY: 200
    }
}; 