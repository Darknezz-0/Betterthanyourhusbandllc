import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
import { expect } from 'vitest';
import { Route, Router, Switch } from 'wouter';

export function publicRoutes(source: string) {
  const file = ts.createSourceFile('App.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const switches: ts.JsxElement[] = [];
  function visit(node: ts.Node) {
    if (ts.isJsxElement(node) && node.openingElement.tagName.getText(file) === 'Switch') {
      switches.push(node);
    }
    ts.forEachChild(node, visit);
  }
  visit(file);
  expect(switches, 'expected one public Wouter Switch in App.tsx').toHaveLength(1);

  return switches[0].children.flatMap((child) => {
    if (ts.isJsxText(child)) return [];
    if (ts.isJsxExpression(child) && !child.expression) return [];
    const opening = ts.isJsxElement(child) ? child.openingElement : child;
    if (!ts.isJsxOpeningElement(opening) && !ts.isJsxSelfClosingElement(opening)) {
      throw new Error('Unsupported Switch child; update the route coverage check');
    }
    expect(opening.tagName.getText(file)).toBe('Route');
    const attributes = opening.attributes.properties;
    expect(attributes.some(ts.isJsxSpreadAttribute), 'inspect spread route props explicitly').toBe(false);
    const pathAttribute = attributes.find(
      (attribute) => ts.isJsxAttribute(attribute) && attribute.name.getText(file) === 'path',
    );
    let path: string | undefined;
    if (pathAttribute && ts.isJsxAttribute(pathAttribute)) {
      const initializer = pathAttribute.initializer;
      if (!initializer || !ts.isStringLiteral(initializer)) {
        throw new Error('Expected a literal public route path; update the route coverage check');
      }
      path = initializer.text;
    }
    let isNotFound = false;
    function findNotFound(node: ts.Node) {
      if (ts.isIdentifier(node) && node.text === 'NotFound') isNotFound = true;
      ts.forEachChild(node, findNotFound);
    }
    findNotFound(child);
    return [createElement(Route, { key: String(path), path },
      isNotFound ? 'not-found' : `public:${path}`,
    )];
  });
}

export function expectPublicPath(routes: ReturnType<typeof publicRoutes>, path: string) {
  const rendered = renderToStaticMarkup(
    createElement(Router, { ssrPath: path, children: createElement(Switch, null, ...routes) }),
  );
  expect(rendered, `${path} must resolve to its public Route, not NotFound or another route`)
    .toBe(`public:${path}`);
}
