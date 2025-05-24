import { visit, concatAST } from 'graphql';
import { MethodsVisitor } from './visitor';
import { format } from 'prettier';
export const plugin = async (schema, documents, config) => {
    const allAst = concatAST(documents.map(v => v.document));
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
//# sourceMappingURL=index.js.map