import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

type User = {
  name: string;
  cpf: string;
  phone: string;
  address: string;
  email: string;
  password: string;
  photoUri?: string | null;
};

type AuthStore = {
  initialized: boolean;
  loggedIn: boolean;
  firstLoginCompleted: boolean;
  user: User | null;
  load: () => Promise<void>;
  register: (data: {
    name: string;
    cpf: string;
    phone: string;
    address: string;
    email: string;
    password: string;
  }) => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  completeFirstLogin: () => Promise<void>;
  updateProfile: (data: Partial<Omit<User, "password">>) => Promise<void>;
  updatePhoto: (uri: string | null) => Promise<void>;
};

const KEY = "@comunicaplus/auth";

export const useAuth = create<AuthStore>((set, get) => ({
  initialized: false,
  loggedIn: false,
  firstLoginCompleted: false,
  user: null,

  load: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (!raw) {
        set({ initialized: true });
        return;
      }
      const data = JSON.parse(raw) as {
        user: User | null;
        loggedIn: boolean;
        firstLoginCompleted: boolean;
      };
      set({
        user: data.user,
        loggedIn: data.loggedIn,
        firstLoginCompleted: data.firstLoginCompleted ?? false,
        initialized: true,
      });
    } catch {
      set({
        initialized: true,
        loggedIn: false,
        user: null,
        firstLoginCompleted: false,
      });
    }
  },

  register: async ({ name, cpf, phone, address, email, password }) => {
    const user: User = { name, cpf, phone, address, email, password };
    const payload = {
      user,
      loggedIn: false,
      firstLoginCompleted: false,
    };
    set(payload);
    await AsyncStorage.setItem(KEY, JSON.stringify(payload));
  },

  login: async (email, password) => {
    const { user, firstLoginCompleted } = get();
    if (!user) return false;

    const ok =
      user.email === email.trim().toLowerCase() &&
      user.password === password;

    if (!ok) return false;

    const newState = {
      user,
      loggedIn: true,
      firstLoginCompleted,
    };
    set(newState);
    await AsyncStorage.setItem(KEY, JSON.stringify(newState));
    return true;
  },

  logout: async () => {
    const { user, firstLoginCompleted } = get();
    const newState = {
      user,
      loggedIn: false,
      firstLoginCompleted,
    };
    set(newState);
    await AsyncStorage.setItem(KEY, JSON.stringify(newState));
  },

  deleteAccount: async () => {
    await AsyncStorage.removeItem(KEY);
    set({
      initialized: true,
      loggedIn: false,
      firstLoginCompleted: false,
      user: null,
    });
  },

  completeFirstLogin: async () => {
    const { user } = get();
    const newState = {
      user,
      loggedIn: true,
      firstLoginCompleted: true,
    };
    set(newState);
    await AsyncStorage.setItem(KEY, JSON.stringify(newState));
  },

  updateProfile: async (data) => {
    const state = get();
    if (!state.user) return;

    const updated: User = {
      ...state.user,
      ...data,
    };

    const newState = {
      user: updated,
      loggedIn: state.loggedIn,
      firstLoginCompleted: state.firstLoginCompleted,
    };

    set(newState);
    await AsyncStorage.setItem(KEY, JSON.stringify(newState));
  },

  // Atualiza apenas a foto do usuário (pode ser null para remover)
  updatePhoto: async (uri: string | null) => {
    const state = get();
    if (!state.user) return;

    const updated: User = {
      ...state.user,
      photoUri: uri,
    };

    const newState = {
      user: updated,
      loggedIn: state.loggedIn,
      firstLoginCompleted: state.firstLoginCompleted,
    };

    set(newState);
    await AsyncStorage.setItem(KEY, JSON.stringify(newState));
  },
}));
