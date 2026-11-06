import { router, usePage } from "@inertiajs/react";

type Query = Record<string, any>;

export function useQuery() {

    const filters = (usePage().props.filters ?? {}) as Query;

    const visit = (query: Query) => {
        try {
            const currentRoute = typeof route === "function" && route().current ? route().current() : null;
            if (!currentRoute) return;

            router.get(
                route(currentRoute),
                query,
                {
                    preserveState: true,
                    preserveScroll: false,
                    replace: true,
                }
            );
        } catch (e) {
            console.warn("useQuery visit skipped:", e);
        }
    };

    return {

        data: filters,

        update(values: Query, options?: {
            resetPage?: boolean;
        }) {
            const next = {
                ...filters,
                ...(options?.resetPage && { page: 1 }),
                ...values
            };
            visit(next);
        },

        replace(values: Query) {

            visit(values);

        },

        remove(...keys: string[]) {

            const next = { ...filters };

            keys.forEach(key => delete next[key]);

            visit(next);

        },

        reset() {

            visit({});

        },

    };

}