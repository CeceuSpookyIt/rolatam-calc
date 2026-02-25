import { PresetModel } from './preset-model';

export interface SharedBuildMetrics {
  dps: number;
  maxDamage: number;
  minDamage: number;
  aspd: number;
  hitPerSecs: number;
  totalHit: number;
  criRate: number;
  criDmg: number;
  vct: number;
  fct: number;
  acd: number;
  hp: number;
  sp: number;
}

export interface SharedBuild {
  id: string;
  name: string;
  classId: number;
  model: PresetModel;
  monsterId: number | null;
  monsterName: string | null;
  skillName: string | null;
  metrics: SharedBuildMetrics | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
  likeCount?: number;
  liked?: boolean;
}

export interface SharedBuildListResponse {
  items: SharedBuild[];
  totalItem: number;
  skip: number;
  take: number;
}

export interface CreateSharedBuildRequest {
  name: string;
  model: PresetModel;
  monsterId?: number;
  monsterName?: string;
  skillName?: string;
  metrics?: SharedBuildMetrics;
}

export interface UpdateSharedBuildRequest {
  name?: string;
  model?: PresetModel;
  monsterId?: number;
  monsterName?: string;
  skillName?: string;
  metrics?: SharedBuildMetrics;
}
