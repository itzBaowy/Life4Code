import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authCookie } from "../utils/AuthCookie";

export const useUserStore = create(
    persist(
        (set) => ({
            user: null,
            setUser: (userData) =>
                set({
                    user: {
                        id: userData.id,
                        userName: userData.userName,
                        email: userData.email,
                        fullName: userData.fullName || userData.name,
                        name: userData.name || userData.fullName,
                        phoneNumber: userData.phoneNumber,
                        role: userData.role?.name || userData.role,
                        permissions:
                            userData.role?.permissions ||
                            userData.role?.permission ||
                            userData.permissions ||
                            [],
                        createdAt: userData.createdAt,
                    },
                }),

            updateUser: (updates) =>
                set((state) => ({
                    user: state.user ? { ...state.user, ...updates } : null,
                })),

            clearUser: () => {
                set({ user: null });
                localStorage.clear();
                authCookie.clearAccessTokens();
                authCookie.clearRefreshToken();
            },
        }),
        {
            name: "user-storage",
        },
    ),
);