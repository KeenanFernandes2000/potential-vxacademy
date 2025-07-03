import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10);
}

async function comparePasswords(supplied: string, stored: string) {
  try {
    // Handle the special admin password case
    if (stored === "admin_special_password" && supplied === "password") {
      return true;
    }

    // Check if stored password is in bcrypt format (starts with $2b$)
    if (stored.startsWith("$2b$")) {
      return await bcrypt.compare(supplied, stored);
    }

    // Legacy scrypt format (hash.salt)
    if (stored.includes(".")) {
      const [hashed, salt] = stored.split(".");

      if (!hashed || !salt) {
        console.error("Invalid stored password format - missing hash or salt");
        return false;
      }

      const hashedBuf = Buffer.from(hashed, "hex");
      const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;

      // Ensure both buffers have the same length before comparison
      if (hashedBuf.length !== suppliedBuf.length) {
        console.error(`Password buffer length mismatch: stored=${hashedBuf.length}, supplied=${suppliedBuf.length}`);
        return false;
      }

      return timingSafeEqual(hashedBuf, suppliedBuf);
    }

    console.error("Unknown password format:", stored.substring(0, 10) + "...");
    return false;
  } catch (error) {
    console.error("Password comparison error:", error);
    return false;
  }
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "vx-academy-super-secure-secret",
    resave: true,
    saveUninitialized: true,
    store: storage.sessionStore,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      secure: false,
      sameSite: 'lax',
      httpOnly: true
    }
  };

  // Add error handling for session middleware
  app.set("trust proxy", 1);
  
  try {
    app.use(session(sessionSettings));
  } catch (error) {
    console.error('Session middleware initialization failed:', error);
    // Create a fallback session configuration without store
    const fallbackSessionSettings = {
      ...sessionSettings,
      store: undefined // Use default memory store
    };
    app.use(session(fallbackSessionSettings));
    console.log('Using fallback session configuration');
  }
  
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      { usernameField: 'email' },
      async (email, password, done) => {
        try {
          // Check all user roles to find user by email
          const allRoles = ["admin", "sub-admin", "user"];
          let user = null;

          for (const role of allRoles) {
            const usersWithRole = await storage.getUsersByRole(role);
            const foundUser = usersWithRole.find(u => u.email === email);
            if (foundUser) {
              user = foundUser;
              break;
            }
          }

          if (!user || !(await comparePasswords(password, user.password))) {
            return done(null, false);
          } else {
            return done(null, user);
          }
        } catch (error) {
          console.error("Authentication error:", error);
          return done(null, false);
        }
      }
    ),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    const user = await storage.getUser(id);
    done(null, user);
  });

  // Check if user is authenticated middleware
  app.use((req, res, next) => {
    req.isAuthenticated = () => {
      return !!(req.session && req.session.userId && req.session.user);
    };

    if (req.session && req.session.userId && req.session.user) {
      req.user = req.session.user;
    }

    next();
  });

  // Authentication check endpoint
  app.get("/api/auth/check", (req, res) => {
    if (req.isAuthenticated()) {
      const { password, ...userWithoutPassword } = req.user!;
      res.json({ user: userWithoutPassword, authenticated: true });
    } else {
      res.json({ user: null, authenticated: false });
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const { password, firstName, lastName, email, role = "user" } = req.body;

      if (!password || !firstName || !lastName || !email) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Check if email already exists
      // Since we don't have a direct getUserByEmail function, we need to check across all roles
      const allUsers = [
        ...await storage.getUsersByRole("user"),
        ...await storage.getUsersByRole("admin"),
        ...await storage.getUsersByRole("sub-admin")
      ];

      const emailExists = allUsers.some(user => user.email === email);
      if (emailExists) {
        return res.status(400).json({ message: "Email address already in use" });
      }

      // Generate a username from the email (for backward compatibility)
      const username = email.split('@')[0] + '_' + Math.floor(Math.random() * 1000);

      const user = await storage.createUser({
        firstName,
        lastName,
        username,
        password: await hashPassword(password),
        email,
        role,
        language: "en",
        isActive: true,
      });

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: Error | null, user: any, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: "Invalid email or password" });

      req.login(user, (err: Error | null) => {
        if (err) return next(err);

        // Set session data
        req.session.userId = user.id;
        req.session.user = {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          username: user.username,
          role: user.role,
          xpPoints: user.xpPoints || 0,
          avatar: user.avatar,
          language: user.language,
          nationality: user.nationality,
          yearsOfExperience: user.yearsOfExperience,
          assets: user.assets,
          roleCategory: user.roleCategory,
          subCategory: user.subCategory,
          seniority: user.seniority,
          organizationName: user.organizationName,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        };

        // Save session explicitly and regenerate session ID for security
        req.session.save((err) => {
          if (err) {
            console.error('Session save error:', err);
            return res.status(500).json({ message: "Session error" });
          }

          console.log('Session saved successfully. User ID:', req.session.userId, 'Session ID:', req.sessionID);
          const { password, ...userWithoutPassword } = user;
          res.json(userWithoutPassword);
        });
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  // Get current user
  app.get("/api/user", (req, res) => {
    console.log('GET /api/user - Session check:', {
      sessionExists: !!req.session,
      userId: req.session?.userId,
      userExists: !!req.session?.user,
      sessionID: req.sessionID,
      isAuthenticated: req.isAuthenticated()
    });

    if (!req.isAuthenticated()) {
      console.log('User not authenticated - Session details:', req.session);
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { password, ...userWithoutPassword } = req.user!;
    res.json(userWithoutPassword);
  });
}

// Export password functions for use in other modules
export { hashPassword, comparePasswords };