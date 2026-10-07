// import { useState } from "react";
// export function useSelection() {
//     const [selected, setSelected] = useState<Set<string>>(new Set());

//     const isSelected = (id: string) => selected.has(id);

//     // const select = (id: string) => setSelected(prev => new Set([...prev, id]));

//     // const deselect = (id: string) => setSelected(prev => new Set(prev).delete(id));

//     const toggle = (id: string) => setSelected(prev => {
//         const newSelected = new Set(prev);
//         if (newSelected.has(id)) {
//             newSelected.delete(id);
//         } else {
//             newSelected.add(id);
//         }
//         return newSelected;
//     });

//     const selectAll = (ids: string[]) => setSelected(new Set(ids));
//     const clear = () => setSelected(new Set());
//     return {
//         selected,
//         isSelected,
//         toggle,
//         selectAll,
//         clear,
//         count: selected.size,
//     }
// }

import { useSyncExternalStore } from "react";

let selection = new Set<string>();

const listeners = new Set<() => void>();

function notify() {
    listeners.forEach((listener) => listener());
}
function setSelection(next: Set<string>) {
    selection = next;
    notify();
}
export default function useSelection() {

    const isSelected = (id: string) => selection.has(id);

    const toggle = (id: string) => {
        const next = new Set(selection);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }
        setSelection(next);
    };

    const selectAll = (ids: string[]) => setSelection(new Set(ids));
    const clear = () => setSelection(new Set());
    return {
        selected: useSyncExternalStore(
            (callback) => {
                listeners.add(callback);
                return () => listeners.delete(callback);
            },
            () => selection,
            () => new Set()
        ),
        isSelected,
        toggle,
        selectAll,
        clear,
        count: selection.size,
    }


}