import { jsonb, pgTable, serial, timestamp } from "drizzle-orm/pg-core";

export const estimatorConfigTable = pgTable("estimator_config", {
  id: serial("id").primaryKey(),
  config: jsonb("config").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type EstimatorConfigRow = typeof estimatorConfigTable.$inferSelect;