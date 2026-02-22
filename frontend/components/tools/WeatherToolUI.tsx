/**
 * Weather Tool UI Component - FIXED
 * Properly integrated with Assistant UI's tool rendering system
 */

'use client';

import { makeAssistantToolUI } from '@assistant-ui/react';
import { Cloud, Droplets, Wind, Thermometer, CloudRain } from 'lucide-react';

interface WeatherArgs {
  location: string;
}

interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windGust: number;
  conditions: string;
  location: string;
}

// Main Weather Card Component
function WeatherCard({ data }: { data: WeatherData }) {
  return (
    <div className="my-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 
                    border border-blue-200 dark:border-blue-800 rounded-xl p-6 shadow-lg max-w-md">
      {/* Location Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-blue-500">
          <Cloud className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          {data.location}
        </h3>
      </div>

      {/* Main Temperature */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-bold text-gray-900 dark:text-gray-100">
            {Math.round(data.temperature)}°
          </span>
          <span className="text-xl text-gray-600 dark:text-gray-400">C</span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Feels like {Math.round(data.feelsLike)}°C
        </p>
        <p className="text-base text-gray-700 dark:text-gray-300 mt-2 font-medium">
          {data.conditions}
        </p>
      </div>

      {/* Weather Details Grid */}
      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-blue-200 dark:border-blue-800">
        {/* Humidity */}
        <div className="flex items-center gap-2">
          <Droplets className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Humidity</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {data.humidity}%
            </p>
          </div>
        </div>

        {/* Wind Speed */}
        <div className="flex items-center gap-2">
          <Wind className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Wind Speed</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {Math.round(data.windSpeed)} km/h
            </p>
          </div>
        </div>

        {/* Wind Gust */}
        <div className="flex items-center gap-2">
          <CloudRain className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Wind Gust</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {Math.round(data.windGust)} km/h
            </p>
          </div>
        </div>

        {/* Temperature Icon */}
        <div className="flex items-center gap-2">
          <Thermometer className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Temperature</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {Math.round(data.temperature)}°C
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export const WeatherToolUI = makeAssistantToolUI<WeatherArgs, WeatherData>({
  toolName: 'get_weather',
  render: function WeatherDisplay({ args, result, status }) {
    // Loading state while tool is being called
    if (status.type === 'running') {
      return (
        <div className="my-3 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4 max-w-md">
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-pulse" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Fetching weather for {args.location}...
            </span>
          </div>
        </div>
      );
    }

    // Show weather card when result is available
    if (!result) {
      return null;
    }

    // Parse result - it could be the object directly or wrapped
    let weather: WeatherData;
    try {
      // If result is already an object with the weather data, use it
      if (typeof result === 'object' && 'temperature' in result) {
        weather = result as WeatherData;
      } 
      // If it's a string, parse it
      else if (typeof result === 'string') {
        weather = JSON.parse(result);
      }
      // Otherwise, assume it's the correct format
      else {
        weather = result as WeatherData;
      }
    } catch (error) {
      console.error('Failed to parse weather data:', error, result);
      return (
        <div className="my-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 max-w-md">
          <p className="text-sm text-red-700 dark:text-red-300">Failed to parse weather data</p>
        </div>
      );
    }

    return <WeatherCard data={weather} />;
  },
});