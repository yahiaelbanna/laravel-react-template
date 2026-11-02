import FormResource from "@/components/form-resource/form-resource";
import config from "./config/config";

interface EditModuleProps {
    module?: Record<string, any>;
}

export default function EditModule({ module }: EditModuleProps) {
    return (
        <div>
            <FormResource config={config} initialData={module} isEdit={true} />
        </div>
    );
}

