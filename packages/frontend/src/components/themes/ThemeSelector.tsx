import { WhisperTheme } from "@peaceflow/shared";

interface ThemeSelectorProps {
  selectedTheme: WhisperTheme | null;
  onThemeSelect: (theme: WhisperTheme | null) => void;
  className?: string;
}

// Import themes from shared package or define them here if not exported
const themes: WhisperTheme[] = [
  "Digital Wellness",
  "Eco-Mindfulness",
  "Gentle Productivity",
  "Authentic Connection",
  "Micro-Joy",
  "Resilience",
];

export const ThemeSelector = ({ selectedTheme, onThemeSelect, className = "" }: ThemeSelectorProps) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Filter by Theme
      </h3>
      <div className="flex flex-wrap gap-2">
        {/* All Themes option */}
        <button
          onClick={() => onThemeSelect(null)}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors
            ${!selectedTheme
              ? "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
        >
          All Themes
        </button>

        {/* Theme options */}
        {themes.map((theme) => (
          <button
            key={theme}
            onClick={() => onThemeSelect(theme)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors
              ${selectedTheme === theme
                ? "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
          >
            {theme}
          </button>
        ))}
      </div>
    </div>
  );
};
