// store/machine.ts
import { create } from "zustand";

export type TapeValue = "0" | "1" | "b";

export type Transition = {
  read: TapeValue;
  write: TapeValue | null;
  move: "l" | "r" | null;
  next: string | null;
};

type State = {
  name: string;
  transitions: Transition[];
};

// Le nombre de cases sur notre ruban visuel
const TAPE_SIZE = 50;
const INITIAL_STATE = "q1";

type MachineStore = {
  states: State[];
  addState: () => void;
  updateTransition: (
    stateName: string,
    index: number,
    update: Partial<Transition>
  ) => void;

  tape: TapeValue[];
  head: number;
  currentState: string;

  /** Met à jour manuellement le ruban (pour les boutons d'écriture) */
  setTape: (newTape: TapeValue[]) => void;
  /** Met à jour manuellement la tête (pour le glisser) */
  setHead: (newHead: number) => void;
  /** Réinitialise la simulation */
  reset: () => void;
  /** Exécute un seul pas de la machine */
  step: () => void;
};

export const useMachineStore = create<MachineStore>((set, get) => ({
  // --- États et Transitions (inchangé) ---
  states: [
    {
      name: "q1",
      transitions: [
        { read: "0", write: "1", move: "l", next: "q1" },
        { read: "1", write: "0", move: "r", next: "q2" },
        { read: "b", write: "1", move: null, next: "stop" }, // J'ai mis stop ici
      ]
    },
    {
      name: "q2",
      transitions: [
        { read: "0", write: "1", move: "r", next: "q1" },
        { read: "1", write: "1", move: "l", next: "q2" },
        { read: "b", write: null, move: null, next: "q1" },
      ]
    }
  ],

  addState: () =>
    set((current) => ({
      states: [
        ...current.states,
        {
          name: "q" + (current.states.length + 1),
          transitions: [
            { read: "0", write: null, move: null, next: null },
            { read: "1", write: null, move: null, next: null },
            { read: "b", write: null, move: null, next: null }
          ]
        }
      ]
    })),
  
  updateTransition: (stateName, index, update) =>
    set((current) => ({
      states: current.states.map((state) =>
        state.name === stateName
          ? {
              ...state,
              transitions: state.transitions.map((t, i) =>
                i === index ? { ...t, ...update } : t
              )
            }
          : state
      )
    })),

  // --- IMPLÉMENTATION DU RUBAN ET DE L'EXÉCUTION ---
  
  tape: Array(TAPE_SIZE).fill("b"),
  head: 0,
  currentState: INITIAL_STATE,

  setTape: (newTape) => set({ tape: newTape }),
  setHead: (newHead) => set({ head: newHead }),

  reset: () => set({
    head: 0,
    currentState: get().states[0]?.name || INITIAL_STATE // Réinitialise à "q1" (ou le 1er état)
  }),

  step: () => {
    const { states, tape, head, currentState } = get();

    // 1. Vérifier si la machine est arrêtée
    if (currentState === "stop") return;

    // 2. Trouver l'objet de l'état actuel
    const stateObj = states.find(s => s.name === currentState);
    if (!stateObj) {
      console.error(`État inconnu: ${currentState}`);
      set({ currentState: "stop" });
      return;
    }

    // 3. Lire la valeur sur le ruban
    const readValue = tape[head];

    // 4. Trouver la transition correspondante
    const transition = stateObj.transitions.find(t => t.read === readValue);
    if (!transition) {
      console.warn(`Aucune transition trouvée pour l'état ${currentState} en lisant ${readValue}`);
      set({ currentState: "stop" }); // Bloque la machine
      return;
    }

    // 5. Exécuter la transition
    let newTape = tape;
    let newHead = head;
    
    // 5a. Écrire (si spécifié)
    if (transition.write !== null) {
      newTape = [...tape]; // Copie le tableau
      newTape[head] = transition.write;
    }

    // 5b. Bouger (si spécifié)
    if (transition.move === "l") {
      newHead = (head - 1 + TAPE_SIZE) % TAPE_SIZE; // Gère le "wrap-around" (ruban circulaire)
    } else if (transition.move === "r") {
      newHead = (head + 1) % TAPE_SIZE;
    }

    // 5c. Aller à l'état suivant
    const nextState = transition.next ?? "stop"; // Si "next" est null, on s'arrête

    // 6. Mettre à jour le store
    set({
      tape: newTape,
      head: newHead,
      currentState: nextState
    });
  }
}));