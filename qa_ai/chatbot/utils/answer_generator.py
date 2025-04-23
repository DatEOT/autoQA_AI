from chatbot.utils.custom_prompt import CustomPrompt
from langchain.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnableSequence


class AnswerGenerator:
    def __init__(self, llm) -> None:
        prompt = ChatPromptTemplate.from_messages(
            [
                ("system", CustomPrompt.GENERATE_ANSWER_PROMPT),
                ("human", "User question: {question}\n\nContext: {context}"),
            ]
        )

        # LLM pipeline: prompt -> llm -> output parser
        self.chain: RunnableSequence = prompt | llm | StrOutputParser()

    def get_chain(self) -> RunnableSequence:
        return self.chain
