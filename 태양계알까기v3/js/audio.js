// 간소화된 사운드 시스템 (비활성화됨)
export class AudioSystem {
    constructor() {
        this.isInitialized = false;
        this.sounds = {};
        this.masterVolume = 0.5;
        this.isEnabled = false; // 기본적으로 비활성화
        
        console.log('오디오 시스템이 비활성화되었습니다.');
    }
    
    async initialize() {
        // 비활성화됨
        return;
    }
    
    createSounds() {
        // 비활성화됨
        return;
    }
    
    // 모든 사운드 메서드들을 빈 함수로 만듦
    playPlanetSelect(planet) {}
    playShoot(power) {}
    playCollision(planet1, planet2, impactForce) {}
    playOutOfBounds(planet) {}
    playTurnChange(player) {}
    playGameStart() {}
    playUIClick() {}
    playScore(points) {}
    playVictory() {}
    playDefeat() {}
    playDraw() {}
    startAmbientMusic() {}
    stopAmbientMusic() {}
    
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }
    
    setEnabled(enabled) {
        this.isEnabled = enabled;
        console.log('오디오:', enabled ? '활성화' : '비활성화');
    }
    
    canPlaySound() {
        return false; // 항상 false
    }
    
    stopAllSounds() {}
    
    async enableAudio() {
        console.log('오디오 시스템이 비활성화되어 있습니다.');
    }
    
    handleGameEvent(eventType, data = {}) {
        // 모든 이벤트를 무시
    }
}

// 기본 오디오 시스템 인스턴스 생성
export const audioSystem = new AudioSystem(); 