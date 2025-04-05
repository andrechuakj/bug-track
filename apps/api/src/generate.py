import json
import os

from fastapi.openapi.utils import get_openapi
from main import app

FILE_NAME = "../openapi.json"

if __name__ == "__main__":
    current_path = os.path.dirname(os.path.abspath(__file__))
    filename = os.path.join(current_path, FILE_NAME)
    with open(filename, "w") as f:
        json.dump(
            get_openapi(
                title=app.title,
                version=app.version,
                openapi_version=app.openapi_version,
                description=app.description,
                routes=app.routes,
            ),
            f,
        )
