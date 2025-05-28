import { GAME_CONFIG } from './constants.js';

export class Planet {
    constructor(id, data, x, y) {
        this.id = id;
        this.name = data.name;
        this.radius = data.radius;
        this.mass = data.mass;
        this.density = data.density;
        this.gravity = data.gravity;
        this.color = data.color;
        this.textureColors = data.textureColors;
        this.type = data.type;
        this.description = data.description;
        this.rotationPeriod = data.rotationPeriod;
        this.axialTilt = data.axialTilt;
        this.hasRings = data.hasRings || false;
        
        // 위치 및 물리
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.rotation = 0;
        this.rotationSpeed = (2 * Math.PI) / (data.rotationPeriod * 60);
        
        // 상태
        this.isSelected = false;
        this.isActive = true;
        this.active = true;
        this.canShoot = true;
        this.owner = null;
        
        // 시각 효과
        this.trail = [];
        this.glowIntensity = 0;
        this.texture = null;
        
        this.createTexture();
    }
    
    createTexture() {
        const canvas = document.createElement('canvas');
        const size = this.radius * 4;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        const centerX = size / 2;
        const centerY = size / 2;
        
        // 기본 행성 텍스처 생성
        this.generatePlanetTexture(ctx, centerX, centerY, this.radius * 2);
        
        this.texture = canvas;
    }
    
    generatePlanetTexture(ctx, centerX, centerY, radius) {
        switch (this.type) {
            case 'star':
                this.generateStarTexture(ctx, centerX, centerY, radius);
                break;
            case 'rocky':
                this.generateRockyTexture(ctx, centerX, centerY, radius);
                break;
            case 'gas':
                this.generateGasTexture(ctx, centerX, centerY, radius);
                break;
            case 'ice':
                this.generateIceTexture(ctx, centerX, centerY, radius);
                break;
            case 'terrestrial':
                this.generateTerrestrialTexture(ctx, centerX, centerY, radius);
                break;
            default:
                this.generateBasicTexture(ctx, centerX, centerY, radius);
        }
    }
    
    generateStarTexture(ctx, centerX, centerY, radius) {
        // 태양 코로나 효과
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        gradient.addColorStop(0, this.textureColors[0]);
        gradient.addColorStop(0.3, this.textureColors[1]);
        gradient.addColorStop(0.7, this.textureColors[2]);
        gradient.addColorStop(1, this.textureColors[2] + '40');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // 태양 플레어 효과
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const flareLength = radius * (0.3 + Math.random() * 0.4);
            const x = centerX + Math.cos(angle) * radius * 0.8;
            const y = centerY + Math.sin(angle) * radius * 0.8;
            const endX = x + Math.cos(angle) * flareLength;
            const endY = y + Math.sin(angle) * flareLength;
            
            const flareGradient = ctx.createLinearGradient(x, y, endX, endY);
            flareGradient.addColorStop(0, this.textureColors[1]);
            flareGradient.addColorStop(1, this.textureColors[1] + '00');
            
            ctx.strokeStyle = flareGradient;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        }
    }
    
    generateRockyTexture(ctx, centerX, centerY, radius) {
        // 기본 행성 색상
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        gradient.addColorStop(0, this.textureColors[0]);
        gradient.addColorStop(1, this.textureColors[1]);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // 크레이터 생성
        for (let i = 0; i < 15; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * radius * 0.8;
            const craterX = centerX + Math.cos(angle) * distance;
            const craterY = centerY + Math.sin(angle) * distance;
            const craterRadius = Math.random() * radius * 0.15 + 2;
            
            ctx.fillStyle = this.textureColors[2] || this.textureColors[1];
            ctx.beginPath();
            ctx.arc(craterX, craterY, craterRadius, 0, Math.PI * 2);
            ctx.fill();
            
            // 크레이터 음영
            ctx.fillStyle = this.textureColors[1] + '80';
            ctx.beginPath();
            ctx.arc(craterX + 1, craterY + 1, craterRadius * 0.7, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    generateGasTexture(ctx, centerX, centerY, radius) {
        // 가스 행성의 줄무늬 패턴
        for (let i = 0; i < 20; i++) {
            const y = centerY - radius + (i / 19) * radius * 2;
            const colorIndex = Math.floor((i / 19) * this.textureColors.length);
            const color = this.textureColors[colorIndex] || this.textureColors[0];
            
            ctx.fillStyle = color;
            ctx.fillRect(centerX - radius, y, radius * 2, radius * 0.1);
        }
        
        // 원형 마스크 적용
        ctx.globalCompositeOperation = 'destination-in';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
        
        // 대기 효과
        const atmosphereGradient = ctx.createRadialGradient(centerX, centerY, radius * 0.8, centerX, centerY, radius);
        atmosphereGradient.addColorStop(0, 'transparent');
        atmosphereGradient.addColorStop(1, this.textureColors[0] + '40');
        
        ctx.fillStyle = atmosphereGradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
    }
    
    generateIceTexture(ctx, centerX, centerY, radius) {
        // 얼음 행성 기본 색상
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        gradient.addColorStop(0, this.textureColors[0]);
        gradient.addColorStop(0.7, this.textureColors[1]);
        gradient.addColorStop(1, this.textureColors[2] || this.textureColors[1]);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // 얼음 결정 효과
        for (let i = 0; i < 30; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * radius * 0.9;
            const iceX = centerX + Math.cos(angle) * distance;
            const iceY = centerY + Math.sin(angle) * distance;
            
            ctx.fillStyle = '#FFFFFF40';
            ctx.beginPath();
            ctx.arc(iceX, iceY, Math.random() * 2 + 1, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    generateTerrestrialTexture(ctx, centerX, centerY, radius) {
        // 지구형 행성 - 대륙과 바다
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        gradient.addColorStop(0, this.textureColors[0]); // 바다
        gradient.addColorStop(1, this.textureColors[0]);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // 대륙 생성
        for (let i = 0; i < 5; i++) {
            const continentX = centerX + (Math.random() - 0.5) * radius * 1.5;
            const continentY = centerY + (Math.random() - 0.5) * radius * 1.5;
            const continentRadius = Math.random() * radius * 0.4 + radius * 0.2;
            
            ctx.fillStyle = this.textureColors[1]; // 대륙
            ctx.beginPath();
            ctx.arc(continentX, continentY, continentRadius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // 원형 마스크
        ctx.globalCompositeOperation = 'destination-in';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
        
        // 구름
        if (this.textureColors[3]) {
            for (let i = 0; i < 10; i++) {
                const cloudX = centerX + (Math.random() - 0.5) * radius * 1.8;
                const cloudY = centerY + (Math.random() - 0.5) * radius * 1.8;
                const cloudRadius = Math.random() * radius * 0.3 + radius * 0.1;
                
                ctx.fillStyle = this.textureColors[3] + '60'; // 구름
                ctx.beginPath();
                ctx.arc(cloudX, cloudY, cloudRadius, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // 구름 마스크
            ctx.globalCompositeOperation = 'destination-in';
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalCompositeOperation = 'source-over';
        }
    }
    
    generateBasicTexture(ctx, centerX, centerY, radius) {
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, this.color + '80');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
    }
    
    update(deltaTime) {
        // 자전 업데이트
        this.rotation += this.rotationSpeed * deltaTime;
        
        // 위치 업데이트
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        
        // 감속 (마찰)
        this.vx *= GAME_CONFIG.DAMPING;
        this.vy *= GAME_CONFIG.DAMPING;
        
        // 궤적 업데이트
        if (Math.abs(this.vx) > 0.1 || Math.abs(this.vy) > 0.1) {
            this.trail.push({ x: this.x, y: this.y });
            if (this.trail.length > GAME_CONFIG.TRAIL_LENGTH) {
                this.trail.shift();
            }
        }
        
        // 정지 판정
        if (Math.abs(this.vx) < 0.1 && Math.abs(this.vy) < 0.1) {
            this.vx = 0;
            this.vy = 0;
        }
    }
    
    render(ctx) {
        // 궤적 그리기
        if (this.trail.length > 1) {
            ctx.strokeStyle = this.color + '40';
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(this.trail[0].x, this.trail[0].y);
            for (let i = 1; i < this.trail.length; i++) {
                ctx.lineTo(this.trail[i].x, this.trail[i].y);
            }
            ctx.stroke();
        }
        
        // 선택 효과
        if (this.isSelected) {
            this.glowIntensity = (Math.sin(Date.now() * 0.01) + 1) * 0.5;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 20 + this.glowIntensity * 20;
        }
        
        // 행성 텍스처 그리기
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        if (this.texture) {
            ctx.drawImage(
                this.texture,
                -this.radius, -this.radius,
                this.radius * 2, this.radius * 2
            );
        } else {
            // 기본 원형 그리기
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // 토성의 고리
        if (this.hasRings) {
            ctx.strokeStyle = this.color + '80';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.ellipse(0, 0, this.radius * 1.8, this.radius * 0.3, 0, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        ctx.restore();
        
        // 그림자 효과 초기화
        ctx.shadowBlur = 0;
        
        // 이름 표시 (선택된 경우)
        if (this.isSelected) {
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(this.name, this.x, this.y - this.radius - 10);
        }
    }
    
    applyForce(fx, fy) {
        this.vx += fx / this.mass;
        this.vy += fy / this.mass;
    }
    
    isPointInside(x, y) {
        const dx = x - this.x;
        const dy = y - this.y;
        return Math.sqrt(dx * dx + dy * dy) <= this.radius;
    }
    
    distanceTo(otherPlanet) {
        const dx = this.x - otherPlanet.x;
        const dy = this.y - otherPlanet.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    isOutOfBounds(width, height) {
        return this.x < -GAME_CONFIG.BOUNDARY_MARGIN || 
               this.x > width + GAME_CONFIG.BOUNDARY_MARGIN ||
               this.y < -GAME_CONFIG.BOUNDARY_MARGIN || 
               this.y > height + GAME_CONFIG.BOUNDARY_MARGIN;
    }
    
    reset(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.trail = [];
        this.isActive = true;
        this.canShoot = true;
    }
} 