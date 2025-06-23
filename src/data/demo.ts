export interface DemoInterview {
  id: string;
  title: string;
  company: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  case_type: string;
  short_description: string;
  long_description: string;
  image_url: string;
  elevenlabs_agent_id: string;
  demo: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const DEMO_INTERVIEWS: DemoInterview[] = [
  {
    id: "853b8417-34b0-484d-b55e-ffb3131a950e",
    title: "FiveLadies - McKinsey Profitability Case",
    company: "McKinsey & Company",
    difficulty: "Easy",
    case_type: "Profitability",
    short_description: "FiveLadies is a national food chain, looking for advice to improve their profitability.",
    long_description: "A national fast food restaurant chain called Five Ladies, which sells burgers, reached out to you for advice on improving profitability; the chain reached $2.4 billion in sales in 2020 and has 2,000 restaurants in the United States, 75% of which are owned by the company and 25% are operated by franchisees.",
    image_url: "https://geoscope-sa.com/wp-content/uploads/2024/12/Fast-food-South-Africa-Strategic-Approaches-Consumer-data-Accessibility-Studies.webp",
    elevenlabs_agent_id: "agent_01jycjg3mgfxnsa2f8spfvb1j1",
    demo: true,
    is_active: true,
    created_at: "2025-06-22T19:46:14.994775",
    updated_at: "2025-06-22T19:46:14.994775"
  },
  {
    id: "a579feb3-a1dd-4a4b-a848-4e62286e9697",
    title: "Henderson Electric - Bain Revenue Growth Case",
    company: "Bain & Company",
    difficulty: "Medium",
    case_type: "Revenue Growth",
    short_description: "Henderson Electric is an HVAC company that has recently hired your team to design a revenue growth plan to boost sales.",
    long_description: "Henderson Electric offers industrial air conditioning units, maintenance services, and Internet-of-Things (IoT) enabled software to monitor the air conditioning system functionality in real time. The overall sales are $1B; however, the software revenue remains low. The CEO has hired your team to design a revenue growth plan to boost sales of their IoT-enabled software.",
    image_url: "https://cdn.britannica.com/16/249616-050-1A50A12E/HVAC-mechanical-system-technician.jpg",
    elevenlabs_agent_id: "agent_01jyckfq4mfr9b5c9z7k7314bb",
    demo: true,
    is_active: true,
    created_at: "2025-06-22T20:03:42.725396",
    updated_at: "2025-06-22T20:03:42.725396"
  },
  {
    id: "fac5050e-1989-4343-b5fe-a93fcbf1c990",
    title: "Getaway Airlines - BCG Profitability Case",
    company: "Boston Consulting Group",
    difficulty: "Medium",
    case_type: "Profitability",
    short_description: "Getaway Airlines is a U.S. passenger airline that has been experiencing low profitability.",
    long_description: "Getaway Airlines is a U.S. passenger airline that serves mostly vacation destinations. Their revenue has been increasing; however, their profits are declining. Last year, their operating profitability dropped to 10%. The CEO has invited your team to look into the issue and help them turn things around. We are in early 2020, before the pandemic.",
    image_url: "https://travelpro.com/cdn/shop/articles/shutterstock_124713472_1024x1024.jpg?v=1673545223",
    elevenlabs_agent_id: "agent_01jycjvp00fd7r4r6ef5gr3xww",
    demo: true,
    is_active: true,
    created_at: "2025-06-22T19:54:39.059753",
    updated_at: "2025-06-22T19:54:39.059753"
  }
];

// Helper function to get company logo for demo interviews
export const getDemoCompanyLogo = (company: string): string => {
  const normalizedCompany = company.toLowerCase();

  const companyLogos: Record<string, string> = {
    "mckinsey & company": "/assets/interviewCards/Logos/Mckinsey.svg",
    "mckinsey": "/assets/interviewCards/Logos/Mckinsey.svg",
    "bain & company": "/assets/interviewCards/Logos/Bain.svg",
    "bain": "/assets/interviewCards/Logos/Bain.svg",
    "boston consulting group": "/assets/interviewCards/Logos/BCG.svg",
    "bcg": "/assets/interviewCards/Logos/BCG.svg",
  };

  return (
    companyLogos[normalizedCompany] ||
    "/assets/interviewCards/Logos/BCG.svg" // Default logo
  );
};

// Convert demo interview to card format
export const convertDemoToCardFormat = (demoInterview: DemoInterview) => {
  return {
    id: demoInterview.id,
    company: demoInterview.company,
    logo: getDemoCompanyLogo(demoInterview.company),
    title: demoInterview.title,
    description: demoInterview.short_description,
    image_url: demoInterview.image_url,
    buttonText: "Try Demo",
    isPremium: false,
    demo: true,
    difficulty: demoInterview.difficulty,
    case_type: demoInterview.case_type,
    elevenlabs_agent_id: demoInterview.elevenlabs_agent_id,
    short_description: demoInterview.short_description,
    long_description: demoInterview.long_description,
  };
};

// Duration estimate for demo interviews (always 1.5 minutes for demos)
export const getDemoDuration = (): number => {
  return 1.5; // 1.5 minutes (1m 30s) for all demo interviews
}; 