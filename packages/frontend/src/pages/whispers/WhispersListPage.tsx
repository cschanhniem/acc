import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useWhispersStore } from '../../stores/whispers';
import { useAuthStore } from '../../stores/auth';
import ReportModal from '../../components/whispers/ReportModal';
import { ThemeSelector } from '../../components/themes/ThemeSelector';
import { Pagination } from '../../components/common/Pagination';

const WhispersListPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    whispers, 
    loading, 
    error, 
    loadWhispers, 
    likeWhisper, 
    selectedTheme, 
    setTheme,
    cursor,
    currentPage,
    itemsPerPage 
  } = useWhispersStore();
  const { isAuthenticated, accessToken } = useAuthStore();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportingWhisperId, setReportingWhisperId] = useState<string | null>(null);

  useEffect(() => {
    loadWhispers(); // Load initial whispers on mount
  }, [loadWhispers]);

  const handleLike = async (id: string) => {
    if (!isAuthenticated || !accessToken) {
      navigate('/login'); // Redirect to login
      return;
    }
    try {
      const result = await likeWhisper(id);
      console.log(`Whisper ${id} ${result.liked ? 'liked' : 'unliked'}. New count: ${result.likes}`); // Placeholder notification
    } catch (err) {
      console.error("Failed to like whisper:", err);
      // TODO: Add error notification
    }
  };

  const handleReport = async (id: string) => {
    if (!isAuthenticated || !accessToken) {
      navigate('/login'); // Redirect to login
      return;
    }
    setReportingWhisperId(id);
    setIsReportModalOpen(true);
  };

  const handleReportSuccess = () => {
    console.log("Report submitted successfully for whisper:", reportingWhisperId); // Placeholder notification
  };

  const handleCloseReportModal = () => {
    setIsReportModalOpen(false);
    setReportingWhisperId(null);
  };

  const handleNextPage = () => {
    if (cursor) {
      loadWhispers({ 
        cursor, 
        theme: selectedTheme || undefined,
        limit: itemsPerPage 
      });
    }
  };

  const handlePrevPage = () => {
    loadWhispers({ 
      theme: selectedTheme || undefined,
      limit: itemsPerPage 
    });
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-center mt-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Loading whispers...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="mt-8 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p className="text-center text-red-600 dark:text-red-400">
            Unable to load whispers. Please try again later.
            <span className="block mt-1 text-sm opacity-75">{error}</span>
          </p>
        </div>
      );
    }

    if (whispers.length === 0) {
      return (
        <div className="text-center mt-8">
          <p className="text-gray-600 dark:text-gray-300">No whispers found.</p>
          {selectedTheme && (
            <button
              onClick={() => setTheme(null)}
              className="mt-2 text-primary-500 hover:text-primary-600"
            >
              Clear theme filter
            </button>
          )}
        </div>
      );
    }

    return (
      <>
        <div className="space-y-4">
          {whispers.map((whisper) => (
            <div key={whisper.id} className="border p-4 rounded shadow hover:shadow-md transition-shadow">
              <Link to={`/whispers/${whisper.id}`} className="block mb-2 hover:text-blue-600">
                <p>{whisper.text}</p>
              </Link>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span>By: {whisper.authorName || 'Anonymous'}</span> |
                <span> Theme: {whisper.theme}</span> |
                <span> Views: {whisper.viewCount || 0}</span> |
                <span> Likes: {whisper.likes || 0}</span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleLike(whisper.id)}
                  disabled={!isAuthenticated}
                  className={`px-3 py-1 rounded text-white ${isAuthenticated ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400 cursor-not-allowed'}`}
                >
                  Like ({whisper.likes || 0})
                </button>
                <button
                  onClick={() => handleReport(whisper.id)}
                  disabled={!isAuthenticated}
                  className={`px-3 py-1 rounded text-white ${isAuthenticated ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-400 cursor-not-allowed'}`}
                >
                  Report
                </button>
                <Link to={`/whispers/${whisper.id}`} className="text-blue-500 hover:underline text-sm ml-auto">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>

        {whispers.length > 0 && (
          <Pagination
            currentPage={currentPage}
            hasNextPage={!!cursor}
            onNextPage={handleNextPage}
            onPrevPage={handlePrevPage}
            isLoading={loading}
            className="mt-6"
          />
        )}
      </>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Whispers</h1>
          <Link
            to="/whispers/new"
            className={`px-4 py-2 rounded-lg text-white font-semibold transition-colors ${
              isAuthenticated 
                ? 'bg-green-500 hover:bg-green-600' 
                : 'bg-gray-400 cursor-not-allowed'
            }`}
            onClick={(e) => {
              if (!isAuthenticated) {
                e.preventDefault();
                navigate('/login');
              }
            }}
          >
            Create Whisper
          </Link>
        </div>
        
        <ThemeSelector
          selectedTheme={selectedTheme}
          onThemeSelect={setTheme}
          className="mb-6"
        />

        {renderContent()}
      </div>

      <ReportModal
        whisperId={reportingWhisperId}
        isOpen={isReportModalOpen}
        onClose={handleCloseReportModal}
        onSubmitSuccess={handleReportSuccess}
      />
    </div>
  );
};

export default WhispersListPage;
