import { NormalizedApiResponse, PaginationMeta } from "@/types/api";

export function buildQuery(endpoint: string, params: Record<string, unknown>): string {
    const url = new URL(endpoint, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');

    Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
            if (typeof val === 'object') {
                url.searchParams.append(key, JSON.stringify(val));
            } else {
                url.searchParams.append(key, String(val));
            }
        }
    });

    if (!endpoint.startsWith('http://') && !endpoint.startsWith('https://')) {
        return url.pathname + url.search;
    }

    return url.toString();
}


export function normalizeResponse<T>(res: unknown, page: number = 1, pageSize: number = 20): NormalizedApiResponse<T> {
    if (!res) {
        return {
            data: [],
            meta: { current_page: page, last_page: page, per_page: pageSize, total: 0, next_page_url: null },
        };
    }

    if (Array.isArray(res)) {
        const total = res.length;
        const lastPage = Math.max(1, Math.ceil(total / pageSize));
        return {
            data: res as T[],
            meta: {
                current_page: page,
                last_page: lastPage,
                per_page: pageSize,
                total,
                next_page_url: page < lastPage ? `?page=${page + 1}` : null,
            },
        };
    }

    const obj = res as Record<string, unknown>;
    const dataList = (Array.isArray(obj.data) ? obj.data : []) as T[];
    const metaObj = (obj.meta && typeof obj.meta === 'object' ? obj.meta : obj) as Record<string, unknown>;

    const currentPage = typeof metaObj.current_page === 'number' ? metaObj.current_page : page;
    const lastPage = typeof metaObj.last_page === 'number' ? metaObj.last_page : currentPage;
    const perPage = typeof metaObj.per_page === 'number' ? metaObj.per_page : pageSize;
    const total = typeof metaObj.total === 'number' ? metaObj.total : dataList.length;
    const nextPageUrl = typeof metaObj.next_page_url === 'string' ? metaObj.next_page_url : null;

    const meta: PaginationMeta = {
        current_page: currentPage,
        last_page: lastPage,
        per_page: perPage,
        total,
        next_page_url: nextPageUrl,
    };

    return {
        data: dataList,
        meta,
    };
}
