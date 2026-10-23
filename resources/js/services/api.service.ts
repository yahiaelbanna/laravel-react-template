import { buildQuery, normalizeResponse } from "@/lib/api-utils";
import { NormalizedApiResponse } from "@/types/api";
import { ApiOptionsType } from "@/types/form-config-type";
import { toast } from "sonner";

export async function get<T>(options: ApiOptionsType): Promise<NormalizedApiResponse<T>> {
    const { endpoint, page, pageSize, query, search, signal } = options;
    const queryParams: Record<string, unknown> = {
        page,
        per_page: pageSize,
        ...query,
    };

    if (search && search.trim() !== '') {
        queryParams.search = search.trim();
        queryParams.q = search.trim();
    }

    const fullUrl = buildQuery(endpoint, queryParams);

    try {
        const response = await fetch(fullUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                'x-requested-with': 'XMLHttpRequest',
            },
            signal,
        });

        if (!response.ok) {
            toast.error("Failed to fetch data, try again later!");
            throw new Error("Failed to fetch data");
        }

        const data = await response.json();
        return normalizeResponse<T>(data, page, pageSize);
    } catch (err: any) {
        if (err.name === 'AbortError') {
            return {
                data: [],
                meta: {
                    current_page: page || 1,
                    last_page: page || 1,
                    per_page: pageSize || 20,
                    total: 0,
                    next_page_url: null,
                },
            };
        }
        throw err;
    }
}


