/**
 * Haiku Generator Tool UI Component
 * Displays generated haikus with Japanese text, English translation, and selected images
 */

'use client';

import { makeAssistantToolUI } from '@assistant-ui/react';
import { Sparkles, Globe, Image as ImageIcon } from 'lucide-react';

interface HaikuArgs {
  japanese: string[];
  english: string[];
  selectedImages: string[];
  gradient?: string;
}

export const HaikuToolUI = makeAssistantToolUI<HaikuArgs, any>({
  toolName: 'generate_haiku',
  render: function HaikuDisplay({ args, status }) {
    // Loading state
    if (status.type === 'running' || !args) {
      return (
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4 mb-2">
          <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span className="text-sm font-medium">Crafting haiku...</span>
          </div>
        </div>
      );
    }

    // Format arrays to string
    const japaneseText = Array.isArray(args.japanese) ? args.japanese.join('\n') : args.japanese || '';
    const englishText = Array.isArray(args.english) ? args.english.join('\n') : args.english || '';
    const images = Array.isArray(args.selectedImages) ? args.selectedImages : [];
    const gradientStyle = args.gradient || 'linear-gradient(to bottom right, rgb(243 232 255), rgb(252 231 243))';

    return (
      <div 
        className="border border-purple-200 dark:border-purple-800 rounded-xl p-6 mb-2 shadow-lg"
        style={{ background: gradientStyle }}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-purple-200 dark:border-purple-800">
          <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Generated Haiku
          </h3>
        </div>

        {/* Japanese Haiku */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🇯🇵</span>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Japanese</h4>
          </div>
          <div className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-4 backdrop-blur-sm">
            <p className="text-xl font-serif text-gray-900 dark:text-gray-100 leading-relaxed whitespace-pre-line">
              {japaneseText}
            </p>
          </div>
        </div>

        {/* English Translation */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">English Translation</h4>
          </div>
          <div className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-4 backdrop-blur-sm">
            <p className="text-base italic text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
              {englishText}
            </p>
          </div>
        </div>

        {/* Selected Images */}
        {images.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ImageIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Complementary Images
              </h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="px-3 py-1.5 bg-white/60 dark:bg-gray-800/60 
                           border border-purple-300 dark:border-purple-700 rounded-full text-xs
                           text-purple-700 dark:text-purple-300 font-medium backdrop-blur-sm"
                >
                  {img.replace(/\.(jpg|jpeg|png)$/i, '').replace(/_/g, ' ')}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  },
});
