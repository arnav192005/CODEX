const express = require('express');
const { z } = require('zod');
const db = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

const materialSchema = z.object({
  title: z.string().min(2).max(200),
  branch: z.string().min(1).max(20),
  semester: z.string().min(1).max(10),
  type: z.string().min(1).max(40),
  subject: z.string().min(1).max(80),
  code: z.string().min(1).max(40),
  description: z.string().max(1000).optional().default(''),
  link: z.string().url(),
  location: z.string().max(200).optional().default(''),
  block: z.string().max(80).optional().default('')
});

router.get('/', (req, res, next) => {
  try {
    const {
      q = '',
      branch = '',
      semester = '',
      subject = '',
      type = '',
      sort = 'created_desc',
      page = '1',
      limit = '20'
    } = req.query;

    const result = db.listMaterials({
      q,
      branch,
      semester,
      subject,
      type,
      sort,
      page,
      limit
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/', requireAuth, requireRole('admin'), (req, res, next) => {
  try {
    const payload = materialSchema.parse(req.body);
    const created = db.createMaterial(payload, req.user.id);
    res.status(201).json({ data: created });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: error.issues[0].message });
    }
    return next(error);
  }
});

router.put('/:id', requireAuth, requireRole('admin'), (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'Invalid material id' });
    }

    const payload = materialSchema.parse(req.body);

    const updated = db.updateMaterial(id, payload);
    if (!updated) {
      return res.status(404).json({ message: 'Material not found' });
    }
    return res.json({ data: updated });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: error.issues[0].message });
    }
    return next(error);
  }
});

router.delete('/:id', requireAuth, requireRole('admin'), (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'Invalid material id' });
    }

    const deleted = db.deleteMaterial(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Material not found' });
    }

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
