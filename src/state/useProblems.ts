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
  load: () => Promise<void>;
  clearAll: () => Promise<void>;
};

const KEY = "@comunicaplus/problems";

export const useProblems = create<Store>((set, get) => ({
  problems: [],
  loaded: false,

  load: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      const arr: Problem[] = raw ? JSON.parse(raw) : [];
      set({ problems: arr, loaded: true });
    } catch {
      set({ problems: [], loaded: true });
    }
  },

  persist: async () => {
    await AsyncStorage.setItem(KEY, JSON.stringify(get().problems));
  },

  addProblem: async (p: ProblemInput) => {
    const newItem: Problem = {
      ...p,
      id: Math.random().toString(36).slice(2),
      status: "Aberto",
      votes: 0,
      createdAt: Date.now(),
    };
    const arr = [newItem, ...get().problems];
    set({ problems: arr });
    await AsyncStorage.setItem(KEY, JSON.stringify(arr));
  },

  vote: async (id: string) => {
    const arr = get().problems.map((i) => (i.id === id ? { ...i, votes: i.votes + 1 } : i));
    set({ problems: arr });
    await AsyncStorage.setItem(KEY, JSON.stringify(arr));
  },

  setStatus: async (id: string, status: Problem["status"]) => {
    const arr = get().problems.map((i) => (i.id === id ? { ...i, status } : i));
    set({ problems: arr });
    await AsyncStorage.setItem(KEY, JSON.stringify(arr));
  },

  clearAll: async () => {
    set({ problems: [] });
    await AsyncStorage.removeItem(KEY);
  },
})) as any;
