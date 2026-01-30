import {
    pgTable,
    uuid,
    varchar,
    timestamp,
    boolean,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name").notNull(),
    email: varchar("email", {length: 255}).notNull().unique(),
    password: varchar("password", {length: 255}).notNull(),
    createdAt: timestamp("created_at", {withTimezone: true})
        .defaultNow()
        .notNull(),
});
