import { Types, PluginFunction } from '@graphql-codegen/plugin-helpers';
import { visit, GraphQLSchema, concatAST } from 'graphql';
import { MethodsVisitor } from './visitor';
import { format } from 'prettier';

export const plugin: PluginFunction<{}, Types.ComplexPluginOutput> = async (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: {}
) => {
  const allAst = concatAST(documents.map(v => v.document!));

  const visitor = new MethodsVisitor();
  visit(allAst, {
    OperationDefinition: {
      leave: visitor.OperationDefinition
    }
  });
  const content = [visitor.getImports(), visitor.getBaseClass()].join('\n');
  const formattedContent = await format(content, {
    semi: true,
    bracketSpacing: true,
    bracketSameLine: false,
    singleQuote: true,
    tabWidth: 2,
    printWidth: 120,
    trailingComma: 'none',
    arrowParens: 'avoid',
    parser: 'typescript'
  });

  return {
    content: formattedContent
  };
};
