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
        // 增加粒子數量
        const particleCount = Math.min(250, Math.floor(window.innerWidth * window.innerHeight / 5000));
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.7, // 稍微加快移動速度
                vy: (Math.random() - 0.5) * 0.7,
                size: Math.random() * 4 + 2, // 粒子變大
                opacity: Math.random() * 0.6 + 0.4, // 更亮
                color: ['#fff', '#0ff', '#f0f', '#ff6f91', '#fff700'][Math.floor(Math.random() * 5)]
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
            this.ctx.shadowBlur = 24; // 增強發光效果
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
        bgm: './Vibe_Coding組_王祐昇_運行程式及遊戲素材/audio/DRIVE.mp3',
        tracks: {
            'Champion': './Vibe_Coding組_王祐昇_運行程式及遊戲素材/audio/Champion.mp3',
            'Bliss': './Vibe_Coding組_王祐昇_運行程式及遊戲素材/audio/Bliss.mp3',
            'Canon': './Vibe_Coding組_王祐昇_運行程式及遊戲素材/audio/Canon.mp3',
            'HappyBirthday': './Vibe_Coding組_王祐昇_運行程式及遊戲素材/audio/HappyBirthday.mp3',
            'MainTheme': './Vibe_Coding組_王祐昇_運行程式及遊戲素材/audio/MainTheme.mp3',
            'MagicalMoments': './Vibe_Coding組_王祐昇_運行程式及遊戲素材/audio/MagicalMoments.mp3',
            'Noise': './Vibe_Coding組_王祐昇_運行程式及遊戲素材/audio/Noise.mp3',
            'HammerMASTER': './Vibe_Coding組_王祐昇_運行程式及遊戲素材/audio/HammerMASTER.mp3',
            'InspiringDreams': './Vibe_Coding組_王祐昇_運行程式及遊戲素材/audio/InspiringDreams.mp3',
            'inspiringguitar': './Vibe_Coding組_王祐昇_運行程式及遊戲素材/audio/inspiringguitar.mp3'
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
        
        console.log('[fadeIn] 開始淡入播放，目標音量:', target);
        
        // 檢查音頻是否已解鎖
        if (!audioUnlocked) {
            console.warn('[fadeIn] 音頻尚未解鎖，嘗試解鎖...');
            unlockAudio();
        }
        
        try {
            const playPromise = audio.play();
            if (playPromise?.then) {
                playPromise.then(() => {
                    console.log('[fadeIn] 音樂播放成功');
                }).catch(err => {
                    if (err.name !== 'AbortError') {
                        console.error('[fadeIn] 音樂播放失敗:', err);
                        console.error('[fadeIn] 錯誤詳情:', {
                            name: err.name,
                            message: err.message,
                            audioUnlocked: audioUnlocked,
                            audioReadyState: audio.readyState,
                            audioNetworkState: audio.networkState
                        });
                        
                        // 如果是用戶交互問題，顯示提示
                        if (err.name === 'NotAllowedError') {
                            showAudioError('請點擊畫面以啟用音樂播放！');
                        } else {
                            showAudioError('音樂播放失敗，請檢查瀏覽器權限或重新載入頁面！');
                        }
                    }
                });
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('[fadeIn] 音樂播放異常:', err);
                showAudioError('音樂播放異常，請檢查瀏覽器支援！');
            }
        }
        
        this.fadeTimer = setInterval(() => {
            if (audio.volume < target) {
                audio.volume = Math.min(audio.volume + step, target);
            } else {
                clearInterval(this.fadeTimer);
                console.log('[fadeIn] 淡入完成，當前音量:', audio.volume);
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
        if (!trackName || !this.paths.tracks[trackName]) {
            console.error('無效的音軌名稱:', trackName);
            return;
        }
        
        // 確保音頻已解鎖
        if (!audioUnlocked) {
            unlockAudio();
        }
        
        const path = this.paths.tracks[trackName];
        console.log('開始播放遊戲音軌:', path);
        
        // 停止當前播放的音頻
        if (this.audio) {
            this.audio.pause();
            this.audio = null;
        }
        
        // 創建新的音頻實例
        this.audio = new Audio(path);
        this.audio.volume = 1.0; // 確保音量最大
        
        // 設置音頻參數
        if (offsetSec !== null) {
            this.audio.currentTime = offsetSec;
        }
        
        // 播放音頻
        const playPromise = this.audio.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log('音樂開始播放');
                if (callback) callback();
            }).catch(error => {
                console.error('音樂播放失敗:', error);
                // 嘗試重新解鎖並播放
                unlockAudio();
                setTimeout(() => this.playGameTrack(trackName, offsetSec, callback), 1000);
            });
        }
        
        return this.audio;
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
    beginner: {
        name: 'Beginner',
        judgeWindow: 0.25,
        scoreMultiplier: 1.2,
        gradeThresholds: { S: 80, A: 70, B: 60, C: 30, D: 0 },
        comboForgiveness: 100,
        noteDensity: 1.25, // 固定值
        enName: "Beginner",
        stars: 1,
        speed: Math.round(120 * 0.6),
        density: 1.25, // 1.0–1.5
        keyCount: 4,
        missBuffer: 100, // 增加容錯次數，讓新手更容易
        desc: "✨ 基礎節奏入門！單鍵點擊、節奏緩和，讓你無壓力進入命運世界。",
        keys: ['D', 'F', 'J', 'K'],
        holdSupport: false,
        simultaneousNotes: 1,
        specialRules: "無長音支援，單音符為主"
  },
    casual: {
        name: 'Casual',
        judgeWindow: 0.2,
        scoreMultiplier: 1,
        gradeThresholds: { S: 80, A: 70, B: 60, C: 50, D: 0 },
        comboForgiveness: 100,
        noteDensity: 1.5,
        enName: "Casual",
        stars: 2,
        speed: Math.round(150 * 0.6),
        density: 1.5, // 1.5–2.0
        keyCount: 4,
        missBuffer: 100,
        desc: "🎵 旋律稍起波瀾，簡短長音與雙鍵節奏交織，輕鬆享受流動的音樂律動。",
        keys: ['D', 'F', 'J', 'K'],
        holdSupport: true,
        holdType: "simple",
        simultaneousNotes: 1,
        specialRules: "簡單短長音支援"
  },
    hard: {
        name: 'Hard',
        judgeWindow: 0.15,
        scoreMultiplier: 1,
        gradeThresholds: { S: 90, A: 80, B: 70, C: 50, D: 0 },
        comboForgiveness: 100,
        noteDensity: 2,
        enName: "Hard",
        stars: 3,
        speed: Math.round(180 * 0.6),
        density: 2.2, // 2.0–3.0
        keyCount: 4,
        missBuffer: 100,
        desc: "🔥 節奏加速進化！中長音與雙鍵組合考驗反應與穩定度，是實力的試煉場。",
        keys: ['D', 'F', 'J', 'K'],
        holdSupport: true,
        holdType: "medium",
        simultaneousNotes: 2,
        specialRules: "中長音支援，雙鍵常態"
  },
    extreme: {
        name: 'Extreme',
        judgeWindow: 0.1,
        scoreMultiplier: 1.3,
        gradeThresholds: { S: 90, A: 85, B: 80, C: 70, D: 0 },
        comboForgiveness: 10,
        noteDensity: 3.5,
        enName: "Extreme",
        stars: 4,
        speed: Math.round(210 * 0.6),
        density: 3.5, // 3.0–4.0
        keyCount: 5,
        missBuffer: 10,
        desc: "⚡ 音流如電！高速節奏、多段長音、空白鍵加入，全面挑戰你的極限操作。",
        keys: ['D', 'F', ' ', 'J', 'K'],
        holdSupport: true,
        holdType: "multi",
        simultaneousNotes: 2,
        specialRules: "多段長音，Space鍵加入，判定鬆緊"
  },
    master: {
        name: 'Master',
        judgeWindow: 0.09,
        scoreMultiplier: 1.5,
        gradeThresholds: { S: 99, A: 95, B: 90, C: 80, D: 0 },
        comboForgiveness: 10,
        noteDensity: 4.75,
        enName: "Master",
        stars: 5,
        speed: Math.round(220 * 0.6),
        density: 4.75, // 4.0–5.5
        keyCount: 5,
        missBuffer: 10,
        desc: "👑 節奏王者之道！節拍密集如雨、判定超嚴苛，特效爆閃，唯高手能穩步前行。",
        keys: ['D', 'F', ' ', 'J', 'K'],
        holdSupport: true,
        holdType: "intensive",
        simultaneousNotes: 3,
        specialRules: "長音密集，特效數多，節奏混淆"
  },
    fate: {
        name: 'Fate Mode',
        judgeWindow: 0.06,
        scoreMultiplier: 2.0,
        gradeThresholds: { S: 100, A: 99, B: 97, C: 90, D: 0 },
        comboForgiveness: 10,
        noteDensity: [5.5, 6.5],
        enName: "Fate Mode",
        stars: 6,
        speed: Math.round(250 * 0.6),
        density: 6, // 5.5–6.5+
        keyCount: 5,
        missBuffer: 10,
        desc: "🌌 命運交響最終章！五鍵同列、極速連打、節奏錯亂，踏上無回之境的節奏試煉。",
        keys: ['D', 'F', ' ', 'J', 'K'],
        holdSupport: true,
        holdType: "special",
        simultaneousNotes: 3,
        specialRules: "特殊長音，高速連打，極限判定",
        locked: true
  }
};

// 保持向後相容性
const DIFFICULTY_CONFIGS = LEVEL_CONFIGS;

// 全域變數宣告
let holdKeyLane = null;
let holdKeyNote = null;
let holdKeyStartTime = null;

// 新增全域變數
let scoreMultiplier = 1.0;
let gradeThresholds = { S: 95, A: 85, B: 70, C: 50, D: 0 };
let comboForgiveness = 3;

// ===============================
// 畫面管理 (Screen Management)
// ===============================
function showScreen(screen) {
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
            if (audioUnlocked) {
                audioManager.playBackground();
            }
            break;
        case 'game':
            gameArea.style.display = 'flex';
            gameArea.classList.add('fade-in');
            // 強制重新取得 canvas/ctx 並加 log
            canvas = document.getElementById('game-canvas');
            ctx = canvas ? canvas.getContext('2d') : null;
            console.log('[showScreen] canvas:', canvas, 'ctx:', ctx);
            if (!canvas || !ctx) {
                showAudioError('[showScreen] canvas 或 ctx 取得失敗，遊戲無法正常顯示！');
                // 顯示明顯錯誤提示
                const errMsg = document.getElementById('audio-error-msg');
                if (errMsg) {
                    errMsg.style.display = 'block';
                    errMsg.textContent = '【嚴重錯誤】無法取得遊戲畫布，請重新整理或檢查 HTML 結構！';
                    errMsg.style.opacity = '1';
                }
                throw new Error('[showScreen] canvas 或 ctx 取得失敗');
            }
            // 自動聚焦 canvas
            setTimeout(() => { if (canvas && typeof canvas.focus === 'function') canvas.focus(); }, 100);
            resizeCanvas();
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
    console.log(`[generateNotes] 開始生成音符 - 難度: ${difficulty}, 時長: ${duration}秒`);
    
    const conf = LEVEL_CONFIGS[difficulty] || LEVEL_CONFIGS['beginner'];
    console.log('[generateNotes] 使用配置:', conf);
    
    // 處理音符密度
    let density;
    if (Array.isArray(conf.noteDensity)) {
        const [minDensity, maxDensity] = conf.noteDensity;
        density = minDensity + Math.random() * (maxDensity - minDensity);
    } else {
        density = conf.noteDensity || 1.5;
    }
    
    const noteCount = Math.floor(density * duration);
    const lanes = conf.keys || ['D', 'F', 'J', 'K'];
    
    console.log(`[generateNotes] 密度: ${density.toFixed(2)}, 音符數量: ${noteCount}, 賽道: ${lanes.join(', ')}`);
    
    const notes = [];
    
    // 確保至少有幾個音符
    const minNotes = Math.max(5, Math.floor(duration / 10));
    const actualNoteCount = Math.max(noteCount, minNotes);
    
    for (let i = 0; i < actualNoteCount; i++) {
        // 均勻分布在 1~duration 內，避免在0秒時就有音符
        const t = 1 + (i * (duration - 1)) / actualNoteCount;
        // 隨機選一個賽道
        const lane = Math.floor(Math.random() * lanes.length);
        
        // 添加一些變化：偶爾生成長音符
        let noteDuration = 0;
        if (Math.random() < 0.2 && conf.holdSupport) {
            noteDuration = 0.5 + Math.random() * 1.5; // 0.5-2秒的長音符
        }
        
        notes.push({ 
            time: t, 
            lane,
            duration: noteDuration,
            hit: false,
            missed: false,
            group: i
        });
    }
    
    console.log(`[generateNotes] 生成完成 - 實際音符數量: ${notes.length}`);
    console.log('[generateNotes] 前5個音符:', notes.slice(0, 5));
    
    return notes;
}

// ===============================
// Canvas 管理 (Canvas Management)
// ===============================
function resizeCanvas() {
    console.log('[resizeCanvas] 開始調整 canvas 尺寸');
    
    // 獲取 canvas 元素
    canvas = document.getElementById('game-canvas');
    if (!canvas) {
        console.error('[resizeCanvas] 找不到 game-canvas 元素');
        return;
    }
    
    // 獲取 2D 上下文
    ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('[resizeCanvas] 無法獲取 2D 上下文');
        return;
    }
    
    console.log('[resizeCanvas] canvas 和 ctx 初始化成功');
    
    // 獲取容器尺寸
    const container = gameArea;
    let containerWidth = container ? container.clientWidth : 900;
    let containerHeight = container ? container.clientHeight : 700;
    
    // 驗證容器尺寸
    if (!containerWidth || !isFinite(containerWidth)) {
        console.warn('[resizeCanvas] 容器寬度無效，使用預設值 900');
        containerWidth = 900;
    }
    if (!containerHeight || !isFinite(containerHeight)) {
        console.warn('[resizeCanvas] 容器高度無效，使用預設值 700');
        containerHeight = 700;
    }
    
    // 計算 canvas 尺寸
    canvas.width = Math.min(containerWidth - 40, 800);
    canvas.height = Math.min(containerHeight - 200, 600);
    
    // 最終驗證 canvas 尺寸
    if (!canvas.width || !isFinite(canvas.width) || isNaN(canvas.width) || canvas.width <= 0) {
        console.warn('[resizeCanvas] canvas 寬度無效，使用預設值 800');
        canvas.width = 800;
    }
    if (!canvas.height || !isFinite(canvas.height) || isNaN(canvas.height) || canvas.height <= 0) {
        console.warn('[resizeCanvas] canvas 高度無效，使用預設值 600');
        canvas.height = 600;
    }
    
    console.log(`[resizeCanvas] 完成調整 - canvas: ${!!canvas}, width: ${canvas.width}, height: ${canvas.height}`);
    
    // 驗證 ctx.canvas 是否正確設置
    if (ctx.canvas !== canvas) {
        console.warn('[resizeCanvas] ctx.canvas 與 canvas 不匹配，嘗試修復');
        // 重新獲取上下文
        ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error('[resizeCanvas] 重新獲取上下文失敗');
            return;
        }
    }
    
    console.log('[resizeCanvas] canvas 調整完成，ctx.canvas 驗證通過');
}

// ===============================
// 遊戲流程控制 (Game Flow Control)
// ===============================
// 倒數動畫防重複 flag
let isCountingDown = false;

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
    const timer = setInterval(() => {
        count--;
        if (count > 0) {
            text.textContent = count;
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
    if (!selectedSong) {
        showToast('請先選擇一首歌曲！');
        return;
    }
    
    if (gameStarted) {
        console.warn('遊戲已經開始！');
        return;
    }
    
    // 確保音頻已解鎖
    unlockAudio();
    
    // 停止所有音樂並播放遊戲音樂
    audioManager.stopAll(() => {
        audioManager.playGameTrack(selectedSong, 0, () => {
            console.log('遊戲音樂播放開始');
        });
    });
    
    // 初始化遊戲狀態
    gameStarted = true;
    gamePaused = false;
    gameEnded = false;
    score = 0;
    combo = 0;
    maxCombo = 0;
    perfectCount = 0;
    greatCount = 0;
    goodCount = 0;
    missCount = 0;
    
    // 生成音符
    const noteDuration = 60; // 60秒的音符
    activeNotes = generateNotes(selectedDifficulty, noteDuration);
    
    // 開始倒計時
    showCountdown(() => {
        gameStartTime = Date.now();
        requestAnimationFrame(gameLoop);
        startAutoMissCheck();
    });
    
    // 更新界面顯示
    updateScoreDisplay();
    updateComboDisplay();
    updateMissBufferUI();
}

// --- realStartGame ---
function realStartGame() {
    console.log('[realStartGame] called', { selectedSong, selectedDifficulty });
    
    // 檢查音頻是否已解鎖
    if (!audioUnlocked) {
        console.warn('[realStartGame] 音頻尚未解鎖，嘗試解鎖...');
        unlockAudio();
    }
    
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
    
    // 先設置遊戲開始時間，確保音符時間計算正確
    gameStartTime = performance.now();
    gameEndTime = gameStartTime + GAME_DURATION * 1000;
    
    console.log('[realStartGame] 遊戲開始時間設置:', {
        gameStartTime,
        gameEndTime,
        currentTime: (Date.now() - gameStartTime) / 1000
    });
    
    // 確保音符數據正確設置
    if (window.gameNoteData && window.gameNoteData.length > 0) {
        console.log('[realStartGame] 重新設置音符數據，數量:', window.gameNoteData.length);
        spawnNotes(window.gameNoteData);
    } else {
        console.warn('[realStartGame] 沒有找到音符數據，重新生成');
        let noteData = generateNotes(selectedDifficulty, GAME_DURATION);
        if (noteData && noteData.length > 0) {
            console.log('[realStartGame] 音符數據生成成功，數量:', noteData.length);
            spawnNotes(noteData);
        } else {
            console.error('[realStartGame] 音符數據生成失敗');
        }
    }
    
    // 驗證音符數據是否正確設置
    console.log('[realStartGame] 驗證音符數據:', {
        activeNotes: activeNotes,
        activeNotesLength: activeNotes ? activeNotes.length : 0,
        gameNoteData: window.gameNoteData
    });
    
    if (window.gameEndTimeout) clearTimeout(window.gameEndTimeout);
    window.gameEndTimeout = setTimeout(() => {
        endGame();
    }, GAME_DURATION * 1000);
    
    showScreen('game');
    resizeCanvas();
    
    const laneCount = config.keyCount || 4;
    laneManager.setLaneCount(laneCount);
    
    const trackName = selectedSong.replace('.mp3', '');
    let offset = 0;
    if (trackName === 'Canon') offset = 2.5;
    if (trackName === 'HappyBirthday') offset = 0.5;
    if (trackName === 'Noise') offset = 0.2;
    if (trackName === 'HammerMASTER') offset = 0.8;
    if (trackName === 'inspiringguitar') offset = 0.5;
    
    console.log('[realStartGame] 準備播放遊戲音樂:', trackName, 'offset:', offset);
    
    audioManager.playGameTrack(trackName, offset, () => {
        console.log('[realStartGame] 遊戲音樂播放回調執行');
        if (!window._gameLoopStarted) {
            window._gameLoopStarted = true;
            console.log('[gameLoop] 開始執行');
        }
        // 不要重新設置 gameStartTime，保持與音符時間計算一致
        gameLoop();
        startAutoMissCheck();
    });
    
    updateScoreDisplay();
    updateComboDisplay();
    updateKeyHints();
    
    if (LEVEL_CONFIGS[selectedDifficulty] && LEVEL_CONFIGS[selectedDifficulty].judgeWindow) {
        judgeWindow = LEVEL_CONFIGS[selectedDifficulty].judgeWindow;
        console.log('[realStartGame] 設定判定寬容度:', judgeWindow, '秒');
    }
    
    if (LEVEL_CONFIGS[selectedDifficulty]) {
        const conf = LEVEL_CONFIGS[selectedDifficulty];
        if (conf.scoreMultiplier) scoreMultiplier = conf.scoreMultiplier;
        if (conf.gradeThresholds) gradeThresholds = conf.gradeThresholds;
        if (conf.comboForgiveness !== undefined) comboForgiveness = conf.comboForgiveness;
            console.log('[realStartGame] 判定寬容度:', judgeWindow, '分數倍率:', scoreMultiplier, '評級門檻:', gradeThresholds, 'combo容錯:', comboForgiveness);
    
    // 添加測試函數到全局，方便調試
    window.testNotes = function() {
        console.log('=== 音符測試 ===');
        console.log('activeNotes:', activeNotes);
        console.log('activeNotes.length:', activeNotes ? activeNotes.length : 0);
        console.log('currentTime:', currentTime);
        console.log('gameStartTime:', gameStartTime);
        console.log('selectedDifficulty:', selectedDifficulty);
        console.log('gameStarted:', gameStarted);
        console.log('gamePaused:', gamePaused);
        console.log('gameEnded:', gameEnded);
        
        if (activeNotes && activeNotes.length > 0) {
            console.log('前3個音符:', activeNotes.slice(0, 3));
            activeNotes.forEach((note, i) => {
                const noteY = (currentTime - note.time) * LEVEL_CONFIGS[selectedDifficulty].speed;
                console.log(`音符 ${i}: time=${note.time}, lane=${note.lane}, Y=${noteY.toFixed(1)}`);
            });
        }
    };
    
    // 添加強制音符生成測試
    window.forceGenerateNotes = function() {
        console.log('=== 強制生成音符測試 ===');
        if (!selectedDifficulty) {
            console.error('未選擇難度');
            return;
        }
        
        const noteData = generateNotes(selectedDifficulty, GAME_DURATION);
        console.log('生成的音符數據:', noteData);
        
        if (noteData && noteData.length > 0) {
            spawnNotes(noteData);
            console.log('音符已設置到 activeNotes');
        }
    };
    
    // 添加音符位置測試
    window.testNotePositions = function() {
        console.log('=== 音符位置測試 ===');
        if (!activeNotes || activeNotes.length === 0) {
            console.log('沒有活動音符');
            return;
        }
        
        const config = LEVEL_CONFIGS[selectedDifficulty];
        const noteSpeed = config.speed;
        
        activeNotes.forEach((note, i) => {
            const noteY = (currentTime - note.time) * noteSpeed;
            const noteX = (note.lane + 0.5) * (canvas.width / laneManager.laneCount);
            console.log(`音符 ${i}: time=${note.time}, lane=${note.lane}, X=${noteX.toFixed(1)}, Y=${noteY.toFixed(1)}, 是否在畫面內=${noteY > -50 && noteY < canvas.height + 50}`);
        });
    };
    
    // 添加音頻測試函數
    window.testAudio = function() {
        console.log('=== 音頻測試 ===');
        console.log('audioUnlocked:', audioUnlocked);
        console.log('audioManager:', audioManager);
        console.log('current audio:', audioManager.audio);
        
        if (audioManager.audio) {
            console.log('音頻狀態:', {
                readyState: audioManager.audio.readyState,
                networkState: audioManager.audio.networkState,
                paused: audioManager.audio.paused,
                currentTime: audioManager.audio.currentTime,
                duration: audioManager.audio.duration,
                volume: audioManager.audio.volume,
                src: audioManager.audio.src
            });
        }
        
        if (selectedSong) {
            console.log('選中的歌曲:', selectedSong);
            const trackName = selectedSong.replace('.mp3', '');
            console.log('音頻路徑:', audioManager.paths.tracks[trackName]);
        }
    };
    
    // 添加強制音頻播放測試
    window.forcePlayAudio = function() {
        console.log('=== 強制音頻播放測試 ===');
        if (!selectedSong) {
            console.error('未選擇歌曲');
            return;
        }
        
        const trackName = selectedSong.replace('.mp3', '');
        console.log('嘗試播放:', trackName);
        
        audioManager.playGameTrack(trackName, 0, () => {
            console.log('音頻播放回調執行');
        });
    };
}
}

// ===============================
// 遊戲主迴圈 (Game Main Loop)
// ===============================
function gameLoop(now) {
    if (!gameStarted || gamePaused || gameEnded) return;
    
    // 使用 performance.now() 確保時間計算一致性
    if (now === undefined) now = performance.now();
    currentTime = (now - gameStartTime) / 1000;
    // 只印一次開始
    if (!window._gameLoopStarted) {
        window._gameLoopStarted = true;
        console.log('[gameLoop] 開始執行');
    }
    if (now % 1000 < 20) console.log('[gameLoop] running, currentTime:', currentTime.toFixed(2));
    
    // 檢查 ctx 是否可用
    if (!ctx) {
        console.warn('[gameLoop] ctx 不可用，跳過繪製');
        animationId = requestAnimationFrame(gameLoop);
        return;
    }
    
    // 更新動態互動狀態
    dynamicInteractionManager.updateFeverMode();
    dynamicInteractionManager.checkFeverMode();
    
    // 更新倒數計時顯示
    const timerDisplay = document.getElementById('timer-display');
    if (timerDisplay) {
        const remain = Math.max(0, Math.ceil(GAME_DURATION - currentTime));
        timerDisplay.textContent = remain;
    }
    
    // 畫面震動效果
    if (screenShake > 0) {
        ctx.save();
        const shakeX = (Math.random() - 0.5) * screenShake;
        const shakeY = (Math.random() - 0.5) * screenShake;
        ctx.translate(shakeX, shakeY);
    }
    
    drawBackground(ctx);
    
    // 添加音符調試信息
    if (now % 1000 < 20) {
        console.log('[gameLoop] 音符狀態:', {
            activeNotesLength: activeNotes ? activeNotes.length : 0,
            currentTime: currentTime.toFixed(2),
            gameStarted: gameStarted,
            gamePaused: gamePaused,
            gameEnded: gameEnded
        });
    }
    
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
            let laneGradient;
            if (laneGlowStates[i] === 1 || laneGlowStates[i] === 2) {
                // 高亮時：底部稍亮、頂部較暗，亮度變化細微
                laneGradient = ctx.createLinearGradient(laneX, 0, laneX, canvas.height);
                laneGradient.addColorStop(0, `${laneColor}22`); // 頂部較暗
                laneGradient.addColorStop(0.7, `${laneColor}33`); // 中段
                laneGradient.addColorStop(1, `${laneColor}55`); // 底部稍亮
            } else {
                // 一般狀態
                laneGradient = ctx.createLinearGradient(laneX - laneWidth * 0.4, 0, laneX + laneWidth * 0.4, 0);
                laneGradient.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
                laneGradient.addColorStop(0.3, `${laneColor}26`);
                laneGradient.addColorStop(0.7, `${laneColor}26`);
                laneGradient.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
            }
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

function drawBackground(ctx) {
    // 檢查 ctx 和 canvas 是否可用
    if (!ctx) {
        console.warn('[drawBackground] ctx 不存在');
        return;
    }
    
    if (!ctx.canvas) {
        console.warn('[drawBackground] ctx.canvas 不存在');
        return;
    }
    
    const canvas = ctx.canvas;
    
    // 檢查 canvas 尺寸是否有效
    if (!isFinite(canvas.width) || !isFinite(canvas.height) || canvas.width <= 0 || canvas.height <= 0) {
        console.warn('[drawBackground] canvas 尺寸異常', { width: canvas.width, height: canvas.height });
        return;
    }
    
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const radius = Math.min(cx, cy);
    
    // 檢查計算結果是否有效
    if (!isFinite(cx) || !isFinite(cy) || !isFinite(radius) || radius <= 0) {
        console.warn('[drawBackground] 座標/半徑異常', { cx, cy, radius });
        return;
    }
    
    try {
        // 創建徑向漸層背景
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        gradient.addColorStop(0, '#000');
        gradient.addColorStop(1, '#333');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 如果繪製成功，重置警告標記
        if (window._drawBgWarned) {
            window._drawBgWarned = false;
            console.log('[drawBackground] 背景繪製恢復正常');
        }
    } catch (error) {
        console.error('[drawBackground] 繪製背景時發生錯誤:', error);
        if (!window._drawBgWarned) {
            window._drawBgWarned = true;
            console.warn('[drawBackground] 背景繪製失敗，已設置警告標記');
        }
    }
}

function drawNotes(now) {
    // 檢查 ctx 和 canvas 是否可用
    if (!ctx) {
        console.warn('[drawNotes] ctx 不存在');
        return;
    }
    
    if (!ctx.canvas) {
        console.warn('[drawNotes] ctx.canvas 不存在');
        return;
    }
    
    const canvas = ctx.canvas;
    
    // 檢查 canvas 尺寸是否有效
    if (!isFinite(canvas.width) || !isFinite(canvas.height) || canvas.width <= 0 || canvas.height <= 0) {
        console.warn('[drawNotes] canvas 尺寸異常', { width: canvas.width, height: canvas.height });
        return;
    }
    
    // 檢查遊戲狀態
    if (!selectedDifficulty || !LEVEL_CONFIGS[selectedDifficulty]) {
        console.warn('[drawNotes] 未選擇難度或難度配置無效');
        return;
    }
    
    // 檢查音符數據
    if (!activeNotes || activeNotes.length === 0) {
        // 只在第一次顯示警告，避免重複輸出
        if (!window._noNotesWarned) {
            console.warn('[drawNotes] 沒有活動音符', { 
                activeNotes: activeNotes, 
                activeNotesLength: activeNotes ? activeNotes.length : 0,
                currentTime: currentTime,
                gameStartTime: gameStartTime
            });
            window._noNotesWarned = true;
        }
        return;
    } else {
        // 重置警告標記
        window._noNotesWarned = false;
    }
    
    const config = LEVEL_CONFIGS[selectedDifficulty];
    const noteSpeed = config.speed;
    const laneCount = laneManager.laneCount;
    const laneWidth = canvas.width / laneCount;
    let drawn = 0;
    activeNotes.forEach((note, index) => {
        if (!note) return;
        const noteY = (currentTime - note.time) * noteSpeed;
        const noteX = (note.lane + 0.5) * laneWidth;
        
        // 添加詳細的調試信息
        if (index < 3) { // 只顯示前3個音符的詳細信息
            console.log(`[drawNotes] 音符 ${index}:`, {
                noteTime: note.time,
                currentTime: currentTime,
                timeDiff: currentTime - note.time,
                noteSpeed: noteSpeed,
                noteY: noteY,
                noteX: noteX,
                canvasHeight: canvas.height,
                shouldDraw: noteY > -50 && noteY < canvas.height + 50 && !note.hit && !note.missed
            });
        }
        
        if (noteY > -50 && noteY < canvas.height + 50 && !note.hit && !note.missed) {
            drawn++;
            console.log(`[drawNotes] 繪製音符 index=${index}, lane=${note.lane}, x=${noteX.toFixed(1)}, y=${noteY.toFixed(1)}, time=${note.time}`);
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
    if (drawn > 0) console.log(`[drawNotes] 畫出 ${drawn} 個音符 (currentTime=${currentTime.toFixed(2)})`);
}

// ===============================
// 判定系統 (Judgment System)
// ===============================
// 判定線配置
// const JUDGE_LINE = {
//     POSITION: 100,  // 判定線距離底部的距離
//     PERFECT_RANGE: 50,  // Perfect判定範圍（上下各50像素）
//     GREAT_RANGE: 80,   // Great判定範圍（上下各80像素）
//     GOOD_RANGE: 100,   // Good判定範圍（上下各100像素）
//     MISS_RANGE: 150    // Miss判定範圍（超過判定線150像素）
// };

// 音符判定函數
function judgeNote(lane) {
    if (!activeNotes || activeNotes.length === 0) return;
    
    const now = (Date.now() - gameStartTime) / 1000;
    let hitIndex = -1;
    let hitTiming = Infinity;
    let hitNote = null;
    
    // 獲取判定線位置
    const judgeLine = canvas.height - JUDGE_LINE.POSITION;
    
    // 查找最近的音符
    for (let i = 0; i < activeNotes.length; i++) {
        const note = activeNotes[i];
        if (note.lane === lane && !note.hit && !note.missed) {
            // 計算音符的當前 Y 位置
            const noteY = (currentTime - note.time) * LEVEL_CONFIGS[selectedDifficulty].speed;
            // 只判定通過終止線的音符
            if (noteY >= judgeLine) {
                const distanceToJudgeLine = Math.abs(noteY - judgeLine);
                // 判定範圍檢查
                if (distanceToJudgeLine <= JUDGE_LINE.MISS_RANGE) {
                    const timing = Math.abs(note.time - now);
                    if (timing < hitTiming) {
                        hitTiming = timing;
                        hitIndex = i;
                        hitNote = note;
                    }
                }
            }
        }
    }
    // 判定結果
    if (hitIndex !== -1 && hitNote) {
        const noteY = (currentTime - hitNote.time) * LEVEL_CONFIGS[selectedDifficulty].speed;
        const distanceToJudgeLine = Math.abs(noteY - judgeLine);
        // 命中時整個軌道高亮
        dynamicInteractionManager.triggerPerfectEffect(lane);
        if (distanceToJudgeLine <= JUDGE_LINE.PERFECT_RANGE) {
            hitNoteSuccess(hitIndex, 'perfect');
            score += 1000;
            combo++;
            maxCombo = Math.max(maxCombo, combo);
        } else if (distanceToJudgeLine <= JUDGE_LINE.GREAT_RANGE) {
            hitNoteSuccess(hitIndex, 'great');
            score += 500;
            combo++;
            maxCombo = Math.max(maxCombo, combo);
        } else if (distanceToJudgeLine <= JUDGE_LINE.GOOD_RANGE) {
            hitNoteSuccess(hitIndex, 'good');
            score += 100;
            combo++;
            maxCombo = Math.max(maxCombo, combo);
        } else {
            missNote();
            return;
        }
        // 更新顯示
        updateScoreDisplay();
        updateComboDisplay();
        // 檢查是否進入 Fever 模式
        effectManager.checkFeverMode();
    } else {
        // 沒有可以擊中的音符，判定為 Miss
        missNote(true);
    }
}

function hitNoteSuccess(index, type) {
    if (index >= 0 && index < activeNotes.length) {
        const note = activeNotes[index];
        note.hit = true;
        note.hitType = type;
        
        // 立即從活動音符列表中移除
        activeNotes.splice(index, 1);
        
        // 顯示判定結果
        showJudgement(type);
    }
}

function showJudgement(type) {
    const judgementEl = document.createElement('div');
    judgementEl.className = 'judgement ' + type;
    judgementEl.textContent = type.toUpperCase();
    document.body.appendChild(judgementEl);
    
    // 添加消失動畫
    setTimeout(() => {
        judgementEl.style.opacity = '0';
        setTimeout(() => {
            judgementEl.remove();
        }, 500);
    }, 100);
}

function updateComboForPolyphony(group) {
    const groupNotes = activeNotes.filter(n => n.group === group);
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
    if (index >= 0 && index < activeNotes.length) {
        activeNotes.splice(index, 1); // 立即移除音符
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
    // 移除容錯次數限制，讓遊戲可以無限 Miss
    // missBufferCount--;
    // setMissBufferCount(missBufferCount);
    console.log(`[missNote] Miss 計數: ${missCount}`);
    // 移除遊戲結束邏輯，讓玩家可以繼續遊玩
    // if (missBufferCount < 0) {
    //     console.log('[missNote] 容錯次數用完，結束遊戲');
    //     endGame();
    //     return;
    // }
    console.log(`Miss: ${missCount}`);
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
        // 根據難度調整 Miss 閾值，讓新手更容易
        const missThreshold = selectedDifficulty === 'beginner' ? 150 : 100;
        
        activeNotes.forEach((note, index) => {
            if (!note.hit && !note.missed) {
                // 新公式：音符下落
                const noteY = (currentTime - note.time) * noteSpeed;
                if (noteY > judgeLineY + missThreshold) {
                    note.missed = true;
                    console.log(`[AutoMiss] 音符 ${index} 超過判定線，位置: ${noteY.toFixed(1)}, 閾值: ${judgeLineY + missThreshold}`);
                    missNote();
                }
            }
        });
        
        // 檢查是否所有音符都處理完畢，但移除自動結束遊戲的邏輯
        const remainingNotes = activeNotes.filter(n => !n.hit && !n.missed);
        if (remainingNotes.length === 0 && currentTime > 5) {
            console.log('[AutoMiss] 所有音符處理完畢，但遊戲繼續運行');
            // 移除自動結束遊戲，讓玩家可以繼續遊玩
            // setTimeout(() => endGame(), 1000);
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
        LEVEL_CONFIGS.fate.locked = false;
    } else {
        hiddenBtn.disabled = true;
        hiddenBtn.classList.remove('unlocked-final');
        LEVEL_CONFIGS.fate.locked = true;
    }
    renderDifficultyStars();
}

// 難度選擇動畫
function setDifficulty(diff) {
    if (!LEVEL_CONFIGS[diff]) {
        showAudioError('難度參數錯誤，已自動切回新手難度');
        selectedDifficulty = 'superEasy';
        diff = 'superEasy';
    } else {
        selectedDifficulty = diff;
    }
    // 根據難度自動設定賽道數量
    const config = LEVEL_CONFIGS[diff];
    if (config && config.keyCount) {
        laneManager.setLaneCount(config.keyCount);
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

// missBuffer UI - 現在顯示無限模式
function updateMissBufferUI() {
    const missBufferDiv = document.getElementById('miss-buffer-ui');
    if (!missBufferDiv) {
        return;
    }
    // 改為顯示無限模式
    missBufferDiv.textContent = `無限模式 - Miss 次數：${missCount}`;
    missBufferDiv.classList.add('visible');
}
function setMissBufferCount(count) {
    const missBufferDiv = document.getElementById('miss-buffer-ui');
    if (missBufferDiv) {
        // 改為顯示無限模式
        missBufferDiv.textContent = `無限模式 - Miss 次數：${missCount}`;
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
    if (window.gameEndTimeout) {
        clearTimeout(window.gameEndTimeout);
        window.gameEndTimeout = null;
    }
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
    const totalNotes = activeNotes.length;
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

    // ====== 新增排行榜與暱稱輸入 ======
    let leaderboardDiv = document.getElementById('leaderboard');
    if (!leaderboardDiv) {
        leaderboardDiv = document.createElement('div');
        leaderboardDiv.id = 'leaderboard';
        leaderboardDiv.style = 'margin:32px auto;max-width:420px;background:rgba(0,0,0,0.7);border-radius:16px;padding:24px 16px 16px 16px;box-shadow:0 0 24px #0ff3;';
        resultScreen.appendChild(leaderboardDiv);
    }
    leaderboardDiv.innerHTML = '';

    // 暱稱輸入
    let nicknameInput = document.createElement('input');
    nicknameInput.type = 'text';
    nicknameInput.maxLength = 15;
    nicknameInput.placeholder = '請輸入暱稱 (最多15字)';
    nicknameInput.style = 'width:70%;padding:8px 12px;border-radius:8px;border:1px solid #0ff;font-size:1.1em;margin-bottom:8px;';
    leaderboardDiv.appendChild(nicknameInput);
    let confirmBtn = document.createElement('button');
    confirmBtn.textContent = '確認上榜';
    confirmBtn.style = 'margin-left:8px;padding:8px 18px;border-radius:8px;background:#0ff;color:#222;font-weight:bold;border:none;cursor:pointer;font-size:1.1em;';
    leaderboardDiv.appendChild(confirmBtn);

    // 排行榜區塊
    let table = document.createElement('table');
    table.style = 'width:100%;margin-top:18px;border-collapse:collapse;background:rgba(0,0,0,0.5);';
    table.innerHTML = `<thead><tr style="color:#0ff;font-size:1.1em;"><th style="text-align:left">名次</th><th style="text-align:left">暱稱</th><th style="text-align:right">分數</th><th style="text-align:center">等級</th></tr></thead><tbody id="leaderboard-body"></tbody>`;
    leaderboardDiv.appendChild(table);

    // 讀取排行榜資料
    let leaderboard = [];
    try {
        leaderboard = JSON.parse(localStorage.getItem('fatekeys_leaderboard')||'[]');
    } catch(e) { leaderboard = []; }

    // 新增紀錄
    confirmBtn.onclick = function() {
        let nickname = nicknameInput.value.trim() || '無名玩家';
        if (nickname.length > 15) nickname = nickname.slice(0, 15);
        leaderboard.push({ nickname, score, grade });
        leaderboard.sort((a, b) => b.score - a.score);
        leaderboard = leaderboard.slice(0, 20); // 只保留前20名
        localStorage.setItem('fatekeys_leaderboard', JSON.stringify(leaderboard));
        renderLeaderboard();
        confirmBtn.disabled = true;
        nicknameInput.disabled = true;
    };

    // 排行榜渲染
    function renderLeaderboard() {
        let body = leaderboardDiv.querySelector('#leaderboard-body');
        body.innerHTML = '';
        leaderboard.forEach((item, idx) => {
            let tr = document.createElement('tr');
            tr.innerHTML = `<td style="color:#ffe066;font-weight:bold;">${idx+1}</td><td>${item.nickname}</td><td style="text-align:right;">${item.score.toLocaleString()}</td><td style="text-align:center;">${item.grade}</td>`;
            body.appendChild(tr);
        });
    }
    renderLeaderboard();
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
        comboDisplay.classList.remove('combo-pulse', 'glow');
        if (combo > 0) {
            // scale 放大動畫
            comboDisplay.classList.add('combo-pulse');
            setTimeout(() => comboDisplay.classList.remove('combo-pulse'), 300);
        }
        if (combo >= 10) {
            // 高連擊發光顫抖
            comboDisplay.classList.add('glow');
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
    if (audioUnlocked) {
        console.log('[unlockAudio] 音頻已經解鎖');
        return;
    }
    
    console.log('[unlockAudio] 開始解鎖音訊...');
    audioUnlocked = true;
    
    const mask = document.getElementById('unlock-audio-mask');
    if (mask) {
        mask.style.display = 'none';
        console.log('[unlockAudio] 隱藏音頻解鎖遮罩');
    }
    
    // 播放背景音樂
    try {
        console.log('[unlockAudio] 嘗試播放背景音樂...');
        audioManager.playBackground();
    } catch (error) {
        console.error('[unlockAudio] 播放背景音樂失敗:', error);
    }
    
    console.log('[unlockAudio] 音訊解鎖完成');
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
const helpModal = document.getElementById('help-modal');
helpModal.innerHTML = `
  <div id="help-modal-content" style="background:#222;color:#fff;padding:2rem 1.5rem;border-radius:1rem;max-width:400px;margin:5vh auto;position:relative;box-shadow:0 4px 32px #000b;">
    <button id="help-modal-close" style="position:absolute;top:0.5rem;right:0.5rem;font-size:2rem;background:none;border:none;color:#fff;cursor:pointer;">&times;</button>
    <h2 style="margin-top:0;">遊戲玩法與勝負規則</h2>
    <ul style="padding-left:1.2em;">
      <li>選擇歌曲與難度後，點擊「開始遊戲」或按 Enter 鍵開始。</li>
      <li>依畫面提示按下 <b>D F 空白 J K</b> 鍵擊打音符。</li>
      <li>連續擊中可獲得 Combo，失誤會中斷。</li>
      <li>分數依照準確度與連擊數計算。</li>
      <li>遊戲結束時，分數最高者獲勝（單人則挑戰高分）。</li>
      <li>終極幻想難度需玩三次才解鎖。</li>
      <li>左上角可調整音量與高對比。</li>
    </ul>
  </div>
`;
helpModal.style.display = 'none';
helpModal.style.position = 'fixed';
helpModal.style.top = '0';
helpModal.style.left = '0';
helpModal.style.width = '100vw';
helpModal.style.height = '100vh';
helpModal.style.background = 'rgba(0,0,0,0.6)';
helpModal.style.zIndex = '10001';
helpModal.style.justifyContent = 'center';
helpModal.style.alignItems = 'center';
helpModal.style.display = 'none';
helpModal.style.transition = 'opacity 0.2s';

helpBtn.addEventListener('click', () => {
  helpModal.style.display = 'flex';
  helpModal.style.opacity = '1';
});
document.getElementById('help-modal-close').onclick = function() {
  helpModal.style.display = 'none';
};
helpModal.onclick = function(e) {
  if (e.target === helpModal) helpModal.style.display = 'none';
};

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
        selectedDifficulty = 'beginner';
        setDifficulty('beginner');
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
            // 先確保tooltip存在
            let tooltip = btn.querySelector('.tooltip');
            if (!tooltip) {
                tooltip = document.createElement('div');
                tooltip.className = 'tooltip';
                btn.appendChild(tooltip);
            }
            // 預設隱藏
            tooltip.style.display = 'none';
            // hover顯示
            btn.addEventListener('mouseenter', function() {
                tooltip.style.display = 'block';
            });
            // 移出隱藏
            btn.addEventListener('mouseleave', function() {
                tooltip.style.display = 'none';
            });
            // 點擊時如果有顯示則隱藏
            btn.addEventListener('click', function() {
                if (tooltip.style.display === 'block') {
                    tooltip.style.display = 'none';
                }
                // 原本的setDifficulty邏輯
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
    
    // 鍵盤事件 - 支援 Mac 鍵盤
    document.addEventListener('keydown', function(e) {
        // 修正：如果焦點在input或textarea，不處理遊戲按鍵
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (!gameStarted || gamePaused || gameEnded) return;
        console.log('[keydown] 按鍵:', e.key, '代碼:', e.code, '鍵碼:', e.keyCode);
        
        // 處理遊戲按鍵 - 支援多種按鍵格式
        let key = e.key;
        let keyCode = e.code;
        
        // Mac 鍵盤特殊處理 - 加強空白鍵支援
        if (key === ' ' || key === 'Spacebar' || key === 'Space' || keyCode === 'Space' || e.keyCode === 32) {
            // 強制 SPACE UI 高亮
            let found = false;
            // 1. 先用 data-key=" " 查找
            let keyElement = document.querySelector('.key[data-key=" "]');
            if (keyElement) {
                keyElement.classList.add('active');
                setTimeout(() => keyElement.classList.remove('active'), 150);
                found = true;
            }
            // 2. 若找不到，再用 textContent 為 "SPACE" 查找
            if (!found) {
                document.querySelectorAll('.key').forEach(el => {
                    if (el.textContent.trim() === 'SPACE') {
                        el.classList.add('active');
                        setTimeout(() => el.classList.remove('active'), 150);
                        found = true;
                    }
                });
            }
            // 3. 若還是找不到，全部 .key 逐一加亮
            if (!found) {
                document.querySelectorAll('.key').forEach(el => {
                    el.classList.add('active');
                    setTimeout(() => el.classList.remove('active'), 150);
                });
            }
            // 仍然要執行遊戲判定
            key = ' ';
        } else {
            key = key.toUpperCase();
        }
        
        console.log('[keydown] 處理後按鍵:', key, '代碼:', keyCode);
        
        // 檢查是否為遊戲按鍵（支援多種格式）
        const validKeys = ['D', 'F', 'J', 'K', ' '];
        const validCodes = ['KeyD', 'KeyF', 'KeyJ', 'KeyK', 'Space'];
        
        const isValidKey = validKeys.includes(key);
        const isValidCode = validCodes.includes(keyCode);
        
        console.log('[keydown] 有效按鍵檢查:', { isValidKey, isValidCode, key, keyCode });
        
        if (isValidKey || isValidCode) {
            e.preventDefault();
            console.log('[keydown] 有效按鍵:', key);
            
            // 更新 UI 高亮 - 特別處理空白鍵
            let targetKey = key;
            if (key === ' ') {
                targetKey = ' ';
                console.log('[keydown] 空白鍵 UI 查找目標:', targetKey);
            }
            
            // 多種查找方法
            let keyElement = null;
            
            // 方法1: 用 data-key 查找
            keyElement = document.querySelector(`[data-key="${targetKey}"]`);
            console.log('[keydown] 方法1 - 查找 UI 元素:', `[data-key="${targetKey}"]`, '結果:', keyElement);
            
            // 方法2: 如果找不到，嘗試查找包含 SPACE 文字的元素
            if (!keyElement && key === ' ') {
                const allKeys = document.querySelectorAll('.key');
                for (let el of allKeys) {
                    if (el.textContent === 'SPACE') {
                        keyElement = el;
                        console.log('[keydown] 方法2 - 找到 SPACE 文字元素:', el);
                        break;
                    }
                }
            }
            
            // 方法3: 如果還是找不到，嘗試用代碼查找
            if (!keyElement) {
                const codeKey = keyCode === 'Space' ? ' ' : keyCode.replace('Key', '');
                keyElement = document.querySelector(`[data-key="${codeKey}"]`);
                console.log('[keydown] 方法3 - 用代碼查找:', `[data-key="${codeKey}"]`, '結果:', keyElement);
            }
            
            if (keyElement) {
                keyElement.classList.add('active');
                console.log('[keydown] 成功添加 active 類別到:', keyElement);
                setTimeout(() => {
                    keyElement.classList.remove('active');
                    console.log('[keydown] 移除 active 類別');
                }, 150);
            } else {
                console.warn('[keydown] 所有方法都找不到 UI 元素:', targetKey);
                // 最後嘗試：直接查找所有 .key 元素並顯示
                const allKeys = document.querySelectorAll('.key');
                console.log('[keydown] 所有 .key 元素:', allKeys);
                allKeys.forEach((el, i) => {
                    console.log(`[keydown] 元素 ${i}:`, el.textContent, el.dataset.key);
                });
            }
            
            // 遊戲進行中的判定
            if (gameStarted && !gamePaused && !gameEnded) {
                let currentKeys = ['D', 'F', 'J', 'K'];
                if (selectedDifficulty && LEVEL_CONFIGS[selectedDifficulty]) {
                    currentKeys = LEVEL_CONFIGS[selectedDifficulty].keys;
                }
                const keyIndex = currentKeys.findIndex(k => (k === ' ' ? key === ' ' : k.toUpperCase() === key));
                if (keyIndex !== -1) {
                    judgeNote(keyIndex);
                }
            }
        }
    });
    
    document.addEventListener('keyup', function(e) {
        if (!gameStarted || gamePaused || gameEnded) return;
        
        let key = e.key;
        if (key === ' ' || key === 'Spacebar' || key === 'Space') key = ' ';
        key = key.toUpperCase();
        
        let currentKeys = ['D', 'F', 'J', 'K'];
        if (selectedDifficulty && LEVEL_CONFIGS[selectedDifficulty]) {
            currentKeys = LEVEL_CONFIGS[selectedDifficulty].keys;
        }
        
        const keyIndex = currentKeys.findIndex(k => (k === ' ' ? key === ' ' : k.toUpperCase() === key));
        if (keyIndex !== -1 && holdKeyLane === keyIndex && holdKeyNote) {
            const judgeLineY = canvas.height - 100;
            const noteSpeed = LEVEL_CONFIGS[selectedDifficulty].speed;
            const tailY = (currentTime - (holdKeyNote.time + holdKeyNote.duration)) * noteSpeed;
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
                holdKeyNote.missed = true;
                holdKeyNote.animating = 'miss';
                resetCombo();
                showMissEffect();
                dynamicInteractionManager.triggerHoldBreakEffect();
            }
            holdKeyNote.holdActive = false;
            holdKeyLane = null;
            holdKeyNote = null;
            holdKeyStartTime = null;
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
    
    // 難度按鈕 class 對應表
    const diffClassMap = {
        beginner: 'beginner',
        casual: 'casual',
        hard: 'hard',
        extreme: 'extreme',
        master: 'master',
        fate: 'fate'
    };
    if (difficultyBtns) {
        difficultyBtns.forEach(btn => {
            const diff = btn.dataset.difficulty;
            // 先移除所有自訂難度 class
            btn.classList.remove('beginner', 'casual', 'hard', 'extreme', 'master', 'fate');
            // 加上對應 class
            if (diffClassMap[diff]) {
                btn.classList.add(diffClassMap[diff]);
            }
        });
    }

    // 移除自動啟動遊戲的邏輯，讓用戶手動選擇歌曲和難度
    console.log('遊戲已準備就緒，請選擇歌曲和難度後開始遊戲');

    // 高對比模式切換
    const contrastBtn = document.getElementById('contrast-btn');
    if (contrastBtn) {
        contrastBtn.addEventListener('click', function() {
            document.body.classList.toggle('high-contrast');
        });
    }
    // 載入/過場動畫控制
    window.showLoading = function() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) overlay.style.display = 'flex';
    };
    window.hideLoading = function() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) overlay.style.display = 'none';
    };
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

let GAME_DURATION = 60; // 遊戲時長（秒）

// ====== 音符資料管理 ======
let activeNotes = [];

function spawnNotes(noteData) {
    console.log('[spawnNotes] 開始設置音符數據', { noteDataLength: noteData ? noteData.length : 0 });
    
    // 僅允許根據 noteData 初始化 activeNotes，完全移除預設音符 fallback
    if (!noteData || noteData.length === 0) {
        console.warn('[spawnNotes] 音符數據為空，清空 activeNotes');
        activeNotes = [];
        return;
    }
    
    // 音符物件補齊必要欄位
    activeNotes = noteData.map((n, i) => ({
        ...n,
        duration: n.duration || 0,
        hit: false,
        missed: false,
        group: n.group || i
    }));
    
    console.log(`[spawnNotes] 音符設置完成 - 數量: ${activeNotes.length}`);
    console.log('[spawnNotes] 前3個音符:', activeNotes.slice(0, 3));
    
    // 驗證音符數據
    let validNotes = 0;
    activeNotes.forEach((note, i) => {
        if (note && typeof note.time === 'number' && typeof note.lane === 'number') {
            validNotes++;
        } else {
            console.warn(`[spawnNotes] 音符 ${i} 數據無效:`, note);
        }
    });
    
    console.log(`[spawnNotes] 有效音符數量: ${validNotes}/${activeNotes.length}`);
}

// 按鍵配置
const KEY_CONFIGS = {
    four: {
        'KeyD': 0,
        'KeyF': 1,
        'KeyJ': 2,
        'KeyK': 3
    },
    five: {
        'KeyD': 0,
        'KeyF': 1,
        'Space': 2,
        'KeyJ': 3,
        'KeyK': 4
    }
};

// 添加按鍵事件監聽
window.addEventListener('keydown', (event) => {
    if (!gameStarted || gamePaused || gameEnded) return;
    // 根據目前賽道數量選擇正確的key config
    const keyConfig = laneManager.laneCount === 5 ? KEY_CONFIGS.five : KEY_CONFIGS.four;
    const lane = keyConfig[event.code];
    if (lane !== undefined) {
        event.preventDefault(); // 防止空格鍵滾動頁面
        judgeNote(lane);
    }
});

// 在遊戲初始化時初始化特效管理器
function initGame() {
    // ... 其他初始化代碼 ...
    effectManager.init();
    // ... 其他初始化代碼 ...
}

// 特效管理器
const effectManager = {
    init() {
        // 初始化特效系統
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
    },
    
    triggerPerfectEffect(lane) {
        if (!this.canvas) return;
        
        // 獲取軌道位置
        const laneWidth = this.canvas.width / 5;
        const x = lane * laneWidth + laneWidth / 2;
        const y = this.canvas.height - 50; // 判定線位置
        
        // 創建閃光效果
        this.createFlashEffect(x, y);
    },
    
    triggerMissEffect(lane) {
        if (!this.canvas) return;
        
        const laneWidth = this.canvas.width / 5;
        const x = lane * laneWidth + laneWidth / 2;
        const y = this.canvas.height - 50;
        
        // 創建Miss效果
        this.createMissEffect(x, y);
    },
    
    createFlashEffect(x, y) {
        const ctx = this.ctx;
        ctx.save();
        
        // 創建漸變
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 50);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        // 繪製閃光
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, 50, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    },
    
    createMissEffect(x, y) {
        const ctx = this.ctx;
        ctx.save();
        
        // 繪製紅色X
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x - 20, y - 20);
        ctx.lineTo(x + 20, y + 20);
        ctx.moveTo(x + 20, y - 20);
        ctx.lineTo(x - 20, y + 20);
        ctx.stroke();
        
        ctx.restore();
    },
    
    playPerfectSound() {
        // 播放Perfect音效
        const audio = new Audio('perfect.mp3');
        audio.volume = 0.3;
        audio.play().catch(err => console.warn('無法播放音效:', err));
    },
    
    playFailSound() {
        // 播放Miss音效
        const audio = new Audio('miss.mp3');
        audio.volume = 0.3;
        audio.play().catch(err => console.warn('無法播放音效:', err));
    },
    
    checkFeverMode() {
        // 檢查是否進入Fever模式的邏輯
        if (combo >= 50) { // 當連擊數達到50時進入Fever模式
            this.triggerFeverMode();
        }
    },
    
    triggerFeverMode() {
        // Fever模式特效
        if (!this.canvas) return;
        
        const ctx = this.ctx;
        ctx.save();
        
        // 添加全屏發光效果
        const gradient = ctx.createLinearGradient(0, 0, this.canvas.width, 0);
        gradient.addColorStop(0, 'rgba(255, 215, 0, 0.2)');
        gradient.addColorStop(0.5, 'rgba(255, 215, 0, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 215, 0, 0.2)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        ctx.restore();
    }
};