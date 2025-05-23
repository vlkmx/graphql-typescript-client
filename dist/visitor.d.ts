import { OperationDefinitionNode } from 'graphql';
export declare class MethodsVisitor {
    private typeImportsPath;
    private mutations;
    private subscriptions;
    private queries;
    getImports: () => string;
    getBaseClass: () => string;
    toMutation: ({ name, hasVariables }: {
        name: string;
        hasVariables: boolean;
    }) => string;
    toQuery: ({ name, hasVariables }: {
        name: string;
        hasVariables: boolean;
    }) => string;
    toSubscription: ({ name, hasVariables }: {
        name: string;
        hasVariables: boolean;
    }) => string;
    private getVarsAndOptions;
    private getParamsDeclaration;
    private getRequestOptions;
    private getOperationName;
    OperationDefinition: (node: OperationDefinitionNode) => string;
}
