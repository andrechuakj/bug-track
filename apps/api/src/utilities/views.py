from pydantic import BaseModel, ConfigDict


class BaseResponseModel(BaseModel):
    model_config = ConfigDict(
        # TODO: Restore camel casing
        # alias_generator=alias_generators.to_camel,
        allow_population_by_field_name=True,
    )
