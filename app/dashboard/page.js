'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [userHistory, setUserHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('basic');
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'analysis', or 'upgrade'
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);
  
  // Analysis form state
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisType, setAnalysisType] = useState('general'); // 'general' or 'targeted'

  // Example job descriptions
  const exampleJobs = [
    {
      title: 'Software Engineer',
      description: `We are seeking a skilled Software Engineer to join our dynamic team. 

Requirements:
- Bachelor's degree in Computer Science or related field
- 3+ years of experience in software development
- Proficiency in JavaScript, Python, or Java
- Experience with React, Node.js, or similar frameworks
- Knowledge of databases (SQL/NoSQL)
- Understanding of version control systems (Git)
- Strong problem-solving and analytical skills
- Excellent communication and teamwork abilities

Responsibilities:
- Develop and maintain web applications
- Collaborate with cross-functional teams
- Write clean, maintainable code
- Participate in code reviews
- Debug and troubleshoot applications
- Stay updated with latest technologies`
    },
    {
      title: 'Marketing Manager',
      description: `Join our marketing team as a Marketing Manager and drive our brand growth.

Requirements:
- Bachelor's degree in Marketing, Business, or related field
- 4+ years of marketing experience
- Experience with digital marketing platforms (Google Ads, Facebook Ads)
- Proficiency in marketing analytics tools
- Strong understanding of SEO/SEM
- Content creation and campaign management skills
- Project management experience
- Excellent written and verbal communication

Responsibilities:
- Develop and execute marketing strategies
- Manage digital marketing campaigns
- Analyze campaign performance and ROI
- Collaborate with sales and product teams
- Create marketing content and materials
- Monitor market trends and competitor activities`
    },
    {
      title: 'Data Analyst',
      description: `We're looking for a Data Analyst to help us make data-driven decisions.

Requirements:
- Bachelor's degree in Statistics, Mathematics, or related field
- 2+ years of data analysis experience
- Proficiency in SQL, Python, or R
- Experience with data visualization tools (Tableau, Power BI)
- Knowledge of statistical analysis methods
- Understanding of database management
- Strong analytical and problem-solving skills
- Attention to detail and accuracy

Responsibilities:
- Collect and analyze large datasets
- Create reports and dashboards
- Identify trends and patterns in data
- Present findings to stakeholders
- Support business decision-making with insights
- Maintain data quality and integrity`
    },
    {
      title: 'Product Manager',
      description: `Lead product development as our Product Manager.

Requirements:
- Bachelor's degree in Business, Engineering, or related field
- 3+ years of product management experience
- Experience with product development lifecycle
- Understanding of user experience (UX) principles
- Data-driven decision making skills
- Strong communication and leadership abilities
- Knowledge of agile methodologies
- Market research and competitive analysis skills

Responsibilities:
- Define product strategy and roadmap
- Gather and prioritize product requirements
- Work with engineering and design teams
- Conduct market research and user testing
- Analyze product performance metrics
- Coordinate product launches and updates`
    }
  ];

  // Pricing plans
  const pricingPlans = [
    {
      id: 'basic',
      name: 'Basic',
      price: '$9.99',
      period: '/month',
      features: [
        '5 Resume Analyses per month',
        'Basic Career Insights',
        'PDF Export',
        'Email Support'
      ],
      color: 'blue'
    },
    {
      id: 'pro',
      name: 'Professional',
      price: '$19.99',
      period: '/month',
      features: [
        'Up to 5 Resume Analyses',
        'Advanced Career Insights',
        'Job Matching Analysis',
        'Priority Support',
        'Resume Templates',
        'Career Coaching Tips'
      ],
      color: 'purple',
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '$49.99',
      period: '/month',
      features: [
        'Everything in Professional',
        'Team Management',
        'Custom Branding',
        'API Access',
        'Dedicated Support',
        'Advanced Analytics'
      ],
      color: 'green'
    }
  ];

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchUserHistory();
    }
  }, [user]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };

    if (profileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [profileDropdownOpen]);

  const fetchUserHistory = async () => {
    try {
      const response = await fetch('/api/user/history', {
        credentials: 'include', // Include cookies for authentication
      });
      if (response.ok) {
        const data = await response.json();
        setUserHistory(data.analyses || []);
      } else {
        console.error('Failed to fetch user history:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching user history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleUploadRedirect = () => {
    setActiveTab('analysis');
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
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

  // Analysis functions
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
        setError('File size must be less than 10MB');
        return;
      }
      if (selectedFile.type !== 'application/pdf' && selectedFile.type !== 'text/plain') {
        setError('Please upload a PDF or TXT file');
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const loadExampleJob = (job) => {
    setJobDescription(job.description);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    if (analysisType === 'targeted' && !jobDescription.trim()) {
      setError('Please provide a job description for targeted analysis');
      return;
    }

    setAnalysisLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('analysisType', analysisType);
    if (analysisType === 'targeted') {
      formData.append('jobDescription', jobDescription);
    }

    try {
      const response = await fetch('/api/analyze-resume', {
        method: 'POST',
        body: formData,
        credentials: 'include', // Include cookies for authentication
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      console.log('API Response:', data); // Debug log
      
      // Set the analysis data correctly
      if (data.success && data.analysis) {
        setAnalysis(data.analysis);
      } else {
        // Fallback if the response structure is different
        setAnalysis(data);
      }
      
      fetchUserHistory(); // Refresh history after new analysis
    } catch (error) {
      console.error('Analysis error:', error);
      setError(error.message || 'An error occurred during analysis');
    } finally {
      setAnalysisLoading(false);
    }
  };

  const renderAnalysis = (analysis) => {
    if (!analysis) return null;

    console.log('Analysis object:', analysis); // Debug log

    // Handle fallback format where analysis is raw text
    if (analysis.rawAnalysis || (analysis.analysis && typeof analysis.analysis === 'string' && analysis.note)) {
      return (
        <div className="space-y-6">
          {/* Overall Score (if available) */}
          {analysis.overallScore && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-blue-800 dark:text-blue-200">Analysis Status</h3>
                  <p className="text-sm text-blue-600 dark:text-blue-400">{analysis.note || 'Analysis completed successfully'}</p>
                </div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-300">
                  ✅
                </div>
              </div>
            </div>
          )}
          
          {/* Detailed Analysis */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-2xl border border-green-200 dark:border-green-700">
            <h3 className="text-lg font-bold text-green-800 dark:text-green-200 mb-4">Detailed Analysis</h3>
            <div className="prose dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
                {analysis.analysis}
              </div>
            </div>
            {analysis.modelUsed && (
              <p className="text-sm text-green-600 dark:text-green-400 mt-4">
                Analysis provided by: {analysis.modelUsed}
              </p>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {/* Overall Score */}
        {analysis.overallScore && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-blue-800 dark:text-blue-200">Overall Score</h3>
                <p className="text-sm text-blue-600 dark:text-blue-400">Based on industry standards and best practices</p>
              </div>
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-300">
                {analysis.overallScore}%
              </div>
            </div>
          </div>
        )}

        {/* Strengths */}
        {analysis.strengths && analysis.strengths.length > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-2xl border border-green-200 dark:border-green-700">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-800 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-green-800 dark:text-green-200">Key Strengths</h3>
            </div>
            <ul className="space-y-2">
              {(Array.isArray(analysis.strengths) ? analysis.strengths : []).map((strength, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-green-700 dark:text-green-300">{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Areas for Improvement / Weaknesses */}
        {(analysis.improvements && analysis.improvements.length > 0) || (analysis.weaknesses && analysis.weaknesses.length > 0) && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-6 rounded-2xl border border-amber-200 dark:border-amber-700">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-amber-100 dark:bg-amber-800 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-amber-800 dark:text-amber-200">Areas for Improvement</h3>
            </div>
            <ul className="space-y-2">
              {(Array.isArray(analysis.improvements) ? analysis.improvements : 
                Array.isArray(analysis.weaknesses) ? analysis.weaknesses : 
                []).map((improvement, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-amber-700 dark:text-amber-300">{improvement}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Skills Analysis */}
        {analysis.skillsAnalysis && (
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 p-6 rounded-2xl border border-indigo-200 dark:border-indigo-700">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-800 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-indigo-800 dark:text-indigo-200">Skills Analysis</h3>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              {analysis.skillsAnalysis.technical && (
                <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-xl">
                  <p className="font-semibold text-indigo-700 dark:text-indigo-300 mb-3">Technical Skills</p>
                  <ul className="space-y-2">
                    {(Array.isArray(analysis.skillsAnalysis.technical) ? analysis.skillsAnalysis.technical : []).slice(0, 5).map((skill, index) => (
                      <li key={index} className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400">
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                        <span className="text-sm">{skill}</span>
                      </li>
                    ))}
                    {(Array.isArray(analysis.skillsAnalysis.technical) ? analysis.skillsAnalysis.technical : []).length > 5 && (
                      <li className="text-xs text-indigo-500 dark:text-indigo-400">+{(Array.isArray(analysis.skillsAnalysis.technical) ? analysis.skillsAnalysis.technical : []).length - 5} more</li>
                    )}
                  </ul>
                </div>
              )}
              
              {analysis.skillsAnalysis.soft && (
                <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-xl">
                  <p className="font-semibold text-indigo-700 dark:text-indigo-300 mb-3">Soft Skills</p>
                  <ul className="space-y-2">
                    {(Array.isArray(analysis.skillsAnalysis.soft) ? analysis.skillsAnalysis.soft : []).slice(0, 5).map((skill, index) => (
                      <li key={index} className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400">
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                        <span className="text-sm">{skill}</span>
                      </li>
                    ))}
                    {(Array.isArray(analysis.skillsAnalysis.soft) ? analysis.skillsAnalysis.soft : []).length > 5 && (
                      <li className="text-xs text-indigo-500 dark:text-indigo-400">+{(Array.isArray(analysis.skillsAnalysis.soft) ? analysis.skillsAnalysis.soft : []).length - 5} more</li>
                    )}
                  </ul>
                </div>
              )}
              
              {analysis.skillsAnalysis.missing && (
                <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-xl">
                  <p className="font-semibold text-indigo-700 dark:text-indigo-300 mb-3">Skills to Develop</p>
                  <ul className="space-y-2">
                    {(Array.isArray(analysis.skillsAnalysis.missing) ? analysis.skillsAnalysis.missing : []).slice(0, 5).map((skill, index) => (
                      <li key={index} className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400">
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                        <span className="text-sm">{skill}</span>
                      </li>
                    ))}
                    {(Array.isArray(analysis.skillsAnalysis.missing) ? analysis.skillsAnalysis.missing : []).length > 5 && (
                      <li className="text-xs text-indigo-500 dark:text-indigo-400">+{(Array.isArray(analysis.skillsAnalysis.missing) ? analysis.skillsAnalysis.missing : []).length - 5} more</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Career Suggestions */}
        {analysis.careerSuggestions && analysis.careerSuggestions.length > 0 && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-2xl border border-purple-200 dark:border-purple-700">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-800 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-purple-800 dark:text-purple-200">Career Suggestions</h3>
            </div>
            <ul className="space-y-2">
              {(Array.isArray(analysis.careerSuggestions) ? analysis.careerSuggestions : []).map((suggestion, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-purple-700 dark:text-purple-300">{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Job Match Analysis (for targeted analysis) */}
        {analysis.jobMatch && (
          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 p-6 rounded-2xl border border-cyan-200 dark:border-cyan-700">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-cyan-100 dark:bg-cyan-800 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-cyan-800 dark:text-cyan-200">Job Match Analysis</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {analysis.jobMatch.matchingSkills && (
                <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-xl">
                  <p className="font-semibold text-cyan-700 dark:text-cyan-300 mb-2">Matching Skills</p>
                  <ul className="space-y-1">
                    {(Array.isArray(analysis.jobMatch.matchingSkills) ? analysis.jobMatch.matchingSkills : []).slice(0, 3).map((skill, index) => (
                      <li key={index} className="flex items-center space-x-2 text-cyan-600 dark:text-cyan-400">
                        <div className="w-1 h-1 bg-cyan-500 rounded-full"></div>
                        <span className="text-sm">{skill}</span>
                      </li>
                    ))}
                    {(Array.isArray(analysis.jobMatch.matchingSkills) ? analysis.jobMatch.matchingSkills : []).length > 3 && (
                      <li className="text-xs text-cyan-500 dark:text-cyan-400">+{(Array.isArray(analysis.jobMatch.matchingSkills) ? analysis.jobMatch.matchingSkills : []).length - 3} more</li>
                    )}
                  </ul>
                </div>
              )}
              {analysis.jobMatch.missingSkills && (
                <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-xl">
                  <p className="font-semibold text-cyan-700 dark:text-cyan-300 mb-2">Skills to Develop</p>
                  <ul className="space-y-1">
                    {(Array.isArray(analysis.jobMatch.missingSkills) ? analysis.jobMatch.missingSkills : []).slice(0, 3).map((skill, index) => (
                      <li key={index} className="flex items-center space-x-2 text-cyan-600 dark:text-cyan-400">
                        <div className="w-1 h-1 bg-cyan-500 rounded-full"></div>
                        <span className="text-sm">{skill}</span>
                      </li>
                    ))}
                    {(Array.isArray(analysis.jobMatch.missingSkills) ? analysis.jobMatch.missingSkills : []).length > 3 && (
                      <li className="text-xs text-cyan-500 dark:text-cyan-400">+{(Array.isArray(analysis.jobMatch.missingSkills) ? analysis.jobMatch.missingSkills : []).length - 3} more</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Items */}
        {analysis.actionItems && analysis.actionItems.length > 0 && (
          <div className="bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 p-6 rounded-2xl border border-rose-200 dark:border-rose-700">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-rose-100 dark:bg-rose-800 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-rose-800 dark:text-rose-200">Action Items</h3>
            </div>
            <ul className="space-y-3">
              {(Array.isArray(analysis.actionItems) ? analysis.actionItems : []).map((item, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-rose-100 dark:bg-rose-800 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-rose-600 dark:text-rose-400 text-xs font-bold">{index + 1}</span>
                  </div>
                  <span className="text-rose-700 dark:text-rose-300">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Marketability & Career Assessment */}
        {(analysis.marketability || analysis.careerSuggestions) && (
          <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 p-6 rounded-2xl border border-teal-200 dark:border-teal-700">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-teal-100 dark:bg-teal-800 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-teal-800 dark:text-teal-200">Career Assessment</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {analysis.marketability && (
                <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-xl">
                  <p className="font-semibold text-teal-700 dark:text-teal-300 mb-3">Market Position</p>
                  <p className="text-teal-600 dark:text-teal-400 text-sm leading-relaxed">{analysis.marketability}</p>
                </div>
              )}
              
              {analysis.careerSuggestions && typeof analysis.careerSuggestions === 'object' && (
                <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-xl">
                  <p className="font-semibold text-teal-700 dark:text-teal-300 mb-3">Career Level</p>
                  <div className="space-y-2">
                    {analysis.careerSuggestions.currentLevel && (
                      <p className="text-sm text-teal-600 dark:text-teal-400">
                        <span className="font-medium">Level:</span> {analysis.careerSuggestions.currentLevel}
                      </p>
                    )}
                    {analysis.careerSuggestions.suitableRoles && (
                      <div>
                        <p className="text-sm font-medium text-teal-700 dark:text-teal-300 mb-1">Suitable Roles:</p>
                        <ul className="text-xs text-teal-600 dark:text-teal-400 space-y-1">
                          {(Array.isArray(analysis.careerSuggestions.suitableRoles) ? analysis.careerSuggestions.suitableRoles : []).slice(0, 3).map((role, index) => (
                            <li key={index}>• {role}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Salary Range */}
        {analysis.salaryRange && (
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 p-6 rounded-2xl border border-emerald-200 dark:border-emerald-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-800 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-200">Salary Range</h3>
              </div>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-300">{analysis.salaryRange}</p>
            </div>
          </div>
        )}

        {/* Fallback for when no structured data is available but analysis exists */}
        {!analysis.overallScore && !analysis.strengths && !analysis.analysis && Object.keys(analysis).length > 0 && (
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-900/20 dark:to-blue-900/20 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">Analysis Results</h3>
            <div className="space-y-4">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg overflow-auto max-h-96">
                {JSON.stringify(analysis, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>

      <div className="relative flex">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-80 sidebar-gradient backdrop-blur-2xl border-r border-white/20 dark:border-gray-700/50 shadow-2xl transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-all duration-500 ease-out lg:translate-x-0 lg:static lg:inset-0`}>
          <div className="flex flex-col h-full relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 left-0 w-24 h-24 bg-gradient-to-br from-indigo-400/10 to-pink-400/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
            
            {/* Sidebar Header */}
            <div className="relative flex items-center justify-between p-6 border-b border-white/30 dark:border-gray-700/50">
              <div className="flex items-center space-x-4">
                <div className="relative group">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-all duration-500 group-hover:scale-110 float-animation">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl opacity-20 scale-125 animate-pulse"></div>
                </div>
                <div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    AI Career Coach
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium flex items-center space-x-1">
                    <span>Hello, {user.name}!</span>
                    <span className="animate-bounce">👋</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden group p-2.5 rounded-xl glassmorphism hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-300 hover:scale-110 btn-modern-hover"
              >
                <svg className="w-5 h-5 text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-200 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* User Stats Mini Card */}
            <div className="relative mx-6 mt-6 mb-4 p-4 glassmorphism bg-gradient-to-r from-blue-50/80 to-purple-50/80 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl backdrop-blur-sm hover:scale-[1.02] transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Usage Status</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    {userHistory.length}<span className="text-sm text-gray-500 dark:text-gray-400 font-normal">/5</span>
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {5 - userHistory.length} analyses remaining
                  </p>
                </div>
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 opacity-20 scale-125 animate-pulse"></div>
                </div>
              </div>
              <div className="mt-3 w-full bg-gray-200/50 dark:bg-gray-700/50 rounded-full h-2.5 overflow-hidden backdrop-blur-sm">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-full transition-all duration-1000 ease-out progress-fill relative overflow-hidden"
                  style={{ width: `${(userHistory.length / 5) * 100}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="relative flex-1 px-6 space-y-3">
              <div className="mb-6">
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4 px-3 flex items-center">
                  <span className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mr-2 animate-pulse"></span>
                  Navigation
                </p>
                
                <div className="space-y-2">
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`group w-full flex items-center space-x-4 p-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-[1.02] btn-modern-hover ${
                      activeTab === 'dashboard' 
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25 scale-[1.02]'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-800/60 hover:text-gray-800 dark:hover:text-white glassmorphism'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl transition-all duration-300 ${
                      activeTab === 'dashboard' 
                        ? 'bg-white/20 text-white shadow-inner' 
                        : 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/60 group-hover:scale-110'
                    }`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                      </svg>
                    </div>
                    <span className="text-base">My Dashboard</span>
                    {activeTab === 'dashboard' && (
                      <div className="ml-auto flex items-center space-x-2">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <div className="w-1 h-1 bg-white/70 rounded-full animate-pulse delay-75"></div>
                      </div>
                    )}
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('analysis')}
                    className={`group w-full flex items-center space-x-4 p-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-[1.02] btn-modern-hover ${
                      activeTab === 'analysis' 
                        ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/25 scale-[1.02]'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-800/60 hover:text-gray-800 dark:hover:text-white glassmorphism'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl transition-all duration-300 ${
                      activeTab === 'analysis' 
                        ? 'bg-white/20 text-white shadow-inner' 
                        : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800/60 group-hover:scale-110'
                    }`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <span className="text-base">New Analysis</span>
                    {activeTab === 'analysis' && (
                      <div className="ml-auto flex items-center space-x-2">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <div className="w-1 h-1 bg-white/70 rounded-full animate-pulse delay-75"></div>
                      </div>
                    )}
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('upgrade')}
                    className={`group w-full flex items-center justify-between p-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-[1.02] btn-modern-hover ${
                      activeTab === 'upgrade' 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/25 scale-[1.02]'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-800/60 hover:text-gray-800 dark:hover:text-white glassmorphism'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-2.5 rounded-xl transition-all duration-300 ${
                        activeTab === 'upgrade' 
                          ? 'bg-white/20 text-white shadow-inner' 
                          : 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/60 group-hover:scale-110'
                      }`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                      <span className="text-base">Upgrade Plan</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {activeTab === 'upgrade' && (
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                          <div className="w-1 h-1 bg-white/70 rounded-full animate-pulse delay-75"></div>
                        </div>
                      )}
                      {userHistory.length >= 4 && (
                        <span className={`inline-flex items-center justify-center px-2.5 py-1 text-xs font-bold rounded-full border transition-all duration-300 hover:scale-110 ${
                          userHistory.length >= 5 
                            ? 'bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-600 border-red-500/30 dark:bg-red-500/30 dark:text-red-400 dark:border-red-500/50 animate-pulse shadow-lg shadow-red-500/25'
                            : 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-600 border-yellow-500/30 dark:bg-yellow-500/30 dark:text-yellow-400 dark:border-yellow-500/50 shadow-lg shadow-yellow-500/25'
                        }`}>
                          {userHistory.length >= 5 ? '⚠️ Limit' : '⚡ Soon'}
                        </span>
                      )}
                    </div>
                  </button>
                </div>
              </div>
            </nav>

            {/* Bottom Section */}
            <div className="relative p-6 border-t border-white/20 dark:border-gray-700/50">
              {/* User Profile Card */}
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="w-full p-4 glassmorphism bg-gradient-to-r from-gray-50/80 to-blue-50/80 dark:from-gray-800/80 dark:to-blue-900/30 rounded-2xl backdrop-blur-sm hover:scale-[1.02] transition-all duration-300 group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg group-hover:scale-110 transition-transform duration-300">
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white dark:border-gray-800 animate-pulse"></div>
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user.email}
                      </p>
                    </div>
                    <div className={`transform transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`}>
                      <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </button>

                {/* Profile Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 glassmorphism bg-white/95 dark:bg-gray-800/95 rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/50 backdrop-blur-xl animate-slideInFromLeft overflow-hidden">
                    <div className="p-2">
                      <button className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50/80 dark:hover:bg-gray-700/50 rounded-xl transition-all duration-200 group">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800 dark:text-white">View Profile</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Manage account settings</p>
                        </div>
                      </button>

                      <button className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50/80 dark:hover:bg-gray-700/50 rounded-xl transition-all duration-200 group">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800 dark:text-white">Preferences</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Theme & notifications</p>
                        </div>
                      </button>

                      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-600 to-transparent my-2"></div>

                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-red-50/80 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200 group"
                      >
                        <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-rose-600 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300">Sign Out</p>
                          <p className="text-xs text-red-500 dark:text-red-500/70">Logout from your account</p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between p-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
            <div className="w-10"></div>
          </div>

            {/* Dashboard Content */}
          <div className="p-6 lg:p-8">
            {activeTab === 'dashboard' ? (
              <>
                {/* Header */}
                <div className="mb-8">
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 dark:text-white mb-2">
                    Welcome back, {user.name}!
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    Track your resume analyses and career progress
                  </p>
                </div>            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Analyses</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">{userHistory.length}<span className="text-sm text-gray-500 dark:text-gray-400">/5</span></p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">This Month</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">
                      {userHistory.filter(analysis => {
                        const analysisDate = new Date(analysis.createdAt);
                        const currentDate = new Date();
                        return analysisDate.getMonth() === currentDate.getMonth() && 
                               analysisDate.getFullYear() === currentDate.getFullYear();
                      }).length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Score</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">
                      {userHistory.length > 0 
                        ? Math.round(userHistory.reduce((acc, analysis) => acc + (analysis.overallScore || 75), 0) / userHistory.length)
                        : 0}%
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Analyses */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-xl">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">Recent Analyses</h2>
                  <button
                    onClick={handleUploadRedirect}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl transition-colors"
                  >
                    New Analysis
                  </button>
                </div>
              </div>

              <div className="p-6">
                {historyLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  </div>
                ) : userHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">No analyses yet</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Start by uploading your resume for AI-powered analysis
                    </p>
                    <button
                      onClick={handleUploadRedirect}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl transition-colors"
                    >
                      Upload Resume
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userHistory.slice(0, 5).map((analysis, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800 dark:text-white">
                              {analysis.analysisType === 'targeted' ? 'Job-Specific Analysis' : 'General Analysis'}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {formatDate(analysis.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-gray-800 dark:text-white">
                            {analysis.overallScore || 75}%
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Score
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
              </>
            ) : activeTab === 'analysis' ? (
              <>
                {/* Resume Analysis Tab */}
                <div className="mb-8">
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 dark:text-white mb-2">
                    Resume Analysis
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    Upload your resume for AI-powered analysis and insights
                  </p>
                </div>

                {/* Analysis Form */}
                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-xl p-6 mb-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Analysis Type Selection */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                        Analysis Type
                      </label>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div
                          className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            analysisType === 'general'
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                          }`}
                          onClick={() => setAnalysisType('general')}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-4 h-4 rounded-full border-2 ${
                              analysisType === 'general' ? 'border-blue-500 bg-blue-500' : 'border-gray-300 dark:border-gray-600'
                            }`}>
                              {analysisType === 'general' && (
                                <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                              )}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-800 dark:text-white">General Analysis</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Comprehensive resume evaluation and career insights
                              </p>
                            </div>
                          </div>
                        </div>

                        <div
                          className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            analysisType === 'targeted'
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                          }`}
                          onClick={() => setAnalysisType('targeted')}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-4 h-4 rounded-full border-2 ${
                              analysisType === 'targeted' ? 'border-purple-500 bg-purple-500' : 'border-gray-300 dark:border-gray-600'
                            }`}>
                              {analysisType === 'targeted' && (
                                <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                              )}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-800 dark:text-white">Job-Specific Analysis</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Compare your resume against a specific job description
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* File Upload */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                        Upload Resume
                      </label>
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                        <input
                          type="file"
                          onChange={handleFileChange}
                          accept=".pdf,.txt"
                          className="hidden"
                          id="file-upload"
                        />
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                          </div>
                          <p className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                            {file ? file.name : 'Click to upload your resume'}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Supports PDF and TXT files (max 10MB)
                          </p>
                        </label>
                      </div>
                    </div>

                    {/* Resume Limit Warning */}
                    {userHistory.length >= 4 && (
                      <div className={`p-4 rounded-xl border ${userHistory.length >= 5 
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' 
                        : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                      }`}>
                        <div className="flex items-center">
                          <svg className={`w-5 h-5 mr-2 ${userHistory.length >= 5 
                            ? 'text-red-500' 
                            : 'text-yellow-500'
                          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          <p className={`text-sm font-medium ${userHistory.length >= 5 
                            ? 'text-red-700 dark:text-red-300' 
                            : 'text-yellow-700 dark:text-yellow-300'
                          }`}>
                            {userHistory.length >= 5 
                              ? 'You have reached the maximum limit of 5 resume analyses. Please delete old analyses to add new ones.'
                              : `You have ${userHistory.length} of 5 analyses. Only ${5 - userHistory.length} remaining.`
                            }
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Job Description for Targeted Analysis */}
                    {analysisType === 'targeted' && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Job Description
                          </label>
                          <div className="relative">
                            <select
                              className="text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 text-gray-700 dark:text-gray-300"
                              onChange={(e) => {
                                const selectedJob = exampleJobs.find(job => job.title === e.target.value);
                                if (selectedJob) loadExampleJob(selectedJob);
                              }}
                              defaultValue=""
                            >
                              <option value="">Load Example</option>
                              {exampleJobs.map((job) => (
                                <option key={job.title} value={job.title}>
                                  {job.title}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <textarea
                          value={jobDescription}
                          onChange={(e) => setJobDescription(e.target.value)}
                          placeholder="Paste the job description here..."
                          className="w-full h-40 p-4 border border-gray-300 dark:border-gray-600 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        />
                      </div>
                    )}

                    {/* Error Display */}
                    {error && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                        <div className="flex items-center space-x-2">
                          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-red-700 dark:text-red-300">{error}</p>
                        </div>
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={analysisLoading || userHistory.length >= 5}
                      className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 shadow-xl text-lg"
                    >
                      {analysisLoading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                          <span>Analyzing Resume...</span>
                        </div>
                      ) : userHistory.length >= 5 ? (
                        'Analysis Limit Reached (5/5)'
                      ) : (
                        `Start ${analysisType === 'targeted' ? 'Job-Specific' : 'General'} Analysis`
                      )}
                    </button>
                  </form>
                </div>

                {/* Analysis Results */}
                {analysis && (
                  <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-xl p-6">
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Analysis Results</h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        {analysisType === 'targeted' ? 'Job-specific analysis complete' : 'General analysis complete'}
                      </p>
                    </div>
                    {renderAnalysis(analysis)}
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Upgrade Plan Tab */}
                <div className="mb-8">
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 dark:text-white mb-2">
                    Upgrade Your Plan
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    Choose the perfect plan for your career growth
                  </p>
                </div>

                {/* Pricing Plans */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  {pricingPlans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl border-2 cursor-pointer transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-105 ${
                        selectedPlan === plan.id
                          ? `border-${plan.color}-500 ring-4 ring-${plan.color}-200 dark:ring-${plan.color}-800`
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      } ${plan.popular ? 'ring-2 ring-purple-500 ring-opacity-50' : ''}`}
                      onClick={() => setSelectedPlan(plan.id)}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold px-4 py-1 rounded-full shadow-lg">
                            Most Popular
                          </span>
                        </div>
                      )}
                      
                      <div className="p-6">
                        <div className="text-center mb-6">
                          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{plan.name}</h3>
                          <div className="flex items-baseline justify-center">
                            <span className="text-4xl font-bold text-gray-800 dark:text-white">{plan.price}</span>
                            <span className="text-lg text-gray-500 dark:text-gray-400 ml-1">{plan.period}</span>
                          </div>
                        </div>
                        
                        <ul className="space-y-3 mb-6">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-center">
                              <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                            </li>
                          ))}
                        </ul>
                        
                        <button
                          className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                            selectedPlan === plan.id
                              ? `bg-gradient-to-r from-${plan.color}-500 to-${plan.color}-600 hover:from-${plan.color}-600 hover:to-${plan.color}-700 text-white transform hover:scale-105`
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Upgrade Benefits */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8 border border-blue-200 dark:border-blue-800">
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Why Upgrade?</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Advanced AI Analysis</h4>
                        <p className="text-gray-600 dark:text-gray-400">Get deeper insights with our premium AI models for more accurate career recommendations.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                        <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Priority Support</h4>
                        <p className="text-gray-600 dark:text-gray-400">Get faster response times and dedicated support from our career experts.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                        <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Resume Templates</h4>
                        <p className="text-gray-600 dark:text-gray-400">Access professional resume templates designed by career experts.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                        <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Salary Insights</h4>
                        <p className="text-gray-600 dark:text-gray-400">Get detailed salary benchmarks and negotiation tips for your industry.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}
