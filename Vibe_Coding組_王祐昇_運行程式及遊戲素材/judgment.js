// 判定系統配置
const JUDGE_LINE = {
    POSITION: 100,  // 判定線距離底部的距離
    PERFECT_RANGE: 50,  // Perfect判定範圍（上下各50像素）
    GREAT_RANGE: 80,   // Great判定範圍（上下各80像素）
    GOOD_RANGE: 100,   // Good判定範圍（上下各100像素）
    MISS_RANGE: 150    // Miss判定範圍（超過判定線150像素）
};

// 判定系統
class JudgmentSystem {
    constructor() {
        this.activeNotes = [];
        this.judgeLineY = 0;
        this.currentTime = 0;
        this.gameStartTime = 0;
    }

    // 初始化判定系統
    init(canvas, difficulty) {
        this.canvas = canvas;
        this.difficulty = difficulty;
        this.judgeLineY = canvas.height - JUDGE_LINE.POSITION;
        this.gameStartTime = performance.now();
        console.log('[JudgmentSystem] 初始化完成', {
            judgeLineY: this.judgeLineY,
            difficulty: this.difficulty
        });
    }

    // 設置音符
    setNotes(notes) {
        this.activeNotes = notes.map(note => ({
            ...note,
            hit: false,
            missed: false,
            holdActive: false,
            holdHit: false,
            animating: null
        }));
        console.log('[JudgmentSystem] 設置音符', {
            noteCount: this.activeNotes.length
        });
    }

    // 判定按鍵
    judge(lane) {
        if (!this.activeNotes || this.activeNotes.length === 0) return null;

        const now = (performance.now() - this.gameStartTime) / 1000;
        let hitIndex = -1;
        let hitTiming = Infinity;
        let hitNote = null;

        // 查找最近的音符
        for (let i = 0; i < this.activeNotes.length; i++) {
            const note = this.activeNotes[i];
            if (note.lane === lane && !note.hit && !note.missed) {
                const noteY = (now - note.time) * LEVEL_CONFIGS[this.difficulty].speed;
                const distanceToJudgeLine = Math.abs(noteY - this.judgeLineY);

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

        // 判定結果
        if (hitIndex !== -1 && hitNote) {
            const noteY = (now - hitNote.time) * LEVEL_CONFIGS[this.difficulty].speed;
            const distanceToJudgeLine = Math.abs(noteY - this.judgeLineY);

            let result = {
                index: hitIndex,
                note: hitNote,
                type: null,
                score: 0
            };

            if (distanceToJudgeLine <= JUDGE_LINE.PERFECT_RANGE) {
                result.type = 'perfect';
                result.score = 1000;
            } else if (distanceToJudgeLine <= JUDGE_LINE.GREAT_RANGE) {
                result.type = 'great';
                result.score = 500;
            } else if (distanceToJudgeLine <= JUDGE_LINE.GOOD_RANGE) {
                result.type = 'good';
                result.score = 100;
            } else {
                result.type = 'miss';
                result.score = 0;
            }

            // 移除已判定的音符
            if (result.type !== 'miss') {
                this.activeNotes[hitIndex].hit = true;
                this.activeNotes[hitIndex].animating = 'fade';
                this.activeNotes[hitIndex].fadeY = this.judgeLineY; // 新增：記錄擊中時的Y座標
            } else {
                this.activeNotes[hitIndex].missed = true;
                this.activeNotes[hitIndex].animating = 'miss';
            }

            return result;
        }

        return null;
    }

    // 更新判定線位置
    updateJudgeLine(canvas) {
        this.judgeLineY = canvas.height - JUDGE_LINE.POSITION;
    }

    // 自動檢查 Miss
    checkMiss(currentTime) {
        if (!this.activeNotes) return;

        const speed = LEVEL_CONFIGS[this.difficulty].speed;
        this.activeNotes.forEach((note, index) => {
            if (!note.hit && !note.missed) {
                const noteY = (currentTime - note.time) * speed;
                if (noteY > this.judgeLineY + JUDGE_LINE.MISS_RANGE) {
                    note.missed = true;
                    note.animating = 'miss';
                    return { index, note };
                }
            }
        });

        return null;
    }
}

// 導出判定系統
const judgmentSystem = new JudgmentSystem();
// 請將所有 export 關鍵字移除
// 請將所有 export 關鍵字移除 