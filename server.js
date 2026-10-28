
require('dotenv').config();
const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>EarnCircle</title>
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <style>
    body {
      font-family: Arial, sans-serif;
      background: #f2f7f4;
      color: #173b2b;
      text-align: center;
      padding: 50px 20px;
    }
    .card {
      background: white;
      max-width: 520px;
      margin: auto;
      padding: 30px;
      border-radius: 16px;
      box-shadow: 0 4px 18px #0001;
    }
    button {
      background: #16834a;
      color: white;
      border: none;
      padding: 13px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 16px;
    }
    input {
      display: block;
      box-sizing: border-box;
      width: 100%;
      margin: 12px auto;
      padding: 12px;
      border: 1px solid #ccc;
      border-radius: 6px;
    }
    #registration {
      display: none;
      margin-top: 25px;
    }
    #message {
      overflow-wrap: anywhere;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>EarnCircle</h1>
    <p>Grow together. Earn responsibly.</p>
    <button id="start-button" type="button">Get Started</button>

    <div id="registration">
      <h2>Create your account</h2>
      <form id="signup-form">
        <input type="text" id="full-name" placeholder="Full name" required>
        <input type="email" id="email" placeholder="Email address" required>
        <input type="password" id="password"
          placeholder="Choose a password" minlength="8" required>
        <button id="signup-button" type="submit">Create Account</button>
      </form>
      <p id="message" role="status"></p>
    </div>
  </div>

  <script>
    document.getElementById('start-button').addEventListener('click', () => {
      document.getElementById('registration').style.display = 'block';
    });

    const form = document.getElementById('signup-form');
    const message = document.getElementById('message');
    const signupButton = document.getElementById('signup-button');

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      if (!window.supabase) {
        message.textContent =
          'Could not load the registration service. Check your internet connection and reload the page.';
        return;
      }

      signupButton.disabled = true;
      message.textContent = 'Connecting securely...';

      try {
        const response = await fetch('/config');
        const config = await response.json();

        if (!response.ok || !config.url || !config.key) {
          throw new Error('Website configuration is missing. Please check the server setup.');
        }

        const client = window.supabase.createClient(config.url, config.key);

        message.textContent = 'Creating your account...';

        const { data, error } = await client.auth.signUp({
          email: document.getElementById('email').value.trim(),
          password: document.getElementById('password').value,
          options: {
            data: {
              full_name: document.getElementById('full-name').value.trim()
            }
          }
        });

        if (error) throw error;

        message.textContent = data.session
          ? 'Account created successfully!'
          : 'Registration submitted. Check your email for a confirmation link.';
        form.reset();
      } catch (error) {
        message.textContent = 'Registration failed: ' + error.message;
      } finally {
        signupButton.disabled = false;
      }
    });
  </script>
</body>
</html>
  `);
});

app.get('/config', (req, res) => {
  res.json({
    url: process.env.SUPABASE_URL || '',
    key: process.env.SUPABASE_PUBLISHABLE_KEY || ''
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('EarnCircle is running on port ' + PORT);
});
