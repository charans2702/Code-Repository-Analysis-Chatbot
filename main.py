from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from fastapi.responses import JSONResponse
import os
from dotenv import load_dotenv
from backend.repo_handler import RepoHandler
from backend.document_processor import DocumentProcessor
from backend.vector_database_manager import VectorDatabaseManager
from backend.chatbot_handler import ChatbotHandler

load_dotenv()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RepoRequest(BaseModel):
    repo_url: str

class ChatRequest(BaseModel):
    question: str

repo_handler = None
chatbot = None

@app.post("/initialize")
async def initialize_repo(request: RepoRequest):
    global repo_handler, chatbot
    try:
        repo_handler = RepoHandler(repo_url=request.repo_url, repo_path="test_repo/")
        repo_handler.clone_repository()
        
        doc_processor = DocumentProcessor(repo_path="test_repo/")
        documents = doc_processor.process_documents()
        
        vector_db_manager = VectorDatabaseManager(persist_directory="./data")
        vector_db = vector_db_manager.initialize_db(documents)
        
        chatbot = ChatbotHandler(vector_db)
        return {"status": "success", "message": "Repository initialized successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
async def chat(request: ChatRequest):
    if not chatbot:
        raise HTTPException(status_code=400, detail="Please initialize a repository first")
    try:
        answer = chatbot.get_response(request.question)
        return {"answer": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/status")
async def status():
    return {"initialized": chatbot is not None}