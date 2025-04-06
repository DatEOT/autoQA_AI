from pydantic import BaseModel


class UserQuestionStats(BaseModel):
    idUser: int
    create_count: int
    total_questions: int

    class Config:
        from_attributes = True


class PeriodStats(BaseModel):
    day: int
    month: int
    year: int
    total: int


class GlobalStats(BaseModel):
    creation_stats: PeriodStats
    question_stats: PeriodStats

    class Config:
        from_attributes = True
