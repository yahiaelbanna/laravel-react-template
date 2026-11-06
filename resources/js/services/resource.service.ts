import { router } from '@inertiajs/react';
import { toast } from 'sonner';

type ResourceServiceProps = {
    resource: string;
    onLoadStart?: () => void;
    onLoadFinish?: () => void;
    onProcessStart?: () => void;
    onProcessFinish?: () => void;
}

export class ResourceService {

    constructor(
        private props: ResourceServiceProps
    ) { }

    private getLoadOptions() {
        return {
            preserveState: true,
            preserveScroll: true,
            onStart: this.props.onLoadStart,
            onFinish: this.props.onLoadFinish,
            onError: (errors: any) => {
                console.error("Resource Load Error:", errors);
            }
        }
    }

    private getProcessOptions(message?: string) {
        return {
            preserveState: true,
            preserveScroll: true,
            onStart: this.props.onProcessStart,
            onFinish: this.props.onProcessFinish,
            onError: (errors: any) => {
                console.error("Resource Process Error:", errors);
                toast.error("Resource Process Error");
            },
            onSuccess: () => {
                console.log("test");

                if (message) toast.success(message);
            }
        };
    }

    index(data?: Record<string, any>) {
        router.get(
            route(`${this.props.resource}.index`),
            data,
            {
                ...this.getLoadOptions(),
                replace: true,
            }
        )
    }

    store(data: any) {
        router.post(
            route(`${this.props.resource}.store`),
            data,
            this.getProcessOptions()
        )
    }

    update(id: number | string, data: any) {
        router.post(
            route(`${this.props.resource}.update`, id),
            data,
            this.getProcessOptions()
        )
    }

    clone(id: number | string) {
        router.post(
            route(`${this.props.resource}.clone`, id),
            {},
            this.getProcessOptions("Data cloned successfully")
        )
    }

    destroy(id: number | string) {
        router.delete(
            route(`${this.props.resource}.destroy`, id),
            this.getProcessOptions('Data deleted successfully')
        );
    }

    bulkDestroy(ids: number[] | string[] | Set<number> | Set<string>, options?: Record<string, any>) {
        const idsArray = ids instanceof Set ? Array.from(ids as Set<number | string>) : ids;

        router.delete(
            route(`${this.props.resource}.destroy.bulk`),
            {
                ...this.getProcessOptions('Selected data deleted successfully'),
                ...options,
                data: { ids: idsArray, ...(options?.data || {}) }
            }
        )
    }
}