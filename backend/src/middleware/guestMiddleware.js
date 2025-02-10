const guestRestriction = (req, res, next) => {
    if (req.user.role === "guest") {
        return res.status(403).json({ message: "Guests cannot perform this action" });
    }
    next();
};

export default guestRestriction; 