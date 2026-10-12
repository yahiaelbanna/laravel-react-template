// "use client";

// import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

// import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// import { Button } from "@/components/ui/button";

// type ConfirmOptions = {
//     title: string;
//     description?: string;
//     confirmText?: string;
//     cancelText?: string;
//     variant?: "default" | "destructive";
// };

// type DialogContextType = {
//     confirm: (options: ConfirmOptions) => Promise<boolean>;
// };

// type PendingConfirm = {
//     options: ConfirmOptions;
//     resolve: (value: boolean) => void;
// };

// const DialogContext = createContext<DialogContextType | null>(null);

// export function DialogProvider({ children }: { children: ReactNode; }) {

//     const [pending, setPending] = useState<PendingConfirm | null>(null);

//     const confirm = useCallback((options: ConfirmOptions) => {
//         return new Promise<boolean>((resolve) => {
//             setPending({ options, resolve });
//         });
//     }, []);

//     const finish = (result: boolean) => {
//         pending?.resolve(result);
//         setPending(null);
//     };

//     return (
//         <>
//             <Dialog open={!!pending} onOpenChange={(open) => { if (!open) finish(false); }}>
//                 <DialogContext.Provider value={{ confirm }}>
//                     {children}
//                 </DialogContext.Provider>

//                 <DialogContent>
//                     <DialogHeader>
//                         <DialogTitle>{pending?.options.title}</DialogTitle>

//                         {pending?.options.description && (<DialogDescription> {pending.options.description} </DialogDescription>)}
//                     </DialogHeader>

//                     <DialogFooter>
//                         <Button variant="outline" onClick={() => finish(false)}>
//                             {pending?.options.cancelText ?? "Cancel"}
//                         </Button>

//                         <Button variant={pending?.options.variant ?? "default"} onClick={() => finish(true)}>
//                             {pending?.options.confirmText ?? "Confirm"}
//                         </Button>
//                     </DialogFooter>
//                 </DialogContent>
//             </Dialog>
//         </>
//     );
// }

// export function useDialog() {
//     const context = useContext(DialogContext);

//     if (!context) { throw new Error("useDialog must be used within DialogProvider",); }

//     return context;
// }


// V2


// import { createContext, useCallback, useContext, useState, type ReactNode, type ComponentType, } from "react";

// import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";

// import { Button } from "@/components/ui/button";

// type ConfirmOptions = {
//     title: string;
//     description?: string;
//     confirmText?: string;
//     cancelText?: string;
//     variant?: "default" | "destructive";
// };

// type CustomDialogOptions<T = unknown> = {
//     title: string;
//     description?: string;
//     content: ComponentType<DialogContentProps<T>>;
//     contentProps?: Omit<DialogContentProps<T>, "close" | "submit">;
//     showFooter?: boolean;
// };

// export type DialogContentProps<T = unknown> = {
//     close: () => void;
//     submit: (value: T) => void;
// };

// type DialogResult = | {
//     type: "confirm";
//     options: ConfirmOptions;
//     resolve: (value: boolean) => void;
// } | {
//     type: "custom";
//     options: CustomDialogOptions<any>;
//     resolve: (value: unknown) => void;
// };

// type DialogAPI = {
//     confirm: (options: ConfirmOptions) => Promise<boolean>;
//     open: <T = unknown>(options: CustomDialogOptions<T>,) => Promise<T | undefined>;
// };

// const DialogContext = createContext<DialogAPI | null>(null);

// export function DialogProvider({ children }: { children: ReactNode; }) {

//     const [current, setCurrent] = useState<DialogResult | null>(null,);

//     const confirm = useCallback((options: ConfirmOptions) => new Promise<boolean>((resolve) => {
//         setCurrent({ type: "confirm", options, resolve });
//     }), [],);

//     const open = useCallback(<T,>(options: CustomDialogOptions<T>) => new Promise<T | undefined>((resolve) => {
//         setCurrent({ type: "custom", options, resolve: resolve as (value: unknown) => void, });
//     }), [],);

//     const finish = useCallback((value: unknown) => {
//         setCurrent((dialog) => {
//             if (!dialog) return null;
//             dialog.resolve(value);
//             return null;
//         });
//     }, []);

//     const api: DialogAPI = { confirm, open };

//     return (
//         <DialogContext.Provider value={api}>
//             {children}

//             <Dialog open={current !== null} onOpenChange={(isOpen) => { if (!isOpen) finish(undefined); }} >
//                 <DialogContent>
//                     {current?.type === "confirm" && (<>
//                         <DialogHeader>
//                             <DialogTitle> {current.options.title} </DialogTitle>

//                             {current.options.description && (<DialogDescription> {current.options.description} </DialogDescription>)}
//                         </DialogHeader>

//                         <DialogFooter>
//                             <Button variant="outline" onClick={() => finish(false)} >
//                                 {current.options.cancelText ?? "Cancel"}
//                             </Button>
//                             <Button variant={current.options.variant ?? "default"} onClick={() => finish(true)} >
//                                 {current.options.confirmText ?? "Confirm"}
//                             </Button>
//                         </DialogFooter>
//                     </>)}

//                     {current?.type === "custom" && (<>
//                         <DialogHeader>
//                             <DialogTitle> {current.options.title} </DialogTitle>
//                             {current.options.description && (<DialogDescription> {current.options.description} </DialogDescription>)}
//                         </DialogHeader>

//                         <current.options.content {...current.options.contentProps} close={() => finish(undefined)} submit={(value) => finish(value)} />
//                     </>)}
//                 </DialogContent>
//             </Dialog>
//         </DialogContext.Provider>
//     );
// }

// export function useDialog() {
//     const context = useContext(DialogContext);

//     if (!context) { throw new Error("useDialog must be used within DialogProvider",); }

//     return context;
// }



// V3

import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// ======================== TYPES ========================

export type ConfirmOptions = {
    title: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "default" | "destructive";
};

export type DialogRenderProps<T = unknown> = {
    close: () => void;
    submit: (value: T) => void;
};

export type CustomDialogOptions<T = unknown> = {
    title: string;
    description?: string;
    render: (props: DialogRenderProps<T>) => ReactNode;
};

type ActiveDialogState =
    | { type: "confirm"; options: ConfirmOptions }
    | { type: "custom"; options: CustomDialogOptions<any> };

type DialogAPI = {
    confirm: (options: ConfirmOptions) => Promise<boolean>;
    open: <T = unknown>(options: CustomDialogOptions<T>) => Promise<T | undefined>;
};

// ======================== PROVIDER ========================

const DialogContext = createContext<DialogAPI | null>(null);

export function DialogProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeDialog, setActiveDialog] = useState<ActiveDialogState | null>(null);

    const resolverRef = useRef<((value: any) => void) | null>(null);

    const handleClose = useCallback((value: unknown) => {
        if (resolverRef.current) {
            resolverRef.current(value);
            resolverRef.current = null;
        }
        setIsOpen(false);
    }, []);

    const confirm = useCallback((options: ConfirmOptions) => {
        return new Promise<boolean>((resolve) => {
            if (resolverRef.current) {
                resolverRef.current(false);
            }
            resolverRef.current = resolve;
            setActiveDialog({ type: "confirm", options });
            setIsOpen(true);
        });
    }, []);

    const open = useCallback(<T,>(options: CustomDialogOptions<T>) => {
        return new Promise<T | undefined>((resolve) => {
            if (resolverRef.current) {
                resolverRef.current(undefined);
            }
            resolverRef.current = resolve;
            setActiveDialog({ type: "custom", options });
            setIsOpen(true);
        });
    }, []);

    const api = useMemo<DialogAPI>(() => ({ confirm, open }), [confirm, open]);

    return (
        <DialogContext.Provider value={api}>
            {children}

            <Dialog
                open={isOpen}
                onOpenChange={(openState) => {
                    if (!openState) {
                        handleClose(undefined);
                    }
                }}
            >
                <DialogContent>
                    {activeDialog && (
                        <>
                            <DialogHeader>
                                <DialogTitle>{activeDialog.options.title}</DialogTitle>
                                {activeDialog.options.description && (
                                    <DialogDescription>
                                        {activeDialog.options.description}
                                    </DialogDescription>
                                )}
                            </DialogHeader>

                            {activeDialog.type === "confirm" && (
                                <DialogFooter className="gap-2 sm:gap-0">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => handleClose(false)}
                                    >
                                        {activeDialog.options.cancelText ?? "Cancel"}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={activeDialog.options.variant ?? "default"}
                                        onClick={() => handleClose(true)}
                                    >
                                        {activeDialog.options.confirmText ?? "Confirm"}
                                    </Button>
                                </DialogFooter>
                            )}

                            {activeDialog.type === "custom" &&
                                activeDialog.options.render({
                                    close: () => handleClose(undefined),
                                    submit: (value) => handleClose(value),
                                })}
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </DialogContext.Provider>
    );
}

export function useDialog() {
    const context = useContext(DialogContext);
    if (!context) {
        throw new Error("useDialog must be used within a DialogProvider");
    }
    return context;
}