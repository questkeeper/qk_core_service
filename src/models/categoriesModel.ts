import {
  pgTable,
  serial,
  timestamp,
  boolean,
  integer,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { spacesTable } from "./spacesModel";
import { createSelectSchema } from "drizzle-zod";
import { z } from "@hono/zod-openapi";

export const categoriesTable = pgTable("categories", {
  id: serial("id").primaryKey().$type<number>(),
  createdAt: timestamp("createdAt", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true })
    .notNull()
    .defaultNow(),
  userId: uuid("user_id").notNull(),
  title: varchar("title").notNull(),
  color: varchar("color"),
  archived: boolean("archived").notNull().default(false),
  spaceId: integer("spaceId").references(() => spacesTable.id),
});

export const selectCategoriesSchema = createSelectSchema(categoriesTable, {
  id: z.string().transform((v) => parseInt(v, 10)),
});

export const selectCategoriesArraySchema = z.array(selectCategoriesSchema);
