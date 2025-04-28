import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWhispersStore } from '../../stores/whispers';
import { useAuthStore } from '../../stores/auth';
import { WhisperTheme, CreateWhisperPayload } from '@peaceflow/shared';

interface ThemeDescription {
  theme: WhisperTheme;
  description: string;
  placeholder: string;
}

const themeDetails: ThemeDescription[] = [
  {
    theme: "Digital Wellness",
    description: "Share tips and insights about maintaining balance in the digital world",
    placeholder: "Example: Taking mindful breaks from screens helps me stay present and focused..."
  },
  {
    theme: "Eco-Mindfulness",
    description: "Share experiences and thoughts about environmental consciousness",
    placeholder: "Example: Finding peace in nature's simple moments reminds me to protect our planet..."
  },
  {
    theme: "Gentle Productivity",
    description: "Share kind approaches to getting things done without burnout",
    placeholder: "Example: Breaking tasks into small, manageable steps helps me stay calm..."
  },
  {
    theme: "Authentic Connection",
    description: "Share experiences about genuine human interactions",
    placeholder: "Example: A simple smile and hello to neighbors creates meaningful connections..."
  },
  {
    theme: "Micro-Joy",
    description: "Share small moments of happiness and gratitude",
    placeholder: "Example: The morning sunlight through my window brings unexpected joy..."
  },
  {
    theme: "Resilience",
    description: "Share experiences of overcoming challenges with grace",
    placeholder: "Example: Each setback teaches me something valuable about myself..."
  }
];

const WhisperSubmitPage: React.FC = () => {
  const navigate = useNavigate();
  const { submitWhisper, loading, error: submitError, clearError } = useWhispersStore();
  const { isAuthenticated, accessToken } = useAuthStore();
  const [text, setText] = useState('');
  const [theme, setTheme] = useState<WhisperTheme>(themeDetails[0].theme);
  const [formError, setFormError] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  
  // Load draft from localStorage
  useEffect(() => {
    const savedDraft = localStorage.getItem('whisperDraft');
    if (savedDraft) {
      const draft = JSON.parse(savedDraft);
      setText(draft.text || '');
      setTheme(draft.theme || themeDetails[0].theme);
    }
  }, []);

  // Autosave draft
  useEffect(() => {
    if (text || theme) {
      localStorage.setItem('whisperDraft', JSON.stringify({ text, theme }));
    }
  }, [text, theme]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError(); // Clear previous submission errors

    if (!text.trim()) {
      setFormError("Whisper text cannot be empty.");
      return;
    }
    if (text.length > 500) {
      setFormError("Whisper text cannot exceed 500 characters.");
      return;
    }
    if (!isAuthenticated || !accessToken) {
      navigate('/login'); // Redirect to login
      return;
    }

    const payload: CreateWhisperPayload = { text, theme };

    try {
      const newWhisper = await submitWhisper(payload);
      clearDraft(); // Clear the draft after successful submission
      navigate(`/whispers/${newWhisper.id}`); // Redirect to the new whisper's detail page
    } catch (err) {
      setFormError(submitError || "An unexpected error occurred.");
    }
  };

  const clearDraft = () => {
    localStorage.removeItem('whisperDraft');
    setText('');
    setTheme(themeDetails[0].theme);
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Share Your Whisper</h1>
      <p className="text-gray-600 mb-6 text-center">
        Share your thoughts and experiences to inspire and uplift others.
      </p>
      {isPreview ? (
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-md p-6 mb-4">
            <p className="text-gray-800 text-lg mb-4">{text || "Your whisper will appear here..."}</p>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">{theme}</span>
            </div>
          </div>
          <button
            onClick={() => setIsPreview(false)}
            className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded transition-colors"
          >
            Back to Edit
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-2">
              Choose a Theme:
            </label>
            <select
              id="theme"
              value={theme}
              onChange={(e) => setTheme(e.target.value as WhisperTheme)}
              className="w-full p-3 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              {themeDetails.map(({ theme }) => (
                <option key={theme} value={theme}>{theme}</option>
              ))}
            </select>
            <p className="mt-2 text-sm text-gray-600">
              {themeDetails.find(t => t.theme === theme)?.description}
            </p>
          </div>

          <div>
            <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-2">
              Your Whisper:
            </label>
            <textarea
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={themeDetails.find(t => t.theme === theme)?.placeholder}
              rows={6}
              maxLength={500}
              className="w-full p-3 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
              required
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-sm text-gray-600">{text.length}/500 characters</p>
          {text.trim() && (
            <button
              type="button"
              onClick={clearDraft}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Clear Draft
            </button>
          )}
            </div>
          </div>

          {(formError || submitError) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">
                {formError || `Submission Error: ${submitError}`}
              </p>
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setIsPreview(true)}
              className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
            >
              Preview
            </button>
            <button
              type="submit"
              disabled={loading || !isAuthenticated}
              className={`flex-1 px-4 py-2 rounded-lg text-white font-semibold transition-colors ${
                loading || !isAuthenticated
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              {loading ? 'Submitting...' : 'Share Whisper'}
            </button>
          </div>

          {!isAuthenticated && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-600 text-sm">
                Please log in to share your whisper with the community.
              </p>
            </div>
          )}
        </form>
      )}
    </div>
  );
};

export default WhisperSubmitPage;
