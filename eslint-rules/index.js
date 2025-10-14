/**
 * Custom ESLint rules for architectural enforcement
 * P0 Critical: Prevent codebase degradation and enforce standards
 */

const path = require("path");
const fs = require("fs");

/**
 * Rule: Enforce maximum file size (lines of code)
 * Purpose: Prevent monolithic files; 600+ line files are red flags
 */
const maxFileSizeRule = {
  meta: {
    type: "problem",
    docs: {
      description: "Enforce maximum file size to prevent monolithic files",
      category: "Best Practices",
      recommended: true,
    },
    messages: {
      fileTooLarge:
        "File has {{actual}} lines but maximum allowed is {{max}} lines. Split into smaller, focused modules.",
    },
    schema: [
      {
        type: "object",
        properties: {
          max: { type: "number" },
          ignoreComments: { type: "boolean" },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const options = context.options[0] || {};
    const maxLines = options.max || 400;
    const ignoreComments = options.ignoreComments !== false;

    return {
      Program(node) {
        const sourceCode = context.getSourceCode();
        const lines = sourceCode.lines.length;

        let actualLines = lines;
        if (ignoreComments) {
          // Count non-comment, non-blank lines
          const text = sourceCode.getText();
          const codeLines = text.split("\n").filter((line) => {
            const trimmed = line.trim();
            return (
              trimmed &&
              !trimmed.startsWith("//") &&
              !trimmed.startsWith("*") &&
              !trimmed.startsWith("/*")
            );
          });
          actualLines = codeLines.length;
        }

        if (actualLines > maxLines) {
          context.report({
            node,
            messageId: "fileTooLarge",
            data: {
              actual: actualLines,
              max: maxLines,
            },
          });
        }
      },
    };
  },
};

/**
 * Rule: Enforce architectural boundaries
 * Purpose: Prevent circular dependencies and maintain clean architecture
 */
const architectureBoundariesRule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Enforce architectural layer boundaries and import restrictions",
      category: "Architecture",
      recommended: true,
    },
    messages: {
      invalidImport:
        "Components ({{from}}) cannot import from app directory ({{to}}). Use contexts or hooks instead.",
      circularDependency:
        "Potential circular dependency detected between {{from}} and {{to}}.",
      layerViolation:
        "{{layer}} layer cannot import from {{targetLayer}} layer. Respect dependency flow: app -> components -> domain -> lib.",
    },
    schema: [],
  },
  create(context) {
    const filename = context.getFilename();
    if (!filename || filename === "<input>") return {};

    const relativePath = path.relative(process.cwd(), filename);

    return {
      ImportDeclaration(node) {
        const importPath = node.source.value;

        // Rule 1: Components cannot import from app directory
        if (
          relativePath.includes("src/components") &&
          !relativePath.includes("__tests__")
        ) {
          if (importPath.includes("/app/") || importPath.startsWith("../app")) {
            context.report({
              node,
              messageId: "invalidImport",
              data: {
                from: relativePath,
                to: importPath,
              },
            });
          }
        }

        // Rule 2: Enforce layered architecture
        // app -> components -> domain -> lib (-> external)
        const layers = [
          "lib",
          "domain",
          "hooks",
          "contexts",
          "components",
          "app",
        ];
        const currentLayer = layers.find((l) =>
          relativePath.includes(`src/${l}`),
        );

        if (currentLayer) {
          const currentLayerIndex = layers.indexOf(currentLayer);

          layers.forEach((targetLayer, targetIndex) => {
            // Can't import from higher layers
            if (
              targetIndex > currentLayerIndex &&
              (importPath.includes(`/${targetLayer}/`) ||
                importPath.includes(`src/${targetLayer}`))
            ) {
              context.report({
                node,
                messageId: "layerViolation",
                data: {
                  layer: currentLayer,
                  targetLayer: targetLayer,
                },
              });
            }
          });
        }

        // Rule 3: lib/ should not import from domain/contexts/hooks/components/app
        if (
          relativePath.includes("src/lib") &&
          !relativePath.includes("__tests__")
        ) {
          const forbiddenPaths = [
            "domain",
            "contexts",
            "hooks",
            "components",
            "app",
          ];
          forbiddenPaths.forEach((forbidden) => {
            if (
              importPath.includes(`/${forbidden}/`) ||
              importPath.includes(`src/${forbidden}`)
            ) {
              context.report({
                node,
                messageId: "layerViolation",
                data: {
                  layer: "lib",
                  targetLayer: forbidden,
                },
              });
            }
          });
        }
      },
    };
  },
};

/**
 * Rule: Enforce component complexity limits
 * Purpose: Keep components focused and maintainable
 */
const componentComplexityRule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Enforce component complexity limits (props, state, handlers)",
      category: "Best Practices",
      recommended: true,
    },
    messages: {
      tooManyProps:
        "Component has {{count}} props but maximum is {{max}}. Consider composition or grouping props.",
      tooManyStateVars:
        "Component has {{count}} useState calls but maximum is {{max}}. Consider useReducer or consolidating state.",
      tooManyHandlers:
        "Component has {{count}} event handlers but maximum is {{max}}. Extract logic to custom hooks.",
    },
    schema: [
      {
        type: "object",
        properties: {
          maxProps: { type: "number" },
          maxStateVars: { type: "number" },
          maxHandlers: { type: "number" },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const options = context.options[0] || {};
    const maxProps = options.maxProps || 10;
    const maxStateVars = options.maxStateVars || 8;
    const maxHandlers = options.maxHandlers || 10;

    let componentNode = null;
    let propsCount = 0;
    let stateVarsCount = 0;
    let handlersCount = 0;

    return {
      // Track function components
      "FunctionDeclaration[id.name=/^[A-Z]/]"(node) {
        componentNode = node;
        propsCount =
          node.params.length > 0 && node.params[0].type === "ObjectPattern"
            ? node.params[0].properties.length
            : 0;
        stateVarsCount = 0;
        handlersCount = 0;
      },

      // Track arrow function components (export const Component = () => {})
      "VariableDeclarator[id.name=/^[A-Z]/] > ArrowFunctionExpression"(node) {
        componentNode = node;
        propsCount =
          node.params.length > 0 && node.params[0].type === "ObjectPattern"
            ? node.params[0].properties.length
            : 0;
        stateVarsCount = 0;
        handlersCount = 0;
      },

      // Count useState calls
      'CallExpression[callee.name="useState"]'() {
        if (componentNode) {
          stateVarsCount++;
        }
      },

      // Count event handlers (functions starting with 'handle')
      "VariableDeclarator[id.name=/^handle/] > ArrowFunctionExpression"() {
        if (componentNode) {
          handlersCount++;
        }
      },

      "FunctionDeclaration[id.name=/^handle/]"() {
        if (componentNode) {
          handlersCount++;
        }
      },

      // Check limits when exiting component
      "FunctionDeclaration[id.name=/^[A-Z]/]:exit"(node) {
        if (componentNode === node) {
          if (propsCount > maxProps) {
            context.report({
              node: node.params[0] || node,
              messageId: "tooManyProps",
              data: { count: propsCount, max: maxProps },
            });
          }
          if (stateVarsCount > maxStateVars) {
            context.report({
              node,
              messageId: "tooManyStateVars",
              data: { count: stateVarsCount, max: maxStateVars },
            });
          }
          if (handlersCount > maxHandlers) {
            context.report({
              node,
              messageId: "tooManyHandlers",
              data: { count: handlersCount, max: maxHandlers },
            });
          }
          componentNode = null;
        }
      },

      "VariableDeclarator[id.name=/^[A-Z]/] > ArrowFunctionExpression:exit"(
        node,
      ) {
        if (componentNode === node) {
          if (propsCount > maxProps) {
            context.report({
              node: node.params[0] || node,
              messageId: "tooManyProps",
              data: { count: propsCount, max: maxProps },
            });
          }
          if (stateVarsCount > maxStateVars) {
            context.report({
              node,
              messageId: "tooManyStateVars",
              data: { count: stateVarsCount, max: maxStateVars },
            });
          }
          if (handlersCount > maxHandlers) {
            context.report({
              node,
              messageId: "tooManyHandlers",
              data: { count: handlersCount, max: maxHandlers },
            });
          }
          componentNode = null;
        }
      },
    };
  },
};

/**
 * Rule: No direct DOM manipulation in React components
 * Purpose: Enforce React patterns, use refs and React APIs
 */
const noDomManipulationRule = {
  meta: {
    type: "problem",
    docs: {
      description: "Prevent direct DOM manipulation in React components",
      category: "Best Practices",
      recommended: true,
    },
    messages: {
      noDomManipulation:
        "Direct DOM manipulation detected ({{method}}). Use React refs and state instead.",
    },
    schema: [],
  },
  create(context) {
    const forbiddenMethods = [
      "querySelector",
      "querySelectorAll",
      "getElementById",
      "getElementsByClassName",
      "getElementsByTagName",
      "appendChild",
      "removeChild",
      "insertBefore",
      "replaceChild",
    ];

    return {
      MemberExpression(node) {
        if (node.property && node.property.type === "Identifier") {
          const methodName = node.property.name;
          if (forbiddenMethods.includes(methodName)) {
            // Allow in useEffect and useLayoutEffect
            let parent = node.parent;
            let inEffect = false;
            while (parent) {
              if (
                parent.type === "CallExpression" &&
                parent.callee.name &&
                (parent.callee.name === "useEffect" ||
                  parent.callee.name === "useLayoutEffect")
              ) {
                inEffect = true;
                break;
              }
              parent = parent.parent;
            }

            if (!inEffect) {
              context.report({
                node,
                messageId: "noDomManipulation",
                data: { method: methodName },
              });
            }
          }
        }
      },
    };
  },
};

/**
 * Rule: Enforce proper error handling patterns
 * Purpose: Ensure errors are handled appropriately
 */
const requireErrorHandlingRule = {
  meta: {
    type: "problem",
    docs: {
      description: "Require proper error handling for async operations",
      category: "Best Practices",
      recommended: true,
    },
    messages: {
      missingErrorHandling:
        "Async operation without try-catch or .catch(). Add error handling.",
    },
    schema: [],
  },
  create(context) {
    return {
      // Check async functions for try-catch
      "FunctionDeclaration[async=true], FunctionExpression[async=true], ArrowFunctionExpression[async=true]"(
        node,
      ) {
        const body = node.body;
        if (body.type === "BlockStatement") {
          const hasTryCatch = body.body.some(
            (statement) => statement.type === "TryStatement",
          );

          // Check if function body has await calls
          let hasAwait = false;
          const checkAwait = (n) => {
            if (n.type === "AwaitExpression") {
              hasAwait = true;
            }
          };

          const traverse = (n) => {
            checkAwait(n);
            if (n && typeof n === "object") {
              Object.keys(n).forEach((key) => {
                if (key !== "parent" && n[key] && typeof n[key] === "object") {
                  traverse(n[key]);
                }
              });
            }
          };
          traverse(body);

          if (hasAwait && !hasTryCatch) {
            // Allow if function name suggests error handling is delegated
            const functionName = node.id?.name || node.parent?.id?.name || "";
            if (
              !functionName.includes("Unsafe") &&
              !functionName.includes("NoThrow")
            ) {
              context.report({
                node,
                messageId: "missingErrorHandling",
              });
            }
          }
        }
      },
    };
  },
};

module.exports = {
  rules: {
    "max-file-size": maxFileSizeRule,
    "architecture-boundaries": architectureBoundariesRule,
    "component-complexity": componentComplexityRule,
    "no-dom-manipulation": noDomManipulationRule,
    "require-error-handling": requireErrorHandlingRule,
  },
};
