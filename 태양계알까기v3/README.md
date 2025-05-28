# 🌟 태양계 알까기 v3 - Solar System Marble Game

태양계의 행성들을 이용한 교육용 물리 시뮬레이션 게임입니다. 실제 행성의 특성을 반영한 물리 엔진과 아름다운 그래픽으로 재미있게 태양계를 학습할 수 있습니다.

## 🎮 게임 특징

### 게임 모드
- **알까기 모드**: 상대방의 모든 행성을 맵 밖으로 밀어내면 승리
- **컬링 모드**: 3라운드 동안 중앙 원에 가까이 행성을 위치시켜 점수 획득

### 물리 시뮬레이션
- 실제 행성의 질량, 크기, 밀도 반영
- 중력 상호작용 시뮬레이션
- 충돌 및 반발 물리
- 궤적 예측 시스템

### 시각적 효과
- 행성별 고유한 텍스처와 색상
- 충돌 파티클 효과
- 행성 궤적 추적
- 별이 빛나는 우주 배경

### 사운드 시스템
- Tone.js 기반 동적 사운드 생성
- 게임 이벤트별 맞춤 사운드
- 행성 특성에 따른 사운드 변화

## 🚀 시작하기

### 필요 조건
- 모던 웹 브라우저 (Chrome, Firefox, Safari, Edge)
- ES6 모듈 지원
- 인터넷 연결 (Tone.js CDN 로드용)

### 실행 방법
1. 프로젝트 파일을 웹 서버에 업로드하거나 로컬 서버 실행
2. `index.html` 파일을 브라우저에서 열기
3. 게임 모드 선택 후 플레이 시작

### 로컬 서버 실행 (권장)
```bash
# Python 3
python -m http.server 8000

# Node.js (http-server 패키지 필요)
npx http-server

# PHP
php -S localhost:8000
```

## 🎯 게임 플레이

### 기본 조작
1. **행성 선택**: 자신의 행성을 마우스로 클릭
2. **발사 방향 설정**: 발사하고 싶은 반대 방향으로 드래그
3. **발사**: 마우스를 놓아서 행성 발사
4. **파워 조절**: 드래그 거리로 파워 조절

### 키보드 단축키
- `ESC`: 메뉴로 돌아가기
- `R`: 게임 오버 시 재시작
- `M`: 음소거 토글
- `H`: 도움말 표시

### 게임 진행
1. **드래프트 단계**: 각 플레이어가 번갈아가며 행성 선택
2. **플레이 단계**: 턴제로 행성을 발사하여 게임 진행
3. **결과**: 승리 조건 달성 시 게임 종료

## 🏗️ 프로젝트 구조

```
태양계알까기v3/
├── index.html              # 메인 HTML 파일
├── script.js               # 메인 스크립트 (모듈 로더)
├── styles.css              # 스타일시트
├── README.md               # 프로젝트 문서
├── index_backup.html       # 백업 파일 (단일 파일 버전)
└── js/                     # 모듈화된 JavaScript 파일들
    ├── constants.js        # 게임 상수 및 설정
    ├── planet.js           # 행성 클래스
    ├── physics.js          # 물리 엔진
    ├── gameState.js        # 게임 상태 관리
    ├── ui.js               # UI 렌더링 및 이벤트 처리
    ├── audio.js            # 사운드 시스템
    └── game.js             # 메인 게임 클래스
```

## 🔧 모듈 설명

### `constants.js`
- 게임 설정값 (캔버스 크기, FPS, 물리 상수 등)
- 행성 데이터 (실제 태양계 행성 정보)
- 게임 상태 및 모드 정의

### `planet.js`
- Planet 클래스 정의
- 행성 렌더링 및 물리 속성
- 텍스처 생성 및 애니메이션

### `physics.js`
- PhysicsEngine 클래스
- 중력 시뮬레이션
- 충돌 감지 및 처리
- 파티클 시스템

### `gameState.js`
- GameStateManager 클래스
- 게임 상태 전환 관리
- 드래프트 및 턴 관리
- 승리 조건 확인

### `ui.js`
- UIManager 클래스
- 게임 화면 렌더링
- 사용자 입력 처리
- 모달 및 UI 요소 관리

### `audio.js`
- AudioSystem 클래스
- Tone.js 기반 사운드 생성
- 게임 이벤트별 사운드 효과

### `game.js`
- SolarSystemMarbleGame 메인 클래스
- 모든 모듈 통합 및 조율
- 게임 루프 및 이벤트 처리

## 🎨 커스터마이징

### 게임 설정 변경
`js/constants.js` 파일에서 다음 설정들을 변경할 수 있습니다:
- 캔버스 크기
- 물리 상수 (중력, 마찰력 등)
- 게임 모드별 설정
- 행성 데이터

### 새로운 행성 추가
```javascript
// js/constants.js의 PLANETS_DATA에 추가
newPlanet: {
    name: '새로운 행성',
    radius: 20,
    mass: 50,
    density: 3.5,
    gravity: 0.8,
    color: '#FF6B6B',
    textureColors: ['#FF6B6B', '#FF8E8E', '#FFB1B1'],
    type: 'terrestrial',
    description: '새로운 행성의 설명',
    rotationPeriod: 24,
    axialTilt: 23.5
}
```

### 사운드 커스터마이징
`js/audio.js`에서 Tone.js 신디사이저 설정을 변경하여 다양한 사운드 효과를 만들 수 있습니다.

## 🐛 디버깅

### 개발자 도구
브라우저 콘솔에서 다음 명령어들을 사용할 수 있습니다:

```javascript
// 게임 재시작
gameUtils.restart()

// 특정 모드로 시작
gameUtils.startMode('marbles')  // 알까기 모드
gameUtils.startMode('curling')  // 컬링 모드

// 오디오 토글
gameUtils.toggleAudio()

// 게임 상태 확인
gameUtils.getGameState()

// 행성 정보 확인
gameUtils.getPlanetsInfo()

// 게임 객체 직접 접근
window.game
```

### 일반적인 문제 해결

**게임이 로드되지 않는 경우:**
- 브라우저가 ES6 모듈을 지원하는지 확인
- 로컬 파일이 아닌 웹 서버에서 실행하는지 확인
- 브라우저 콘솔에서 오류 메시지 확인

**사운드가 재생되지 않는 경우:**
- Tone.js CDN 로드 확인
- 브라우저의 자동재생 정책으로 인해 첫 클릭 후 활성화됨
- 브라우저 음소거 상태 확인

## 🤝 기여하기

1. 프로젝트 포크
2. 새로운 기능 브랜치 생성
3. 변경사항 커밋
4. 브랜치에 푸시
5. Pull Request 생성

## 📚 학습 자료

이 게임은 다음 개념들을 학습할 수 있습니다:
- 태양계 행성의 특성
- 물리학 (중력, 운동량, 충돌)
- 게임 개발 (Canvas API, 모듈화, 상태 관리)
- 웹 기술 (ES6 모듈, Web Audio API)

## 📄 라이선스

이 프로젝트는 교육 목적으로 제작되었습니다.

## 🙏 감사의 말

- Tone.js 라이브러리 개발팀
- NASA의 행성 데이터
- 웹 표준을 발전시키는 모든 개발자들

---

**즐거운 태양계 탐험 되세요! 🚀🌌** 