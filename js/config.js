/* ============================================================
   config.js — this page's settings (4 Nov 2026).
   ============================================================ */
window.PRACTICAL_CONFIG = {

  /* This page's id: the labs script's PRACTICALS and labs-shared/practicals.json name it the same way. */
  id: 'ks3-y7-cell-organelles',

  /* Where a signed-in student's progress is sent: the /exec URL of the deployed labs Apps Script, the same address as
     every lab. Leave it empty and the page still works; nothing then leaves the student's browser. */
  submitUrl: 'https://script.google.com/macros/s/AKfycbzwjMHaa88OL_GzR8wZ2mV6a8rs1CKYahbW5iOTQPyzWzCGIrAZPApGsP2oujK34tRc/exec',

  /* Signing in, so that a student's progress can be attributed: only students on the teacher's Students tab are
     recorded. A Client ID is a name-tag for the app, issued by Google: not a secret, and the same as every lab's. */
  googleClientId: '749068441640-jgh9s0rbg8ed9hl14mtv6kdhg5jg6ddf.apps.googleusercontent.com'
};
