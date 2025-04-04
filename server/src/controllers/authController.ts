// Example JWT token generation
const token = jwt.sign(
  { userId: user.id },
  process.env.JWT_SECRET || '2322', // Fallback to '2322' if not set
  { expiresIn: '24h' }
); 