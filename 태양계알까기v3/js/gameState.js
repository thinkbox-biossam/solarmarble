import { GAME_STATES, GAME_MODES, PLAYERS, PLANETS_DATA, CURLING_CONFIG } from './constants.js';
import { Planet } from './planet.js';

export class GameStateManager {
    constructor() {
        this.currentState = GAME_STATES.MENU;
        this.gameMode = GAME_MODES.MARBLES;
        this.currentPlayer = PLAYERS.P1;
        
        // 드래프트 관련
        this.draftOrder = [PLAYERS.P1, PLAYERS.P2, PLAYERS.P2, PLAYERS.P1, PLAYERS.P1, PLAYERS.P2];
        this.draftIndex = 0;
        this.selectedPlanetIds = { [PLAYERS.P1]: [], [PLAYERS.P2]: [] };
        this.availablePlanets = Object.keys(PLANETS_DATA);
        this.hoveredPlanet = null;
        this.selectedPlanetInGrid = 0;
        
        // 게임 플레이 관련
        this.planets = [];
        this.selectedPlanet = null;
        this.isAiming = false;
        this.aimStart = { x: 0, y: 0 };
        this.aimEnd = { x: 0, y: 0 };
        
        // 컬링 모드 관련
        this.curlingRound = 1;
        this.curlingShots = { [PLAYERS.P1]: CURLING_CONFIG.SHOTS_PER_ROUND, [PLAYERS.P2]: CURLING_CONFIG.SHOTS_PER_ROUND };
        this.curlingScores = { [PLAYERS.P1]: 0, [PLAYERS.P2]: 0 };
        this.roundScores = [];
        
        // 게임 종료 관련
        this.winner = null;
        this.gameOverReason = '';
        
        // 메시지 시스템
        this.message = '';
        this.messageTime = 0;
    }
    
    // 상태 변경
    setState(newState) {
        this.currentState = newState;
        this.onStateChange(newState);
    }
    
    onStateChange(state) {
        switch (state) {
            case GAME_STATES.MENU:
                this.resetGame();
                break;
            case GAME_STATES.DRAFT:
                this.startDraft();
                break;
            case GAME_STATES.PLAY:
                this.startPlay();
                break;
            case GAME_STATES.GAME_OVER:
                this.endGame();
                break;
        }
    }
    
    // 게임 초기화
    resetGame() {
        this.currentPlayer = PLAYERS.P1;
        this.draftIndex = 0;
        this.selectedPlanetIds = { [PLAYERS.P1]: [], [PLAYERS.P2]: [] };
        this.availablePlanets = Object.keys(PLANETS_DATA);
        this.planets = [];
        this.selectedPlanet = null;
        this.isAiming = false;
        this.winner = null;
        this.gameOverReason = '';
        this.message = '';
        this.messageTime = 0;
        
        // 컬링 모드 초기화
        this.curlingRound = 1;
        this.curlingShots = { [PLAYERS.P1]: CURLING_CONFIG.SHOTS_PER_ROUND, [PLAYERS.P2]: CURLING_CONFIG.SHOTS_PER_ROUND };
        this.curlingScores = { [PLAYERS.P1]: 0, [PLAYERS.P2]: 0 };
        this.roundScores = [];
    }
    
    // 드래프트 시작
    startDraft() {
        this.showMessage(`${this.getCurrentDraftPlayer()}이(가) 행성을 선택하세요!`);
    }
    
    // 현재 드래프트 플레이어 반환
    getCurrentDraftPlayer() {
        return this.draftOrder[this.draftIndex];
    }
    
    // 행성 선택 처리
    selectPlanet(planetId) {
        if (this.currentState !== GAME_STATES.DRAFT) return false;
        if (!this.availablePlanets.includes(planetId)) return false;
        
        const currentPlayer = this.getCurrentDraftPlayer();
        this.selectedPlanetIds[currentPlayer].push(planetId);
        this.availablePlanets = this.availablePlanets.filter(id => id !== planetId);
        
        this.draftIndex++;
        
        if (this.draftIndex >= this.draftOrder.length) {
            // 드래프트 완료
            this.setState(GAME_STATES.PLAY);
        } else {
            // 다음 플레이어
            this.showMessage(`${this.getCurrentDraftPlayer()}이(가) 행성을 선택하세요!`);
        }
        
        return true;
    }
    
    // 플레이 시작
    startPlay() {
        this.createGamePlanets();
        this.currentPlayer = PLAYERS.P1;
        this.showMessage(`${this.currentPlayer}의 턴입니다!`);
    }
    
    // 게임용 행성 생성
    createGamePlanets() {
        this.planets = [];
        
        // P1 행성들 (왼쪽 배치)
        const p1Planets = this.selectedPlanetIds[PLAYERS.P1];
        for (let i = 0; i < p1Planets.length; i++) {
            const planetData = PLANETS_DATA[p1Planets[i]];
            const x = 100 + (i % 2) * 80;
            const y = 200 + Math.floor(i / 2) * 150;
            const planet = new Planet(p1Planets[i], planetData, x, y);
            planet.owner = PLAYERS.P1;
            this.planets.push(planet);
        }
        
        // P2 행성들 (오른쪽 배치)
        const p2Planets = this.selectedPlanetIds[PLAYERS.P2];
        for (let i = 0; i < p2Planets.length; i++) {
            const planetData = PLANETS_DATA[p2Planets[i]];
            const x = 1020 + (i % 2) * 80;
            const y = 200 + Math.floor(i / 2) * 150;
            const planet = new Planet(p2Planets[i], planetData, x, y);
            planet.owner = PLAYERS.P2;
            this.planets.push(planet);
        }
    }
    
    // 턴 변경
    switchTurn() {
        this.currentPlayer = this.currentPlayer === PLAYERS.P1 ? PLAYERS.P2 : PLAYERS.P1;
        this.selectedPlanet = null;
        this.isAiming = false;
        
        if (this.gameMode === GAME_MODES.CURLING) {
            this.curlingShots[this.currentPlayer]--;
            
            // 라운드 종료 확인
            if (this.curlingShots[PLAYERS.P1] === 0 && this.curlingShots[PLAYERS.P2] === 0) {
                this.endCurlingRound();
                return;
            }
        }
        
        this.showMessage(`${this.currentPlayer}의 턴입니다!`);
    }
    
    // 컬링 라운드 종료
    endCurlingRound() {
        // 점수 계산은 PhysicsEngine에서 수행
        this.curlingRound++;
        
        if (this.curlingRound > CURLING_CONFIG.ROUNDS) {
            this.checkGameOver();
        } else {
            // 다음 라운드 준비
            this.curlingShots = { [PLAYERS.P1]: CURLING_CONFIG.SHOTS_PER_ROUND, [PLAYERS.P2]: CURLING_CONFIG.SHOTS_PER_ROUND };
            this.resetPlanetsForNextRound();
            this.currentPlayer = PLAYERS.P1;
            this.showMessage(`라운드 ${this.curlingRound} 시작!`);
        }
    }
    
    // 다음 라운드를 위한 행성 리셋
    resetPlanetsForNextRound() {
        // P1 행성들 리셋
        const p1Planets = this.planets.filter(p => p.owner === PLAYERS.P1);
        for (let i = 0; i < p1Planets.length; i++) {
            const x = 100 + (i % 2) * 80;
            const y = 200 + Math.floor(i / 2) * 150;
            p1Planets[i].reset(x, y);
            p1Planets[i].canShoot = true;
        }
        
        // P2 행성들 리셋
        const p2Planets = this.planets.filter(p => p.owner === PLAYERS.P2);
        for (let i = 0; i < p2Planets.length; i++) {
            const x = 1020 + (i % 2) * 80;
            const y = 200 + Math.floor(i / 2) * 150;
            p2Planets[i].reset(x, y);
            p2Planets[i].canShoot = true;
        }
    }
    
    // 행성 이탈 처리
    onPlanetOutOfBounds(planet) {
        this.showMessage(`${planet.name}이(가) 맵을 벗어났습니다!`);
        
        if (this.gameMode === GAME_MODES.MARBLES) {
            this.checkGameOver();
        }
    }
    
    // 게임 종료 확인
    checkGameOver() {
        if (this.gameMode === GAME_MODES.MARBLES) {
            const p1ActivePlanets = this.planets.filter(p => p.owner === PLAYERS.P1 && p.isActive);
            const p2ActivePlanets = this.planets.filter(p => p.owner === PLAYERS.P2 && p.isActive);
            
            if (p1ActivePlanets.length === 0 && p2ActivePlanets.length === 0) {
                return { isGameOver: true, winner: null, message: '무승부!' };
            } else if (p1ActivePlanets.length === 0) {
                return { isGameOver: true, winner: PLAYERS.P2, message: 'P2 승리!' };
            } else if (p2ActivePlanets.length === 0) {
                return { isGameOver: true, winner: PLAYERS.P1, message: 'P1 승리!' };
            } else {
                return { isGameOver: false }; // 게임 계속
            }
        } else if (this.gameMode === GAME_MODES.CURLING) {
            if (this.curlingRound > CURLING_CONFIG.ROUNDS) {
                if (this.curlingScores[PLAYERS.P1] > this.curlingScores[PLAYERS.P2]) {
                    return { isGameOver: true, winner: PLAYERS.P1, message: 'P1 승리!' };
                } else if (this.curlingScores[PLAYERS.P2] > this.curlingScores[PLAYERS.P1]) {
                    return { isGameOver: true, winner: PLAYERS.P2, message: 'P2 승리!' };
                } else {
                    return { isGameOver: true, winner: null, message: '무승부!' };
                }
            }
        }
        
        return { isGameOver: false };
    }
    
    // 게임 종료
    endGame() {
        this.showMessage(this.gameOverReason);
    }
    
    // 행성 선택
    selectPlanetForShooting(planet) {
        if (this.currentState !== GAME_STATES.PLAY) return false;
        if (planet.owner !== this.currentPlayer) return false;
        if (!planet.isActive || !planet.canShoot) return false;
        
        // 기존 선택 해제
        if (this.selectedPlanet) {
            this.selectedPlanet.isSelected = false;
        }
        
        this.selectedPlanet = planet;
        planet.isSelected = true;
        
        return true;
    }
    
    // 조준 시작
    startAiming(x, y) {
        if (!this.selectedPlanet) return false;
        
        this.isAiming = true;
        this.aimStart = { x, y };
        this.aimEnd = { x, y };
        
        return true;
    }
    
    // 조준 업데이트
    updateAiming(x, y) {
        if (!this.isAiming) return;
        this.aimEnd = { x, y };
    }
    
    // 발사 실행
    shoot(forceX, forceY) {
        if (!this.selectedPlanet || !this.isAiming) return false;
        
        this.selectedPlanet.vx = forceX / this.selectedPlanet.mass;
        this.selectedPlanet.vy = forceY / this.selectedPlanet.mass;
        this.selectedPlanet.canShoot = false;
        this.selectedPlanet.isSelected = false;
        
        this.selectedPlanet = null;
        this.isAiming = false;
        
        this.showMessage('발사!');
        
        return true;
    }
    
    // 메시지 표시
    showMessage(text, duration = 3000) {
        this.message = text;
        this.messageTime = duration;
    }
    
    // 메시지 업데이트
    updateMessage(deltaTime) {
        if (this.messageTime > 0) {
            this.messageTime -= deltaTime;
            if (this.messageTime <= 0) {
                this.message = '';
            }
        }
    }
    
    // 현재 플레이어의 행성들 반환
    getCurrentPlayerPlanets() {
        return this.planets.filter(p => p.owner === this.currentPlayer && p.isActive);
    }
    
    // 특정 플레이어의 행성들 반환
    getPlayerPlanets(player) {
        return this.planets.filter(p => p.owner === player);
    }
    
    // 게임 상태 정보 반환
    getGameInfo() {
        return {
            state: this.currentState,
            mode: this.gameMode,
            currentPlayer: this.currentPlayer,
            draftPlayer: this.getCurrentDraftPlayer(),
            message: this.message,
            winner: this.winner,
            gameOverReason: this.gameOverReason,
            curlingRound: this.curlingRound,
            curlingShots: this.curlingShots,
            curlingScores: this.curlingScores,
            selectedPlanetIds: this.selectedPlanetIds,
            availablePlanets: this.availablePlanets
        };
    }
    
    // 컬링 점수 업데이트
    updateCurlingScores(roundScore) {
        this.curlingScores[PLAYERS.P1] += roundScore[PLAYERS.P1];
        this.curlingScores[PLAYERS.P2] += roundScore[PLAYERS.P2];
        this.roundScores.push(roundScore);
        
        this.showMessage(`라운드 ${this.curlingRound} 점수: P1 +${roundScore[PLAYERS.P1]}, P2 +${roundScore[PLAYERS.P2]}`);
    }
} 