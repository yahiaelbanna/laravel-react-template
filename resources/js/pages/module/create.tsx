import FormResource from "@/components/form-resource/form-resource";
import config from "./config/config";

export default function CreateModule() {
    return (
        <div>
            <FormResource config={config} />
        </div>
    );
}