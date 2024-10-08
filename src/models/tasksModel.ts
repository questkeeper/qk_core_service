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
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
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
  dueDate: timestamp("dueDate", { withTimezone: true }).notNull(),
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

export const createTaskSchema = createInsertSchema(tasksTable, {
  title: z.string(),
  userId: z.string(),
  dueDate: z.string().transform((v) => new Date(v)),
  description: z.string().optional(),
  categoryId: z.number().optional(),
  spaceId: z.number().optional(),
  completed: z.boolean().optional().default(false),
  starred: z.boolean().optional().default(false),
});
