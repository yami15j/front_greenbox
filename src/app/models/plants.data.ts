export interface TimelineAiAnalysis {
  healthScore:     number;
  confidence:      number;
  status:          string;
  observations:    string[];
  recommendations: string[];
  userNote?:       string;
  analyzedAt:      string;
}

export interface TimelineEvent {
  date: string;
  description: string;
  imageUrl: string;
  progress?: number;
  id?: any;
  photoId?: number;
  registeredAt?: string;
  aiAnalysis?: TimelineAiAnalysis | null;
}

export interface Plantprofile {
  id: string;
  name: string;
  type: string;
  icon: string;
  description: string;
  imageUrl: string;
  optimalConditions: {
    tempMin: number;
    tempMax: number;
    humMin: number;
    humMax: number;
    lightMin: number;
    lightMax: number;
    waterMin: number;
  };
  growthTime: string;
  difficulty: 'Fácil' | 'Intermedio' | 'Avanzado';
  benefits: string[];
  isActive?: boolean;
  daysSincePlanting?: number;
  timeline?: TimelineEvent[];
  taxonomy?: {
    reino: string;
    division: string;
    clase: string;
    orden: string;
    familia: string;
    genero: string;
    especie: string;
  };
}

export const PLANT_PROFILES: Plantprofile[] = [];
