// ============================================================
// netlify/functions/send-email.js
// פונקציית Netlify לשליחת מיילים דרך Resend
// ה-API Key נקרא ממשתנה סביבה — לא כתוב בקוד
// ============================================================

exports.handler = async (event) => {

  // רק POST מותר
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // קריאת ה-API Key ממשתנה סביבה של Netlify
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Missing API key' }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { fullName, phone, email, calcSummary, pdfBase64, firstName, world } = payload;

  // ולידציה בסיסית
  if (!fullName || !phone || !email || !pdfBase64) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) };
  }

  // פונקציה פנימית לשליחת מייל דרך Resend
  async function sendMail(to, subject, html) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + RESEND_API_KEY
      },
      body: JSON.stringify({
        from: 'Tsarfati Mortgage <calculator@tsarfati-mashkanta.com>',
        to: [to],
        subject,
        html,
        attachments: [{
          filename: 'mortgage-calculation.pdf',
          content: pdfBase64
        }]
      })
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error('Resend error: ' + err);
    }
    return res.json();
  }

  try {
    // מייל 1 — ללקוח עם PDF מצורף
    await sendMail(
      email,
      'סיכום חישוב המשכנתה שלך — צרפתי ייעוץ משכנתאות',
      `<div dir="rtl" style="font-family:Arial,sans-serif;direction:rtl;text-align:right;">
        <p>שלום ${firstName},</p>
        <p>מצורף סיכום חישוב המשכנתה שביצעת באתר שלנו.</p>
        <p>החישוב מבוסס על הנחות ממוצעות ואינו מהווה התחייבות.</p>
        <p>לשיחת ייעוץ ללא עלות והתחייבות — צור קשר:</p>
        <p>📞 054-499-8889</p>
        <p>🌐 <a href="https://www.tsarfaticonsulting.com">www.tsarfaticonsulting.com</a></p>
        <br>
        <p>בברכה,<br><strong>אופיר צרפתי</strong></p>
      </div>`
    );

    // מייל 2 — ליד לאופיר עם כל הפרטים
    await sendMail(
      'tsarfati.consulting@gmail.com',
      `ליד חדש — ${fullName} — חישוב משכנתה`,
      `<div dir="rtl" style="font-family:Arial,sans-serif;direction:rtl;text-align:right;">
        <p><strong>ליד חדש ממחשבון המשכנתה</strong></p>
        <p>שם: ${fullName} | נייד: ${phone} | מייל: ${email}</p>
        <p>עולם: ${world}</p>
        <p>פרטי חישוב: ${calcSummary}</p>
      </div>`
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };

  } catch (err) {
    console.error('Email send error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
