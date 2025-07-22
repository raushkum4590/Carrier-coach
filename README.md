# AI Career Coach

An intelligent resume analysis tool that provides personalized career advice using AI. Upload your resume and get comprehensive feedback on strengths, weaknesses, career suggestions, and actionable improvements. Now includes targeted job-specific analysis!

## 🚀 New Features

- **📋 Job-Specific Analysis**: Upload your resume along with a job description for targeted career advice
- **🎯 Two Analysis Modes**: 
  - General career analysis for overall feedback
  - Targeted analysis comparing your resume against specific job requirements
- **� Example Job Descriptions**: Quick-load common job descriptions for testing
- **🔄 Multiple AI Models**: Automatic fallback between different AI models for reliable service

## Features

- �📄 **Resume Upload**: Support for PDF and TXT files
- 🤖 **AI-Powered Analysis**: Uses OpenRouter API with Qwen model for intelligent insights
- 📊 **Comprehensive Feedback**: Get detailed analysis including:
  - Overall score and assessment
  - Strengths and weaknesses identification
  - Skills analysis (technical, soft, missing)
  - Career suggestions and suitable roles
  - Format and content improvements
  - Actionable recommendations
  - Marketability assessment
  - Salary range estimation

## 🎯 Job-Specific Features

When using targeted analysis, you'll also get:
- **Job Match Score**: Percentage match for the specific role
- **Skill Gap Analysis**: What skills you have vs. what's required
- **Resume Optimization**: How to tailor your resume for the job
- **Interview Preparation**: Key areas to focus on
- **Salary Negotiation**: Advice based on your match level

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

1. Copy the environment template:
   ```bash
   cp .env.example .env.local
   ```

2. Get your OpenRouter API key:
   - Visit [https://openrouter.ai/](https://openrouter.ai/)
   - Sign up for an account
   - Generate an API key

3. Update `.env.local` with your API key:
   ```
   OPENROUTER_API_KEY=your_actual_api_key_here
   ```

### 3. Run the Application

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## How to Use

### General Analysis
1. **Select Analysis Type**: Choose "General Career Analysis"
2. **Upload Resume**: Click the upload area or drag and drop your resume file (PDF or TXT)
3. **Analyze**: Click "Analyze Resume" to start the AI analysis
4. **Review Results**: Get comprehensive feedback organized in easy-to-read sections

### Job-Specific Analysis
1. **Select Analysis Type**: Choose "Job-Specific Analysis"
2. **Add Job Description**: 
   - Use one of the provided examples by clicking the job title buttons
   - Or paste your own job description
3. **Upload Resume**: Upload your resume file
4. **Analyze**: Click "Analyze Resume vs Job" to get targeted feedback
5. **Review Results**: Get job-specific match analysis and recommendations

## Example Job Descriptions Included

- **Software Engineer**: React, Node.js, JavaScript development role
- **Data Scientist**: Python, machine learning, analytics position  
- **Digital Marketing Manager**: SEO, social media, content marketing role
- **Product Manager**: Strategy, roadmap, cross-functional leadership position

## Supported File Types

- **PDF**: `.pdf` files (recommended)
- **Plain Text**: `.txt` files

## AI Model

This application uses multiple AI models via OpenRouter API with automatic fallback:
- **Primary**: Qwen/Qwen-2.5-72B-Instruct (free tier)
- **Fallbacks**: Meta Llama, Microsoft Phi, Google Gemma models

Features:
- Advanced natural language understanding
- Comprehensive resume analysis
- Industry-specific insights
- Job-specific matching
- Actionable career advice

## Technical Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **AI Integration**: OpenRouter API with multiple model support
- **File Processing**: PDF parsing, form handling
- **Styling**: Tailwind CSS with dark mode support

## Project Structure

```
ai-career-coach/
├── app/
│   ├── api/
│   │   ├── analyze-resume/
│   │   │   └── route.js          # Main resume analysis API
│   │   ├── test-connection/
│   │   │   └── route.js          # API connection testing
│   │   └── list-models/
│   │       └── route.js          # Available models endpoint
│   ├── components/
│   │   └── LoadingSpinner.js     # Reusable loading component
│   ├── globals.css               # Global styles
│   ├── layout.js                 # Root layout
│   └── page.js                   # Main application page
├── .env.example                  # Environment variables template
├── .env.local                    # Your API configuration
├── package.json                  # Dependencies and scripts
└── README.md                     # This file
```

## API Endpoints

- `POST /api/analyze-resume` - Main analysis endpoint
- `GET /api/test-connection` - Test API connectivity
- `GET /api/list-models` - List available AI models

## Analysis Categories

### General Analysis
1. **Overall Score**: Numerical assessment of resume quality
2. **Strengths**: Key positive aspects of the resume
3. **Weaknesses**: Areas that need improvement
4. **Skills Analysis**: Technical skills, soft skills, and missing competencies
5. **Career Suggestions**: Role recommendations and career path guidance
6. **Improvements**: Specific formatting and content enhancements
7. **Action Items**: Concrete steps to improve the resume
8. **Marketability**: Assessment of job market competitiveness
9. **Salary Range**: Estimated compensation based on skills and experience

### Job-Specific Analysis
All general analysis features plus:
1. **Job Match Score**: Percentage compatibility with the role
2. **Matching Skills**: Skills that align with job requirements
3. **Missing Skills**: Required skills not found in resume
4. **Resume Optimization**: Tailored improvement suggestions
5. **Interview Preparation**: Role-specific interview focus areas
6. **Salary Negotiation**: Match-based compensation advice

## User Interface

- Clean, modern design with dark mode support
- Responsive layout for all device sizes
- Drag-and-drop file upload
- Real-time feedback and error handling
- Organized results with color-coded sections
- Example job descriptions for quick testing
- API connection testing tools

## Troubleshooting

### Common Issues

1. **API Key Errors**: Ensure your OpenRouter API key is correctly set in `.env.local`
2. **File Upload Issues**: Check that your file is in PDF or TXT format and under 10MB
3. **PDF Parsing Errors**: Try converting your PDF to text or using a different PDF
4. **Model Unavailable**: The app automatically tries multiple models if one fails

### Error Messages

- "No file uploaded": Select a file before clicking analyze
- "Please provide a job description": Required for targeted analysis
- "Unsupported file type": Only PDF and TXT files are supported
- "OpenRouter API key not configured": Add your API key to `.env.local`
- "Failed to parse PDF": Try a different PDF file or convert to text

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is open source and available under the [MIT License](LICENSE).
