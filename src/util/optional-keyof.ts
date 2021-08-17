export type OptionalKeyOf<A extends object> = keyof {
    [K in keyof A as undefined extends A[K] ? K : null extends A[K] ? K : never]: never;
};
