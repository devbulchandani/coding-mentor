// User types
export interface User {
  id: string;
  email: string;
  name: string;
}

// Auth types
export interface AuthResponse {
  token: string;
  userId: string;
  email: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

// Plan types
export interface LearningPlan {
  id: string;
  title: string;
  subtitle?: string;
  tech: string;
  durationDays: number;
  skillLevel: string;
  projectName?: string;
  projectDescription?: string;
  githubUrl?: string;
  milestones?: Milestone[];
}

export interface PlanRequest {
  technology: string;
  duration: number;
  skillLevel: string;
}

// Milestone types
export interface Milestone {
  id: number;
  sequenceNumber: number;
  title: string;
  description?: string;
  learningObjectives?: string;
  completed: boolean;
}

export interface MilestoneNotes {
  id: number;
  milestoneId: number;
  markdownContent: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
}

// Chat types
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  learningPlanId: string;
  message: string;
  repoUrl?: string;
}

// Verification types
export interface VerificationResult {
  completed: boolean;
  feedback: string;
}

// Store types
export interface AppState {
  user: User | null;
  currentPlan: LearningPlan | null;
  milestones: Milestone[];
  notifications: any[];
  repoUrl: string;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  setCurrentPlan: (plan: LearningPlan | null) => void;
  setRepoUrl: (url: string) => void;
  setMilestones: (milestones: Milestone[]) => void;
  updateMilestoneStatus: (id: number, status: boolean) => void;
  voicePlanId: string | undefined;
  voiceMilestoneId: number | undefined;
  setVoiceContext: (planId: string, milestoneId: number) => void;
}

// API Error types
export interface ApiError {
  response?: {
    status: number;
    data?: {
      message?: string;
      error?: string;
    };
  };
  request?: any;
  message?: string;
}
