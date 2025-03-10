const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.status(200).send("Server is running!");
});

router.get("/admin/host/status", (req, res) => {
    res.status(200).json({ status: "OK" });
});


module.exports = router;
