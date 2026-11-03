import { useMemo, useState } from "react";
import { ResourceService } from "@/services/resource.service";

type useResourceProps = {
    resource: string;
}

export function useResource({
    resource
}: useResourceProps) {


    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);

    const service = useMemo(() => {

        return new ResourceService({
            resource,
            onLoadStart: () => setLoading(true),
            onLoadFinish: () => setLoading(false),

            onProcessStart: () => setProcessing(true),
            onProcessFinish: () => setProcessing(false),
        })

    }, [resource])

    return {
        loading,
        processing,
        index: service.index.bind(service),
        store: service.store.bind(service),
        update: service.update.bind(service),
        clone: service.clone.bind(service),
        destroy: service.destroy.bind(service),
    }
}