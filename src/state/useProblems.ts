import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ProblemInput } from "../domain/problemSchema";

export type Problem = ProblemInput & {
  id: string;
  status: "Aberto" | "Em andamento" | "Resolvido";
  votes: number;
  createdAt: number;
};

type Store = {
  problems: Problem[];
  loaded: boolean;
  addProblem: (p: ProblemInput) => Promise<void>;
  vote: (id: string) => Promise<void>;
  setStatus: (id: string, status: Problem["status"]) => Promise<void>;
  persist: () => Promise<void>;
  load: () => Promise<void>;
  clearAll: () => Promise<void>;
};

const KEY = "@comunicaplus/problems";

// 🔹 Função de segurança para garantir que o objeto tem lat/long válidos
function isValidProblem(raw: any): raw is Problem {
  if (!raw) return false;

  const lat = raw.latitude;
  const lng = raw.longitude;

  const latOk = typeof lat === "number" && !Number.isNaN(lat);
  const lngOk = typeof lng === "number" && !Number.isNaN(lng);

  return latOk && lngOk;
}

export const useProblems = create<Store>((set, get) => ({
  problems: [],
  loaded: false,

  load: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      const parsed = raw ? JSON.parse(raw) : [];

      const arr: Problem[] = Array.isArray(parsed)
        ? parsed.filter(isValidProblem)
        : [];

      set({ problems: arr, loaded: true });
    } catch {
      set({ problems: [], loaded: true });
    }
  },

  persist: async () => {
    await AsyncStorage.setItem(KEY, JSON.stringify(get().problems));
  },

  addProblem: async (p: ProblemInput) => {
    // aqui p.latitude / p.longitude já são number por causa do zod
    const newItem: Problem = {
      ...p,
      id: Math.random().toString(36).slice(2),
      status: "Aberto",
      votes: 0,
      createdAt: Date.now(),
    };

    // ainda assim garantimos que não vamos salvar nada estranho
    if (!isValidProblem(newItem)) {
      console.warn("Tentativa de salvar problema inválido (sem lat/long).");
      return;
    }

    const arr = [newItem, ...get().problems];
    set({ problems: arr });
    await AsyncStorage.setItem(KEY, JSON.stringify(arr));
  },

  vote: async (id: string) => {
    const arr = get().problems.map((i) =>
      i.id === id ? { ...i, votes: i.votes + 1 } : i
    );
    set({ problems: arr });
    await AsyncStorage.setItem(KEY, JSON.stringify(arr));
  },

  setStatus: async (id: string, status: Problem["status"]) => {
    const arr = get().problems.map((i) =>
      i.id === id ? { ...i, status } : i
    );
    set({ problems: arr });
    await AsyncStorage.setItem(KEY, JSON.stringify(arr));
  },

  clearAll: async () => {
    set({ problems: [] });
    await AsyncStorage.removeItem(KEY);
  },
}));
