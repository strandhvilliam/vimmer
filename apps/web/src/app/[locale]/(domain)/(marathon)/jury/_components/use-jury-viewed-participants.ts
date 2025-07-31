import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface JuryViewedParticipantsState {
  viewedRefs: string[];
  addViewedRefs: (refs: string[], domain: string) => void;
}

export const useJuryViewedParticipantsStore =
  create<JuryViewedParticipantsState>()(
    persist(
      (set) => ({
        viewedRefs: [],
        addViewedRefs: (refs: string[], domain: string) => {
          const viewed = refs.map((ref) => `${domain}-${ref}`);
          set((state) => {
            const toAdd = viewed.filter(
              (ref) => !state.viewedRefs.includes(ref),
            );

            return toAdd.length !== 0
              ? {
                  ...state,
                  viewedRefs: [...state.viewedRefs, ...toAdd],
                }
              : state;
          });
        },
      }),
      {
        name: "jury-viewed-participants",
        storage: createJSONStorage(() => localStorage),
      },
    ),
  );
