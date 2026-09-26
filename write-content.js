const fs = require('fs');
const path = require('path');

const baseDir = 'C:/Users/USER/Accurate Medical Center/src/app/(public)';

// Privacy Policy
const privacyMd = fs.readFileSync(path.join(baseDir, 'privacy-policy/content.md'), 'utf8');
const privacyEscaped = privacyMd.replace(/`/g, '\\`').replace(/\$/g, '\\$');
const privacyOutput = 'export const privacyPolicyContent = `' + privacyEscaped + '`;';
fs.writeFileSync(path.join(baseDir, 'privacy-policy/content.ts'), privacyOutput, 'utf8');
console.log('Privacy done, length:', privacyOutput.length);

// Terms of Service
const termsMd = fs.readFileSync(path.join(baseDir, 'terms-of-service/content.md'), 'utf8');
const termsEscaped = termsMd.replace(/`/g, '\\`').replace(/\$/g, '\\$');
const termsOutput = 'export const termsContent = `' + termsEscaped + '`;';
fs.writeFileSync(path.join(baseDir, 'terms-of-service/content.ts'), termsOutput, 'utf8');
console.log('Terms done, length:', termsOutput.length);