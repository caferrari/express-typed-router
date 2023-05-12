# Create a fully typed router to use with Express


## Sample

```typescript:
import { Router } from 'express';
import * as jwt from 'jsonwebtoken';
import { z } from 'zod';

import { NiceRouter } from 'express-typed-router';

const router = NiceRouter(Router());

router.post(
  '/login',
  {
    body: z.object({ username: z.string(), password: z.string() }),
  },
  async (req, res) => {

    // yout authentication logic

    const token = jwt.sign({ 
      user: req.body.username 
    }, 'my secret', {
      expiresIn: '1 day',
      algorithm: 'HS256',
    });

    res.json({
      token,
    });
  }
);

export const authRouter = router.toExpress();
```
