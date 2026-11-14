import path from 'node:path';
import { Config } from '@remotion/cli/config';

// Three.js needs a real GL backend in headless Chromium.
Config.setChromiumOpenGlRenderer('angle');
Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
// Let ../shared/scene.js resolve `three` from this project's node_modules.
Config.overrideWebpackConfig((c) => ({
  ...c,
  resolve: { ...c.resolve, modules: [path.resolve(process.cwd(), 'node_modules'), 'node_modules'] },
}));
