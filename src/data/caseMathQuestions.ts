export interface CaseMathQuestion {
  id: string;
  category: {
    emoji: string;
    name: string;
  };
  question: string;
  answer: number;
  unit?: string; // e.g., "$", "%", "units"
  difficulty: 'easy' | 'medium' | 'hard';
}

export const caseMathQuestions: CaseMathQuestion[] = [
  // Revenue & Profitability Questions
  {
    id: "rev_profit_1",
    category: {
      emoji: "📈",
      name: "Revenue & Profitability"
    },
    question: "Your client sells electric scooters at $600 each. Manufacturing costs are $300, marketing $50 per unit, and overhead is $2M/year. They sell 10,000 scooters annually. What's the annual profit?",
    answer: 500000,
    unit: "$",
    difficulty: "hard"
  },
  {
    id: "rev_profit_2",
    category: {
      emoji: "📈",
      name: "Revenue & Profitability"
    },
    question: "A company has revenues of $50M and a profit margin of 15%. What is their profit?",
    answer: 7500000,
    unit: "$",
    difficulty: "easy"
  },
  {
    id: "rev_profit_3",
    category: {
      emoji: "📈",
      name: "Revenue & Profitability"
    },
    question: "If a product costs $80 to make and sells for $120, what is the profit margin percentage?",
    answer: 33.33,
    unit: "%",
    difficulty: "medium"
  },
  {
    id: "rev_profit_4",
    category: {
      emoji: "📈",
      name: "Revenue & Profitability"
    },
    question: "A subscription service charges $15/month. If they have 5,000 subscribers, what's their monthly revenue?",
    answer: 75000,
    unit: "$",
    difficulty: "easy"
  },
  {
    id: "rev_profit_5",
    category: {
      emoji: "📈",
      name: "Revenue & Profitability"
    },
    question: "A retailer buys products for $40 and sells them for $60. What's the markup percentage?",
    answer: 50,
    unit: "%",
    difficulty: "easy"
  },
  
  // Operations / Capacity Questions
  {
    id: "ops_capacity_1",
    category: {
      emoji: "📦",
      name: "Operations / Capacity"
    },
    question: "A factory can produce 1,200 units/day at full capacity. It's currently producing 900. What's the utilization rate?",
    answer: 75,
    unit: "%",
    difficulty: "easy"
  },
  {
    id: "ops_capacity_2",
    category: {
      emoji: "📦",
      name: "Operations / Capacity"
    },
    question: "A warehouse has 50,000 sq ft and each product requires 25 sq ft of storage. What's the maximum capacity?",
    answer: 2000,
    unit: "units",
    difficulty: "easy"
  },
  {
    id: "ops_capacity_3",
    category: {
      emoji: "📦",
      name: "Operations / Capacity"
    },
    question: "A production line runs 16 hours/day and produces 120 units/hour. How many units are produced daily?",
    answer: 1920,
    unit: "units",
    difficulty: "easy"
  },
  {
    id: "ops_capacity_4",
    category: {
      emoji: "📦",
      name: "Operations / Capacity"
    },
    question: "A call center has 50 agents. Each handles 25 calls per day. How many total calls are handled daily?",
    answer: 1250,
    unit: "calls",
    difficulty: "easy"
  },
  {
    id: "ops_capacity_5",
    category: {
      emoji: "📦",
      name: "Operations / Capacity"
    },
    question: "A restaurant serves 200 customers on weekdays and 350 on weekends. How many customers per week?",
    answer: 1700,
    unit: "customers",
    difficulty: "medium"
  },

  // Financial Calculations
  {
    id: "financial_1",
    category: {
      emoji: "💰",
      name: "Financial Calculations"
    },
    question: "An investment of $100,000 grows at 8% annually. What's the value after 2 years?",
    answer: 116640,
    unit: "$",
    difficulty: "medium"
  },
  {
    id: "financial_2",
    category: {
      emoji: "💰",
      name: "Financial Calculations"
    },
    question: "A company has $500K in fixed costs and variable costs of $20 per unit. At what volume do they break even if price is $45?",
    answer: 20000,
    unit: "units",
    difficulty: "hard"
  },
  {
    id: "financial_3",
    category: {
      emoji: "💰",
      name: "Financial Calculations"
    },
    question: "A loan of $10,000 at 5% simple interest for 3 years. What's the total interest?",
    answer: 1500,
    unit: "$",
    difficulty: "medium"
  },
  {
    id: "financial_4",
    category: {
      emoji: "💰",
      name: "Financial Calculations"
    },
    question: "A company's revenue grew from $2M to $2.6M. What's the growth rate percentage?",
    answer: 30,
    unit: "%",
    difficulty: "easy"
  },

  // Math & Logic Questions
  {
    id: "math_1",
    category: {
      emoji: "🔢",
      name: "Math & Logic"
    },
    question: "What's 15% of 2,400?",
    answer: 360,
    unit: "",
    difficulty: "easy"
  },
  {
    id: "math_2",
    category: {
      emoji: "🔢",
      name: "Math & Logic"
    },
    question: "If sales increased 25% from 800 units, what's the new total?",
    answer: 1000,
    unit: "units",
    difficulty: "easy"
  },
  {
    id: "math_3",
    category: {
      emoji: "🔢",
      name: "Math & Logic"
    },
    question: "A team of 8 people completes a project in 12 days. How many days for 6 people?",
    answer: 16,
    unit: "days",
    difficulty: "medium"
  },
  {
    id: "math_4",
    category: {
      emoji: "🔢",
      name: "Math & Logic"
    },
    question: "What's 3/4 expressed as a percentage?",
    answer: 75,
    unit: "%",
    difficulty: "easy"
  },
  {
    id: "math_5",
    category: {
      emoji: "🔢",
      name: "Math & Logic"
    },
    question: "If 40% of a number is 120, what's the number?",
    answer: 300,
    unit: "",
    difficulty: "medium"
  },

  // Additional Revenue & Profitability Questions
  {
    id: "rev_profit_6",
    category: {
      emoji: "📈",
      name: "Revenue & Profitability"
    },
    question: "A SaaS company has 1,200 customers paying $25/month. 5% churn monthly. What's the monthly lost revenue?",
    answer: 1500,
    unit: "$",
    difficulty: "medium"
  },
  {
    id: "rev_profit_7",
    category: {
      emoji: "📈",
      name: "Revenue & Profitability"
    },
    question: "A coffee shop sells 300 cups daily at $4 each. Rent is $3,000/month. What's daily profit if other costs are $600/day?",
    answer: 300,
    unit: "$",
    difficulty: "hard"
  },
  {
    id: "rev_profit_8",
    category: {
      emoji: "📈",
      name: "Revenue & Profitability"
    },
    question: "If gross margin is 60% and revenue is $800K, what are the variable costs?",
    answer: 320000,
    unit: "$",
    difficulty: "medium"
  },
  {
    id: "rev_profit_9",
    category: {
      emoji: "📈",
      name: "Revenue & Profitability"
    },
    question: "A company's EBITDA is $5M and depreciation is $800K. What's the EBIT?",
    answer: 4200000,
    unit: "$",
    difficulty: "medium"
  },
  {
    id: "rev_profit_10",
    category: {
      emoji: "📈",
      name: "Revenue & Profitability"
    },
    question: "A retailer has a 40% markup on cost. If selling price is $350, what's the cost?",
    answer: 250,
    unit: "$",
    difficulty: "medium"
  },

  // Additional Operations & Capacity Questions
  {
    id: "ops_capacity_6",
    category: {
      emoji: "📦",
      name: "Operations / Capacity"
    },
    question: "A delivery fleet of 20 trucks each delivers 15 packages/hour. How many packages in an 8-hour shift?",
    answer: 2400,
    unit: "packages",
    difficulty: "easy"
  },
  {
    id: "ops_capacity_7",
    category: {
      emoji: "📦",
      name: "Operations / Capacity"
    },
    question: "A machine operates 22 hours/day with 2 hours downtime. What's the uptime percentage?",
    answer: 92,
    unit: "%",
    difficulty: "easy"
  },
  {
    id: "ops_capacity_8",
    category: {
      emoji: "📦",
      name: "Operations / Capacity"
    },
    question: "A server farm runs at 80% capacity. If max capacity is 50,000 transactions/hour, what's current volume?",
    answer: 40000,
    unit: "transactions/hour",
    difficulty: "easy"
  },
  {
    id: "ops_capacity_9",
    category: {
      emoji: "📦",
      name: "Operations / Capacity"
    },
    question: "A manufacturing line has 95% efficiency. If theoretical output is 1,000 units/day, what's actual output?",
    answer: 950,
    unit: "units/day",
    difficulty: "easy"
  },
  {
    id: "ops_capacity_10",
    category: {
      emoji: "📦",
      name: "Operations / Capacity"
    },
    question: "Quality control rejects 3% of products. If 10,000 units are produced, how many pass inspection?",
    answer: 9700,
    unit: "units",
    difficulty: "easy"
  },

  // Additional Financial Calculations
  {
    id: "financial_5",
    category: {
      emoji: "💰",
      name: "Financial Calculations"
    },
    question: "A startup raised $2M at a $8M pre-money valuation. What percentage do investors own?",
    answer: 20,
    unit: "%",
    difficulty: "medium"
  },
  {
    id: "financial_6",
    category: {
      emoji: "💰",
      name: "Financial Calculations"
    },
    question: "ROI is 25% and initial investment was $400K. What's the total return amount?",
    answer: 100000,
    unit: "$",
    difficulty: "medium"
  },
  {
    id: "financial_7",
    category: {
      emoji: "💰",
      name: "Financial Calculations"
    },
    question: "A bond pays 6% annually on $50K face value. What's the annual interest payment?",
    answer: 3000,
    unit: "$",
    difficulty: "easy"
  },
  {
    id: "financial_8",
    category: {
      emoji: "💰",
      name: "Financial Calculations"
    },
    question: "Working capital is $800K and current liabilities are $300K. What are current assets?",
    answer: 1100000,
    unit: "$",
    difficulty: "medium"
  },
  {
    id: "financial_9",
    category: {
      emoji: "💰",
      name: "Financial Calculations"
    },
    question: "Free cash flow is $2.5M and capex is $800K. What's the operating cash flow?",
    answer: 3300000,
    unit: "$",
    difficulty: "medium"
  },

  // Additional Math & Logic Questions
  {
    id: "math_6",
    category: {
      emoji: "🔢",
      name: "Math & Logic"
    },
    question: "A number increases by 20%, then decreases by 20%. If the final number is 96, what was the original?",
    answer: 100,
    unit: "",
    difficulty: "hard"
  },
  {
    id: "math_7",
    category: {
      emoji: "🔢",
      name: "Math & Logic"
    },
    question: "What's 18% of 350?",
    answer: 63,
    unit: "",
    difficulty: "easy"
  },
  {
    id: "math_8",
    category: {
      emoji: "🔢",
      name: "Math & Logic"
    },
    question: "A discount of 30% reduces price from $200 to what amount?",
    answer: 140,
    unit: "$",
    difficulty: "easy"
  },
  {
    id: "math_9",
    category: {
      emoji: "🔢",
      name: "Math & Logic"
    },
    question: "The ratio of men to women is 3:2. In a group of 150 people, how many are women?",
    answer: 60,
    unit: "people",
    difficulty: "medium"
  },
  {
    id: "math_10",
    category: {
      emoji: "🔢",
      name: "Math & Logic"
    },
    question: "If productivity increases 15% and current output is 800 units/day, what's the new output?",
    answer: 920,
    unit: "units/day",
    difficulty: "easy"
  }
];

// Helper function to get random questions
export const getRandomQuestions = (count: number = 10): CaseMathQuestion[] => {
  const shuffled = [...caseMathQuestions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, caseMathQuestions.length));
};

// Helper function to get questions by category
export const getQuestionsByCategory = (categoryName: string): CaseMathQuestion[] => {
  return caseMathQuestions.filter(q => q.category.name === categoryName);
};

// Helper function to get a randomized success percentage based on difficulty
export const getDifficultyBasedSuccessRate = (difficulty: 'easy' | 'medium' | 'hard'): number => {
  let baseRate: number;
  let variance: number;
  
  switch (difficulty) {
    case 'easy':
      baseRate = 78; // Base rate for easy questions
      variance = 12; // Can vary ±12% (66-90%)
      break;
    case 'medium':
      baseRate = 65; // Base rate for medium questions  
      variance = 10; // Can vary ±10% (55-75%)
      break;
    case 'hard':
      baseRate = 58; // Base rate for hard questions
      variance = 6; // Can vary ±6% (52-64%)
      break;
  }
  
  // Generate random variance within the range
  const randomVariance = (Math.random() - 0.5) * 2 * variance;
  const finalRate = Math.round(baseRate + randomVariance);
  
  // Ensure it's always above 50% as requested
  return Math.max(51, finalRate);
}; 