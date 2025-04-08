from enum import Enum

class PriorityLevel(str, Enum):
    Low = "Low"
    Medium = "Medium"
    High = "High"
    Unassigned = "Unassigned"
