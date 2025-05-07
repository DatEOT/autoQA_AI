from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from app.config import settings  # config chứa API keys, model name
from app.utils.mysql_connection import get_plain_key


class LLM:
    """
    Lớp tiện ích để khởi tạo LLM theo cấu hình (OpenAI hoặc Gemini).
    """

    def __init__(
        self, temperature: float = 0.3, max_tokens: int = 4096, n_ctx: int = 4096
    ) -> None:
        self.temperature = temperature
        self.max_tokens = max_tokens
        self.n_ctx = n_ctx

    def _openai(self, model_variant: str):
        key = get_plain_key("openai", model_variant)
        return ChatOpenAI(
            openai_api_key=key,
            model=model_variant,
            temperature=self.temperature,
        )

    def _gemini(self, model_variant: str):
        key = get_plain_key("gemini", model_variant)
        return ChatGoogleGenerativeAI(
            google_api_key=key,
            model=model_variant,
            temperature=self.temperature,
            max_output_tokens=self.max_tokens,
        )

    def _grok(self, model_variant: str):
        key = get_plain_key("grok", model_variant)
        return ChatGoogleGenerativeAI(
            google_api_key=key,
            model=model_variant,
            temperature=self.temperature,
        )

    def get_llm(self, provider: str, model_variant: str):
        """
        Trả về đối tượng LLM tương ứng theo tên: "openai" hoặc "gemini".
        """

        match provider.lower():
            case "openai":
                return self._openai(model_variant)
            case "gemini":
                return self._gemini(model_variant)
            case "grok":
                return self._grok(model_variant)
            case _:
                raise ValueError(f"Unsupported provider '{provider}'")
