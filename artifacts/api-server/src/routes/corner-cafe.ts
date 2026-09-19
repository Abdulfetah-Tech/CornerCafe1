import { Router, type IRouter } from "express";
import { eq, asc } from "drizzle-orm";
import {
  CreateInquiryBody,
  CreateInquiryResponse,
  CreateReservationBody,
  CreateReservationResponse,
  GetCafeProfileResponse,
  ListMenuItemsResponse,
} from "@workspace/api-zod";
import {
  cafeProfileTable,
  inquiriesTable,
  menuItemsTable,
  reservationsTable,
} from "@workspace/db";
import { db } from "@workspace/db";

const router: IRouter = Router();

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
    hours: profile.hours,
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
      .orderBy(asc(menuItemsTable.category), asc(menuItemsTable.id));
    res.json(
      ListMenuItemsResponse.parse(
        rows.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          category: item.category,
          price: Number(item.price),
          currency: item.currency,
          featured: item.featured === 1,
        })),
      ),
    );
  } catch (error) {
    next(error);
  }
});

router.post("/reservations", async (req, res, next) => {
  try {
    const input = CreateReservationBody.parse(req.body);
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

    res.status(201).json(
      CreateReservationResponse.parse({
        ...reservation,
        date: new Date(`${reservation.date}T00:00:00.000Z`),
        createdAt: reservation.createdAt.toISOString(),
      }),
    );
  } catch (error) {
    next(error);
  }
});

router.post("/inquiries", async (req, res, next) => {
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

    res.status(201).json(
      CreateInquiryResponse.parse({
        ...inquiry,
        createdAt: inquiry.createdAt.toISOString(),
      }),
    );
  } catch (error) {
    next(error);
  }
});

export default router;