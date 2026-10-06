import { useSyncExternalStore } from "react";

let panelState = typeof window !== "undefined"
    ? localStorage.getItem("panel") === "true"
    : false;

const listeners = new Set<() => void>();

function notify() {
    listeners.forEach((listener) => listener());
}

function setPanelState(next: boolean) {
    panelState = next;
    if (typeof window !== "undefined") {
        localStorage.setItem("panel", next.toString());
    }
    notify();
}

export default function useFilterPanel() {
    const panel = useSyncExternalStore(
        (callback) => {
            listeners.add(callback);
            return () => listeners.delete(callback);
        },
        () => panelState,
        () => false
    );

    const togglePanel = () => setPanelState(!panelState);
    const openPanel = () => setPanelState(true);
    const closePanel = () => setPanelState(false);

    return {
        panel,
        togglePanel,
        openPanel,
        closePanel,
    };
}
