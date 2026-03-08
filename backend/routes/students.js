const express = require('express');
const Student = require('../models/Student');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// GET /api/students - Get all students for logged-in user
router.get('/', async (req, res) => {
  try {
    const students = await Student.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: students });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/students - Create new student
router.post('/', async (req, res) => {
  try {
    const { namaSiswa, mataPelajaran } = req.body;
    const student = await Student.create({
      user: req.user._id,
      namaSiswa,
      mataPelajaran
    });
    res.status(201).json({ success: true, data: student });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/students/:id - Update student info
router.put('/:id', async (req, res) => {
  try {
    const { namaSiswa, mataPelajaran } = req.body;
    const student = await Student.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { namaSiswa, mataPelajaran },
      { new: true, runValidators: true }
    );
    if (!student) return res.status(404).json({ success: false, message: 'Siswa tidak ditemukan' });
    res.json({ success: true, data: student });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/students/:id/pertemuan/:nomor - Toggle pertemuan
router.patch('/:id/pertemuan/:nomor', async (req, res) => {
  try {
    const student = await Student.findOne({ _id: req.params.id, user: req.user._id });
    if (!student) return res.status(404).json({ success: false, message: 'Siswa tidak ditemukan' });

    const nomor = parseInt(req.params.nomor);
    const pertemuanIdx = student.pertemuan.findIndex(p => p.nomor === nomor);
    if (pertemuanIdx === -1) return res.status(404).json({ success: false, message: 'Pertemuan tidak ditemukan' });

    const currentStatus = student.pertemuan[pertemuanIdx].selesai;
    student.pertemuan[pertemuanIdx].selesai = !currentStatus;
    student.pertemuan[pertemuanIdx].tanggal = !currentStatus ? new Date() : null;

    await student.save();
    res.json({ success: true, data: student });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/students/:id/pertemuan/:nomor/catatan - Update note
router.patch('/:id/pertemuan/:nomor/catatan', async (req, res) => {
  try {
    const student = await Student.findOne({ _id: req.params.id, user: req.user._id });
    if (!student) return res.status(404).json({ success: false, message: 'Siswa tidak ditemukan' });

    const nomor = parseInt(req.params.nomor);
    const pertemuanIdx = student.pertemuan.findIndex(p => p.nomor === nomor);
    if (pertemuanIdx === -1) return res.status(404).json({ success: false, message: 'Pertemuan tidak ditemukan' });

    student.pertemuan[pertemuanIdx].catatan = req.body.catatan || '';
    await student.save();
    res.json({ success: true, data: student });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/students/:id - Delete student
router.delete('/:id', async (req, res) => {
  try {
    const student = await Student.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!student) return res.status(404).json({ success: false, message: 'Siswa tidak ditemukan' });
    res.json({ success: true, message: 'Siswa berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
