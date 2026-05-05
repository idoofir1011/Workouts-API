import axios from "axios";

// Create a configured axios instance
export const api = axios.create({
    baseURL: "http://localhost:8000",
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor to add the auth token to every request
api.interceptors.request.use((config) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth Functions
export const login = async (formData: FormData) => {
    const params = new URLSearchParams();
    formData.forEach((value, key) => params.append(key, value as string));

    const response = await api.post("/auth/login", params, {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
    });
    return response.data;
};

export const register = async (userData: any) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
};

// Splits
export const fetchSplits = async (skip = 0, limit = 10, search = "") => {
    const response = await api.get(`/splits?limit=${limit}&skip=${skip}&search=${search}`);
    return response.data;
};

export const createSplit = async (splitData: any) => {
    const response = await api.post("/splits/", splitData);
    return response.data;
};

// Workouts
export const fetchWorkouts = async (splitId: number, skip = 0, limit = 10, search = "") => {
    const response = await api.get(`/splits/${splitId}/workouts?limit=${limit}&skip=${skip}&search=${search}`);
    return response.data;
};

export const createWorkout = async (splitId: number, workoutData: any) => {
    const response = await api.post(`/splits/${splitId}/workouts/`, workoutData);
    return response.data;
};
