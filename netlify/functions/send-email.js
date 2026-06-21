exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

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

  const { fullName, phone, email, calcSummary, firstName, world, rows } = payload;

  if (!fullName || !phone || !email) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) };
  }

  const today = new Date().toLocaleDateString('he-IL');
  const logoUrl = 'https://raw.githubusercontent.com/tsarfaticonsulting-source/mortgage-calculator/main/logo.png';

  let tableRows = '';
  if (rows && rows.length) {
    rows.forEach((r, i) => {
      const bg = i % 2 === 0 ? '#f0f7f6' : '#ffffff';
      tableRows += `<tr style="background:${bg};"><td style="padding:11px 16px;font-size:14px;color:#444;border-bottom:1px solid #e0eeec;">${r[0]}</td><td style="padding:11px 16px;font-size:14px;font-weight:700;color:#1a5c52;text-align:left;direction:ltr;border-bottom:1px solid #e0eeec;">${r[1]}</td></tr>`;
    });
  }

  const clientHtml = `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
*{box-sizing:border-box;}
body{margin:0;padding:20px 0;background:#f0f4f3;font-family:Arial,Helvetica,sans-serif;direction:rtl;}
.card{max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 6px 30px rgba(0,0,0,0.10);}
.header{background:#fff;padding:24px 20px 18px;text-align:center;border-bottom:2px solid #e8f0ef;}
.title-bar{background:#1a5c52;padding:16px 24px;text-align:center;}
.title-bar h2{margin:0;font-size:18px;color:#fff;}
.title-bar p{margin:5px 0 0;font-size:12px;color:rgba(255,255,255,0.75);}
.body{padding:20px 24px 10px;}
.body p{margin:0 0 8px;font-size:14px;color:#333;line-height:1.8;}
.table-wrap{padding:12px 18px;}
.data-table{width:100%;border-collapse:collapse;border-radius:10px;overflow:hidden;border:1px solid #d0e8e4;}
.data-table .thead td{background:#1a5c52;color:white;padding:11px 16px;font-size:13px;font-weight:700;}
.data-table tr:nth-child(even) td{background:#f0f7f6;}
.data-table tr:nth-child(odd) td{background:#fff;}
.data-table td{padding:12px 16px;font-size:14px;border-bottom:1px solid #e8f0ef;color:#333;}
.val{font-weight:700;color:#1a5c52;text-align:left;direction:ltr;}
.disclaimer{margin:4px 18px 14px;background:#fffbf0;border:1px solid #ffe0b2;border-radius:8px;padding:10px 14px;font-size:11px;color:#999;line-height:1.7;text-align:center;}
.cta{padding:6px 18px 26px;text-align:center;}
.cta a{display:inline-block;background:#e8622a;color:white;padding:14px 36px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;}
.footer{background:#1a5c52;padding:16px 20px;text-align:center;color:rgba(255,255,255,0.75);font-size:11px;line-height:2;}
</style>
</head>
<body>
<div class="card">
  <div class="header">
    <img src="${logoUrl}" width="200" alt="צרפתי ייעוץ משכנתאות ופיננסים" style="display:block;margin:0 auto;">
  </div>
  <div class="title-bar">
    <h2>סיכום חישוב משכנתה</h2>
    <p>עבור: ${fullName} &nbsp;|&nbsp; ${today}</p>
  </div>
  <div class="body">
    <p>שלום ${firstName},</p>
    <p>מצורף סיכום חישוב המשכנתה שביצעת באתר שלנו. החישוב מבוסס על הנחות ממוצעות ומיועד לתת לך תמונה ראשונית.</p>
  </div>
  <div class="table-wrap">
    <table class="data-table">
      <tr class="thead"><td>פרטי החישוב</td><td class="val">ערך</td></tr>
      ${tableRows}
    </table>
  </div>
  <div class="disclaimer">* החישוב מבוסס על הנחות ממוצעות ואינו מהווה התחייבות או הצעת מחיר. לניתוח מדויק — פנה אלינו לייעוץ.</div>
  <div class="cta">
    <a href="https://wa.me/972544998889?text=%D7%94%D7%99%D7%99%20%D7%90%D7%95%D7%A4%D7%99%D7%A8%2C%20%D7%94%D7%A9%D7%AA%D7%9E%D7%A9%D7%AA%D7%99%20%D7%91%D7%9E%D7%97%D7%A9%D7%91%D7%95%D7%9F%20%D7%94%D7%9E%D7%A9%D7%9B%D7%A0%D7%AA%D7%94%20%D7%95%D7%90%D7%A9%D7%9E%D7%97%20%D7%9C%D7%A9%D7%99%D7%97%D7%AA%20%D7%99%D7%99%D7%A2%D7%95%D7%A5">📞 דבר עם אופיר עכשיו ←</a>
  </div>
  <div class="footer">
    054-499-8889 &nbsp;|&nbsp; tsarfati.consulting@gmail.com<br>
    נעמי שמר 5, קריית אונו &nbsp;|&nbsp; <a href="https://www.tsarfaticonsulting.com" style="color:rgba(255,255,255,0.9);text-decoration:underline;">www.tsarfaticonsulting.com</a>
  </div>
</div>
</body></html>`;

  const ownerHtml = `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;direction:rtl;padding:20px;background:#f5f5f5;">
  <div style="max-width:500px;margin:0 auto;background:white;border-radius:10px;padding:24px;border-right:5px solid #1a5c52;">
    <h2 style="color:#1a5c52;margin-top:0;">🔔 ליד חדש ממחשבון המשכנתה</h2>
    <table cellpadding="8" cellspacing="0" style="width:100%;border-collapse:collapse;">
      <tr style="background:#f0f7f6;"><td style="font-weight:700;width:100px;">שם</td><td>${fullName}</td></tr>
      <tr><td style="font-weight:700;">נייד</td><td><a href="tel:${phone}">${phone}</a></td></tr>
      <tr style="background:#f0f7f6;"><td style="font-weight:700;">מייל</td><td><a href="mailto:${email}">${email}</a></td></tr>
      <tr><td style="font-weight:700;">עולם</td><td>${world === 'purchase' ? 'רכישה' : world === 'refi' ? 'מחזור' : 'כל מטרה'}</td></tr>
    </table>
    <div style="margin-top:16px;padding:12px;background:#f0f7f6;border-radius:6px;font-size:13px;color:#333;">
      <strong>פרטי חישוב:</strong><br>${calcSummary}
    </div>
    <div style="margin-top:16px;text-align:center;">
      <a href="https://wa.me/972${phone.replace(/^0/, '')}?text=${encodeURIComponent('היי ' + firstName + ', ראיתי שביצעת חישוב במחשבון המשכנתה שלי. אשמח לעזור!')}" style="display:inline-block;background:#25d366;color:white;padding:10px 24px;border-radius:6px;text-decoration:none;font-weight:700;">📱 שלח וואטסאפ ל${firstName}</a>
    </div>
  </div>
</body></html>`;

  async function sendMail(to, subject, html) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + RESEND_API_KEY },
      body: JSON.stringify({ from: 'Tsarfati Mortgage <noreply@tsarfati-mashkanta.com>', to: [to], subject, html })
    });
    if (!res.ok) throw new Error('Resend error: ' + await res.text());
    return res.json();
  }

  try {
    await sendMail(email, 'סיכום חישוב המשכנתה שלך — צרפתי ייעוץ משכנתאות', clientHtml);
    await sendMail('tsarfati.consulting@gmail.com', `ליד חדש — ${fullName} — חישוב משכנתה`, ownerHtml);
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (err) {
    console.error('Email error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
