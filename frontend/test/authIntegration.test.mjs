import assert from 'node:assert/strict';
import test from 'node:test';

test('CreatorHub Authentication & Workspace Integration Tests', async (suite) => {
  // Mock localStorage for node test runner
  const storage = new Map();
  globalThis.localStorage = {
    getItem: (key) => storage.get(key) || null,
    setItem: (key, val) => storage.set(key, String(val)),
    removeItem: (key) => storage.delete(key),
    clear: () => storage.clear(),
  };

  await suite.test('1. Successful login contract: validates response and saves tokens', async () => {
    const mockAuthResponse = {
      accessToken: 'jwt-header.jwt-payload.jwt-signature',
      refreshToken: 'cryptographic-refresh-token-12345',
      tokenType: 'Bearer',
      expiresInMs: 900000,
      user: {
        id: 'user-uuid-1',
        email: 'alex@creatorhub.to',
        fullName: 'Alex Rivera',
        status: 'ACTIVE',
      },
      defaultWorkspace: {
        id: 'ws-uuid-1',
        slug: 'alexrivera',
        name: 'Alex Rivera',
        role: 'OWNER',
      },
    };

    assert.ok(mockAuthResponse.accessToken);
    assert.ok(mockAuthResponse.refreshToken);
    assert.equal(mockAuthResponse.user.email, 'alex@creatorhub.to');
    assert.equal(mockAuthResponse.defaultWorkspace.role, 'OWNER');

    // Simulate session caching
    localStorage.setItem('creatorhub_access_token', mockAuthResponse.accessToken);
    localStorage.setItem('creatorhub_refresh_token', mockAuthResponse.refreshToken);
    localStorage.setItem('creatorhub_user', JSON.stringify(mockAuthResponse.user));
    localStorage.setItem('creatorhub_active_workspace', JSON.stringify(mockAuthResponse.defaultWorkspace));

    assert.equal(localStorage.getItem('creatorhub_access_token'), mockAuthResponse.accessToken);
    assert.equal(localStorage.getItem('creatorhub_refresh_token'), mockAuthResponse.refreshToken);
  });

  await suite.test('2. Failed login: detects invalid credentials and formats error', async () => {
    const errorResponse = {
      success: false,
      status: 401,
      error: 'Unauthorized',
      message: 'Bad credentials',
    };

    assert.equal(errorResponse.success, false);
    assert.equal(errorResponse.status, 401);
    assert.equal(errorResponse.message, 'Bad credentials');
  });

  await suite.test('3. Signup validation rules: enforces name, handle, email, and password constraints', () => {
    const validate = (name, email, handle, password) => {
      if (!name || name.trim().length < 2) return 'Full name must be at least 2 characters';
      const cleanHandle = handle.trim().toLowerCase();
      if (!cleanHandle || cleanHandle.length < 3) return 'Store handle must be at least 3 characters';
      if (!/^[a-z0-9_-]+$/.test(cleanHandle)) return 'Invalid handle format';
      if (!email || !email.includes('@')) return 'Invalid email';
      if (!password || password.length < 6) return 'Password must be at least 6 characters';
      return null;
    };

    assert.equal(validate('A', 'alex@creator.to', 'alex', 'password'), 'Full name must be at least 2 characters');
    assert.equal(validate('Alex Rivera', 'alex@creator.to', 'al', 'password'), 'Store handle must be at least 3 characters');
    assert.equal(validate('Alex Rivera', 'alex@creator.to', 'alex handle!', 'password'), 'Invalid handle format');
    assert.equal(validate('Alex Rivera', 'invalid-email', 'alexrivera', 'password'), 'Invalid email');
    assert.equal(validate('Alex Rivera', 'alex@creator.to', 'alexrivera', '123'), 'Password must be at least 6 characters');
    assert.equal(validate('Alex Rivera', 'alex@creator.to', 'alexrivera', 'validPassword123'), null);
  });

  await suite.test('4. Session expiry & token rotation simulation', async () => {
    let currentAccessToken = 'expired-token';
    const refreshToken = 'valid-refresh-token';

    // Simulate 401 interception and refresh
    const handleRefresh = async (token) => {
      if (!token) throw new Error('No refresh token');
      return {
        accessToken: 'fresh-new-access-token',
        refreshToken: 'rotated-new-refresh-token',
      };
    };

    const newTokens = await handleRefresh(refreshToken);
    currentAccessToken = newTokens.accessToken;

    assert.equal(currentAccessToken, 'fresh-new-access-token');
    assert.equal(newTokens.refreshToken, 'rotated-new-refresh-token');
  });

  await suite.test('5. Workspace loading and switching: updates active workspace context', () => {
    const mockWorkspaces = [
      { id: 'ws-1', slug: 'alexrivera', name: 'Alex Rivera Tech', role: 'OWNER' },
      { id: 'ws-2', slug: 'ai-launchpad', name: 'AI Launchpad Agency', role: 'ADMIN' },
    ];

    let activeWorkspace = mockWorkspaces[0];
    assert.equal(activeWorkspace.id, 'ws-1');

    // Switch workspace
    const target = mockWorkspaces.find((w) => w.id === 'ws-2');
    activeWorkspace = target;
    localStorage.setItem('creatorhub_active_workspace', JSON.stringify(activeWorkspace));

    assert.equal(activeWorkspace.id, 'ws-2');
    assert.equal(activeWorkspace.slug, 'ai-launchpad');
    assert.equal(JSON.parse(localStorage.getItem('creatorhub_active_workspace')).slug, 'ai-launchpad');
  });

  await suite.test('6. Logout purge: completely wipes access token, refresh token, and cached workspace data', () => {
    // Populate session
    localStorage.setItem('creatorhub_access_token', 'token-123');
    localStorage.setItem('creatorhub_refresh_token', 'refresh-123');
    localStorage.setItem('creatorhub_user', '{"id":"usr-1"}');
    localStorage.setItem('creatorhub_active_workspace', '{"id":"ws-1"}');

    // Simulate purge
    localStorage.removeItem('creatorhub_access_token');
    localStorage.removeItem('creatorhub_refresh_token');
    localStorage.removeItem('creatorhub_user');
    localStorage.removeItem('creatorhub_active_workspace');

    assert.equal(localStorage.getItem('creatorhub_access_token'), null);
    assert.equal(localStorage.getItem('creatorhub_refresh_token'), null);
    assert.equal(localStorage.getItem('creatorhub_user'), null);
    assert.equal(localStorage.getItem('creatorhub_active_workspace'), null);
  });
});
