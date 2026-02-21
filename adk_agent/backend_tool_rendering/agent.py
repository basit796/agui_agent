from __future__ import annotations
from google.adk.agents import LlmAgent
from google.adk import tools as adk_tools
import httpx

# Compatibility shim for PreloadMemoryTool (renamed in newer ADK versions)
try:
    PreloadMemoryTool = adk_tools.preload_memory.PreloadMemoryTool
except AttributeError:
    PreloadMemoryTool = adk_tools.preload_memory_tool.PreloadMemoryTool

def get_weather_condition(code: int) -> str:
    conditions = {
        0: "Clear sky",
        1: "Mainly clear",
        2: "Partly cloudy",
        3: "Overcast",
        45: "Foggy",
        48: "Depositing rime fog",
        51: "Light drizzle",
        53: "Moderate drizzle",
        55: "Dense drizzle",
        56: "Light freezing drizzle",
        57: "Dense freezing drizzle",
        61: "Slight rain",
        63: "Moderate rain",
        65: "Heavy rain",
        66: "Light freezing rain",
        67: "Heavy freezing rain",
        71: "Slight snow fall",
        73: "Moderate snow fall",
        75: "Heavy snow fall",
        77: "Snow grains",
        80: "Slight rain showers",
        81: "Moderate rain showers",
        82: "Violent rain showers",
        85: "Slight snow showers",
        86: "Heavy snow showers",
        95: "Thunderstorm",
        96: "Thunderstorm with slight hail",
        99: "Thunderstorm with heavy hail",
    }
    return conditions.get(code, "Unknown")

async def get_weather(location: str) -> dict[str, str | float]:
    async with httpx.AsyncClient() as client:
        geocoding_url = (
            f"https://geocoding-api.open-meteo.com/v1/search?name={location}&count=1"
        )
        geocoding_response = await client.get(geocoding_url)
        geocoding_data = geocoding_response.json()

        if not geocoding_data.get("results"):
            raise ValueError(f"Location '{location}' not found")

        result = geocoding_data["results"][0]
        latitude = result["latitude"]
        longitude = result["longitude"]
        name = result["name"]

        weather_url = (
            f"https://api.open-meteo.com/v1/forecast?"
            f"latitude={latitude}&longitude={longitude}"
            f"&current=temperature_2m,apparent_temperature,relative_humidity_2m,"
            f"wind_speed_10m,wind_gusts_10m,weather_code"
        )
        weather_response = await client.get(weather_url)
        weather_data = weather_response.json()

        current = weather_data["current"]

        return {
            "temperature": current["temperature_2m"],
            "feelsLike": current["apparent_temperature"],
            "humidity": current["relative_humidity_2m"],
            "windSpeed": current["wind_speed_10m"],
            "windGust": current["wind_gusts_10m"],
            "conditions": get_weather_condition(current["weather_code"]),
            "location": name,
        }

weather_agent = LlmAgent(
    name="assistant",
    model="gemini-2.5-flash",
    instruction="""
    You are a weather assistant with the get_weather tool. When users ask about weather,
    Ask User for a location,
    ALWAYS call get_weather(location) to fetch real-time data. Do NOT refuse or say you cannot provide weather
    you MUST use the tool.""",
    tools=[
        PreloadMemoryTool(),
        get_weather,
    ],
)
