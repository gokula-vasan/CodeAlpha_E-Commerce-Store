const http = require('http');

const PORT = 5000;
const HOST = 'localhost';

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        host: HOST,
        port: PORT,
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        }
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          let parsed = null;
          try {
            parsed = JSON.parse(body);
          } catch {
            parsed = body;
          }
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        });
      }
    );

    req.on('error', reject);

    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('========================================================');
  console.log('     COMPREHENSIVE BACKEND API TEST SUITE               ');
  console.log('========================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(` ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.log(` ❌ FAIL: ${testName} - ${details}`);
      failed++;
    }
  }

  try {
    const timestamp = Date.now();

    // 1. Root Health Check
    const rootRes = await request({ path: '/', method: 'GET' });
    assert(rootRes.status === 200 && rootRes.data.message === 'API is running...', 'GET / (Root Health Check)');

    // 2. Register Regular User (isAdmin: false)
    const userEmail = `shopper_${timestamp}@example.com`;
    const userPassword = 'Password123!';
    const userRegRes = await request(
      { path: '/api/users/register', method: 'POST' },
      { name: 'Shopper Test', email: userEmail, password: userPassword, isAdmin: false }
    );
    assert(
      userRegRes.status === 201 && userRegRes.data.token && userRegRes.data.isAdmin === false,
      'POST /api/users/register (Register Customer Account)',
      JSON.stringify(userRegRes.data)
    );
    const userToken = userRegRes.data.token;

    // 3. Register Admin User (isAdmin: true)
    const adminEmail = `admin_${timestamp}@example.com`;
    const adminPassword = 'AdminPassword123!';
    const adminRegRes = await request(
      { path: '/api/users/register', method: 'POST' },
      { name: 'Admin Test', email: adminEmail, password: adminPassword, isAdmin: true }
    );
    assert(
      adminRegRes.status === 201 && adminRegRes.data.token && adminRegRes.data.isAdmin === true,
      'POST /api/users/register (Register Admin Account)',
      JSON.stringify(adminRegRes.data)
    );
    const adminToken = adminRegRes.data.token;

    // 4. Duplicate Registration Rejection
    const dupRes = await request(
      { path: '/api/users/register', method: 'POST' },
      { name: 'Shopper Test', email: userEmail, password: userPassword }
    );
    assert(dupRes.status === 400, 'POST /api/users/register (Reject Duplicate Email)', JSON.stringify(dupRes.data));

    // 5. Login User with Valid Credentials
    const loginRes = await request(
      { path: '/api/users/login', method: 'POST' },
      { email: userEmail, password: userPassword }
    );
    assert(loginRes.status === 200 && loginRes.data.token, 'POST /api/users/login (Valid Credentials)');

    // 6. Invalid Password Rejection
    const badLoginRes = await request(
      { path: '/api/users/login', method: 'POST' },
      { email: userEmail, password: 'WrongPassword' }
    );
    assert(badLoginRes.status === 401, 'POST /api/users/login (Invalid Password Rejection)');

    // 7. Get User Profile (Protected)
    const profileRes = await request({
      path: '/api/users/profile',
      method: 'GET',
      headers: { Authorization: `Bearer ${userToken}` }
    });
    assert(
      profileRes.status === 200 && profileRes.data.email === userEmail,
      'GET /api/users/profile (Authenticated Profile Fetch)'
    );

    // 8. Update User Profile (Protected)
    const updatedName = 'Shopper Updated Name';
    const updateProfileRes = await request(
      {
        path: '/api/users/profile',
        method: 'PUT',
        headers: { Authorization: `Bearer ${userToken}` }
      },
      { name: updatedName }
    );
    assert(
      updateProfileRes.status === 200 && updateProfileRes.data.name === updatedName,
      'PUT /api/users/profile (Update Profile Name)'
    );

    // 9. Unauthorized Profile Request (No Token)
    const noTokenRes = await request({ path: '/api/users/profile', method: 'GET' });
    assert(noTokenRes.status === 401, 'GET /api/users/profile (Unauthorized Without Token)');

    // 10. Get All Products (Public)
    const productsRes = await request({ path: '/api/products', method: 'GET' });
    assert(
      productsRes.status === 200 && Array.isArray(productsRes.data) && productsRes.data.length > 0,
      `GET /api/products (Fetched ${productsRes.data?.length || 0} Products)`
    );

    // 11. Security Check: Non-Admin Cannot Create Product (403 Forbidden)
    const nonAdminCreate = await request(
      {
        path: '/api/products',
        method: 'POST',
        headers: { Authorization: `Bearer ${userToken}` }
      },
      { name: 'Unauthorized Item', price: 10 }
    );
    assert(
      nonAdminCreate.status === 403,
      'POST /api/products (Security: Non-Admin Blocked with 403 Forbidden)'
    );

    // 12. Create Product by Admin (201 Created)
    const newProductData = {
      name: `Test Smart Speaker ${timestamp}`,
      price: 129,
      description: 'High-fidelity smart audio speaker for testing.',
      category: 'Electronics',
      image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=500&q=60',
      countInStock: 20
    };
    const createProdRes = await request(
      {
        path: '/api/products',
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` }
      },
      newProductData
    );
    assert(
      createProdRes.status === 201 && createProdRes.data._id,
      'POST /api/products (Admin Successfully Creates Product)',
      JSON.stringify(createProdRes.data)
    );
    const createdProductId = createProdRes.data._id;

    // 13. Get Single Product by ID (Public)
    const getProdRes = await request({
      path: `/api/products/${createdProductId}`,
      method: 'GET'
    });
    assert(
      getProdRes.status === 200 && getProdRes.data.name === newProductData.name,
      'GET /api/products/:id (Get Single Product by ID)'
    );

    // 14. Update Product by Admin (200 OK)
    const updateProdRes = await request(
      {
        path: `/api/products/${createdProductId}`,
        method: 'PUT',
        headers: { Authorization: `Bearer ${adminToken}` }
      },
      { price: 149, countInStock: 25 }
    );
    assert(
      updateProdRes.status === 200 && updateProdRes.data.price === 149 && updateProdRes.data.countInStock === 25,
      'PUT /api/products/:id (Admin Updates Product Price & Stock)'
    );

    // 15. Create New Order by Customer (201 Created)
    const orderData = {
      orderItems: [
        {
          name: updateProdRes.data.name,
          qty: 1,
          image: updateProdRes.data.image,
          price: 149,
          product: createdProductId
        }
      ],
      totalPrice: 149,
      paymentMethod: 'Card'
    };
    const createOrderRes = await request(
      {
        path: '/api/orders',
        method: 'POST',
        headers: { Authorization: `Bearer ${userToken}` }
      },
      orderData
    );
    assert(
      createOrderRes.status === 201 && createOrderRes.data._id && createOrderRes.data.isPaid === true,
      'POST /api/orders (Customer Places Order)',
      JSON.stringify(createOrderRes.data)
    );
    const createdOrderId = createOrderRes.data._id;

    // 16. Get My Orders (Customer Personal Orders)
    const myOrdersRes = await request({
      path: '/api/orders/myorders',
      method: 'GET',
      headers: { Authorization: `Bearer ${userToken}` }
    });
    assert(
      myOrdersRes.status === 200 &&
        Array.isArray(myOrdersRes.data) &&
        myOrdersRes.data.some((o) => o._id === createdOrderId),
      'GET /api/orders/myorders (Customer Retrieves Own Orders)'
    );

    // 17. Security Check: Non-Admin Cannot Access All Orders (403 Forbidden)
    const nonAdminOrders = await request({
      path: '/api/orders',
      method: 'GET',
      headers: { Authorization: `Bearer ${userToken}` }
    });
    assert(
      nonAdminOrders.status === 403,
      'GET /api/orders (Security: Non-Admin Blocked from All Orders with 403)'
    );

    // 18. Get All Orders by Admin (200 OK)
    const adminOrdersRes = await request({
      path: '/api/orders',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(
      adminOrdersRes.status === 200 &&
        Array.isArray(adminOrdersRes.data) &&
        adminOrdersRes.data.some((o) => o._id === createdOrderId),
      `GET /api/orders (Admin Retrieves All Store Orders: ${adminOrdersRes.data?.length || 0})`
    );

    // 19. Mark Order as Delivered by Admin (200 OK)
    const deliverRes = await request(
      {
        path: `/api/orders/${createdOrderId}/deliver`,
        method: 'PUT',
        headers: { Authorization: `Bearer ${adminToken}` }
      },
      {}
    );
    assert(
      deliverRes.status === 200 && deliverRes.data.isDelivered === true,
      'PUT /api/orders/:id/deliver (Admin Marks Order as Delivered)'
    );

    // 20. Delete Product by Admin (200 OK)
    const deleteProdRes = await request({
      path: `/api/products/${createdProductId}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(
      deleteProdRes.status === 200 && deleteProdRes.data.message === 'Product removed',
      'DELETE /api/products/:id (Admin Deletes Product)'
    );

    // 21. Verify Product No Longer Exists (404 Not Found)
    const getDeletedProdRes = await request({
      path: `/api/products/${createdProductId}`,
      method: 'GET'
    });
    assert(getDeletedProdRes.status === 404, 'GET /api/products/:id (Deleted Product Returns 404)');

    // 22. Undefined Route Handler (404 Not Found)
    const notFoundRes = await request({
      path: '/api/non-existent-endpoint',
      method: 'GET'
    });
    assert(notFoundRes.status === 404, 'GET /api/* (Global 404 Route Handler)');

    console.log('\n========================================================');
    console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED (TOTAL: ${passed + failed})`);
    console.log('========================================================\n');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Unexpected test error:', err);
    process.exit(1);
  }
}

runTests();
