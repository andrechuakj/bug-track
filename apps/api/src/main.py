from configuration.config import load_configurations
from configuration.db import configure_database
from configuration.logger import configure_logger
from configuration.openai import configure_openai
from configuration.startup_info import configure_startup_info
from controllers.auth_controller import router as auth_router
from controllers.dbms_controller import router as dbms_router
from controllers.discussion_controller import router as discussions_router
from controllers.public_auth_controller import router as public_auth_router
from controllers.user_controller import router as user_router
from controllers.bug_report_controller import router as bug_report_router
from domain.config import db_txn_manager_generator
from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from internal.errors import register_error_handler
from internal.middleware.middleware import register_custom_middleware
from internal.middleware.secured_endpoints import secured_endpoints_middleware

app = FastAPI(
    title="bug-analysis-api",
    lifespan=load_configurations(
        configure_logger,
        configure_startup_info,
        configure_database,
        configure_openai,
    ),
    dependencies=[
        Depends(db_txn_manager_generator),
    ],
)
register_error_handler(app)
register_custom_middleware(
    app,
    secured_endpoints_middleware,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(public_auth_router)
app.include_router(auth_router)
app.include_router(discussions_router)
app.include_router(user_router)
app.include_router(dbms_router)
app.include_router(bug_report_router)
