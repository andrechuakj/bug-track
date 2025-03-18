from pydantic import BaseModel, ConfigDict, alias_generators


class BaseResponseModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=alias_generators.to_camel,
        allow_population_by_field_name=True,
    )
