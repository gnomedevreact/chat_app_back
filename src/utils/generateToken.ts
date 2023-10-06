import * as jwt from "jsonwebtoken";

export const generateToken = (user_id: string) => {
  const token = jwt.sign({ user_id }, process.env.JWT_SECRET, {
    expiresIn: "10d",
  });

  return { token };
};
