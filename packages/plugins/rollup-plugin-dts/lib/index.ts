import { Project, ClassDeclaration, Decorator, PropertyDeclaration } from "ts-morph";
import ts from "typescript"
import path from "path";

interface ComponentDecoratorOptions {
  tag?: string;
}

export default function DTSPlugin({root = './src'} = {}) {
  const tsConfigPath = path.join(process.cwd(), "tsconfig.json");
  const sourceCodePath = path.join(process.cwd(), root);

  const project = new Project({ tsConfigFilePath: tsConfigPath });
  project.addDirectoryAtPath(sourceCodePath);

  interface AllDeclerationsType  {
    [K:string]: ()=>void
  }
  const allDeclerations:AllDeclerationsType  = {};

  return {
    name: "Decoco-dts-rollup-plugin",
    enforce: "pre" as const,
    transform(code:string, id:string) {
      if (!id.endsWith(".tsx")) {
        return null;
      }

      try {
        const sourceFile = project.addSourceFileAtPath(id);
        const declareCodeArr: string[] = [];

        sourceFile.getClasses().forEach((classDeclaration: ClassDeclaration) => {
          const className = classDeclaration.getName();
          if (!className) return;

          const classDecorators = classDeclaration.getDecorators();
          const classDecoratorNames = classDecorators?.map((decorator: Decorator) =>
            decorator.getName()
          );
          const classProperties = classDeclaration.getProperties();
          const classProertiesHasPropDecorator = classProperties?.filter(
            (property: PropertyDeclaration) =>
              property
                .getDecorators()
                ?.some((decorator: Decorator) => decorator.getName() === "Prop")
          );

          if (
            classDecoratorNames?.includes("Component") &&
            classDeclaration.getExtends()?.getExpression().getText() ===
            "DecoElement"
          ) {
            const extendClass = classDeclaration.getExtends();
            if (!extendClass) return;

            const props = classProertiesHasPropDecorator?.map((property: PropertyDeclaration) => [
              property
                .getModifiers()
                .map((i) => i.getText())
                .filter((i) => !/@/.test(i))
                .join(" "), // e.g. readonly, filter out decorator
              property.getName(), // propertyName
              (property.getQuestionTokenNode()?.getText() || "") + ":", // ?:
              property.getType().getText(), // type
            ]);

            const ComponentDecorator = classDecorators?.find(
              (i: Decorator) => i.getName() === "Component"
            );
            if (!ComponentDecorator) return;

            const firstArg = ComponentDecorator.getArguments()[0];
            const tagName = firstArg.isKind(ts.SyntaxKind.ObjectLiteralExpression)
              ? (((firstArg).getProperty("tag") as any)?.getInitializer()?.getText() || "").replace(/"'/g, "")
              : (firstArg?.getText() || "").replace(/"'/g, "");

            const intrinsicElementsInterface = createIntrinsicElementsInterface(
              tagName,
              props?.map((i) => i.join(" ")).join(";") || ""
            );
            const componentInterfaceName = className + "Props";
            const componentInterface = createComponentInterface(
              componentInterfaceName,
              props?.map((i) => i.join(" ")).join(";") || ""
            );

            declareCodeArr.push(componentInterface, intrinsicElementsInterface);

            extendClass.addTypeArgument(componentInterfaceName);
          }
        });

        const end = sourceFile.getEnd();
        sourceFile.insertText(end, declareCodeArr.join("\n"));

        allDeclerations[id] = () =>
          sourceFile.emit({ emitOnlyDtsFiles: true }).catch((err) => {
            console.error(`[Decoco]${id} generate dts error:`);
            console.error(err);
          });


        return {
          code: sourceFile.getFullText(),
          map: null
        };

      } catch (err) {
        console.error('[@decoco/rollup-plugin-dts] ', err);
        return null;
      }
    },

    writeBundle() {
      try {
          for (const id of Object.keys(allDeclerations)) {
            allDeclerations[id]();
          }
      } catch (err) {
        console.error('[@decoco/rollup-plugin-dts] ', err);
      }

    },
  };
}

function createIntrinsicElementsInterface(tagName: string, props: string) {
  return `declare global {
    namespace JSX {
      interface IntrinsicElements {
        "${tagName}":${props ? `{${props}}` : "{}"}
      }
    }
  }
  `;
}
function createComponentInterface(componentInterfaceName: string, props: string) {
  return `export interface ${componentInterfaceName} ${props ? `{
  ${props}
}` : "{}"}
`;
}

