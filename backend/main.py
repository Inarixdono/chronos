import logging

from fastapi import FastAPI

from database import Base, engine
from routers import agent as agent_router
from routers import jobs as jobs_router
from ws import agent as ws_agent

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Chronos Print Backend")

app.include_router(agent_router.router)
app.include_router(jobs_router.router)
app.include_router(ws_agent.router)
