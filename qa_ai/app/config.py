# File cấu hình chung cho ứng dụng

import os
from dotenv import load_dotenv

# Load các biến môi trường từ file .env
load_dotenv()


class Settings:
    # SETTING
    DIR_ROOT = os.path.dirname(os.path.abspath(".env"))

    SECRET_KEY = os.getenv("SECRET_KEY")
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 30
    # API KEY
    API_KEY = os.environ["API_KEY"]

    KEY_API_GPT = os.environ["OPENAI_API_KEY"]

    LLM_NAME = os.environ["LLM_NAME"]

    OPENAI_LLM = os.environ["OPENAI_LLM"]


settings = Settings()
