import sqlite3 from 'sqlite3';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { prisma } from './db/prismaClient.js';
import cors from 'cors';
import pinoHttp from 'pino-http';
import { logger } from './logger.js';
import { cards } from './routes/cards.js';
import { inventory } from './routes/inventory.js';
import { listings } from './routes/listings.js';
import { users } from './routes/users.js';
import { decks } from './routes/decks.js';
import { deckListings } from './routes/deckListings.js';

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(pinoHttp({ logger }));

// SQLite autocomplete DB
let cardDb = null;
try {
	cardDb = new sqlite3.Database('./prisma/AllPrintings.sqlite', sqlite3.OPEN_READONLY, (err) => {
		if (err) {
			logger.warn('Could not open SQLite DB for autocomplete. Feature will be disabled.');
			cardDb = null;
		}
	});
} catch (err) {
	logger.warn('Failed to initialize SQLite DB');
}

app.get('/api/card-names', (req, res) => {
	if (!cardDb) return res.json([]);
	const q = (req.query.q || '').trim();
	if (!q || q.length < 2) return res.json([]);
	// Query for card names matching input
	cardDb.all(`SELECT DISTINCT name FROM cards WHERE name LIKE ? ORDER BY name LIMIT 20`, [`%${q}%`], (err, rows) => {
		if (err) {
			console.error('Database error:', err);
			return res.status(500).json({ error: 'Database error' });
		}
		const results = rows.map(row => row.name);
		res.json(results);
	});
});

// Session middleware
app.use(session({
	secret: process.env.SESSION_SECRET || 'devsecret',
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
	done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
	const user = await prisma.user.findUnique({ where: { id } });
	done(null, user);
});

passport.use(new GoogleStrategy({
	clientID: process.env.GOOGLE_CLIENT_ID,
	clientSecret: process.env.GOOGLE_CLIENT_SECRET,
	callbackURL: '/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
	const email = profile.emails[0].value;
	let user = await prisma.user.findUnique({ where: { email } });
	if (!user) {
		user = await prisma.user.create({ data: { email, display: profile.displayName } });
	}
	return done(null, user);
}));

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', passport.authenticate('google', {
	failureRedirect: '/login',
	session: true
}), (req, res) => {
	  res.redirect(process.env.FRONTEND_URL || 'http://localhost:5173/'); // Redirect to frontend after login
});

app.get('/api/me', (req, res) => {
	if (req.isAuthenticated()) {
		res.json({ ok: true, user: req.user });
	} else {
		res.status(401).json({ ok: false });
	}
});

app.get('/logout', (req, res) => {
	req.logout(() => {
		res.redirect('/');
	});
});

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api/cards', cards);
app.use('/api/inventory', inventory);
app.use('/api/listings', listings);
app.use('/api/users', users);
app.use('/api/decks', decks);
app.use('/api/deck-listings', deckListings);

const port = process.env.PORT || 4000;
app.listen(port, () => logger.info(`API on http://localhost:${port}`));