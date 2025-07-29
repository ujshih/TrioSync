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
            'Noise': './Vibe_Coding組_王祐昇_運行程式及遊戲素材/audio/Noise.mp3',
            'Canon': './Vibe_Coding組_王祐昇_運行程式及遊戲素材/audio/Canon.mp3',
            'HammerMASTER': './Vibe_Coding組_王祐昇_運行程式及遊戲素材/audio/HammerMASTER.mp3',
            'InspiringDreams': './Vibe_Coding組_王祐昇_運行程式及遊戲素材/audio/InspiringDreams.mp3',
            'MagicalMoments': './Vibe_Coding組_王祐昇_運行程式及遊戲素材/audio/MagicalMoments.mp3',
            'MainTheme': './Vibe_Coding組_王祐昇_運行程式及遊戲素材/audio/MainTheme.mp3',
            'inspiringguitar': './Vibe_Coding組_王祐昇_運行程式及遊戲素材/audio/inspiringguitar.mp3',
            'HappyBirthday': './Vibe_Coding組_王祐昇_運行程式及遊戲素材/audio/HappyBirthday.mp3'
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
    
    // 取得全域音量
    getCurrentVolume() {
        const slider = document.getElementById('volume-slider');
        if (slider) return parseFloat(slider.value);
        return 1;
    },
    
    // 取得特定歌曲的音量（卡農比其他歌曲多0.2）
    getTrackVolume(trackName) {
        const baseVolume = this.getCurrentVolume();
        if (trackName === 'Canon') {
            return Math.min(baseVolume + 0.2, 1.0); // 卡農音量+0.2，但不超過1.0
        }
        return baseVolume;
    },
    
    fadeIn(audio, target = 1, step = 0.1, interval = 40) {
        clearInterval(this.fadeTimer);
        // audio.volume = 0; // 移除強制歸零
        audio.volume = target; // 使用傳入的目標音量
        
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
                audio.volume = target;
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
    
    // 立即停止所有音頻播放
    stopImmediately() {
        audioVisualizer.stop();
        if (this.audio) {
            console.log('停止音頻播放:', this.currentTrack);
            this.audio.pause();
            this.audio = null;
            this.currentType = null;
            this.currentTrack = null;
            this.showNowPlaying('');
        }
    },
    
    playBackground() {
        // 立即停止當前播放
        this.stopImmediately();
        
        const path = this.paths.bgm;
        this.preload(path);
        const audio = new Audio(path);
        Object.assign(audio, {
            loop: true,
            volume: this.getCurrentVolume(),
            onended: null,
            onerror: () => showToast('背景音樂播放失敗，請檢查音訊檔案或瀏覽器權限！')
        });
        this.audio = audio;
        this.currentType = 'bgm';
        this.currentTrack = 'Drive';
        this.showNowPlaying('Drive');
        this.fadeIn(audio, this.getCurrentVolume());
    },
    
    playPreview(trackName, offsetSec = null) {
        // 立即停止當前播放
        this.stopImmediately();
        
        const path = this.paths.tracks[trackName];
        if (!path) return showAudioError('找不到音樂檔案，請確認檔名與路徑正確！');
        
        this.preload(path);
        const audio = new Audio(path);
        Object.assign(audio, {
            loop: false,
            volume: this.getTrackVolume(trackName),
            currentTime: offsetSec ?? (trackName === 'Canon' ? 100 : 15),
            onended: null,
            onerror: () => showAudioError('音樂檔案載入失敗，請確認伺服器已啟動、檔案存在且名稱正確（大小寫）！')
        });
        
        this.audio = audio;
        this.currentType = 'preview';
        this.currentTrack = trackName;
        this.showNowPlaying(trackName);
        console.log('開始播放預覽:', trackName);
        this.fadeIn(audio, this.getTrackVolume(trackName));
        audio.onplay = hideAudioError;
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
        
        // 立即停止當前播放的音頻
        this.stopImmediately();
        
        // 創建新的音頻實例
        this.audio = new Audio(path);
        this.audio.volume = this.getTrackVolume(trackName); // 使用特定歌曲的音量設定
        
        // 設置音頻參數
        if (offsetSec !== null) {
            this.audio.currentTime = offsetSec;
        }
        
        // 設置音頻類型
        this.currentType = 'game';
        this.currentTrack = trackName;
        
        // 播放音頻
        const playPromise = this.audio.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                this.audio.volume = this.getTrackVolume(trackName);
                // 新增：自動重播機制
                this.audio.onended = () => {
                    if (window.gameStarted && !window.gameEnded) {
                        // 遊戲還在進行，重播
                        this.playGameTrack(trackName, 0, callback);
                    }
                };
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
        gradeThresholds: { S: 30, A: 20, B: 5, C: 1, D: 0 },
        comboForgiveness: 100,
        noteDensity: 1, // 固定值
        enName: "Beginner",
        stars: 1,
        speed: Math.round(120 * 0.6),
        density: 1, // 1.0–1.5
        keyCount: 4,
        missBuffer: 100, // 增加容錯次數，讓新手更容易
        desc: "✨ 基礎節奏入門！單鍵點擊、節奏緩和，讓你無壓力進入命運世界。",
        keys: ['D', 'F', 'J', 'K'],
        holdSupport: false,
        simultaneousNotes: 1,
        specialRules: "無長音支援，單音符為主",
        scoreGradeThresholds: { SSS: 140000, SS: 120000, S: 90000, A: 50000, B: 30000, C: 2000, D: 0 }
  },
    casual: {
        name: 'Casual',
        judgeWindow: 0.2,
        scoreMultiplier: 1,
        gradeThresholds: { S: 30, A: 20, B: 8, C: 1, D: 0 },
        comboForgiveness: 100,
        noteDensity: 1,
        enName: "Casual",
        stars: 2,
        speed: Math.round(150 * 0.6),
        density: 1, // 1.5–2.0
        keyCount: 4,
        missBuffer: 100,
        desc: "🎵 旋律稍起波瀾，簡短長音與雙鍵節奏交織，輕鬆享受流動的音樂律動。",
        keys: ['D', 'F', 'J', 'K'],
        holdSupport: true,
        holdType: "simple",
        simultaneousNotes: 1,
        specialRules: "簡單短長音支援",
        scoreGradeThresholds: { SSS: 150000, SS: 130000, S: 90000, A: 50000, B: 30000, C: 2000, D: 0 }
  },
    hard: {
        name: 'Hard',
        judgeWindow: 0.15,
        scoreMultiplier: 1,
        gradeThresholds: { S: 50, A: 40, B: 20, C: 5, D: 0 },
        comboForgiveness: 100,
        noteDensity: 1.25,
        enName: "Hard",
        stars: 3,
        speed: Math.round(180 * 0.6),
        density: 1.2, // 2.0–3.0
        keyCount: 4,
        missBuffer: 100,
        desc: "🔥 節奏加速進化！中長音與雙鍵組合考驗反應與穩定度，是實力的試煉場。",
        keys: ['D', 'F', 'J', 'K'],
        holdSupport: true,
        holdType: "medium",
        simultaneousNotes: 2,
        specialRules: "中長音支援，雙鍵常態",
        scoreGradeThresholds: { SSS: 160000, SS: 140000, S: 120000, A: 80000, B: 30000, C: 2000, D: 0 }
  },
    extreme: {
        name: 'Extreme',
        judgeWindow: 0.1,
        scoreMultiplier: 1.3,
        gradeThresholds: { S: 50, A: 40, B: 20, C: 5, D: 0 },
        comboForgiveness: 10,
        noteDensity: 1.5,
        enName: "Extreme",
        stars: 4,
        speed: Math.round(210 * 0.6),
        density: 1.5, // 3.0–4.0
        keyCount: 5,
        missBuffer: 10,
        desc: "⚡ 音流如電！高速節奏、多段長音、空白鍵加入，全面挑戰你的極限操作。",
        keys: ['D', 'F', ' ', 'J', 'K'],
        holdSupport: true,
        holdType: "multi",
        simultaneousNotes: 2,
        specialRules: "多段長音，Space鍵加入，判定鬆緊",
        scoreGradeThresholds: { SSS: 170000, SS: 150000, S: 130000, A: 100000, B: 30000, C: 2000, D: 0 }
  },
    master: {
        name: 'Master',
        judgeWindow: 0.09,
        scoreMultiplier: 1.5,
        gradeThresholds: { S: 50, A: 40, B: 20, C: 5, D: 0 },
        comboForgiveness: 10,
        noteDensity: 1.75,
        enName: "Master",
        stars: 5,
        speed: Math.round(220 * 0.6),
        density: 1.75, // 4.0–5.5
        keyCount: 5,
        missBuffer: 10,
        desc: "👑 節奏王者之道！節拍密集如雨、判定超嚴苛，特效爆閃，唯高手能穩步前行。",
        keys: ['D', 'F', ' ', 'J', 'K'],
        holdSupport: true,
        holdType: "intensive",
        simultaneousNotes: 3,
        specialRules: "長音密集，特效數多，節奏混淆",
        scoreGradeThresholds: { SSS: 180000, SS: 160000, S: 140000, A: 100000, B: 30000, C: 2000, D: 0 }
  },
    fate: {
        name: 'Fate Mode',
        judgeWindow: 0.06,
        scoreMultiplier: 2.0,
        gradeThresholds: { S: 50, A: 40, B: 20, C: 5, D: 0 },
        comboForgiveness: 10,
        noteDensity: [1.75, 2.5],
        enName: "Fate Mode",
        stars: 6,
        speed: Math.round(250 * 0.6),
        density: 1.75, // 5.5–6.5+
        keyCount: 5,
        missBuffer: 10,
        desc: "🌌 命運交響最終章！五鍵同列、極速連打、節奏錯亂，踏上無回之境的節奏試煉。",
        keys: ['D', 'F', ' ', 'J', 'K'],
        holdSupport: true,
        holdType: "special",
        simultaneousNotes: 3,
        specialRules: "特殊長音，高速連打，極限判定",
        locked: true,
        scoreGradeThresholds: { SSS: 190000, SS: 160000, S: 140000, A: 120000, B: 100000, C: 50000, D: 0 }
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

// 在全域變數區加上：
let perfectCount = 0;
let greatCount = 0;
let goodCount = 0;

// ===============================
// 畫面管理 (Screen Management)
// ===============================
function showScreen(screen) {
    console.log('[showScreen] 開始切換到畫面:', screen);
    if (!selectArea || !gameArea || !resultScreen) {
        selectArea = document.getElementById('select-area');
        gameArea = document.getElementById('game-area');
        resultScreen = document.getElementById('result-screen');
        console.log('[showScreen] DOM 元素檢查:', {
            selectArea: !!selectArea,
            gameArea: !!gameArea,
            resultScreen: !!resultScreen
        });
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
            // 重置遊戲狀態
            gameStarted = false;
            gameEnded = false;
            isCountingDown = false;
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
    // 控制 main-only-btn 顯示：主畫面與結算畫面顯示，其餘隱藏
    var mainOnlyBtns = document.querySelectorAll('.main-only-btn');
    mainOnlyBtns.forEach(function(btn) {
        btn.style.display = (screen === 'select' || screen === 'result') ? '' : 'none';
    });
}

// ===============================
// 音符生成 (Note Generation)
// ===============================
function generateNotes(difficulty, duration = 60) {
    const conf = LEVEL_CONFIGS[difficulty] || LEVEL_CONFIGS['beginner'];
    
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
    
    const notes = [];
    // 新增：記錄每個賽道的最後一個長音符結束時間
    let laneHoldEndTimes = Array(lanes.length).fill(0);
    
    // 確保至少有幾個音符
    const minNotes = Math.max(5, Math.floor(duration / 10));
    const actualNoteCount = Math.max(noteCount, minNotes);
    
    let attempts = 0;
    let i = 0;
    // 設定不同難度的音符截止秒數
    let cutoff = 2; // 預設
    if (difficulty === 'beginner' || difficulty === 'casual' || difficulty === 'hard') {
        cutoff = 4;
    } else if (difficulty === 'extreme' || difficulty === 'master' || difficulty === 'fate') {
        cutoff = 3;
    }
    while (i < actualNoteCount && attempts < actualNoteCount * 5) {
        // 均勻分布在 1~duration 內，避免在0秒時就有音符
        const t = 1 + (i * (duration - 1)) / actualNoteCount;
        // 新增：根據難度剩下 cutoff 秒不產生音符
        if (t > duration - cutoff) {
            i++;
            continue;
        }
        // 隨機選一個賽道
        const lane = Math.floor(Math.random() * lanes.length);
        
        // 檢查這個賽道是否在長音符期間
        if (t < laneHoldEndTimes[lane]) {
            attempts++;
            continue; // 跳過這個音符，換下一個嘗試
        }
        
        // 添加一些變化：偶爾生成長音符
        let noteDuration = 0;
        if (Math.random() < 0.2 && conf.holdSupport) {
            noteDuration = 0.5 + Math.random() * 1.5; // 0.5-2秒的長音符
        }
        // 如果是長音符，更新該賽道的結束時間
        if (noteDuration > 0) {
            laneHoldEndTimes[lane] = t + noteDuration;
        }
        
        notes.push({ 
            time: t, 
            lane,
            duration: 0, // 強制為 0
            hit: false,
            missed: false,
            group: i
        });
        i++;
        attempts++;
    }
    
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
    canvas.height = Math.min(containerHeight - 120, 500); // 預留底部空間給key hints
    
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
    console.log('startGame 被調用');
    console.log('當前狀態:', {
        gameStarted: gameStarted,
        isCountingDown: isCountingDown,
        selectedSong: selectedSong,
        selectedDifficulty: selectedDifficulty
    });
    
    if (gameStarted || isCountingDown) {
        console.log('遊戲已開始或正在倒數，返回');
        return;
    }
    if (!selectedSong || !selectedDifficulty) {
        console.log('歌曲或難度未選擇，顯示提示');
        showToast('請先選擇歌曲與難度');
        return;
    }
    console.log('開始遊戲流程');
    // 切換到遊戲畫面
    showScreen('game');
    // 倒數三秒後才開始遊戲
    showCountdown(realStartGame);
    const config = LEVEL_CONFIGS[selectedDifficulty];
    missBufferCount = config ? config.missBuffer : 0;
    setMissBufferCount(missBufferCount);
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
        spawnNotes(window.gameNoteData);
    } else {
        console.warn('[realStartGame] 沒有找到音符數據，重新生成');
        let noteData = generateNotes(selectedDifficulty, GAME_DURATION);
        if (noteData && noteData.length > 0) {
            spawnNotes(noteData);
        } else {
            console.error('[realStartGame] 音符數據生成失敗');
        }
    }
    
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
    if (trackName === 'Canon') offset = 140;
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
        if (activeNotes && activeNotes.length > 0) {
            activeNotes.forEach((note, i) => {
                const noteY = (currentTime - note.time) * LEVEL_CONFIGS[selectedDifficulty].speed;
            });
        }
    };
    
    // 添加強制音符生成測試
    window.forceGenerateNotes = function() {
        if (!selectedDifficulty) {
            console.error('未選擇難度');
            return;
        }
        
        const noteData = generateNotes(selectedDifficulty, GAME_DURATION);
        
        if (noteData && noteData.length > 0) {
            spawnNotes(noteData);
        }
    };
    
    // 添加音符位置測試
    window.testNotePositions = function() {
        if (!activeNotes || activeNotes.length === 0) {
            return;
        }
        
        const config = LEVEL_CONFIGS[selectedDifficulty];
        const noteSpeed = config.speed;
        
        activeNotes.forEach((note, i) => {
            const noteY = (currentTime - note.time) * noteSpeed;
            const noteX = (note.lane + 0.5) * (canvas.width / laneManager.laneCount);
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
        if (remain <= 5) {
            timerDisplay.classList.add('timer-danger');
        } else {
            timerDisplay.classList.remove('timer-danger');
        }
    }
    
    // 畫面震動效果（已停用）
    /*
    if (screenShake > 0) {
        ctx.save();
        const shakeX = (Math.random() - 0.5) * screenShake;
        const shakeY = (Math.random() - 0.5) * screenShake;
        ctx.translate(shakeX, shakeY);
    }
    */
    
    drawBackground(ctx);
    
    // 繪製賽道（中央霓虹引導線）
    laneManager.drawLanes(ctx, canvas);
    

    
    drawNotes(now);
    
    // 更新和繪製音符特效
    noteEffectManager.update();
    noteEffectManager.draw(ctx);
    
    // 更新和繪製判定線閃光效果
    judgeLineFlashManager.update();
    judgeLineFlashManager.draw(ctx, canvas);
    
    // 恢復畫面震動（已停用）
    /*
    if (screenShake > 0) {
        ctx.restore();
    }
    */
    
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
    },
    
    getLaneConfig(laneIndex) {
        return this.laneConfigs[laneIndex % this.laneConfigs.length];
    },
    
    drawLanes(ctx, canvas) {
        const laneWidth = canvas.width / this.laneCount;
        ctx.save();
        // 透視參數
        const perspective = 800;
        const rotateX = 8 * Math.PI / 180;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        ctx.translate(centerX, centerY);
        ctx.transform(1, 0, 0, Math.cos(rotateX), 0, 0);
        ctx.translate(-centerX, -centerY);
        // clip-path 與 drawLanes 一致
        ctx.beginPath();
        ctx.moveTo(canvas.width * 0.01, 0);
        ctx.lineTo(canvas.width * 0.99, 0);
        ctx.lineTo(canvas.width * 0.99, canvas.height);
        ctx.lineTo(canvas.width * 0.01, canvas.height);
        ctx.closePath();
        ctx.clip();

        // === 1. 賽道主體（梯形） ===
        const bottomLeft = canvas.width * 0.01;
        const bottomRight = canvas.width * 0.99;
        const vanishX = canvas.width / 2;
        const vanishY = 0;
        for (let i = 0; i < this.laneCount; i++) {
            // 下方左右分隔點
            const tL = i / this.laneCount;
            const tR = (i + 1) / this.laneCount;
            const xL = bottomLeft + tL * (bottomRight - bottomLeft);
            const xR = bottomLeft + tR * (bottomRight - bottomLeft);
            const yB = canvas.height;
            // 上方都聚焦到消失點
            const xVanish = vanishX;
            const yVanish = vanishY;

            // 動態配色處理
            const config = this.getLaneConfig(i);
            let laneColor = config.color;
            let glowIntensity = 1.0;
            if (laneGlowStates[i] === 1) {
                laneColor = '#FFFFFF';
                glowIntensity = 2.5;
            } else if (laneGlowStates[i] === 2) {
                laneColor = '#FFD700';
                glowIntensity = 3.0;
            } else if (laneGlowStates[i] === 3) {
                laneColor = '#FFFFFF';
                glowIntensity = 2.0;
            } else if (laneGlowStates[i] === 4) {
                laneColor = '#FFFFFF';
                glowIntensity = 1.8;
            }

            // 賽道主體 - 梯形區塊
            let laneGradient;
            if (laneGlowStates[i] === 1) {
                laneGradient = ctx.createLinearGradient((xL + xR) / 2, yVanish, (xL + xR) / 2, yB);
                laneGradient.addColorStop(0, `${laneColor}44`);
                laneGradient.addColorStop(0.5, `${laneColor}66`);
                laneGradient.addColorStop(1, `${laneColor}88`);
            } else if (laneGlowStates[i] === 2) {
                laneGradient = ctx.createLinearGradient((xL + xR) / 2, yVanish, (xL + xR) / 2, yB);
                laneGradient.addColorStop(0, `${laneColor}33`);
                laneGradient.addColorStop(0.7, `${laneColor}55`);
                laneGradient.addColorStop(1, `${laneColor}77`);
            } else if (laneGlowStates[i] === 3) {
                laneGradient = ctx.createLinearGradient((xL + xR) / 2, yVanish, (xL + xR) / 2, yB);
                laneGradient.addColorStop(0, `${laneColor}22`);
                laneGradient.addColorStop(0.6, `${laneColor}44`);
                laneGradient.addColorStop(1, `${laneColor}66`);
            } else if (laneGlowStates[i] === 4) {
                laneGradient = ctx.createLinearGradient((xL + xR) / 2, yVanish, (xL + xR) / 2, yB);
                laneGradient.addColorStop(0, `${laneColor}11`);
                laneGradient.addColorStop(0.5, `${laneColor}33`);
                laneGradient.addColorStop(1, `${laneColor}55`);
            } else {
                laneGradient = ctx.createLinearGradient((xL + xR) / 2, yVanish, (xL + xR) / 2, yB);
                laneGradient.addColorStop(0, 'rgba(255,255,255,0.05)');
                laneGradient.addColorStop(0.3, `${laneColor}26`);
                laneGradient.addColorStop(0.7, `${laneColor}26`);
                laneGradient.addColorStop(1, 'rgba(255,255,255,0.05)');
            }
            ctx.save();
            ctx.fillStyle = laneGradient;
            ctx.globalAlpha = 1.0;
            ctx.shadowColor = laneColor;
            ctx.shadowBlur = 20 * glowIntensity;
            ctx.beginPath();
            ctx.moveTo(xL, yB);
            ctx.lineTo(xR, yB);
            ctx.lineTo(xVanish, yVanish);
            ctx.lineTo(xVanish, yVanish);
            ctx.closePath();
            ctx.fill();
            ctx.restore();

            // 賽道邊緣發光線
            ctx.save();
            ctx.strokeStyle = laneColor;
            ctx.lineWidth = 3 * glowIntensity;
            ctx.shadowColor = laneColor;
            ctx.shadowBlur = 15 * glowIntensity;
            ctx.beginPath();
            ctx.moveTo(xL, yB);
            ctx.lineTo(xVanish, yVanish);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(xR, yB);
            ctx.lineTo(xVanish, yVanish);
            ctx.stroke();
            ctx.restore();

            // 賽道中心線 - 透視收斂
            ctx.save();
            const xC = (xL + xR) / 2;
            const centerGradient = ctx.createLinearGradient(xC, yB, vanishX, vanishY);
            centerGradient.addColorStop(0, `${laneColor}CC`);
            centerGradient.addColorStop(0.5, `${laneColor}4D`);
            centerGradient.addColorStop(1, `${laneColor}1A`);
            ctx.strokeStyle = centerGradient;
            ctx.lineWidth = 4 * glowIntensity;
            ctx.shadowBlur = 20 * glowIntensity;
            // 虛線樣式
            if (laneGlowStates[i] === 1) {
                ctx.setLineDash([]);
            } else if (laneGlowStates[i] === 2) {
                ctx.setLineDash([8, 3]);
            } else if (laneGlowStates[i] === 3) {
                ctx.setLineDash([12, 4]);
            } else if (laneGlowStates[i] === 4) {
                ctx.setLineDash([15, 5]);
            } else {
                ctx.setLineDash([15, 5]);
            }
            ctx.beginPath();
            ctx.moveTo(xC, yB);
            ctx.lineTo(vanishX, vanishY);
            ctx.stroke();
            ctx.restore();
        }

        // === 2. 畫有透視的分隔虛線 ===
        for (let i = 0; i <= this.laneCount; i++) {
            const t = i / this.laneCount;
            const startX = bottomLeft + t * (bottomRight - bottomLeft);
            const startY = canvas.height;
            const endX = vanishX;
            const endY = vanishY;
            let laneColor = '#00CFFF';
            let glowIntensity = 1.0;
            if (i > 0 && i < this.laneCount) {
                const config = this.getLaneConfig(i - 1);
                laneColor = config.color;
                if (laneGlowStates[i - 1] === 1) {
                    laneColor = '#FFFFFF';
                    glowIntensity = 2.5;
                } else if (laneGlowStates[i - 1] === 2) {
                    laneColor = '#FFD700';
                    glowIntensity = 3.0;
                } else if (laneGlowStates[i - 1] === 3) {
                    laneColor = '#FFFFFF';
                    glowIntensity = 2.0;
                } else if (laneGlowStates[i - 1] === 4) {
                    laneColor = '#FFFFFF';
                    glowIntensity = 1.8;
                }
            }
            ctx.save();
            ctx.strokeStyle = laneColor;
            ctx.lineWidth = 2.5 * glowIntensity;
            ctx.shadowColor = laneColor;
            ctx.shadowBlur = 10 * glowIntensity;
            if (i > 0 && i < this.laneCount) {
                if (laneGlowStates[i - 1] === 1) {
                    ctx.setLineDash([]);
                } else if (laneGlowStates[i - 1] === 2) {
                    ctx.setLineDash([4, 2]);
                } else if (laneGlowStates[i - 1] === 3) {
                    ctx.setLineDash([6, 3]);
                } else if (laneGlowStates[i - 1] === 4) {
                    ctx.setLineDash([8, 4]);
                } else {
                    ctx.setLineDash([8, 4]);
                }
            } else {
                ctx.setLineDash([8, 4]);
            }
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
            ctx.restore();
        }
        ctx.restore();
    }
};

// 按鍵高亮效果管理器
const keyHighlightManager = {
    triggerHighlight(lane, type) {
        const keyElement = document.querySelector(`[data-key="${KEY_LIST[lane]}"]`);
        if (!keyElement) return;
        
        // 移除之前的動畫類別
        keyElement.classList.remove('perfect-hit', 'great-hit', 'good-hit');
        
        // 添加新的動畫類別
        keyElement.classList.add(`${type}-hit`);
        
        // 動畫結束後移除類別，統一為短持續時間
        const duration = 300; // 統一為300ms
        setTimeout(() => {
            keyElement.classList.remove(`${type}-hit`);
        }, duration);
    }
};

// 判定線閃光效果管理器
const judgeLineFlashManager = {
    flashes: [],
    
    createFlash(lane, type) {
        const flash = {
            lane: lane,
            type: type,
            startTime: Date.now(),
            duration: 300, // 統一為短持續時間
            alpha: 1.0,
            scale: 0.5,
            maxScale: 1.3 // 統一縮放效果
        };
        this.flashes.push(flash);
    },
    
    update() {
        const now = Date.now();
        this.flashes = this.flashes.filter(flash => {
            const elapsed = now - flash.startTime;
            if (elapsed >= flash.duration) {
                return false;
            }
            const progress = elapsed / flash.duration;
            flash.alpha = 1.0 - progress;
            flash.scale = 0.5 + (flash.maxScale - 0.5) * Math.sin(progress * Math.PI);
            return true;
        });
    },
    
    draw(ctx, canvas) {
        if (this.flashes.length === 0) return;
        
        const laneWidth = canvas.width / laneManager.laneCount;
        const judgeLineY = canvas.height - JUDGE_LINE.POSITION;
        
        this.flashes.forEach(flash => {
            const laneX = (flash.lane + 0.5) * laneWidth;
            const color = '#FFFFFF'; // 統一使用白色
            
            ctx.save();
            ctx.globalAlpha = flash.alpha;
            ctx.fillStyle = color;
            ctx.shadowColor = color;
            ctx.shadowBlur = 20;
            
            // 繪製閃光矩形
            const baseFlashWidth = laneWidth * 0.6;
            const baseFlashHeight = 8;
            const flashWidth = baseFlashWidth * flash.scale;
            const flashHeight = baseFlashHeight * flash.scale;
            
            ctx.fillRect(laneX - flashWidth / 2, judgeLineY - flashHeight / 2, flashWidth, flashHeight);
            
            // 添加外層光暈
            ctx.save();
            ctx.globalAlpha = flash.alpha * 0.3;
            ctx.shadowBlur = 30;
            ctx.fillRect(laneX - flashWidth / 2, judgeLineY - flashHeight / 2, flashWidth, flashHeight);
            ctx.restore();
            
            ctx.restore();
        });
    }
};

// 動態互動管理器
const dynamicInteractionManager = {
    // Miss特效 - 賽道轉灰 + 慢速消散
    triggerMissEffect(lane) {
        // 註解：不做任何Miss特效
        // missLanes.add(lane);
        // laneGlowStates[lane] = -1; // 負值表示Miss狀態
        // setTimeout(() => {
        //     missLanes.delete(lane);
        //     laneGlowStates[lane] = 0;
        // }, 3000);
    },
    
    // Perfect特效 - 煙火式光圈擴散
    triggerPerfectEffect(lane) {
        laneGlowStates[lane] = 1; // 正值表示Perfect狀態
        
        // 0.3秒後恢復，統一為短持續時間
        setTimeout(() => {
            laneGlowStates[lane] = 0;
        }, 300);
        
        // 獲取賽道顏色
        const laneConfig = laneManager.getLaneConfig(lane);
        const laneColor = laneConfig ? laneConfig.color : '#FFFFFF';
        
        // 計算特效位置（賽道中心）
        const laneWidth = canvas.width / laneManager.laneCount;
        const x = (lane + 0.5) * laneWidth;
        const y = canvas.height * 0.8; // 判定線位置
        
        // 觸發煙火式特效
        noteEffectManager.createGoldenFlashEffect(x, y, 1.2, laneColor);
        
        // 播放Perfect音效（如果有）
        this.playPerfectSound();
    },
    
    // Great特效 - 白色高亮
    triggerGreatEffect(lane) {
        laneGlowStates[lane] = 3; // 3表示Great狀態
        
        // 0.3秒後恢復，統一為短持續時間
        setTimeout(() => {
            laneGlowStates[lane] = 0;
        }, 300);
    },
    
    // Good特效 - 白色高亮
    triggerGoodEffect(lane) {
        laneGlowStates[lane] = 4; // 4表示Good狀態
        
        // 0.3秒後恢復，統一為短持續時間
        setTimeout(() => {
            laneGlowStates[lane] = 0;
        }, 300);
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
    
    // 煙火式光圈擴散特效 - 擊中時多層光圈擴散 + 彩色微粒散射
    createGoldenFlashEffect(x, y, intensity = 1.0, laneColor = '#FFFFFF') {
        const baseIntensity = Math.min(2.5, intensity + this.comboLevel * 0.4);
        
        // 多層光圈擴散效果 - 縮短持續時間
        for (let layer = 0; layer < 3; layer++) { // 減少層數從5層到3層
            const layerDelay = layer * 30; // 縮短延遲從50ms到30ms
            const layerSize = 15 + layer * 10; // 縮小光圈大小
            const layerAlpha = 0.6 - layer * 0.2; // 降低透明度
            
            setTimeout(() => {
                // 主光圈
                for (let i = 0; i < 8; i++) { // 減少粒子數量從12個到8個
                    this.particles.push({
                        x: x,
                        y: y,
                        vx: Math.cos(i * Math.PI / 4) * 3 * baseIntensity, // 增加速度
                        vy: Math.sin(i * Math.PI / 4) * 3 * baseIntensity,
                        life: 1.0,
                        decay: 0.03, // 加快消失速度
                        size: layerSize,
                        color: laneColor,
                        type: 'fireworkRing',
                        rotation: 0,
                        rotationSpeed: 0,
                        scale: 1.0,
                        alpha: layerAlpha,
                        baseSize: layerSize
                    });
                }
                
                // 內圈亮點 - 減少數量
                for (let i = 0; i < 4; i++) { // 從8個減少到4個
                    this.particles.push({
                        x: x,
                        y: y,
                        vx: Math.cos(i * Math.PI / 2) * 2 * baseIntensity,
                        vy: Math.sin(i * Math.PI / 2) * 2 * baseIntensity,
                        life: 1.0,
                        decay: 0.04, // 加快消失速度
                        size: 6 + layer * 2, // 縮小尺寸
                        color: '#FFFFFF',
                        type: 'fireworkCore',
                        rotation: 0,
                        rotationSpeed: 0,
                        scale: 1.0,
                        alpha: 0.8 // 降低透明度
                    });
                }
            }, layerDelay);
        }
        
        // 彩色微粒散射 - 減少數量和持續時間
        const colorVariations = [
            laneColor,
            this.lightenColor(laneColor, 0.3),
            this.darkenColor(laneColor, 0.2),
            '#FFFFFF'
        ];
        
        for (let i = 0; i < 15 * baseIntensity; i++) { // 減少微粒數量從30個到15個
            this.particles.push({
                x: x + (Math.random() - 0.5) * 20, // 縮小散射範圍
                y: y + (Math.random() - 0.5) * 20,
                vx: (Math.random() - 0.5) * 12 * baseIntensity, // 增加速度
                vy: (Math.random() - 0.5) * 12 * baseIntensity,
                life: 1.0,
                decay: 0.025 + Math.random() * 0.01, // 加快消失速度
                size: Math.random() * 4 + 2, // 縮小尺寸
                color: colorVariations[Math.floor(Math.random() * colorVariations.length)],
                type: 'fireworkSpark',
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.8,
                scale: 1.0,
                alpha: 0.7 // 降低透明度
            });
        }
        
        // 快速衝擊圈
        this.createQuickShockwave(x, y, baseIntensity, laneColor);
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
    
    // 快速衝擊圈特效 - 單層快速擴散
    createQuickShockwave(x, y, intensity = 1.0, laneColor = '#FFFFFF') {
        // 單一快速衝擊圈
        this.shockwaves.push({
            x: x,
            y: y,
            radius: 0,
            maxRadius: 80 * intensity,
            life: 1.0,
            decay: 0.05, // 快速消失
            color: laneColor,
            thickness: 2 * intensity, // 更細的線條
            type: 'quick'
        });
    },
    
    // 增強版音浪衝擊圈特效 - 多層彩色光圈（保留作為備用）
    createEnhancedShockwave(x, y, intensity = 1.0, laneColor = '#FFFFFF') {
        // 主衝擊圈
        this.shockwaves.push({
            x: x,
            y: y,
            radius: 0,
            maxRadius: 100 * intensity,
            life: 1.0,
            decay: 0.025,
            color: laneColor,
            thickness: 4 * intensity,
            type: 'main'
        });
        
        // 外層光暈圈
        this.shockwaves.push({
            x: x,
            y: y,
            radius: 0,
            maxRadius: 120 * intensity,
            life: 1.0,
            decay: 0.02,
            color: this.lightenColor(laneColor, 0.5),
            thickness: 2 * intensity,
            type: 'outer'
        });
        
        // 內層亮圈
        this.shockwaves.push({
            x: x,
            y: y,
            radius: 0,
            maxRadius: 60 * intensity,
            life: 1.0,
            decay: 0.03,
            color: '#FFFFFF',
            thickness: 3 * intensity,
            type: 'inner'
        });
    },
    
    // 顏色處理函數
    lightenColor(color, amount) {
        const hex = color.replace('#', '');
        const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + Math.floor(255 * amount));
        const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + Math.floor(255 * amount));
        const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + Math.floor(255 * amount));
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    },
    
    darkenColor(color, amount) {
        const hex = color.replace('#', '');
        const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - Math.floor(255 * amount));
        const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - Math.floor(255 * amount));
        const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - Math.floor(255 * amount));
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    },
    
    // 原始音浪衝擊圈特效（保留作為備用）
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
            // 快速衝擊圈擴散得更快
            const speed = shockwave.type === 'quick' ? 8 : 5;
            shockwave.radius += speed;
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
            
            // 根據類型調整效果
            if (shockwave.type === 'quick') {
                // 快速衝擊圈 - 更透明，更快的消失
                ctx.globalAlpha = shockwave.life * 0.5;
                ctx.shadowBlur = 5;
            } else if (shockwave.type === 'outer') {
                ctx.globalAlpha = shockwave.life * 0.6;
                ctx.shadowBlur = 12;
            } else if (shockwave.type === 'inner') {
                ctx.globalAlpha = shockwave.life * 0.8;
                ctx.shadowBlur = 20;
            } else {
                ctx.shadowBlur = shockwave.type === 'main' ? 15 : 8;
            }
            
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
                case 'fireworkRing':
                    // 煙火光圈
                    ctx.globalAlpha = particle.life * (particle.alpha || 0.8);
                    ctx.beginPath();
                    ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
                    ctx.strokeStyle = particle.color;
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    break;
                case 'fireworkCore':
                    // 煙火核心亮點
                    ctx.globalAlpha = particle.life * (particle.alpha || 1.0);
                    ctx.beginPath();
                    ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
                    ctx.fillStyle = particle.color;
                    ctx.fill();
                    break;
                case 'fireworkSpark':
                    // 煙火微粒
                    ctx.globalAlpha = particle.life * (particle.alpha || 0.9);
                    this.drawSpark(ctx, particle.size);
                    break;
                case 'goldenHalo':
                    // 金白光暈（保留原有效果）
                    ctx.beginPath();
                    ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                case 'goldenSpark':
                    // 金白微粒（保留原有效果）
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

// ==== 靜態星空資料（只初始化一次）====
let staticStars = null;
function getStaticStars(canvas) {
    if (staticStars && staticStars.width === canvas.width && staticStars.height === canvas.height) return staticStars.stars;
    // 重新生成
    const stars = [];
    const count = Math.floor((canvas.width * canvas.height) / 1800); // 根據畫面大小調整星星數量
    for (let i = 0; i < count; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 1.2 + 0.3,
            color: Math.random() > 0.97 ? '#ffe066' : (Math.random() > 0.7 ? '#fff' : '#b5d9ff'),
            alpha: Math.random() * 0.7 + 0.3
        });
    }
    staticStars = { width: canvas.width, height: canvas.height, stars };
    return stars;
}

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
    if (!isFinite(canvas.width) || !isFinite(canvas.height) || canvas.width <= 0 || canvas.height <= 0) {
        console.warn('[drawBackground] canvas 尺寸異常', { width: canvas.width, height: canvas.height });
        return;
    }
    // 1. 畫漸層底色
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(canvas.width, canvas.height) * 0.6);
    grad.addColorStop(0, '#0D0E52');
    grad.addColorStop(0.3, '#1C1C80');
    grad.addColorStop(0.7, '#2A1B3D');
    grad.addColorStop(1, '#000');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // 2. 畫靜態星空
    const stars = getStaticStars(canvas);
    for (const s of stars) {
        ctx.save();
        ctx.globalAlpha = s.alpha;
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
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
    
    // 透視梯形參數
    const bottomLeft = canvas.width * 0.01;
    const bottomRight = canvas.width * 0.99;
    const vanishX = canvas.width / 2;
    const vanishY = 0;
    
    // 應用與CSS一致的3D透視變換
    ctx.save();
    
    // 設置透視變換，與CSS中的 perspective(800px) rotateX(8deg) 保持一致
    const perspective = 800;
    const rotateX = 8 * Math.PI / 180; // 8度轉弧度
    
    // 計算透視變換矩陣
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // 應用透視變換
    ctx.translate(centerX, centerY);
    ctx.transform(
        1, 0,
        0, Math.cos(rotateX),
        0, 0
    );
    ctx.translate(-centerX, -centerY);
    
    // 應用clip-path效果，模擬CSS中的polygon(25% 0, 75% 0, 100% 100%, 0 100%)
    ctx.beginPath();
    ctx.moveTo(canvas.width * 0.25, 0);
    ctx.lineTo(canvas.width * 0.75, 0);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.closePath();
    ctx.clip();
    activeNotes.forEach((note, index) => {
        if (!note) return;
        const noteY = (currentTime - note.time) * noteSpeed;
        // === 梯形插值計算 X ===
        const tL = note.lane / laneCount;
        const tR = (note.lane + 1) / laneCount;
        // 下方左右
        const xL0 = bottomLeft + tL * (bottomRight - bottomLeft);
        const xR0 = bottomLeft + tR * (bottomRight - bottomLeft);
        // 插值比例
        const yRatio = 1 - (noteY / canvas.height);
        // 當前高度的左右邊界
        const xL = xL0 + (vanishX - xL0) * yRatio;
        const xR = xR0 + (vanishX - xR0) * yRatio;
        // 音符中心
        const noteX = xL + (xR - xL) * 0.5;
        // === 音符縮放 ===
        const minScale = 0.4;
        const maxScale = 1.0;
        let scale = minScale + (maxScale - minScale) * (noteY / canvas.height);
        scale = Math.max(minScale, Math.min(maxScale, scale));
        

        
        if (noteY > -50 && noteY < canvas.height + 50 && !note.hit && !note.missed) {
            drawn++;
            // 長音符 - 宇宙能量光束
            if (note.duration && note.duration > 0) {
                const tailY = (currentTime - (note.time + note.duration)) * noteSpeed;
                
                // 獲取賽道配置
                const laneConfig = laneManager.getLaneConfig(note.lane);
                const laneColor = laneConfig.color;
                
                // 光束主體
                ctx.save();
                const beamGradient = ctx.createLinearGradient(noteX - 20 * scale, noteY, noteX + 20 * scale, noteY);
                beamGradient.addColorStop(0, `${laneColor}1A`);
                beamGradient.addColorStop(0.5, note.holdActive ? 'rgba(255, 247, 0, 0.8)' : `${laneColor}CC`);
                beamGradient.addColorStop(1, `${laneColor}1A`);
                ctx.fillStyle = beamGradient;
                ctx.shadowColor = note.holdActive ? '#fff700' : laneColor;
                ctx.shadowBlur = (note.holdActive ? 30 : 20) * scale;
                ctx.fillRect(noteX - 20 * scale, tailY, 40 * scale, noteY - tailY);
                ctx.restore();
                
                // 光束邊緣發光
                ctx.save();
                ctx.strokeStyle = note.holdActive ? '#fff700' : laneColor;
                ctx.lineWidth = 4 * scale;
                ctx.shadowColor = note.holdActive ? '#fff700' : laneColor;
                ctx.shadowBlur = (note.holdActive ? 25 : 15) * scale;
                ctx.beginPath();
                ctx.moveTo(noteX - 18 * scale, noteY);
                ctx.lineTo(noteX - 18 * scale, tailY);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(noteX + 18 * scale, noteY);
                ctx.lineTo(noteX + 18 * scale, tailY);
                ctx.stroke();
                ctx.restore();
                
                // 頭部能量球
                ctx.save();
                // 外層光暈
                const headGradient = ctx.createRadialGradient(noteX, noteY, 0, noteX, noteY, 40 * scale);
                headGradient.addColorStop(0, note.holdActive ? 'rgba(255, 247, 0, 0.8)' : `${laneColor}CC`);
                headGradient.addColorStop(0.7, note.holdActive ? 'rgba(255, 247, 0, 0.3)' : `${laneColor}4D`);
                headGradient.addColorStop(1, 'transparent');
                ctx.fillStyle = headGradient;
                ctx.beginPath();
                if (40 * scale > 0) ctx.arc(noteX, noteY, 40 * scale, 0, Math.PI * 2);
                ctx.fill();
                
                // 核心
                ctx.beginPath();
                if (24 * scale > 0) ctx.arc(noteX, noteY, 24 * scale, 0, Math.PI * 2);
                ctx.fillStyle = note.holdActive ? '#fff700' : laneColor;
                ctx.shadowColor = note.holdActive ? '#fff700' : laneColor;
                ctx.shadowBlur = 25 * scale;
                ctx.fill();
                
                // 內核
                ctx.beginPath();
                if (12 * scale > 0) ctx.arc(noteX, noteY, 12 * scale, 0, Math.PI * 2);
                ctx.fillStyle = '#fff';
                ctx.shadowColor = '#fff';
                ctx.shadowBlur = 15 * scale;
                ctx.fill();
                ctx.restore();
                
                // 尾部能量球
                ctx.save();
                const tailGradient = ctx.createRadialGradient(noteX, tailY, 0, noteX, tailY, 25 * scale);
                tailGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
                tailGradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.3)');
                tailGradient.addColorStop(1, 'transparent');
                ctx.fillStyle = tailGradient;
                ctx.beginPath();
                if (25 * scale > 0) ctx.arc(noteX, tailY, 25 * scale, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.beginPath();
                if (18 * scale > 0) ctx.arc(noteX, tailY, 18 * scale, 0, Math.PI * 2);
                ctx.fillStyle = '#fff';
                ctx.shadowColor = '#fff';
                ctx.shadowBlur = 12 * scale;
                ctx.fill();
                ctx.restore();
            } else {
                // 短音符 - 銀河能量球效果
                ctx.save();
                
                // 獲取賽道配置
                const laneConfig = laneManager.getLaneConfig(note.lane);
                const laneColor = laneConfig.color;
                
                // 軌跡效果 - 與賽道中心線方向一致且長度短
                ctx.save();
                // 計算該賽道中心線的消失點方向
                const tL = note.lane / laneCount;
                const tR = (note.lane + 1) / laneCount;
                const xL0 = bottomLeft + tL * (bottomRight - bottomLeft);
                const xR0 = bottomLeft + tR * (bottomRight - bottomLeft);
                const yRatio = 1 - (noteY / canvas.height);
                const xL = xL0 + (vanishX - xL0) * yRatio;
                const xR = xR0 + (vanishX - xR0) * yRatio;
                const xC = xL + (xR - xL) * 0.5;
                // 拖尾方向：從音符圓心往該賽道消失點方向
                const dx = vanishX - xC;
                const dy = vanishY - noteY;
                const len = Math.sqrt(dx*dx + dy*dy);
                const unitX = dx / len;
                const unitY = dy / len;
                const shortLen = 60 * scale;
                const trailStartX = noteX + unitX * shortLen;
                const trailStartY = noteY + unitY * shortLen;
                const trailEndX = noteX;
                const trailEndY = noteY;
                const trailGradient = ctx.createLinearGradient(trailStartX, trailStartY, trailEndX, trailEndY);
                trailGradient.addColorStop(0, `${laneColor}00`);
                trailGradient.addColorStop(0.3, `${laneColor}4D`);
                trailGradient.addColorStop(1, `${laneColor}CC`);
                ctx.strokeStyle = trailGradient;
                ctx.lineWidth = 6 * scale;
                ctx.lineCap = 'round';
                ctx.shadowColor = laneColor;
                ctx.shadowBlur = 10 * scale;
                ctx.beginPath();
                ctx.moveTo(trailStartX, trailStartY);
                ctx.lineTo(trailEndX, trailEndY);
                ctx.stroke();
                ctx.restore();
                
                // 外層光暈
                const gradient = ctx.createRadialGradient(noteX, noteY, 0, noteX, noteY, 45 * scale);
                gradient.addColorStop(0, `${laneColor}E6`);
                gradient.addColorStop(0.6, `${laneColor}66`);
                gradient.addColorStop(1, 'transparent');
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(noteX, noteY, 45 * scale, 0, Math.PI * 2);
                ctx.fill();
                
                // 核心
                ctx.beginPath();
                if (22 * scale > 0) ctx.arc(noteX, noteY, 22 * scale, 0, Math.PI * 2);
                ctx.fillStyle = laneColor;
                ctx.shadowColor = laneColor;
                ctx.shadowBlur = 25 * scale;
                ctx.fill();
                
                // 內核
                ctx.beginPath();
                if (12 * scale > 0) ctx.arc(noteX, noteY, 12 * scale, 0, Math.PI * 2);
                ctx.fillStyle = '#fff';
                ctx.shadowColor = '#fff';
                ctx.shadowBlur = 20 * scale;
                ctx.fill();
                
                // 星塵粒子效果
                for (let i = 0; i < 3; i++) {
                    const angle = (Date.now() * 0.001 + i * Math.PI * 2 / 3) % (Math.PI * 2);
                    const particleX = noteX + Math.cos(angle) * 35 * scale;
                    const particleY = noteY + Math.sin(angle) * 35 * scale;
                    ctx.beginPath();
                    if (2 * scale > 0)  ctx.arc(particleX, particleY, 2 * scale, 0, Math.PI * 2);
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
            // 位置固定在擊中時的終止線
            const noteY = note.fadeY !== undefined ? note.fadeY : (currentTime - note.time) * noteSpeed;
            ctx.save();
            ctx.globalAlpha = 1 - ((currentTime - note.time) / 0.5);
            ctx.beginPath();
            const fadeRadius = 22 * scale * (1 - (currentTime - note.time) / 0.5);
            if (fadeRadius > 0) {
                ctx.arc(noteX, noteY, fadeRadius, 0, Math.PI * 2);
                ctx.fillStyle = '#fff700';
                ctx.shadowColor = '#fff700';
                ctx.shadowBlur = 16 * scale;
                ctx.fill();
            }
            ctx.restore();
            if ((currentTime - note.time) > 0.5) note.animating = null;
        }
        if (note.animating === 'miss') {
            // 註解：不繪製 Miss 動畫
            // const noteX = (note.lane + 0.5) * laneWidth;
            // const noteY = (currentTime - note.time) * noteSpeed;
            // ctx.save();
            // // Miss狀態 - 轉為灰色 + 慢速消散
            // const missTime = (currentTime - note.time);
            // const fadeDuration = 2.0; // 2秒慢速消散
            // ctx.globalAlpha = Math.max(0, 1 - (missTime / fadeDuration));
            // // 灰色音符
            // ctx.beginPath();
            // ctx.arc(noteX, noteY, 24 * (1 - missTime / fadeDuration * 0.5), 0, Math.PI * 2);
            // ctx.fillStyle = '#666666';
            // ctx.shadowColor = '#666666';
            // ctx.shadowBlur = 12;
            // ctx.fill();
            // // 灰色光暈
            // ctx.globalAlpha = Math.max(0, 0.3 - (missTime / fadeDuration * 0.3));
            // ctx.beginPath();
            // ctx.arc(noteX, noteY, 40 * (1 - missTime / fadeDuration * 0.3), 0, Math.PI * 2);
            // ctx.fillStyle = '#666666';
            // ctx.fill();
            // ctx.restore();
            // if (missTime > fadeDuration) note.animating = null;
        }
    });
    
    // 音符賽道層 - 使用賽道管理器
    laneManager.drawLanes(ctx, canvas);
    
    // 判定線 - 太空能量屏障
    const judgeLineY = canvas.height - 100;
    ctx.save();
    // 主判定線（加粗加亮）
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 8;
    ctx.shadowColor = '#0ff';
    ctx.shadowBlur = 32;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(0, judgeLineY);
    ctx.lineTo(canvas.width, judgeLineY);
    ctx.stroke();
    // 能量屏障效果（光暈區域顏色變淡）
    const barrierGradient = ctx.createLinearGradient(0, judgeLineY - 40, 0, judgeLineY + 40);
    barrierGradient.addColorStop(0, 'rgba(0,255,255,0.05)');
    barrierGradient.addColorStop(0.5, 'rgba(0,255,255,0.15)');
    barrierGradient.addColorStop(1, 'rgba(0,255,255,0.05)');
    ctx.fillStyle = barrierGradient;
    ctx.fillRect(0, judgeLineY - 40, canvas.width, 80);
    // 邊緣發光
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(0, judgeLineY - 20);
    ctx.lineTo(canvas.width, judgeLineY - 20);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, judgeLineY + 20);
    ctx.lineTo(canvas.width, judgeLineY + 20);
    ctx.stroke();
    ctx.restore();
    
    ctx.restore();
}

// ===============================
// 判定系統 (Judgment System)
// ===============================
// 判定線配置
const JUDGE_LINE = {
    POSITION: 100,  // 判定線距離底部的距離
    PERFECT_RANGE: 6,  // Perfect判定範圍（±6px）
    GREAT_RANGE: 20,   // Great判定範圍（±20px）
    GOOD_RANGE: 40,    // Good判定範圍（±40px）
    MISS_RANGE: 60     // 超過±60px算Miss
};

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
            const noteY = (currentTime - note.time) * LEVEL_CONFIGS[selectedDifficulty].speed;
            const distanceToJudgeLine = Math.abs(noteY - judgeLine);
            if (noteY >= judgeLine - JUDGE_LINE.GOOD_RANGE) { // 只判定進入Good區域的音符
                    const timing = Math.abs(note.time - now);
                    if (timing < hitTiming) {
                        hitTiming = timing;
                        hitIndex = i;
                        hitNote = note;
                }
            }
        }
    }
    // 判定結果
    if (hitIndex !== -1 && hitNote) {
        const noteY = (currentTime - hitNote.time) * LEVEL_CONFIGS[selectedDifficulty].speed;
        const distanceToJudgeLine = Math.abs(noteY - judgeLine);
        if (distanceToJudgeLine <= JUDGE_LINE.PERFECT_RANGE) {
            dynamicInteractionManager.triggerPerfectEffect(lane);
            hitNoteSuccess(hitIndex, 'perfect');
            score += 1000;
            showScoreGain(1000);
            combo++;
            maxCombo = Math.max(maxCombo, combo);
        } else if (distanceToJudgeLine <= JUDGE_LINE.GREAT_RANGE) {
            dynamicInteractionManager.triggerGreatEffect(lane);
            hitNoteSuccess(hitIndex, 'great');
            score += 500;
            showScoreGain(500);
            combo++;
            maxCombo = Math.max(maxCombo, combo);
        } else if (distanceToJudgeLine <= JUDGE_LINE.GOOD_RANGE) {
            dynamicInteractionManager.triggerGoodEffect(lane);
            hitNoteSuccess(hitIndex, 'good');
            score += 200;
            showScoreGain(200);
            combo = 0;
        } else {
            missNote();
            return;
        }
        updateScoreDisplay();
        updateComboDisplay();
    } else {
        missNote(true);
    }
}

function hitNoteSuccess(index, type) {
    if (index >= 0 && index < activeNotes.length) {
        const note = activeNotes[index];
        note.hit = true;
        note.animating = 'fade';
        note.fadeY = canvas.height - JUDGE_LINE.POSITION;
        
        // 添加判定線閃光效果
        judgeLineFlashManager.createFlash(note.lane, type);
        
        // 添加按鍵高亮效果
        keyHighlightManager.triggerHighlight(note.lane, type);
        
        hitCount++;
        let gain = 0;
        if (type === 'perfect') {
            gain = 1000;
            score += gain;
            perfectCount++;
            soundManager.play('perfect'); // 播放 perfect 音效
            // ====== 只保留 Perfect 小爆炸動畫 ======
            const laneCount = laneManager.laneCount;
            const laneWidth = canvas.width / laneCount;
            const noteX = (note.lane + 0.5) * laneWidth;
            const noteY = canvas.height - JUDGE_LINE.POSITION;
            if (typeof noteEffectManager.createGoldenFlashEffect === 'function') {
                // 獲取音符對應的賽道顏色
                const laneConfig = laneManager.getLaneConfig(note.lane);
                const laneColor = laneConfig ? laneConfig.color : '#FFFFFF';
                noteEffectManager.createGoldenFlashEffect(noteX, noteY, 0.8, laneColor); // 煙火特效
            }
            // .key 元素動畫（縮短為 200ms）
            const keyEl = document.querySelector(`[data-key="${KEY_LIST[note.lane]}"]`);
            if (keyEl) {
                keyEl.classList.add('perfect-hit');
                setTimeout(() => keyEl.classList.remove('perfect-hit'), 200);
            }
        } else if (type === 'great') {
            gain = 500;
            score += gain;
            greatCount++;
        } else if (type === 'good') {
            gain = 200;
            score += gain;
            goodCount++;
        }
        
        // 困難關卡Perfect Bonus機制
        if (type === 'perfect' && ['hard', 'extreme', 'master', 'fate'].includes(selectedDifficulty)) {
            let bonusScore = 0;
            let bonusMessage = '';
            
            // 根據難度和Perfect數量給予bonus（只在達到門檻時觸發一次）
            if (selectedDifficulty === 'hard') {
                // Hard關卡bonus
                if (perfectCount === 50) {
                    bonusScore = 2000;
                    bonusMessage = 'Perfect 50 Bonus! +2000';
                } else if (perfectCount === 100) {
                    bonusScore = 5000;
                    bonusMessage = 'Perfect 100 Bonus! +5000';
                } else if (perfectCount === 150) {
                    bonusScore = 10000;
                    bonusMessage = 'Perfect 150 Bonus! +10000';
                } else if (perfectCount === 200) {
                    bonusScore = 20000;
                    bonusMessage = 'Perfect 200 Bonus! +20000';
                } else if (perfectCount === 250) {
                    bonusScore = 30000;
                    bonusMessage = 'Perfect 250 Bonus! +30000';
                } else if (perfectCount === 300) {
                    bonusScore = 50000;
                    bonusMessage = 'Perfect 300 Bonus! +50000';
                }
            } else if (selectedDifficulty === 'extreme') {
                // Extreme關卡bonus（2倍）
                if (perfectCount === 50) {
                    bonusScore = 4000;
                    bonusMessage = 'Perfect 50 Bonus! +4000';
                } else if (perfectCount === 100) {
                    bonusScore = 10000;
                    bonusMessage = 'Perfect 100 Bonus! +10000';
                } else if (perfectCount === 150) {
                    bonusScore = 20000;
                    bonusMessage = 'Perfect 150 Bonus! +20000';
                } else if (perfectCount === 200) {
                    bonusScore = 40000;
                    bonusMessage = 'Perfect 200 Bonus! +40000';
                } else if (perfectCount === 250) {
                    bonusScore = 60000;
                    bonusMessage = 'Perfect 250 Bonus! +60000';
                } else if (perfectCount === 300) {
                    bonusScore = 100000;
                    bonusMessage = 'Perfect 300 Bonus! +100000';
                }
            } else if (selectedDifficulty === 'master') {
                // Master關卡bonus（4倍）
                if (perfectCount === 50) {
                    bonusScore = 8000;
                    bonusMessage = 'Perfect 50 Bonus! +8000';
                } else if (perfectCount === 100) {
                    bonusScore = 20000;
                    bonusMessage = 'Perfect 100 Bonus! +20000';
                } else if (perfectCount === 150) {
                    bonusScore = 40000;
                    bonusMessage = 'Perfect 150 Bonus! +40000';
                } else if (perfectCount === 200) {
                    bonusScore = 80000;
                    bonusMessage = 'Perfect 200 Bonus! +80000';
                } else if (perfectCount === 250) {
                    bonusScore = 120000;
                    bonusMessage = 'Perfect 250 Bonus! +120000';
                } else if (perfectCount === 300) {
                    bonusScore = 200000;
                    bonusMessage = 'Perfect 300 Bonus! +200000';
                }
            } else if (selectedDifficulty === 'fate') {
                // Fate關卡bonus（8倍）
                if (perfectCount === 50) {
                    bonusScore = 16000;
                    bonusMessage = 'Perfect 50 Bonus! +16000';
                } else if (perfectCount === 100) {
                    bonusScore = 40000;
                    bonusMessage = 'Perfect 100 Bonus! +40000';
                } else if (perfectCount === 150) {
                    bonusScore = 80000;
                    bonusMessage = 'Perfect 150 Bonus! +80000';
                } else if (perfectCount === 200) {
                    bonusScore = 160000;
                    bonusMessage = 'Perfect 200 Bonus! +160000';
                } else if (perfectCount === 250) {
                    bonusScore = 240000;
                    bonusMessage = 'Perfect 250 Bonus! +240000';
                } else if (perfectCount === 300) {
                    bonusScore = 400000;
                    bonusMessage = 'Perfect 300 Bonus! +400000';
                }
            }
            
            if (bonusScore > 0) {
                score += bonusScore;
                showScoreGain(bonusScore);
                // 顯示bonus訊息
                showToast(bonusMessage);
            }
        }
        
        // Combo 不做動畫
        if (combo > 0 && combo % 5 === 0) {
            score += 5000;
            showScoreGain(5000);
            soundManager.play('combo'); // 只播音效，不做動畫
        }
        updateScoreDisplay();
        updateComboDisplay();
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
        let gain = 0;
        if (type === 'perfect') {
            gain = 100;
            score += gain;
        } else if (type === 'great') {
            gain = 80;
            score += gain;
        } else if (type === 'good') {
            gain = 50;
            score += gain;
        }
        if (gain > 0) showScoreGain(gain);
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
    // 註解：不顯示 Miss 字樣與動畫
    // if (comboContainer) {
    //     const effect = document.createElement('div');
    //     effect.className = 'miss-effect';
    //     effect.textContent = 'Miss!';
    //     comboContainer.appendChild(effect);
    //     setTimeout(() => effect.remove(), 600);
    // }
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
    // 移除遊戲結束邏輯，讓玩家可以繼續遊玩
    // if (missBufferCount < 0) {
    //     console.log('[missNote] 容錯次數用完，結束遊戲');
    //     endGame();
    //     return;
    // }
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
                    missNote();
                }
            }
        });
        
        // 檢查是否所有音符都處理完畢，但移除自動結束遊戲的邏輯
        const remainingNotes = activeNotes.filter(n => !n.hit && !n.missed);
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
        tooltip.textContent = `${config.name}\n${config.desc}\n特殊規則: ${config.specialRules}`;
    });
}

// Lv.6 解鎖條件：通關3首 Lv.3 以上
function checkFinalUnlock() {
    const hiddenBtn = document.querySelector('.hidden-difficulty');
    if (!hiddenBtn) return;
    let playCount = parseInt(localStorage.getItem('fatekeys_playcount') || '0', 10);
    if (playCount >= 3) {
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
        // 無論是否已經active，每次都重新觸發動畫
        activeBtn.classList.add('active');
        activeBtn.style.animation = 'none'; // 先重置
        // 強制reflow
        void activeBtn.offsetWidth;
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
    missBufferDiv.textContent = `無限模式`;
    missBufferDiv.classList.add('visible');
}
function setMissBufferCount(count) {
    const missBufferDiv = document.getElementById('miss-buffer-ui');
    if (missBufferDiv) {
        // 改為顯示無限模式
        missBufferDiv.textContent = `無限模式`;
    }
}

// 遊戲開始時初始化 missBuffer
function startGame() {
    if (gameStarted || isCountingDown) return;
    if (!selectedSong || !selectedDifficulty) {
        showToast('請先選擇歌曲與難度');
        return;
    }
    // 切換到遊戲畫面
    showScreen('game');
    // 倒數三秒後才開始遊戲
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
    // 結算畫面自動播放Drive音樂
    audioManager.stopAll(() => {
        audioManager.playBackground();
    });
    // ====== 根據評級切換背景色 ======
    document.body.classList.remove('result-bg-ss', 'result-bg-ab', 'result-bg-d');
    let gradeClass = '';
    // 新的宣告
    const totalNotes = activeNotes.length;
    const accuracy = totalNotes > 0 ? (hitCount / totalNotes * 100).toFixed(1) : 0;
    const grade = calculateGrade(score, maxCombo);
    if (grade === 'SSS' || grade === 'SS' || grade === 'S') gradeClass = 'result-bg-ss';
    else if (grade === 'A' || grade === 'B' || grade === 'C') gradeClass = 'result-bg-ab';
    else gradeClass = 'result-bg-d';
    document.body.classList.add(gradeClass);
    // ... existing code ...
    gameEnded = true;
    gameStarted = false; // 重置遊戲開始狀態
    isCountingDown = false; // 重置倒數狀態
    stopAutoMissCheck();
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    noteEffectManager.particles = [];
    audioVisualizer.stop();
    // audioManager.stopAll(); // 這行移除，避免剛播的Drive又被關掉
    
    // 計算成績（舊的宣告，已註解）
    // const totalNotes = activeNotes.length;
    // const accuracy = totalNotes > 0 ? (hitCount / totalNotes * 100).toFixed(1) : 0;
    // const grade = calculateGrade(accuracy, maxCombo);
    
    // 顯示結算畫面
    showScreen('result');
    // 強制顯示結算畫面，避免被其他CSS覆蓋
    resultScreen.style.display = 'flex';
    resultScreen.style.opacity = '1';
    resultScreen.style.zIndex = '1000';

    // 清空舊內容
    resultScreen.innerHTML = '';

    // ====== 新結算畫面結構（直接加在 resultScreen 上） ======
    // 標題
    const title = document.createElement('div');
    title.className = 'result-title';
    title.innerHTML = '✨ <b>你的成績</b> ✨';
    resultScreen.appendChild(title);

    // 分數動畫區
    const scoreDiv = document.createElement('div');
    scoreDiv.className = 'final-score';
    scoreDiv.style = 'font-size:2.8rem;font-weight:bold;color:#ffe066;text-shadow:0 0 24px #ffe066,0 0 8px #fff;letter-spacing:2px;margin:18px 0 8px 0;';
    scoreDiv.textContent = '分數: 0';
    resultScreen.appendChild(scoreDiv);

    // 評級動畫區
    const gradeDiv = document.createElement('div');
    gradeDiv.className = 'final-grade';
    gradeDiv.style = 'font-size:2.2rem;font-weight:bold;margin-bottom:8px;color:#fff700;text-shadow:0 0 24px #fff700,0 0 8px #fff;letter-spacing:2px;';
    gradeDiv.textContent = grade;
    resultScreen.appendChild(gradeDiv);

    // 新增詳細資訊區（插在評級下方、最大Combo上方）
    const detailDiv = document.createElement('div');
    detailDiv.className = 'result-detail';
    detailDiv.style = 'font-size:1.1rem;color:#fff;margin-bottom:10px;line-height:1.6;';
    detailDiv.innerHTML = `
        <span style=\"color:#ffe066;\">Perfect</span>：${perfectCount}<br>
        <span style=\"color:#4ecdc4;\">Great</span>：${greatCount}<br>
        <span style=\"color:#ffe066;\">Good</span>：${goodCount}<br>
        <span style=\"color:#fff700;\">準確率</span>：${accuracy}%
    `;
    resultScreen.appendChild(detailDiv);

    // 最大Combo
    const comboDiv = document.createElement('div');
    comboDiv.className = 'final-combo';
    comboDiv.style = 'font-size:1.3rem;color:#0ff;margin-bottom:8px;';
    comboDiv.textContent = `最大Combo：${maxCombo}`;
    resultScreen.appendChild(comboDiv);

    // 成就徽章/稱號
    const badgeDiv = document.createElement('div');
    badgeDiv.className = 'final-badge';
    badgeDiv.style = 'margin-bottom:12px;';
    let badge = '';
    if (grade === 'SSS') badge = '🏆 <span style="color:#ffe066">節奏之神</span>';
    else if (grade === 'SS') badge = '🥇 <span style="color:#ffd700">節奏大師</span>';
    else if (grade === 'S') badge = '🥈 <span style="color:#fff">節奏高手</span>';
    else if (grade === 'A') badge = '🥉 <span style="color:#0ff">節奏新星</span>';
    else if (grade === 'B') badge = '🎵 <span style="color:#4ecdc4">節奏入門</span>';
    else badge = '💡 <span style="color:#aaa">繼續加油！</span>';
    badgeDiv.innerHTML = badge;
    resultScreen.appendChild(badgeDiv);

    // 暱稱輸入
    const nicknameRow = document.createElement('div');
    nicknameRow.style = 'display:flex;flex-direction:row;align-items:center;justify-content:center;width:100%;margin-bottom:8px;';
    const nicknameInput = document.createElement('input');
    nicknameInput.type = 'text';
    nicknameInput.maxLength = 15;
    nicknameInput.placeholder = '請輸入暱稱 (最多15字)';
    nicknameInput.style = 'width:60%;padding:8px 12px;border-radius:8px;border:1px solid #0ff;font-size:1.1em;';
    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = '確認上榜';
    confirmBtn.style = 'margin-left:8px;padding:8px 18px;border-radius:8px;background:#0ff;color:#222;font-weight:bold;border:none;cursor:pointer;font-size:1.1em;white-space:nowrap;';
    nicknameRow.appendChild(nicknameInput);
    nicknameRow.appendChild(confirmBtn);
    resultScreen.appendChild(nicknameRow);

    // 排行榜區塊
    const leaderboardDiv = document.createElement('div');
    leaderboardDiv.className = 'result-leaderboard';
    leaderboardDiv.style = 'width:100%;max-width:420px;margin:18px auto 0 auto;background:rgba(0,0,0,0.7);border-radius:16px;padding:16px 8px 8px 8px;box-shadow:0 0 24px #0ff3;';
    resultScreen.appendChild(leaderboardDiv);

    // 再玩一次/回主選單按鈕
    const btnRow = document.createElement('div');
    btnRow.className = 'result-buttons';
    btnRow.style = 'display:flex;flex-direction:row;gap:18px;margin-top:24px;justify-content:center;';
    const retryBtn = document.createElement('button');
    retryBtn.className = 'action-btn';
    retryBtn.innerHTML = '再玩一次';
    retryBtn.style = 'padding:10px 32px;font-size:1.2em;border-radius:12px;background:#ffe066;color:#222;font-weight:bold;border:none;cursor:pointer;box-shadow:0 0 12px #ffe06688;transition:transform 0.2s;';
    const menuBtn = document.createElement('button');
    menuBtn.className = 'action-btn';
    menuBtn.innerHTML = '回主選單';
    menuBtn.style = 'padding:10px 32px;font-size:1.2em;border-radius:12px;background:#4ecdc4;color:#222;font-weight:bold;border:none;cursor:pointer;box-shadow:0 0 12px #4ecdc488;transition:transform 0.2s;';
    btnRow.appendChild(retryBtn);
    btnRow.appendChild(menuBtn);
    resultScreen.appendChild(btnRow);

    // 分享成績按鈕獨立一排
    const shareRow = document.createElement('div');
    shareRow.className = 'result-share-row';
    shareRow.style = 'display:flex;flex-direction:row;gap:18px;margin-top:12px;justify-content:center;';
    
    // 郵件分享按鈕
    const emailShareBtn = document.createElement('button');
    emailShareBtn.className = 'action-btn';
    emailShareBtn.innerHTML = '📧 郵件分享';
    emailShareBtn.style = 'padding:10px 24px;font-size:1.1em;border-radius:12px;background:#4ecdc4;color:#222;font-weight:bold;border:none;cursor:pointer;box-shadow:0 0 12px #4ecdc488;transition:transform 0.2s;';
    
    // 檔案分享按鈕
    const fileShareBtn = document.createElement('button');
    fileShareBtn.className = 'action-btn';
    fileShareBtn.innerHTML = '📁 檔案分享';
    fileShareBtn.style = 'padding:10px 24px;font-size:1.1em;border-radius:12px;background:#0ff;color:#222;font-weight:bold;border:none;cursor:pointer;box-shadow:0 0 12px #0ff8;transition:transform 0.2s;';
    
    shareRow.appendChild(emailShareBtn);
    shareRow.appendChild(fileShareBtn);
    resultScreen.appendChild(shareRow);

    // ====== 分享功能實作 ======
    emailShareBtn.onclick = function() {
        const songName = selectedSong ? selectedSong.replace('.mp3', '') : '未知歌曲';
        const difficultyName = DIFFICULTY_LEVEL_MAP[selectedDifficulty] || '未知難度';
        const accuracy = perfectCount + greatCount + goodCount > 0 ? 
            Math.round(((perfectCount + greatCount + goodCount) / (perfectCount + greatCount + goodCount + missCount)) * 100) : 0;
        
        const subject = `我在 Fate Keys 命運節奏 獲得了 ${grade}！`;
        const body = `嗨！我在 Fate Keys 命運節奏 中獲得了 ${grade}！

🎵 歌曲：${songName}
🎯 難度：${difficultyName}
📊 分數：${score.toLocaleString()}
⭐ 等級：${grade}
🔥 最大 Combo：${maxCombo}
🎯 準確率：${accuracy}%

Perfect：${perfectCount}
Great：${greatCount}
Good：${goodCount}
Miss：${missCount}

你也來挑戰看看吧！
遊戲連結：${window.location.href}`;
        
        const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(mailtoLink);
    };
    
    fileShareBtn.onclick = function() {
        const songName = selectedSong ? selectedSong.replace('.mp3', '') : '未知歌曲';
        const difficultyName = DIFFICULTY_LEVEL_MAP[selectedDifficulty] || '未知難度';
        const shareText = `我在 Fate Keys 命運節奏 中獲得了 ${grade}！

🎵 歌曲：${songName}
🎯 難度：${difficultyName}
📊 分數：${score.toLocaleString()}
⭐ 等級：${grade}
🔥 最大 Combo：${maxCombo}

快來挑戰看看吧！${window.location.href}`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Fate Keys 命運節奏 - 我的成績',
                text: shareText,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(shareText);
            showToast('成績已複製到剪貼簿！');
        }
    };

    // ====== 分數跳動動畫 ======
    let displayScore = 0;
    const animateScore = () => {
        if (displayScore < score) {
            displayScore += Math.ceil((score - displayScore) / 4);
            if (displayScore > score) displayScore = score;
            scoreDiv.textContent = `分數: ${displayScore.toLocaleString()}`;
            requestAnimationFrame(animateScore);
        } else {
            scoreDiv.textContent = `分數: ${score.toLocaleString()}`;
        }
    };
    animateScore();

    // ====== 評級動畫 ======
    gradeDiv.classList.add('grade-animate');
    setTimeout(()=>{
        gradeDiv.classList.add('grade-glow');
    }, 400);

    // ====== 排行榜資料處理 ======
    let leaderboard = [];
    try {
        leaderboard = JSON.parse(localStorage.getItem('fatekeys_leaderboard')||'[]');
    } catch(e) { leaderboard = []; }
    // 新增本次紀錄（暫不存檔，等確認）
    let thisRank = -1;
    function renderLeaderboard(highlight) {
        leaderboardDiv.innerHTML = '';
        const table = document.createElement('table');
        table.style = 'width:100%;margin-top:0;border-collapse:collapse;background:rgba(0,0,0,0.5);';
        table.innerHTML = `<thead><tr style="color:#0ff;font-size:1.1em;"><th style="text-align:left">名次</th><th style="text-align:left">暱稱</th><th style="text-align:center">難度</th><th style="text-align:right">分數</th><th style="text-align:center">最大Combo</th></tr></thead><tbody id="leaderboard-body"></tbody>`;
        leaderboardDiv.appendChild(table);
        const body = table.querySelector('#leaderboard-body');
        leaderboard.forEach((item, idx) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td style="color:#ffe066;font-weight:bold;">${idx+1}</td><td>${item.nickname}</td><td style="text-align:center;">${item.difficulty||''}</td><td style="text-align:right;">${item.score.toLocaleString()}</td><td style="text-align:center;">${item.maxCombo}</td>`;
            if (highlight && highlight.nickname === item.nickname && highlight.score === item.score && highlight.maxCombo === item.maxCombo) {
                tr.style.background = 'rgba(255,255,0,0.18)';
                tr.style.boxShadow = '0 0 16px #ffe06688';
                tr.style.fontWeight = 'bold';
                tr.classList.add('slide-in-left');
            } else {
                tr.classList.add('slide-in-right');
            }
            body.appendChild(tr);
        });
    }
    renderLeaderboard();

    // ====== 上榜按鈕事件 ======
    confirmBtn.onclick = function() {
        let nickname = nicknameInput.value.trim() || '無名玩家';
        if (nickname.length > 15) nickname = nickname.slice(0, 15);
        const record = { nickname, score, maxCombo, difficulty: DIFFICULTY_LEVEL_MAP[selectedDifficulty] || '' };
        leaderboard.push(record);
        leaderboard.sort((a, b) => b.score - a.score);
        leaderboard = leaderboard.slice(0, 20);
        localStorage.setItem('fatekeys_leaderboard', JSON.stringify(leaderboard));
        thisRank = leaderboard.findIndex(item => item.nickname === record.nickname && item.score === record.score && item.maxCombo === record.maxCombo);
        renderLeaderboard(record);
        confirmBtn.disabled = true;
        nicknameInput.disabled = true;
    };

    // ====== 再玩一次/回主選單/分享成績按鈕事件 ======
    retryBtn.onclick = function() {
        document.body.classList.remove('result-bg-ss', 'result-bg-ab', 'result-bg-d');
        showScreen('game');
        realStartGame();
    };
    menuBtn.onclick = function() {
        document.body.classList.remove('result-bg-ss', 'result-bg-ab', 'result-bg-d');
        showScreen('select');
        audioManager.resumeBackground();
    };

    // 全連獎勵
    if (maxCombo === activeNotes.length && activeNotes.length > 0) {
        score += 20000;
        // 可在畫面顯示全連Bonus
        setTimeout(() => {
            showToast('全連Bonus +20000!');
        }, 500);
    }

    // 在 endGame() 最後加上遊玩次數累加
    let playCount = parseInt(localStorage.getItem('fatekeys_playcount') || '0', 10);
    playCount++;
    localStorage.setItem('fatekeys_playcount', playCount);

    // 在 endGame() 最後加上：
    checkAchievements({
        maxCombo,
        score,
        perfect: perfectCount,
        miss: missCount,
        totalNotes: activeNotes.length,
        playCount: parseInt(localStorage.getItem('fatekeys_playcount') || '0', 10),
        fateUnlocked: !LEVEL_CONFIGS.fate.locked,
        clearedBeginner: selectedDifficulty === 'beginner',
        clearedCasual: selectedDifficulty === 'casual',
        clearedHard: selectedDifficulty === 'hard',
        clearedExtreme: selectedDifficulty === 'extreme',
        clearedMaster: selectedDifficulty === 'master',
        clearedFate: selectedDifficulty === 'fate',
        grade: grade,
        difficulty: selectedDifficulty,
    });
}

// ===============================
// UI 更新函數 (UI Update Functions)
// ===============================
function updateScoreDisplay() {
    if (scoreDisplay) {
        // 只更新分數文字，不移除加分提示
        // 先找出現有的加分提示元素
        const gainTip = scoreDisplay.querySelector('.score-gain-tip');
        scoreDisplay.innerHTML = `分數: ${score.toLocaleString()}`;
        if (gainTip) scoreDisplay.appendChild(gainTip);
    }
}

function updateComboDisplay() {
    if (!comboDisplay) return;
    if (combo > 0) {
        comboDisplay.style.display = 'block';
        comboDisplay.textContent = combo;
    } else {
        comboDisplay.style.display = 'none';
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
        console.log('更新開始按鈕狀態:', {
            canStart: canStart,
            selectedSong: selectedSong,
            selectedDifficulty: selectedDifficulty
        });
        startBtn.disabled = !canStart;
        
        if (canStart) {
            startBtn.classList.remove('disabled');
        } else {
            startBtn.classList.add('disabled');
        }
    } else {
        console.error('updateStartBtnState: startBtn 未找到');
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
    console.log('[unlockAudio] 音頻遮罩元素:', mask);
    if (mask) {
        console.log('[unlockAudio] 遮罩當前顯示狀態:', mask.style.display);
        mask.style.display = 'none';
        console.log('[unlockAudio] 隱藏音頻解鎖遮罩');
    } else {
        console.error('[unlockAudio] 找不到音頻遮罩元素');
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

// 調試函數：檢查開始按鈕狀態
function debugStartButton() {
    console.log('=== 開始按鈕調試 ===');
    const startBtn = document.getElementById('start-btn');
    const audioMask = document.getElementById('unlock-audio-mask');
    const countdownOverlay = document.getElementById('countdown-overlay');
    
    console.log('開始按鈕:', startBtn);
    console.log('音頻遮罩:', audioMask);
    console.log('倒數遮罩:', countdownOverlay);
    
    if (startBtn) {
        console.log('按鈕狀態:', {
            disabled: startBtn.disabled,
            display: startBtn.style.display,
            visibility: startBtn.style.visibility,
            opacity: startBtn.style.opacity,
            zIndex: startBtn.style.zIndex
        });
    }
    
    if (audioMask) {
        console.log('音頻遮罩狀態:', {
            display: audioMask.style.display,
            zIndex: audioMask.style.zIndex
        });
    }
    
    console.log('遊戲狀態:', {
        selectedSong: selectedSong,
        selectedDifficulty: selectedDifficulty,
        gameStarted: gameStarted,
        isCountingDown: isCountingDown,
        audioUnlocked: audioUnlocked
    });
    
    // 嘗試修復
    if (audioMask && audioMask.style.display !== 'none') {
        console.log('修復：隱藏音頻遮罩');
        audioMask.style.display = 'none';
    }
    
    if (countdownOverlay && countdownOverlay.style.display !== 'none') {
        console.log('修復：隱藏倒數遮罩');
        countdownOverlay.style.display = 'none';
    }
}

// 將調試函數暴露到全局
window.debugStartButton = debugStartButton;

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
let volume = 0.5;
const volumeSlider = document.createElement('input');
volumeSlider.type = 'range';
volumeSlider.min = 0;
volumeSlider.max = 1;
volumeSlider.step = 0.01;
volumeSlider.value = 0.5; // 預設值改為 0.5 (50%)
volumeSlider.id = 'volume-slider';
volumeSlider.title = '音量';
// 調整樣式：靠右上角，寬度120px，與#now-playing對齊
Object.assign(volumeSlider.style, {
    position: 'fixed',
    top: '56px', // #now-playing 預設 top:16px + 高度約32px + 8px間距
    right: '24px',
    width: '120px',
    zIndex: 9999,
    background: 'rgba(0,0,0,0.7)',
    borderRadius: '12px',
    border: '1px solid #0ff',
    boxShadow: '0 0 12px #0ff3',
    padding: '2px 0',
    margin: '0',
    outline: 'none',
    accentColor: '#0ff'
});
document.body.appendChild(volumeSlider);
volumeSlider.addEventListener('input', function() {
    volume = parseFloat(this.value);
    if (audioManager.audio) audioManager.audio.volume = volume;
});
// 保持音量即時同步
setInterval(() => {
    if (audioManager.audio) {
        const slider = document.getElementById('volume-slider');
        if (slider) audioManager.audio.volume = parseFloat(slider.value);
    }
}, 300);

// 遊戲說明 modal
const helpBtn = document.getElementById('help-btn');
const helpModal = document.getElementById('help-modal');
helpModal.innerHTML = `
  <div id="help-modal-content" style="background:#222;color:#fff;padding:2rem 1.5rem 1.5rem 1.5rem;border-radius:1rem;max-width:420px;width:90vw;max-height:80vh;margin:5vh auto;position:relative;box-shadow:0 4px 32px #000b;display:flex;flex-direction:column;align-items:center;overflow-y:auto;">
    <h2 style="margin-top:0;">Fate Keys 命運節奏｜玩法說明</h2>
    <div style="margin-bottom:1.2em;font-weight:bold;color:#ffe066;">【遊戲流程】</div>
    <ul style="padding-left:1.2em;">
      <li>1. 選擇你喜歡的歌曲與難度，點擊「開始遊戲」或按 Enter 鍵進入節奏世界。</li>
      <li>2. 根據畫面下落的音符，準確按下對應鍵位：
        <b style="color:#0ff;">D</b> <b style="color:#0ff;">F</b> <b style="color:#ffe066;">空白</b> <b style="color:#ff6f91;">J</b> <b style="color:#4ecdc4;">K</b>。
      </li>
      <li>3. 每次正確擊中音符可獲得分數，連續擊中會累積 Combo，失誤則 Combo 歸零。</li>
      <li>4. 分數依照擊中準確度與連擊數計算，越準確、連擊越高分數越多。</li>
      <li>5. 遊戲結束時會顯示本局總分與評級，快來挑戰自己的極限！</li>
    </ul>
    <div style="margin:1.2em 0 0.5em 0;font-weight:bold;color:#ffe066;">【進階挑戰】</div>
    <ul style="padding-left:1.2em;">
      <li>達成特定條件可解鎖「命運之路」(Fate Mode) 與多項成就。</li>
      <li>點擊左上角「🏅成就」可查看已解鎖成就，並挑戰排行榜。</li>
      <li>可於左上角調整音量，並切換高對比模式提升可視性。</li>
      <li>遊戲支援鍵盤操作，建議使用電腦體驗最佳。</li>
    </ul>
    <div style="margin-top:1.2em;font-size:1em;color:#ffd700;font-weight:bold;">小提示：保持節奏感，盡量連擊，挑戰更高分數與全成就！<br>每一次擊鍵，都是與音樂的共舞——享受節奏，享受挑戰！</div>
    <button id="help-modal-close" class="action-btn" style="margin-top:24px;font-size:1.2em;align-self:center;background:#ffe066;color:#222;border-radius:8px;border:none;padding:10px 32px;font-weight:bold;cursor:pointer;box-shadow:0 0 12px #ffe06688;">關閉</button>
  </div>
`;
// 彈窗永遠置中，內容不會超出畫面
Object.assign(helpModal.style, {
  display: 'none',
  position: 'fixed',
  zIndex: 10001,
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  background: 'rgba(0,0,0,0.6)',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'opacity 0.2s',
});

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
    difficultyBtns = document.querySelectorAll('.difficulty-card');
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
        console.log('[初始化] 音頻遮罩事件已設置');
        
        // 如果音頻已解鎖，立即隱藏遮罩
        if (audioUnlocked) {
            audioMask.style.display = 'none';
            console.log('[初始化] 音頻已解鎖，隱藏遮罩');
        }
    } else {
        console.error('[初始化] 找不到音頻遮罩元素');
    }
    
    // 確保音頻遮罩在頁面載入後正確隱藏（如果音頻已解鎖）
    setTimeout(() => {
        if (audioUnlocked) {
            const mask = document.getElementById('unlock-audio-mask');
            if (mask && mask.style.display !== 'none') {
                console.log('[初始化] 強制隱藏音頻遮罩');
                mask.style.display = 'none';
            }
        }
    }, 1000);
    
    // 添加緊急修復：如果開始按鈕無法點擊，強制隱藏所有可能的遮罩
    setTimeout(() => {
        const masks = document.querySelectorAll('#unlock-audio-mask, #countdown-overlay');
        masks.forEach(mask => {
            if (mask && mask.style.display !== 'none') {
                console.log('[緊急修復] 隱藏遮罩:', mask.id);
                mask.style.display = 'none';
            }
        });
    }, 2000);
    
    // 歌曲選擇事件
    if (songCards) {
        songCards.forEach(card => {
            card.addEventListener('click', function() {
                soundManager.play('ui');
                songCards.forEach(c => c.classList.remove('active'));
                this.classList.add('active');
                selectedSong = this.dataset.song;
                // 播放預覽前檢查音訊已解鎖
                if (audioUnlocked) {
                    // 立即停止當前播放，避免重疊
                    audioManager.stopImmediately();
                    // 立即開始播放新預覽
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
                // 新增：點擊難度時播放音效
                soundManager.play('ui');
                // 新增：彈窗顯示難度名稱
                const diff = this.dataset.difficulty;
                const levelMap = {
                    'beginner': '初學者',
                    'casual': '休閒玩家',
                    'hard': '困難模式',
                    'extreme': '極限挑戰',
                    'master': '大師級',
                    'fate': '命運之路'
                };
                const levelCode = DIFFICULTY_LEVEL_MAP[diff] || '';
                const levelName = levelMap[diff] || diff;
                if(levelCode && levelName) {
                    showToast(`已選取${levelCode} ${levelName}`);
                } else {
                    showToast('已選取難度');
                }
                // 原本的setDifficulty邏輯
                setDifficulty(diff);
            });
        });
    }
    
    // 開始按鈕事件
    if (startBtn) {
        console.log('開始按鈕找到，設置事件監聽器');
        
        // 添加測試點擊事件
        startBtn.addEventListener('click', function(e) {
            console.log('開始按鈕被點擊 - 測試事件');
            console.log('事件對象:', e);
            console.log('按鈕元素:', this);
        });
        
        startBtn.addEventListener('click', function(e) {
            console.log('開始按鈕被點擊');
            console.log('按鈕狀態:', {
                disabled: startBtn.disabled,
                selectedSong: selectedSong,
                selectedDifficulty: selectedDifficulty,
                gameStarted: gameStarted,
                isCountingDown: isCountingDown
            });
            e.preventDefault();
            e.stopPropagation();
            startGame();
        });
    } else {
        console.error('開始按鈕未找到！');
    }
    
    // 重新開始按鈕事件
    if (restartBtn) {
        restartBtn.addEventListener('click', function() {
            // 重置遊戲狀態
            gameStarted = false;
            gameEnded = false;
            isCountingDown = false;
            showScreen('select');
            audioManager.resumeBackground();
        });
    }
    
    // 返回主選單按鈕事件
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            // 重置遊戲狀態
            gameStarted = false;
            gameEnded = false;
            isCountingDown = false;
            showScreen('select');
            audioManager.resumeBackground();
        });
    }
    
    // 鍵盤事件 - 支援 Mac 鍵盤
    document.addEventListener('keydown', function(e) {
        // 修正：如果焦點在input或textarea，不處理遊戲按鍵
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (!gameStarted || gamePaused || gameEnded) return;
        
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
        
        // 檢查是否為遊戲按鍵（支援多種格式）
        const validKeys = ['D', 'F', 'J', 'K', ' '];
        const validCodes = ['KeyD', 'KeyF', 'KeyJ', 'KeyK', 'Space'];
        
        const isValidKey = validKeys.includes(key);
        const isValidCode = validCodes.includes(keyCode);
        
        if (isValidKey || isValidCode) {
            e.preventDefault();
            // 更新 UI 高亮 - 特別處理空白鍵
            let targetKey = key;
            if (key === ' ') {
                targetKey = ' ';
            }
            
            // 多種查找方法
            let keyElement = null;
            
            // 方法1: 用 data-key 查找
            keyElement = document.querySelector(`[data-key="${targetKey}"]`);
            
            // 方法2: 如果找不到，嘗試查找包含 SPACE 文字的元素
            if (!keyElement && key === ' ') {
                const allKeys = document.querySelectorAll('.key');
                for (let el of allKeys) {
                    if (el.textContent === 'SPACE') {
                        keyElement = el;
                        break;
                    }
                }
            }
            
            // 方法3: 如果還是找不到，嘗試用代碼查找
            if (!keyElement) {
                const codeKey = keyCode === 'Space' ? ' ' : keyCode.replace('Key', '');
                keyElement = document.querySelector(`[data-key="${codeKey}"]`);
            }
            
            if (keyElement) {
                keyElement.classList.add('active');
                setTimeout(() => {
                    keyElement.classList.remove('active');
                }, 150);
            } else {
                // 最後嘗試：直接查找所有 .key 元素並顯示
                const allKeys = document.querySelectorAll('.key');
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

    // 新增排行榜按鈕功能
    const leaderboardBtn = document.getElementById('leaderboard-btn');
    // 新排行榜View顯示與關閉
    const leaderboardView = document.getElementById('leaderboard-view');
    const leaderboardContent = document.getElementById('leaderboard-content');
    const closeLeaderboardBtn = document.getElementById('close-leaderboard-btn');
    if (leaderboardBtn && leaderboardView && leaderboardContent && closeLeaderboardBtn) {
        leaderboardBtn.addEventListener('click', function() {
            // 判斷目前畫面
            if (selectArea && selectArea.style.display !== 'none') {
                lastScreenBeforeLeaderboard = 'select';
            } else if (gameArea && gameArea.style.display !== 'none') {
                lastScreenBeforeLeaderboard = 'game';
            } else if (resultScreen && resultScreen.style.display !== 'none') {
                lastScreenBeforeLeaderboard = 'result';
            } else {
                lastScreenBeforeLeaderboard = 'select';
            }
            renderLeaderboardView();
            leaderboardView.style.display = 'flex';
        });
        closeLeaderboardBtn.addEventListener('click', function(e) {
            console.log('[排行榜] 關閉按鈕被點擊');
            e.preventDefault();
            e.stopPropagation();
            leaderboardView.style.display = 'none';
            showScreen(lastScreenBeforeLeaderboard);
        });
        // 點擊背景也可以關閉排行榜
        leaderboardView.addEventListener('click', function(e) {
            if (e.target === leaderboardView) {
                console.log('[排行榜] 背景被點擊，關閉排行榜');
                leaderboardView.style.display = 'none';
                showScreen(lastScreenBeforeLeaderboard);
            }
        });
    }

    const achievementBtn = document.getElementById('achievement-btn');
    const achievementModal = document.getElementById('achievement-modal');
    const closeAchievementBtn = document.getElementById('close-achievement-btn');
    if (achievementBtn && achievementModal && closeAchievementBtn) {
        achievementBtn.onclick = function() {
            renderAchievementList();
            achievementModal.style.display = 'flex';
        };
        closeAchievementBtn.onclick = function() {
            achievementModal.style.display = 'none';
        };
        achievementModal.onclick = function(e) {
            if (e.target === achievementModal) achievementModal.style.display = 'none';
        };
    }
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
    
    // 驗證音符數據
    let validNotes = 0;
    activeNotes.forEach((note, i) => {
        if (note && typeof note.time === 'number' && typeof note.lane === 'number') {
            validNotes++;
        } else {
            console.warn(`[spawnNotes] 音符 ${i} 數據無效:`, note);
        }
    });
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
        // 註解：不繪製Miss紅色X
        // const ctx = this.ctx;
        // ctx.save();
        // ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
        // ctx.lineWidth = 3;
        // ctx.beginPath();
        // ctx.moveTo(x - 20, y - 20);
        // ctx.lineTo(x + 20, y + 20);
        // ctx.moveTo(x + 20, y - 20);
        // ctx.lineTo(x - 20, y + 20);
        // ctx.stroke();
        // ctx.restore();
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

// 新增難度等級對應表
const DIFFICULTY_LEVEL_MAP = {
    'beginner': 'LV.1',
    'casual': 'LV.2',
    'hard': 'LV.3',
    'extreme': 'LV.4',
    'master': 'LV.5',
    'fate': 'LV.6'
};

// 抽出排行榜渲染函數，供首頁按鈕呼叫
function showLeaderboardOnly() {
    showScreen('result');
    let leaderboardDiv = document.getElementById('leaderboard');
    if (!leaderboardDiv) {
        leaderboardDiv = document.createElement('div');
        leaderboardDiv.id = 'leaderboard';
        leaderboardDiv.style = 'margin:32px auto;max-width:420px;background:rgba(0,0,0,0.7);border-radius:16px;padding:24px 16px 16px 16px;box-shadow:0 0 24px #0ff3;';
        resultScreen.appendChild(leaderboardDiv);
    }
    leaderboardDiv.innerHTML = '';
    // 只顯示排行榜表格
    let table = document.createElement('table');
    table.style = 'width:100%;margin-top:18px;border-collapse:collapse;background:rgba(0,0,0,0.5);';
    table.innerHTML = `<thead><tr style="color:#0ff;font-size:1.1em;"><th style="text-align:left">名次</th><th style="text-align:left">暱稱</th><th style="text-align:center">難度</th><th style="text-align:right">分數</th><th style="text-align:center">最大Combo</th></tr></thead><tbody id="leaderboard-body"></tbody>`;
    leaderboardDiv.appendChild(table);
    let leaderboard = [];
    try {
        leaderboard = JSON.parse(localStorage.getItem('fatekeys_leaderboard')||'[]');
    } catch(e) { leaderboard = []; }
    let body = leaderboardDiv.querySelector('#leaderboard-body');
    body.innerHTML = '';
    leaderboard.forEach((item, idx) => {
        let tr = document.createElement('tr');
        tr.innerHTML = `<td style="color:#ffe066;font-weight:bold;">${idx+1}</td><td>${item.nickname}</td><td style="text-align:center;">${item.difficulty||''}</td><td style="text-align:right;">${item.score.toLocaleString()}</td><td style="text-align:center;">${item.maxCombo}</td>`;
        body.appendChild(tr);
    });
    // 隱藏分數與combo顯示區
    if(finalScore) finalScore.textContent = '';
    if(finalGrade) finalGrade.textContent = '';
}

// 渲染排行榜View內容
function renderLeaderboardView() {
    const leaderboardContent = document.getElementById('leaderboard-content');
    if (!leaderboardContent) return;
    let leaderboard = [];
    try {
        leaderboard = JSON.parse(localStorage.getItem('fatekeys_leaderboard')||'[]');
    } catch(e) { leaderboard = []; }
    let html = '<h2 style="color:#0ff;text-align:center;margin-bottom:18px;">🏆 排行榜</h2>';
    html += '<table style="width:100%;border-collapse:collapse;background:rgba(0,0,0,0.5);">';
    html += '<thead><tr style="color:#0ff;font-size:1.1em;"><th style="text-align:left">名次</th><th style="text-align:left">暱稱</th><th style="text-align:center">難度</th><th style="text-align:right">分數</th><th style="text-align:center">最大Combo</th></tr></thead><tbody>';
    leaderboard.forEach((item, idx) => {
        html += `<tr><td style="color:#ffe066;font-weight:bold;">${idx+1}</td><td>${item.nickname}</td><td style="text-align:center;">${item.difficulty||''}</td><td style="text-align:right;">${item.score.toLocaleString()}</td><td style="text-align:center;">${item.maxCombo}</td></tr>`;
    });
    html += '</tbody></table>';
    leaderboardContent.innerHTML = html;
}

function showScoreGain(gain) {
    if (!scoreDisplay) return;
    let gainEl = document.createElement('span');
    gainEl.className = 'score-gain-tip';
    gainEl.textContent = `+${gain}`;
    scoreDisplay.appendChild(gainEl);
    // 強制觸發 reflow 以啟動動畫
    void gainEl.offsetWidth;
    gainEl.classList.add('show');
    setTimeout(() => {
        gainEl.classList.remove('show');
        setTimeout(() => gainEl.remove(), 400);
    }, 700);
}

// ===============================
// 評級計算 (Grade Calculation)
// ===============================
function calculateGrade(score, maxCombo) {
    const config = LEVEL_CONFIGS[selectedDifficulty] || {};
    const thresholds = config.scoreGradeThresholds || { SSS: 100000, SS: 90000, S: 80000, A: 60000, B: 40000, C: 20000, D: 0 };
    if (score >= thresholds.SSS) return 'SSS';
    if (score >= thresholds.SS)  return 'SS';
    if (score >= thresholds.S)   return 'S';
    if (score >= thresholds.A)   return 'A';
    if (score >= thresholds.B)   return 'B';
    if (score >= thresholds.C)   return 'C';
    return 'D';
}

// 每次重開網頁自動清空 localStorage
//window.addEventListener('load', function() {
//    localStorage.clear();
//});
//window.addEventListener('beforeunload', function() {
//    localStorage.clear();
//});

// 製作團隊浮層開關
window.addEventListener('DOMContentLoaded', function() {
    var teamBtn = document.getElementById('team-btn');
    var teamView = document.getElementById('team-view');
    var closeTeamBtn = document.getElementById('close-team-btn');
    if (teamBtn && teamView) {
        teamBtn.addEventListener('click', function() {
            teamView.style.display = 'flex';
        });
    }
    if (closeTeamBtn && teamView) {
        closeTeamBtn.addEventListener('click', function() {
            teamView.style.display = 'none';
        });
    }
});

// 清除紀錄按鈕功能
window.addEventListener('DOMContentLoaded', function() {
    var clearBtn = document.getElementById('clear-storage-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            if (confirm('確定要清除所有遊戲紀錄嗎？此操作無法復原。')) {
                localStorage.clear();
                location.reload();
            }
        });
    }
    // 製作團隊浮層開關
    var teamBtn = document.getElementById('team-btn');
    var teamView = document.getElementById('team-view');
    var closeTeamBtn = document.getElementById('close-team-btn');
    if (teamBtn && teamView) {
        teamBtn.addEventListener('click', function() {
            teamView.style.display = 'flex';
        });
    }
    if (closeTeamBtn && teamView) {
        closeTeamBtn.addEventListener('click', function() {
            teamView.style.display = 'none';
        });
    }
});

// ====== 音效管理器 (Sound Manager) ======
const soundManager = {
    sounds: {
        perfect: './Vibe_Coding組_王祐昇_運行程式及遊戲素材/audio/perfect.wav',
        combo: './Vibe_Coding組_王祐昇_運行程式及遊戲素材/audio/combo.wav',
        ui: './Vibe_Coding組_王祐昇_運行程式及遊戲素材/audio/ui.wav'
    },
    play(type) {
        const src = this.sounds[type];
        if (!src) return;
        const audio = new Audio(src);
        
        // 所有音效都比音樂小0.1
            const musicVolume = audioManager.getCurrentVolume();
        audio.volume = Math.max(musicVolume - 0.1, 0.01); // 音樂音量-0.1，最小0.01
        
        audio.play().catch(()=>{});
    }
};

// ... existing code ...
// ====== 成就系統 ======
const achievements = [
    { id: 'clearBeginner', name: '首次通關Lv.1', desc: '首次通關Lv.1（Beginner）', check: (stats) => stats.clearedBeginner },
    { id: 'clearCasual', name: '首次通關Lv.2', desc: '首次通關Lv.2（Casual）', check: (stats) => stats.clearedCasual },
    { id: 'clearHard', name: '首次通關Lv.3', desc: '首次通關Lv.3（Hard）', check: (stats) => stats.clearedHard },
    { id: 'clearExtreme', name: '首次通關Lv.4', desc: '首次通關Lv.4（Extreme）', check: (stats) => stats.clearedExtreme },
    { id: 'clearMaster', name: '首次通關Lv.5', desc: '首次通關Lv.5（Master）', check: (stats) => stats.clearedMaster },
    { id: 'clearFate', name: '首次通關Lv.6', desc: '首次通關Lv.6（Fate）', check: (stats) => stats.clearedFate },
    { id: 'clearFateMode', name: '首次解鎖 Fate Mode', desc: '首次解鎖 Fate Mode', check: (stats) => stats.fateUnlocked },
    { id: 'play1', name: '新手上路', desc: '累積遊玩1次', check: (stats) => stats.playCount >= 1 },
    { id: 'play2', name: '節奏初體驗', desc: '累積遊玩2次', check: (stats) => stats.playCount >= 2 },
    { id: 'play3', name: '節奏入門', desc: '累積遊玩3次', check: (stats) => stats.playCount >= 3 },
    { id: 'play5', name: '節奏愛好者', desc: '累積遊玩5次', check: (stats) => stats.playCount >= 5 },
    { id: 'play10', name: '音樂愛好者', desc: '累積遊玩10次', check: (stats) => stats.playCount >= 10 },
    { id: 'combo10', name: '連擊達10', desc: '單局達成10連擊', check: (stats) => stats.maxCombo >= 10 },
    { id: 'combo50', name: '連擊達50', desc: '單局達成50連擊', check: (stats) => stats.maxCombo >= 50 },
    { id: 'combo100', name: '連擊達100', desc: '單局達成100連擊', check: (stats) => stats.maxCombo >= 100 },
    { id: 'score50k', name: '分數破5萬', desc: '單局分數達到50,000', check: (stats) => stats.score >= 50000 },
    { id: 'score100k', name: '分數破10萬', desc: '單局分數達到100,000', check: (stats) => stats.score >= 100000 },
    { id: 'allPerfect', name: '全Perfect', desc: '單局全Perfect', check: (stats) => stats.perfect === stats.totalNotes && stats.totalNotes > 0 },
    { id: 'gradeB', name: '達到等級B', desc: '單局獲得B等級評價', check: (stats) => stats.grade === 'B' },
    { id: 'gradeA', name: '達到等級A', desc: '單局獲得A等級評價', check: (stats) => stats.grade === 'A' },
    { id: 'gradeS', name: '達到等級S', desc: '單局獲得S等級評價', check: (stats) => stats.grade === 'S' },
    { id: 'gradeSS', name: '達到等級SS', desc: '單局獲得SS等級評價', check: (stats) => stats.grade === 'SS' },
    { id: 'gradeSSS', name: '達到等級SSS', desc: '單局獲得SSS等級評價', check: (stats) => stats.grade === 'SSS' },
    { id: 'gradeBHard', name: '困難模式B級', desc: '在Lv.3以上難度獲得B等級', check: (stats) => stats.grade === 'B' && ['hard', 'extreme', 'master', 'fate'].includes(stats.difficulty) },
    { id: 'gradeAHard', name: '困難模式A級', desc: '在Lv.3以上難度獲得A等級', check: (stats) => stats.grade === 'A' && ['hard', 'extreme', 'master', 'fate'].includes(stats.difficulty) },
    { id: 'gradeSHard', name: '困難模式S級', desc: '在Lv.3以上難度獲得S等級', check: (stats) => stats.grade === 'S' && ['hard', 'extreme', 'master', 'fate'].includes(stats.difficulty) },
    { id: 'gradeSSHard', name: '困難模式SS級', desc: '在Lv.3以上難度獲得SS等級', check: (stats) => stats.grade === 'SS' && ['hard', 'extreme', 'master', 'fate'].includes(stats.difficulty) },
    { id: 'gradeSSSHard', name: '困難模式SSS級', desc: '在Lv.3以上難度獲得SSS等級', check: (stats) => stats.grade === 'SSS' && ['hard', 'extreme', 'master', 'fate'].includes(stats.difficulty) },
    { id: 'clearAllDifficulties', name: '全難度制霸', desc: '在所有難度下都完成過遊戲', check: (stats) => {
        const clearedCount = [stats.clearedBeginner, stats.clearedCasual, stats.clearedHard, stats.clearedExtreme, stats.clearedMaster, stats.clearedFate].filter(Boolean).length;
        return clearedCount >= 6;
    }},
    { id: 'masterChallenge', name: '大師挑戰', desc: '在Lv.5（Master）難度下完成遊戲', check: (stats) => stats.clearedMaster },
    { id: 'fateChallenge', name: '命運挑戰', desc: '在Lv.6（Fate）難度下完成遊戲', check: (stats) => stats.clearedFate },
    { id: 'extremeMaster', name: '極限大師', desc: '在Lv.4或Lv.5難度下獲得S級以上評價', check: (stats) => ['S', 'SS', 'SSS'].includes(stats.grade) && ['extreme', 'master'].includes(stats.difficulty) },

];

function checkAchievements(stats) {
    achievements.forEach(a => {
        if (!localStorage.getItem('achv_' + a.id) && a.check(stats)) {
            localStorage.setItem('achv_' + a.id, '1');
            showAchievementPopup(a.name, a.desc);
            // 可加音效 soundManager.play('combo');
        }
    });
}

// 成就彈出隊列管理
let achievementQueue = [];
let isShowingAchievement = false;

function showAchievementPopup(name, desc) {
    // 將成就加入隊列
    achievementQueue.push({ name, desc });
    
    // 如果沒有正在顯示的成就，開始顯示
    if (!isShowingAchievement) {
        showNextAchievement();
    }
}

function showNextAchievement() {
    if (achievementQueue.length === 0) {
        isShowingAchievement = false;
        return;
    }
    
    isShowingAchievement = true;
    const achievement = achievementQueue.shift();
    
    let popup = document.createElement('div');
    popup.className = 'achievement-popup';
    popup.innerHTML = `<b>🏆 成就解鎖！</b><br>${achievement.name}<br><span style="font-size:0.95em;">${achievement.desc}</span>`;
    Object.assign(popup.style, {
        position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,0.92)', color: '#ffe066', padding: '18px 32px',
        borderRadius: '16px', fontSize: '1.2em', zIndex: 99999, textAlign: 'center',
        boxShadow: '0 0 24px #ffe06688', opacity: '0', transition: 'opacity 0.3s'
    });
    document.body.appendChild(popup);
    
    // 淡入
    setTimeout(() => { popup.style.opacity = '1'; }, 50);
    
    // 淡出並顯示下一個成就
    setTimeout(() => { 
        popup.style.opacity = '0'; 
        setTimeout(() => {
            popup.remove();
            showNextAchievement(); // 顯示下一個成就
        }, 500); 
    }, 2500);
}
// ... existing code ...

function renderAchievementList() {
    const listDiv = document.getElementById('achievement-list');
    if (!listDiv) return;
    let html = '<ul style="list-style:none;padding:0;">';
    achievements.forEach(a => {
        const unlocked = localStorage.getItem('achv_' + a.id);
        html += `<li style="margin-bottom:1em;">
            <span style="font-size:1.2em;${unlocked ? 'color:#ffe066;' : 'color:#888;'}">${unlocked ? '✔️' : '⬜'} ${a.name}</span>
            <div style="font-size:0.95em;color:#ccc;">${a.desc}</div>
        </li>`;
    });
    html += '</ul>';
    listDiv.innerHTML = html;
}

// ... existing code ...
// 直接調整成就視窗的樣式（加強滾軸與視覺）
window.addEventListener('DOMContentLoaded', function() {
    const achievementModal = document.getElementById('achievement-modal');
    const achievementContent = document.getElementById('achievement-content');
    if (achievementModal && achievementContent) {
        // 視窗永遠置中，內容不超出畫面
        Object.assign(achievementModal.style, {
            display: 'none',
            position: 'fixed',
            zIndex: 10002,
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.85)',
            alignItems: 'center',
            justifyContent: 'center',
        });
        Object.assign(achievementContent.style, {
            maxWidth: '400px',
            width: '90vw',
            maxHeight: '80vh',
            overflowY: 'auto',
            background: 'rgba(0,0,0,0.95)',
            borderRadius: '18px',
            padding: '32px 16px 24px 16px',
            boxShadow: '0 0 32px #ffe066',
            margin: '0 auto',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
        });
    }
    // 強化關閉按鈕樣式
    const closeBtn = document.getElementById('close-achievement-btn');
    if (closeBtn) {
        Object.assign(closeBtn.style, {
            marginTop: '24px',
            fontSize: '1.2em',
            alignSelf: 'center',
            background: '#ffe066',
            color: '#222',
            borderRadius: '8px',
            border: 'none',
            padding: '10px 32px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 0 12px #ffe06688',
        });
    }
});
// ... existing code ...

// 新增星際風格音量icon
window.addEventListener('DOMContentLoaded', function() {
    // 取得原本的slider
    const slider = document.getElementById('volume-slider');
    if (slider) {
        // 移除舊的fixed定位
        slider.style.position = 'static';
        slider.style.top = '';
        slider.style.right = '';
        slider.style.margin = '0 0 0 0';
        slider.style.zIndex = '';
        // 移除舊icon（如果有）
        const oldIcon = document.getElementById('volume-icon');
        if (oldIcon) oldIcon.remove();
        // 移除舊container（如果有）
        const oldContainer = document.getElementById('volume-container');
        if (oldContainer) oldContainer.remove();
        // 建立新容器
        const volumeContainer = document.createElement('div');
        volumeContainer.id = 'volume-container';
        Object.assign(volumeContainer.style, {
            position: 'fixed',
            top: '56px',
            right: '24px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(0,0,0,0.7)',
            borderRadius: '12px',
            padding: '4px 12px',
            boxShadow: '0 0 12px #0ff3',
        });
        // 建立icon
        const icon = document.createElement('span');
        icon.id = 'volume-icon';
        icon.innerHTML = `
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle;">
          <g filter="url(#glow)">
            <path d="M4 11v6h5l5 5V6l-5 5H4z" fill="#0ff" stroke="#fff" stroke-width="1.5"/>
            <path d="M18 9a5 5 0 010 10" stroke="#ffe066" stroke-width="2" stroke-linecap="round"/>
            <path d="M21 6a10 10 0 010 16" stroke="#f0f" stroke-width="1.5" stroke-linecap="round"/>
          </g>
          <defs>
            <filter id="glow" x="-4" y="-4" width="36" height="36" filterUnits="userSpaceOnUse">
              <feGaussianBlur stdDeviation="2.5" result="blur"/>
              <feMerge>
                <feMergeNode in="blur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
        </svg>`;
        icon.style.display = 'flex';
        icon.style.alignItems = 'center';
        icon.style.cursor = 'pointer';
        icon.title = '調整音樂音量';
        icon.onmouseenter = () => { icon.style.filter = 'drop-shadow(0 0 8px #ffe066)'; };
        icon.onmouseleave = () => { icon.style.filter = ''; };
        // 插入到容器
        volumeContainer.appendChild(icon);
        volumeContainer.appendChild(slider);
        // 插入body
        document.body.appendChild(volumeContainer);
    }
});

// ... existing code ...
// 統一彈窗內容寬度為max-width:720px;width:90vw
window.addEventListener('DOMContentLoaded', function() {
    // 玩法說明
    const helpContent = document.getElementById('help-modal-content');
    if (helpContent) {
        helpContent.style.maxWidth = '720px';
        helpContent.style.width = '90vw';
    }
    // 成就
    const achievementContent = document.getElementById('achievement-content');
    if (achievementContent) {
        achievementContent.style.maxWidth = '720px';
        achievementContent.style.width = '90vw';
    }
    // 排行榜
    const leaderboardContent = document.getElementById('leaderboard-content');
    if (leaderboardContent) {
        leaderboardContent.style.maxWidth = '720px';
        leaderboardContent.style.width = '90vw';
    }
});
// ... existing code ...

// ... existing code ...
// ===============================
// 左上角功能選單展開/收合動畫控制
// ===============================
document.addEventListener('DOMContentLoaded', function() {
  const menuToggleBtn = document.getElementById('menu-toggle-btn');
  const menuBtnsWrapper = document.getElementById('menu-btns-wrapper');
  let expanded = false;

  function closeMenu() {
    menuBtnsWrapper.classList.remove('menu-btns-expanded');
    menuBtnsWrapper.classList.add('menu-btns-collapsed');
    expanded = false;
  }
  function openMenu() {
    menuBtnsWrapper.classList.remove('menu-btns-collapsed');
    menuBtnsWrapper.classList.add('menu-btns-expanded');
    expanded = true;
  }
  menuToggleBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    if (expanded) {
      closeMenu();
    } else {
      openMenu();
    }
  });
  // 點擊外部自動收合
  document.addEventListener('click', function(e) {
    if (expanded && !menuBtnsWrapper.contains(e.target) && e.target !== menuToggleBtn) {
      closeMenu();
    }
  });
  // 預設收合
  closeMenu();
});
// ... existing code ...

