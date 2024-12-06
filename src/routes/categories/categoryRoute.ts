import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { Context } from "hono";
import { Bindings } from "@/utils/types";
import {
  createCategoryRouteBaseObject,
  getCategoryRouteBaseObject,
  updateCategoryRouteBaseObject,
} from "./categorySchema";
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from "./categoryController";
import { selectCategoriesSchema, selectCategoriesArraySchema } from "@/models/categoriesModel";

const getCategoriesRoute = createRoute({
  ...getCategoryRouteBaseObject("/", [], selectCategoriesArraySchema),
  description: "Get all categories for the user",
});

async function getCategoriesHandler(c: Context) {
  const db = c.get("db");
  const userId = c.get("user").id;
  return await getCategories(userId, c, db);
}

const getCategoryRoute = createRoute({
  ...getCategoryRouteBaseObject("/:id", [], selectCategoriesSchema),
  description: "Get a single category by ID",
});

async function getCategoryHandler(c: Context) {
  const id = c.req.param("id");
  const db = c.get("db");
  const userId = c.get("user").id;
  return await getCategory(parseInt(id), userId, c, db);
}

const createCategoryRoute = createRoute({
  ...createCategoryRouteBaseObject,
  description: "Create a new category",
});

async function createCategoryHandler(c: Context) {
  const db = c.get("db");
  const userId = c.get("user").id;
  const categoryData = await c.req.json();
  return await createCategory(categoryData, userId, c, db);
}

const updateCategoryRoute = createRoute({
  ...updateCategoryRouteBaseObject("/:id", "put", {
    "application/json": {
      schema: selectCategoriesSchema,
    },
  }),
  description: "Update a category by ID",
});

async function updateCategoryHandler(c: Context) {
  const id = c.req.param("id");
  const categoryData = await c.req.json();
  const userId = c.get("user").id;
  return await updateCategory(parseInt(id), userId, categoryData, c, c.get("db"));
}

async function deleteCategoryHandler(c: Context) {
  const id = c.req.param("id");
  const userId = c.get("user").id;
  const db = c.get("db");
  return await deleteCategory(parseInt(id), userId, c, db);
}

export default new OpenAPIHono<{ Bindings: Bindings }>()
  .get("/", getCategoriesHandler)
  .get("/:id", getCategoryHandler)
  .post("/", createCategoryHandler)
  .put("/:id", updateCategoryHandler)
  .delete("/:id", deleteCategoryHandler); 