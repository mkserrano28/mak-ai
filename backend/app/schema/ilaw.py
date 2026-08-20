from pydantic import BaseModel, Field
from typing import List


class LessonInformation(BaseModel):
    title: str = ""
    learning_area: str = ""
    teachers: List[str] = Field(default_factory=list)
    grade_level: str = ""
    section: str = ""
    sessions: int = 5


class Intentions(BaseModel):
    content_standard: str = ""
    performance_standard: str = ""
    learning_competencies: List[str] = Field(default_factory=list)
    specific_objectives: List[str] = Field(default_factory=list)
    learning_objectives: str = ""
    learner_context: str = ""


class FlowDaylong(BaseModel):
    activity: str = ""
    discussion: str = ""
    deduction: str = ""
    concepts: List[str] = Field(default_factory=list)


class LearningExperiences(BaseModel):
    learning_resources: str = ""
    pre_lesson: str = ""
    flow_daylong: FlowDaylong = Field(
        default_factory=FlowDaylong
    )
    opportunities_for_integration: str = ""


class Session(BaseModel):
    session_number: int
    topic: str = ""
    activities: str = ""
    assessment: str = ""


class Assessment(BaseModel):
    formative_assessment: str = ""
    guide_questions: List[str] = Field(default_factory=list)


class WaysForward(BaseModel):
    extended_learning: str = ""
    reflections: str = ""
    application: str = ""


class PreparedCheckedNoted(BaseModel):
    prepared_by: str = ""
    checked_by: str = ""
    noted_by: str = ""


class ILAWPlan(BaseModel):
    lesson_information: LessonInformation
    references: List[str] = Field(default_factory=list)
    declaration_of_ai_use: str = ""
    intentions: Intentions
    learning_experiences: LearningExperiences
    sessions: List[Session] = Field(default_factory=list)
    assessment: Assessment
    ways_forward: WaysForward
    prepared_checked_noted: PreparedCheckedNoted

class ILAWGenerateRequest(BaseModel):
    prompt: str
    grade_level: str = ""
    sessions: int = 5