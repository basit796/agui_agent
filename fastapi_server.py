
from fastapi import FastAPI
from ag_ui_adk import ADKAgent, add_adk_fastapi_endpoint
# Import ALL agents - tools will be provided by frontend
from adk_agent.shared_state_between_agent_and_ui.agent import shared_state_agent
from adk_agent.backend_tool_rendering.agent import weather_agent
from adk_agent.agentic_chat.agent import agentic_chat_agent
from adk_agent.tool_based_generative_ui.agent import haiku_generator_agent
from adk_agent.human_in_loop.agent import human_in_loop_agent
from dotenv import load_dotenv
load_dotenv()


# Create FastAPI app
app = FastAPI(title="ADK Agent - All Agents Running")

# Create ALL agent instances
weather_agent_instance = ADKAgent(
    adk_agent=weather_agent,
    app_name="demo_app",
    user_id="demo_user",
    session_timeout_seconds=3600,
    use_in_memory_services=True,
)

shared_state_agent_instance = ADKAgent(
    adk_agent=shared_state_agent,
    app_name="demo_app",
    user_id="demo_user",
    session_timeout_seconds=3600,
    use_in_memory_services=True
)

agentic_agent = ADKAgent(
    adk_agent=agentic_chat_agent,
    app_name="demo_app",
    user_id="demo_user",
    session_timeout_seconds=3600,
    use_in_memory_services=True
)

haiku_agent = ADKAgent(
    adk_agent=haiku_generator_agent,
    app_name="demo_app",
    user_id="demo_user",
    session_timeout_seconds=3600,
    use_in_memory_services=True
)

task_agent = ADKAgent(
    adk_agent=human_in_loop_agent,
    app_name="demo_app",
    user_id="demo_user",
    session_timeout_seconds=3600,
    use_in_memory_services=True
)

# Add ALL endpoints
add_adk_fastapi_endpoint(app, weather_agent_instance, path="/weather-agent")
add_adk_fastapi_endpoint(app, shared_state_agent_instance, path="/shared-state-agent")
add_adk_fastapi_endpoint(app, agentic_agent, path="/agentic-chat-agent")
add_adk_fastapi_endpoint(app, haiku_agent, path="/haiku-generator")
add_adk_fastapi_endpoint(app, task_agent, path="/human-in-loop-agent")

@app.get("/")
async def root():
    return {
        "message": "ADK Agents - All 5 agents running!",
        "endpoints": [
            "/weather-agent", 
            "/shared-state-agent", 
            "/agentic-chat-agent",
            "/haiku-generator",
            "/human-in-loop-agent"
        ],
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
