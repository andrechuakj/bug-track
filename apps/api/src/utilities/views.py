from pydantic import BaseModel, ConfigDict

def to_camel(string: str) -> str:
    parts = string.split('_')
    return parts[0] + "".join(word.capitalize() for word in parts[1:])

class BaseResponseModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        allow_population_by_field_name=True,
    )
