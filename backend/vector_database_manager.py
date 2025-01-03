import os
from langchain_community.vectorstores import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings

class VectorDatabaseManager:
    def __init__(self, persist_directory: str):
        self.persist_directory = persist_directory

    def initialize_db(self, documents):
        embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
        vector_db = Chroma.from_documents(documents, embedding=embeddings, persist_directory=self.persist_directory)
        vector_db.persist()
        return vector_db
