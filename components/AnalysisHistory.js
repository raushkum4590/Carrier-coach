'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function AnalysisHistory({ isOpen, onClose }) {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen && user) {
      fetchHistory();
    }
  }, [isOpen, user]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/user/history', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalyses(data.analyses);
      } else {
        setError('Failed to load analysis history');
      }
    } catch (err) {
      setError('Error loading history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderAnalysisPreview = (analysis) => {
    if (typeof analysis === 'string') {
      return analysis.substring(0, 200) + '...';
    }
    
    return `Score: ${analysis.overallScore || 'N/A'} • ${analysis.strengths?.length || 0} strengths • ${analysis.weaknesses?.length || 0} areas to improve`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Analysis History
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex h-96">
          {/* Analysis List */}
          <div className="w-1/2 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-gray-500 dark:text-gray-400">Loading history...</p>
              </div>
            ) : error ? (
              <div className="p-6 text-center">
                <p className="text-red-500">{error}</p>
                <button
                  onClick={fetchHistory}
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : analyses.length === 0 ? (
              <div className="p-6 text-center">
                <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500 dark:text-gray-400">No analyses yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Upload and analyze a resume to see it here
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {analyses.map((analysis, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedAnalysis(analysis)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                      selectedAnalysis === analysis
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {analysis.fileName}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        analysis.analysisType === 'targeted'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                      }`}>
                        {analysis.analysisType === 'targeted' ? 'Job Match' : 'General'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      {formatDate(analysis.createdAt)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {renderAnalysisPreview(analysis.analysis)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Analysis Details */}
          <div className="w-1/2 overflow-y-auto">
            {selectedAnalysis ? (
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                    {selectedAnalysis.fileName}
                  </h3>
                  <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400">
                    <span>{formatDate(selectedAnalysis.createdAt)}</span>
                    <span>•</span>
                    <span className="capitalize">{selectedAnalysis.analysisType} Analysis</span>
                    {selectedAnalysis.fileSize && (
                      <>
                        <span>•</span>
                        <span>{(selectedAnalysis.fileSize / 1024).toFixed(1)} KB</span>
                      </>
                    )}
                  </div>
                </div>

                {selectedAnalysis.jobDescription && (
                  <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Job Description</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {selectedAnalysis.jobDescription.substring(0, 300)}...
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  {typeof selectedAnalysis.analysis === 'string' ? (
                    <div className="prose dark:prose-invert max-w-none">
                      <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                        {selectedAnalysis.analysis}
                      </pre>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedAnalysis.analysis.overallScore && (
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <h4 className="font-medium text-blue-800 dark:text-blue-200">Overall Score</h4>
                          <p className="text-2xl font-bold text-blue-600 dark:text-blue-300">
                            {selectedAnalysis.analysis.overallScore}
                          </p>
                        </div>
                      )}
                      
                      {selectedAnalysis.analysis.strengths && (
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Strengths</h4>
                          <ul className="space-y-1">
                            {selectedAnalysis.analysis.strengths.map((strength, idx) => (
                              <li key={idx} className="text-sm text-green-700 dark:text-green-300">
                                • {strength}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {selectedAnalysis.analysis.weaknesses && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Areas for Improvement</h4>
                          <ul className="space-y-1">
                            {selectedAnalysis.analysis.weaknesses.map((weakness, idx) => (
                              <li key={idx} className="text-sm text-red-700 dark:text-red-300">
                                • {weakness}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <p>Select an analysis to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
