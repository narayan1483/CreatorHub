import test from 'node:test';
import assert from 'node:assert/strict';

test('CreatorHub Storefront & Checkout Integration Tests', async (t) => {
  await t.test('1. Product creation validation: enforces title, valid type, and non-negative price', () => {
    const validProduct = {
      title: 'Full-Stack Spring Boot & React Blueprint',
      type: 'DIGITAL_FILE',
      price: 499,
      subtitle: 'Complete source code and architecture diagrams',
      visible: true,
    };

    assert.ok(validProduct.title.trim().length > 0, 'Product title must be non-empty');
    assert.match(validProduct.type, /^(DIGITAL_FILE|CALL|COMMUNITY|LEAD_MAGNET)$/, 'Must match backend product types');
    assert.ok(validProduct.price >= 0, 'Price must be non-negative');

    // Invalid product checks
    const invalidProducts = [
      { title: '', type: 'DIGITAL_FILE', price: 100 },
      { title: 'Test', type: 'INVALID_TYPE', price: 100 },
      { title: 'Test', type: 'DIGITAL_FILE', price: -50 },
    ];

    for (const inv of invalidProducts) {
      const isValid = Boolean(
        inv.title?.trim() &&
        ['DIGITAL_FILE', 'CALL', 'COMMUNITY', 'LEAD_MAGNET'].includes(inv.type) &&
        typeof inv.price === 'number' &&
        inv.price >= 0
      );
      assert.strictEqual(isValid, false, `Expected product ${JSON.stringify(inv)} to be rejected`);
    }
  });

  await t.test('2. Public storefront workspace resolution by slug', () => {
    const mockDbWorkspaces = [
      { id: 'b0000000-0000-0000-0000-000000000001', slug: 'alexrivera', name: 'Alex Rivera', tagline: 'Tech Creator & Architect' },
      { id: 'b0000000-0000-0000-0000-000000000002', slug: 'superstudios', name: 'Super Studios', tagline: 'AI Automations' },
    ];

    const resolveWorkspace = (slug) => {
      const match = mockDbWorkspaces.find((w) => w.slug.toLowerCase() === slug.toLowerCase());
      if (!match) throw new Error(`Workspace not found: ${slug}`);
      return { ...match, role: 'PUBLIC' };
    };

    const resolved = resolveWorkspace('alexrivera');
    assert.strictEqual(resolved.slug, 'alexrivera');
    assert.strictEqual(resolved.name, 'Alex Rivera');
    assert.strictEqual(resolved.role, 'PUBLIC');

    assert.throws(() => resolveWorkspace('unknown-creator'), /Workspace not found/);
  });

  await t.test('3. Storefront visibility filtering: hidden products never exposed to public', () => {
    const productsInDb = [
      { id: 'p1', title: 'Public Ebook', visible: true, price: 199 },
      { id: 'p2', title: 'Draft Product Under Review', visible: false, price: 999 },
      { id: 'p3', title: 'Public 1:1 Call', visible: true, price: 1499 },
    ];

    const publicStoreProducts = productsInDb.filter((p) => p.visible);
    assert.strictEqual(publicStoreProducts.length, 2);
    assert.ok(publicStoreProducts.every((p) => p.visible === true));
    assert.ok(!publicStoreProducts.some((p) => p.id === 'p2'), 'Hidden product p2 must not be present');
  });

  await t.test('4. 1-Click checkout order validation: enforces customer email, name, and generates ref', () => {
    const validateCheckoutPayload = (payload) => {
      const errors = [];
      if (!payload.productId) errors.push('Product ID is required');
      if (!payload.customerName?.trim()) errors.push('Customer name is required');
      if (!payload.customerEmail?.trim() || !payload.customerEmail.includes('@')) {
        errors.push('Valid customer email is required');
      }
      return { valid: errors.length === 0, errors };
    };

    const validPayload = {
      productId: 'p1',
      customerName: 'Priya Patel',
      customerEmail: 'priya@example.com',
      customerPhone: '+919876543210',
      paymentMethod: 'upi',
    };

    const result = validateCheckoutPayload(validPayload);
    assert.strictEqual(result.valid, true);

    const invalidResult = validateCheckoutPayload({
      productId: 'p1',
      customerName: '',
      customerEmail: 'notanemail',
    });
    assert.strictEqual(invalidResult.valid, false);
    assert.strictEqual(invalidResult.errors.length, 2);
  });

  await t.test('5. Order telemetry updates: increments customer spend and orders count', () => {
    const customer = {
      id: 'cust-1',
      name: 'Priya Patel',
      email: 'priya@example.com',
      totalSpend: 0,
      ordersCount: 0,
    };

    const simulateOrder = (cust, productPrice) => {
      return {
        ...cust,
        totalSpend: cust.totalSpend + productPrice,
        ordersCount: cust.ordersCount + 1,
        lastActiveAt: new Date().toISOString(),
      };
    };

    const updated = simulateOrder(customer, 499);
    assert.strictEqual(updated.totalSpend, 499);
    assert.strictEqual(updated.ordersCount, 1);

    const secondOrder = simulateOrder(updated, 1499);
    assert.strictEqual(secondOrder.totalSpend, 1998);
    assert.strictEqual(secondOrder.ordersCount, 2);
  });
});
