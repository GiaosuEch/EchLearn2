#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const errors = [];

const app = read('src/App.tsx');
['/login', '/register', '/forgot-password', '/app'].forEach((route) => {
  if (!app.includes(`path=\"${route.replace(/^\//, '')}\"`) && !app.includes(`path=\"${route}\"`)) errors.push(`Missing route ${route}`);
});

const auth = read('src/services/authService.ts');
['signIn', 'signUp', 'signOut', 'resetPassword', 'signInWithProvider'].forEach((name) => {
  if (!auth.includes(`${name}(`)) errors.push(`authService missing ${name}`);
});

const login = read('src/pages/auth/LoginPage.tsx');
if (!login.includes('Google') || !login.includes('GitHub')) errors.push('Login page missing OAuth buttons');

const register = read('src/pages/auth/RegisterPage.tsx');
if (!register.includes('Vui lòng kiểm tra email')) errors.push('Register flow missing Vietnamese email confirmation message');

const forgot = read('src/pages/auth/ForgotPasswordPage.tsx');
if (!forgot.includes('resetPassword')) errors.push('Forgot password page is not wired to authService.resetPassword');

if (errors.length) {
  console.error('FAIL: Auth route verification failed:');
  errors.forEach((e) => console.error(`- ${e}`));
  process.exit(1);
}

console.log('PASS: auth routes and services are wired for production/local modes.');
