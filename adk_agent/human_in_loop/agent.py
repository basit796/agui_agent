from __future__ import annotations
from json import tool
from google.adk.agents import Agent
from google.genai import types
from google.adk.agents.callback_context import CallbackContext
from google.adk.models import LlmResponse
from typing import Optional
import logging
import json

logger = logging.getLogger(__name__)

# Tool function that will be called when LLM wants to generate task steps
# def generate_task_steps(steps: list) -> dict:
#     """
#     Generate task steps for user approval.
#     This function receives steps from the LLM and returns them to the frontend for user interaction.
    
#     Args:
#         steps: List of step objects with 'description' and 'status' fields
        
#     Returns:
#         dict with formatted steps
#     """
#     logger.info(f"🛠️ generate_task_steps called with {len(steps)} steps")
    
#     # Format and validate steps
#     formatted_steps = []
#     for i, step in enumerate(steps):
#         if isinstance(step, dict):
#             formatted_steps.append({
#                 "description": step.get("description", f"Step {i+1}"),
#                 "status": step.get("status", "enabled")
#             })
#         elif isinstance(step, str):
#             # If LLM just sends strings, wrap them
#             formatted_steps.append({
#                 "description": step,
#                 "status": "enabled"
#             })
    
#     result = {"steps": formatted_steps}
#     logger.info(f"✅ Returning {len(formatted_steps)} formatted steps")
#     return result

# Callbacks for debugging and monitoring
def after_model_callback(
    callback_context: CallbackContext, llm_response: LlmResponse
) -> Optional[LlmResponse]:
    """Inspects the LLM response after it's received."""
    agent_name = callback_context.agent_name
    logger.info(f"[Callback] After model call for agent: {agent_name}")
    
    # Log tool calls made by LLM
    if llm_response and llm_response.content:
        for part in llm_response.content.parts:
            if hasattr(part, 'function_call') and part.function_call:
                logger.info(f"🔧 LLM called function: {part.function_call.name}")
                logger.info(f"   Args: {part.function_call.args}")
    return None

def after_tool_callback(
    callback_context: CallbackContext, tool_response: dict
) -> Optional[dict]:
    """Inspects the tool response after it's received."""
    agent_name = callback_context.agent_name
    logger.info(f"[Callback] After tool call for agent: {agent_name}")
    logger.info(f"🛠️ Tool response: {tool_response}")
    return None

def before_tool_callback(
    callback_context: CallbackContext,
    tool: dict,
    args: dict  # Add this parameter
) -> Optional[dict]:
    """Inspects the tool arguments before the tool is called."""
    tool_name = tool.get("name", "unknown_tool") if isinstance(tool, dict) else "unknown_tool"
    agent_name = callback_context.agent_name
    logger.info(f"[Callback] Before tool call for agent: {agent_name}")
    logger.info(f"🛠️ Calling tool: {tool_name} with args: {args}")
    return None

human_in_loop_agent = Agent(
    model='gemini-2.5-flash',
    name='human_in_loop_agent',
    instruction="""
You are a human-in-the-loop task planning assistant that helps break down complex tasks into manageable steps with human oversight and approval.

**Your Primary Role:**
- Generate clear, actionable task steps for any user request
- Facilitate human review and modification of generated steps  
- Execute only human-approved steps
- IMPORTANT: The generate_task_steps tool is used to show an interactive checklist to the user

**When a user requests a task:**
1. DO NOT greet or chat - immediately call the `generate_task_steps` tool to create a step breakdown
2. Use the number of steps the user requests, or default to 10 if not specified
3. Each step must be:
   - Written in imperative form (e.g., "Open file", "Check settings", "Send email")
   - Concise (2-4 words maximum)
   - Actionable and specific
   - Logically ordered from start to finish
4. Set all steps to "enabled" status initially

**After calling the tool:**
- The tool will return the user's modified steps (some may be disabled)
- Wait for the user's response which will tell you which steps they approved
- The response will say something like "User approved 5 steps: 1. Step name, 2. Step name..."

**When executing steps:**
- ONLY execute steps that were approved by the user
- For each approved step, tell the user what you are doing
- Pretend you are executing the step and refer to it in the current tense
- End each step with an ellipsis
- Put each step on a NEW LINE

Example execution:
```
Inhaling deeply...
Exhaling forcefully...
Producing sound...
```

NOT like this: `Inhaling deeply... Exhaling forcefully... Producing sound...`

- After executing all steps, confirm completion: "I have completed the plan and [achieved the goal]"

**Key Guidelines:**
- Always call generate_task_steps for task requests
- Make steps granular enough to be independently enabled/disabled
- Only execute approved steps
- Present execution clearly line-by-line
    """,
    generate_content_config=types.GenerateContentConfig(
        temperature=0.7,
        top_p=0.9,
        top_k=40
    ),
    tools=[],  # ← ADD THE TOOL HERE
    after_model_callback=after_model_callback,
    after_tool_callback=after_tool_callback,
    before_tool_callback=before_tool_callback
)