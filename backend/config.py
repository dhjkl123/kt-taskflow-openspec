import os
from dotenv import load_dotenv

# Load from .env.local if it exists, otherwise use environment variables
if os.path.exists(".env.local"):
    load_dotenv(".env.local")
else:
    load_dotenv(".env.production")

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///taskflow.db")
JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-key")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_HOURS = int(os.getenv("ACCESS_TOKEN_EXPIRE_HOURS", 24))
