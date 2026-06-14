const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate, requireRole } = require('../middleware/auth');
const prisma = new PrismaClient();

// POST /orders - buyer places order
router.post('/', authenticate, requireRole('BUYER'), async (req, res) => {
  try {
    const { listing_id, quantity, delivery_address, delivery_date } = req.body;
    if (!listing_id || !quantity || !delivery_address)
      return res.status(400).json({ error: 'listing_id, quantity, delivery_address required' });

    const listing = await prisma.produceListing.findUnique({ where: { id: listing_id } });
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    if (listing.status !== 'LIVE') return res.status(400).json({ error: 'Listing is not available' });
    if (quantity > listing.quantity) return res.status(400).json({ error: 'Insufficient quantity available' });

    const buyerProfile = await prisma.buyerProfile.findFirst({ where: { user_id: req.user.id } });
    if (!buyerProfile) return res.status(400).json({ error: 'Buyer profile not found' });

    const total_amount = listing.final_price_per_unit * quantity;

    const order = await prisma.order.create({
      data: {
        buyer_id: buyerProfile.id,
        listing_id,
        coop_id: listing.coop_id || null,
        quantity: parseFloat(quantity),
        price_per_unit: listing.final_price_per_unit,
        total_amount,
        status: 'PENDING',
        payment_status: 'UNPAID',
        delivery_address,
        delivery_date: delivery_date ? new Date(delivery_date) : null,
      },
      include: { listing: { include: { farmer: true } } },
    });

    // Update listing status if fully ordered
    if (quantity >= listing.quantity) {
      await prisma.produceListing.update({ where: { id: listing_id }, data: { status: 'RESERVED' } });
    }

    // Mock SMS to farmer
    if (listing.farmer_id) {
      const farmer = await prisma.farmerProfile.findUnique({ where: { id: listing.farmer_id } });
      if (farmer) {
        console.log(`[SMS MOCK] To: ${farmer.phone} | Order: ${quantity} ${listing.unit} ${listing.crop_type}, total NGN${total_amount.toLocaleString()}. Await pickup.`);
        await prisma.notification.create({
          data: {
            farmer_id: listing.farmer_id,
            channel: 'SMS',
            message: `Order: ${quantity} ${listing.unit} ${listing.crop_type}, total NGN${total_amount}. Await pickup.`,
            status: 'QUEUED',
          },
        });
      }
    }

    return res.status(201).json(order);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

// GET /orders - buyer sees their orders, agent sees orders of their farmers
router.get('/', authenticate, async (req, res) => {
  try {
    let where = {};
    if (req.user.role === 'BUYER') {
      const bp = await prisma.buyerProfile.findFirst({ where: { user_id: req.user.id } });
      where.buyer_id = bp?.id;
    }
    const orders = await prisma.order.findMany({
      where,
      include: {
        listing: { include: { farmer: { select: { full_name: true, phone: true } }, photos: { take: 1 } } },
        payment: true,
      },
      orderBy: { created_at: 'desc' },
    });
    return res.json(orders);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// PATCH /orders/:id/status
router.patch('/:id/status', authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['CONFIRMED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });

    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status },
      include: { listing: { include: { farmer: true } } },
    });

    // On delivery: simulate payment processing
    if (status === 'DELIVERED') {
      const payment = await prisma.payment.create({
        data: {
          order_id: order.id,
          amount: order.total_amount,
          payment_method: 'SIMULATED',
          transaction_ref: `TXN-${Date.now()}`,
          status: 'SUCCESS',
          paid_at: new Date(),
        },
      });
      await prisma.order.update({ where: { id: order.id }, data: { payment_status: 'PAID' } });

      // Mock SMS to farmer: payment confirmed
      const farmerId = order.listing?.farmer_id;
      if (farmerId) {
        const farmer = await prisma.farmerProfile.findUnique({ where: { id: farmerId } });
        const farmerAmount = order.total_amount * 0.97; // 3% platform fee
        console.log(`[SMS MOCK] To: ${farmer?.phone} | You have been paid NGN${farmerAmount.toLocaleString()} for Order #${order.id.slice(0,8)}.`);
        await prisma.notification.create({
          data: {
            farmer_id: farmerId,
            channel: 'SMS',
            message: `You have been paid NGN${farmerAmount} for Order #${order.id.slice(0,8)}.`,
            status: 'QUEUED',
          },
        });
      }
    }

    return res.json(order);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
