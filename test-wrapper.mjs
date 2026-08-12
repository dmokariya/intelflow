import { execSync } from 'child_process';
try {
  execSync('node --import ./tests/mock-cloudflare.mjs --test tests/rendered-html.test.mjs', { stdio: 'inherit' });
} catch (e) {
  process.exit(1);
}
