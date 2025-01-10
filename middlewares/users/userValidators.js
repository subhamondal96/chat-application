// external Import
const { check, validationResult } = require("express-validator");
const createError = require("http-errors");
const path = require("path");
const { unlink } = require("fs");

// Internal Imports
const User = require("../../models/People");

// add user
const addUserValidators = [
    check("name")
        .isLength({ min: 1 })
        .withMessage("Name is required")
        .isAlpha("en-US", { ignore: " -" })
        .withMessage("Name must not contain anything other than alphabet")
        .trim(),

    check("email")
        .isEmail()
        .withMessage("Invalid email address")
        .trim()
        .custom(async (value) => {
            try {
                const user = await User.findOne({ email: value });
                if (user) {
                    throw createError("Email already is Used!");
                }
            } catch (err) {
                throw createError(err.message);
            }
        }),

    check("mobile").custom(async (value) => {
        try {
            const user = await User.findOne({ mobile: value });
            if (user) {
                throw createError("Mobile already is used!");
            }
        } catch (err) {
            throw createError(err.message);
        }
    }),

    check("password")
        .isStrongPassword()
        .withMessage(
            "Password must be at least 8 character long abd should contain at least 1 lowercase, 1 uppercase, 1 number and 1 symbol"
        ),
];

const addUserValidationHandler = function (req, res, next) {
    const errors = validationResult(req);
    const mappedErrors = errors.mapped();
    if (Object.keys(mappedErrors).length === 0) {
        next();
    } else {
        // Remove uploaded file
        if (req.files.length > 0) {
            const { filename } = req.files[0];
            unlink(
                path.join(
                    __dirname,
                    `../../public/uploads/avatars/${filename}`
                ),
                // /../public/uploads/avatars/${filename}
                (err) => {
                    if (err) console.log(err);
                }
            );
        }

        // response the errors
        res.status(500).json({
            errors: mappedErrors,
        });
    }
};

module.exports = { addUserValidators, addUserValidationHandler };
