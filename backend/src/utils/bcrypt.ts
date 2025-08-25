import bcrypt from "bcryptjs";

const hashPassword = (password: string) => {
  return bcrypt.hashSync(password, 12);
};

const comparePassword = (password: string, hashedPassword: string) => {
  return bcrypt.compareSync(password, hashedPassword);
};

export { hashPassword, comparePassword };
