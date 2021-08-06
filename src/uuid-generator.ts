import { v4 } from 'uuid';

import { createGenerator } from './data-generator';

/**
 * Creates a generator that outputs a random UUID
 */
export const uuidGenerator = createGenerator(() => v4());
