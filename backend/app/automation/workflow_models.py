from pydantic import BaseModel
from typing import List, Dict, Any


class WorkflowStep(BaseModel):
    id: str = ""

    service: str
    action: str

    inputs: Dict[str, Any] = {}
    outputs: Dict[str, Any] = {}

    parameters: Dict[str, Any] = {}


class WorkflowTrigger(BaseModel):
    type: str
    parameters: Dict[str, Any] = {}


class WorkflowPlan(BaseModel):
    name: str
    description: str

    trigger: WorkflowTrigger

    steps: List[WorkflowStep]


class WorkflowInput(BaseModel):
    source_step: str
    output_name: str


class WorkflowOutput(BaseModel):
    name: str