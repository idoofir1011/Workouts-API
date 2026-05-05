export interface UserOut {
    id: number;
    email: string;
    username: string;
    created_at: string;
}

export interface SplitBase {
    name: string;
    description?: string;
}

export interface SplitOut extends SplitBase {
    id: number;
    owner_id: number;
    created_at: string;
    owner: UserOut;
}

export interface WorkoutBase {
    name: string;
    sets?: number;
    reps?: number;
    weight?: number;
}

export interface WorkoutOut extends WorkoutBase {
    id: number;
    owner_id: number;
    split_id?: number;
    created_at: string;
    owner?: UserOut;
}

export interface Token {
    access_token: string;
    token_type: string;
}

export interface StatsData {
    totalVolume: number;
    totalSets: number;
    totalReps: number;
}
