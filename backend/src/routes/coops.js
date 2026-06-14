const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate, requireRole } = require('../middleware/auth');
const prisma = new PrismaClient();

// POST /coops
router.post('/', authenticate, requireRole('ADMIN', 'AGENT'), async (req, res) => {
  try {
    const { name, location, contact_person_name, contact_phone } = req.body;
    if (!name) return res.status(400).json({ error: 'name required' });
    const coop = await prisma.coop.create({ data: { name, location, contact_person_name, contact_phone } });
    return res.status(201).json(coop);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /coops
router.get('/', async (req, res) => {
  try {
    const coops = await prisma.coop.findMany({
      include: { _count: { select: { members: true, listings: true } } },
      orderBy: { name: 'asc' },
    });
    return res.json(coops);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /coops/:id/members - add farmer to co-op
router.post('/:id/members', authenticate, requireRole('ADMIN', 'AGENT', 'COOP_ADMIN'), async (req, res) => {
  try {
    const { farmer_id } = req.body;
    if (!farmer_id) return res.status(400).json({ error: 'farmer_id required' });
    const member = await prisma.coopMember.create({
      data: { coop_id: req.params.id, farmer_id },
    });
    // Also update farmer's coop_id
    await prisma.farmerProfile.update({ where: { id: farmer_id }, data: { coop_id: req.params.id } });
    return res.status(201).json(member);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /coops/:id - full co-op with members
router.get('/:id', async (req, res) => {
  try {
    const coop = await prisma.coop.findUnique({
      where: { id: req.params.id },
      include: {
        members: { include: { farmer: true } },
        listings: { where: { status: 'LIVE' }, take: 10 },
      },
    });
    if (!coop) return res.status(404).json({ error: 'Co-op not found' });
    return res.json(coop);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
