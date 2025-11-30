import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface StackFilterState {
    hiddenStacks: Set<number>;
    hideStack: (stackId: number) => void;
    showStack: (stackId: number) => void;
    isStackHidden: (stackId: number) => boolean;
    toggleStack: (stackId: number) => void;
}

// Custom storage for AsyncStorage
const asyncStorage = {
    getItem: async (name: string) => {
        const value = await AsyncStorage.getItem(name);
        return value;
    },
    setItem: async (name: string, value: string) => {
        await AsyncStorage.setItem(name, value);
    },
    removeItem: async (name: string) => {
        await AsyncStorage.removeItem(name);
    },
};

export const useStackFilterStore = create<StackFilterState>()(
    persist(
        (set, get) => ({
            hiddenStacks: new Set<number>(),

            hideStack: (stackId: number) =>
                set((state) => ({
                    hiddenStacks: new Set([...state.hiddenStacks, stackId]),
                })),

            showStack: (stackId: number) =>
                set((state) => {
                    const newSet = new Set(state.hiddenStacks);
                    newSet.delete(stackId);
                    return { hiddenStacks: newSet };
                }),

            isStackHidden: (stackId: number) =>
                get().hiddenStacks.has(stackId),

            toggleStack: (stackId: number) => {
                const isHidden = get().isStackHidden(stackId);
                if (isHidden) {
                    get().showStack(stackId);
                } else {
                    get().hideStack(stackId);
                }
            },
        }),
        {
            name: 'stack-filter-storage',
            storage: createJSONStorage(() => asyncStorage),
            // Custom serialization for Set
            partialize: (state) => ({
                hiddenStacks: Array.from(state.hiddenStacks),
            }),
            // Custom deserialization
            merge: (persistedState: any, currentState) => ({
                ...currentState,
                hiddenStacks: new Set(persistedState?.hiddenStacks || []),
            }),
        }
    )
);
