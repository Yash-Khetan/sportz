import { Router } from "express";
import { createMatchSchema, listMatchesQuerySchema } from "../validation/matches.js";
import { getMatchStatus } from "../utils/match-status.js";
import { db } from "../db.js";
import { matches } from "../schema.js";
import { desc } from "drizzle-orm";
const matchesrouter = Router();

const MAX_LIMIT = 100;

matchesrouter.get('/', async (req, res) => {
    const parsed = listMatchesQuerySchema.safeParse(req.query);
    if (!parsed.success) {
        return res.status(400).json({ error: 'invalid query', details: JSON.stringify(parsed.error) });

    }
    const limit = Math.min(parsed.data.limit ?? 50, MAX_LIMIT);

    try {
        const data = await db.select().from(matches).orderBy(desc(matches.createdAt)).limit(limit);
        res.json({ data });

    } catch (e) {
        res.status(500).json({ error: "failed to fetch matches!", details: e.message })
    }
})

matchesrouter.post('/', async (req, res) => {
    const parsed = createMatchSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({ error: 'invalid payload', details: JSON.stringify(parsed.error) });

    }
    try {
        const [event] = await db.insert(matches).values({
            ...parsed.data,
            startTime: new Date(parsed.data.startTime),
            endTime: new Date(parsed.data.endTime),
            homeScore: parsed.data.homeScore ?? 0,
            awayScore: parsed.data.awayScore ?? 0,
            status: getMatchStatus(parsed.data.startTime, parsed.data.endTime),

        }).returning();

        res.status(201).json({ data: event });
    } catch (e) {
        res.status(500).json({ error: "failed to create match", details: JSON.stringify(e) });
    }
})

export default matchesrouter; 