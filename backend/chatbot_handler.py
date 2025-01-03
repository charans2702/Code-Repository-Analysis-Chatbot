from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.memory import ConversationSummaryMemory
from langchain.chains import ConversationalRetrievalChain

class ChatbotHandler:
    def __init__(self, vector_db):
        self.llm = ChatGoogleGenerativeAI(model="gemini-1.5-pro")
        self.memory = ConversationSummaryMemory(llm=self.llm, memory_key="chat_history", return_messages=True)
        self.vector_db = vector_db

    def get_response(self, question: str):
        qa_chain = ConversationalRetrievalChain.from_llm(
            llm=self.llm,
            retriever=self.vector_db.as_retriever(search_type="mmr", search_kwargs={"k": 8}),
            memory=self.memory
        )
        return qa_chain(question)["answer"]
