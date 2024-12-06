import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { Context } from "hono";
import { Bindings } from "@/utils/types";
import {
  createSpaceRouteBaseObject,
  getSpaceRouteBaseObject,
  updateSpaceRouteBaseObject,
} from "./spaceSchema";
import {
  getSpaces,
  getSpace,
  createSpace,
  updateSpace,
  deleteSpace,
} from "./spaceController";
import { selectSpaceSchema, selectSpacesArraySchema } from "@/models/spacesModel";

const getSpacesRoute = createRoute({
  ...getSpaceRouteBaseObject("/", [], selectSpacesArraySchema),
  description: "Get all spaces for the user",
});

async function getSpacesHandler(c: Context) {
  const db = c.get("db");
  const userId = c.get("user").id;
  return await getSpaces(userId, c, db);
}

const getSpaceRoute = createRoute({
  ...getSpaceRouteBaseObject("/:id", [], selectSpaceSchema),
  description: "Get a single space by ID",
});

async function getSpaceHandler(c: Context) {
  const id = c.req.param("id");
  const db = c.get("db");
  const userId = c.get("user").id;
  return await getSpace(parseInt(id), userId, c, db);
}

const createSpaceRoute = createRoute({
  ...createSpaceRouteBaseObject,
  description: "Create a new space",
});

async function createSpaceHandler(c: Context) {
  const db = c.get("db");
  const userId = c.get("user").id;
  const spaceData = await c.req.json();
  return await createSpace(spaceData, userId, c, db);
}

const updateSpaceRoute = createRoute({
  ...updateSpaceRouteBaseObject("/:id", "put", {
    "application/json": {
      schema: selectSpaceSchema,
    },
  }),
  description: "Update a space by ID",
});

async function updateSpaceHandler(c: Context) {
  const id = c.req.param("id");
  const spaceData = await c.req.json();
  const userId = c.get("user").id;
  return await updateSpace(parseInt(id), userId, spaceData, c, c.get("db"));
}

async function deleteSpaceHandler(c: Context) {
  const id = c.req.param("id");
  const userId = c.get("user").id;
  const db = c.get("db");
  return await deleteSpace(parseInt(id), userId, c, db);
}

export default new OpenAPIHono<{ Bindings: Bindings }>()
  .get("/", getSpacesHandler)
  .get("/:id", getSpaceHandler)
  .post("/", createSpaceHandler)
  .put("/:id", updateSpaceHandler)
  .delete("/:id", deleteSpaceHandler); 