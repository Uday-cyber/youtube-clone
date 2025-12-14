import { body } from "express-validator";

export const registerValidator = [
  body("username")
    .trim()
    .notEmpty().withMessage("Username is required")
    .isLength({ min: 4 }).withMessage("Username must be atleast 4 chars"),

  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Invalid email format"),

  body("fullName")
  .trim()
  .notEmpty().withMessage("Name is required"),

  body("password")
    .trim()
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 8 }).withMessage("Passsword must be 8 character long")
    .matches(/[A-Z]/).withMessage("Password must contain 1 uppercase letter")
    .matches(/[0-9]/).withMessage("Password must contain 1 number"),
];
