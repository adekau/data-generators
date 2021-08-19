import { v4 } from 'uuid';

import { createGenerator } from '../creation/data-generator';

/**
 * Creates a generator that outputs a random UUID
 *
 * @category Library
 */
export const uuidGenerator = createGenerator(() => v4());
