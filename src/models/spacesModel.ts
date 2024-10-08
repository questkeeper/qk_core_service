import { z } from "@hono/zod-openapi";
import { pgTable, serial, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";

export const spacesTable = pgTable("spaces", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  title: text("title").notNull(),
  color: text("color"),
  updatedAt: timestamp("updatedAt", { withTimezone: true }),
  userId: uuid("user_id").notNull(),
});

export const selectSpaceSchema = createSelectSchema(spacesTable, {
  id: z.string().transform((v) => parseInt(v, 10)),
});

export const selectSpacesArraySchema = z.array(selectSpaceSchema);
