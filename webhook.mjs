import express from 'express';
import bodyParser from 'body-parser';
import { exec } from 'child_process';
import crypto from 'crypto';

const app = express();
app.use(bodyParser.json({ verify: verifyGitHubSignature }));

const SECRET = '1b7e56e7faab76c823781f2b9fd84a6be68a1db7451b5de5453d9c1aa339ad8b'; // same secret from GitHub

function verifyGitHubSignature(req, res, buf) {
  const signature = req.headers['x-hub-signature-256'];
  if (!signature) return;

  const hmac = crypto.createHmac('sha256', SECRET);
  hmac.update(buf);

  const digest = `sha256=${hmac.digest('hex')}`;
  if (digest !== signature) {
    throw new Error('Invalid GitHub signature');
  }
}

app.post('/webhook', (req, res) => {
  console.log('🔥 Webhook received from GitHub!');

  exec('/var/www/cre8ify-backend-develop/deploy.sh', (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Error: ${error.message}`);
      console.error(`stderr: ${stderr}`);
      return res.status(500).send('Deploy failed');
    }

    console.log(`✅ Output:\n${stdout}`);
    res.status(200).send('Deployed!');
  });
});

app.listen(9000, () => {
  console.log('🚀 Webhook server listening on port 9000 (with signature verification)');
});
