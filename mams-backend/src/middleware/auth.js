import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET;

export const authenticate = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }
    
    const token = auth.split(" ")[1];
    const payload = jwt.verify(token, JWT_SECRET);
    
    const user = await User.findByPk(payload.userId);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    
    req.user = { 
      userId: user.id, 
      role: user.role, 
      baseId: user.base_id, 
      username: user.username 
    };
    next();
  } catch (err) {
    console.error("auth error", err.message || err);
    return res.status(401).json({ error: "Invalid token" });
  }
};
