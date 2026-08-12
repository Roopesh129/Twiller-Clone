const fetch = require('node-fetch');

async function test() {
    try {
        const res = await fetch('http://localhost:5000/api/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identity: 'ksai69583@gmail.com', manualPassword: 'NewPassword123' })
        });
        const data = await res.json();
        console.log(res.status, data);
    } catch (err) {
        console.error(err);
    }
}
test();
