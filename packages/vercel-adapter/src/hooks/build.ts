import { BuildContext, FRONTEND_TARGET, BACKEND_TARGET, ConfigUtil, PathUtil } from '@malagu/cli-common';
import { resolve } from 'path';
import { writeJSON, ensureDir } from 'fs-extra';

export default async (context: BuildContext) => {
    const { cfg } = context;
    let vercelConfig: any = {};

    for (const target of [ BACKEND_TARGET, FRONTEND_TARGET ]) {
        if (ConfigUtil.support(cfg, target)) {
            const config = ConfigUtil.getMalaguConfig(cfg, target).vercel.config;
            if (target === BACKEND_TARGET) {
                vercelConfig = ConfigUtil.merge(config, vercelConfig);
            } else {
                vercelConfig = ConfigUtil.merge(vercelConfig, config);
            }
        }
    }

    if (!ConfigUtil.support(cfg, FRONTEND_TARGET)) {
        vercelConfig.routes.push({
            src: '/.*',
            dest: 'dist/backend/index.js'
        });
    }
    await ensureDir(PathUtil.getProjectHomePath());
    const configPath = resolve(PathUtil.getProjectHomePath(), 'vercel.json');
    await writeJSON(configPath, vercelConfig, { spaces: 2 });
};
