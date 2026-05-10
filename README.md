# AI Interview Preparation Platform

An AI-powered mock interview web application that helps students and job seekers practice technical and HR interviews with real-time AI-generated questions, answer evaluation, and performance feedback.

## Features

- AI-generated interview questions
- Technical and HR interview modes
- Real-time answer evaluation
- Interview score and feedback system
- User authentication and secure login
- Responsive modern UI
- Interview history tracking
- Voice input support using Web Speech API
- Dashboard for performance analysis

---

## Tech Stack

### Frontend
- React.js
- Tailwind CSS
- React Router
- Axios

### Backend
- Node.js
- Express.js

### Database
- MongoDB Atlas

### AI Integration
- Gemini API / OpenAI API

### Deployment
- Vercel (Frontend)

---

## Project Architecture

```text
User
 ↓
React Frontend
 ↓
Node.js/Express Backend
 ↓
AI API (Gemini/OpenAI)
 ↓
MongoDB Database
```

---

## Installation

### Clone Repository

```bash
git clone https://github.com/Rathish-codevision/ai-interview-platform.git
```

### Frontend Setup

```bash
cd client
npm install
npm run dev
```

### Backend Setup

```bash
cd server
npm install
npm start
```

---

## Environment Variables

Create a `.env` file inside the server folder.

```env
MONGODB_URI=your_mongodb_url
GEMINI_API_KEY=your_api_key
JWT_SECRET=your_secret_key
```
---

## Live Demo
https://v0-ai-interviewplatform.vercel.app/
---

## Future Improvements

- AI voice interviewer
- Resume-based question generation
- Coding interview rounds
- Leaderboard system
- AI confidence analysis
- PDF performance reports

---
