export interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total?: number;
    next_page_url?: string | null;
    prev_page_url?: string | null;
    from?: number | null;
    to?: number | null;
}

export interface NormalizedApiResponse<T> {
    data: T[];
    meta: PaginationMeta;
}