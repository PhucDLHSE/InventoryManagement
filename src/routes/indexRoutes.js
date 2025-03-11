const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.status(200).send("Server is running!");
});

router.get("/admin/host/status", (req, res) => {
    res.status(200).json({ status: "OK" });
});


app.get('/api/check-db', async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT 1');
      res.json({ status: 'success', message: 'Kết nối cơ sở dữ liệu thành công' });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  });

module.exports = router;
