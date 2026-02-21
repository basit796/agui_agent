/**
 * Weather Tool UI Component
 * Displays weather information returned by the get_weather tool
 */

'use client';

import { makeAssistantToolUI } from '@assistant-ui/react';
import { Cloud, Droplets, Wind, Thermometer, CloudRain } from 'lucide-react';

interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windGust: number;
  conditions: string;
  location: string;
}

export const WeatherToolUI = makeAssistantToolUI<WeatherData, string>({
  toolName: 'get_weather',
  render: function WeatherDisplay({ result }) {
    if (!result) {
      return (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-2">
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
            <Cloud className="w-5 h-5 animate-pulse" />
            <span className="text-sm font-medium">Fetching weather data...</span>
          </div>
        </div>
      );
    }

    // Parse result if it's a string
    let weather: WeatherData;
    try {
      weather = typeof result === 'string' ? JSON.parse(result) : result;
    } catch {
      return (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-2">
          <p className="text-sm text-red-700 dark:text-red-300">Failed to parse weather data</p>
        </div>
      );
    }

    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 
                    border border-blue-200 dark:border-blue-800 rounded-xl p-5 mb-2 shadow-sm">
        {/* Location Header */}
        <div className="flex items-center gap-2 mb-4">
          <Cloud className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {weather.location}
          </h3>
        </div>

        {/* Main Temperature */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold text-gray-900 dark:text-gray-100">
              {Math.round(weather.temperature)}°
            </span>
            <span className="text-xl text-gray-600 dark:text-gray-400">C</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Feels like {Math.round(weather.feelsLike)}°C
          </p>
          <p className="text-base text-gray-700 dark:text-gray-300 mt-2 font-medium">
            {weather.conditions}
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
                {weather.humidity}%
              </p>
            </div>
          </div>

          {/* Wind Speed */}
          <div className="flex items-center gap-2">
            <Wind className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Wind Speed</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {Math.round(weather.windSpeed)} km/h
              </p>
            </div>
          </div>

          {/* Wind Gust */}
          <div className="flex items-center gap-2">
            <CloudRain className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Wind Gust</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {Math.round(weather.windGust)} km/h
              </p>
            </div>
          </div>

          {/* Temperature Icon */}
          <div className="flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Temperature</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {Math.round(weather.temperature)}°C
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  },
});
