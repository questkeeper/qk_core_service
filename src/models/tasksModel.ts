import {
  pgTable,
  serial,
  text,
  timestamp,
  boolean,
  integer,
  uuid,
} from "drizzle-orm/pg-core";
import { categoriesTable } from "./categoriesModel";
import { spacesTable } from "./spacesModel";
import { createSelectSchema } from "drizzle-zod";
import { z } from "@hono/zod-openapi";

export const tasksTable = pgTable("tasks", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("createdAt", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true })
    .notNull()
    .defaultNow(),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("dueDate", { withTimezone: true }),
  userId: uuid("user_id").notNull(),
  completed: boolean("completed").notNull().default(false),
  starred: boolean("starred").notNull().default(false),
  categoryId: integer("categoryId").references(() => categoriesTable.id),
  spaceId: integer("spaceId").references(() => spacesTable.id),
});

export const selectTaskSchema = createSelectSchema(tasksTable, {
  id: z.string().transform((v) => parseInt(v, 10)),
});

export const selectTasksArraySchema = z.array(selectTaskSchema);

