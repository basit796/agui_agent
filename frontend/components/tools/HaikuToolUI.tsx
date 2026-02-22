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
        <div className="my-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 animate-pulse" />
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
              Crafting haiku...
            </span>
          </div>
        </div>
      );
    }

    // Format arrays to string
    const japaneseText = Array.isArray(args.japanese) ? args.japanese.join('\n') : args.japanese || '';
    const englishText = Array.isArray(args.english) ? args.english.join('\n') : args.english || '';
    const images = Array.isArray(args.selectedImages) ? args.selectedImages : [];

    return (
      <div className="my-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 
                      border border-purple-200 dark:border-purple-800 rounded-xl p-6 shadow-lg">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-purple-200 dark:border-purple-700">
          <div className="p-2 rounded-lg bg-purple-500">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Generated Haiku
          </h3>
        </div>

        {/* Japanese Haiku */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🇯🇵</span>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Japanese</h4>
          </div>
          <div className="bg-white/80 dark:bg-gray-800 rounded-lg p-4 border border-purple-100 dark:border-purple-800">
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
          <div className="bg-white/80 dark:bg-gray-800 rounded-lg p-4 border border-purple-100 dark:border-purple-800">
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
                  className="px-3 py-1.5 bg-white/80 dark:bg-gray-800 
                           border border-purple-300 dark:border-purple-700 rounded-full text-xs
                           text-purple-700 dark:text-purple-300 font-medium"
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
