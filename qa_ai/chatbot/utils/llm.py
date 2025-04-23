from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from app.config import settings  # config chứa API keys, model name


class LLM:
    """
    Lớp tiện ích để khởi tạo LLM theo cấu hình (OpenAI hoặc Gemini).
    """

    def __init__(
        self, temperature: float = 0.01, max_tokens: int = 4096, n_ctx: int = 4096
    ) -> None:
        self.temperature = temperature
        self.max_tokens = max_tokens
        self.n_ctx = n_ctx

    def open_ai(self):
        return ChatOpenAI(
            openai_api_key=settings.KEY_API_GPT,
            model=settings.OPENAI_LLM,  # vd: "gpt-4o"
            temperature=self.temperature,
        )

    def gemini(self):
        return ChatGoogleGenerativeAI(
            google_api_key=settings.KEY_API,
            model=settings.GOOGLE_LLM,  # vd: "gemini-pro"
            temperature=self.temperature,
        )

    def get_llm(self, llm_name: str):
        """
        Trả về đối tượng LLM tương ứng theo tên: "openai" hoặc "gemini".
        """
        if llm_name == "openai":
            return self.open_ai()
        elif llm_name == "gemini":
            return self.gemini()
        else:
            return self.open_ai()  # mặc định là OpenAI
