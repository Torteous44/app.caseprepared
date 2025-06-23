// Define API base URL
const API_BASE_URL = "https://caseprepcrud.onrender.com";

export interface LessonComponent {
  id: string;
  description: string;
}

export interface LessonQuestion {
  text: string;
  expected_components: LessonComponent[];
}

export interface LessonPhase {
  type: 'introduction' | 'questioning' | 'conclusion';
  content?: string;
  questions?: LessonQuestion[];
}

export interface Lesson {
  id: string;
  title: string;
  difficulty: string;
  company: string;
  body: {
    phases: LessonPhase[];
    voice_id?: string;
  };
  created_at: string;
  image_url?: string;
  short_description?: string;
  long_description?: string;
}

export const fetchLessons = async (skip = 0, limit = 100): Promise<Lesson[]> => {
  try {
    const token = localStorage.getItem('access_token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/lessons?skip=${skip}&limit=${limit}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch lessons: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching lessons:', error);
    throw error;
  }
};

export const fetchLesson = async (lessonId: string): Promise<Lesson> => {
  try {
    const token = localStorage.getItem('access_token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/lessons/${lessonId}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch lesson: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching lesson ${lessonId}:`, error);
    throw error;
  }
};

// Convert lessons to the format expected by the InterviewCard component
export const convertLessonToCardFormat = (lesson: Lesson) => {
  return {
    id: lesson.id,
    company: lesson.company,
    logo: getCompanyLogo(lesson.company),
    title: lesson.title,
    description: lesson.short_description || '',
    image_url: lesson.image_url,
    buttonText: "Start Lesson",
    case_type: determineCaseType(lesson),
    difficulty: lesson.difficulty,
    duration: estimateDuration(lesson),
    progress_status: null,
    progress_data: null,
    interview_id: null,
    started_at: null,
    completed_at: null,
    questions_completed: null,
    total_questions: countQuestions(lesson),
    completionStatus: null
  };
};

// Helper function to determine case type from lesson content
const determineCaseType = (lesson: Lesson): string => {
  // Try to infer case type from title or description
  const titleLower = lesson.title.toLowerCase();
  const descLower = (lesson.short_description || '').toLowerCase();
  
  if (titleLower.includes('market sizing') || descLower.includes('market sizing')) {
    return 'Market Sizing';
  } else if (titleLower.includes('profitability') || descLower.includes('profitability')) {
    return 'Profitability';
  } else if (titleLower.includes('market entry') || descLower.includes('market entry')) {
    return 'Market Entry';
  } else if (titleLower.includes('merger') || descLower.includes('merger') || 
             titleLower.includes('acquisition') || descLower.includes('acquisition')) {
    return 'Merger & Acquisition';
  } else if (titleLower.includes('growth') || descLower.includes('growth strategy')) {
    return 'Revenue Growth';
  } else if (titleLower.includes('comparison') || descLower.includes('comparison')) {
    return 'Comparison';
  }
  
  // Default case type
  return 'Case Interview';
};

// Helper function to estimate lesson duration based on number of questions
const estimateDuration = (lesson: Lesson): number => {
  const questionCount = countQuestions(lesson);
  // Estimate 5-10 minutes per question
  return Math.max(20, questionCount * 7); // Minimum 20 minutes
};

// Helper function to count questions in a lesson
const countQuestions = (lesson: Lesson): number => {
  let count = 0;
  lesson.body.phases.forEach(phase => {
    if (phase.questions) {
      count += phase.questions.length;
    }
  });
  return count || 5; // Default to 5 if no questions found
};

// Helper function to get company logo based on company name
const getCompanyLogo = (company: string): string => {
  // Normalize the company name for case-insensitive matching
  const normalizedCompany = company.toLowerCase();

  const companyLogos: Record<string, string> = {
    // Original mappings
    "mckinsey & company": "/assets/interviewCards/Logos/Mckinsey.svg",
    "mckinsey": "/assets/interviewCards/Logos/Mckinsey.svg",
    "bcg": "/assets/interviewCards/Logos/BCG.svg",
    "boston consulting group": "/assets/interviewCards/Logos/BCG.svg",
    "bain & company": "/assets/interviewCards/Logos/Bain.svg",
    "bain": "/assets/interviewCards/Logos/Bain.svg",

    // Additional mappings based on available logos
    "accenture": "/assets/interviewCards/Logos/Accenture.svg",
    "deloitte": "/assets/interviewCards/Logos/Deloitte.svg",
    "ey": "/assets/interviewCards/Logos/EY.svg",
    "ernst & young": "/assets/interviewCards/Logos/EY.svg",
    "kearney": "/assets/interviewCards/Logos/Kearney.svg",
    "a.t. kearney": "/assets/interviewCards/Logos/Kearney.svg",
    "pwc": "/assets/interviewCards/Logos/PWC.svg",
    "pricewaterhousecoopers": "/assets/interviewCards/Logos/PWC.svg",
    "oliver wyman": "/assets/interviewCards/Logos/Wyman.svg",
    "wyman": "/assets/interviewCards/Logos/Wyman.svg",
  };

  // Check if normalized company name exists in our mapping
  return (
    companyLogos[normalizedCompany] ||
    "/assets/interviewCards/Logos/default.svg"
  );
}; 