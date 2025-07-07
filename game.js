// Fate Keys 命運節奏 - 主要遊戲邏輯
// ===============================

// 取得 DOM 元素
const gameArea = document.getElementById('game-area');
const resultScreen = document.getElementById('result-screen');
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const keyHints = document.querySelectorAll('.key');
const scoreDisplay = document.getElementById('score-display');
const comboDisplay = document.getElementById('combo-display');
const finalScore = document.getElementById('final-score');
const finalGrade = document.getElementById('final-grade');
const restartBtn = document.getElementById('restart-btn');
const backBtn = document.getElementById('back-btn');

// 遊戲設定
const KEY_LIST = ['A', 'S', 'D', 'F', 'G'];
const KEY_COLORS = ['#ff6f91', '#4ecdc4', '#ffe066', '#5f6fff', '#ffb347'];
let currentDifficulty = 'easy'; // 預設難度

// 音符下落速度（依難度調整）
const SPEEDS = {
    easy: 1.2,
    normal: 1.7,
    hard: 2.3,
    master: 2.8 // 魔王
};

// 每秒音符數（依難度調整）
const NOTES_PER_SEC = {
    easy: 2,
    normal: 3,
    hard: 4,
    master: 6
};

// 判定區間（毫秒）
const JUDGE = {
    perfect: 90,
    good: 180
};

// 遊戲狀態
let notes = [];
let currentNoteIndex = 0;
let startTime = 0;
let score = 0;
let combo = 0;
let maxCombo = 0;
let isPlaying = false;
let animationId = null;
let audioBuffer = null;
let audioCtx = null;
let audioSource = null;
let endTimer = null;
let timerInterval = null;
let bgmAudioTag = null;

// ===============================
// 畫面切換
// ===============================
function showScreen(screen) {
    if (gameArea) gameArea.style.display = screen === 'game' ? 'flex' : 'none';
    if (resultScreen) resultScreen.style.display = screen === 'result' ? 'flex' : 'none';
}

// ===============================
// 產生音符陣列（每排同時只能有一個音符）
// ===============================
function generateNotes(difficulty, duration = 30) {
    const notes = [];
    const nps = NOTES_PER_SEC[difficulty];
    const lastTimePerLane = [0, 0, 0, 0, 0];
    let lastLane = -1;
    for (let t = 0; t < duration; t += 1 / nps) {
        let lanes = [0, 1, 2, 3, 4].filter(l => l !== lastLane);
        const idx = Math.floor(Math.random() * lanes.length);
        const lane = lanes[idx];
        // 至少間隔0.5秒，且不連續同一lane
        if (t - lastTimePerLane[lane] < 0.5) continue;
        notes.push({ time: t, lane, hit: false, anim: 0 });
        lastTimePerLane[lane] = t;
        lastLane = lane;
    }
    return notes;
}

// ===============================
// 遊戲開始與重啟
// ===============================
if (restartBtn) restartBtn.addEventListener('click', startGame);
if (backBtn) backBtn.addEventListener('click', () => {
    showScreen('game');
    startGame();
});

// 響應式 Canvas 畫面比例調整
function resizeCanvas() {
    // 以 3:4 比例自動縮放，最大 480x640
    let w = Math.min(window.innerWidth * 0.98, 480);
    let h = w * 4 / 3;
    if (h > window.innerHeight * 0.8) {
        h = window.innerHeight * 0.8;
        w = h * 3 / 4;
    }
    canvas.width = w;
    canvas.height = h;
}
window.addEventListener('resize', resizeCanvas);

function startGame() {
    stopBgm(); // 停止背景音樂
    notes = generateNotes(currentDifficulty, 30); // 重新生成音符
    currentNoteIndex = 0;
    score = 0;
    combo = 0;
    maxCombo = 0;
    isPlaying = true;
    scoreDisplay.textContent = '分數：0';
    comboDisplay.textContent = '';
    showScreen('game');
    resizeCanvas(); // 每次開始都自動調整畫布
    loadAndPlayMusic('Champion.mp3', () => {
        startTime = performance.now();
        animationId = requestAnimationFrame(gameLoop);
        if (endTimer) clearTimeout(endTimer);
        endTimer = setTimeout(() => {
            endGame();
        }, 30000);
    });
}

// ===============================
// 音樂播放（Web Audio API）
// ===============================
function loadAndPlayMusic(song, onStart) {
    if (audioSource) {
        try {
            if (audioSource.playbackState === undefined || audioSource.playbackState === 2) {
                audioSource.stop();
            }
        } catch (e) {}
        audioSource.disconnect();
    }
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    fetch(song)
        .then(res => res.arrayBuffer())
        .then(arrayBuffer => audioCtx.decodeAudioData(arrayBuffer))
        .then(buffer => {
            audioBuffer = buffer;
            audioSource = audioCtx.createBufferSource();
            audioSource.buffer = audioBuffer;
            audioSource.connect(audioCtx.destination);
            audioSource.onended = endGame;
            audioSource.start();
            onStart && onStart();
        })
        .catch(() => {
            onStart && onStart();
        });
}

// ===============================
// Canvas 動畫主迴圈
// ===============================
function gameLoop(now) {
    if (!isPlaying) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground(now);
    drawNotes(now);
    animationId = requestAnimationFrame(gameLoop);
}

function drawBackground(now) {
    for (let i = 0; i < 30; i++) {
        const x = (now / 10 + i * 50) % canvas.width;
        const y = (now / 5 + i * 80) % canvas.height;
        ctx.beginPath();
        ctx.arc(x, y, 2 + (i % 3), 0, 2 * Math.PI);
        ctx.fillStyle = i % 2 === 0 ? '#4ecdc4' : '#ffb347';
        ctx.globalAlpha = 0.18;
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

function drawNotes(now) {
    const elapsed = (now - startTime) / 1000;
    const speed = SPEEDS[currentDifficulty];
    const laneWidth = canvas.width / KEY_LIST.length;
    const noteHeight = 32;
    for (let i = currentNoteIndex; i < notes.length; i++) {
        const note = notes[i];
        if (note.hit && note.anim >= 1) continue; // 動畫結束才消失
        const dropTime = note.time;
        const y = (elapsed - dropTime) * speed * 180 + 60;
        if (y > canvas.height - 100 + noteHeight) continue;
        if (y < -noteHeight) continue;
        // 動畫：被擊中時縮放消失
        let scale = 1;
        if (note.hit && note.anim < 1) {
            scale = 1 - note.anim;
            note.anim += 0.08;
        }
        ctx.save();
        ctx.translate(note.lane * laneWidth + laneWidth / 2, y + noteHeight / 2);
        ctx.scale(scale, scale);
        ctx.fillStyle = KEY_COLORS[note.lane];
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(-laneWidth/2 + 10, -noteHeight/2, laneWidth - 20, noteHeight, 10);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }
    // 判定線
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 100);
    ctx.lineTo(canvas.width, canvas.height - 100);
    ctx.stroke();
}

// ===============================
// 鍵盤事件與判定
// ===============================
document.addEventListener('keydown', (e) => {
    if (!isPlaying) return;
    const key = e.key.toUpperCase();
    const lane = KEY_LIST.indexOf(key);
    if (lane === -1) return;
    keyHints[lane].classList.add('active');
    setTimeout(() => keyHints[lane].classList.remove('active'), 120);
    judgeNote(lane);
});

function judgeNote(lane) {
    const now = (performance.now() - startTime) / 1000;
    for (let i = currentNoteIndex; i < notes.length; i++) {
        const note = notes[i];
        if (note.lane !== lane) continue;
        const diff = Math.abs(now - note.time) * 1000;
        if (diff <= JUDGE.perfect) {
            hitNote(i, 'Perfect');
            return;
        } else if (diff <= JUDGE.good) {
            hitNote(i, 'Good');
            return;
        } else if (now < note.time) {
            break;
        }
    }
    missNote();
}

function hitNote(index, type) {
    notes[index].hit = true;
    notes[index].anim = 0; // 啟動動畫
    if (index === currentNoteIndex) {
        while (notes[currentNoteIndex] && notes[currentNoteIndex].hit) currentNoteIndex++;
    }
    let addScore = type === 'Perfect' ? 500 : 200;
    score += addScore;
    combo++;
    maxCombo = Math.max(combo, maxCombo);
    scoreDisplay.textContent = `分數：${score}`;
    comboDisplay.textContent = `${type}! Combo x${combo}`;
    comboDisplay.style.color = type === 'Perfect' ? '#ffb347' : '#4ecdc4';
    // Combo/分數 閃爍動畫
    scoreDisplay.style.textShadow = '0 0 16px #fff, 0 0 32px #0ff';
    comboDisplay.style.transform = 'scale(1.3)';
    setTimeout(() => {
        scoreDisplay.style.textShadow = '';
        comboDisplay.style.transform = 'scale(1)';
    }, 180);
}

function missNote() {
    combo = 0;
    comboDisplay.textContent = 'Miss!';
    comboDisplay.style.color = '#ff6f91';
    comboDisplay.style.transform = 'scale(1.3)';
    setTimeout(() => comboDisplay.style.transform = 'scale(1)', 180);
}

// ===============================
// 遊戲結束與分數結算
// ===============================
function endGame() {
    isPlaying = false;
    cancelAnimationFrame(animationId);
    if (endTimer) {
        clearTimeout(endTimer);
        endTimer = null;
    }
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    if (audioSource) {
        try { audioSource.stop(); } catch (e) {}
        audioSource.disconnect();
    }
    playBgm();
    let grade = 'C';
    if (score >= 12000) grade = 'S';
    else if (score >= 9000) grade = 'A';
    else if (score >= 6000) grade = 'B';
    finalScore.textContent = `分數：${score}（最大Combo：${maxCombo}）`;
    finalGrade.textContent = `等級：${grade}`;
    showScreen('result');
}

// ===============================
// 輔助：自動 Miss 超時音符
// ===============================
setInterval(() => {
    if (!isPlaying) return;
    const now = (performance.now() - startTime) / 1000;
    for (let i = currentNoteIndex; i < notes.length; i++) {
        const note = notes[i];
        if (note.hit) continue;
        const speed = SPEEDS[currentDifficulty];
        const y = (now - note.time) * speed * 180 + 60;
        if (y > canvas.height - 100 + 16) {
            missNote();
            note.hit = true;
            if (i === currentNoteIndex) currentNoteIndex++;
        } else {
            break;
        }
    }
}, 60);

// ===============================
// 背景音樂播放控制
// ===============================
function playBgm() {
    if (bgmAudioTag) {
        bgmAudioTag.pause();
        bgmAudioTag.currentTime = 0;
    }
    bgmAudioTag = new Audio('DRIVE.mp3');
    bgmAudioTag.loop = true;
    bgmAudioTag.volume = 0.5;
    bgmAudioTag.play();
}

function stopBgm() {
    if (bgmAudioTag) {
        bgmAudioTag.pause();
        bgmAudioTag.currentTime = 0;
    }
}

// ===============================
// 初始化
// ===============================
showScreen('game');
resizeCanvas();

// 一進入頁面自動開始遊戲
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => startGame(), 200);
}); 