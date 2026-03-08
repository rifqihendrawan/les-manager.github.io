const express = require('express');
const Student = require('../models/Student');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// GET /api/dashboard - Get dashboard statistics
router.get('/', async (req, res) => {
  try {
    const students = await Student.find({ user: req.user._id });

    const totalSiswa = students.length;
    let totalPertemuan = 0;
    let totalSelesai = 0;
    const mataPelajaranMap = {};
    const progressData = [];

    students.forEach(student => {
      const selesai = student.pertemuan.filter(p => p.selesai).length;
      totalPertemuan += 8;
      totalSelesai += selesai;

      // Group by mata pelajaran
      if (!mataPelajaranMap[student.mataPelajaran]) {
        mataPelajaranMap[student.mataPelajaran] = { total: 0, selesai: 0 };
      }
      mataPelajaranMap[student.mataPelajaran].total += 8;
      mataPelajaranMap[student.mataPelajaran].selesai += selesai;

      progressData.push({
        namaSiswa: student.namaSiswa,
        mataPelajaran: student.mataPelajaran,
        selesai,
        total: 8,
        persen: Math.round((selesai / 8) * 100)
      });
    });

    // Monthly completion data (last 8 weeks)
    const weeklyData = Array.from({ length: 8 }, (_, i) => ({
      pertemuan: `P${i + 1}`,
      selesai: students.filter(s => s.pertemuan[i]?.selesai).length
    }));

    const mataPelajaranStats = Object.entries(mataPelajaranMap).map(([nama, data]) => ({
      nama,
      total: data.total,
      selesai: data.selesai,
      persen: Math.round((data.selesai / data.total) * 100)
    }));

    res.json({
      success: true,
      data: {
        totalSiswa,
        totalPertemuan,
        totalSelesai,
        overallPersen: totalPertemuan > 0 ? Math.round((totalSelesai / totalPertemuan) * 100) : 0,
        progressData,
        weeklyData,
        mataPelajaranStats
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
