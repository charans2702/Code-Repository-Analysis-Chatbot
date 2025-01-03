from langchain_community.document_loaders.generic import GenericLoader
from langchain_community.document_loaders.parsers.language.language_parser import LanguageParser

from langchain.text_splitter import RecursiveCharacterTextSplitter, Language

class DocumentProcessor:
    def __init__(self, repo_path: str):
        self.repo_path = repo_path

    def process_documents(self):
        loader = GenericLoader.from_filesystem(
            self.repo_path,
            glob="**/*",
            suffixes=[".py", ".html", ".css"],
            parser=LanguageParser(language=Language.PYTHON, parser_threshold=500)
        )
        docs = loader.load()
        splitter = RecursiveCharacterTextSplitter.from_language(
            language=Language.PYTHON, chunk_size=500, chunk_overlap=20
        )
        return splitter.split_documents(docs)
