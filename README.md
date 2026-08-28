# SAT Error Bank

> An offline-first SAT mistake tracking system that helps students understand their errors, identify recurring patterns, and turn mistakes into AI-powered Anki flashcards.

## Overview

Most SAT students solve hundreds of practice questions, but the biggest improvement often comes from understanding **why they get questions wrong**.

SAT Error Bank is a personal mistake analysis tool designed around a simple learning loop:

```
Wrong Question
      ↓
Understand the Mistake
      ↓
Extract the Lesson
      ↓
Review
      ↓
Avoid Repeating the Error
```

Instead of storing questions as a simple archive, the app helps students build a personal database of their weaknesses and learning patterns.

---

# Features

## Mistake Tracking

Record every incorrect SAT question with:

* Question
* Why you got it wrong
* Correct answer
* How to avoid the mistake next time

Additional metadata:

* SAT section
* Topic
* Error type
* Review status
* Notes

---

## Error Classification

Organize mistakes using categories:

* Concept Gap
* Misread Question
* Careless Mistake
* Reasoning Error
* Time Pressure
* Vocabulary / Language
* Forgot Rule / Formula
* Guessing
* Trap Answer
* Other

This allows users to discover their most common failure patterns.

---

## Review System

A dedicated review workflow helps convert mistakes into learning.

Users can:

* Review previous mistakes
* Reveal explanations
* Mark mistakes as understood
* Track repeated mistakes
* Identify weak areas

The goal is not remembering old questions.

The goal is preventing the same mistake from happening again.

---

## AI Flashcard Workflow

SAT Error Bank is designed to work with AI tools.

Users can export mistakes into a structured prompt for:

* ChatGPT
* Claude
* Gemini
* Other AI assistants

The AI can transform mistakes into high-quality Anki cards focused on:

* underlying concepts
* reasoning patterns
* mistake prevention strategies

---

## Offline-First Design

The app is built as a local-first Progressive Web App.

Benefits:

* Works without internet
* No account required
* No cloud dependency
* Fast access
* User owns their data

All study data stays on the user's device.

---

## Data Backup

Users can:

* Export their mistake database
* Import previous backups
* Move their data between devices

The app is designed so students never lose their learning history.

---

# Tech Stack

Built with:

* React
* TypeScript
* Tailwind CSS
* IndexedDB
* Progressive Web App (PWA) architecture

---

# Architecture

The application follows a local-first approach:

```
User Input
    |
    ↓
React Interface
    |
    ↓
Local Data Layer
    |
    ↓
IndexedDB Storage
    |
    ↓
Export / Review / Analysis
```

No backend or authentication is required.

The architecture is designed to keep the app simple, private, and reliable.

---

# Why This Exists

Traditional question banks tell students:

> "You got this question wrong."

SAT Error Bank focuses on the more important question:

> "Why did you get it wrong, and how do you make sure it never happens again?"

Improvement comes from reducing repeated mistakes, not just solving more problems.

---

# Future Improvements

Possible future features:

* AI-powered mistake analysis
* Automatic topic detection
* OCR question extraction
* AnkiConnect integration
* Adaptive review scheduling
* Cloud synchronization
* SAT score progress tracking

---

# Privacy

Your data belongs to you.

SAT Error Bank:

* Does not require an account
* Does not collect personal data
* Stores information locally on your device

---

# Development

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

---

# Contributing

Contributions, suggestions, and improvements are welcome.

If you have ideas for improving study workflows or error analysis systems, feel free to open an issue or submit a pull request.

---

# License

MIT License
