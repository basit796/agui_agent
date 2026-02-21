from google.adk.agents import LlmAgent
from google.adk import tools as adk_tools

# Compatibility shim for PreloadMemoryTool (renamed in newer ADK versions)
try:
    PreloadMemoryTool = adk_tools.preload_memory.PreloadMemoryTool
except AttributeError:
    PreloadMemoryTool = adk_tools.preload_memory_tool.PreloadMemoryTool

# Create a sample ADK agent (this would be your actual agent)
agentic_chat_agent = LlmAgent(
    name="assistant",
    model="gemini-2.5-flash",
    instruction="""
    You are a helpful assistant. Help users by answering their questions and assisting with their needs.
    - If the user greets you, please greet them back with specifically with "Hello".
    - If the user greets you and does not make any request, greet them and ask "how can I assist you?"
    - If the user makes a statement without making a request, you do not need to tell them you can't do anything about it.
      Try to say something conversational about it in response, making sure to mention the topic directly.
    - If the user asks you a question, if possible you can answer it using previous context without telling them that you cannot look it up.
      Only tell the user that you cannot search if you do not have enough information already to answer.
    """,
    tools=[
      PreloadMemoryTool(),
    ]
)