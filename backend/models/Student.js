const mongoose = require('mongoose');

const PertemuanSchema = new mongoose.Schema({
  nomor: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  },
  selesai: {
    type: Boolean,
    default: false
  },
  tanggal: {
    type: Date,
    default: null
  },
  catatan: {
    type: String,
    default: ''
  }
});

const StudentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  namaSiswa: {
    type: String,
    required: [true, 'Nama siswa wajib diisi'],
    trim: true
  },
  mataPelajaran: {
    type: String,
    required: [true, 'Mata pelajaran wajib diisi'],
    trim: true
  },
  pertemuan: {
    type: [PertemuanSchema],
    default: () => Array.from({ length: 8 }, (_, i) => ({
      nomor: i + 1,
      selesai: false,
      tanggal: null,
      catatan: ''
    }))
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Virtual: total pertemuan selesai
StudentSchema.virtual('totalSelesai').get(function() {
  return this.pertemuan.filter(p => p.selesai).length;
});

// Virtual: progress percentage
StudentSchema.virtual('progressPersen').get(function() {
  return Math.round((this.pertemuan.filter(p => p.selesai).length / 8) * 100);
});

StudentSchema.set('toJSON', { virtuals: true });
StudentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Student', StudentSchema);
