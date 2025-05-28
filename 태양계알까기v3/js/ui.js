import { GAME_STATES, GAME_MODES, PLANETS_DATA, UI_CONFIG, CURLING_CONFIG } from './constants.js';

export class UIManager {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.showPlanetInfo = false;
        this.planetInfoModal = null;
        this.gameOverModal = null;
        this.lastMousePos = { x: 0, y: 0 }; // 마우스 위치 추적
        
        this.createUIElements();
        this.setupMouseTracking();
    }
    
    createUIElements() {
        // 행성 정보 모달 생성
        this.planetInfoModal = document.createElement('div');
        this.planetInfoModal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 50, 0.95);
            color: white;
            padding: 20px;
            border-radius: 10px;
            border: 2px solid #FFD700;
            display: none;
            z-index: 1000;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
        `;
        document.body.appendChild(this.planetInfoModal);
        
        // 게임 오버 모달 생성
        this.gameOverModal = document.createElement('div');
        this.gameOverModal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 50, 0.95);
            color: white;
            padding: 30px;
            border-radius: 15px;
            border: 3px solid #FFD700;
            display: none;
            z-index: 1000;
            text-align: center;
        `;
        document.body.appendChild(this.gameOverModal);
    }
    
    setupMouseTracking() {
        // 마우스 위치 추적
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.lastMousePos.x = e.clientX - rect.left;
            this.lastMousePos.y = e.clientY - rect.top;
        });
    }
    
    render(gameState, game) {
        const ctx = this.ctx;
        
        // 배경 클리어
        ctx.fillStyle = '#000011';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 별 배경 그리기
        this.renderStarField();
        
        switch (gameState.currentState) {
            case GAME_STATES.MENU:
                this.renderMenu(gameState);
                break;
            case GAME_STATES.DRAFT:
                this.renderDraft(gameState);
                break;
            case GAME_STATES.PLAY:
                this.renderGame(gameState, game);
                break;
            case GAME_STATES.GAME_OVER:
                this.renderGame(gameState, game);
                this.renderGameOver(gameState);
                break;
        }
        
        // 메시지 렌더링
        this.renderMessage(gameState);
        
        // 디버깅: 마우스 위치 표시
        this.renderMouseDebug();
    }
    
    renderStarField() {
        const ctx = this.ctx;
        ctx.fillStyle = '#FFFFFF';
        
        // 고정된 별들 생성 (시드 기반)
        for (let i = 0; i < 200; i++) {
            const x = (i * 73) % this.canvas.width;
            const y = (i * 137) % this.canvas.height;
            const size = (i % 3) + 1;
            const opacity = 0.3 + (i % 7) * 0.1;
            
            ctx.globalAlpha = opacity;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.globalAlpha = 1;
    }
    
    renderMenu(gameState) {
        const ctx = this.ctx;
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // 제목
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('태양계 알까기', centerX, centerY - 100);
        
        // 부제목
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '24px Arial';
        ctx.fillText('Solar System Marble Game', centerX, centerY - 60);
        
        // 게임 모드 선택
        ctx.fillStyle = '#FFD700';
        ctx.font = '20px Arial';
        ctx.fillText('게임 모드를 선택하세요:', centerX, centerY - 20);
        
        // 알까기 모드 버튼
        const marblesButtonX = centerX - 100;
        const marblesButtonY = centerY + 20;
        const buttonWidth = 200;
        const buttonHeight = 40;
        
        this.renderButton(ctx, marblesButtonX, marblesButtonY, buttonWidth, buttonHeight, '알까기 모드', '#4CAF50');
        
        // 컬링 모드 버튼
        const curlingButtonX = centerX - 100;
        const curlingButtonY = centerY + 80;
        
        this.renderButton(ctx, curlingButtonX, curlingButtonY, buttonWidth, buttonHeight, '컬링 모드', '#2196F3');
        
        // 행성 정보 버튼
        const infoButtonX = centerX - 100;
        const infoButtonY = centerY + 140;
        
        this.renderButton(ctx, infoButtonX, infoButtonY, buttonWidth, buttonHeight, '행성 정보', '#FF9800');
        
        // 디버깅용: 클릭 가능 영역 표시 (빨간 테두리)
        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.strokeRect(marblesButtonX, marblesButtonY, buttonWidth, buttonHeight);
        ctx.strokeRect(curlingButtonX, curlingButtonY, buttonWidth, buttonHeight);
        ctx.strokeRect(infoButtonX, infoButtonY, buttonWidth, buttonHeight);
        ctx.setLineDash([]);
        
        // 조작법 안내
        ctx.fillStyle = '#CCCCCC';
        ctx.font = '16px Arial';
        ctx.fillText('마우스로 클릭하여 선택하세요', centerX, centerY + 220);
        
        // 디버깅 정보 표시
        ctx.fillStyle = '#FFFF00';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`버튼 영역: (${marblesButtonX}, ${marblesButtonY}) ~ (${marblesButtonX + buttonWidth}, ${marblesButtonY + buttonHeight})`, 10, 30);
        ctx.fillText(`캔버스 크기: ${this.canvas.width} x ${this.canvas.height}`, 10, 50);
    }
    
    renderDraft(gameState) {
        const ctx = this.ctx;
        const centerX = this.canvas.width / 2;
        
        // 제목
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('행성 선택', centerX, 50);
        
        // 현재 선택할 플레이어 표시
        const currentPlayer = gameState.getCurrentDraftPlayer();
        ctx.fillStyle = currentPlayer === 'P1' ? '#FF6B6B' : '#4ECDC4';
        ctx.font = '24px Arial';
        ctx.fillText(`${currentPlayer}이(가) 행성을 선택하세요`, centerX, 90);
        
        // 행성 격자 그리기
        this.renderPlanetGrid(gameState);
        
        // 선택된 행성들 표시
        this.renderSelectedPlanets(gameState);
        
        // 행성 정보 패널
        if (gameState.hoveredPlanet) {
            this.renderPlanetInfoPanel(gameState.hoveredPlanet);
        }
        
        // 드래프트 순서 표시
        this.renderDraftOrder(gameState);
    }
    
    renderPlanetGrid(gameState) {
        const ctx = this.ctx;
        const config = UI_CONFIG.PLANET_GRID;
        const availablePlanets = gameState.availablePlanets;
        
        for (let i = 0; i < availablePlanets.length; i++) {
            const planetId = availablePlanets[i];
            const planetData = PLANETS_DATA[planetId];
            
            const col = i % config.cols;
            const row = Math.floor(i / config.cols);
            const x = config.startX + col * config.cellSize;
            const y = config.startY + row * config.cellSize;
            
            // 셀 배경
            const isHovered = gameState.hoveredPlanet === planetId;
            const isSelected = gameState.selectedPlanetInGrid === i;
            
            ctx.fillStyle = isHovered ? '#333366' : isSelected ? '#444477' : '#222244';
            ctx.fillRect(x - config.cellSize/2, y - config.cellSize/2, config.cellSize, config.cellSize);
            
            ctx.strokeStyle = isHovered ? '#FFD700' : '#666699';
            ctx.lineWidth = isHovered ? 3 : 1;
            ctx.strokeRect(x - config.cellSize/2, y - config.cellSize/2, config.cellSize, config.cellSize);
            
            // 행성 그리기
            ctx.fillStyle = planetData.color;
            ctx.beginPath();
            ctx.arc(x, y - 10, planetData.radius * 1.5, 0, Math.PI * 2);
            ctx.fill();
            
            // 행성 이름
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(planetData.name, x, y + 25);
            
            // 주요 능력치
            ctx.font = '12px Arial';
            ctx.fillStyle = '#CCCCCC';
            ctx.fillText(`질량: ${planetData.mass}`, x, y + 40);
            ctx.fillText(`크기: ${planetData.radius}`, x, y + 55);
        }
    }
    
    renderSelectedPlanets(gameState) {
        const ctx = this.ctx;
        
        // P1 선택된 행성들
        ctx.fillStyle = '#FF6B6B';
        ctx.font = '18px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('P1 선택:', 50, 150);
        
        gameState.selectedPlanetIds.P1.forEach((planetId, index) => {
            const planetData = PLANETS_DATA[planetId];
            const y = 180 + index * 40;
            
            ctx.fillStyle = planetData.color;
            ctx.beginPath();
            ctx.arc(70, y, 15, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '14px Arial';
            ctx.fillText(planetData.name, 95, y + 5);
        });
        
        // P2 선택된 행성들
        ctx.fillStyle = '#4ECDC4';
        ctx.font = '18px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('P2 선택:', this.canvas.width - 200, 150);
        
        gameState.selectedPlanetIds.P2.forEach((planetId, index) => {
            const planetData = PLANETS_DATA[planetId];
            const y = 180 + index * 40;
            
            ctx.fillStyle = planetData.color;
            ctx.beginPath();
            ctx.arc(this.canvas.width - 180, y, 15, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '14px Arial';
            ctx.fillText(planetData.name, this.canvas.width - 155, y + 5);
        });
    }
    
    renderPlanetInfoPanel(planetId) {
        const ctx = this.ctx;
        const planetData = PLANETS_DATA[planetId];
        const panelX = 50;
        const panelY = this.canvas.height - 200;
        const panelWidth = 300;
        const panelHeight = 150;
        
        // 패널 배경
        ctx.fillStyle = 'rgba(0, 0, 50, 0.9)';
        ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
        
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
        
        // 행성 정보
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(planetData.name, panelX + 10, panelY + 25);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '14px Arial';
        ctx.fillText(`질량: ${planetData.mass}`, panelX + 10, panelY + 50);
        ctx.fillText(`반지름: ${planetData.radius}`, panelX + 10, panelY + 70);
        ctx.fillText(`밀도: ${planetData.density}`, panelX + 10, panelY + 90);
        ctx.fillText(`중력: ${planetData.gravity}`, panelX + 10, panelY + 110);
        
        ctx.fillStyle = '#CCCCCC';
        ctx.font = '12px Arial';
        ctx.fillText(planetData.description, panelX + 10, panelY + 135);
    }
    
    renderDraftOrder(gameState) {
        const ctx = this.ctx;
        const orderY = this.canvas.height - 50;
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('선택 순서:', this.canvas.width / 2, orderY - 20);
        
        gameState.draftOrder.forEach((player, index) => {
            const x = this.canvas.width / 2 - 150 + index * 50;
            const isActive = index === gameState.draftIndex;
            const isPast = index < gameState.draftIndex;
            
            ctx.fillStyle = isPast ? '#666666' : isActive ? '#FFD700' : player === 'P1' ? '#FF6B6B' : '#4ECDC4';
            ctx.beginPath();
            ctx.arc(x, orderY, 15, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(player, x, orderY + 4);
        });
    }
    
    renderGame(gameState, game) {
        const ctx = this.ctx;
        
        // 맵 경계선 그리기
        this.renderMapBoundaries();
        
        // 컬링 모드일 때 하우스 그리기
        if (gameState.gameMode === GAME_MODES.CURLING) {
            this.renderCurlingHouse();
        }
        
        // 행성들 렌더링
        gameState.planets.forEach(planet => {
            if (planet.isActive) {
                planet.render(ctx);
            }
        });
        
        // 파티클 렌더링
        game.renderParticles(ctx);
        
        // 조준선 그리기
        if (gameState.isAiming) {
            this.renderAimLine(gameState, game);
        }
        
        // 게임 UI 요소들
        this.renderGameUI(gameState);
    }
    
    renderMapBoundaries() {
        const ctx = this.ctx;
        
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 5]);
        ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.setLineDash([]);
    }
    
    renderCurlingHouse() {
        const ctx = this.ctx;
        const center = CURLING_CONFIG.HOUSE_CENTER;
        const radii = CURLING_CONFIG.HOUSE_RADIUS;
        
        // 하우스 원들 그리기
        radii.forEach((radius, index) => {
            ctx.strokeStyle = index % 2 === 0 ? '#FF4444' : '#4444FF';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
            ctx.stroke();
            
            // 점수 표시
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`${3 - index}점`, center.x, center.y - radius + 20);
        });
        
        // 중심점
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(center.x, center.y, 5, 0, Math.PI * 2);
        ctx.fill();
    }
    
    renderAimLine(gameState, game) {
        const ctx = this.ctx;
        const planet = gameState.selectedPlanet;
        
        if (!planet) return;
        
        const startX = planet.x;
        const startY = planet.y;
        const endX = gameState.aimEnd.x;
        const endY = gameState.aimEnd.y;
        
        // 조준선
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // 힘 계산
        const force = game.calculateShootForce(startX, startY, endX, endY);
        
        // 궤적 예측
        const trajectory = game.predictTrajectory(planet, force.forceX, force.forceY);
        
        if (trajectory.length > 1) {
            ctx.strokeStyle = '#FFD700' + '60';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(trajectory[0].x, trajectory[0].y);
            trajectory.forEach(point => ctx.lineTo(point.x, point.y));
            ctx.stroke();
        }
        
        // 파워 표시
        this.renderPowerIndicator(force.power);
    }
    
    renderPowerIndicator(power) {
        const ctx = this.ctx;
        const config = UI_CONFIG.POWER_BAR;
        
        // 배경
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(config.x - 5, config.y - 5, config.width + 10, config.height + 10);
        
        // 파워 바 테두리
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.strokeRect(config.x, config.y, config.width, config.height);
        
        // 파워 바 채우기
        const fillWidth = config.width * power;
        const color = power < 0.3 ? '#4CAF50' : power < 0.7 ? '#FFC107' : '#F44336';
        
        ctx.fillStyle = color;
        ctx.fillRect(config.x, config.y, fillWidth, config.height);
        
        // 파워 텍스트
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '14px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`파워: ${Math.round(power * 100)}%`, config.x, config.y - 10);
    }
    
    renderGameUI(gameState) {
        const ctx = this.ctx;
        
        // 현재 턴 표시
        ctx.fillStyle = gameState.currentPlayer === 'P1' ? '#FF6B6B' : '#4ECDC4';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${gameState.currentPlayer}의 턴`, this.canvas.width / 2, 30);
        
        if (gameState.gameMode === GAME_MODES.MARBLES) {
            this.renderMarblesUI(gameState);
        } else if (gameState.gameMode === GAME_MODES.CURLING) {
            this.renderCurlingUI(gameState);
        }
        
        // 플레이어 행성 상태
        this.renderPlayerPlanetsStatus(gameState);
        
        // 조작법 안내
        ctx.fillStyle = '#CCCCCC';
        ctx.font = '12px Arial';
        ctx.textAlign = 'right';
        ctx.fillText('행성 클릭 → 드래그하여 발사', this.canvas.width - 10, this.canvas.height - 10);
    }
    
    renderMarblesUI(gameState) {
        const ctx = this.ctx;
        
        // 남은 행성 수 표시
        const p1Count = gameState.planets.filter(p => p.owner === 'P1' && p.isActive).length;
        const p2Count = gameState.planets.filter(p => p.owner === 'P2' && p.isActive).length;
        
        ctx.fillStyle = '#FF6B6B';
        ctx.font = '18px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`P1 남은 행성: ${p1Count}`, 20, 60);
        
        ctx.fillStyle = '#4ECDC4';
        ctx.textAlign = 'right';
        ctx.fillText(`P2 남은 행성: ${p2Count}`, this.canvas.width - 20, 60);
    }
    
    renderCurlingUI(gameState) {
        const ctx = this.ctx;
        
        // 라운드 정보
        ctx.fillStyle = '#FFD700';
        ctx.font = '18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`라운드 ${gameState.curlingRound}/${CURLING_CONFIG.ROUNDS}`, this.canvas.width / 2, 60);
        
        // 점수 표시
        ctx.fillStyle = '#FF6B6B';
        ctx.font = '16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`P1: ${gameState.curlingScores.P1}점`, 20, 90);
        ctx.fillText(`남은 샷: ${gameState.curlingShots.P1}`, 20, 110);
        
        ctx.fillStyle = '#4ECDC4';
        ctx.textAlign = 'right';
        ctx.fillText(`P2: ${gameState.curlingScores.P2}점`, this.canvas.width - 20, 90);
        ctx.fillText(`남은 샷: ${gameState.curlingShots.P2}`, this.canvas.width - 20, 110);
    }
    
    renderPlayerPlanetsStatus(gameState) {
        const ctx = this.ctx;
        
        // P1 행성들 (왼쪽)
        const p1Planets = gameState.getPlayerPlanets('P1');
        p1Planets.forEach((planet, index) => {
            const x = 20;
            const y = 150 + index * 30;
            
            ctx.fillStyle = planet.isActive ? planet.color : '#666666';
            ctx.beginPath();
            ctx.arc(x, y, 10, 0, Math.PI * 2);
            ctx.fill();
            
            if (!planet.canShoot && planet.isActive) {
                ctx.strokeStyle = '#FF0000';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(x - 7, y - 7);
                ctx.lineTo(x + 7, y + 7);
                ctx.moveTo(x + 7, y - 7);
                ctx.lineTo(x - 7, y + 7);
                ctx.stroke();
            }
        });
        
        // P2 행성들 (오른쪽)
        const p2Planets = gameState.getPlayerPlanets('P2');
        p2Planets.forEach((planet, index) => {
            const x = this.canvas.width - 20;
            const y = 150 + index * 30;
            
            ctx.fillStyle = planet.isActive ? planet.color : '#666666';
            ctx.beginPath();
            ctx.arc(x, y, 10, 0, Math.PI * 2);
            ctx.fill();
            
            if (!planet.canShoot && planet.isActive) {
                ctx.strokeStyle = '#FF0000';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(x - 7, y - 7);
                ctx.lineTo(x + 7, y + 7);
                ctx.moveTo(x + 7, y - 7);
                ctx.lineTo(x - 7, y + 7);
                ctx.stroke();
            }
        });
    }
    
    renderMessage(gameState) {
        if (!gameState.message) return;
        
        const ctx = this.ctx;
        const centerX = this.canvas.width / 2;
        const messageY = 120;
        
        // 메시지 배경
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        const textWidth = ctx.measureText(gameState.message).width;
        ctx.fillRect(centerX - textWidth/2 - 20, messageY - 25, textWidth + 40, 40);
        
        // 메시지 텍스트
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(gameState.message, centerX, messageY);
    }
    
    renderGameOver(gameState) {
        // 게임 오버 모달 표시
        this.gameOverModal.style.display = 'block';
        this.gameOverModal.innerHTML = `
            <h2 style="color: #FFD700; margin-bottom: 20px;">${gameState.gameOverReason}</h2>
            <p style="margin-bottom: 30px;">게임이 종료되었습니다.</p>
            <button onclick="location.reload()" style="
                background: #4CAF50;
                color: white;
                border: none;
                padding: 15px 30px;
                font-size: 16px;
                border-radius: 5px;
                cursor: pointer;
                margin: 0 10px;
            ">다시 플레이</button>
            <button onclick="this.parentElement.style.display='none'" style="
                background: #f44336;
                color: white;
                border: none;
                padding: 15px 30px;
                font-size: 16px;
                border-radius: 5px;
                cursor: pointer;
                margin: 0 10px;
            ">닫기</button>
        `;
    }
    
    renderButton(ctx, x, y, width, height, text, color) {
        // 버튼 배경
        ctx.fillStyle = color;
        ctx.fillRect(x, y, width, height);
        
        // 버튼 테두리
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
        
        // 버튼 텍스트
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(text, x + width/2, y + height/2 + 6);
    }
    
    // 클릭 이벤트 처리
    handleClick(x, y, gameState, game) {
        console.log(`🖱️ UI 클릭: (${x}, ${y}), 현재 상태: ${gameState.currentState}`);
        
        let result = null;
        
        switch (gameState.currentState) {
            case GAME_STATES.MENU:
                result = this.handleMenuClick(x, y, gameState, game);
                break;
            case GAME_STATES.DRAFT:
                result = this.handleDraftClick(x, y, gameState, game);
                break;
            case GAME_STATES.PLAY:
                result = this.handleGameClick(x, y, gameState, game);
                break;
        }
        
        console.log(`🎯 UI 처리 결과:`, result);
        return result;
    }
    
    handleMenuClick(x, y, gameState, game) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const buttonWidth = 200;
        const buttonHeight = 40;
        
        // 버튼 위치 정의
        const marblesButton = {
            x: centerX - 100,
            y: centerY + 20,
            width: buttonWidth,
            height: buttonHeight
        };
        
        const curlingButton = {
            x: centerX - 100,
            y: centerY + 80,
            width: buttonWidth,
            height: buttonHeight
        };
        
        const infoButton = {
            x: centerX - 100,
            y: centerY + 140,
            width: buttonWidth,
            height: buttonHeight
        };
        
        console.log(`메뉴 클릭 처리: (${x}, ${y})`);
        console.log(`알까기 버튼 영역: (${marblesButton.x}, ${marblesButton.y}) ~ (${marblesButton.x + marblesButton.width}, ${marblesButton.y + marblesButton.height})`);
        console.log(`컬링 버튼 영역: (${curlingButton.x}, ${curlingButton.y}) ~ (${curlingButton.x + curlingButton.width}, ${curlingButton.y + curlingButton.height})`);
        
        // 알까기 모드 버튼
        if (x >= marblesButton.x && x <= marblesButton.x + marblesButton.width && 
            y >= marblesButton.y && y <= marblesButton.y + marblesButton.height) {
            console.log('알까기 모드 선택됨');
            gameState.gameMode = GAME_MODES.MARBLES;
            gameState.setState(GAME_STATES.DRAFT);
            return { action: 'startGame', mode: GAME_MODES.MARBLES };
        }
        
        // 컬링 모드 버튼
        if (x >= curlingButton.x && x <= curlingButton.x + curlingButton.width && 
            y >= curlingButton.y && y <= curlingButton.y + curlingButton.height) {
            console.log('컬링 모드 선택됨');
            gameState.gameMode = GAME_MODES.CURLING;
            gameState.setState(GAME_STATES.DRAFT);
            return { action: 'startGame', mode: GAME_MODES.CURLING };
        }
        
        // 행성 정보 버튼
        if (x >= infoButton.x && x <= infoButton.x + infoButton.width && 
            y >= infoButton.y && y <= infoButton.y + infoButton.height) {
            console.log('행성 정보 버튼 클릭됨');
            this.showPlanetInfoModal();
            return { action: 'showPlanetInfo' };
        }
        
        console.log('어떤 버튼도 클릭되지 않음');
        return null;
    }
    
    handleDraftClick(x, y, gameState, game) {
        const config = UI_CONFIG.PLANET_GRID;
        
        console.log(`드래프트 클릭 처리: (${x}, ${y})`);
        
        // 행성 격자 클릭 확인
        for (let i = 0; i < gameState.availablePlanets.length; i++) {
            const col = i % config.cols;
            const row = Math.floor(i / config.cols);
            const cellX = config.startX + col * config.cellSize;
            const cellY = config.startY + row * config.cellSize;
            
            if (x >= cellX - config.cellSize/2 && x <= cellX + config.cellSize/2 &&
                y >= cellY - config.cellSize/2 && y <= cellY + config.cellSize/2) {
                console.log(`행성 선택됨: ${gameState.availablePlanets[i]}`);
                const planetId = gameState.availablePlanets[i];
                gameState.selectPlanet(planetId);
                
                // 드래프트가 완료되었으면 게임 행성 생성
                if (gameState.currentState === GAME_STATES.PLAY) {
                    game.createGamePlanets();
                }
                
                return { action: 'selectPlanet', planetId: planetId };
            }
        }
        
        return null;
    }
    
    handleGameClick(x, y, gameState, game) {
        console.log(`게임 클릭 처리: (${x}, ${y})`);
        
        // 행성 클릭 확인
        for (const planet of gameState.planets) {
            if (planet.isActive && planet.isPointInside(x, y)) {
                if (planet.owner === gameState.currentPlayer) {
                    console.log(`행성 선택됨: ${planet.name}`);
                    // 이전 선택 해제
                    if (gameState.selectedPlanet) {
                        gameState.selectedPlanet.isSelected = false;
                    }
                    
                    gameState.selectedPlanet = planet;
                    planet.isSelected = true;
                    
                    return { action: 'selectPlanet', planet: planet };
                }
            }
        }
        
        return null;
    }
    
    showPlanetInfoModal() {
        this.planetInfoModal.style.display = 'block';
        this.planetInfoModal.innerHTML = this.generatePlanetInfoHTML();
    }
    
    generatePlanetInfoHTML() {
        let html = '<h2 style="color: #FFD700; text-align: center;">태양계 행성 정보</h2>';
        
        Object.entries(PLANETS_DATA).forEach(([id, data]) => {
            html += `
                <div style="margin: 20px 0; padding: 15px; border: 1px solid #666; border-radius: 8px;">
                    <h3 style="color: ${data.color}; margin: 0 0 10px 0;">${data.name}</h3>
                    <p style="margin: 5px 0;"><strong>타입:</strong> ${data.type}</p>
                    <p style="margin: 5px 0;"><strong>질량:</strong> ${data.mass}</p>
                    <p style="margin: 5px 0;"><strong>반지름:</strong> ${data.radius}</p>
                    <p style="margin: 5px 0;"><strong>밀도:</strong> ${data.density}</p>
                    <p style="margin: 5px 0;"><strong>중력:</strong> ${data.gravity}</p>
                    <p style="margin: 10px 0; color: #CCCCCC;">${data.description}</p>
                </div>
            `;
        });
        
        html += `
            <div style="text-align: center; margin-top: 20px;">
                <button onclick="this.parentElement.parentElement.style.display='none'" style="
                    background: #4CAF50;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    font-size: 16px;
                    border-radius: 5px;
                    cursor: pointer;
                ">닫기</button>
            </div>
        `;
        
        return html;
    }
    
    renderMouseDebug() {
        const ctx = this.ctx;
        
        // 마우스 위치에 십자선 표시
        ctx.strokeStyle = '#FF00FF';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.lastMousePos.x - 10, this.lastMousePos.y);
        ctx.lineTo(this.lastMousePos.x + 10, this.lastMousePos.y);
        ctx.moveTo(this.lastMousePos.x, this.lastMousePos.y - 10);
        ctx.lineTo(this.lastMousePos.x, this.lastMousePos.y + 10);
        ctx.stroke();
        
        // 마우스 좌표 표시
        ctx.fillStyle = '#FF00FF';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Mouse: (${Math.round(this.lastMousePos.x)}, ${Math.round(this.lastMousePos.y)})`, 10, this.canvas.height - 10);
    }
} 