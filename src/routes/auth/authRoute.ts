import { OpenAPIHono } from "@hono/zod-openapi";
import { Context } from "hono";
import { Bindings } from "@/utils/types";
import {
  deleteAccountRouteObject,
  deactivateAccountRouteObject,
  reactivateAccountRouteObject,
} from "./authSchema";
import {
  deleteAccount,
  deactivateAccount,
  reactivateAccount,
} from "./authController";

type AuthContext = Context<{ Bindings: Bindings }>;

const authRouter = new OpenAPIHono<{ Bindings: Bindings }>();

authRouter.openapi(deleteAccountRouteObject, (c: AuthContext) =>
  deleteAccount(c)
);
authRouter.openapi(deactivateAccountRouteObject, (c: AuthContext) =>
  deactivateAccount(c)
);
authRouter.openapi(reactivateAccountRouteObject, (c: AuthContext) =>
  reactivateAccount(c)
);

export default authRouter;
