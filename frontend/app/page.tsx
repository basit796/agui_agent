import Link from "next/link";
import { Cloud, Sparkles, ChefHat, ListChecks, MessageCircle } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-950 dark:to-gray-900">
      <main className="max-w-5xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            ADK Agent + Assistant UI
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Example implementation of Google ADK agents with Assistant UI frontend.
            Built with Next.js, TypeScript, and Tailwind CSS.
          </p>
        </div>

        {/* Agent Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Weather Agent */}
          <Link href="/weather-agent">
            <div className="group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Cloud className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Weather Agent
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Get real-time weather information for any city with detailed metrics and conditions.
                  </p>
                  <div className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400">
                    Try it now
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Haiku Generator */}
          <Link href="/haiku-generator">
            <div className="group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-300 cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Haiku Generator
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Create beautiful Japanese haikus with English translations and complementary imagery.
                  </p>
                  <div className="flex items-center gap-2 text-sm font-medium text-purple-600 dark:text-purple-400">
                    Try it now
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Recipe Generator */}
          <Link href="/recipe-generator">
            <div className="group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:border-orange-300 dark:hover:border-orange-700 transition-all duration-300 cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ChefHat className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Recipe Generator
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Create and customize delicious recipes with ingredients, instructions, and cooking tips.
                  </p>
                  <div className="flex items-center gap-2 text-sm font-medium text-orange-600 dark:text-orange-400">
                    Try it now
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Task Planner */}
          <Link href="/task-planner">
            <div className="group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-300 cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ListChecks className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Task Planner
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Break down complex tasks into manageable steps with human-in-the-loop approval.
                  </p>
                  <div className="flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400">
                    Try it now
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Chat Agent */}
          <Link href="/chat-agent">
            <div className="group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:border-cyan-300 dark:hover:border-cyan-700 transition-all duration-300 cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Chat Agent
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Conversational assistant for general questions, brainstorming, and friendly chat.
                  </p>
                  <div className="flex items-center gap-2 text-sm font-medium text-cyan-600 dark:text-cyan-400">
                    Try it now
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Coming Soon Placeholder */}
          <div className="bg-gray-100 dark:bg-gray-800/50 rounded-2xl p-6 border-2 border-dashed border-gray-300 dark:border-gray-700">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-gray-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  More Agents
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Additional agent examples coming soon. Explore the existing agents to see ADK + Assistant UI in action!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">SSE Streaming</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Real-time response streaming from ADK backend</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">Tool UI Rendering</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Automatic UI generation for tool outputs</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">Assistant UI Integration</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Built on top of @assistant-ui/react</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">TypeScript + Tailwind</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Full type safety and modern styling</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
