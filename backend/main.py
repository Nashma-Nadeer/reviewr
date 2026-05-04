"""
reviewr/backend/main.py - AI Code Reviewer API
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
import httpx
from dotenv import load_dotenv

from pathlib import Path
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
print("API KEY LOADED:", GROQ_API_KEY[:10] if GROQ_API_KEY else "NOT FOUND")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

app = FastAPI(title="Reviewr API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CodeReviewRequest(BaseModel):
    code: str
    language: str
    focus: Optional[str] = "general"

class CodeReviewResponse(BaseModel):
    review: str
    language: str
    focus: str

REVIEW_PROMPTS = {
    "general": "Review this code for bugs, best practices, readability, and improvements.",
    "security": "Review this code for security vulnerabilities and unsafe practices.",
    "performance": "Review this code for performance issues and optimization opportunities.",
    "beginner": "Review this code for a beginner. Be encouraging but point out improvements.",
}

@app.get("/")
def read_root():
    return {"message": "Reviewr API", "version": "0.1.0"}

@app.post("/review", response_model=CodeReviewResponse)
async def review_code(request: CodeReviewRequest):
    if not GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not configured")

    if not request.code.strip():
        raise HTTPException(status_code=400, detail="Code cannot be empty")

    prompt_focus = REVIEW_PROMPTS.get(request.focus, REVIEW_PROMPTS["general"])

    system_prompt = "You are an expert code reviewer with 10 years of experience. Review code clearly and constructively. Format your response with these sections: Overall Assessment, Bugs and Issues, Security Concerns, Performance, Best Practices, What is Good, Suggestions. Keep feedback specific and professional."

    user_prompt = "Language: " + request.language + "\nFocus: " + prompt_focus + "\n\nCode to review:\n" + request.code

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                GROQ_API_URL,
                headers={
                    "Authorization": "Bearer " + GROQ_API_KEY,
                    "Content-Type": "application/json",
                },
                json={
                    "model": "llama-3.1-8b-instant",
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                    "max_tokens": 1500,
                    "temperature": 0.3,
                },
            )
            response.raise_for_status()
            data = response.json()
            review_text = data["choices"][0]["message"]["content"]

            return CodeReviewResponse(
                review=review_text,
                language=request.language,
                focus=request.focus,
            )

    except httpx.TimeoutException:
        raise HTTPException(status_code=408, detail="Request timed out")
    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail="API error: " + str(e))


@app.get("/languages")
def get_languages():
    return {
        "languages": [
            "python", "javascript", "typescript", "java",
            "cpp", "go", "rust", "ruby", "php", "swift"
        ]
    }


@app.get("/focus-options")
def get_focus_options():
    return {
        "options": [
            {"value": "general", "label": "General Review"},
            {"value": "security", "label": "Security Audit"},
            {"value": "performance", "label": "Performance"},
            {"value": "beginner", "label": "Beginner Friendly"},
        ]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)