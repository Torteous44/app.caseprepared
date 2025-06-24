import { refreshTokenAndProfile } from './apiClient';

// Define API base URL
const API_BASE_URL = "https://caseprepcrud.onrender.com";

export interface Interview {
  id: string;
  title: string;
  difficulty: string;
  company: string | null;
  short_description: string | null;
  long_description: string | null;
  image_url: string | null;
  elevenlabs_agent_id: string;
  demo: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface InterviewSession {
  progress_id: string;
  ws_url: string;
  elevenlabs_agent_id: string;
  ttl_seconds: number;
  started_at: string;
}

export interface UserInterview {
  id: string;
  interview_id: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  transcript?: any;
  feedback?: string;
  duration_seconds?: number;
  conversation_id?: string;
  started_at: string;
  completed_at?: string;
  interview: Interview;
}

// Fetch demo interviews (publicly accessible)
export const fetchDemoInterviews = async (skip = 0, limit = 100): Promise<Interview[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/interviews/demo?skip=${skip}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch demo interviews: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching demo interviews:', error);
    throw error;
  }
};

// Fetch premium interviews (subscription required)
export const fetchPremiumInterviews = async (skip = 0, limit = 100): Promise<Interview[]> => {
  try {
    const token = localStorage.getItem('access_token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/interviews/premium?skip=${skip}&limit=${limit}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      if (response.status === 402) {
        // Try to refresh token and retry once
        console.log('Received 402 error, attempting token refresh...');
        const refreshed = await refreshTokenAndProfile();
        
        if (refreshed) {
          // Retry with new token
          const newToken = localStorage.getItem('access_token');
          const retryResponse = await fetch(`${API_BASE_URL}/api/v1/interviews/premium?skip=${skip}&limit=${limit}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${newToken}`,
            },
          });
          
          if (retryResponse.ok) {
            console.log('Successfully fetched premium interviews after token refresh');
            return await retryResponse.json();
          }
        }
        
        throw new Error('Active subscription required for premium interviews');
      }
      throw new Error(`Failed to fetch premium interviews: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching premium interviews:', error);
    throw error;
  }
};

// Fetch user's interviews
export const fetchUserInterviews = async (
  status?: 'in_progress' | 'completed' | 'abandoned',
  skip = 0, 
  limit = 100
): Promise<UserInterview[]> => {
  try {
    const token = localStorage.getItem('access_token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let url = `${API_BASE_URL}/api/v1/interviews/my?skip=${skip}&limit=${limit}`;
    if (status) {
      url += `&status=${status}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user interviews: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user interviews:', error);
    throw error;
  }
};

// Fetch single interview by ID
export const fetchInterview = async (interviewId: string): Promise<Interview> => {
  try {
    const token = localStorage.getItem('access_token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/interviews/${interviewId}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      if (response.status === 402) {
        throw new Error('Active subscription required for this interview');
      }
      throw new Error(`Failed to fetch interview: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching interview ${interviewId}:`, error);
    throw error;
  }
};

// Create interview session
export const createInterviewSession = async (
  interviewId: string, 
  demoMode = false
): Promise<InterviewSession> => {
  try {
    const token = localStorage.getItem('access_token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/interviews/${interviewId}/session`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ demo_mode: demoMode.toString() }),
    });

    if (!response.ok) {
      if (response.status === 402) {
        // Try to refresh token and retry once
        console.log('Received 402 error, attempting token refresh...');
        const refreshed = await refreshTokenAndProfile();
        
        if (refreshed) {
          // Retry with new token
          const newToken = localStorage.getItem('access_token');
          const retryResponse = await fetch(`${API_BASE_URL}/api/v1/interviews/${interviewId}/session`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${newToken}`,
            },
            body: JSON.stringify({ demo_mode: demoMode.toString() }),
          });
          
          if (retryResponse.ok) {
            console.log('Successfully created interview session after token refresh');
            return await retryResponse.json();
          }
        }
        
        throw new Error('Active subscription required for premium interviews');
      }
      throw new Error(`Failed to create interview session: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error creating interview session for ${interviewId}:`, error);
    throw error;
  }
};

// Complete interview session
export const completeInterviewSession = async (
  interviewId: string,
  data: {
    transcript?: any;
    feedback?: string;
    duration_seconds?: number;
    conversation_id?: string;
  }
): Promise<void> => {
  try {
    const token = localStorage.getItem('access_token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/interviews/${interviewId}/complete`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to complete interview session: ${response.status}`);
    }
  } catch (error) {
    console.error(`Error completing interview session for ${interviewId}:`, error);
    throw error;
  }
};

// New simplified analytics response structure
export interface InterviewCompleteResponse {
  analytics: {
    structure: { title: string; description: string };
    communication: { title: string; description: string };
    hypothesis_driven_approach: { title: string; description: string };
    qualitative_analysis: { title: string; description: string };
    adaptability: { title: string; description: string };
  };
  processing_metadata: {
    processed_at: string;
    interview_id?: string;
    gpt_model: string;
    word_count: number;
    char_count: number;
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens: number;
  };
}

// Simplified analytics endpoint - transcript in, analytics out immediately
export const completeInterviewWithAnalytics = async (
  transcript: string,
  interviewId?: string
): Promise<InterviewCompleteResponse> => {
  try {
    const token = localStorage.getItem('access_token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/interviews/complete`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        transcript: transcript,
        interview_id: interviewId,
      }),
    });

    if (!response.ok) {
      // Try to get the detailed error message from the server
      let errorMessage = `Failed to analyze interview: ${response.status}`;
      
      try {
        const errorData = await response.json();
        if (errorData.detail) {
          errorMessage = errorData.detail;
        }
      } catch {
        // If we can't parse the error response, use the status code
      }
      
      if (response.status === 400) {
        if (errorMessage.includes('Transcript text is required')) {
          throw new Error('Please ensure the interview transcript is available before requesting analytics.');
        } else if (errorMessage.includes('OpenAI API')) {
          throw new Error('Analytics service is temporarily unavailable. Please try again later.');
        }
        throw new Error(errorMessage);
      } else if (response.status === 402) {
        throw new Error('Active subscription required for analytics.');
      } else if (response.status === 500) {
        if (errorMessage.includes('OpenAI API')) {
          throw new Error('Analytics service is temporarily unavailable. Please try again later.');
        }
        throw new Error(`Server error: ${errorMessage}`);
      }
      
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error('Error completing interview with analytics:', error);
    throw error;
  }
};

// Legacy function for backward compatibility (deprecated)
export const generateInterviewAnalytics = async (
  interviewId: string,
  conversationId: string,
  forceReprocess = false
): Promise<any> => {
  console.warn('generateInterviewAnalytics is deprecated. Use completeInterviewWithAnalytics instead.');
  throw new Error('This endpoint has been deprecated. Please use the new simplified analytics approach.');
};

// Fetch user interview progress with analytics
export const fetchUserInterviewProgress = async (progressId: string): Promise<any> => {
  try {
    const token = localStorage.getItem('access_token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/progress/${progressId}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch progress: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching progress ${progressId}:`, error);
    throw error;
  }
};

// Convert interviews to the format expected by the InterviewCard component
export const convertInterviewToCardFormat = (interview: Interview, userProgress?: any) => {
  return {
    id: interview.id,
    company: interview.company || 'CasePrep',
    logo: getCompanyLogo(interview.company || ''),
    title: interview.title,
    description: interview.short_description || '',
    image_url: interview.image_url,
    buttonText: interview.demo ? "Try Demo" : "Start Interview",
    case_type: determineCaseType(interview),
    difficulty: interview.difficulty,
    duration: estimateDuration(interview),
    progress_status: userProgress?.status || null,
    progress_data: null,
    interview_id: interview.id,
    started_at: userProgress?.started_at || null,
    completed_at: userProgress?.completed_at || null,
    questions_completed: null,
    total_questions: 5, // Default for now
    completionStatus: userProgress?.status === 'completed' ? 'Completed' : null,
    isPremium: !interview.demo,
    elevenlabs_agent_id: interview.elevenlabs_agent_id,
  };
};

// Helper function to determine case type from interview content
const determineCaseType = (interview: Interview): string => {
  const titleLower = interview.title.toLowerCase();
  const descLower = (interview.short_description || '').toLowerCase();
  
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
  
  return 'Case Interview';
};

// Helper function to estimate interview duration
const estimateDuration = (interview: Interview): number => {
  // For demo interviews, return 2 minutes (limit)
  if (interview.demo) {
    return 2;
  }
  
  // For premium interviews, estimate based on difficulty
  switch (interview.difficulty.toLowerCase()) {
    case 'easy':
      return 20;
    case 'medium':
      return 30;
    case 'hard':
      return 45;
    default:
      return 30;
  }
};

// Helper function to get company logo based on company name
const getCompanyLogo = (company: string): string => {
  const normalizedCompany = company.toLowerCase();

  const companyLogos: Record<string, string> = {
    "mckinsey & company": "/assets/interviewCards/Logos/Mckinsey.svg",
    "mckinsey": "/assets/interviewCards/Logos/Mckinsey.svg",
    "bcg": "/assets/interviewCards/Logos/BCG.svg",
    "boston consulting group": "/assets/interviewCards/Logos/BCG.svg",
    "bain & company": "/assets/interviewCards/Logos/Bain.svg",
    "bain": "/assets/interviewCards/Logos/Bain.svg",
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

  return (
    companyLogos[normalizedCompany] ||
    "/assets/interviewCards/Logos/BCG.svg" // Default logo
  );
}; 