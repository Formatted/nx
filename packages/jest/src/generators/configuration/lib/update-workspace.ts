import { NormalizedJestProjectSchema } from '../schema';
import {
  readProjectConfiguration,
  Tree,
  updateProjectConfiguration,
  joinPathFragments,
  normalizePath,
} from '@nx/devkit';

export function updateWorkspace(
  tree: Tree,
  options: NormalizedJestProjectSchema
) {
  const projectConfig = readProjectConfiguration(tree, options.project);
  if (!projectConfig.targets) {
    projectConfig.targets = {};
  }

  projectConfig.targets.test = {
    executor: '@nx/jest:jest',
    outputs: [
      options.rootProject
        ? joinPathFragments('{workspaceRoot}', 'coverage', '{projectName}')
        : joinPathFragments('{workspaceRoot}', 'coverage', '{projectRoot}'),
    ],
    options: {
      jestConfig: joinPathFragments(
        normalizePath(projectConfig.root),
        `jest.config.${options.js ? 'js' : 'ts'}`
      ),
      passWithNoTests: true,
    },
    configurations: {
      ci: {
        ci: true,
        codeCoverage: true,
      },
    },
  };

  /**
   * @deprecated this will be removed in the v17
   */
  const isUsingTSLint =
    projectConfig.targets.lint?.executor ===
    '@angular-devkit/build-angular:tslint';

  if (isUsingTSLint) {
    projectConfig.targets.lint.options.tsConfig = [
      ...(projectConfig.targets.lint.options.tsConfig || []),
      joinPathFragments(
        normalizePath(projectConfig.root),
        'tsconfig.spec.json'
      ),
    ];
  }
  updateProjectConfiguration(tree, options.project, projectConfig);
}
