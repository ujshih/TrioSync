// Fate Keys 命運節奏 - 現代化遊戲邏輯
// ===============================

// ===============================
// 粒子背景管理器 (Particle Background Manager)
// ===============================
const particleManager = {
    canvas: null,
    ctx: null,
    particles: [],
    animationId: null,
    
    init() {
        this.canvas = document.getElementById('particles-bg');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        this.createParticles();
        this.animate();
        
        window.addEventListener('resize', () => this.resizeCanvas());
    },
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },
    
    createParticles() {
        this.particles = [];
        const particleCount = Math.min(100, Math.floor(window.innerWidth * window.innerHeight / 10000));
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 1,
                opacity: Math.random() * 0.5 + 0.2,
                color: ['#0ff', '#f0f', '#ff6f91', '#fff700'][Math.floor(Math.random() * 4)]
            });
        }
    },
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(particle => {
            // 更新位置
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // 邊界檢查
            if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;
            
            // 繪製粒子
            this.ctx.save();
            this.ctx.globalAlpha = particle.opacity;
            this.ctx.fillStyle = particle.color;
            this.ctx.shadowColor = particle.color;
            this.ctx.shadowBlur = 10;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
        
        this.animationId = requestAnimationFrame(() => this.animate());
    },
    
    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
};

// ===============================
// 音頻可視化管理器 (Audio Visualizer Manager)
// ===============================
const audioVisualizer = {
    canvas: null,
    ctx: null,
    audioContext: null,
    analyser: null,
    dataArray: null,
    animationId: null,
    isConnected: false,
    
    init() {
        this.canvas = document.getElementById('audio-visualizer');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        window.addEventListener('resize', () => this.resizeCanvas());
    },
    
    resizeCanvas() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
    },
    
    start(audioElement) {
        if (!this.canvas || !audioElement) return;
        
        try {
            // 如果已經連接過，先斷開
            if (this.isConnected) {
                this.stop();
            }
            
            // 創建或重用 AudioContext
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            const source = this.audioContext.createMediaElementSource(audioElement);
            this.analyser = this.audioContext.createAnalyser();
            
            source.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);
            
            this.analyser.fftSize = 256;
            const bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(bufferLength);
            
            this.isConnected = true;
            this.animate();
        } catch (error) {
            console.warn('音頻可視化初始化失敗:', error);
        }
    },
    
    animate() {
        if (!this.analyser || !this.dataArray) return;
        
        this.analyser.getByteFrequencyData(this.dataArray);
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const barWidth = this.canvas.width / this.dataArray.length;
        const barHeight = this.canvas.height;
        
        for (let i = 0; i < this.dataArray.length; i++) {
            const barHeightPercent = this.dataArray[i] / 255;
            const height = barHeightPercent * barHeight;
            const x = i * barWidth;
            const y = barHeight - height;
            
            const gradient = this.ctx.createLinearGradient(0, y, 0, barHeight);
            gradient.addColorStop(0, '#0ff');
            gradient.addColorStop(0.5, '#f0f');
            gradient.addColorStop(1, '#ff6f91');
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(x, y, barWidth - 1, height);
        }
        
        this.animationId = requestAnimationFrame(() => this.animate());
    },
    
    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.isConnected = false;
    }
};

// ===============================
// 音訊管理器 (Audio Manager)
// ===============================
const audioManager = {
    currentType: null,
    currentTrack: null,
    audio: null,
    fadeTimer: null,
    cache: {},
    paths: {
        bgm: 'DRIVE.mp3',
        tracks: {
            'Champion': 'Champion.mp3',
            'Bliss': 'Bliss.mp3',
            'Canon': 'Canon.mp3',
            'HappyBirthday': 'HappyBirthday.mp3',
            'MainTheme': 'MainTheme.mp3',
            'MagicalMoments': 'MagicalMoments.mp3',
            'Noise': 'Noise.mp3',
            'HammerMASTER': 'HammerMASTER.mp3',
            'InspiringDreams': 'InspiringDreams.mp3',
            'inspiringguitar': 'inspiringguitar.mp3'
        }
    },
    
    showNowPlaying(name) {
        let el = document.getElementById('now-playing');
        if (!el) {
            el = document.createElement('div');
            el.id = 'now-playing';
            Object.assign(el.style, {
                position: 'fixed', top: '16px', right: '24px', 
                background: 'rgba(0,0,0,0.8)', color: '#0ff',
                padding: '8px 16px', borderRadius: '20px', 
                fontSize: '1rem', zIndex: 9999,
                border: '1px solid #0ff', boxShadow: '0 0 20px rgba(0,255,255,0.5)'
            });
            document.body.appendChild(el);
        }
        el.textContent = name ? `🎵 ${name}` : '';
        el.style.display = name ? 'block' : 'none';
    },
    
    preload(path) {
        if (!this.cache[path]) {
            const audio = new Audio(path);
            audio.preload = 'auto';
            this.cache[path] = audio;
        }
    },
    
    fadeIn(audio, target = 1, step = 0.1, interval = 40) {
        clearInterval(this.fadeTimer);
        audio.volume = 0;
        try {
            const playPromise = audio.play();
            if (playPromise?.then) {
                playPromise.catch(err => {
                    if (err.name !== 'AbortError') console.error('音樂播放失敗:', err);
                });
            }
        } catch (err) {
            if (err.name !== 'AbortError') console.error('音樂播放失敗:', err);
        }
        this.fadeTimer = setInterval(() => {
            if (audio.volume < target) {
                audio.volume = Math.min(audio.volume + step, target);
            } else {
                clearInterval(this.fadeTimer);
            }
        }, interval);
    },
    
    fadeOut(audio, callback, step = 0.1, interval = 40) {
        clearInterval(this.fadeTimer);
        this.fadeTimer = setInterval(() => {
            if (audio.volume > 0.1) {
                audio.volume = Math.max(audio.volume - step, 0);
            } else {
                audio.volume = 0;
                audio.pause();
                clearInterval(this.fadeTimer);
                callback?.();
            }
        }, interval);
    },
    
    stopAll(callback) {
        audioVisualizer.stop();
        if (this.audio) {
            this.fadeOut(this.audio, () => {
                this.audio = null;
                this.currentType = null;
                this.currentTrack = null;
                this.showNowPlaying('');
                callback?.();
            });
        } else {
            callback?.();
        }
    },
    
    playBackground() {
        this.stopAll(() => {
            const path = this.paths.bgm;
            this.preload(path);
            const audio = new Audio(path);
            Object.assign(audio, {
                loop: true,
                volume: 0,
                onended: null,
                onerror: () => showToast('背景音樂播放失敗，請檢查音訊檔案或瀏覽器權限！')
            });
            this.audio = audio;
            this.currentType = 'bgm';
            this.currentTrack = 'Drive';
            this.showNowPlaying('Drive');
            this.fadeIn(audio, 0.7);
        });
    },
    
    playPreview(trackName, offsetSec = null) {
        this.stopAll(() => {
            const path = this.paths.tracks[trackName];
            if (!path) return showAudioError('找不到音樂檔案，請確認檔名與路徑正確！');
            this.preload(path);
            const audio = new Audio(path);
            Object.assign(audio, {
                loop: false,
                volume: 0.8,
                currentTime: offsetSec ?? (trackName === 'Canon' ? 100 : 15),
                onended: null,
                onerror: () => showAudioError('音樂檔案載入失敗，請確認伺服器已啟動、檔案存在且名稱正確（大小寫）！')
            });
            this.audio = audio;
            this.currentType = 'preview';
            this.currentTrack = trackName;
            this.showNowPlaying(trackName);
            this.fadeIn(audio, 0.8);
            audio.onplay = hideAudioError;
        });
    },
    
    playGameTrack(trackName, offsetSec = null, callback = null) {
        this.stopAll(() => {
            const path = this.paths.tracks[trackName];
            if (!path) {
                showAudioError('找不到音樂檔案，請確認檔名與路徑正確！');
                callback?.();
                return;
            }
            this.preload(path);
            const audio = new Audio(path);
            Object.assign(audio, {
                loop: trackName === 'HappyBirthday',
                volume: trackName === 'Canon' ? 1.0 : 0.95,
                currentTime: offsetSec ?? (trackName === 'Canon' ? 100 : 15),
                onended: null,
                onerror: () => {
                    showAudioError('音樂檔案載入失敗，請確認伺服器已啟動、檔案存在且名稱正確（大小寫）！');
                    callback?.();
                }
            });
            this.audio = audio;
            this.currentType = 'game';
            this.currentTrack = trackName;
            this.showNowPlaying(trackName);
            audio.onplay = () => {
                hideAudioError();
                audioVisualizer.start(audio);
                callback?.();
            };
            this.fadeIn(audio, trackName === 'Canon' ? 1.0 : 0.95);
        });
    },
    
    resumeBackground() {
        this.playBackground();
    }
};

// ====== 全域變數 ======
let audioUnlocked = false;
let canvas = null;
let ctx = null;
let comboDisplay = null;
let scoreDisplay = null;
let comboContainer = null;
let keyHints = null;
let finalScore = null;
let finalGrade = null;
let restartBtn = null;
let startBtn = null;
let difficultyBtns = null;
let songCards = null;
let backBtn = null;
let selectArea = null;
let resultScreen = null;
let gameArea = null;

// 遊戲配置
const KEY_COLORS = ['#ff6f91', '#4ecdc4', '#ffe066', '#5f6fff', '#ffb347'];
let KEY_LIST = ['D', 'F', 'J', 'K'];
const KEY_LISTS = {
    four: ['D', 'F', 'J', 'K'],
    five: ['D', 'F', ' ', 'J', 'K']
};

// 遊戲狀態
let selectedSong = null;
let selectedDifficulty = null;
let gameStarted = false;
let gamePaused = false;
let gameEnded = false;
let score = 0;
let combo = 0;
let maxCombo = 0;
let missCount = 0;
let hitCount = 0;
let notes = [];
let currentTime = 0;
let gameStartTime = 0;
let animationId = null;
let autoMissCheckId = null;
let missBufferCount = 0;
let gamePlayCount = 0;

// 動態互動狀態
let feverMode = false;
let feverStartTime = 0;
let feverDuration = 10000; // 10秒狂熱模式
let missLanes = new Set(); // 記錄Miss的賽道
let screenShake = 0; // 畫面震動強度
let laneGlowStates = Array(5).fill(0); // 賽道發光狀態

// 遊戲等級參數 (根據表格內容設計)
const LEVEL_CONFIGS = {
  lv1: {
    name: "Lv.1 新手引導",
    enName: "Level 1 - Tutorial",
    speed: 150,
    density: 1.0,
    keyCount: 4,
    missBuffer: 4,
    stars: 1,
    desc: "第一次玩家專用，單音符、慢速、寬鬆判定",
    judgeWindow: 350,
    keys: ['D', 'F', 'J', 'K'],
    holdSupport: false,
    simultaneousNotes: 1,
    specialRules: "無長音支援，單音符為主"
  },
  lv2: {
    name: "Lv.2 入門體驗",
    enName: "Level 2 - Beginner",
    speed: 180,
    density: 1.5,
    keyCount: 4,
    missBuffer: 3,
    stars: 2,
    desc: "入門玩家，簡單短長音、偶有雙鍵",
    judgeWindow: 300,
    keys: ['D', 'F', 'J', 'K'],
    holdSupport: true,
    holdType: "simple",
    simultaneousNotes: 2,
    specialRules: "簡單短長音支援"
  },
  lv3: {
    name: "Lv.3 有經驗者",
    enName: "Level 3 - Experienced",
    speed: 200,
    density: 2.0,
    keyCount: 4,
    missBuffer: 2,
    stars: 3,
    desc: "有經驗者，中長音、雙鍵同時出現",
    judgeWindow: 300,
    keys: ['D', 'F', 'J', 'K'],
    holdSupport: true,
    holdType: "medium",
    simultaneousNotes: 2,
    specialRules: "中長音支援，雙鍵常態"
  },
  lv4: {
    name: "Lv.4 挑戰變化",
    enName: "Level 4 - Challenge",
    speed: 230,
    density: 3.0,
    keyCount: 5,
    missBuffer: 1,
    stars: 4,
    desc: "喜歡挑戰變化，多段長音、三鍵偶有",
    judgeWindow: 250,
    keys: ['D', 'F', ' ', 'J', 'K'],
    holdSupport: true,
    holdType: "multi",
    simultaneousNotes: 3,
    specialRules: "多段長音，Space鍵加入，判定鬆緊"
  },
  lv5: {
    name: "Lv.5 進階玩家",
    enName: "Level 5 - Advanced",
    speed: 260,
    density: 4.0,
    keyCount: 5,
    missBuffer: 1,
    stars: 5,
    desc: "進階玩家，長音密集、四鍵偶有",
    judgeWindow: 150,
    keys: ['D', 'F', ' ', 'J', 'K'],
    holdSupport: true,
    holdType: "intensive",
    simultaneousNotes: 4,
    specialRules: "長音密集，特效數多，節奏混淆"
  },
  lv6: {
    name: "Lv.6 高手挑戰",
    enName: "Level 6 - Master",
    speed: 280,
    density: 5.5,
    keyCount: 5,
    missBuffer: 0,
    stars: 6,
    desc: "高手/彩蛋挑戰，4~5鍵並列、特殊長音",
    judgeWindow: 100,
    keys: ['D', 'F', ' ', 'J', 'K'],
    holdSupport: true,
    holdType: "special",
    simultaneousNotes: 5,
    specialRules: "特殊長音，高速連打，極限判定",
    locked: false
  }
};

// 保持向後相容性
const DIFFICULTY_CONFIGS = LEVEL_CONFIGS;

// 全域變數宣告
let holdKeyLane = null;
let holdKeyNote = null;
let holdKeyStartTime = null;

// ===============================
// 畫面管理 (Screen Management)
// ===============================
function showScreen(screen) {
    console.log('[showScreen] 切換到畫面:', screen, { selectArea, gameArea, resultScreen });
    if (!selectArea || !gameArea || !resultScreen) {
        selectArea = document.getElementById('select-area');
        gameArea = document.getElementById('game-area');
        resultScreen = document.getElementById('result-screen');
        if (!selectArea || !gameArea || !resultScreen) {
            showAudioError('畫面 DOM 元素未找到，請檢查 HTML 結構');
            return;
        }
    }
    selectArea.style.display = 'none';
    gameArea.style.display = 'none';
    resultScreen.style.display = 'none';
    switch (screen) {
        case 'select':
            selectArea.style.display = 'flex';
            selectArea.classList.add('fade-in');
            break;
        case 'game':
            gameArea.style.display = 'flex';
            gameArea.classList.add('fade-in');
            if (gameArea.style.display !== 'flex') {
                gameArea.style.display = 'flex';
                showAudioError('gameArea 未正確顯示，已強制顯示');
            }
            break;
        case 'result':
            resultScreen.style.display = 'flex';
            resultScreen.classList.add('fade-in');
            break;
    }
    console.log('[showScreen] 畫面切換完成:', screen);
}

// ===============================
// 音符生成 (Note Generation)
// ===============================
function generateNotes(difficulty, duration = 60) {
    const config = LEVEL_CONFIGS[difficulty];
    if (!config) {
        console.error('[generateNotes] 無效的難度設定:', difficulty);
        showAudioError('無效的難度設定，請重新選擇');
        return [];
    }
    console.log('[generateNotes] 開始生成音符，配置:', config);
    
    notes = [];
    KEY_LIST = config.keys;
    const noteCount = Math.floor(duration * config.density * 2);
    const timeStep = duration / noteCount;
    
    // 編排優化：記錄每 lane 最後長音符結束時間
    const laneEndTime = Array(KEY_LIST.length).fill(0);
    // 根據難度調整每秒音符數量
    const maxNotesPerSecond = Math.min(config.simultaneousNotes, 3);
    const timeBuckets = {};
    
    let attempts = 0;
    const maxAttempts = noteCount * 3; // 最大嘗試次數
    
    for (let i = 0; i < noteCount && attempts < maxAttempts; i++) {
        attempts++;
        let time = i * timeStep + Math.random() * 2;
        
        // 找出可用 lane
        let availableLanes = KEY_LIST.map((_, idx) => idx).filter(idx => time >= laneEndTime[idx]);
        
        // 如果沒有可用 lane，重置所有 lane 的結束時間
        if (availableLanes.length === 0) {
            laneEndTime.fill(0);
            availableLanes = KEY_LIST.map((_, idx) => idx);
        }
        
        // 根據難度限制每秒音符數量
        const sec = Math.floor(time);
        if (!timeBuckets[sec]) timeBuckets[sec] = 0;
        if (timeBuckets[sec] >= maxNotesPerSecond) {
            // 如果這秒音符太多，跳到下一秒
            time = (sec + 1) + Math.random() * 0.5;
            if (!timeBuckets[sec + 1]) timeBuckets[sec + 1] = 0;
            timeBuckets[sec + 1]++;
        } else {
            timeBuckets[sec]++;
        }
        
        // 根據難度決定是否長音符
        let isHold = false;
        if (config.holdSupport) {
            switch (config.holdType) {
                case 'simple':
                    isHold = Math.random() < 0.2; // 20% 機率
                    break;
                case 'medium':
                    isHold = Math.random() < 0.3; // 30% 機率
                    break;
                case 'multi':
                    isHold = Math.random() < 0.4; // 40% 機率
                    break;
                case 'intensive':
                    isHold = Math.random() < 0.5; // 50% 機率
                    break;
                case 'special':
                    isHold = Math.random() < 0.6; // 60% 機率
                    break;
                default:
                    isHold = Math.random() < 0.3;
            }
        }
        
        let lane = availableLanes[Math.floor(Math.random() * availableLanes.length)];
        
        if (isHold) {
            // 根據難度調整長音符持續時間
            let holdDuration;
            switch (config.holdType) {
                case 'simple':
                    holdDuration = 0.5 + Math.random() * 0.8; // 0.5-1.3秒
                    break;
                case 'medium':
                    holdDuration = 0.8 + Math.random() * 1.2; // 0.8-2.0秒
                    break;
                case 'multi':
                    holdDuration = 1.0 + Math.random() * 1.5; // 1.0-2.5秒
                    break;
                case 'intensive':
                    holdDuration = 1.2 + Math.random() * 1.8; // 1.2-3.0秒
                    break;
                case 'special':
                    holdDuration = 1.5 + Math.random() * 2.0; // 1.5-3.5秒
                    break;
                default:
                    holdDuration = 0.8 + Math.random() * 1.5;
            }
            
            notes.push({
                time: time,
                lane: lane,
                duration: holdDuration,
                hit: false,
                missed: false,
                holdActive: false,
                holdHit: false,
                group: i
            });
            laneEndTime[lane] = time + holdDuration + 0.1;
        } else {
            notes.push({
                time: time,
                lane: lane,
                duration: 0,
                hit: false,
                missed: false,
                group: i
            });
            laneEndTime[lane] = time + 0.2;
        }
    }
    
    // 確保至少有一些音符
    if (notes.length === 0) {
        console.warn('音符生成失敗，生成基本音符');
        for (let i = 0; i < 10; i++) {
            const time = i * 2 + Math.random();
            const lane = Math.floor(Math.random() * KEY_LIST.length);
            notes.push({
                time: time,
                lane: lane,
                duration: 0,
                hit: false,
                missed: false,
                group: i
            });
        }
    }
    
    notes.sort((a, b) => a.time - b.time);
    console.log(`[generateNotes] 生成 ${notes.length} 個音符，難度: ${difficulty}, 密度: ${config.density}/秒`);
    return notes;
}

// ===============================
// Canvas 管理 (Canvas Management)
// ===============================
function resizeCanvas() {
    if (!canvas) return;
    
    const container = gameArea;
    let containerWidth = container ? container.clientWidth : 900;
    let containerHeight = container ? container.clientHeight : 700;
    if (!containerWidth || !isFinite(containerWidth)) containerWidth = 900;
    if (!containerHeight || !isFinite(containerHeight)) containerHeight = 700;
    canvas.width = Math.min(containerWidth - 40, 800);
    canvas.height = Math.min(containerHeight - 200, 600);
    if (!canvas.width || !isFinite(canvas.width)) canvas.width = 800;
    if (!canvas.height || !isFinite(canvas.height)) canvas.height = 600;
    console.log(`Canvas 大小調整為: ${canvas.width} x ${canvas.height}`);
}

// ===============================
// 遊戲流程控制 (Game Flow Control)
// ===============================
// 倒數動畫防重複 flag
let isCountingDown = false;

// 倒數音效資源
const countdownAudio = new Audio('countdown.mp3'); // 請確保有 countdown.mp3

function showCountdown(callback) {
    console.log('[showCountdown] start', { callback });
    if (isCountingDown) return;
    isCountingDown = true;
    const overlay = document.getElementById('countdown-overlay');
    const text = document.getElementById('countdown-text');
    if (!overlay || !text) {
        showAudioError('倒數動畫 DOM 未找到');
        isCountingDown = false;
        return;
    }
    overlay.style.display = 'flex';
    let count = 3;
    text.textContent = count;
    // 禁用所有互動
    document.body.style.pointerEvents = 'none';
    countdownAudio.currentTime = 0;
    countdownAudio.play().catch(()=>{});
    const timer = setInterval(() => {
        count--;
        if (count > 0) {
            text.textContent = count;
            countdownAudio.currentTime = 0;
            countdownAudio.play().catch(()=>{});
        } else {
            clearInterval(timer);
            overlay.style.display = 'none';
            document.body.style.pointerEvents = '';
            isCountingDown = false;
            console.log('[showCountdown] callback fired');
            if (callback) callback();
        }
    }, 1000);
}

// --- startGame ---
function startGame() {
    console.log('[startGame] called', { gameStarted, isCountingDown, selectedSong, selectedDifficulty });
    if (gameStarted || isCountingDown) return;
    if (!selectedSong || !selectedDifficulty) {
        showToast('請先選擇歌曲與難度');
        return;
    }
    showCountdown(realStartGame);
    const config = LEVEL_CONFIGS[selectedDifficulty];
    missBufferCount = config ? config.missBuffer : 0;
    setMissBufferCount(missBufferCount);
}

// --- realStartGame ---
function realStartGame() {
    console.log('[realStartGame] called', { selectedSong, selectedDifficulty });
    if (!selectedSong || !selectedDifficulty) {
        showAudioError('遊戲參數錯誤，請重新選擇歌曲與難度');
        return;
    }
    const config = LEVEL_CONFIGS[selectedDifficulty];
    if (!config) {
        showAudioError('無效的難度設定，請重新選擇');
        return;
    }
    gameStarted = true;
    gamePaused = false;
    gameEnded = false;
    score = 0;
    combo = 0;
    maxCombo = 0;
    missCount = 0;
    hitCount = 0;
    console.log('[realStartGame] 準備切換到遊戲畫面');
    showScreen('game');
    console.log('[realStartGame] 準備調整 Canvas 大小');
    resizeCanvas();
    const laneCount = config.keyCount || 4;
    laneManager.setLaneCount(laneCount);
    console.log(`[realStartGame] 設定賽道數量: ${laneCount}`);
    notes = generateNotes(selectedDifficulty);
    if (!notes || notes.length === 0) {
        showAudioError('音符產生失敗，請重試');
        gameStarted = false;
        gamePaused = false;
        gameEnded = false;
        return;
    }
    console.log('[realStartGame] 音符生成成功，數量:', notes.length);
    const trackName = selectedSong.replace('.mp3', '');
    console.log('[realStartGame] 準備播放音樂:', trackName);
    let offset = 0;
    if (trackName === 'Canon') offset = 2.5;
    if (trackName === 'HappyBirthday') offset = 0.5;
    if (trackName === 'Noise') offset = 0.2;
    if (trackName === 'HammerMASTER') offset = 0.8;
    if (trackName === 'inspiringguitar') offset = 0.5;
    audioManager.playGameTrack(trackName, offset, () => {
        console.log('[realStartGame] 音樂開始播放，啟動遊戲迴圈');
        gameStartTime = Date.now();
        gameLoop();
        startAutoMissCheck();
    });
    updateScoreDisplay();
    updateComboDisplay();
    updateKeyHints();
    console.log('[realStartGame] 遊戲開始！');
}

// ===============================
// 遊戲主迴圈 (Game Main Loop)
// ===============================
function gameLoop(now) {
    if (!gameStarted || gamePaused || gameEnded) return;
    currentTime = (Date.now() - gameStartTime) / 1000;
    
    // 更新動態互動狀態
    dynamicInteractionManager.updateFeverMode();
    dynamicInteractionManager.checkFeverMode();
    
    // 更新倒數計時顯示
    const timerDisplay = document.getElementById('timer-display');
    if (timerDisplay) {
        const remain = Math.max(0, Math.ceil(60 - currentTime));
        timerDisplay.textContent = remain;
    }
    
    // 畫面震動效果
    if (screenShake > 0) {
        ctx.save();
        const shakeX = (Math.random() - 0.5) * screenShake;
        const shakeY = (Math.random() - 0.5) * screenShake;
        ctx.translate(shakeX, shakeY);
    }
    
    drawBackground(now);
    drawNotes(now);
    
    // 更新和繪製音符特效
    noteEffectManager.update();
    noteEffectManager.draw(ctx);
    
    // 恢復畫面震動
    if (screenShake > 0) {
        ctx.restore();
    }
    
    animationId = requestAnimationFrame(gameLoop);
}

// 深空背景管理器 - 紫紅漸層與靛藍延展
const deepSpaceManager = {
    stars: [],
    nebulaParticles: [],
    time: 0,
    rhythmFlash: 0,
    lastBeatTime: 0,
    comboIntensity: 0, // Combo強度影響星雲閃耀
    
    init() {
        // 初始化深空星點
        this.stars = [];
        for (let i = 0; i < 200; i++) {
            this.stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                z: Math.random() * 3000 + 500,
                speed: 0.5 + Math.random() * 2,
                size: Math.random() * 3 + 0.5,
                color: ['#fff', '#0ff', '#f0f', '#ff6f91', '#ffe066', '#4ecdc4'][Math.floor(Math.random() * 6)],
                twinkle: Math.random() * Math.PI * 2,
                brightness: Math.random() * 0.5 + 0.5
            });
        }
        
        // 初始化星雲粒子
        this.nebulaParticles = [];
        for (let i = 0; i < 100; i++) {
            this.nebulaParticles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.2,
                vy: (Math.random() - 0.5) * 0.2,
                size: Math.random() * 20 + 10,
                opacity: Math.random() * 0.3 + 0.1,
                color: Math.random() > 0.5 ? '#6C2DC7' : '#8A2BE2',
                flow: Math.random() * Math.PI * 2
            });
        }
    },
    
    update(deltaTime, currentTime, combo) {
        this.time += deltaTime;
        
        // 更新Combo強度
        this.comboIntensity = Math.min(1.0, combo / 50); // 最大Combo 50時達到最大強度
        
        // 節奏閃爍效果
        if (currentTime - this.lastBeatTime > 0.5) {
            this.rhythmFlash = 1.0;
            this.lastBeatTime = currentTime;
        } else {
            this.rhythmFlash = Math.max(0, this.rhythmFlash - deltaTime * 0.01);
        }
        
        // 更新星點位置
        this.stars.forEach(star => {
            star.z -= star.speed * 2;
            star.twinkle += 0.05;
            star.brightness = 0.5 + Math.sin(star.twinkle) * 0.3 + this.comboIntensity * 0.2;
            if (star.z < 1) {
                star.z = 3000 + Math.random() * 1000;
                star.x = Math.random() * canvas.width;
                star.y = Math.random() * canvas.height;
            }
        });
        
        // 更新星雲粒子流動
        this.nebulaParticles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.flow += 0.01;
            
            // 邊界循環
            if (particle.x < -particle.size) particle.x = canvas.width + particle.size;
            if (particle.x > canvas.width + particle.size) particle.x = -particle.size;
            if (particle.y < -particle.size) particle.y = canvas.height + particle.size;
            if (particle.y > canvas.height + particle.size) particle.y = -particle.size;
            
            // Combo影響星雲亮度
            particle.opacity = Math.min(0.4, particle.opacity + this.comboIntensity * 0.1);
        });
    }
};

// 賽道管理器 - 精緻鍵位設計
const laneManager = {
    laneCount: 5,
    // 精緻鍵位配置：D(青藍) F(紫光) Space(金白) J(粉橘) K(電光藍)
    laneConfigs: [
        { key: 'D', color: '#00CFFF', name: '青藍', effect: 'iceCrystal' },
        { key: 'F', color: '#A16EFF', name: '紫光', effect: 'crystalBall' },
        { key: ' ', color: '#FFD700', name: '金白', effect: 'starTrail' },
        { key: 'J', color: '#FF8888', name: '粉橘', effect: 'starBurst' },
        { key: 'K', color: '#66FFFF', name: '電光藍', effect: 'laserFlash' }
    ],
    perspectiveSegments: 20,
    
    setLaneCount(count) {
        this.laneCount = Math.max(4, Math.min(6, count));
        KEY_LIST = KEY_LISTS[this.laneCount === 4 ? 'four' : 'five'];
        
        // 調整 laneGlowStates 陣列大小
        laneGlowStates = Array(this.laneCount).fill(0);
        
        console.log(`賽道數量設定為: ${this.laneCount}, 按鍵: ${KEY_LIST.join(', ')}`);
    },
    
    getLaneConfig(laneIndex) {
        return this.laneConfigs[laneIndex % this.laneConfigs.length];
    },
    
    drawLanes(ctx, canvas) {
        const laneWidth = canvas.width / this.laneCount;
        
        // 繪製每個賽道
        for (let i = 0; i < this.laneCount; i++) {
            const laneX = (i + 0.5) * laneWidth;
            const config = this.getLaneConfig(i);
            let laneColor = config.color;
            let glowIntensity = 1.0;
            
            // 動態配色處理
            if (missLanes.has(i)) {
                // Miss狀態 - 轉為灰色
                laneColor = '#666666';
                glowIntensity = 0.3;
            } else if (laneGlowStates[i] === 1) {
                // Perfect狀態 - 閃光效果
                laneColor = '#FFFFFF';
                glowIntensity = 2.0;
            } else if (laneGlowStates[i] === 2) {
                // Fever狀態 - 強烈發光
                laneColor = '#FFD700';
                glowIntensity = 3.0;
            }
            
            ctx.save();
            
            // 賽道主體 - 透視光橋
            const laneGradient = ctx.createLinearGradient(laneX - laneWidth * 0.4, 0, laneX + laneWidth * 0.4, 0);
            laneGradient.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
            laneGradient.addColorStop(0.3, `${laneColor}26`);
            laneGradient.addColorStop(0.7, `${laneColor}26`);
            laneGradient.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
            
            ctx.fillStyle = laneGradient;
            ctx.fillRect(laneX - laneWidth * 0.4, 0, laneWidth * 0.8, canvas.height);
            
            // 賽道邊緣發光線
            ctx.strokeStyle = laneColor;
            ctx.lineWidth = 2 * glowIntensity;
            ctx.shadowColor = laneColor;
            ctx.shadowBlur = 10 * glowIntensity;
            ctx.setLineDash([8, 4]);
            ctx.beginPath();
            ctx.moveTo(laneX - laneWidth * 0.35, 0);
            ctx.lineTo(laneX - laneWidth * 0.35, canvas.height);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(laneX + laneWidth * 0.35, 0);
            ctx.lineTo(laneX + laneWidth * 0.35, canvas.height);
            ctx.stroke();
            
            // 賽道中心線 - 透視效果
            const centerGradient = ctx.createLinearGradient(laneX, 0, laneX, canvas.height);
            centerGradient.addColorStop(0, `${laneColor}CC`);
            centerGradient.addColorStop(0.5, `${laneColor}4D`);
            centerGradient.addColorStop(1, `${laneColor}1A`);
            
            ctx.strokeStyle = centerGradient;
            ctx.lineWidth = 3 * glowIntensity;
            ctx.setLineDash([15, 5]);
            ctx.shadowBlur = 15 * glowIntensity;
            ctx.beginPath();
            ctx.moveTo(laneX, 0);
            ctx.lineTo(laneX, canvas.height);
            ctx.stroke();
            
            // 賽道脈動效果
            let pulse = Math.sin(Date.now() * 0.002 + i * Math.PI / 3) * 0.3 + 0.7;
            if (feverMode) {
                // Fever模式下的脈動
                pulse = Math.sin(Date.now() * 0.005 + i * Math.PI / 3) * 0.5 + 0.5;
            }
            ctx.globalAlpha = pulse * 0.3 * glowIntensity;
            ctx.fillStyle = `${laneColor}1A`;
            ctx.fillRect(laneX - laneWidth * 0.4, 0, laneWidth * 0.8, canvas.height);
            
            ctx.restore();
        }
        
        // 賽道分隔線 - 未來感設計
        for (let i = 1; i < this.laneCount; i++) {
            const x = i * laneWidth;
            ctx.save();
            
            // 主分隔線
            ctx.strokeStyle = '#0ff';
            ctx.lineWidth = 3;
            ctx.shadowColor = '#0ff';
            ctx.shadowBlur = 12;
            ctx.setLineDash([10, 6]);
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
            
            // 分隔線發光效果
            ctx.strokeStyle = 'rgba(0, 255, 255, 0.4)';
            ctx.lineWidth = 8;
            ctx.shadowBlur = 20;
            ctx.setLineDash([]);
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
            
            // 分隔線節點效果
            for (let y = 50; y < canvas.height; y += 100) {
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, Math.PI * 2);
                ctx.fillStyle = '#0ff';
                ctx.shadowColor = '#0ff';
                ctx.shadowBlur = 8;
                ctx.fill();
            }
            
            ctx.restore();
        }
    }
};

// 動態互動管理器
const dynamicInteractionManager = {
    // Miss特效 - 賽道轉灰 + 慢速消散
    triggerMissEffect(lane) {
        missLanes.add(lane);
        laneGlowStates[lane] = -1; // 負值表示Miss狀態
        
        // 3秒後恢復賽道顏色
        setTimeout(() => {
            missLanes.delete(lane);
            laneGlowStates[lane] = 0;
        }, 3000);
    },
    
    // Perfect特效 - 閃光 + 撞擊擴散圈
    triggerPerfectEffect(lane) {
        laneGlowStates[lane] = 1; // 正值表示Perfect狀態
        
        // 0.5秒後恢復
        setTimeout(() => {
            laneGlowStates[lane] = 0;
        }, 500);
        
        // 播放Perfect音效（如果有）
        this.playPerfectSound();
    },
    
    // 長按斷開特效 - 拖尾漸暗 + 畫面震動
    triggerHoldBreakEffect() {
        screenShake = 15; // 震動強度
        
        // 0.3秒後停止震動
        setTimeout(() => {
            screenShake = 0;
        }, 300);
        
        // 播放失敗音效
        this.playFailSound();
    },
    
    // Fever模式 - 所有賽道發光 + 背景脈動
    triggerFeverMode() {
        feverMode = true;
        feverStartTime = Date.now();
        
        // 所有賽道進入發光狀態
        laneGlowStates.fill(2); // 2表示Fever狀態
        
        // 添加Fever模式CSS類別
        if (gameArea) {
            gameArea.classList.add('fever-mode');
        }
        
        // 播放Fever音效
        this.playFeverSound();
        
        // Fever模式結束
        setTimeout(() => {
            feverMode = false;
            laneGlowStates.fill(0);
            if (gameArea) {
                gameArea.classList.remove('fever-mode');
            }
        }, feverDuration);
    },
    
    // 更新Fever模式狀態
    updateFeverMode() {
        if (feverMode) {
            const elapsed = Date.now() - feverStartTime;
            if (elapsed >= feverDuration) {
                feverMode = false;
                laneGlowStates.fill(0);
            }
        }
    },
    
    // 檢查是否進入Fever模式（Combo達到100）
    checkFeverMode() {
        if (combo >= 100 && !feverMode) {
            this.triggerFeverMode();
        }
    },
    
    // 音效播放函數（可擴展）
    playPerfectSound() {
        // 這裡可以添加Perfect音效
        console.log('Perfect!');
    },
    
    playFailSound() {
        // 這裡可以添加失敗音效
        console.log('Fail!');
    },
    
    playFeverSound() {
        // 這裡可以添加Fever音效
        console.log('Fever Mode!');
    }
};

// 精緻音符特效管理器
const noteEffectManager = {
    particles: [],
    shockwaves: [], // 音浪衝擊圈
    comboLevel: 0, // Combo等級，影響特效強度
    
    // 更新Combo等級
    updateComboLevel(combo) {
        this.comboLevel = Math.floor(combo / 50); // 每50 Combo提升一級
    },
    
    // 金白閃光特效 - 擊中時radial擴散光暈 + 微粒散射
    createGoldenFlashEffect(x, y, intensity = 1.0) {
        const baseIntensity = Math.min(2.0, intensity + this.comboLevel * 0.3);
        
        // 主光暈擴散
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(i * Math.PI / 4) * 3 * baseIntensity,
                vy: Math.sin(i * Math.PI / 4) * 3 * baseIntensity,
                life: 1.0,
                decay: 0.02,
                size: 15 + i * 2,
                color: '#FAFAD2',
                type: 'goldenHalo',
                rotation: 0,
                rotationSpeed: 0,
                scale: 1.0,
                baseSize: 15 + i * 2
            });
        }
        
        // 微粒散射
        for (let i = 0; i < 20 * baseIntensity; i++) {
            this.particles.push({
                x: x + (Math.random() - 0.5) * 20,
                y: y + (Math.random() - 0.5) * 20,
                vx: (Math.random() - 0.5) * 8 * baseIntensity,
                vy: (Math.random() - 0.5) * 8 * baseIntensity,
                life: 1.0,
                decay: 0.015 + Math.random() * 0.01,
                size: Math.random() * 4 + 2,
                color: Math.random() > 0.5 ? '#FAFAD2' : '#F8F8FF',
                type: 'goldenSpark',
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.5,
                scale: 1.0
            });
        }
        
        // 音浪衝擊圈
        this.createShockwave(x, y, baseIntensity);
    },
    
    // 星爆亮片特效 - 播放短音符時炸開的微粒
    createStarBurstEffect(x, y, intensity = 1.0) {
        const baseIntensity = Math.min(2.0, intensity + this.comboLevel * 0.3);
        
        // 白色主體微粒
        for (let i = 0; i < 25 * baseIntensity; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(i * Math.PI / 12.5) * (6 + Math.random() * 4) * baseIntensity,
                vy: Math.sin(i * Math.PI / 12.5) * (6 + Math.random() * 4) * baseIntensity,
                life: 1.0,
                decay: 0.02 + Math.random() * 0.01,
                size: Math.random() * 5 + 3,
                color: '#FFFFFF',
                type: 'starBurst',
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.8,
                scale: 1.0
            });
        }
        
        // 半透明藍紅點
        for (let i = 0; i < 15 * baseIntensity; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 10 * baseIntensity,
                vy: (Math.random() - 0.5) * 10 * baseIntensity,
                life: 1.0,
                decay: 0.025,
                size: Math.random() * 3 + 1,
                color: Math.random() > 0.5 ? 'rgba(0, 150, 255, 0.8)' : 'rgba(255, 100, 100, 0.8)',
                type: 'colorSpark',
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.3,
                scale: 1.0
            });
        }
    },
    
    // 音浪衝擊圈特效
    createShockwave(x, y, intensity = 1.0) {
        this.shockwaves.push({
            x: x,
            y: y,
            radius: 0,
            maxRadius: 80 * intensity,
            life: 1.0,
            decay: 0.03,
            color: 'rgba(255, 255, 255, 0.6)',
            thickness: 3 * intensity
        });
    },
    
    // 水晶球波紋擴散特效 (F鍵)
    createCrystalBallEffect(x, y) {
        // 波紋效果
        for (let i = 0; i < 3; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: 0,
                vy: 0,
                life: 1.0,
                decay: 0.02,
                size: 20 + i * 15,
                color: '#A16EFF',
                type: 'wave',
                rotation: 0,
                rotationSpeed: 0,
                scale: 1.0
            });
        }
        // 散射粒子
        for (let i = 0; i < 12; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(i * Math.PI / 6) * 4,
                vy: Math.sin(i * Math.PI / 6) * 4,
                life: 1.0,
                decay: 0.02,
                size: Math.random() * 2 + 1,
                color: '#A16EFF',
                type: 'crystal',
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: 0.1,
                scale: 1.0
            });
        }
    },
    
    // 星流尾跡特效 (Space鍵)
    createStarTrailEffect(x, y) {
        for (let i = 0; i < 25; i++) {
            this.particles.push({
                x: x + (Math.random() - 0.5) * 40,
                y: y + (Math.random() - 0.5) * 40,
                vx: (Math.random() - 0.5) * 3,
                vy: (Math.random() - 0.5) * 3,
                life: 1.0,
                decay: 0.01 + Math.random() * 0.02,
                size: Math.random() * 4 + 2,
                color: '#FFD700',
                type: 'star',
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.2,
                scale: 1.0
            });
        }
    },
    
    // 爆破星芒特效 (J鍵)
    createStarBurstEffect(x, y) {
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(i * Math.PI / 10) * 8,
                vy: Math.sin(i * Math.PI / 10) * 8,
                life: 1.0,
                decay: 0.025,
                size: Math.random() * 5 + 3,
                color: '#FF8888',
                type: 'burst',
                rotation: i * Math.PI / 10,
                rotationSpeed: 0.2,
                scale: 1.0
            });
        }
    },
    
    // 螢光雷射斜閃特效 (K鍵)
    createLaserFlashEffect(x, y) {
        // 雷射線效果
        for (let i = 0; i < 5; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: 0,
                vy: 0,
                life: 1.0,
                decay: 0.03,
                size: 30 + i * 10,
                color: '#66FFFF',
                type: 'laser',
                rotation: (i * Math.PI / 4) + Math.PI / 8,
                rotationSpeed: 0,
                scale: 1.0
            });
        }
        // 電光粒子
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 1.0,
                decay: 0.02,
                size: Math.random() * 3 + 1,
                color: '#66FFFF',
                type: 'electric',
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.5,
                scale: 1.0
            });
        }
    },
    
    // 通用星塵爆開特效
    createStardustBurst(x, y, color = '#fff700') {
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 1.0,
                decay: 0.02 + Math.random() * 0.03,
                size: Math.random() * 4 + 2,
                color: color,
                type: 'stardust',
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.2,
                scale: 1.0
            });
        }
    },
    
    update() {
        // 更新Combo等級
        this.updateComboLevel(combo);
        
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vx *= 0.98;
            particle.vy *= 0.98;
            particle.life -= particle.decay;
            particle.rotation += particle.rotationSpeed;
            
            // 特殊效果更新
            if (particle.type === 'wave') {
                particle.size += 2;
            }
            if (particle.type === 'laser') {
                particle.scale = 1.0 + Math.sin(particle.life * 10) * 0.3;
            }
            if (particle.type === 'goldenHalo') {
                particle.size = particle.baseSize * (1 + (1 - particle.life) * 2);
            }
            
            return particle.life > 0;
        });
        
        // 更新音浪衝擊圈
        this.shockwaves = this.shockwaves.filter(shockwave => {
            shockwave.radius += 5;
            shockwave.life -= shockwave.decay;
            return shockwave.life > 0 && shockwave.radius < shockwave.maxRadius;
        });
    },
    
    draw(ctx) {
        // 繪製音浪衝擊圈
        this.shockwaves.forEach(shockwave => {
            ctx.save();
            ctx.globalAlpha = shockwave.life;
            ctx.strokeStyle = shockwave.color;
            ctx.lineWidth = shockwave.thickness;
            ctx.shadowColor = shockwave.color;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(shockwave.x, shockwave.y, shockwave.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        });
        
        this.particles.forEach(particle => {
            ctx.save();
            ctx.globalAlpha = particle.life;
            ctx.translate(particle.x, particle.y);
            ctx.rotate(particle.rotation);
            ctx.scale(particle.scale, particle.scale);
            
            ctx.fillStyle = particle.color;
            ctx.shadowColor = particle.color;
            ctx.shadowBlur = particle.size * 2;
            
            switch (particle.type) {
                case 'goldenHalo':
                    // 金白光暈
                    ctx.beginPath();
                    ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                case 'goldenSpark':
                    // 金白微粒
                    this.drawSpark(ctx, particle.size);
                    break;
                case 'starBurst':
                    // 星爆亮片
                    this.drawStarBurst(ctx, particle.size);
                    break;
                case 'colorSpark':
                    // 彩色微粒
                    ctx.beginPath();
                    ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                case 'ice':
                    // 冰晶形狀
                    this.drawIceCrystal(ctx, particle.size);
                    break;
                case 'wave':
                    // 波紋圓圈
                    ctx.strokeStyle = particle.color;
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
                    ctx.stroke();
                    break;
                case 'crystal':
                    // 水晶粒子
                    this.drawCrystal(ctx, particle.size);
                    break;
                case 'star':
                    // 星形粒子
                    this.drawStar(ctx, particle.size);
                    break;
                case 'burst':
                    // 星芒形狀
                    this.drawStarBurst(ctx, particle.size);
                    break;
                case 'laser':
                    // 雷射線
                    ctx.strokeStyle = particle.color;
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.moveTo(-particle.size, 0);
                    ctx.lineTo(particle.size, 0);
                    ctx.stroke();
                    break;
                case 'electric':
                    // 電光粒子
                    this.drawElectric(ctx, particle.size);
                    break;
                default:
                    // 默認星塵粒子
                    this.drawStardust(ctx, particle.size);
            }
            
            ctx.restore();
        });
    },
    
    // 繪製冰晶
    drawIceCrystal(ctx, size) {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            const x = Math.cos(angle) * size;
            const y = Math.sin(angle) * size;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
    },
    
    // 繪製水晶
    drawCrystal(ctx, size) {
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.lineTo(size * 0.5, -size * 0.5);
        ctx.lineTo(size, 0);
        ctx.lineTo(size * 0.5, size * 0.5);
        ctx.lineTo(0, size);
        ctx.lineTo(-size * 0.5, size * 0.5);
        ctx.lineTo(-size, 0);
        ctx.lineTo(-size * 0.5, -size * 0.5);
        ctx.closePath();
        ctx.fill();
    },
    
    // 繪製星形
    drawStar(ctx, size) {
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
            const angle = (i * Math.PI) / 5;
            const radius = i % 2 === 0 ? size : size * 0.5;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
    },
    
    // 繪製星芒
    drawStarBurst(ctx, size) {
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI) / 4;
            const x = Math.cos(angle) * size;
            const y = Math.sin(angle) * size;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
    },
    
    // 繪製電光
    drawElectric(ctx, size) {
        ctx.beginPath();
        ctx.moveTo(-size, -size);
        ctx.lineTo(size, size);
        ctx.moveTo(-size, size);
        ctx.lineTo(size, -size);
        ctx.strokeStyle = ctx.fillStyle;
        ctx.lineWidth = 2;
        ctx.stroke();
    },
    
    // 繪製星塵
    drawStardust(ctx, size) {
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.lineTo(size * 0.5, -size * 0.5);
        ctx.lineTo(size, 0);
        ctx.lineTo(size * 0.5, size * 0.5);
        ctx.lineTo(0, size);
        ctx.lineTo(-size * 0.5, size * 0.5);
        ctx.lineTo(-size, 0);
        ctx.lineTo(-size * 0.5, -size * 0.5);
        ctx.closePath();
        ctx.fill();
    },
    
    // 繪製金白微粒
    drawSpark(ctx, size) {
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.lineTo(size * 0.3, -size * 0.3);
        ctx.lineTo(size, 0);
        ctx.lineTo(size * 0.3, size * 0.3);
        ctx.lineTo(0, size);
        ctx.lineTo(-size * 0.3, size * 0.3);
        ctx.lineTo(-size, 0);
        ctx.lineTo(-size * 0.3, -size * 0.3);
        ctx.closePath();
        ctx.fill();
    }
};

function drawBackground(now) {
    if (!ctx || !canvas || !isFinite(canvas.width) || !isFinite(canvas.height)) return;
    
    // 深空背景 - 紫紅漸層與靛藍延展
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxRadius = Math.max(canvas.width, canvas.height) * 0.8;
    
    // 主背景漸層 - 靛藍延展
    const mainGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius);
    mainGradient.addColorStop(0, '#0D0E52'); // 深靛藍中心
    mainGradient.addColorStop(0.3, '#1C1C80'); // 靛藍延展
    mainGradient.addColorStop(0.7, '#2A1B3D'); // 深紫過渡
    mainGradient.addColorStop(1, '#000'); // 純黑邊緣
    
    ctx.fillStyle = mainGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 中央聚焦星雲 - 紫紅漸層
    const nebulaGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius * 0.6);
    nebulaGradient.addColorStop(0, '#8A2BE2'); // 亮紫中心
    nebulaGradient.addColorStop(0.4, '#6C2DC7'); // 紫紅過渡
    nebulaGradient.addColorStop(0.8, '#4A1B5A'); // 深紫外圍
    nebulaGradient.addColorStop(1, 'transparent'); // 透明邊緣
    
    ctx.save();
    let nebulaAlpha = 0.3 + deepSpaceManager.comboIntensity * 0.2; // Combo影響星雲亮度
    
    // Fever模式下的背景脈動
    if (feverMode) {
        const feverPulse = Math.sin(Date.now() * 0.01) * 0.2 + 0.8;
        nebulaAlpha *= feverPulse;
        
        // Fever模式下的額外光暈
        const feverGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius * 0.8);
        feverGradient.addColorStop(0, 'rgba(255, 215, 0, 0.3)'); // 金色光暈
        feverGradient.addColorStop(0.5, 'rgba(255, 215, 0, 0.1)');
        feverGradient.addColorStop(1, 'transparent');
        
        ctx.globalAlpha = feverPulse * 0.5;
        ctx.fillStyle = feverGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    ctx.globalAlpha = nebulaAlpha;
    ctx.fillStyle = nebulaGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    
    // 初始化深空管理器
    if (!deepSpaceManager.stars.length) {
        deepSpaceManager.init();
    }
    
    // 更新深空效果
    deepSpaceManager.update(16, currentTime, combo);
    
    // 繪製星雲粒子流動
    deepSpaceManager.nebulaParticles.forEach(particle => {
        ctx.save();
        ctx.globalAlpha = particle.opacity;
        
        // 星雲雜訊紋理
        const noiseGradient = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.size);
        noiseGradient.addColorStop(0, particle.color + '80');
        noiseGradient.addColorStop(0.7, particle.color + '40');
        noiseGradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = noiseGradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        
        // 流動動畫效果
        const flowOffset = Math.sin(particle.flow) * 5;
        ctx.globalAlpha = particle.opacity * 0.5;
        ctx.beginPath();
        ctx.arc(particle.x + flowOffset, particle.y + flowOffset, particle.size * 0.8, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    });
    
    // 繪製深空星點
    deepSpaceManager.stars.forEach(star => {
        const scale = 1000 / star.z;
        const x = (star.x - centerX) * scale + centerX;
        const y = (star.y - centerY) * scale + centerY;
        const size = star.size * scale;
        
        if (x > 0 && x < canvas.width && y > 0 && y < canvas.height && size > 0.3) {
            ctx.save();
            
            // 星點亮度受Combo影響
            const brightness = star.brightness * (1 + deepSpaceManager.comboIntensity * 0.5);
            ctx.globalAlpha = scale * brightness;
            
            ctx.fillStyle = star.color;
            ctx.shadowColor = star.color;
            ctx.shadowBlur = size * 4;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
            
            // 星點光暈
            ctx.globalAlpha = scale * brightness * 0.4;
            ctx.beginPath();
            ctx.arc(x, y, size * 2.5, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        }
    });
    
    // 節奏同步閃爍效果
    if (deepSpaceManager.rhythmFlash > 0) {
        ctx.save();
        ctx.globalAlpha = deepSpaceManager.rhythmFlash * 0.08;
        ctx.fillStyle = '#8A2BE2';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
    }
    
    // 中央聚焦光線效果
    const time = now * 0.001;
    ctx.save();
    ctx.globalAlpha = 0.03 + deepSpaceManager.comboIntensity * 0.02;
    for (let i = 0; i < 4; i++) {
        const angle = time * 0.3 + (i * Math.PI / 2);
        const x = centerX + Math.cos(angle) * 80;
        const y = centerY + Math.sin(angle) * 80;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 150);
        gradient.addColorStop(0, '#8A2BE2');
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.restore();
}

function drawNotes(now) {
    if (!ctx) return;
    const config = LEVEL_CONFIGS[selectedDifficulty];
    const noteSpeed = config.speed;
    const laneCount = laneManager.laneCount;
    const laneWidth = canvas.width / laneCount;
    
    notes.forEach((note, index) => {
        const noteY = (currentTime - note.time) * noteSpeed;
        const noteX = (note.lane + 0.5) * laneWidth;
        if (noteY > -50 && noteY < canvas.height + 50 && !note.hit && !note.missed) {
            // 長音符 - 宇宙能量光束
            if (note.duration && note.duration > 0) {
                const tailY = (currentTime - (note.time + note.duration)) * noteSpeed;
                
                // 獲取賽道配置
                const laneConfig = laneManager.getLaneConfig(note.lane);
                const laneColor = laneConfig.color;
                
                // 光束主體
                ctx.save();
                const beamGradient = ctx.createLinearGradient(noteX - 20, noteY, noteX + 20, noteY);
                beamGradient.addColorStop(0, `${laneColor}1A`);
                beamGradient.addColorStop(0.5, note.holdActive ? 'rgba(255, 247, 0, 0.8)' : `${laneColor}CC`);
                beamGradient.addColorStop(1, `${laneColor}1A`);
                ctx.fillStyle = beamGradient;
                ctx.shadowColor = note.holdActive ? '#fff700' : laneColor;
                ctx.shadowBlur = note.holdActive ? 30 : 20;
                ctx.fillRect(noteX - 20, tailY, 40, noteY - tailY);
                ctx.restore();
                
                // 光束邊緣發光
                ctx.save();
                ctx.strokeStyle = note.holdActive ? '#fff700' : laneColor;
                ctx.lineWidth = 4;
                ctx.shadowColor = note.holdActive ? '#fff700' : laneColor;
                ctx.shadowBlur = note.holdActive ? 25 : 15;
                ctx.beginPath();
                ctx.moveTo(noteX - 18, noteY);
                ctx.lineTo(noteX - 18, tailY);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(noteX + 18, noteY);
                ctx.lineTo(noteX + 18, tailY);
                ctx.stroke();
                ctx.restore();
                
                // 頭部能量球
                ctx.save();
                // 外層光暈
                const headGradient = ctx.createRadialGradient(noteX, noteY, 0, noteX, noteY, 40);
                headGradient.addColorStop(0, note.holdActive ? 'rgba(255, 247, 0, 0.8)' : `${laneColor}CC`);
                headGradient.addColorStop(0.7, note.holdActive ? 'rgba(255, 247, 0, 0.3)' : `${laneColor}4D`);
                headGradient.addColorStop(1, 'transparent');
                ctx.fillStyle = headGradient;
                ctx.beginPath();
                ctx.arc(noteX, noteY, 40, 0, Math.PI * 2);
                ctx.fill();
                
                // 核心
                ctx.beginPath();
                ctx.arc(noteX, noteY, 24, 0, Math.PI * 2);
                ctx.fillStyle = note.holdActive ? '#fff700' : laneColor;
                ctx.shadowColor = note.holdActive ? '#fff700' : laneColor;
                ctx.shadowBlur = 25;
                ctx.fill();
                
                // 內核
                ctx.beginPath();
                ctx.arc(noteX, noteY, 12, 0, Math.PI * 2);
                ctx.fillStyle = '#fff';
                ctx.shadowColor = '#fff';
                ctx.shadowBlur = 15;
                ctx.fill();
                ctx.restore();
                
                // 尾部能量球
                ctx.save();
                const tailGradient = ctx.createRadialGradient(noteX, tailY, 0, noteX, tailY, 25);
                tailGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
                tailGradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.3)');
                tailGradient.addColorStop(1, 'transparent');
                ctx.fillStyle = tailGradient;
                ctx.beginPath();
                ctx.arc(noteX, tailY, 25, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.beginPath();
                ctx.arc(noteX, tailY, 18, 0, Math.PI * 2);
                ctx.fillStyle = '#fff';
                ctx.shadowColor = '#fff';
                ctx.shadowBlur = 12;
                ctx.fill();
                ctx.restore();
            } else {
                // 短音符 - 銀河能量球效果
                ctx.save();
                
                // 獲取賽道配置
                const laneConfig = laneManager.getLaneConfig(note.lane);
                const laneColor = laneConfig.color;
                
                // 軌跡效果 - 從銀河深處飛來
                const trailLength = 80;
                const trailGradient = ctx.createLinearGradient(noteX, noteY - trailLength, noteX, noteY);
                trailGradient.addColorStop(0, `${laneColor}00`);
                trailGradient.addColorStop(0.3, `${laneColor}4D`);
                trailGradient.addColorStop(1, `${laneColor}CC`);
                ctx.strokeStyle = trailGradient;
                ctx.lineWidth = 6;
                ctx.lineCap = 'round';
                ctx.shadowColor = laneColor;
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.moveTo(noteX, noteY - trailLength);
                ctx.lineTo(noteX, noteY - 20);
                ctx.stroke();
                
                // 外層光暈
                const gradient = ctx.createRadialGradient(noteX, noteY, 0, noteX, noteY, 45);
                gradient.addColorStop(0, `${laneColor}E6`);
                gradient.addColorStop(0.6, `${laneColor}66`);
                gradient.addColorStop(1, 'transparent');
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(noteX, noteY, 45, 0, Math.PI * 2);
                ctx.fill();
                
                // 核心
                ctx.beginPath();
                ctx.arc(noteX, noteY, 22, 0, Math.PI * 2);
                ctx.fillStyle = laneColor;
                ctx.shadowColor = laneColor;
                ctx.shadowBlur = 25;
                ctx.fill();
                
                // 內核
                ctx.beginPath();
                ctx.arc(noteX, noteY, 12, 0, Math.PI * 2);
                ctx.fillStyle = '#fff';
                ctx.shadowColor = '#fff';
                ctx.shadowBlur = 20;
                ctx.fill();
                
                // 星塵粒子效果
                for (let i = 0; i < 3; i++) {
                    const angle = (Date.now() * 0.001 + i * Math.PI * 2 / 3) % (Math.PI * 2);
                    const particleX = noteX + Math.cos(angle) * 35;
                    const particleY = noteY + Math.sin(angle) * 35;
                    ctx.beginPath();
                    ctx.arc(particleX, particleY, 2, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                    ctx.fill();
                }
                
                ctx.restore();
            }
        }
        // 動畫：命中淡出/縮小、Miss 慢速消散
        if (note.animating === 'fade') {
            // 需重新定義 noteX, noteY
            const noteX = (note.lane + 0.5) * laneWidth;
            const noteY = (currentTime - note.time) * noteSpeed;
            ctx.save();
            ctx.globalAlpha = 1 - ((currentTime - note.time) / 0.5);
            ctx.beginPath();
            ctx.arc(noteX, noteY, 22 * (1 - (currentTime - note.time) / 0.5), 0, Math.PI * 2);
            ctx.fillStyle = '#fff700';
            ctx.shadowColor = '#fff700';
            ctx.shadowBlur = 16;
            ctx.fill();
            ctx.restore();
            if ((currentTime - note.time) > 0.5) note.animating = null;
        }
        if (note.animating === 'miss') {
            const noteX = (note.lane + 0.5) * laneWidth;
            const noteY = (currentTime - note.time) * noteSpeed;
            ctx.save();
            
            // Miss狀態 - 轉為灰色 + 慢速消散
            const missTime = (currentTime - note.time);
            const fadeDuration = 2.0; // 2秒慢速消散
            ctx.globalAlpha = Math.max(0, 1 - (missTime / fadeDuration));
            
            // 灰色音符
            ctx.beginPath();
            ctx.arc(noteX, noteY, 24 * (1 - missTime / fadeDuration * 0.5), 0, Math.PI * 2);
            ctx.fillStyle = '#666666';
            ctx.shadowColor = '#666666';
            ctx.shadowBlur = 12;
            ctx.fill();
            
            // 灰色光暈
            ctx.globalAlpha = Math.max(0, 0.3 - (missTime / fadeDuration * 0.3));
            ctx.beginPath();
            ctx.arc(noteX, noteY, 40 * (1 - missTime / fadeDuration * 0.3), 0, Math.PI * 2);
            ctx.fillStyle = '#666666';
            ctx.fill();
            
            ctx.restore();
            if (missTime > fadeDuration) note.animating = null;
        }
    });
    
    // 音符賽道層 - 使用賽道管理器
    laneManager.drawLanes(ctx, canvas);
    
    // 判定線 - 太空能量屏障
    const judgeLineY = canvas.height - 100;
    ctx.save();
    
    // 主判定線
    ctx.strokeStyle = '#0ff';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#0ff';
    ctx.shadowBlur = 15;
    ctx.setLineDash([10, 5]);
    ctx.beginPath();
    ctx.moveTo(0, judgeLineY);
    ctx.lineTo(canvas.width, judgeLineY);
    ctx.stroke();
    
    // 能量屏障效果
    const barrierGradient = ctx.createLinearGradient(0, judgeLineY - 20, 0, judgeLineY + 20);
    barrierGradient.addColorStop(0, 'rgba(0, 255, 255, 0.1)');
    barrierGradient.addColorStop(0.5, 'rgba(0, 255, 255, 0.3)');
    barrierGradient.addColorStop(1, 'rgba(0, 255, 255, 0.1)');
    ctx.fillStyle = barrierGradient;
    ctx.fillRect(0, judgeLineY - 20, canvas.width, 40);
    
    // 邊緣發光
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.6)';
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(0, judgeLineY - 15);
    ctx.lineTo(canvas.width, judgeLineY - 15);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, judgeLineY + 15);
    ctx.lineTo(canvas.width, judgeLineY + 15);
    ctx.stroke();
    
    ctx.restore();
}

// ===============================
// 判定系統 (Judgment System)
// ===============================
function judgeNote(lane) {
    const config = LEVEL_CONFIGS[selectedDifficulty];
    const noteSpeed = config.speed;
    const judgeLineY = canvas.height - 100;
    // 判定時間誤差（毫秒）
    const judgeWindow = config.judgeWindow || 200;
    let hitNote = null;
    let hitIndex = -1;
    for (let i = 0; i < notes.length; i++) {
        const note = notes[i];
        if (note.lane === lane && !note.hit && !note.missed) {
            const noteY = (currentTime - note.time) * noteSpeed;
            const distance = Math.abs(noteY - judgeLineY);
            if (distance <= (noteSpeed * (judgeWindow/1000))) { // 動態判定
                if (!hitNote || distance < Math.abs(hitNote.y - judgeLineY)) {
                    hitNote = { ...note, y: noteY };
                    hitIndex = i;
                }
            }
        }
    }
    if (hitNote) {
        const noteY = hitNote.y;
        const distance = Math.abs(noteY - judgeLineY);
        let judgment = '';
        if (distance <= noteSpeed * (config.judgeWindow/1000) * (100/ judgeWindow)) { // 最寬容度的1/3
            judgment = 'PERFECT';
            score += 100;
            combo++;
            maxCombo = Math.max(maxCombo, combo);
            showComboEffect(combo);
            
            // 完美擊中 - 金白閃光特效
            const judgeLineY = canvas.height - 100;
            const laneCount = laneManager.laneCount;
            const laneWidth = canvas.width / laneCount;
            const noteX = (lane + 0.5) * laneWidth;
            const intensity = Math.min(2.0, 1.0 + combo / 100); // Combo破百後強化特效
            
            noteEffectManager.createGoldenFlashEffect(noteX, judgeLineY, intensity);
            
            // 觸發Perfect動態互動
            dynamicInteractionManager.triggerPerfectEffect(lane);
            
            // Canvas閃爍效果
            if (canvas) {
                canvas.classList.add('hit-flash');
                setTimeout(() => canvas.classList.remove('hit-flash'), 200);
            }
        } else if (distance <= noteSpeed * (config.judgeWindow/1000) * (200/ judgeWindow)) {
            judgment = 'GOOD';
            score += 50;
            combo++;
            maxCombo = Math.max(maxCombo, combo);
            showComboEffect(combo);
            
            // 良好擊中 - 星爆亮片特效
            const judgeLineY = canvas.height - 100;
            const laneCount = laneManager.laneCount;
            const laneWidth = canvas.width / laneCount;
            const noteX = (lane + 0.5) * laneWidth;
            const intensity = Math.min(1.5, 0.8 + combo / 150);
            
            noteEffectManager.createStarBurstEffect(noteX, judgeLineY, intensity);
        } else if (distance <= noteSpeed * (config.judgeWindow/1000)) {
            judgment = 'BAD';
            score += 10;
            // Combo 不變
        }
        notes.splice(hitIndex, 1); // 音符消失
        hitCount++;
        updateScoreDisplay();
        updateComboDisplay();
        updateKeyHints();
        console.log(`判定: ${judgment}, 距離: ${distance.toFixed(1)}, Combo: ${combo}`);
    } else {
        // Miss - 不扣分，只重置combo
        missCount++;
        combo = 0;
        resetCombo();
        showMissEffect();
        
        // 觸發Miss動態互動
        dynamicInteractionManager.triggerMissEffect(lane);
        
        updateScoreDisplay();
        updateComboDisplay();
        updateKeyHints();
        console.log('Miss!');
    }
}

function updateComboForPolyphony(group) {
    const groupNotes = notes.filter(n => n.group === group);
    const allHit = groupNotes.every(n => n.hit);
    
    if (allHit) {
        combo++;
        maxCombo = Math.max(maxCombo, combo);
        showComboEffect(combo);
        updateComboDisplay();
    }
}

function resetCombo() {
    if (combo > 0) {
        console.log(`Combo 重置: ${combo}`);
        combo = 0;
        missBufferCount = 0;
        updateComboDisplay();
    }
}

function showMissBuffer() {
    console.log(`容錯觸發: ${missBufferCount}/${LEVEL_CONFIGS[selectedDifficulty].missBuffer}`);
    // 可以在這裡添加視覺效果
}

// 命中音符時，讓音符立即消失
function hitNote(index, type) {
    if (index >= 0 && index < notes.length) {
        notes.splice(index, 1); // 立即移除音符
        hitCount++;
        if (type === 'perfect') {
            score += 100;
        } else if (type === 'great') {
            score += 80;
        } else if (type === 'good') {
            score += 50;
        }
        updateScoreDisplay();
    }
}

function showComboEffect(combo) {
    if (comboContainer) {
        const effect = document.createElement('div');
        effect.className = 'combo-effect';
        effect.textContent = combo;
        
        // 為高Combo添加特殊效果
        if (combo >= 100) {
            effect.setAttribute('data-combo', combo.toString());
        }
        
        comboContainer.appendChild(effect);
        
        setTimeout(() => {
            if (effect.parentNode) {
                effect.parentNode.removeChild(effect);
            }
        }, 700);
    }
}

function showMissEffect() {
    if (comboContainer) {
        const effect = document.createElement('div');
        effect.className = 'miss-effect';
        effect.textContent = 'Miss!';
        comboContainer.appendChild(effect);
        setTimeout(() => effect.remove(), 600);
    }
}

function missNote(isWrongKey = false) {
    showMissEffect();
    missCount++;
    if (!isWrongKey) {
        resetCombo();
    }
    console.log(`Miss: ${missCount}`);
    setMissBufferCount(missBufferCount);
}

// ===============================
// 自動 Miss 檢查 (Auto Miss Check)
// ===============================
function startAutoMissCheck() {
    if (autoMissCheckId) clearInterval(autoMissCheckId);
    autoMissCheckId = setInterval(() => {
        if (!gameStarted || gamePaused || gameEnded) return;
        const config = LEVEL_CONFIGS[selectedDifficulty];
        const noteSpeed = config.speed;
        const judgeLineY = canvas.height - 100;
        const missThreshold = 100;
        notes.forEach((note, index) => {
            if (!note.hit && !note.missed) {
                // 新公式：音符下落
                const noteY = (currentTime - note.time) * noteSpeed;
                if (noteY > judgeLineY + missThreshold) {
                    note.missed = true;
    missNote();
                }
            }
        });
        const remainingNotes = notes.filter(n => !n.hit && !n.missed);
        if (remainingNotes.length === 0 && currentTime > 5) {
            setTimeout(() => endGame(), 1000);
        }
    }, 100);
}

function stopAutoMissCheck() {
    if (autoMissCheckId) {
        clearInterval(autoMissCheckId);
        autoMissCheckId = null;
    }
}

// ===============================
// 難度檢查與設定 (Difficulty Check & Setting)
// ===============================
// 難度星星與 tooltip 渲染
function renderDifficultyStars() {
    if (!difficultyBtns) return;
    difficultyBtns.forEach(btn => {
        const diff = btn.dataset.difficulty;
        const config = LEVEL_CONFIGS[diff];
        if (!config) return;
        let stars = '';
        // 根據難度等級顯示對應數量的星星
        for (let i = 0; i < config.stars; i++) {
            if (config.locked) {
                stars += '<span class="star star-locked">⭐</span>';
            } else {
                stars += '<span class="star">⭐</span>';
            }
        }
        const starDiv = btn.querySelector('.difficulty-stars');
        if (starDiv) starDiv.innerHTML = stars;
        // tooltip
        let tooltip = btn.querySelector('.tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            btn.appendChild(tooltip);
        }
        tooltip.textContent = `${config.enName}（${config.name}）\n${config.desc}\n特殊規則: ${config.specialRules}`;
    });
}

// Lv.6 解鎖條件：通關3首 Lv.3 以上
function checkFinalUnlock() {
    const hiddenBtn = document.querySelector('.hidden-difficulty');
    if (!hiddenBtn) return;
    // 假設 localStorage 記錄 Lv.3+ 通關次數
    let cleared = parseInt(localStorage.getItem('normalCleared') || '0', 10);
    if (cleared >= 3) {
        hiddenBtn.disabled = false;
        hiddenBtn.classList.add('unlocked-final');
        LEVEL_CONFIGS.lv6.locked = false;
    } else {
        hiddenBtn.disabled = true;
        hiddenBtn.classList.remove('unlocked-final');
        LEVEL_CONFIGS.lv6.locked = true;
    }
    renderDifficultyStars();
}

// 難度選擇動畫
function setDifficulty(diff) {
    if (!LEVEL_CONFIGS[diff]) {
        showAudioError('難度參數錯誤，已自動切回新手難度');
        selectedDifficulty = 'lv1';
        diff = 'lv1';
    } else {
        selectedDifficulty = diff;
    }
    difficultyBtns.forEach(btn => {
        btn.classList.remove('active');
    });
    const activeBtn = document.querySelector(`[data-difficulty="${diff}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
        activeBtn.style.animation = 'scale-in-glow 0.4s';
        setTimeout(()=>{activeBtn.style.animation='';},400);
    }
    renderDifficultyStars();
    updateStartBtnState();
    updateMissBufferUI();
    updateKeyHints(); // 更新按鍵提示
}

// scale-in+glow動畫
const style = document.createElement('style');
style.innerHTML = `@keyframes scale-in-glow {0%{transform:scale(0.7);box-shadow:0 0 0 #ffe066;}60%{transform:scale(1.18);box-shadow:0 0 32px #ffe066;}100%{transform:scale(1.12);box-shadow:0 0 24px #ffe066cc;}}`;
document.head.appendChild(style);

// missBuffer UI
function updateMissBufferUI() {
    const config = LEVEL_CONFIGS[selectedDifficulty];
    const missBufferDiv = document.getElementById('miss-buffer-ui');
    if (!config || !missBufferDiv) {
        missBufferDiv.style.display = 'none';
        return;
    }
    missBufferDiv.textContent = `剩餘容錯次數：${config.missBuffer}`;
    missBufferDiv.classList.add('visible');
}
function setMissBufferCount(count) {
    const missBufferDiv = document.getElementById('miss-buffer-ui');
    if (missBufferDiv) {
        missBufferDiv.textContent = `剩餘容錯次數：${count}`;
    }
}

// 遊戲開始時初始化 missBuffer
function startGame() {
    if (gameStarted || isCountingDown) return;
    if (!selectedSong || !selectedDifficulty) {
        showToast('請先選擇歌曲與難度');
        return;
    }
    showCountdown(realStartGame);
    const config = LEVEL_CONFIGS[selectedDifficulty];
    missBufferCount = config ? config.missBuffer : 0;
    setMissBufferCount(missBufferCount);
}

// ===============================
// 遊戲結束 (Game End)
// ===============================
function endGame() {
    if (gameEnded) return;
    
    gameEnded = true;
    gameStarted = false;
    
    stopAutoMissCheck();
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    
    // 清理音符特效
    noteEffectManager.particles = [];
    
    audioVisualizer.stop();
    audioManager.stopAll();
    
    // 計算成績
    const totalNotes = notes.length;
    const accuracy = totalNotes > 0 ? (hitCount / totalNotes * 100).toFixed(1) : 0;
    const grade = calculateGrade(accuracy, maxCombo);
    
    // 更新結算畫面
    finalScore.textContent = `分數: ${score.toLocaleString()}`;
    finalGrade.textContent = `等級: ${grade}`;
    
    // 增加遊戲次數
    gamePlayCount++;
    checkFinalUnlock();
    
    showScreen('result');
    console.log(`遊戲結束 - 分數: ${score}, 等級: ${grade}, 準確率: ${accuracy}%`);
}

function calculateGrade(accuracy, maxCombo) {
    if (accuracy >= 95 && maxCombo >= 50) return 'SSS';
    if (accuracy >= 90 && maxCombo >= 30) return 'SS';
    if (accuracy >= 85 && maxCombo >= 20) return 'S';
    if (accuracy >= 80 && maxCombo >= 15) return 'A';
    if (accuracy >= 70 && maxCombo >= 10) return 'B';
    if (accuracy >= 60 && maxCombo >= 5) return 'C';
    return 'D';
}

// ===============================
// UI 更新函數 (UI Update Functions)
// ===============================
function updateScoreDisplay() {
    if (scoreDisplay) {
        scoreDisplay.textContent = `分數: ${score.toLocaleString()}`;
    }
}

function updateComboDisplay() {
    if (comboDisplay) {
        comboDisplay.textContent = combo;
        if (combo > 0) {
            comboDisplay.style.animation = 'none';
            comboDisplay.offsetHeight; // 觸發重繪
            comboDisplay.style.animation = 'combo-pulse 0.4s ease-out';
        }
    }
}

function updateKeyHints() {
    if (!keyHints) return;
    keyHints.innerHTML = '';
    // 根據當前難度獲取按鍵配置
    let currentKeys = ['D', 'F', 'J', 'K']; // 預設4鍵
    if (selectedDifficulty && LEVEL_CONFIGS[selectedDifficulty]) {
        currentKeys = LEVEL_CONFIGS[selectedDifficulty].keys;
    }
    console.log('[updateKeyHints] keys:', currentKeys); // debug
    currentKeys.forEach((key, index) => {
        const keyElement = document.createElement('div');
        keyElement.className = 'key';
        if (key === ' ' || (typeof key === 'string' && key.toUpperCase() === 'SPACE')) {
            keyElement.textContent = 'SPACE';
            keyElement.dataset.key = ' ';
            keyElement.style.minWidth = '80px';
            keyElement.style.letterSpacing = '2px';
        } else {
            keyElement.textContent = key;
            keyElement.dataset.key = key;
        }
        keyHints.appendChild(keyElement);
    });
}

function updateStartBtnState() {
    if (startBtn) {
        const canStart = selectedSong && selectedDifficulty;
        startBtn.disabled = !canStart;
        
        if (canStart) {
            startBtn.classList.remove('disabled');
        } else {
            startBtn.classList.add('disabled');
        }
    }
}

// ===============================
// 工具函數 (Utility Functions)
// ===============================
function showToast(msg) {
    console.log('Toast:', msg);
    
    // 創建或獲取 toast 元素
    let toast = document.getElementById('toast-message');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast-message';
        toast.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            color: #fff;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 16px;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
        `;
        document.body.appendChild(toast);
    }
    
    toast.textContent = msg;
    toast.style.opacity = '1';
    
    // 3秒後自動隱藏
    setTimeout(() => {
        toast.style.opacity = '0';
    }, 3000);
}

function unlockAudio() {
    if (audioUnlocked) return;
    
    console.log('解鎖音訊...');
    audioUnlocked = true;
    
    const mask = document.getElementById('unlock-audio-mask');
    if (mask) {
        mask.style.display = 'none';
    }
    
    // 播放背景音樂
        audioManager.playBackground();
    
    console.log('音訊已解鎖');
}

function showAudioError(msg) {
    let errorMsg = document.getElementById('audio-error-msg');
    if (!errorMsg) {
        errorMsg = document.createElement('div');
        errorMsg.id = 'audio-error-msg';
        errorMsg.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(255, 0, 0, 0.9);
            color: #fff;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 10001;
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
            max-width: 80%;
            text-align: center;
        `;
        document.body.appendChild(errorMsg);
    }
    
    errorMsg.textContent = msg;
    errorMsg.style.display = 'block';
    errorMsg.style.opacity = '1';
    setTimeout(() => { 
        errorMsg.style.opacity = '0'; 
        setTimeout(() => {
            errorMsg.style.display = 'none';
        }, 300);
    }, 3000);
    console.error('音訊錯誤:', msg);
}

function hideAudioError() {
    const errorMsg = document.getElementById('audio-error-msg');
    if (errorMsg) {
        errorMsg.style.display = 'none';
    }
}

// 工具函式：切換顯示/隱藏
function toggleDisplay(el, show) {
    if (!el) return;
    el.style.display = show ? '' : 'none';
}

// 支援 song-card 鍵盤操作
if (songCards) {
    songCards.forEach(card => {
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
}

// 支援 difficulty-btn 鍵盤操作
if (difficultyBtns) {
    difficultyBtns.forEach(btn => {
        btn.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
    });
});
}

// 音量控制 UI
let volume = 1;
const volumeSlider = document.createElement('input');
volumeSlider.type = 'range';
volumeSlider.min = 0;
volumeSlider.max = 1;
volumeSlider.step = 0.01;
volumeSlider.value = 1;
volumeSlider.style.position = 'absolute';
volumeSlider.style.top = '1rem';
volumeSlider.style.left = '1rem';
volumeSlider.style.zIndex = 10000;
volumeSlider.title = '音量';
document.body.appendChild(volumeSlider);
volumeSlider.addEventListener('input', function() {
    volume = parseFloat(this.value);
    if (audioManager.audio) audioManager.audio.volume = volume;
});

// 遊戲說明 modal
const helpBtn = document.getElementById('help-btn');
const helpModal = document.createElement('div');
helpModal.id = 'help-modal';
helpModal.innerHTML = `<div id="help-modal-content"><button id="help-modal-close">&times;</button><h2>遊戲說明</h2><ul><li>選擇歌曲與難度後，點擊「開始遊戲」或按 Enter 鍵。</li><li>依畫面提示按下 D F 空白 J K 鍵擊打音符。</li><li>連續擊中可獲得 Combo，失誤會中斷。</li><li>終極幻想難度需玩三次才解鎖。</li><li>可按 Esc 暫停/繼續，左上角可調整音量。</li></ul></div>`;
document.body.appendChild(helpModal);
helpBtn.addEventListener('click', () => helpModal.classList.add('active'));
document.getElementById('help-modal-close').addEventListener('click', () => helpModal.classList.remove('active'));
helpModal.addEventListener('click', e => { if (e.target === helpModal) helpModal.classList.remove('active'); });

// 進入歌曲時顯示難度選擇
function showDifficultySelect() {
    const diffSelect = document.querySelector('.difficulty-select');
    if (diffSelect) diffSelect.style.display = '';
}
// 歌曲選擇後呼叫 showDifficultySelect();

// 譜面、下落速度、keyCount 根據難度自動調整，已在 generateNotes、drawNotes、KEY_LIST 等處理

// 初始化
window.addEventListener('DOMContentLoaded', function() {
    console.log('DOM 載入完成，初始化遊戲...');
    
    // 初始化 DOM 元素
    canvas = document.getElementById('game-canvas');
    ctx = canvas ? canvas.getContext('2d') : null;
    scoreDisplay = document.getElementById('score-display');
    comboDisplay = document.getElementById('combo-display');
    timerDisplay = document.getElementById('timer-display');
    keyHints = document.getElementById('key-hints');
    comboContainer = document.getElementById('combo-container');
    finalScore = document.getElementById('final-score');
    finalGrade = document.getElementById('final-grade');
    restartBtn = document.getElementById('restart-btn');
    startBtn = document.getElementById('start-btn');
    difficultyBtns = document.querySelectorAll('.difficulty-btn');
    songCards = document.querySelectorAll('.song-card');
    backBtn = document.getElementById('back-btn');
    selectArea = document.getElementById('select-area');
    resultScreen = document.getElementById('result-screen');
    gameArea = document.getElementById('game-area');
    
    // 檢查 DOM 元素是否正確載入
    console.log('DOM 元素檢查:', {
        canvas: !!canvas,
        startBtn: !!startBtn,
        selectArea: !!selectArea,
        gameArea: !!gameArea,
        resultScreen: !!resultScreen,
        difficultyBtns: difficultyBtns.length,
        songCards: songCards.length
    });
    
    // 初始化管理器
    particleManager.init();
    audioVisualizer.init();
    
    // 初始化深空效果
    if (canvas) {
        deepSpaceManager.init();
    }
    
    // 初始化賽道管理器
    laneManager.setLaneCount(5); // 預設5條賽道
    
    // 設定預設難度並同步 UI
    if (!selectedDifficulty || !LEVEL_CONFIGS[selectedDifficulty]) {
        selectedDifficulty = 'lv1';
        setDifficulty('lv1');
        console.log('設定預設難度:', selectedDifficulty);
    }
    
    // 檢查終極幻想難度
    checkFinalUnlock();
    
    // 音訊解鎖遮罩事件
    const audioMask = document.getElementById('unlock-audio-mask');
    if (audioMask) {
        audioMask.addEventListener('click', unlockAudio);
    }
    
    // 歌曲選擇事件
    if (songCards) {
        songCards.forEach(card => {
            card.addEventListener('click', function() {
                songCards.forEach(c => c.classList.remove('active'));
                this.classList.add('active');
                selectedSong = this.dataset.song;
                // 播放預覽前檢查音訊已解鎖
                if (audioUnlocked) {
                    audioManager.playPreview(selectedSong.replace('.mp3', ''));
                }
                updateStartBtnState();
                updateKeyHints(); // 更新按鍵提示
                console.log(`選擇歌曲: ${selectedSong}`);
            });
        });
    }
    
    // 難度選擇事件
    if (difficultyBtns) {
        difficultyBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const difficulty = this.dataset.difficulty;
                setDifficulty(difficulty);
            });
        });
    }
    
    // 開始按鈕事件
    if (startBtn) {
        startBtn.addEventListener('click', function() {
            console.log('開始按鈕被點擊');
            startGame();
        });
    } else {
        console.error('開始按鈕未找到！');
    }
    
    // 重新開始按鈕事件
    if (restartBtn) {
        restartBtn.addEventListener('click', function() {
            showScreen('select');
            audioManager.resumeBackground();
        });
    }
    
    // 返回主選單按鈕事件
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            showScreen('select');
            audioManager.resumeBackground();
        });
    }
    
    // 鍵盤事件
    document.addEventListener('keydown', function(e) {
        if (!gameStarted || gamePaused || gameEnded) return;
        
        const key = e.key.toUpperCase();
        
        // 根據當前難度獲取按鍵配置
        let currentKeys = ['D', 'F', 'J', 'K']; // 預設4鍵
        if (selectedDifficulty && LEVEL_CONFIGS[selectedDifficulty]) {
            currentKeys = LEVEL_CONFIGS[selectedDifficulty].keys;
        }
        
        const keyIndex = currentKeys.indexOf(key);
        
        if (keyIndex !== -1) {
            e.preventDefault();
            
            // 更新按鍵提示
            const keyElement = document.querySelector(`[data-key="${key}"]`);
            if (keyElement) {
                keyElement.classList.add('active');
                setTimeout(() => keyElement.classList.remove('active'), 100);
            }
            
            // 長音符頭部判定
            if (!holdKeyLane) {
                const judgeLineY = canvas.height - 100;
                const config = LEVEL_CONFIGS[selectedDifficulty];
                const noteSpeed = config.speed;
                let best = null, bestIdx = -1, minDist = 9999;
                for (let i = 0; i < notes.length; i++) {
                    const note = notes[i];
                    if (note.lane === keyIndex && !note.hit && !note.missed && note.duration > 0) {
                        const noteY = (currentTime - note.time) * noteSpeed;
                        const dist = Math.abs(noteY - judgeLineY);
                        if (dist < 40 && dist < minDist) {
                            best = note;
                            bestIdx = i;
                            minDist = dist;
                        }
                    }
                }
                if (best) {
                    best.holdActive = true;
                    holdKeyLane = keyIndex;
                    holdKeyNote = best;
                    holdKeyStartTime = currentTime;
                    // 動畫效果
                    best.animating = 'hit';
                    return;
                }
            }
            // 短音符判定
            judgeNote(keyIndex);
        }
    });
    document.addEventListener('keyup', function(e) {
        if (!gameStarted || gamePaused || gameEnded) return;
        const key = e.key.toUpperCase();
        
        // 根據當前難度獲取按鍵配置
        let currentKeys = ['D', 'F', 'J', 'K']; // 預設4鍵
        if (selectedDifficulty && LEVEL_CONFIGS[selectedDifficulty]) {
            currentKeys = LEVEL_CONFIGS[selectedDifficulty].keys;
        }
        
        const keyIndex = currentKeys.indexOf(key);
        if (keyIndex !== -1 && holdKeyLane === keyIndex && holdKeyNote) {
            const judgeLineY = canvas.height - 100;
            const noteSpeed = LEVEL_CONFIGS[selectedDifficulty].speed;
            const tailY = (currentTime - (holdKeyNote.time + holdKeyNote.duration)) * noteSpeed;
            // 尾部過線判定
            if (Math.abs(tailY - judgeLineY) < 40) {
                holdKeyNote.holdHit = true;
                holdKeyNote.hit = true;
                holdKeyNote.animating = 'fade';
                score += 150;
                combo++;
                maxCombo = Math.max(maxCombo, combo);
                updateScoreDisplay();
                updateComboDisplay();
            } else {
                // Miss
                holdKeyNote.missed = true;
                holdKeyNote.animating = 'miss';
                resetCombo();
                showMissEffect();
                
                // 觸發長按斷開特效
                dynamicInteractionManager.triggerHoldBreakEffect();
            }
            holdKeyNote.holdActive = false;
            holdKeyLane = null;
            holdKeyNote = null;
            holdKeyStartTime = null;
        }
    });
    
    // 遊戲暫停功能（Esc）
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (gameStarted && !gameEnded) {
                gamePaused = !gamePaused;
                if (gamePaused) {
                    audioManager.audio && audioManager.audio.pause();
    } else {
                    audioManager.audio && audioManager.audio.play();
                }
                showToast(gamePaused ? '遊戲已暫停（再按 Esc 恢復）' : '遊戲繼續');
            }
        }
    });
    
    // 視窗大小改變事件
    window.addEventListener('resize', function() {
        if (gameStarted && !gameEnded) {
            resizeCanvas();
        }
    });
    
    // 初始化畫面
    console.log('準備顯示選擇畫面');
    showScreen('select');
    updateStartBtnState();
    updateKeyHints(); // 更新按鍵提示
    renderDifficultyStars(); // 確保初始化時呼叫
    
    console.log('遊戲初始化完成！');
});

// 通關 normal 以上難度時 localStorage.normalCleared++
function onSongClear() {
    const config = LEVEL_CONFIGS[selectedDifficulty];
    if (config && config.stars >= 3) {
        let cleared = parseInt(localStorage.getItem('normalCleared') || '0', 10);
        localStorage.setItem('normalCleared', cleared + 1);
        checkFinalUnlock();
    }
}

// 關閉網頁時自動通知伺服器關閉
window.addEventListener('beforeunload', function() {
    if (navigator.sendBeacon) {
        navigator.sendBeacon('/shutdown');
    } else {
        fetch('/shutdown', {method: 'POST', keepalive: true}).catch(()=>{});
    }
});