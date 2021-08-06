import { v4 } from 'uuid';

import { createGenerator } from './data-generator';

export const uuidGenerator = createGenerator(() => v4());
