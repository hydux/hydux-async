export declare type ParamValue<A, D> = {
    api: A;
    init: D;
    handleStart?: (key: string) => void;
    /** override default success handler action */
    handleSuccess?: (key: string, data: D) => any;
    /** override default error handler action */
    handleError?: (key: string, err: Error) => any;
};
export declare type Param = {
    [k: string]: ParamValue<any, any>;
};
export declare type LoadApi<P extends Param> = {
    [k in keyof P]: P[k]['api'];
} & {
    /** Enable auto set loading flag before fetching */
    enableLoadingFlag(): void;
    /** Disbale auto set loading flag before fetching */
    disableLoadingFlag(): void;
};
export declare type apiStatus<A extends Param, k extends keyof A> = {
    isLoading: boolean;
    error: string;
    rawError: any | null;
    data: A[k]['init'];
};
export declare type LoadState<A extends Param> = {
    [k in keyof A]: apiStatus<A, k>;
};
export default function Loadable<P extends Param>(param: P): {
    actions: LoadApi<P>;
    state: LoadState<P>;
};
