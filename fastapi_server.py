
from fastapi import FastAPI
from ag_ui_adk import ADKAgent, add_adk_fastapi_endpoint
# Only import working agents
from adk_agent.shared_state_between_agent_and_ui.agent import shared_state_agent
from adk_agent.backend_tool_rendering.agent import weather_agent
from adk_agent.agentic_chat.agent import agentic_chat_agent
from dotenv import load_dotenv
load_dotenv()


# Create FastAPI app
app = FastAPI(title="ADK Agent - Working Agents Demo")

# Create agent instances (only the ones that work)
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

# Add working endpoints only
add_adk_fastapi_endpoint(app, weather_agent_instance, path="/weather-agent")
add_adk_fastapi_endpoint(app, shared_state_agent_instance, path="/shared-state-agent")
add_adk_fastapi_endpoint(app, agentic_agent, path="/agentic-chat-agent")

@app.get("/")
async def root():
    return {
        "message": "ADK Agents are running (3 working agents)!",
        "endpoints": ["/weather-agent", "/shared-state-agent", "/agentic-chat-agent"],
        "note": "haiku-generator and human-in-loop-agent disabled - missing tool implementations"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
