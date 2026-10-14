import { useCallback, useSyncExternalStore } from "react";

let row: any | null = null;

const listeners = new Set<() => void>();

function notify() {
    listeners.forEach((listener) => listener());
}
function setDrawer(next: any | null) {
    row = next;
    notify();
}
export default function useDrawerSync() {

    const updateURL = useCallback(
        (id: string | number | null, usePush = true) => {
            if (typeof window === "undefined") return;
            try {
                const url = new URL(window.location.href);
                const currentVal = url.searchParams.get('drawer');

                if (id !== null && id !== undefined && String(id).trim() !== "") {
                    const strId = String(id);
                    if (currentVal === strId) return;

                    url.searchParams.set("drawer", strId);
                    const newUrl =
                        url.pathname +
                        (url.searchParams.toString() ? `?${url.searchParams.toString()}` : "") +
                        url.hash;

                    if (usePush) {
                        window.history.pushState(window.history.state, "", newUrl);
                    } else {
                        window.history.replaceState(window.history.state, "", newUrl);
                    }
                } else {
                    if (!url.searchParams.has("drawer")) return;

                    url.searchParams.delete("drawer");
                    const newUrl =
                        url.pathname +
                        (url.searchParams.toString() ? `?${url.searchParams.toString()}` : "") +
                        url.hash;

                    window.history.replaceState(window.history.state, "", newUrl);
                }
            } catch (e) {
                console.error("Error updating details URL:", e);
            }
        },
        []
    );
    const selectedRow = useSyncExternalStore(
        (callback) => {
            listeners.add(callback);
            return () => listeners.delete(callback);
        },
        () => row,
        () => null
    );
    const open = (row: any) => {
        updateURL(row.id);
        setDrawer(row)
    };
    const close = () => {
        updateURL(null);
        setDrawer(null)
    };


    return {
        selectedRow,
        open,
        close,
    }


}