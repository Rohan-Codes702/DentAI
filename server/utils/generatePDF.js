const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const TMP_DIR = path.join(__dirname, '..', 'uploads');
const PATIENT_REVIEW_THRESHOLD = 0.60;

if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

const COLORS = {
  navy: '#12304A',
  text: '#243746',
  muted: '#617382',
  border: '#D9E4EA',
  background: '#F5F9FB',
  white: '#FFFFFF',
  primary: '#168AAD',
  primarySoft: '#E4F4F7',
  success: '#238B5A',
  successSoft: '#E5F5EC',
  warning: '#C47718',
  warningSoft: '#FFF3DE',
};

const FINDING_COPY = {
  caries: ['Dental Caries', 'A cavity or area of tooth decay may be present.'],
  crown: ['Dental Crown', 'A dental crown was seen on the X-ray.'],
  filling: ['Dental Filling', 'A tooth with a filling or repair was seen on the X-ray.'],
  implant: ['Dental Implant', 'A dental implant was seen on the X-ray.'],
  'missing teeth': ['Missing Tooth', 'A tooth appears to be missing in this area.'],
  'periapical lesion': ['Area Around Tooth Root', 'An area around a tooth root may need dental evaluation.'],
  'root canal treatment': ['Root Canal Treatment', 'A tooth with root canal treatment was seen on the X-ray.'],
  'root piece': ['Root Piece', 'A small root piece was seen in this area.'],
  'impacted tooth': ['Impacted Tooth', 'A tooth may be stuck or not fully in its normal position.'],
  'bone loss': ['Bone Change', 'The bone around one or more teeth may need dental attention.'],
  'tooth discoloration': ['Tooth Discoloration', 'A change in the appearance of a tooth was seen on the X-ray.'],
  'root resorption': ['Root Change', 'A change near the root of a tooth may need closer examination.'],
  'crown fracture': ['Possible Tooth Damage', 'An area of tooth damage may need examination.'],
  'periodontal disease': ['Gum Area to Check', 'An area around the gums may need further examination.'],
  calculus: ['Tartar Build-up', 'A build-up around the teeth may need to be checked and cleaned.'],
};

// Matches the BGR class colors used by the X-ray annotation service, converted to RGB.
const FINDING_COLORS = {
  caries: '#FF0000',
  crown: '#00BFFF',
  filling: '#FFFF00',
  implant: '#FF00FF',
  'missing teeth': '#808080',
  'periapical lesion': '#C80000',
  'root canal treatment': '#00A5FF',
  'root piece': '#FFA500',
  'impacted tooth': '#00FF00',
  'bone loss': '#FFC0CB',
};

const safe = (value, fallback = '-') => (
  value === undefined || value === null || value === '' ? fallback : String(value)
);

const formatDate = (value) => value
  ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  : '-';

const confidenceNumber = (value) => {
  const number = Number(value || 0);
  return number <= 1 ? number : number / 100;
};

const downloadImage = (url, destination) => new Promise((resolve, reject) => {
  const client = url.startsWith('https') ? https : http;
  const file = fs.createWriteStream(destination);
  const request = client.get(url, (response) => {
    if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
      file.close();
      fs.unlink(destination, () => {});
      downloadImage(response.headers.location, destination).then(resolve).catch(reject);
      return;
    }
    if (response.statusCode !== 200) {
      file.close();
      fs.unlink(destination, () => {});
      reject(new Error(`Image download failed: ${response.statusCode}`));
      return;
    }
    response.pipe(file);
    file.on('finish', () => file.close(() => resolve(destination)));
  });
  request.on('error', (error) => {
    file.close();
    fs.unlink(destination, () => {});
    reject(error);
  });
});

const resolveImage = async (url, filename) => {
  if (!url) return null;
  try {
    if (url.startsWith('data:image')) {
      const destination = path.join(TMP_DIR, filename);
      fs.writeFileSync(destination, Buffer.from(url.split('base64,')[1], 'base64'));
      return { path: destination, temporary: true };
    }
    if (fs.existsSync(url)) return { path: url, temporary: false };
    const projectPath = path.join(__dirname, '..', String(url).replace(/^[/\\]+/, ''));
    if (fs.existsSync(projectPath)) return { path: projectPath, temporary: false };
    const uploadPath = path.join(TMP_DIR, path.basename(String(url).split('?')[0]));
    if (fs.existsSync(uploadPath)) return { path: uploadPath, temporary: false };
    if (url.startsWith('http://') || url.startsWith('https://')) {
      const destination = path.join(TMP_DIR, filename);
      await downloadImage(url, destination);
      return { path: destination, temporary: true };
    }
  } catch (error) {
    console.warn('[PDF] Image warning:', error.message);
  }
  return null;
};

const containedImageSize = (doc, imagePath, maxWidth, maxHeight) => {
  const image = doc.openImage(imagePath);
  const scale = Math.min(maxWidth / image.width, maxHeight / image.height, 1);
  return { width: image.width * scale, height: image.height * scale };
};

const box = (doc, x, y, width, height, fill = COLORS.white, stroke = COLORS.border, radius = 12) => {
  doc.roundedRect(x, y, width, height, radius).fillAndStroke(fill, stroke);
};

const header = (doc, diagnosis) => {
  const clinic = diagnosis.dentist?.dentistProfile?.clinicName || 'DentAI Dental Clinic';
  doc.rect(0, 0, 595, 104).fill(COLORS.navy);
  doc.roundedRect(44, 25, 54, 54, 14).fill(COLORS.primary);
  doc.font('Helvetica-Bold').fontSize(21).fillColor(COLORS.white).text('D', 44, 40, { width: 54, align: 'center' });
  doc.font('Helvetica-Bold').fontSize(21).fillColor(COLORS.white).text('DentAI', 116, 28);
  doc.font('Helvetica').fontSize(9).fillColor('#D8EAF0').text('Dental Check-Up Report', 116, 55);
  doc.font('Helvetica-Bold').fontSize(10).fillColor(COLORS.white).text(clinic, 350, 34, { width: 200, align: 'right' });
  doc.font('Helvetica').fontSize(8).fillColor('#D8EAF0').text(`Report date: ${formatDate(diagnosis.createdAt)}`, 350, 54, { width: 200, align: 'right' });
};

const findingFrom = (detection) => {
  const key = String(detection.className || detection.condition || 'Dental finding').toLowerCase();
  const copy = FINDING_COPY[key] || [detection.className || detection.condition || 'Dental Finding', 'This area may need closer examination by your dentist.'];
  return { key, name: copy[0], explanation: copy[1], color: FINDING_COLORS[key] || COLORS.primary };
};

const groupedFindings = (diagnosis) => {
  const edited = diagnosis.dentistReview?.modifiedDetections;
  const source = Array.isArray(edited) && edited.length ? edited : (diagnosis.aiDetections || []);
  return source
    .filter((item) => confidenceNumber(item.confidence) >= PATIENT_REVIEW_THRESHOLD)
    .map(findingFrom)
    .reduce((groups, item) => {
      const existing = groups.find((group) => group.key === item.key);
      if (existing) existing.count += 1;
      else groups.push({ ...item, count: 1 });
      return groups;
    }, []);
};

const drawFinding = (doc, finding, index, y) => {
  const title = `${finding.name} - ${finding.count} found`;
  const titleHeight = doc.heightOfString(title, { width: 430, font: 'Helvetica-Bold', fontSize: 16 });
  const height = Math.max(84, titleHeight + 57);
  box(doc, 50, y, 495, height);
  doc.rect(50, y, 8, height).fill(finding.color);
  doc.font('Helvetica-Bold').fontSize(8).fillColor(COLORS.muted).text(`FINDING ${index + 1}`, 72, y + 12);
  doc.font('Helvetica-Bold').fontSize(16).fillColor(COLORS.navy).text(title, 72, y + 26, { width: 430 });
  doc.font('Helvetica-Bold').fontSize(8.5).fillColor(COLORS.primary).text('What does this mean?', 72, y + 32 + titleHeight);
  doc.font('Helvetica').fontSize(9).fillColor(COLORS.text).text(finding.explanation, 72, y + 46 + titleHeight, { width: 440 });
  return y + height + 10;
};

const drawImage = (doc, image, x, y, width, height, title) => {
  box(doc, x, y, width, height);
  doc.font('Helvetica-Bold').fontSize(10).fillColor(COLORS.navy).text(title, x + 13, y + 13);
  try {
    const areaWidth = width - 24;
    const areaHeight = height - 48;
    const size = containedImageSize(doc, image, areaWidth, areaHeight);
    doc.image(image, x + 12 + (areaWidth - size.width) / 2, y + 38 + (areaHeight - size.height) / 2, size);
  } catch (error) {
    doc.font('Helvetica').fontSize(9).fillColor(COLORS.muted).text('X-ray image is not available.', x + 12, y + height / 2, { width: width - 24, align: 'center' });
  }
};

const footer = (doc) => {
  const pages = doc.bufferedPageRange();
  for (let index = pages.start; index < pages.start + pages.count; index += 1) {
    doc.switchToPage(index);
    doc.strokeColor(COLORS.border).lineWidth(0.5).moveTo(50, 780).lineTo(545, 780).stroke();
    doc.font('Helvetica').fontSize(7).fillColor(COLORS.muted).text('DentAI | Your dental care summary', 50, 788);
    doc.text(`Page ${index + 1} of ${pages.count}`, 450, 788, { width: 95, align: 'right' });
  }
};

const generateDiagnosisPDF = async (diagnosis) => {
  const outputPath = path.join(TMP_DIR, `report-${diagnosis._id}.pdf`);
  const doc = new PDFDocument({ size: 'A4', margins: { top: 40, bottom: 50, left: 50, right: 50 }, bufferPages: true });
  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  const patient = diagnosis.patient || {};
  const dentist = diagnosis.dentist || {};
  const findings = groupedFindings(diagnosis);
  const note = safe(diagnosis.dentistReview?.notes, 'Your X-ray has been checked by your dentist.');
  const reviewed = diagnosis.dentistReview?.confirmed === true || diagnosis.status === 'confirmed';

  header(doc, diagnosis);
  doc.font('Helvetica-Bold').fontSize(24).fillColor(COLORS.navy).text('Your Dental Result', 50, 128);
  doc.font('Helvetica').fontSize(10).fillColor(COLORS.muted).text('A simple summary of your dental X-ray review.', 50, 160);

  box(doc, 50, 185, 495, 102, COLORS.background, COLORS.border, 10);
  doc.font('Helvetica-Bold').fontSize(10).fillColor(COLORS.primary).text('REPORT INFORMATION', 68, 200);
  doc.font('Helvetica-Bold').fontSize(8).fillColor(COLORS.muted).text('PATIENT NAME', 68, 225);
  doc.font('Helvetica').fontSize(10).fillColor(COLORS.text).text(safe(patient.name), 68, 238);
  doc.font('Helvetica-Bold').fontSize(8).fillColor(COLORS.muted).text('REPORT DATE', 270, 225);
  doc.font('Helvetica').fontSize(10).fillColor(COLORS.text).text(formatDate(diagnosis.createdAt), 270, 238);
  doc.font('Helvetica-Bold').fontSize(8).fillColor(COLORS.muted).text('REPORT ID', 68, 263);
  doc.font('Helvetica').fontSize(8).fillColor(COLORS.text).text(safe(diagnosis._id), 68, 275, { width: 430 });

  let y = 315;
  doc.font('Helvetica-Bold').fontSize(16).fillColor(COLORS.navy).text('What We Found', 50, y);
  y += 28;
  if (!findings.length) {
    box(doc, 50, y, 495, 86, COLORS.successSoft, '#BFE7CF');
    doc.font('Helvetica-Bold').fontSize(18).fillColor(COLORS.success).text('No dental problem was found in this X-ray.', 70, y + 23, { width: 455 });
    doc.font('Helvetica').fontSize(9.5).fillColor(COLORS.text).text('Your dentist can discuss your X-ray during your regular dental visit.', 70, y + 56, { width: 455 });
    y += 101;
  } else {
    findings.forEach((finding, index) => { y = drawFinding(doc, finding, index, y); });
  }

  const reviewY = Math.min(y + 8, 640);
  box(doc, 50, reviewY, 495, 126, COLORS.primarySoft, '#B9DFE7');
  doc.font('Helvetica-Bold').fontSize(13).fillColor(COLORS.primary).text("Dentist's Review", 70, reviewY + 17);
  doc.font('Helvetica').fontSize(9).fillColor(COLORS.text).text(reviewed ? 'Your X-ray was checked by the dentist.' : 'Your X-ray is waiting for dentist review.', 70, reviewY + 42, { width: 455 });
  doc.font('Helvetica-Bold').fontSize(10).fillColor(COLORS.navy).text(`Dr. ${safe(dentist.name, 'your dentist')}`, 70, reviewY + 60);
  doc.font('Helvetica-Bold').fontSize(9).fillColor(COLORS.primary).text("Dentist's Note", 70, reviewY + 80);
  doc.font('Helvetica').fontSize(9).fillColor(COLORS.text).text(note, 70, reviewY + 95, { width: 455, lineGap: 2 });

  doc.addPage();
  header(doc, diagnosis);
  doc.font('Helvetica-Bold').fontSize(21).fillColor(COLORS.navy).text('Your Dental X-ray', 50, 128);
  doc.font('Helvetica').fontSize(10).fillColor(COLORS.muted).text('The highlighted image shows the areas listed in your report.', 50, 160);

  const original = await resolveImage(diagnosis.xrayImage?.url, `patient-original-${diagnosis._id}.jpg`);
  const annotated = await resolveImage(diagnosis.annotatedImage?.url, `patient-highlighted-${diagnosis._id}.jpg`);
  if (original && annotated) {
    drawImage(doc, original.path, 50, 190, 240, 355, 'Original X-ray');
    drawImage(doc, annotated.path, 305, 190, 240, 355, 'Highlighted X-ray');
  } else if (original || annotated) {
    drawImage(doc, (annotated || original).path, 50, 190, 495, 410, annotated ? 'Highlighted X-ray' : 'Original X-ray');
  } else {
    box(doc, 50, 190, 495, 300, COLORS.background);
    doc.font('Helvetica').fontSize(10).fillColor(COLORS.muted).text('X-ray image is not available.', 50, 335, { width: 495, align: 'center' });
  }

  const infoY = original && annotated ? 580 : 630;
  box(doc, 50, infoY, 495, 92, COLORS.warningSoft, '#F1D39E');
  doc.font('Helvetica-Bold').fontSize(10).fillColor(COLORS.warning).text('IMPORTANT INFORMATION', 68, infoY + 16);
  doc.font('Helvetica').fontSize(9).fillColor(COLORS.text).text('Your dental X-ray has been reviewed by a dentist. This report helps you understand your dental findings. Please speak with your dentist if you have questions or concerns.', 68, infoY + 34, { width: 455, lineGap: 2 });

  if (original?.temporary && fs.existsSync(original.path)) fs.unlink(original.path, () => {});
  if (annotated?.temporary && fs.existsSync(annotated.path)) fs.unlink(annotated.path, () => {});
  footer(doc);
  doc.end();

  return new Promise((resolve, reject) => {
    stream.on('finish', () => resolve(outputPath));
    stream.on('error', reject);
  });
};

module.exports = { generateDiagnosisPDF };
