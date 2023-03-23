import { CONSTANTS } from './constants';

export interface IDataGeneratorCompilerConfig {
    [CONSTANTS.DEBUG_ENABLE_ENV_VAR]?: boolean;
    [CONSTANTS.DEBUG_WIDTH_ENV_VAR]?: number;
}

export const defaultDataGeneratorCompilerConfig: Required<IDataGeneratorCompilerConfig> = {
    DG_DEBUG_ENABLED: CONSTANTS['DEBUG_ENABLE_DEFAULT'],
    DG_DEBUG_WIDTH: CONSTANTS['DEBUG_WIDTH_DEFAULT']
};
