# graphql-typescript-client

graphql-typescript-client is a custom codegen plugin for generating a strongly typed TypeScript GraphQL client using Apollo Client. It automatically produces a class with query, mutation, and subscription methods based on your GraphQL operations, providing full type safety and cleaner developer experience.

🚀 Features
- 📦 Auto-generates a GQLClient class with methods for each GraphQL operation
- ✅ Full TypeScript support for operations and variables
- 🧠 Built-in status watcher for managing client connection state
- ⚙️ Customizable via @graphql-codegen

## 📦 Installation

### Install dependencies:

```bash
npm install @graphql-codegen/cli @apollo/client graphql
```

### Add the plugin to your codegen config:

```yaml
generates:
  ./src/generated/client.ts:
    plugins:
      - graphql-typescript-client
```

### 📄 Example Output

Given this GraphQL operation:

```graphql
query GetUser($id: ID!) {
  user(id: $id) {
    id
    name
  }
}
```

The plugin will generate a method like this:

```ts
queryGetUser = (variables: GetUserQueryVariables, options?: { fetchPolicy?: FetchPolicy }) => {
  return this.query<GetUserQuery, GetUserQueryVariables>({
    query: GetUserDocument,
    variables,
    ...options
  });
}
```

You can then use it like this:

```ts
const client = new GQLClient({ uri: '/graphql', cache: new InMemoryCache() });
const { data } = await client.queryGetUser({ id: '123' });
```

## 🧩 GQLClient Class

The generated GQLClient extends ApolloClient and includes:
- Strongly-typed methods: queryX, mutateX, subscribeX
- statusWatcher: Reactive state management for connection status

## Example:

```ts
const watcher = new Watcher('connecting');
watcher.watch((state) => console.log('Client state:', state));

const client = new GQLClient({
  uri: '/graphql',
  cache: new InMemoryCache(),
  statusWatcher: watcher
});
```
