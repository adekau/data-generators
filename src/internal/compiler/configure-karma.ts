import { CONSTANTS } from './constants';

export interface IDataGeneratorCompilerConfig {
    [CONSTANTS.DEBUG_ENABLE_ENV_VAR]?: boolean;
    [CONSTANTS.DEBUG_WIDTH_ENV_VAR]?: number;
}

export const defaultDataGeneratorCompilerConfig: Required<IDataGeneratorCompilerConfig> = {
    DG_DEBUG_ENABLED: false,
    DG_DEBUG_WIDTH: 4
};

export function configureKarma(config: IDataGeneratorCompilerConfig): void {
    const merged = Object.assign({}, defaultDataGeneratorCompilerConfig, config);
    Object.keys(merged).forEach((key) => {
        (window as any)[key] = merged[key as keyof IDataGeneratorCompilerConfig];
    });
}
