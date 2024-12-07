import { z } from "@hono/zod-openapi";
import { pgTable, serial, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";

export enum SpaceType {
  LIVING_ROOM = "living_room",
  WORK = "work",
  SCHOOL = "school",
}

export const spacesTable = pgTable("spaces", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  title: text("title").notNull(),
  spaceType: text("spaceType").notNull().default(SpaceType.LIVING_ROOM),
  userId: uuid("user_id").notNull(),
});

export const selectSpaceSchema = createSelectSchema(spacesTable, {
  id: z.string().transform((v) => parseInt(v, 10)),
});

export const selectSpacesArraySchema = z.array(selectSpaceSchema);
