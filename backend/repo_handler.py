from git import Repo
import os

class RepoHandler:
    def __init__(self, repo_url: str, repo_path: str):
        self.repo_url = repo_url
        self.repo_path = repo_path

    def clone_repository(self):
        if os.path.exists(self.repo_path):
            print(f"Repository already exists at {self.repo_path}")
        else:
            Repo.clone_from(self.repo_url, to_path=self.repo_path)
        