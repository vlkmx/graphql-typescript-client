import { pascalCase } from 'change-case-all';
export class MethodsVisitor {
    constructor() {
        this.typeImportsPath = './generated';
        this.mutations = new Set();
        this.subscriptions = new Set();
        this.queries = new Set();
        this.getImports = () => {
            let queriesImports = Array.from(this.queries).map(({ name }) => [
                `${name}Query`,
                `${name}QueryVariables`,
                `${name}Document`
            ]);
            let mutationsImports = Array.from(this.mutations).map(({ name }) => [
                `${name}Mutation`,
                `${name}MutationVariables`,
                `${name}Document`
            ]);
            let subscriptionsImports = Array.from(this.subscriptions).map(({ name }) => [
                `${name}Subscription`,
                `${name}SubscriptionVariables`,
                `${name}Document`
            ]);
            let imports = queriesImports
                .concat(mutationsImports)
                .concat(subscriptionsImports)
                .reduce((acc, x) => [...acc, ...x], []);
            return `
      import { ApolloClient, NormalizedCacheObject, FetchPolicy } from '@apollo/client';
      import { ApolloClientOptions } from '@apollo/client/core/ApolloClient';
      import {
        ${imports.join(',\n')}
      } from '${this.typeImportsPath}';\n
      `;
        };
        this.getBaseClass = () => {
            let queries = Array.from(this.queries);
            let mutations = Array.from(this.mutations);
            let subscriptions = Array.from(this.subscriptions);
            let base = `
  type StateFn<T> = (prevState: T) => T;
  export type ClientStatus = 'connecting' | 'connecting-initial' | 'connected' | 'error';
  export type WatchHandler<T> = (state: T, prevState: T) => void;
  
  export class Watcher {
    private _watchers: WatchHandler<ClientStatus>[] = [];
    private _state: ClientStatus;

    constructor(initialState: ClientStatus) {
      this._state = initialState;
    }

    watch(handler: WatchHandler<ClientStatus>, lazy: boolean = true): () => void {
      this._watchers.push(handler);
      if (!lazy) {
          handler(this._state, this._state);
      }
      return () => {
        let index = this._watchers.indexOf(handler);
        if (index < 0) {
            console.warn('Double unsubscribe detected!');
        } else {
            this._watchers.splice(index, 1);
        }
      };
    }

    getState() {
      return this._state;
    }

    setState(state: ClientStatus | StateFn<ClientStatus>) {
      let newState: ClientStatus;
      if (typeof state === 'function') {
          newState = (state as StateFn<ClientStatus>)(this._state);
      } else {
          newState = state;
      }

      for (let w of this._watchers) {
          w(newState, this._state);
      }
      this._state = newState;
    }
  }

  export class GQLClient extends ApolloClient<NormalizedCacheObject>{
    readonly statusWatcher?: Watcher;
    
    constructor(options: ApolloClientOptions<NormalizedCacheObject> & { statusWatcher?: Watcher }) {
      super(options);
      if (options.statusWatcher) {
        this.statusWatcher = options.statusWatcher;
      }
    }
    
    ${queries.map(this.toQuery).join('\n')}
    ${mutations.map(this.toMutation).join('\n')}
    ${subscriptions.map(this.toSubscription).join('\n')}
  }      
      `;
            return base;
        };
        this.toMutation = ({ name, hasVariables }) => {
            name = pascalCase(name);
            let paramsDeclaration = this.getParamsDeclaration({
                name,
                hasVariables,
                type: 'mutation'
            });
            return `
  mutate${name} = ${paramsDeclaration} => {
    return this.mutate<
      ${name}Mutation,
      ${name}MutationVariables
      >({
        mutation: ${name}Document,
        ${this.getVarsAndOptions(hasVariables)}
    });
  }`;
        };
        this.toQuery = ({ name, hasVariables }) => {
            name = pascalCase(name);
            let paramsDeclaration = this.getParamsDeclaration({
                name,
                hasVariables,
                type: 'query'
            });
            return `
  query${name} = ${paramsDeclaration} => {
    return this.query<
      ${name}Query,
      ${name}QueryVariables
      >({
        query: ${name}Document,
        ${this.getVarsAndOptions(hasVariables)}
    });
  }`;
        };
        this.toSubscription = ({ name, hasVariables }) => {
            name = pascalCase(name);
            let paramsDeclaration = this.getParamsDeclaration({
                name,
                hasVariables,
                type: 'subscription'
            });
            return `
  subscribe${name} = ${paramsDeclaration} => {
    return this.subscribe<
      ${name}Subscription,
      ${name}SubscriptionVariables
      >({
        query: ${name}Document,
        ${this.getVarsAndOptions(hasVariables)}
    });
  }`;
        };
        this.getVarsAndOptions = (hasVariables) => {
            return hasVariables
                ? `variables,
      ...options`
                : `...options`;
        };
        this.getParamsDeclaration = (ops) => {
            let opName = this.getOperationName(ops.type);
            return ops.hasVariables
                ? `(variables: ${ops.name}${opName}Variables, ${this.getRequestOptions(ops.type)})`
                : `(${this.getRequestOptions(ops.type)})`;
        };
        this.getRequestOptions = (type) => {
            let isMutation = type && type === 'mutation';
            return isMutation
                ? `options?: { fetchPolicy?: 'network-only' | 'no-cache' }`
                : `options?: { fetchPolicy?: FetchPolicy }`;
        };
        this.getOperationName = (type) => {
            if (type === 'query') {
                return 'Query';
            }
            else if (type === 'mutation') {
                return 'Mutation';
            }
            else {
                return 'Subscription';
            }
        };
        this.OperationDefinition = (node) => {
            var _a, _b;
            let name = (_a = node.name) === null || _a === void 0 ? void 0 : _a.value;
            let hasVariables = Boolean((_b = node.variableDefinitions) === null || _b === void 0 ? void 0 : _b.length);
            if (!name) {
                return '';
            }
            if (node.operation === 'query') {
                this.queries.add({ name, hasVariables });
            }
            else if (node.operation === 'mutation') {
                this.mutations.add({ name, hasVariables });
            }
            else if (node.operation === 'subscription') {
                this.subscriptions.add({ name, hasVariables });
            }
            return '';
        };
    }
}
//# sourceMappingURL=visitor.js.map