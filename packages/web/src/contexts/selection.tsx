import React, { Dispatch, FC, useContext, useReducer } from 'react';

export type SelectionStateAction =
    | { type: 'begin'; location: number; filename: string }
    | { type: 'set'; location: number; filename: string }
    | { type: 'continue'; location: number }
    | { type: 'finalise'; location: number }
    | { type: 'reset' };

export type SelectionState =
    | {
          isDragging: true;
          range: {
              start: number;
              end: number;
          };
          filename: string;
      }
    | {
          isDragging: false;
          filename?: string;
          range?: {
              start: number;
              end: number;
          };
      };

const initialState: SelectionState = {
    isDragging: false,
};

export const SelectionContext = React.createContext<{
    state: SelectionState;
    dispatch: Dispatch<SelectionStateAction>;
}>({
    state: initialState,
    dispatch: () => null,
});

export function selectionReducer(state: SelectionState, action: SelectionStateAction): SelectionState {
    switch (action.type) {
        case 'begin':
            return {
                ...state,
                isDragging: true,
                filename: action.filename,
                range: { start: action.location, end: action.location },
            };
        case 'set': {
            return {
                isDragging: false,
                filename: action.filename,
                range: { start: action.location, end: action.location },
            };
        }
        case 'continue':
            return {
                ...state,
                range: {
                    start: state.range?.start || action.location,
                    end: action.location,
                },
            };
        case 'finalise':
            return {
                ...state,
                isDragging: false,
                range: {
                    start: state.range?.start || action.location,
                    end: action.location,
                },
            };
        case 'reset': {
            return {
                isDragging: false,
            };
        }
    }
}
export const SelectionProvider: FC = ({ children }) => {
    const [state, dispatch] = useReducer(selectionReducer, initialState);

    return <SelectionContext.Provider value={{ state, dispatch }}>{children}</SelectionContext.Provider>;
};

export const useSelectionState = (): SelectionState => {
    const context = React.useContext(SelectionContext);

    if (context === undefined) {
        throw new Error('useSelectionState must be used within SelectionProvider');
    }

    return context.state;
};

export const useDispatchSelection = () => {
    const context = useContext(SelectionContext);

    if (typeof context === 'undefined') {
        throw new Error('useDispatchSelection must be used within SelectionProvider');
    }

    return context.dispatch;
};
