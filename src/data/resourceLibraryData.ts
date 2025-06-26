export interface ResourceItem {
  id: string;
  title: string;
  url: string;
  description?: string;
  type: 'pdf' | 'link' | 'video' | 'book' | 'tool';
  institution?: string;
  year?: number;
  tags?: string[];
}

export interface ResourceSection {
  id: string;
  title: string;
  description: string;
  icon: string;
  items: ResourceItem[];
  featured?: boolean;
}

export interface ResourceLibrary {
  title: string;
  description: string;
  sections: ResourceSection[];
}

export const resourceLibrary: ResourceLibrary = {
  title: "The CasePrepared Resource Library",
  description: "Everything you need to master consulting interviews—handpicked books, MBA casebooks, videos, and tools from top sources.",
  sections: [
    {
      id: "foundational-guides",
      title: "Foundational Guides & Frameworks",
      description: "Essential resources covering core case interview frameworks and methodologies.",
      icon: "framework",
      featured: true,
      items: [
        {
          id: "case-in-point-2013",
          title: "Case in Point (2013, Cosentino)",
          url: "https://club.zriveapp.com/app/uploads/2023/04/Case-in-Point-2013.pdf",
          description: "The classic go-to book for learning case interview structures and frameworks.",
          type: "pdf",
          tags: ["frameworks", "foundations", "structures", "classic"]
        },
        {
          id: "victor-cheng-frameworks",
          title: "Case Interview Frameworks (Victor Cheng)",
          url: "https://caseinterview.com/case_interview_frameworks.pdf",
          description: "PDF summary of core frameworks used in case interviews.",
          type: "pdf",
          tags: ["frameworks", "cheat sheet", "summary", "core concepts"]
        },
        {
          id: "igotanoffer-examples",
          title: "I Got An Offer – Case Interview Examples & Guides",
          url: "https://igotanoffer.com/blogs/mckinsey-case-interview-blog/case-interview-examples",
          description: "Offers examples, tips, and complete cases by firm.",
          type: "link",
          tags: ["examples", "firm-specific", "tips", "comprehensive"]
        },
        {
          id: "princeton-career-guide",
          title: "Princeton Career Development Guide",
          url: "https://careerdevelopment.princeton.edu/guides/interviews/case-interview-preparation",
          description: "Structured guide on types of case interviews and how to prepare.",
          type: "link",
          institution: "Princeton University",
          tags: ["preparation", "types", "structured", "university guide"]
        },
        {
          id: "bcg-official-prep",
          title: "BCG Official Preparation Portal",
          url: "https://careers.bcg.com/global/en/case-interview-preparation",
          description: "Interactive cases and video resources from BCG itself.",
          type: "link",
          institution: "Boston Consulting Group",
          tags: ["official", "interactive", "video", "BCG"]
        }
      ]
    },
    {
      id: "mba-casebooks",
      title: "MBA Casebooks (Free PDFs)",
      description: "In-depth case practice examples compiled by top MBA consulting clubs.",
      icon: "book",
      featured: true,
      items: [
        {
          id: "wharton-2017",
          title: "Wharton Casebook (2017)",
          url: "https://careerinconsulting.com/wp-content/uploads/2019/12/6.-Wharton-Casebook-2017.pdf",
          description: "Comprehensive collection of practice cases compiled by Wharton MBA students with detailed solutions and frameworks.",
          type: "pdf",
          institution: "University of Pennsylvania - Wharton",
          year: 2017,
          tags: ["case studies", "consulting", "MBA", "practice"]
        },
        {
          id: "fuqua-duke-2017",
          title: "Fuqua/Duke Casebook (2017)",
          url: "https://careerinconsulting.com/wp-content/uploads/2019/12/11.-Fuqua-Case-book-2017.pdf",
          description: "Duke's MBA consulting club casebook featuring real consulting case studies with step-by-step solution approaches.",
          type: "pdf",
          institution: "Duke University - Fuqua",
          year: 2017,
          tags: ["case studies", "consulting", "MBA", "practice"]
        },
        {
          id: "stern-nyu-2018",
          title: "Stern NYU Casebook (2018)",
          url: "https://s3.amazonaws.com/thinkific/file_uploads/163260/attachments/204/36e/e0f/Stern_2018.pdf",
          description: "NYU Stern's comprehensive casebook with diverse industry cases and detailed analytical frameworks.",
          type: "pdf",
          institution: "New York University - Stern",
          year: 2018,
          tags: ["case studies", "consulting", "MBA", "practice"]
        },
        {
          id: "sloan-mit-2015",
          title: "Sloan MIT Casebook (2015)",
          url: "https://s3.amazonaws.com/thinkific/file_uploads/163260/attachments/4b0/6b7/2fc/Sloan_2015.pdf",
          description: "MIT Sloan's technical and analytical approach to case interviews with quantitative problem-solving focus.",
          type: "pdf",
          institution: "MIT - Sloan",
          year: 2015,
          tags: ["case studies", "consulting", "MBA", "practice"]
        },
        {
          id: "yale-2013",
          title: "Yale Casebook (2013)",
          url: "https://s3.amazonaws.com/thinkific/file_uploads/163260/attachments/219/c95/660/Yale_2013.pdf",
          description: "Yale's structured approach to case preparation with emphasis on logical thinking and clear communication.",
          type: "pdf",
          institution: "Yale University",
          year: 2013,
          tags: ["case studies", "consulting", "MBA", "practice"]
        },
        {
          id: "lbs-2013",
          title: "LBS (London Business School) Casebook (2013)",
          url: "https://www.wallstreetoasis.com/files/lbs_2013.pdf",
          description: "International perspective on consulting cases from London Business School with European market focus.",
          type: "pdf",
          institution: "London Business School",
          year: 2013,
          tags: ["case studies", "consulting", "MBA", "practice", "international"]
        },
        {
          id: "columbia-mba",
          title: "Columbia MBA Casebook",
          url: "https://managementconsulted.com/app/uploads/2019/06/Columbia-Business-School-MBA-Casebook.pdf",
          description: "Columbia's business strategy-focused casebook with real-world consulting scenarios and solutions.",
          type: "pdf",
          institution: "Columbia Business School",
          tags: ["case studies", "consulting", "MBA", "practice"]
        },
        {
          id: "columbia-2011-alt",
          title: "Columbia MBA Casebook (2011 Alt)",
          url: "https://elizabethcloos.wordpress.com/wp-content/uploads/2018/04/columbia-2011.pdf",
          description: "Alternative Columbia casebook with additional practice cases and diverse industry examples.",
          type: "pdf",
          institution: "Columbia Business School",
          year: 2011,
          tags: ["case studies", "consulting", "MBA", "practice"]
        },
        {
          id: "hacking-case-library",
          title: "Hacking the Case Interview – MBA Casebook Library",
          url: "https://www.hackingthecaseinterview.com/pages/mba-consulting-casebooks",
          description: "Comprehensive aggregator site collecting the best MBA casebooks from top universities in one place.",
          type: "link",
          tags: ["case studies", "consulting", "MBA", "practice", "aggregator"]
        }
      ]
    },
    {
      id: "firm-case-examples",
      title: "Firm-Specific Case Interview Examples",
      description: "Official practice cases and examples from top consulting firms including McKinsey, BCG, Bain, and Deloitte.",
      icon: "case",
      featured: true,
      items: [
        {
          id: "mckinsey-beautify",
          title: "McKinsey: Beautify Case",
          url: "https://www.mckinsey.com/careers/interviewing/beautify",
          description: "Assess whether a prestige cosmetics giant should upskill in-store beauty consultants to use virtual channels, boosting engagement and sales while preserving its luxury positioning.",
          type: "link",
          institution: "McKinsey & Company",
          tags: ["retail", "digital transformation", "luxury", "channel strategy", "McKinsey"]
        },
        {
          id: "mckinsey-diconsa",
          title: "McKinsey: Diconsa / Gates Foundation Case",
          url: "https://www.mckinsey.com/careers/interviewing/diconsa",
          description: "Design a low-cost financial-services model that leverages Mexico's 22,000 Diconsa rural stores so the unbanked can safely collect government benefits and transact locally.",
          type: "link",
          institution: "McKinsey & Company",
          tags: ["financial services", "emerging markets", "social impact", "distribution", "McKinsey"]
        },
        {
          id: "mckinsey-electrolight",
          title: "McKinsey: Electro-Light Case",
          url: "https://www.mckinsey.com/careers/interviewing/electrolight",
          description: "Help SuperSoda launch a low-sugar, electrolyte-rich sports drink. Scope covers market sizing, pricing, cannibalization of existing brands, production capacity, and go-to-market strategy.",
          type: "link",
          institution: "McKinsey & Company",
          tags: ["consumer goods", "market entry", "pricing", "production", "McKinsey"]
        },
        {
          id: "mckinsey-globapharm",
          title: "McKinsey: GlobaPharm Case",
          url: "https://www.mckinsey.com/careers/interviewing/globapharm",
          description: "Evaluate acquiring BioFuture to jump-start entry into biologics. Analyze capability gaps, acquisition economics, integration risk, and projected NPV versus building or partnering paths.",
          type: "link",
          institution: "McKinsey & Company",
          tags: ["M&A", "pharmaceuticals", "biologics", "acquisition", "McKinsey"]
        },
        {
          id: "mckinsey-education",
          title: "McKinsey: Transforming a National Education System",
          url: "https://www.mckinsey.com/careers/interviewing/national-education",
          description: "Advise fictional country Loravia on boosting education quantity and quality to fuel economic growth. Work spans funding choices, teacher training, infrastructure, and outcome metrics.",
          type: "link",
          institution: "McKinsey & Company",
          tags: ["public sector", "education", "economic development", "policy", "McKinsey"]
        },
        {
          id: "mckinsey-talbot",
          title: "McKinsey: Talbot Trucks Case",
          url: "https://www.mckinsey.com/careers/interviewing/talbot-trucks",
          description: "Determine if a quality-focused OEM should invest in electric trucks to cut fleet carbon footprints. Consider battery economics, charging infrastructure, regulatory incentives, and customer willingness to pay.",
          type: "link",
          institution: "McKinsey & Company",
          tags: ["automotive", "sustainability", "electric vehicles", "investment", "McKinsey"]
        },
        {
          id: "mckinsey-conservation",
          title: "McKinsey: Conservation Forever Case",
          url: "https://www.mckinsey.com/careers/interviewing/conservation-forever",
          description: "Prioritize land- and ocean-restoration projects for an NGO fighting biodiversity loss. Tasks include scoring habitats, estimating impact per dollar, and crafting a decade-long conservation roadmap.",
          type: "link",
          institution: "McKinsey & Company",
          tags: ["non-profit", "environmental", "prioritization", "impact assessment", "McKinsey"]
        },
        {
          id: "mckinsey-interviewing",
          title: "McKinsey Interviewing Page (Shops Corp)",
          url: "https://www.mckinsey.com/careers/interviewing/shops-corporation",
          description: "Explains McKinsey's two-way interview philosophy, PEI themes, problem-solving interview format, and provides six sample cases plus tips on virtual assessments and values alignment.",
          type: "link",
          institution: "McKinsey & Company",
          tags: ["interview prep", "PEI", "problem-solving", "McKinsey"]
        },
        {
          id: "bcg-case-prep",
          title: "BCG Case-Prep Portal",
          url: "https://careers.bcg.com/case-prep",
          description: "Interactive hub with self-paced practice cases, climate-strategy quiz, and guidance on structuring, analytics, and synthesis skills expected in interviews.",
          type: "link",
          institution: "Boston Consulting Group",
          tags: ["interactive", "practice cases", "climate strategy", "BCG"]
        },
        {
          id: "bcg-written-case",
          title: "BCG Written Case Example (PDF)",
          url: "http://media-publications.bcg.com/BCG-Written-Case-Example.pdf",
          description: "Walk-through of BCG's two-hour written case: how to sift documents, craft exhibits, manage time, and deliver a concise partner-level memo. Includes sample slides and scoring rubric.",
          type: "pdf",
          institution: "Boston Consulting Group",
          tags: ["written case", "time management", "memo writing", "BCG"]
        },
        {
          id: "bain-coffee",
          title: "Bain: Coffee Shop Co. Case",
          url: "https://www.bain.com/careers/interview-prep/case-library/coffee-case-study/",
          description: "Advise an entrepreneur on opening a Cambridge coffee shop. Analyze demand drivers, competitive landscape, breakeven volume, and site economics to decide go/no-go.",
          type: "link",
          institution: "Bain & Company",
          tags: ["entrepreneurship", "retail", "breakeven analysis", "Bain"]
        },
        {
          id: "bain-fashionco",
          title: "Bain: FashionCo. Case",
          url: "https://www.bain.com/careers/interview-prep/case-library/fashioco-case-study/",
          description: "Diagnose five-year revenue decline at a women's fashion retailer and recommend growth levers—product mix, channel strategy, pricing, and cost optimization—before an imminent board meeting.",
          type: "link",
          institution: "Bain & Company",
          tags: ["retail", "turnaround", "growth strategy", "Bain"]
        },
        {
          id: "bain-associate-video",
          title: "Bain: Associate-Consultant Mock Interview (Video)",
          url: "https://www.bain.com/careers/interview-prep/case-interview/associate-consultant-practice-case-interview/",
          description: "Full recording of a Bain interviewer and candidate solving a profitability case, with commentary on hypothesis-driven thinking, math, and synthesis.",
          type: "video",
          institution: "Bain & Company",
          tags: ["mock interview", "profitability", "hypothesis-driven", "Bain"]
        },
        {
          id: "bain-consultant-video",
          title: "Bain: Consultant Practice-Case Video",
          url: "https://www.bain.com/careers/interview-prep/case-interview/cons-video/",
          description: "Shows senior-level case walk-through, highlighting advanced probing, creativity, and MECE structuring expected from experienced hires.",
          type: "video",
          institution: "Bain & Company",
          tags: ["senior level", "advanced probing", "MECE", "Bain"]
        },
        {
          id: "bain-written-guide",
          title: "Bain: Written Case Interview Guide",
          url: "http://www.bain.com/careers/interview-preparation/written-case-interview.aspx",
          description: "Details Bain's 55-minute written case format, tools allowed, and best practices for data interpretation, slide design, and executive summaries.",
          type: "link",
          institution: "Bain & Company",
          tags: ["written case", "data interpretation", "slide design", "Bain"]
        },
        {
          id: "deloitte-agency-v",
          title: "Deloitte: Agency V (Strategy UG/1)",
          url: "http://caseinterviewprep.deloitte.com/cases/strategy/ug/1",
          description: "Restore trust and morale at a 300,000-employee federal agency after scandals; craft transformation roadmap covering governance, communications, and performance metrics.",
          type: "link",
          institution: "Deloitte",
          tags: ["public sector", "transformation", "governance", "Deloitte"]
        },
        {
          id: "deloitte-recreation",
          title: "Deloitte: Recreation Unlimited (Strategy UG/3)",
          url: "http://caseinterviewprep.deloitte.com/cases/strategy/ug/3",
          description: "Help a global sportswear maker regain market share by upgrading digital customer experience and e-commerce capabilities.",
          type: "link",
          institution: "Deloitte",
          tags: ["digital transformation", "e-commerce", "market share", "Deloitte"]
        },
        {
          id: "deloitte-benefit-agency",
          title: "Deloitte: Benefit Agency (Strategy UG/2)",
          url: "http://caseinterviewprep.deloitte.com/cases/strategy/ug/2",
          description: "Optimize service delivery and financial-assistance programs for vulnerable populations through process redesign and tech modernization.",
          type: "link",
          institution: "Deloitte",
          tags: ["public sector", "process optimization", "technology", "Deloitte"]
        },
        {
          id: "deloitte-cargo-protection",
          title: "Deloitte: Civil Cargo Protection Bureau (Strategy ADV/3)",
          url: "http://caseinterviewprep.deloitte.com/cases/strategy/adv/3",
          description: "Advise on securing US non-military cargo routes post-9/11, balancing regulatory oversight with operational efficiency.",
          type: "link",
          institution: "Deloitte",
          tags: ["security", "logistics", "regulatory", "Deloitte"]
        },
        {
          id: "monitor-footloose",
          title: "Monitor Deloitte: Footloose Case (PDF)",
          url: "https://d3no4ktch0fdq4.cloudfront.net/public/course/files/Monitor_Written_Case_Footloose.pdf",
          description: "Written case on US work-boot market; analyze sub-categories, competitor positioning, and recommend growth plan for a private-equity-backed brand.",
          type: "pdf",
          institution: "Monitor Deloitte",
          tags: ["written case", "retail", "competitive analysis", "Monitor"]
        },
        {
          id: "accenture-workbook",
          title: "Accenture Case Interview Workbook (PDF)",
          url: "https://d3no4ktch0fdq4.cloudfront.net/public/course/files/Accenture_Case_Interview_Workbook.pdf",
          description: "24-page primer covering case formats, interviewer expectations, and sample profitability, market-entry, and ops cases with answer frameworks.",
          type: "pdf",
          institution: "Accenture",
          tags: ["case formats", "interviewer expectations", "frameworks", "Accenture"]
        },
        {
          id: "oc-c-leisure",
          title: "OC&C: Leisure Clubs Case (PDF)",
          url: "https://d3no4ktch0fdq4.cloudfront.net/public/course/files/OC_C_-_Leisure_clubs.pdf",
          description: "Data-interpretation case: decide whether a UK hotel chain should divest, expand, or acquire in the health-club sector based on market trends.",
          type: "pdf",
          institution: "OC&C Strategy Consultants",
          tags: ["data interpretation", "M&A", "hospitality", "OC&C"]
        },
        {
          id: "oc-c-spirits",
          title: "OC&C: Imported Spirits Case (PDF)",
          url: "https://d3no4ktch0fdq4.cloudfront.net/public/course/files/OC_C_-_Imported_spirits.pdf",
          description: "Diagnose slowing growth and shrinking margins of a whisky distributor in an emerging market and craft strategic turnaround options.",
          type: "pdf",
          institution: "OC&C Strategy Consultants",
          tags: ["turnaround", "consumer goods", "emerging markets", "OC&C"]
        },
        {
          id: "oliver-wyman-wumbleworld",
          title: "Oliver Wyman: Wumbleworld Case",
          url: "http://www.oliverwyman.com/careers/apply/case-studies/wumbleworld.html",
          description: "Classic profitability case asking whether to invest in a struggling theme-park operator; key issues: attendance, pricing, cost control.",
          type: "link",
          institution: "Oliver Wyman",
          tags: ["profitability", "entertainment", "investment", "Oliver Wyman"]
        },
        {
          id: "oliver-wyman-aqualine",
          title: "Oliver Wyman: Aqualine Case",
          url: "http://www.oliverwyman.com/careers/apply/case-studies/aqualine.html",
          description: "Archived operations case about a water-treatment firm aiming to cut costs and improve plant uptime amid rising demand.",
          type: "link",
          institution: "Oliver Wyman",
          tags: ["operations", "cost reduction", "manufacturing", "Oliver Wyman"]
        },
        {
          id: "kearney-promotion",
          title: "Kearney: Promotion-Planning Case",
          url: "https://www.atkearney.com/working-here/ace-the-interview/case-example-promotion-planning",
          description: "Step-by-step flowchart shows how to hypothesize, test, and synthesize recommendations for optimizing a retailer's promotional calendar.",
          type: "link",
          institution: "A.T. Kearney",
          tags: ["promotion planning", "retail", "optimization", "Kearney"]
        },
        {
          id: "kearney-casebook",
          title: "A.T. Kearney Case Book (PDF)",
          url: "https://d3no4ktch0fdq4.cloudfront.net/public/course/files/ATK.pdf",
          description: "35-page handbook with firm overview plus practice cases on market sizing, M&A synergy, and operations—complete with exhibit examples and scoring tips.",
          type: "pdf",
          institution: "A.T. Kearney",
          tags: ["market sizing", "M&A", "operations", "Kearney"]
        },
        {
          id: "strategy-case-study",
          title: "Strategy& (PwC): Case-Study Deck (PDF)",
          url: "https://d3no4ktch0fdq4.cloudfront.net/public/course/files/Strategy_Case_Study.pdf",
          description: "Slides explain Strategy&'s consulting approach and provide a mock market-entry case with data charts, prompting candidates to craft high-impact recommendations.",
          type: "pdf",
          institution: "Strategy& (PwC)",
          tags: ["market entry", "consulting approach", "data analysis", "Strategy&"]
        },
        {
          id: "capital-one-guide",
          title: "Capital One: Business-Analyst Case Guide",
          url: "https://jobs.capitalone.co.uk/business-analyst-case-study-guide",
          description: "Defines Capital One's case-interview format, competency areas, and includes downloadable practice case plus video for quantitative, conceptual, and communication skill prep.",
          type: "link",
          institution: "Capital One",
          tags: ["business analyst", "quantitative", "communication", "Capital One"]
        }
      ]
    }
  ]
};

// Helper functions to get specific sections or featured content
export const getMBACasebooks = (): ResourceSection => {
  return resourceLibrary.sections.find(section => section.id === "mba-casebooks")!;
};

export const getFeaturedResources = (): ResourceItem[] => {
  return resourceLibrary.sections
    .filter(section => section.featured)
    .flatMap(section => section.items);
};

export const getResourceSectionById = (id: string): ResourceSection | undefined => {
  return resourceLibrary.sections.find(section => section.id === id);
};

export const getAllResourceSections = (): ResourceSection[] => {
  return resourceLibrary.sections;
}; 