/**
 * QuizMind — script.js
 * Modular Vanilla JS · LocalStorage · Timer · Shuffle · Sound
 */

'use strict';

/* =============================================
   QUESTION BANK
   ============================================= */
const QUESTION_BANK = [
  {
    category: 'Science',
    question: 'What is the powerhouse of the cell?',
    options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Golgi Apparatus'],
    answer: 'Mitochondria'
  },
  {
    category: 'Technology',
    question: 'What does "HTTP" stand for?',
    options: ['HyperText Transfer Protocol', 'High Transfer Text Process', 'Hyper Transfer Text Program', 'HyperText Transmission Path'],
    answer: 'HyperText Transfer Protocol'
  },
  {
    category: 'History',
    question: 'In which year did the first moon landing occur?',
    options: ['1965', '1967', '1969', '1971'],
    answer: '1969'
  },
  {
    category: 'Mathematics',
    question: 'What is the value of π (Pi) to two decimal places?',
    options: ['3.12', '3.14', '3.16', '3.18'],
    answer: '3.14'
  },
  {
    category: 'Geography',
    question: 'Which is the largest ocean on Earth?',
    options: ['Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean', 'Pacific Ocean'],
    answer: 'Pacific Ocean'
  },
  {
    category: 'Science',
    question: 'What is the chemical symbol for Gold?',
    options: ['Gd', 'Go', 'Au', 'Ag'],
    answer: 'Au'
  },
  {
    category: 'Technology',
    question: 'Who is widely considered the father of the World Wide Web?',
    options: ['Bill Gates', 'Tim Berners-Lee', 'Linus Torvalds', 'Steve Jobs'],
    answer: 'Tim Berners-Lee'
  },
  {
    category: 'History',
    question: 'Which ancient wonder of the world was located in Alexandria?',
    options: ['The Colossus of Rhodes', 'The Lighthouse of Alexandria', 'The Temple of Artemis', 'The Hanging Gardens'],
    answer: 'The Lighthouse of Alexandria'
  },
  {
    category: 'Biology',
    question: 'How many bones does an adult human body have?',
    options: ['196', '206', '216', '226'],
    answer: '206'
  },
  {
    category: 'Technology',
    question: 'What does "CPU" stand for?',
    options: ['Central Processing Unit', 'Computer Personal Unit', 'Core Programming Utility', 'Central Program Updater'],
    answer: 'Central Processing Unit'
  }
];

/* =============================================
   CONSTANTS
   ============================================= */
const TIMER_SECONDS  = 15;
const STORAGE_KEY    = 'quizmind_state';
const LETTERS        = ['A', 'B', 'C', 'D'];

/* =============================================
   AUDIO (Web Audio API — no external files)
   ============================================= */
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function ensureAudio() {
  if (!audioCtx) { try { audioCtx = new AudioCtx(); } catch(e) {} }
}

/**
 * Plays a short tone. type: 'correct' | 'wrong' | 'tick' | 'complete'
 */
function playSound(type) {
  ensureAudio();
  if (!audioCtx) return;
  try {
    const osc  = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    if (type === 'correct') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523, now);          // C5
      osc.frequency.setValueAtTime(659, now + 0.1);    // E5
      osc.frequency.setValueAtTime(784, now + 0.2);    // G5
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.start(now); osc.stop(now + 0.5);
    } else if (type === 'wrong') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.setValueAtTime(200, now + 0.15);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now); osc.stop(now + 0.35);
    } else if (type === 'tick') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now); osc.stop(now + 0.08);
    } else if (type === 'complete') {
      // ascending arpeggio
      [523, 659, 784, 1047].forEach((freq, i) => {
        const o2 = audioCtx.createOscillator();
        const g2 = audioCtx.createGain();
        o2.connect(g2); g2.connect(audioCtx.destination);
        o2.type = 'sine';
        o2.frequency.setValueAtTime(freq, now + i * 0.12);
        g2.gain.setValueAtTime(0.15, now + i * 0.12);
        g2.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.25);
        o2.start(now + i * 0.12);
        o2.stop(now + i * 0.12 + 0.25);
      });
      return; // early return — extra oscillators handle it
    }
  } catch (e) {
    // silently fail — audio is optional
  }
}

/* =============================================
   STATE
   ============================================= */
let state = {
  playerName: '',
  questions: [],      // shuffled subset
  current: 0,
  answers: {},        // { questionIndex: selectedOption }
  timerValue: TIMER_SECONDS,
  timerInterval: null,
  quizStarted: false
};

/* =============================================
   DOM REFERENCES
   ============================================= */
const $ = id => document.getElementById(id);

const screens = {
  welcome: $('welcomeScreen'),
  quiz:    $('quizScreen'),
  result:  $('resultScreen')
};

const ui = {
  themeToggle:   $('themeToggle'),
  themeIcon:     document.querySelector('.theme-icon'),
  playerName:    $('playerName'),
  nameError:     $('nameError'),
  startBtn:      $('startBtn'),

  playerBadge:   $('playerBadge'),
  questionCounter: $('questionCounter'),
  progressFill:  $('progressFill'),
  progressBar:   $('progressBar'),
  dotNav:        $('dotNav'),

  timerRingFill: $('timerRingFill'),
  timerNumber:   $('timerNumber'),
  questionCategory: $('questionCategory'),
  questionText:  $('questionText'),
  optionsGrid:   $('optionsGrid'),

  prevBtn:       $('prevBtn'),
  nextBtn:       $('nextBtn'),

  resultTrophy:  $('resultTrophy'),
  resultTitle:   $('resultTitle'),
  resultName:    $('resultName'),
  scoreRingFill: $('scoreRingFill'),
  scorePct:      $('scorePct'),
  correctCount:  $('correctCount'),
  incorrectCount:$('incorrectCount'),
  skippedCount:  $('skippedCount'),
  playAgainBtn:  $('playAgainBtn'),
  reviewBtn:     $('reviewBtn'),
  reviewSection: $('reviewSection'),
  reviewList:    $('reviewList')
};

/* =============================================
   THEME
   ============================================= */
function getTheme()       { return localStorage.getItem('quizmind_theme') || 'dark'; }
function setTheme(theme)  {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('quizmind_theme', theme);
  ui.themeIcon.textContent = theme === 'dark' ? '🌙' : '☀️';
}

ui.themeToggle.addEventListener('click', () => {
  const next = getTheme() === 'dark' ? 'light' : 'dark';
  setTheme(next);
});

// Init theme on load
setTheme(getTheme());

/* =============================================
   UTILITY: Shuffle (Fisher-Yates)
   ============================================= */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* =============================================
   SCREEN MANAGEMENT
   ============================================= */
function showScreen(name) {
  Object.entries(screens).forEach(([key, el]) => {
    el.classList.toggle('hidden', key !== name);
  });
  // Re-trigger animation
  if (screens[name]) {
    screens[name].style.animation = 'none';
    screens[name].offsetHeight; // reflow
    screens[name].style.animation = '';
  }
}

/* =============================================
   LOCAL STORAGE
   ============================================= */
function saveState() {
  const toSave = {
    playerName: state.playerName,
    questions:  state.questions,
    current:    state.current,
    answers:    state.answers,
    quizStarted: state.quizStarted
  };
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave)); } catch(e) {}
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const saved = JSON.parse(raw);
    if (!saved.quizStarted || !saved.questions?.length) return false;
    Object.assign(state, saved);
    return true;
  } catch(e) { return false; }
}

function clearState() {
  try { localStorage.removeItem(STORAGE_KEY); } catch(e) {}
}

/* =============================================
   TIMER
   ============================================= */
const TIMER_CIRCUMFERENCE = 150.796; // 2π × 24

function startTimer() {
  stopTimer();
  state.timerValue = TIMER_SECONDS;
  renderTimer();

  state.timerInterval = setInterval(() => {
    state.timerValue--;
    renderTimer();

    if (state.timerValue <= 5) playSound('tick');

    if (state.timerValue <= 0) {
      stopTimer();
      // If no answer selected, auto-advance
      if (state.answers[state.current] === undefined) {
        state.answers[state.current] = null; // mark as skipped
        saveState();
      }
      if (state.current < state.questions.length - 1) {
        state.current++;
        saveState();
        renderQuestion();
        startTimer();
      } else {
        endQuiz();
      }
    }
  }, 1000);
}

function stopTimer() {
  if (state.timerInterval) {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
  }
}

function renderTimer() {
  const pct    = state.timerValue / TIMER_SECONDS;
  const offset = TIMER_CIRCUMFERENCE * (1 - pct);
  ui.timerRingFill.style.strokeDashoffset = offset;
  ui.timerNumber.textContent = state.timerValue;

  // Color states
  ui.timerRingFill.classList.remove('warn', 'danger');
  if (state.timerValue <= 5) {
    ui.timerRingFill.classList.add('danger');
  } else if (state.timerValue <= 8) {
    ui.timerRingFill.classList.add('warn');
  }
}

/* =============================================
   DOT NAVIGATOR
   ============================================= */
function renderDots() {
  ui.dotNav.innerHTML = '';
  state.questions.forEach((_, idx) => {
    const dot = document.createElement('div');
    dot.className = 'dot';
    if (idx === state.current) dot.classList.add('active');
    if (state.answers[idx] !== undefined && idx !== state.current) {
      dot.classList.add('answered');
    }
    ui.dotNav.appendChild(dot);
  });
}

/* =============================================
   RENDER QUESTION
   ============================================= */
function renderQuestion() {
  const q    = state.questions[state.current];
  const total = state.questions.length;
  const pct  = ((state.current) / total) * 100;

  // Top bar
  ui.playerBadge.textContent = `👤 ${state.playerName}`;
  ui.questionCounter.innerHTML = `<span>${state.current + 1}</span> / ${total}`;

  // Progress
  ui.progressFill.style.width = `${pct}%`;
  ui.progressBar.setAttribute('aria-valuenow', Math.round(pct));

  // Dots
  renderDots();

  // Category + question
  ui.questionCategory.textContent = q.category;
  ui.questionText.textContent     = q.question;

  // Options
  ui.optionsGrid.innerHTML = '';
  const shuffledOpts = q._shuffledOptions || q.options;

  shuffledOpts.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className   = 'option-btn';
    btn.type        = 'button';
    btn.dataset.opt = opt;
    btn.style.animationDelay = `${i * 60}ms`;
    btn.setAttribute('role', 'radio');
    btn.setAttribute('aria-checked', 'false');
    btn.setAttribute('aria-label', `Option ${LETTERS[i]}: ${opt}`);

    const letter = document.createElement('span');
    letter.className   = 'option-letter';
    letter.textContent = LETTERS[i];
    letter.setAttribute('aria-hidden', 'true');

    const text = document.createElement('span');
    text.textContent = opt;

    btn.appendChild(letter);
    btn.appendChild(text);

    // Apply saved selection
    const saved = state.answers[state.current];
    if (saved === opt) {
      btn.classList.add('selected');
      btn.setAttribute('aria-checked', 'true');
    }

    btn.addEventListener('click', () => selectOption(btn, opt));
    ui.optionsGrid.appendChild(btn);
  });

  // Nav buttons
  ui.prevBtn.disabled = (state.current === 0);
  ui.nextBtn.textContent = state.current === total - 1 ? 'Finish ' : 'Next ';

  // Add arrow SVG back (textContent clears it)
  const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  arrow.setAttribute('viewBox', '0 0 24 24');
  arrow.setAttribute('fill', 'none');
  arrow.setAttribute('stroke', 'currentColor');
  arrow.setAttribute('stroke-width', '2.5');
  arrow.setAttribute('aria-hidden', 'true');
  arrow.style.width = '16px'; arrow.style.height = '16px';
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M5 12h14M12 5l7 7-7 7');
  arrow.appendChild(path);
  ui.nextBtn.appendChild(arrow);
}

/* =============================================
   SELECT OPTION
   ============================================= */
function selectOption(btn, opt) {
  const allBtns = ui.optionsGrid.querySelectorAll('.option-btn');
  allBtns.forEach(b => {
    b.classList.remove('selected');
    b.setAttribute('aria-checked', 'false');
  });
  btn.classList.add('selected');
  btn.setAttribute('aria-checked', 'true');
  state.answers[state.current] = opt;
  saveState();
  // Update dot
  renderDots();
}

/* =============================================
   NAVIGATION
   ============================================= */
ui.nextBtn.addEventListener('click', () => {
  // Prevent advancing without answer (unless on last question = finish)
  if (state.answers[state.current] === undefined) {
    shakeCard();
    showAnswerHint();
    return;
  }
  stopTimer();
  if (state.current < state.questions.length - 1) {
    state.current++;
    saveState();
    renderQuestion();
    startTimer();
  } else {
    endQuiz();
  }
});

ui.prevBtn.addEventListener('click', () => {
  if (state.current > 0) {
    stopTimer();
    state.current--;
    saveState();
    renderQuestion();
    startTimer();
  }
});

function shakeCard() {
  const card = document.querySelector('.quiz-card');
  card.style.animation = 'none';
  card.offsetHeight;
  card.style.animation = 'shake 0.4s cubic-bezier(.36,.07,.19,.97)';
}

function showAnswerHint() {
  // Brief color flash on options
  const opts = ui.optionsGrid.querySelectorAll('.option-btn');
  opts.forEach(o => {
    o.style.borderColor = 'var(--danger)';
    setTimeout(() => { o.style.borderColor = ''; }, 600);
  });
}

// Shake keyframe (injected once)
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake {
    0%,100%{ transform:translateX(0) }
    20%    { transform:translateX(-6px) }
    40%    { transform:translateX(6px) }
    60%    { transform:translateX(-4px) }
    80%    { transform:translateX(4px) }
  }
`;
document.head.appendChild(shakeStyle);

/* =============================================
   START QUIZ
   ============================================= */
ui.startBtn.addEventListener('click', startQuiz);
ui.playerName.addEventListener('keydown', e => { if (e.key === 'Enter') startQuiz(); });

function startQuiz() {
  const name = ui.playerName.value.trim();
  if (!name) {
    ui.nameError.textContent = 'Please enter your name to begin.';
    ui.playerName.focus();
    return;
  }
  ui.nameError.textContent = '';

  // Shuffle questions and their options
  const shuffled = shuffle(QUESTION_BANK).map(q => ({
    ...q,
    _shuffledOptions: shuffle(q.options)
  }));

  state.playerName = name;
  state.questions  = shuffled;
  state.current    = 0;
  state.answers    = {};
  state.quizStarted = true;

  saveState();
  showScreen('quiz');
  renderQuestion();
  startTimer();
}

/* =============================================
   END QUIZ
   ============================================= */
function endQuiz() {
  stopTimer();
  playSound('complete');

  const total = state.questions.length;
  let correct = 0, incorrect = 0, skipped = 0;

  state.questions.forEach((q, i) => {
    const ans = state.answers[i];
    if (ans === null || ans === undefined) {
      skipped++;
    } else if (ans === q.answer) {
      correct++;
    } else {
      incorrect++;
    }
  });

  const pct = Math.round((correct / total) * 100);

  // Trophy & title based on score
  const { trophy, title } = getResultBadge(pct);
  ui.resultTrophy.textContent = trophy;
  ui.resultTitle.textContent  = title;
  ui.resultName.innerHTML     = `Well done, <span>${state.playerName}</span>!`;

  ui.correctCount.textContent   = correct;
  ui.incorrectCount.textContent = incorrect;
  ui.skippedCount.textContent   = skipped;

  showScreen('result');

  // Animate score ring
  setTimeout(() => {
    const circ = 326.73;
    const offset = circ * (1 - pct / 100);
    ui.scoreRingFill.style.strokeDashoffset = offset;
    // Color ring by performance
    if (pct >= 80) {
      ui.scoreRingFill.style.stroke = '#10B981';
    } else if (pct >= 50) {
      ui.scoreRingFill.style.stroke = '#7C3AED';
    } else {
      ui.scoreRingFill.style.stroke = '#EF4444';
    }
    // Animate percentage number
    animateNumber(ui.scorePct, 0, pct, 1200, v => `${v}%`);
  }, 200);

  clearState();
}

function getResultBadge(pct) {
  if (pct === 100) return { trophy: '🏆', title: 'Perfect Score! Genius!' };
  if (pct >= 80)   return { trophy: '🌟', title: 'Excellent Work!' };
  if (pct >= 60)   return { trophy: '👍', title: 'Good Job!' };
  if (pct >= 40)   return { trophy: '📚', title: 'Keep Practicing!' };
  return              { trophy: '💪', title: 'Don\'t Give Up!' };
}

function animateNumber(el, from, to, duration, format = v => v) {
  const start = performance.now();
  function step(now) {
    const t = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - t, 3); // cubic ease-out
    el.textContent = format(Math.round(from + (to - from) * ease));
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* =============================================
   PLAY AGAIN
   ============================================= */
ui.playAgainBtn.addEventListener('click', () => {
  ui.reviewSection.classList.add('hidden');
  ui.reviewList.innerHTML = '';
  state = { playerName: '', questions: [], current: 0, answers: {}, timerValue: TIMER_SECONDS, timerInterval: null, quizStarted: false };
  ui.playerName.value = '';
  showScreen('welcome');
});

/* =============================================
   REVIEW ANSWERS
   ============================================= */
ui.reviewBtn.addEventListener('click', () => {
  const isHidden = ui.reviewSection.classList.contains('hidden');
  if (!isHidden) {
    ui.reviewSection.classList.add('hidden');
    ui.reviewBtn.textContent = 'Review Answers';
    return;
  }

  ui.reviewList.innerHTML = '';
  state.questions.forEach((q, i) => {
    const userAns = state.answers[i];
    const isCorrect = userAns === q.answer;
    const isSkipped = userAns === null || userAns === undefined;

    const item = document.createElement('div');
    item.className = `review-item${isSkipped ? ' skipped' : ''}`;
    item.setAttribute('aria-label', `Question ${i + 1}`);
    item.style.animationDelay = `${i * 40}ms`;

    item.innerHTML = `
      <div class="review-item-q">
        <span class="review-num">${i + 1}</span>
        <span>${q.question}</span>
      </div>
      <div class="review-answers">
        <div class="review-ans-row">
          <span class="review-ans-label">Your Answer</span>
          <span class="review-ans-val your-answer ${isSkipped ? '' : isCorrect ? 'correct' : 'incorrect'}">
            ${isSkipped ? '— Skipped' : userAns}
          </span>
          <span class="review-icon" aria-hidden="true">${isSkipped ? '⏭️' : isCorrect ? '✅' : '❌'}</span>
        </div>
        ${!isCorrect ? `
        <div class="review-ans-row">
          <span class="review-ans-label">Correct</span>
          <span class="review-ans-val correct-val">${q.answer}</span>
          <span class="review-icon" aria-hidden="true">✅</span>
        </div>` : ''}
      </div>
    `;
    ui.reviewList.appendChild(item);
  });

  ui.reviewSection.classList.remove('hidden');
  ui.reviewBtn.textContent = 'Hide Review';
  ui.reviewSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

/* =============================================
   ANSWER SOUND ON NEXT
   (Play sound when leaving a question)
   ============================================= */
// Wrap next button to also trigger sound
const origNext = ui.nextBtn.onclick;
ui.nextBtn.addEventListener('click', () => {
  const ans = state.answers[state.current];
  const q   = state.questions[state.current];
  if (ans !== undefined && ans !== null && q) {
    if (ans === q.answer) playSound('correct');
    else                  playSound('wrong');
  }
}, true); // capture phase so it fires before the main handler

/* =============================================
   RESTORE STATE ON LOAD
   ============================================= */
(function init() {
  const restored = loadState();
  if (restored && state.quizStarted && state.questions.length) {
    // Re-shuffle options for each question (they're already saved)
    // But they come from storage, re-apply
    showScreen('quiz');
    renderQuestion();
    startTimer();
  }
})();
