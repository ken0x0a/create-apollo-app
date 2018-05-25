import * as fs from 'fs';
import * as path from 'path';

import { Builder } from '../Builder';
import { ConfigPlugin } from '../ConfigPlugin';
import Spin from '../Spin';
import JSRuleFinder from './shared/JSRuleFinder';

export default class TypeScriptPlugin implements ConfigPlugin {
  public configure(builder: Builder, spin: Spin) {
    const stack = builder.stack;

    if (stack.hasAll(['ts', 'webpack'])) {
      const atl = builder.require.probe('awesome-typescript-loader') ? 'awesome-typescript-loader' : undefined;
      const jsRuleFinder = new JSRuleFinder(builder);
      const tsRule = jsRuleFinder.findAndCreateTSRule();
      tsRule.test = /^(?!.*[\\\/]node_modules[\\\/]).*\.ts$/;
      tsRule.use = [
        atl
          ? {
              loader: atl,
              options: spin.createConfig(builder, 'awesomeTypescript', { ...builder.tsLoaderOptions })
            }
          : {
              loader: 'ts-loader',
              options: spin.createConfig(builder, 'tsLoader', { silent: true, ...builder.tsLoaderOptions })
            }
      ];

      if (atl) {
        builder.config = spin.merge(builder.config, {
          plugins: [new (builder.require('awesome-typescript-loader')).CheckerPlugin()]
        });
      }

      builder.config.resolve.extensions = ['.']
        .map(prefix => jsRuleFinder.extensions.map(ext => prefix + ext))
        .reduce((acc, val) => acc.concat(val))
        .concat(['.json']);

      if (!stack.hasAny('dll')) {
        for (const key of Object.keys(builder.config.entry)) {
          const entry = builder.config.entry[key];
          for (let idx = 0; idx < entry.length; idx++) {
            const item = entry[idx];
            if (['.js', '.jsx', '.ts', '.tsx'].indexOf(path.extname(item)) >= 0 && item.indexOf('node_modules') < 0) {
              const baseItem = path.join(path.dirname(item), path.basename(item, path.extname(item)));
              for (const ext of ['.js', '.jsx', '.ts', '.tsx']) {
                if (fs.existsSync(baseItem + ext)) {
                  entry[idx] = (baseItem.startsWith('.') ? '' : './') + baseItem + ext;
                }
              }
            }
          }
        }
      }
    }
  }
}