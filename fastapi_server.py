
from fastapi import FastAPI
from google.adk.apps import App, ResumabilityConfig
from ag_ui_adk import ADKAgent, add_adk_fastapi_endpoint
from adk_agent.tool_based_generative_ui.agent import haiku_generator_agent
from adk_agent.shared_state_between_agent_and_ui.agent import shared_state_agent
from adk_agent.human_in_loop.agent import human_in_loop_agent
from adk_agent.backend_tool_rendering.agent import sample_agent
from adk_agent.agentic_chat.agent import agentic_chat_agent
from dotenv import load_dotenv
load_dotenv()


# Create FastAPI app
app = FastAPI(title="ADK Middleware Tool Based Generative UI")

# Create ADK middleware agent instance
adk_agent_haiku_generator = ADKAgent(
    adk_agent=haiku_generator_agent,
    app_name="demo_app",
    user_id="demo_user",
    session_timeout_seconds=3600,
    use_in_memory_services=True
)

adk_shared_state_agent = ADKAgent(
    adk_agent=shared_state_agent,
    app_name="demo_app",
    user_id="demo_user",
    session_timeout_seconds=3600,
    use_in_memory_services=True
)

adk_app = App(
    name="demo_app",
    root_agent=human_in_loop_agent,
    resumability_config=ResumabilityConfig(is_resumable=True),
)

# Create ADK middleware agent instance using from_app()
adk_human_in_loop_agent = ADKAgent.from_app(
    adk_app,
    user_id="demo_user",
    session_timeout_seconds=3600,
    use_in_memory_services=True,
)

chat_agent = ADKAgent(
    adk_agent=sample_agent,
    app_name="demo_app",
    user_id="demo_user",
    session_timeout_seconds=3600,
    use_in_memory_services=True,
)

chat_agent = ADKAgent(
    adk_agent=agentic_chat_agent,
    app_name="demo_app",
    user_id="demo_user",
    session_timeout_seconds=3600,
    use_in_memory_services=True
)

# Add the ADK endpoint
add_adk_fastapi_endpoint(app, chat_agent, path="/agentic-chat-agent")

add_adk_fastapi_endpoint(app, chat_agent, path="/sample-agent")

add_adk_fastapi_endpoint(app, adk_human_in_loop_agent, path="/human-in-loop-agent")

add_adk_fastapi_endpoint(app, adk_shared_state_agent, path="/shared-state-agent")

add_adk_fastapi_endpoint(app, adk_agent_haiku_generator, path="/haiku-generator")

@app.get("/")
async def root():
    return {
        "message": "ADK Middleware is running with HITL support!",
        "endpoints": ["/training-agent"],
        "hitl_enabled": True
    }

