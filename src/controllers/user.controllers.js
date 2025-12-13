import asyncHanlder from "../utils/asyncHandler.js";

export const registerUser = asyncHanlder( async (req, res) => {
    res.status(200).json({ message: "OK" });
});  