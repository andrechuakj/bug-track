from configuration.config import load_configurations
from configuration.logger import configure_logger
from configuration.startup_info import configure_startup_info
from controllers.user_controller import router as user_router
from controllers.dbms_controller import router as dbms_router
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from internal.errors import register_error_handler

app = FastAPI(
    title='bug-analysis-api',
    lifespan=load_configurations(
        configure_logger,
        configure_startup_info,
    ))
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

register_error_handler(app)
app.include_router(user_router)
app.include_router(dbms_router)
