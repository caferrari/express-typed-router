import type { Request, Response, NextFunction, Router } from 'express';
import type { Schema } from 'zod';

type tParams<BodyType = unknown, PostType = unknown, QueryType = unknown> = {
  body?: Schema<BodyType>;
  params?: Schema<PostType>;
  query?: Schema<QueryType>;
};

type callbackFn<BodyType, PostType, QQueryType> = (
  req: Request<PostType, any, BodyType, QQueryType>,
  res: Response,
  next: NextFunction
) => Promise<void>;
type postParams<BodyType, PostType> = Pick<tParams<BodyType, PostType, never>, 'params' | 'body'>;
type putParams<BodyType, PostType> = Pick<tParams<BodyType, PostType, never>, 'params' | 'body'>;
type getParams<PostType, QQueryType> = Pick<tParams<never, PostType, QQueryType>, 'params' | 'query'>;
type deleteParams<PostType, QQueryType> = Pick<tParams<never, PostType, QQueryType>, 'params' | 'query'>;

const validateParams = <BodyType, PostType, QueryType>(
  params: tParams,
  callback: callbackFn<BodyType, PostType, QueryType>
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const queryResults: any = params.query?.safeParse(req?.query);
    const bodyResults: any = params.body?.safeParse(req?.body);
    const paramResults: any = params.params?.safeParse(req?.params);

    const errors = queryResults?.error ?? bodyResults?.error ?? paramResults?.error ?? undefined;

    if (errors) {
      return res.status(400).json({ errors });
    }

    try {
      await callback(req as any, res, next);
    } catch (err) {
      next(err);
    }
  };
};

export const NiceRouter = (router: Router) => {
  return {
    get: <PostType, QueryType>(
      path: string,
      params: getParams<PostType, QueryType>,
      callback: callbackFn<never, PostType, QueryType>
    ) => {
      router.get(path, validateParams(params, callback));
    },

    post: <BodyType, PostType>(
      path: string,
      params: postParams<BodyType, PostType>,
      callback: callbackFn<BodyType, PostType, never>
    ) => {
      router.post(path, validateParams(params, callback));
    },

    put: <BodyType, PostType>(
      path: string,
      params: putParams<BodyType, PostType>,
      callback: callbackFn<BodyType, PostType, never>
    ) => {
      router.put(path, validateParams(params, callback));
    },

    delete: <PostType, QueryType>(
      path: string,
      params: deleteParams<PostType, QueryType>,
      callback: callbackFn<never, PostType, QueryType>
    ) => {
      router.get(path, validateParams(params, callback));
    },

    toExpress: () => router as Router,
  };
};
