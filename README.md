# QuizMind
⚡ QuizMind — A responsive quiz app built with pure HTML, CSS &amp; Vanilla JS. Features dark/light theme, 15s countdown timer, shuffled questions, progress tracking, sound effects, LocalStorage save &amp; animated results. No frameworks, no dependencies.
# ⚡ QuizMind — Interactive Quiz Application

A fully responsive, modern quiz application built with **pure HTML, CSS, and Vanilla JavaScript** — no frameworks, no dependencies.

![Welcome Screen](screenshot-welcome.png)

---

## 🚀 Live Demo

> Open `index.html` directly in your browser — no build step or server required.

---

## 📸 Screenshots

you can check return in readme file inside the folder

---

## ✨ Features

- 🌙 **Dark / Light theme toggle** — persists across sessions via `localStorage`
- ⏱️ **15-second countdown timer** per question with an animated SVG ring (violet → amber → red)
- 🔀 **Shuffled questions & options** on every new game
- 📊 **Live progress bar** + dot navigator showing answered/active questions
- ⬅️➡️ **Previous / Next navigation** — blocked from advancing without selecting an answer
- 💾 **LocalStorage save/restore** — resume a quiz after refreshing the page
- 🏆 **Result screen** with animated score ring, personalized trophy & message
- 📋 **Expandable Answer Review** — see your answer vs. the correct answer for every question
- 🔊 **Sound effects** via Web Audio API (correct, wrong, tick, fanfare) — no external files
- 📱 **Fully responsive** — works on mobile, tablet, and desktop

---

## 🗂️ Project Structure

```
quiz-app/
├── index.html          # Semantic HTML structure & screens
├── style.css           # All styling: themes, animations, glassmorphism
├── script.js           # Quiz logic, timer, scoring, LocalStorage
├── screenshot-welcome.png
├── screenshot-quiz.png
├── screenshot-results.png
└── screenshot-review.png
```

---

## 🛠️ Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Structure  | HTML5 (semantic elements, ARIA)     |
| Styling    | CSS3 — Flexbox, CSS Variables, glassmorphism, SVG animations |
| Logic      | Vanilla JavaScript (ES6+)           |
| Fonts      | Google Fonts — Sora + Inter         |
| Storage    | Browser `localStorage`              |
| Audio      | Web Audio API (no files needed)     |

---

## 📋 Quiz Details

- **10 questions** across Science, Technology, History, Mathematics, Geography, and Biology
- **4 multiple-choice options** per question (shuffled each time)
- **15 seconds** per question — auto-advances on timeout
- Questions are drawn from a JavaScript array and fully shuffled each session

---

## 🎮 How to Play

1. Clone or download the repository
2. Open `index.html` in any modern browser
3. Enter your name and click **Start Quiz**
4. Select an answer before the timer runs out
5. Navigate with **Prev** / **Next** buttons
6. View your score and review all answers at the end

---

## ♿ Accessibility

- Semantic HTML (`<section>`, `<h1>`–`<h2>`, `<button>`, `<label>`)
- `aria-live`, `aria-label`, `role="radiogroup"`, `aria-checked` on all interactive elements
- Visible `:focus-visible` outlines for keyboard navigation
- `prefers-reduced-motion` media query respected

---

## 🎨 Design System

| Token        | Dark Theme  | Light Theme |
|-------------|-------------|-------------|
| Background  | `#0D0F1A`   | `#EEF0FF`   |
| Surface     | `rgba(26,29,46,0.85)` | `rgba(255,255,255,0.82)` |
| Accent      | `#7C3AED`   | `#6D28D9`   |
| Success     | `#10B981`   | same        |
| Danger      | `#EF4444`   | same        |
| Display font | Sora 800   | same        |
| Body font   | Inter 400/600 | same      |

---

## 📄 License

MIT — free to use, modify, and distribute.

---

> Built by [rishi sharma]  CODETECH IT SOLUTION . intern id -- CITS2084 · [Your GitHub Profile](https://github.com/rishi5278)
