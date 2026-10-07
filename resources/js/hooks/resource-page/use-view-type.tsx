import { ViewTypes } from "@/types/config-type";
import { useSyncExternalStore } from "react";

const getInitialView = (): ViewTypes => {
    if (typeof window === "undefined") return "table";
    const saved = localStorage.getItem("view");
    return (saved as ViewTypes) || "table";
};

let viewTypeState = getInitialView();

const listeners = new Set<() => void>();

function notify() {
    listeners.forEach((listener) => listener());
}

function setViewTypeState(next: ViewTypes) {
    viewTypeState = next;
    if (typeof window !== "undefined") {
        localStorage.setItem("view", next.toString());
    }
    notify();
}

export default function useViewType({ viewTypes = ['table'] }: { viewTypes?: ViewTypes[] }) {
    const viewType = useSyncExternalStore(
        (callback) => {
            listeners.add(callback);
            return () => listeners.delete(callback);
        },
        () => viewTypeState,
        () => viewTypes[0] || 'table'
    );

    const changeView = (view: ViewTypes) => setViewTypeState(view);

    return {
        viewType,
        changeView
    };
}
