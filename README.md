# AGUI Agent

A comprehensive framework that bridges **Google ADK (Agent Development Kit)** with **Assistant UI**, enabling seamless integration of agentic AI capabilities with modern React frontends.

## 🎯 What This Project Does

This project demonstrates how to:

1. **Convert ADK Events to Assistant UI Format** - Transform Google ADK's streaming events (`phase`, `token`, `tool-call`, `tool-result`, etc.) into events compatible with Assistant UI's runtime
2. **Build Multi-Agent Systems** - Implement multiple specialized agents (weather, task planning, haiku generation, etc.) with a unified interface
3. **Enable Tool-Based Generative UI** - Render dynamic UI components based on tool calls and results from agents
4. **Implement Human-in-the-Loop Patterns** - Create interactive workflows where agents request user input during execution
5. **Share State Between Backend & Frontend** - Synchronize agent state with UI components in real-time

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Assistant UI (React Components)              │  │
│  │  - Thread/Message/Composer Components                │  │
│  │  - Custom Tool UI Renderers                          │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │      ADK Runtime Provider (Event Adapter)            │  │
│  │  - Converts SSE streams to Assistant UI messages     │  │
│  │  - Handles tool-call/tool-result mapping            │  │
│  │  - Manages streaming state                           │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/SSE
┌─────────────────────────────────────────────────────────────┐
│                  Backend (FastAPI + ADK)                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              ADK Agents (Python)                      │  │
│  │  - LlmAgent instances with tools                     │  │
│  │  - Tool execution & memory management                │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          SSE Streaming Endpoints                      │  │
│  │  - /adk/stream/{agent_name}                          │  │
│  │  - Emit: phase, token, tool-call, tool-result, done  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 🔑 Key Concepts

### Event Stream Conversion

Google ADK emits Server-Sent Events (SSE) in this format:
```
event: phase
data: {"phase":"understanding","label":"Analyzing..."}

event: tool-call
data: {"toolCallId":"xyz","toolName":"get_weather","args":{"location":"NYC"}}

event: tool-result
data: {"toolCallId":"xyz","result":{"temp":72,"conditions":"Sunny"}}

event: token
data: {"text":"The weather in "}
```

The **ADK Runtime Provider** converts these to Assistant UI's message format:
```typescript
{
  id: "unique-msg-id",
  role: "assistant",
  content: [
    { type: "tool-call", toolCallId: "xyz", toolName: "get_weather", args: {...} },
    { type: "tool-result", toolCallId: "xyz", result: {...} },
    { type: "text", text: "The weather in NYC is..." }
  ]
}
```

### Tool-Based UI Rendering

When a tool is called, custom UI components can render based on the tool name:

```typescript
// Frontend detects tool-call event
if (toolName === "get_weather") {
  // Render WeatherCard component with result data
  return <WeatherCard data={toolResult} />
}
```

This enables **generative UI** where the agent's tool usage dynamically creates rich UI components.

### Human-in-the-Loop Pattern

Agents can request user input mid-execution:

1. **Backend**: Agent calls `generate_task_steps` tool with parameters
2. **Frontend**: Detects tool-call, renders interactive UI (checkboxes, forms, etc.)
3. **User**: Selects options and submits
4. **Frontend**: Sends tool-result back to backend
5. **Backend**: Agent continues with user's input

## 📦 Project Structure

```
agui_agent/
├── adk_agent/                    # Backend agents
│   ├── backend_tool_rendering/   # Weather agent (tool UI rendering)
│   ├── human_in_loop/            # Task planner (interactive forms)
│   ├── tool_based_generative_ui/ # Haiku generator (dynamic UI)
│   ├── shared_state_between_agent_and_ui/  # State sync example
│   └── agentic_chat/             # Basic chat agent
├── frontend/
│   ├── app/                      # Next.js pages
│   │   ├── weather/              # Weather agent UI
│   │   ├── task-planner/         # Task planner UI
│   │   ├── haiku-generator/      # Haiku generator UI
│   │   └── ...
│   ├── components/
│   │   ├── ui/                   # Shadcn UI components
│   │   └── assistant-ui/         # Assistant UI wrappers
│   ├── lib/
│   │   ├── AdkRuntimeProvider.tsx   # Core: ADK→Assistant UI adapter
│   │   └── useADKStream.ts          # Stream handling hook
│   └── ...
└── fastapi_server.py             # Backend server with all agents
```

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- Google Cloud Project with Vertex AI API enabled (or Gemini API key)

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd agui_agent
   ```

2. **Create virtual environment**
   ```bash
   python -m venv .venv
   .venv\Scripts\activate  # Windows
   # or
   source .venv/bin/activate  # Linux/Mac
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env`:
   ```env
   GOOGLE_CLOUD_PROJECT=your-project-id
   GOOGLE_CLOUD_LOCATION=us-central1
   GOOGLE_GENAI_USE_VERTEXAI=1
   ```

   > **Note**: You can use either Vertex AI or Gemini API. For Gemini API, set `GOOGLE_GENAI_API_KEY` instead.

5. **Start the backend server**
   ```bash
   python fastapi_server.py
   ```
   
   Backend runs on `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   
   Frontend runs on `http://localhost:3000`

## 🎨 Example Agents

### 1. Weather Agent (Backend Tool Rendering)
**Path**: `/weather`

Demonstrates:
- Tool calling (`get_weather`)
- Custom UI card rendering from tool results
- Real-time weather data display

### 2. Task Planner (Human-in-the-Loop)
**Path**: `/task-planner`

Demonstrates:
- Interactive multi-select forms
- User input during agent execution
- Checkbox state management

### 3. Haiku Generator (Tool-Based Generative UI)
**Path**: `/haiku-generator`

Demonstrates:
- Dynamic UI generation from tool outputs
- Themed poetry display
- Custom component rendering

### 4. Shared State Agent
**Path**: `/shared-state`

Demonstrates:
- Real-time state synchronization
- Backend-frontend state sharing
- Interactive state updates

### 5. Agentic Chat
**Path**: `/agentic-chat`

Demonstrates:
- Basic conversational agent
- Memory and context management
- Multi-turn conversations

## 🔧 Key Files Explained

### Backend

**`fastapi_server.py`**
- Initializes all ADK agents
- Mounts streaming endpoints at `/adk/stream/{agent_name}`
- Handles CORS for frontend communication

**`adk_agent/{agent}/agent.py`**
- Defines `LlmAgent` with tools and instructions
- Implements tool functions
- Configures agent behavior

### Frontend

**`lib/AdkRuntimeProvider.tsx`**
- **Core adapter** that converts ADK SSE events to Assistant UI messages
- Manages streaming state
- Handles tool-call/tool-result correlation
- Provides `useRuntime()` hook to components

**`lib/useADKStream.ts`**
- Custom hook for initiating ADK streams
- Manages SSE connection lifecycle
- Emits events to `AdkRuntimeProvider`

**`app/{agent}/page.tsx`**
- Agent-specific UI page
- Wraps `Thread` component from Assistant UI
- Implements custom tool UI renderers

## 🛠️ How to Add a New Agent

### 1. Create Backend Agent

```python
# adk_agent/my_agent/agent.py
from google.adk.agents import LlmAgent

async def my_tool(param: str) -> dict:
    # Tool implementation
    return {"result": "data"}

my_agent = LlmAgent(
    model="gemini-2.5-flash",
    system_instruction="You are a helpful assistant...",
    tools=[my_tool]
)
```

### 2. Register in FastAPI

```python
# fastapi_server.py
from adk_agent.my_agent.agent import my_agent

my_agent_instance = ADKAgent(
    adk_agent=my_agent,
    app_name="demo_app",
    user_id="demo_user",
    session_timeout_seconds=3600,
    use_in_memory_services=True,
)

add_adk_fastapi_endpoint(
    app=app,
    adk_agent=my_agent_instance,
    endpoint="/adk/stream/my_agent",
    path_name="my_agent_stream",
)
```

### 3. Create Frontend Page

```typescript
// app/my-agent/page.tsx
import { AdkRuntimeProvider } from "@/lib/AdkRuntimeProvider";
import { Thread } from "@assistant-ui/react";

export default function MyAgentPage() {
  return (
    <AdkRuntimeProvider agentName="my_agent">
      <Thread />
    </AdkRuntimeProvider>
  );
}
```

### 4. (Optional) Add Custom Tool UI

```typescript
// In AdkRuntimeProvider.tsx, add to makeAssistantToolUI:

if (toolName === "my_tool") {
  return {
    type: "ui",
    display: <MyCustomToolUI result={result} />
  };
}
```

## 📚 Technologies Used

### Backend
- **Google ADK** - Agent Development Kit for building AI agents
- **FastAPI** - Modern Python web framework
- **Uvicorn** - ASGI server
- **SSE-Starlette** - Server-Sent Events support
- **httpx** - Async HTTP client

### Frontend
- **Next.js 16** - React framework
- **Assistant UI** - React components for chat interfaces
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn UI** - Component library
- **Zustand** - State management
- **TypeScript** - Type-safe JavaScript

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Google ADK team for the Agent Development Kit
- Assistant UI team for the excellent React components
- Open-Meteo for free weather API

## 📞 Support

For issues, questions, or contributions, please open an issue on GitHub.

---

**Built with ❤️ to demonstrate seamless integration between Google ADK and modern React UIs**
