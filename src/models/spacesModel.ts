import { z } from "@hono/zod-openapi";
import {
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
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
  notificationTimes: jsonb("notificationTimes")
    .notNull()
    .default({ standard: [12, 24], prioritized: [48] }),
});

export const selectSpaceSchema = createSelectSchema(spacesTable, {
  id: z.string().transform((v) => parseInt(v, 10)),
  notificationTimes: z.object({
    standard: z.array(z.number()),
    prioritized: z.array(z.number()),
  }),
});

export const selectSpacesArraySchema = z.array(selectSpaceSchema);
