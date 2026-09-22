import { Router, type IRouter } from "express";
import { asc, count, desc, eq } from "drizzle-orm";
import rateLimit from "express-rate-limit";
import {
  CreateInquiryBody,
  CreateInquiryResponse,
  CreateOwnerMenuItemBody,
  CreateOwnerMenuItemResponse,
  CreateReservationBody,
  CreateReservationResponse,
  DeleteOwnerMenuItemParams,
  GetCafeProfileResponse,
  GetOwnerSummaryResponse,
  ListMenuItemsResponse,
  ListOwnerInquiriesResponse,
  ListOwnerMenuItemsResponse,
  ListOwnerReservationsResponse,
  UpdateOwnerCafeProfileBody,
  UpdateOwnerCafeProfileResponse,
  UpdateOwnerInquiryBody,
  UpdateOwnerInquiryParams,
  UpdateOwnerInquiryResponse,
  UpdateOwnerMenuItemBody,
  UpdateOwnerMenuItemParams,
  UpdateOwnerMenuItemResponse,
  UpdateOwnerReservationBody,
  UpdateOwnerReservationParams,
  UpdateOwnerReservationResponse,
} from "@workspace/api-zod";
import {
  cafeProfileTable,
  inquiriesTable,
  menuItemsTable,
  reservationsTable,
} from "@workspace/db";
import { db } from "@workspace/db";
import { requireOwner } from "../middlewares/requireOwner";

const router: IRouter = Router();
const publicWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again later." },
});

const mapProfile = (profile: typeof cafeProfileTable.$inferSelect) =>
  GetCafeProfileResponse.parse({
    name: profile.name,
    tagline: profile.tagline,
    description: profile.description,
    address: profile.address,
    mapUrl: profile.mapUrl,
    phone: profile.phone,
    email: profile.email,
    instagramUrl: profile.instagramUrl,
    heroImageUrl: profile.heroImageUrl,
    heroImageAlt: profile.heroImageAlt,
    hours: profile.hours,
  });

const mapMenuItem = (item: typeof menuItemsTable.$inferSelect) => ({
  id: item.id,
  name: item.name,
  description: item.description,
  category: item.category,
  price: Number(item.price),
  currency: item.currency,
  featured: item.featured === 1,
  status: item.status,
  dietaryLabels: item.dietaryLabels,
});

const mapReservation = (reservation: typeof reservationsTable.$inferSelect) => ({
  ...reservation,
  date: new Date(`${reservation.date}T00:00:00.000Z`),
  createdAt: reservation.createdAt.toISOString(),
});

const mapInquiry = (inquiry: typeof inquiriesTable.$inferSelect) => ({
  ...inquiry,
  createdAt: inquiry.createdAt.toISOString(),
});

router.get("/cafe", async (_req, res, next) => {
  try {
    const profile = await db
      .select()
      .from(cafeProfileTable)
      .where(eq(cafeProfileTable.id, 1))
      .limit(1);
    if (!profile[0]) {
      res.status(404).json({ error: "Cafe profile is not configured yet." });
      return;
    }
    res.json(mapProfile(profile[0]));
  } catch (error) {
    next(error);
  }
});

router.get("/menu", async (_req, res, next) => {
  try {
    const rows = await db
      .select()
      .from(menuItemsTable)
      .where(eq(menuItemsTable.status, "published"))
      .orderBy(asc(menuItemsTable.category), asc(menuItemsTable.id));
    res.json(ListMenuItemsResponse.parse(rows.map(mapMenuItem)));
  } catch (error) {
    next(error);
  }
});

router.post("/reservations", publicWriteLimiter, async (req, res, next) => {
  try {
    const input = CreateReservationBody.parse(req.body);
    if (input.date < new Date(new Date().toISOString().slice(0, 10))) {
      res.status(400).json({ error: "Reservation date must be in the future." });
      return;
    }
    const inserted = await db
      .insert(reservationsTable)
      .values({
        name: input.name.trim(),
        phone: input.phone.trim(),
        email: input.email?.trim() || null,
        date: input.date.toISOString().slice(0, 10),
        time: input.time,
        partySize: input.partySize,
        notes: input.notes?.trim() || null,
      })
      .returning();
    const reservation = inserted[0];
    if (!reservation) {
      res.status(500).json({ error: "Could not save reservation request." });
      return;
    }
    res.status(201).json(CreateReservationResponse.parse(mapReservation(reservation)));
  } catch (error) {
    next(error);
  }
});

router.post("/inquiries", publicWriteLimiter, async (req, res, next) => {
  try {
    const input = CreateInquiryBody.parse(req.body);
    const inserted = await db
      .insert(inquiriesTable)
      .values({
        name: input.name.trim(),
        email: input.email.trim(),
        subject: input.subject.trim(),
        message: input.message.trim(),
      })
      .returning();
    const inquiry = inserted[0];
    if (!inquiry) {
      res.status(500).json({ error: "Could not save inquiry." });
      return;
    }
    res.status(201).json(CreateInquiryResponse.parse(mapInquiry(inquiry)));
  } catch (error) {
    next(error);
  }
});

router.use("/owner", requireOwner);

router.get("/owner/summary", async (_req, res, next) => {
  try {
    const [pending, inquiries, published, total] = await Promise.all([
      db.select({ value: count() }).from(reservationsTable).where(eq(reservationsTable.status, "pending")),
      db.select({ value: count() }).from(inquiriesTable).where(eq(inquiriesTable.status, "new")),
      db.select({ value: count() }).from(menuItemsTable).where(eq(menuItemsTable.status, "published")),
      db.select({ value: count() }).from(menuItemsTable),
    ]);
    res.json(
      GetOwnerSummaryResponse.parse({
        pendingReservations: Number(pending[0]?.value ?? 0),
        newInquiries: Number(inquiries[0]?.value ?? 0),
        publishedMenuItems: Number(published[0]?.value ?? 0),
        totalMenuItems: Number(total[0]?.value ?? 0),
      }),
    );
  } catch (error) {
    next(error);
  }
});

router.patch("/owner/cafe", async (req, res, next) => {
  try {
    const input = UpdateOwnerCafeProfileBody.parse(req.body);
    const updated = await db
      .update(cafeProfileTable)
      .set({
        name: input.name.trim(),
        tagline: input.tagline.trim(),
        description: input.description.trim(),
        address: input.address.trim(),
        mapUrl: input.mapUrl,
        phone: input.phone?.trim() || null,
        email: input.email?.trim() || null,
        instagramUrl: input.instagramUrl?.trim() || null,
        heroImageUrl: input.heroImageUrl?.trim() || null,
        heroImageAlt: input.heroImageAlt?.trim() || null,
        hours: input.hours,
      })
      .where(eq(cafeProfileTable.id, 1))
      .returning();
    const profile = updated[0];
    if (!profile) {
      res.status(404).json({ error: "Cafe profile is not configured yet." });
      return;
    }
    res.json(UpdateOwnerCafeProfileResponse.parse(mapProfile(profile)));
  } catch (error) {
    next(error);
  }
});

router.get("/owner/menu", async (_req, res, next) => {
  try {
    const rows = await db.select().from(menuItemsTable).orderBy(asc(menuItemsTable.category), asc(menuItemsTable.id));
    res.json(ListOwnerMenuItemsResponse.parse(rows.map(mapMenuItem)));
  } catch (error) {
    next(error);
  }
});

router.post("/owner/menu", async (req, res, next) => {
  try {
    const input = CreateOwnerMenuItemBody.parse(req.body);
    const inserted = await db
      .insert(menuItemsTable)
      .values({
        name: input.name.trim(),
        description: input.description.trim(),
        category: input.category.trim(),
        price: input.price.toFixed(2),
        currency: input.currency.trim().toUpperCase(),
        featured: input.featured ? 1 : 0,
        status: input.status,
        dietaryLabels: input.dietaryLabels.map((label) => label.trim()).filter(Boolean),
      })
      .returning();
    const item = inserted[0];
    if (!item) {
      res.status(500).json({ error: "Could not create menu item." });
      return;
    }
    res.status(201).json(CreateOwnerMenuItemResponse.parse(mapMenuItem(item)));
  } catch (error) {
    next(error);
  }
});

router.patch("/owner/menu/:id", async (req, res, next) => {
  try {
    const params = UpdateOwnerMenuItemParams.parse(req.params);
    const input = UpdateOwnerMenuItemBody.parse(req.body);
    const updated = await db
      .update(menuItemsTable)
      .set({
        name: input.name.trim(),
        description: input.description.trim(),
        category: input.category.trim(),
        price: input.price.toFixed(2),
        currency: input.currency.trim().toUpperCase(),
        featured: input.featured ? 1 : 0,
        status: input.status,
        dietaryLabels: input.dietaryLabels.map((label) => label.trim()).filter(Boolean),
      })
      .where(eq(menuItemsTable.id, params.id))
      .returning();
    const item = updated[0];
    if (!item) {
      res.status(404).json({ error: "Menu item not found." });
      return;
    }
    res.json(UpdateOwnerMenuItemResponse.parse(mapMenuItem(item)));
  } catch (error) {
    next(error);
  }
});

router.delete("/owner/menu/:id", async (req, res, next) => {
  try {
    const params = DeleteOwnerMenuItemParams.parse(req.params);
    await db.delete(menuItemsTable).where(eq(menuItemsTable.id, params.id));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.get("/owner/reservations", async (_req, res, next) => {
  try {
    const rows = await db.select().from(reservationsTable).orderBy(desc(reservationsTable.createdAt));
    res.json(ListOwnerReservationsResponse.parse(rows.map(mapReservation)));
  } catch (error) {
    next(error);
  }
});

router.patch("/owner/reservations/:id", async (req, res, next) => {
  try {
    const params = UpdateOwnerReservationParams.parse(req.params);
    const input = UpdateOwnerReservationBody.parse(req.body);
    const updated = await db
      .update(reservationsTable)
      .set({ status: input.status })
      .where(eq(reservationsTable.id, params.id))
      .returning();
    const reservation = updated[0];
    if (!reservation) {
      res.status(404).json({ error: "Reservation not found." });
      return;
    }
    res.json(UpdateOwnerReservationResponse.parse(mapReservation(reservation)));
  } catch (error) {
    next(error);
  }
});

router.get("/owner/inquiries", async (_req, res, next) => {
  try {
    const rows = await db.select().from(inquiriesTable).orderBy(desc(inquiriesTable.createdAt));
    res.json(ListOwnerInquiriesResponse.parse(rows.map(mapInquiry)));
  } catch (error) {
    next(error);
  }
});

router.patch("/owner/inquiries/:id", async (req, res, next) => {
  try {
    const params = UpdateOwnerInquiryParams.parse(req.params);
    const input = UpdateOwnerInquiryBody.parse(req.body);
    const updated = await db
      .update(inquiriesTable)
      .set({ status: input.status })
      .where(eq(inquiriesTable.id, params.id))
      .returning();
    const inquiry = updated[0];
    if (!inquiry) {
      res.status(404).json({ error: "Inquiry not found." });
      return;
    }
    res.json(UpdateOwnerInquiryResponse.parse(mapInquiry(inquiry)));
  } catch (error) {
    next(error);
  }
});

export default router;