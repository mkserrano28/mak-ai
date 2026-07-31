from pydantic import BaseModel, Field
from typing import Dict, List, Any



class N8NNode(BaseModel):
    id: str
    name: str
    type: str
    position: List[int]
    parameters: Dict[str, Any]
    credentials: dict[str, Any] = Field(default_factory=dict)


class N8NWorkflow(BaseModel):
    name: str
    nodes: List[N8NNode]
    connections: Dict[str, Any]

    settings: Dict[str, Any] = Field(default_factory=dict)
    staticData: Dict[str, Any] = Field(default_factory=dict)
    pinData: Dict[str, Any] = Field(default_factory=dict)