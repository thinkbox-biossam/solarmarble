import { GAME_CONFIG, GAME_STATES, GAME_MODES, PLANETS_DATA } from './constants.js';
import { Planet } from './planet.js';
import { PhysicsEngine } from './physics.js';
import { GameStateManager } from './gameState.js';
import { UIManager } from './ui.js';
import { audioSystem } from './audio.js';

export class SolarSystemMarbleGame {
    constructor(canvasId) {
        // 캔버스 설정
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = GAME_CONFIG.CANVAS_WIDTH;
        this.canvas.height = GAME_CONFIG.CANVAS_HEIGHT;
        
        // 게임 시스템 초기화
        this.physicsEngine = new PhysicsEngine();
        this.gameStateManager = new GameStateManager();
        this.uiManager = new UIManager(this.canvas, this.ctx);
        
        // 게임 상태
        this.planets = [];
        this.gamePlanets = [];
        this.lastTime = 0;
        this.animationId = null;
        
        // 입력 상태
        this.mouse = {
            x: 0,
            y: 0,
            isDown: false,
            startX: 0,
            startY: 0
        };
        
        // 파워바 상태
        this.powerBar = {
            charging: false,
            power: 0,
            maxPower: GAME_CONFIG.MAX_POWER
        };
        
        // 궤적 예측
        this.trajectoryPoints = [];
        
        // 이벤트 리스너 설정
        this.setupEventListeners();
        
        // 게임 초기화
        this.initialize();
    }
    
    initialize() {
        // 행성 데이터로부터 행성 객체 생성
        this.planets = Object.entries(PLANETS_DATA).map(([id, data]) => {
            const planet = new Planet(id, data);
            return planet;
        });
        
        // 게임 상태를 메뉴로 설정
        this.gameStateManager.setState(GAME_STATES.MENU);
        
        // 오디오 시스템 초기화
        audioSystem.enableAudio();
        
        // 게임 루프 시작
        this.gameLoop();
        
        console.log('🎮 태양계 알까기 게임이 초기화되었습니다.');
        console.log(`📊 현재 게임 상태: ${this.gameStateManager.currentState}`);
        console.log(`🖼️ 캔버스 크기: ${this.canvas.width} x ${this.canvas.height}`);
    }
    
    setupEventListeners() {
        // 마우스 이벤트
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        
        // 터치 이벤트 (모바일 지원)
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        
        // 키보드 이벤트
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        // 컨텍스트 메뉴 비활성화
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;
        this.mouse.isDown = true;
        this.mouse.startX = this.mouse.x;
        this.mouse.startY = this.mouse.y;
        
        if (this.gameStateManager.currentState === GAME_STATES.PLAY) {
            this.handleGameMouseDown();
        }
    }
    
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;
        
        if (this.gameStateManager.currentState === GAME_STATES.PLAY) {
            this.handleGameMouseMove();
        }
    }
    
    handleMouseUp(e) {
        if (this.gameStateManager.currentState === GAME_STATES.PLAY) {
            this.handleGameMouseUp();
        }
        
        this.mouse.isDown = false;
        this.powerBar.charging = false;
        this.powerBar.power = 0;
        this.trajectoryPoints = [];
    }
    
    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        console.log(`=== 클릭 이벤트 ===`);
        console.log(`캔버스 클릭: (${x}, ${y})`);
        console.log(`현재 상태: ${this.gameStateManager.currentState}`);
        console.log(`캔버스 크기: ${this.canvas.width} x ${this.canvas.height}`);
        console.log(`Bounding rect:`, rect);
        
        // UI 매니저에 클릭 이벤트 전달
        const result = this.uiManager.handleClick(x, y, this.gameStateManager, this);
        
        // 클릭 결과 처리
        if (result) {
            console.log('✅ 클릭 결과:', result);
            this.handleClickResult(result);
        } else {
            console.log('❌ 클릭 결과 없음');
        }
        
        // 오디오 활성화 (첫 클릭 시)
        audioSystem.enableAudio();
    }
    
    handleClickResult(result) {
        console.log('🎯 클릭 결과 처리:', result);
        
        switch (result.action) {
            case 'startGame':
                console.log(`🚀 게임 시작: ${result.mode}`);
                // 추가 처리가 필요하다면 여기에
                break;
            case 'selectPlanet':
                if (result.planetId) {
                    console.log(`🪐 행성 선택: ${result.planetId}`);
                } else if (result.planet) {
                    console.log(`🪐 행성 클릭: ${result.planet.name}`);
                }
                break;
            case 'showPlanetInfo':
                console.log('ℹ️ 행성 정보 표시');
                break;
        }
    }
    
    handleGameMouseDown() {
        // 현재 플레이어의 행성 선택 확인
        const currentPlayerPlanets = this.getCurrentPlayerPlanets();
        
        for (const planet of currentPlayerPlanets) {
            if (planet.isPointInside(this.mouse.x, this.mouse.y)) {
                this.selectedPlanet = planet;
                this.powerBar.charging = true;
                audioSystem.handleGameEvent('planetSelect', { planet });
                break;
            }
        }
    }
    
    handleGameMouseMove() {
        if (this.powerBar.charging && this.selectedPlanet) {
            // 파워 계산
            const dx = this.mouse.x - this.mouse.startX;
            const dy = this.mouse.y - this.mouse.startY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            this.powerBar.power = Math.min(distance / 100, 1);
            
            // 궤적 예측
            const force = this.physicsEngine.calculateShootForce(
                this.mouse.startX, this.mouse.startY,
                this.mouse.x, this.mouse.y
            );
            
            this.trajectoryPoints = this.physicsEngine.predictTrajectory(
                this.selectedPlanet, force.x, force.y, 50
            );
        }
    }
    
    handleGameMouseUp() {
        if (this.powerBar.charging && this.selectedPlanet && this.powerBar.power > 0) {
            // 발사
            const force = this.physicsEngine.calculateShootForce(
                this.mouse.startX, this.mouse.startY,
                this.mouse.x, this.mouse.y
            );
            
            this.selectedPlanet.applyForce(force.x, force.y);
            
            // 사운드 재생
            audioSystem.handleGameEvent('shoot', { power: this.powerBar.power });
            
            // 턴 종료 처리
            this.endTurn();
        }
        
        this.selectedPlanet = null;
    }
    
    handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        this.handleMouseDown(mouseEvent);
    }
    
    handleTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        this.handleMouseMove(mouseEvent);
    }
    
    handleTouchEnd(e) {
        e.preventDefault();
        const mouseEvent = new MouseEvent('mouseup', {});
        this.handleMouseUp(mouseEvent);
    }
    
    handleKeyDown(e) {
        switch (e.key) {
            case 'Escape':
                if (this.gameStateManager.currentState === GAME_STATES.PLAY) {
                    this.gameStateManager.setState(GAME_STATES.MENU);
                }
                break;
            case 'r':
            case 'R':
                if (this.gameStateManager.currentState === GAME_STATES.GAME_OVER) {
                    this.restartGame();
                }
                break;
            case 'm':
            case 'M':
                // 음소거 토글
                audioSystem.setEnabled(!audioSystem.isEnabled);
                break;
        }
    }
    
    gameLoop(currentTime = 0) {
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        // 게임 업데이트
        this.update(deltaTime);
        
        // 렌더링
        this.render();
        
        // 다음 프레임 요청
        this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    update(deltaTime) {
        if (this.gameStateManager.currentState === GAME_STATES.PLAY) {
            this.updateGame(deltaTime);
        }
    }
    
    updateGame(deltaTime) {
        // 행성 업데이트
        this.gameStateManager.planets.forEach(planet => {
            if (planet.isActive) {
                planet.update(deltaTime);
            }
        });
        
        // 물리 시뮬레이션
        this.physicsEngine.applyGravity(this.gameStateManager.planets);
        this.physicsEngine.handleCollisions(this.gameStateManager.planets);
        this.physicsEngine.checkBoundaries(this.gameStateManager.planets, this.canvas.width, this.canvas.height);
        this.physicsEngine.updateParticles(deltaTime);
        
        // 게임 상태 확인
        this.checkGameState();
    }
    
    checkGameState() {
        // 모든 행성이 정지했는지 확인
        if (this.physicsEngine.areAllPlanetsStationary(this.gameStateManager.planets)) {
            // 컬링 모드에서 점수 계산
            if (this.gameStateManager.gameMode === GAME_MODES.CURLING) {
                this.calculateCurlingScore();
            }
            
            // 게임 종료 조건 확인
            const gameResult = this.gameStateManager.checkGameOver();
            if (gameResult.isGameOver) {
                this.endGame(gameResult);
            } else {
                // 다음 턴으로
                setTimeout(() => {
                    this.gameStateManager.switchTurn();
                    audioSystem.handleGameEvent('turnChange', { 
                        player: this.gameStateManager.currentPlayer 
                    });
                }, 1000);
            }
        }
    }
    
    calculateCurlingScore() {
        // 컬링 점수 계산 로직
        const houseCenter = { x: this.canvas.width / 2, y: this.canvas.height / 2 };
        const houseRadii = [50, 100, 150]; // 하우스 반지름들
        
        const player1Planets = this.gameStateManager.planets.filter(p => p.owner === 'P1' && p.isActive);
        const player2Planets = this.gameStateManager.planets.filter(p => p.owner === 'P2' && p.isActive);
        
        const scores = this.physicsEngine.calculateCurlingScore(
            this.gameStateManager.planets, houseCenter, houseRadii, player1Planets, player2Planets
        );
        
        // 점수 업데이트
        this.gameStateManager.curlingScores.P1 += scores.P1;
        this.gameStateManager.curlingScores.P2 += scores.P2;
        
        if (scores.P1 > 0) {
            audioSystem.handleGameEvent('score', { points: scores.P1 });
        }
        if (scores.P2 > 0) {
            audioSystem.handleGameEvent('score', { points: scores.P2 });
        }
    }
    
    endTurn() {
        // 턴 종료 처리
        this.selectedPlanet = null;
        this.powerBar.charging = false;
        this.powerBar.power = 0;
        this.trajectoryPoints = [];
    }
    
    endGame(gameResult) {
        this.gameStateManager.setState(GAME_STATES.GAME_OVER);
        this.gameStateManager.gameOverMessage = gameResult.message;
        
        // 결과에 따른 사운드 재생
        if (gameResult.winner) {
            audioSystem.handleGameEvent('victory');
        } else {
            audioSystem.handleGameEvent('draw');
        }
    }
    
    render() {
        // UI 매니저를 통한 렌더링
        this.uiManager.render(this.gameStateManager, this);
        
        // 게임 플레이 중 추가 렌더링
        if (this.gameStateManager.currentState === GAME_STATES.PLAY) {
            this.renderGameplay();
        }
    }
    
    renderGameplay() {
        // 행성 렌더링
        this.gameStateManager.planets.forEach(planet => {
            if (planet.isActive) {
                planet.render(this.ctx);
            }
        });
        
        // 파티클 렌더링
        this.physicsEngine.renderParticles(this.ctx);
        
        // 궤적 예측 렌더링
        if (this.trajectoryPoints.length > 0) {
            this.renderTrajectory();
        }
        
        // 파워바 렌더링
        if (this.powerBar.charging) {
            this.renderPowerBar();
        }
        
        // 선택된 행성 하이라이트
        if (this.gameStateManager.selectedPlanet) {
            this.renderSelectedPlanet();
        }
    }
    
    renderTrajectory() {
        this.ctx.save();
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        
        this.ctx.beginPath();
        for (let i = 0; i < this.trajectoryPoints.length; i++) {
            const point = this.trajectoryPoints[i];
            if (i === 0) {
                this.ctx.moveTo(point.x, point.y);
            } else {
                this.ctx.lineTo(point.x, point.y);
            }
        }
        this.ctx.stroke();
        
        this.ctx.restore();
    }
    
    renderPowerBar() {
        const barWidth = 200;
        const barHeight = 20;
        const x = this.canvas.width / 2 - barWidth / 2;
        const y = this.canvas.height - 50;
        
        this.ctx.save();
        
        // 배경
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(x - 5, y - 5, barWidth + 10, barHeight + 10);
        
        // 테두리
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, barWidth, barHeight);
        
        // 파워 바
        const powerWidth = barWidth * this.powerBar.power;
        const gradient = this.ctx.createLinearGradient(x, y, x + powerWidth, y);
        gradient.addColorStop(0, '#00ff00');
        gradient.addColorStop(0.5, '#ffff00');
        gradient.addColorStop(1, '#ff0000');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(x, y, powerWidth, barHeight);
        
        // 텍스트
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('POWER', x + barWidth / 2, y - 10);
        
        this.ctx.restore();
    }
    
    renderSelectedPlanet() {
        this.ctx.save();
        this.ctx.strokeStyle = '#ffff00';
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([5, 5]);
        
        this.ctx.beginPath();
        this.ctx.arc(this.gameStateManager.selectedPlanet.x, this.gameStateManager.selectedPlanet.y, 
                    this.gameStateManager.selectedPlanet.radius + 10, 0, Math.PI * 2);
        this.ctx.stroke();
        
        this.ctx.restore();
    }
    
    // 게임 상태 관리 메서드들
    startGame(mode) {
        this.gameStateManager.gameMode = mode;
        this.gameStateManager.setState(GAME_STATES.DRAFT);
        audioSystem.handleGameEvent('gameStart');
    }
    
    selectPlanet(planetId) {
        this.gameStateManager.selectPlanet(planetId);
        
        // 드래프트 완료 시 게임 행성 생성
        if (this.gameStateManager.currentState === GAME_STATES.PLAY) {
            this.createGamePlanets();
        }
    }
    
    createGamePlanets() {
        this.gameStateManager.planets = [];
        
        // 선택된 행성들로 게임 행성 생성
        this.gameStateManager.selectedPlanetIds.P1.forEach((planetId, index) => {
            const planetData = PLANETS_DATA[planetId];
            const planet = new Planet(planetId, planetData);
            planet.owner = 'P1';
            planet.x = 100 + index * 80;
            planet.y = this.canvas.height / 2;
            this.gameStateManager.planets.push(planet);
        });
        
        this.gameStateManager.selectedPlanetIds.P2.forEach((planetId, index) => {
            const planetData = PLANETS_DATA[planetId];
            const planet = new Planet(planetId, planetData);
            planet.owner = 'P2';
            planet.x = this.canvas.width - 100 - index * 80;
            planet.y = this.canvas.height / 2;
            this.gameStateManager.planets.push(planet);
        });
        
        console.log(`게임 행성 생성 완료: ${this.gameStateManager.planets.length}개`);
    }
    
    getCurrentPlayerPlanets() {
        return this.gameStateManager.planets.filter(planet => 
            planet.owner === this.gameStateManager.currentPlayer && planet.isActive
        );
    }
    
    restartGame() {
        this.gameStateManager.resetGame();
        this.gameStateManager.planets = [];
        this.selectedPlanet = null;
        this.powerBar.charging = false;
        this.powerBar.power = 0;
        this.trajectoryPoints = [];
        this.physicsEngine.particles = [];
    }
    
    // 게임 정리
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        // 이벤트 리스너 제거
        this.canvas.removeEventListener('mousedown', this.handleMouseDown);
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        this.canvas.removeEventListener('mouseup', this.handleMouseUp);
        this.canvas.removeEventListener('click', this.handleClick);
        
        audioSystem.stopAllSounds();
    }
    
    // UI에서 호출할 수 있도록 physics 메서드들을 래핑
    renderParticles(ctx) {
        this.physicsEngine.renderParticles(ctx);
    }
    
    calculateShootForce(startX, startY, endX, endY) {
        return this.physicsEngine.calculateShootForce(startX, startY, endX, endY);
    }
    
    predictTrajectory(planet, forceX, forceY) {
        return this.physicsEngine.predictTrajectory(planet, forceX, forceY);
    }
} 