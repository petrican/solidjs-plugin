import { formatFiles, names, Tree, updateJson } from '@nx/devkit';
import { mkdirSync } from 'fs';
import { CreateAppGeneratorSchema } from './schema';
import { applicationGenerator as reactAppGenerator } from '@nx/react';
import { Linter } from '@nx/linter';
import { execSync } from 'child_process';
import { promises as fsPromises } from 'fs';

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default async function (tree: Tree, options: CreateAppGeneratorSchema) {
  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  if (!tree.exists('apps')) {
    await fsPromises.mkdir('apps');
  }

  await delay(2000);

  await reactAppGenerator(tree, {
    name: options.name,
    e2eTestRunner: 'none',
    linter: Linter.EsLint,
    style: 'css',
    bundler: 'vite',
  });



  // if (!tree.exists('apps')) {
  //   mkdirSync(`apps`);
  //   mkdirSync(`apps/${names(options.name).fileName}`, { recursive: true });
  //   console.log(`Folder created: apps`);
  // } 

  tree.write(
    `apps/${names(options.name).fileName}/vite.config.ts`,
    `
    import { defineConfig } from 'vite';
    import solidPlugin from 'vite-plugin-solid';
    import viteTsConfigPaths from 'vite-tsconfig-paths'

    export default defineConfig({
      plugins: [
        solidPlugin(),
        viteTsConfigPaths({
          root: '../../',
        }),
      ],
      server: {
        port: 3000,
      },
      build: {
        target: 'esnext',
      },
    });
    `
  );

  tree.write(
    `apps/${names(options.name).fileName}/index.html`,
    `<!DOCTYPE html>
                <html lang="en">
                    <head>
                        <meta charset="utf-8" />
                        <base href="/" />
                        <meta name="viewport" content="width=device-width, initial-scale=1" />
                        <link rel="shortcut icon" type="image/ico" href="/src/assets/favicon.ico" />
                        <link rel="stylesheet" href="/src/styles.css" />
                        <title>Solid App - NX</title>
                    </head>
                    <body>
                        <noscript>You need to enable JavaScript to run this app</noscript>
                        <div id="root"></div>
                        <script type="module" src="/src/index.tsx"></script>
                    </body>
            </html>`
  );

  tree.write(
    `apps/${names(options.name).fileName}/src/App.tsx`,
    `import type { Component } from 'solid-js';
    import styles from './App.module.scss';

    const App: Component = () => {
       return (<div><header class={styles.header}>Solid App NX </header></div>)
    };

    export default App;
  `
  );

  tree.write(
    `apps/${names(options.name).fileName}/src/index.css`,
    `body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  code {
    font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace;
  }`
  );

  tree.write(
    `apps/${names(options.name).fileName}/src/App.module.scss`,
    `
    .App {
      text-align: center;
    }

    .logo {
      animation: logo-spin infinite 20s linear;
      height: 40vmin;
      pointer-events: none;
    }

    .header {
      background-color: #282c34;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: calc(10px + 2vmin);
      color: white;
    }

    .link {
      color: #b318f0;
     }

    @keyframes logo-spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
    }

    `
  );

  tree.write(
    `apps/${names(options.name).fileName}/src/index.tsx`,
    `
    /* @refresh reload */
    import { render } from 'solid-js/web';

    import './index.css';
    import App from './App';

    const root = document.getElementById('root');

    if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
      throw new Error(
        'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got mispelled?',
      );
    }

    render(() => <App />, root!);
  `
  );

  await delay(2000);

  updateJson(
    tree,
    `apps/${names(options.name).fileName}/project.json`,
    (json) => ({
      ...json,
      targets: {
        ...json.targets,
      },
    })
  );

  updateJson(
    tree,
    `apps/${names(options.name).fileName}/tsconfig.json`,
    (json) => ({
      ...json,
      compilerOptions: {
        strict: true,
        target: 'ESNext',
        module: 'ESNext',
        moduleResolution: 'node',
        allowSyntheticDefaultImports: true,
        esModuleInterop: true,
        jsx: 'preserve',
        jsxImportSource: 'solid-js',
        types: ['vite/client'],
        noEmit: true,
        isolatedModules: true,
      },
    })
  );

  tree.delete(`apps/${names(options.name).fileName}/src/main.tsx`);
  tree.delete(`apps/${names(options.name).fileName}/src/app`);
  await formatFiles(tree);

  execSync('npm install', { stdio: 'inherit' });

  console.log('---------------------');
  console.log(`Installation complete`)
  console.log('---------------------');


}
