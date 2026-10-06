import { ViewTypes } from "@/types/config-type";
import { useEffect, useState } from "react";


export default function useViewType({ viewTypes = ['table'] }: { viewTypes?: ViewTypes[] }) {
    const [viewType, setViewType] = useState<ViewTypes>('table');

    const changeView = (view: ViewTypes) => {
        setViewType(view);
    }

    const handleSaveView = () => {
        localStorage.setItem('view', viewType);
    }

    const getSavedView = () => {
        const savedView = localStorage.getItem('view');
        if (savedView) {
            setViewType(savedView as ViewTypes);
        }
    }

    useEffect(() => {
        getSavedView();
    }, []);

    useEffect(() => {
        handleSaveView();
    }, [viewType]);

    return {
        viewType,
        changeView,
    }
}
