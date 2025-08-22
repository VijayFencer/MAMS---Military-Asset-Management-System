import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { Base } from "../models/Base.js";
import { authenticate } from "../middleware/auth.js";
import { permit } from "../middleware/rbac.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ where: { username }, include: [{ model: Base, as: "base" }] });
  
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role, baseId: user.base_id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );

  const response = { 
    token, 
    role: user.role, 
    baseId: user.base_id, 
    username: user.username, 
    userId: user.id 
  };

  if (user.base) {
    response.baseName = user.base.name;
  }

  res.json(response);
});

router.post("/users", authenticate, permit("admin"), async (req, res) => {
  try {
    const { username, password, role, baseId } = req.body;
    if (!username || !password || !role) {
      return res.status(400).json({ error: "username, password, role are required" });
    }
    
    if (!["admin", "base_commander", "logistics"].includes(role)) {
      return res.status(400).json({ error: "invalid role" });
    }
    
    const exists = await User.findOne({ where: { username } });
    if (exists) {
      return res.status(409).json({ error: "username already exists" });
    }
    
    let base_id = null;
    if (baseId) {
      const b = await Base.findByPk(Number(baseId));
      if (!b) {
        return res.status(400).json({ error: "invalid baseId" });
      }
      base_id = b.id;
    }
    
    const hash = await bcrypt.hash(password, 10);
    const created = await User.create({ username, password: hash, role, base_id });
    return res.status(201).json({ id: created.id });
  } catch (e) {
    return res.status(500).json({ error: "failed to create user" });
  }
});

router.post("/register", async (req, res) => {
  try {
    const { username, password, baseId } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "username and password are required" });
    }
    
    const exists = await User.findOne({ where: { username } });
    if (exists) {
      return res.status(409).json({ error: "username already exists" });
    }
    
    if (!baseId) {
      return res.status(400).json({ error: "baseId is required for logistics registration" });
    }
    
    const b = await Base.findByPk(Number(baseId));
    if (!b) {
      return res.status(400).json({ error: "invalid baseId" });
    }
    
    const hash = await bcrypt.hash(password, 10);
    const created = await User.create({ username, password: hash, role: "logistics", base_id: b.id });
    return res.status(201).json({ id: created.id });
  } catch (e) {
    return res.status(500).json({ error: "failed to register" });
  }
});

router.get("/profile/:userId", authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user.userId;

    if (Number(userId) !== requestingUserId) {
      return res.status(403).json({ error: "Forbidden: Can only view own profile" });
    }

    const user = await User.findByPk(userId, {
      include: [{ model: Base, as: "base" }],
      attributes: { exclude: ["password"] }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("Profile error:", err);
    res.status(500).json({ error: "Failed to get profile" });
  }
});

export default router;