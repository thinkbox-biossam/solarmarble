import { GAME_CONFIG } from './constants.js';

export class PhysicsEngine {
    constructor() {
        this.particles = [];
    }
    
    // 중력 적용
    applyGravity(planets) {
        for (let i = 0; i < planets.length; i++) {
            for (let j = i + 1; j < planets.length; j++) {
                const planet1 = planets[i];
                const planet2 = planets[j];
                
                if (!planet1.isActive || !planet2.isActive) continue;
                
                const dx = planet2.x - planet1.x;
                const dy = planet2.y - planet1.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 0) {
                    // 중력 계산 (F = G * m1 * m2 / r^2)
                    const force = GAME_CONFIG.GRAVITY_CONSTANT * planet1.mass * planet2.mass / (distance * distance);
                    const forceX = force * (dx / distance);
                    const forceY = force * (dy / distance);
                    
                    // 힘 적용
                    planet1.applyForce(forceX, forceY);
                    planet2.applyForce(-forceX, -forceY);
                }
            }
        }
    }
    
    // 충돌 감지 및 처리
    handleCollisions(planets) {
        for (let i = 0; i < planets.length; i++) {
            for (let j = i + 1; j < planets.length; j++) {
                const planet1 = planets[i];
                const planet2 = planets[j];
                
                if (!planet1.isActive || !planet2.isActive) continue;
                
                const dx = planet2.x - planet1.x;
                const dy = planet2.y - planet1.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const minDistance = planet1.radius + planet2.radius;
                
                if (distance < minDistance) {
                    this.resolveCollision(planet1, planet2, dx, dy, distance, minDistance);
                    this.createCollisionParticles(
                        (planet1.x + planet2.x) / 2,
                        (planet1.y + planet2.y) / 2,
                        planet1.color,
                        planet2.color
                    );
                }
            }
        }
    }
    
    // 충돌 해결
    resolveCollision(planet1, planet2, dx, dy, distance, minDistance) {
        // 겹침 해결
        const overlap = minDistance - distance;
        const separationX = (dx / distance) * overlap * 0.5;
        const separationY = (dy / distance) * overlap * 0.5;
        
        planet1.x -= separationX;
        planet1.y -= separationY;
        planet2.x += separationX;
        planet2.y += separationY;
        
        // 탄성 충돌 계산
        const normalX = dx / distance;
        const normalY = dy / distance;
        
        // 상대 속도
        const relativeVelocityX = planet2.vx - planet1.vx;
        const relativeVelocityY = planet2.vy - planet1.vy;
        
        // 법선 방향 상대 속도
        const normalVelocity = relativeVelocityX * normalX + relativeVelocityY * normalY;
        
        if (normalVelocity > 0) return; // 이미 분리되고 있음
        
        // 반발계수 적용
        const restitution = GAME_CONFIG.COLLISION_DAMPING;
        
        // 충격량 계산
        const impulse = -(1 + restitution) * normalVelocity / (1/planet1.mass + 1/planet2.mass);
        
        // 속도 업데이트
        const impulseX = impulse * normalX;
        const impulseY = impulse * normalY;
        
        planet1.vx -= impulseX / planet1.mass;
        planet1.vy -= impulseY / planet1.mass;
        planet2.vx += impulseX / planet2.mass;
        planet2.vy += impulseY / planet2.mass;
    }
    
    // 충돌 파티클 생성
    createCollisionParticles(x, y, color1, color2) {
        for (let i = 0; i < GAME_CONFIG.PARTICLE_COUNT; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 5 + 2;
            const color = Math.random() > 0.5 ? color1 : color2;
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0,
                color: color,
                size: Math.random() * 4 + 2
            });
        }
    }
    
    // 파티클 업데이트
    updateParticles(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            particle.x += particle.vx * deltaTime;
            particle.y += particle.vy * deltaTime;
            particle.life -= deltaTime * 0.02;
            particle.size *= 0.98;
            
            if (particle.life <= 0 || particle.size < 0.5) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    // 파티클 렌더링
    renderParticles(ctx) {
        ctx.save();
        for (const particle of this.particles) {
            ctx.globalAlpha = particle.life;
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
    
    // 경계 검사
    checkBoundaries(planets, canvasWidth, canvasHeight) {
        const outOfBoundsPlanets = [];
        
        for (const planet of planets) {
            if (planet.isActive && planet.isOutOfBounds(canvasWidth, canvasHeight)) {
                planet.isActive = false;
                outOfBoundsPlanets.push(planet);
            }
        }
        
        return outOfBoundsPlanets;
    }
    
    // 모든 행성이 정지했는지 확인
    areAllPlanetsStationary(planets) {
        for (const planet of planets) {
            if (!planet.isActive) continue;
            if (Math.abs(planet.vx) > 0.1 || Math.abs(planet.vy) > 0.1) {
                return false;
            }
        }
        return true;
    }
    
    // 발사 힘 계산
    calculateShootForce(startX, startY, endX, endY) {
        const dx = endX - startX;
        const dy = endY - startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 100; // 최대 드래그 거리
        
        const normalizedDistance = Math.min(distance / maxDistance, 1);
        const power = normalizedDistance * GAME_CONFIG.MAX_POWER;
        
        const forceX = (dx / distance) * power;
        const forceY = (dy / distance) * power;
        
        return { forceX, forceY, power: normalizedDistance };
    }
    
    // 궤도 예측 (시각적 가이드용)
    predictTrajectory(planet, forceX, forceY, steps = 50) {
        const trajectory = [];
        let x = planet.x;
        let y = planet.y;
        let vx = forceX / planet.mass;
        let vy = forceY / planet.mass;
        
        for (let i = 0; i < steps; i++) {
            x += vx;
            y += vy;
            vx *= GAME_CONFIG.DAMPING;
            vy *= GAME_CONFIG.DAMPING;
            
            trajectory.push({ x, y });
            
            // 속도가 너무 느려지면 중단
            if (Math.abs(vx) < 0.1 && Math.abs(vy) < 0.1) break;
        }
        
        return trajectory;
    }
    
    // 두 행성 간 거리 계산
    getDistance(planet1, planet2) {
        const dx = planet1.x - planet2.x;
        const dy = planet1.y - planet2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    // 점과 원의 충돌 검사
    isPointInCircle(pointX, pointY, circleX, circleY, radius) {
        const dx = pointX - circleX;
        const dy = pointY - circleY;
        return Math.sqrt(dx * dx + dy * dy) <= radius;
    }
    
    // 컬링 모드용 점수 계산
    calculateCurlingScore(planets, houseCenter, houseRadii, player1Planets, player2Planets) {
        const p1InHouse = [];
        const p2InHouse = [];
        
        // 하우스 안에 있는 행성들 찾기
        for (const planet of player1Planets) {
            if (!planet.isActive) continue;
            const distance = this.getDistance(planet, houseCenter);
            for (let i = 0; i < houseRadii.length; i++) {
                if (distance <= houseRadii[i]) {
                    p1InHouse.push({ planet, distance, ring: i });
                    break;
                }
            }
        }
        
        for (const planet of player2Planets) {
            if (!planet.isActive) continue;
            const distance = this.getDistance(planet, houseCenter);
            for (let i = 0; i < houseRadii.length; i++) {
                if (distance <= houseRadii[i]) {
                    p2InHouse.push({ planet, distance, ring: i });
                    break;
                }
            }
        }
        
        // 가장 가까운 행성 찾기
        let closestDistance = Infinity;
        let winningPlayer = null;
        
        [...p1InHouse, ...p2InHouse].forEach(entry => {
            if (entry.distance < closestDistance) {
                closestDistance = entry.distance;
                winningPlayer = player1Planets.includes(entry.planet) ? 'P1' : 'P2';
            }
        });
        
        if (!winningPlayer) return { P1: 0, P2: 0 };
        
        // 승리한 플레이어의 점수 계산
        const winningPlanets = winningPlayer === 'P1' ? p1InHouse : p2InHouse;
        const losingPlanets = winningPlayer === 'P1' ? p2InHouse : p1InHouse;
        
        let score = 0;
        const losingClosest = losingPlanets.length > 0 ? 
            Math.min(...losingPlanets.map(p => p.distance)) : Infinity;
        
        for (const entry of winningPlanets) {
            if (entry.distance < losingClosest) {
                score += 3 - entry.ring; // 3점, 2점, 1점
            }
        }
        
        return winningPlayer === 'P1' ? { P1: score, P2: 0 } : { P1: 0, P2: score };
    }
} 