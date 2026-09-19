const AUTH_KEY = 'examAdminAuthed';
// SHA-256 hex of "<username>:<password>". Default is admin / admin123.
// To change: hash the string "newusername:newpassword" with SHA-256 and replace this value.
const ADMIN_CRED_HASH = 'bf6b5bdb74c79ece9fc0ad0ac9fb0359f9555d4f35a83b2e6ec69ae99e09603d';

async function sha256Hex(text) {
  const enc = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function isAdminAuthed() {
  return localStorage.getItem(AUTH_KEY) === '1';
}

function logoutAdmin() {
  localStorage.removeItem(AUTH_KEY);
  location.reload();
}

function requireAdminAuth(rootEl) {
  return new Promise((resolve) => {
    if (isAdminAuthed()) {
      rootEl.hidden = false;
      resolve();
      return;
    }
    rootEl.hidden = true;

    const overlay = document.createElement('div');
    overlay.className = 'auth-overlay';
    overlay.innerHTML = `
      <form class="auth-box">
        <h2>Admin login</h2>
        <label class="field">
          Username
          <input type="text" id="authUsername" autocomplete="username" required />
        </label>
        <label class="field">
          Password
          <input type="password" id="authPassword" autocomplete="current-password" required />
        </label>
        <button type="submit" class="button primary">Log in</button>
        <p class="auth-error" id="authError" hidden>Incorrect username or password.</p>
      </form>
    `;
    document.body.appendChild(overlay);

    const form = overlay.querySelector('form');
    const userInput = document.getElementById('authUsername');
    const passInput = document.getElementById('authPassword');
    const errorEl = document.getElementById('authError');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const hash = await sha256Hex(`${userInput.value}:${passInput.value}`);
      if (hash === ADMIN_CRED_HASH) {
        localStorage.setItem(AUTH_KEY, '1');
        overlay.remove();
        rootEl.hidden = false;
        resolve();
      } else {
        errorEl.hidden = false;
        passInput.value = '';
        passInput.focus();
      }
    });

    setTimeout(() => userInput.focus(), 50);
  });
}
