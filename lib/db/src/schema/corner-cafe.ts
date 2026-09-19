import { createInsertSchema } from "drizzle-zod";
import {
  integer,
  jsonb,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const cafeProfileTable = pgTable("cafe_profile", {
  id: integer("id").primaryKey().default(1),
  name: varchar("name", { length: 120 }).notNull(),
  tagline: text("tagline").notNull(),
  description: text("description").notNull(),
  address: text("address").notNull(),
  mapUrl: text("map_url").notNull(),
  phone: varchar("phone", { length: 40 }),
  email: varchar("email", { length: 160 }),
  instagramUrl: text("instagram_url"),
  hours: jsonb("hours").$type<Array<{ day: string; hours: string }>>().notNull(),
});

export const menuItemsTable = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 60 }).notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 8 }).notNull().default("ETB"),
  featured: integer("featured").notNull().default(0),
});

export const reservationsTable = pgTable("reservations", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  phone: varchar("phone", { length: 40 }).notNull(),
  email: varchar("email", { length: 160 }),
  date: varchar("date", { length: 10 }).notNull(),
  time: varchar("time", { length: 10 }).notNull(),
  partySize: integer("party_size").notNull(),
  notes: text("notes"),
  status: varchar("status", { length: 24 }).notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const inquiriesTable = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 160 }).notNull(),
  subject: varchar("subject", { length: 160 }).notNull(),
  message: text("message").notNull(),
  status: varchar("status", { length: 24 }).notNull().default("new"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCafeProfileSchema = createInsertSchema(cafeProfileTable);
export const insertMenuItemSchema = createInsertSchema(menuItemsTable);
export const insertReservationSchema = createInsertSchema(reservationsTable);
export const insertInquirySchema = createInsertSchema(inquiriesTable);

export const cafeHoursSchema = z.array(
  z.object({ day: z.string(), hours: z.string() }),
);

export type CafeProfile = typeof cafeProfileTable.$inferSelect;
export type MenuItem = typeof menuItemsTable.$inferSelect;
export type Reservation = typeof reservationsTable.$inferSelect;
export type Inquiry = typeof inquiriesTable.$inferSelect;