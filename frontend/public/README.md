# 🔍 reviewr

AI-powered code reviewer built with React + FastAPI + Groq (Llama 3).

## ✨ Features
- 🤖 AI code review powered by Groq + Llama 3
- 🐛 Bug detection
- 🔒 Security audit
- ⚡ Performance analysis
- 🎓 Beginner friendly mode
- 10+ programming languages supported
- Beautiful GitHub-inspired dark UI

## 🚀 Quick Start

### Backend
cd backend
python -m venv venv
venv\Scripts\activate
pip install fastapi uvicorn httpx python-dotenv pydantic
python main.py

### Frontend
cd frontend
npm install
npm start

## 🛠️ Tech Stack
- Frontend: React 18, Axios
- Backend: FastAPI, httpx
- AI: Groq API (Llama 3 — free tier)
- Styling: Custom CSS

## 🔌 API Endpoints
- POST /review — Submit code for AI review
- GET /languages — Get supported languages
- GET /focus-options — Get review focus options

## 📄 License
MIT License