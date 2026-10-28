import ts from 'typescript';
import { businessInfo } from '../lib/business';

export type PageLink = { href: string; location: string };
type Value = string | { [key: string]: Value } | Value[];

// Inspect source without importing App's browser-only dependencies. Unsupported
// expressions fail closed so a refactor cannot silently remove link coverage.
export function navigationLinks(source: string): PageLink[] {
  const file = ts.createSourceFile('App.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const links: PageLink[] = [];
  const elements: (ts.JsxOpeningElement | ts.JsxSelfClosingElement)[] = [];
  function collect(node: ts.Node) {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) elements.push(node);
    ts.forEachChild(node, collect);
  }
  collect(file);

  function location(node: ts.Node) {
    const { line, character } = file.getLineAndCharacterOfPosition(node.getStart(file));
    return `App.tsx:${line + 1}:${character + 1}`;
  }
  function unsupported(node: ts.Node): never {
    throw new Error(`${location(node)}: cannot inspect navigation expression ${node.getText(file)}; update navigation coverage`);
  }
  function attribute(node: typeof elements[number], name: string) {
    return node.attributes.properties.find(
      (prop): prop is ts.JsxAttribute => ts.isJsxAttribute(prop) && prop.name.getText(file) === name,
    );
  }
  function values(node: ts.Node, resolving = new Set<ts.Node>()): Value[] {
    if (resolving.has(node)) return unsupported(node);
    const next = new Set(resolving).add(node);
    const evaluate = (child: ts.Node) => values(child, next);
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return [node.text];
    if (ts.isJsxExpression(node) && node.expression) return evaluate(node.expression);
    if (ts.isParenthesizedExpression(node)) return evaluate(node.expression);
    if (ts.isConditionalExpression(node)) return [...evaluate(node.whenTrue), ...evaluate(node.whenFalse)];
    // Contact links are out of scope; do not validate their addresses.
    if (ts.isTemplateExpression(node) && /^(mailto:|tel:)/i.test(node.head.text)) return [node.head.text];
    if (ts.isTemplateExpression(node)) {
      let strings = [node.head.text];
      for (const span of node.templateSpans) {
        const parts = evaluate(span.expression);
        strings = strings.flatMap((prefix) => parts.map((part) => {
          if (typeof part !== 'string') return unsupported(span.expression);
          return prefix + part + span.literal.text;
        }));
      }
      return strings;
    }
    if (ts.isArrayLiteralExpression(node)) return node.elements.flatMap(evaluate);
    if (ts.isObjectLiteralExpression(node)) {
      // Only href matters for mapped navigation records.
      const href = node.properties.find(
        (prop): prop is ts.PropertyAssignment => ts.isPropertyAssignment(prop) && prop.name.getText(file) === 'href',
      );
      if (!href) return unsupported(node);
      return evaluate(href.initializer).map((href) => ({ href }));
    }
    if (ts.isPropertyAccessExpression(node)) {
      // Route matching is relative to the Wouter base; this site is mounted at /.
      if (node.getText(file) === 'import.meta.env.BASE_URL') return ['/'];
      return evaluate(node.expression).map((object) => {
        if (typeof object === 'object' && !Array.isArray(object) && node.name.text in object) {
          return object[node.name.text];
        }
        return unsupported(node);
      });
    }
    if (ts.isIdentifier(node)) {
      if (node.text === 'businessInfo') return [businessInfo as unknown as Value];
      // Resolve map callback parameters to every record in the mapped list.
      for (let scope: ts.Node | undefined = node.parent; scope; scope = scope.parent) {
        if (ts.isArrowFunction(scope) && scope.parameters.some((param) => param.name.getText(file) === node.text)) {
          const call = scope.parent;
          if (ts.isCallExpression(call) && ts.isPropertyAccessExpression(call.expression) && call.expression.name.text === 'map') {
            return evaluate(call.expression.expression);
          }
        }
        if (ts.isFunctionDeclaration(scope) && scope.name?.text === 'ButtonArrow' && node.text === 'href') {
          const pattern = scope.parameters[0]?.name;
          if (!pattern || !ts.isObjectBindingPattern(pattern)) return unsupported(node);
          const binding = pattern.elements.find((item) => item.name.getText(file) === 'href');
          return elements.filter((element) => element.tagName.getText(file) === 'ButtonArrow').flatMap((element) => {
            const href = attribute(element, 'href');
            const expression = href?.initializer ?? binding?.initializer;
            return expression ? evaluate(expression) : unsupported(element);
          });
        }
        if (ts.isBlock(scope) || ts.isSourceFile(scope)) {
          for (const statement of scope.statements) {
            if (!ts.isVariableStatement(statement)) continue;
            const declaration = statement.declarationList.declarations.find((item) => item.name.getText(file) === node.text);
            if (declaration?.initializer) return evaluate(declaration.initializer);
          }
        }
      }
    }
    return unsupported(node);
  }

  for (const element of elements) {
    const tag = element.tagName.getText(file);
    if (!['Link', 'NavLink', 'a', 'ButtonArrow'].includes(tag)) continue;
    if (element.attributes.properties.some(ts.isJsxSpreadAttribute)) unsupported(element);
    const href = attribute(element, 'href');
    if (!href?.initializer) {
      if (tag === 'ButtonArrow') continue; // Its default is evaluated at the wrapped Link.
      unsupported(element);
    }
    const id = attribute(element, 'data-testid')?.initializer;
    const label = id && ts.isStringLiteral(id) ? ` [${id.text}]` : '';
    for (const value of values(href.initializer)) {
      if (typeof value !== 'string') unsupported(href);
      // Page coverage only: not external URLs, contact links, or same-page anchors.
      if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(value)) continue;
      links.push({ href: value, location: `${location(element)} <${tag}>${label}` });
    }
  }
  return links;
}
