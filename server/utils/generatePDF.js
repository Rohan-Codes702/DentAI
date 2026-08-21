const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const TMP_DIR = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(TMP_DIR)) {
  fs.mkdirSync(TMP_DIR, { recursive: true });
}

/* =========================================================
   COLORS
========================================================= */

const COLORS = {
  primary: '#0EA5E9',
  primaryDark: '#0369A1',
  navy: '#0F172A',
  text: '#1E293B',
  muted: '#64748B',
  lightText: '#94A3B8',
  border: '#E2E8F0',
  background: '#F8FAFC',
  white: '#FFFFFF',

  success: '#16A34A',
  successBg: '#DCFCE7',

  warning: '#D97706',
  warningBg: '#FEF3C7',

  danger: '#DC2626',
  dangerBg: '#FEE2E2',

  infoBg: '#E0F2FE',
};

/* =========================================================
   DOWNLOAD REMOTE IMAGE
========================================================= */

const downloadImage = (url, destPath) => {
  return new Promise((resolve, reject) => {
    if (!url) {
      reject(new Error('Image URL is missing'));
      return;
    }

    const client = url.startsWith('https') ? https : http;

    const file = fs.createWriteStream(destPath);

    const request = client.get(url, (response) => {
      if (
        response.statusCode >= 300 &&
        response.statusCode < 400 &&
        response.headers.location
      ) {
        file.close();
        fs.unlink(destPath, () => {});

        downloadImage(response.headers.location, destPath)
          .then(resolve)
          .catch(reject);

        return;
      }

      if (response.statusCode !== 200) {
        file.close();
        fs.unlink(destPath, () => {});

        reject(
          new Error(
            `Failed to download image: HTTP ${response.statusCode}`
          )
        );

        return;
      }

      response.pipe(file);

      file.on('finish', () => {
        file.close(() => resolve(destPath));
      });
    });

    request.on('error', (err) => {
      file.close();
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
};

/* =========================================================
   IMAGE SIZE
========================================================= */

const getContainedSize = (
  doc,
  imagePath,
  maxWidth,
  maxHeight
) => {
  const image = doc.openImage(imagePath);

  const scale = Math.min(
    maxWidth / image.width,
    maxHeight / image.height,
    1
  );

  return {
    width: image.width * scale,
    height: image.height * scale,
  };
};

/* =========================================================
   HELPERS
========================================================= */

const safe = (value, fallback = '-') => {
  if (
    value === undefined ||
    value === null ||
    value === ''
  ) {
    return fallback;
  }

  return String(value);
};

const formatDate = (date) => {
  if (!date) return '-';

  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatConfidence = (value) => {
  const number = Number(value || 0);

  // Supports both 0.87 and 87
  const percentage =
    number <= 1 ? number * 100 : number;

  return `${percentage.toFixed(1)}%`;
};

const getConfidenceNumber = (value) => {
  const number = Number(value || 0);

  return number <= 1 ? number * 100 : number;
};

/* =========================================================
   ROUNDED BOX
========================================================= */

const drawBox = (
  doc,
  x,
  y,
  width,
  height,
  background = COLORS.white,
  border = COLORS.border,
  radius = 10
) => {
  doc
    .roundedRect(x, y, width, height, radius)
    .fillAndStroke(background, border);
};

/* =========================================================
   HEADER
========================================================= */

const drawHeader = (doc, diagnosis) => {
  const clinicName =
    diagnosis.dentist?.dentistProfile?.clinicName ||
    'DentAI Dental Clinic';

  const specialization =
    diagnosis.dentist?.dentistProfile?.specialization ||
    'General Dentistry';

  // Top branding area
  doc.rect(0, 0, 595, 115).fill(COLORS.navy);

  // Logo box
  doc
    .roundedRect(45, 28, 58, 58, 14)
    .fill(COLORS.primary);

  doc
    .font('Helvetica-Bold')
    .fontSize(22)
    .fillColor(COLORS.white)
    .text('D', 45, 45, {
      width: 58,
      align: 'center',
    });

  // DentAI
  doc
    .font('Helvetica-Bold')
    .fontSize(22)
    .fillColor(COLORS.white)
    .text('DentAI', 120, 30);

  doc
    .font('Helvetica')
    .fontSize(9)
    .fillColor('#CBD5E1')
    .text(
      'AI-Assisted Dental Diagnosis',
      120,
      57
    );

  // Clinic
  doc
    .font('Helvetica-Bold')
    .fontSize(12)
    .fillColor(COLORS.white)
    .text(clinicName, 350, 32, {
      width: 200,
      align: 'right',
    });

  doc
    .font('Helvetica')
    .fontSize(9)
    .fillColor('#CBD5E1')
    .text(specialization, 350, 52, {
      width: 200,
      align: 'right',
    });

  doc
    .fontSize(8)
    .fillColor('#94A3B8')
    .text(
      `Generated ${formatDate(new Date())}`,
      350,
      70,
      {
        width: 200,
        align: 'right',
      }
    );

  doc.y = 135;
};

/* =========================================================
   SECTION TITLE
========================================================= */

const sectionTitle = (
  doc,
  title,
  subtitle = null
) => {
  doc
    .font('Helvetica-Bold')
    .fontSize(15)
    .fillColor(COLORS.navy)
    .text(title);

  if (subtitle) {
    doc
      .moveDown(0.25)
      .font('Helvetica')
      .fontSize(8.5)
      .fillColor(COLORS.muted)
      .text(subtitle);
  }

  doc.moveDown(0.7);
};

/* =========================================================
   INFORMATION CARD
========================================================= */

const drawInfoCard = (
  doc,
  x,
  y,
  width,
  height,
  title,
  rows
) => {
  drawBox(
    doc,
    x,
    y,
    width,
    height,
    COLORS.white,
    COLORS.border,
    10
  );

  // title strip
  doc
    .roundedRect(x, y, width, 32, 10)
    .fill(COLORS.infoBg);

  doc
    .font('Helvetica-Bold')
    .fontSize(10)
    .fillColor(COLORS.primaryDark)
    .text(title, x + 14, y + 11);

  let currentY = y + 48;

  rows.forEach((row) => {
    doc
      .font('Helvetica-Bold')
      .fontSize(8)
      .fillColor(COLORS.muted)
      .text(row.label, x + 14, currentY);

    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor(COLORS.text)
      .text(
        safe(row.value),
        x + 14,
        currentY + 12,
        {
          width: width - 28,
        }
      );

    currentY += 38;
  });
};

/* =========================================================
   XRAY CARD
========================================================= */

const renderImageCard = (
  doc,
  imagePath,
  x,
  y,
  width,
  height,
  caption,
  badge
) => {
  drawBox(
    doc,
    x,
    y,
    width,
    height,
    COLORS.white,
    COLORS.border,
    12
  );

  // Caption
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .fillColor(COLORS.navy)
    .text(caption, x + 12, y + 12);

  // Badge
  if (badge) {
    const badgeWidth = 70;

    doc
      .roundedRect(
        x + width - badgeWidth - 12,
        y + 8,
        badgeWidth,
        18,
        8
      )
      .fill(COLORS.infoBg);

    doc
      .font('Helvetica-Bold')
      .fontSize(7)
      .fillColor(COLORS.primaryDark)
      .text(
        badge,
        x + width - badgeWidth - 12,
        y + 14,
        {
          width: badgeWidth,
          align: 'center',
        }
      );
  }

  const imageAreaX = x + 10;
  const imageAreaY = y + 38;
  const imageAreaWidth = width - 20;
  const imageAreaHeight = height - 50;

  try {
    const size = getContainedSize(
      doc,
      imagePath,
      imageAreaWidth,
      imageAreaHeight
    );

    const imageX =
      imageAreaX +
      (imageAreaWidth - size.width) / 2;

    const imageY =
      imageAreaY +
      (imageAreaHeight - size.height) / 2;

    doc.image(imagePath, imageX, imageY, {
      width: size.width,
      height: size.height,
    });
  } catch (error) {
    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor(COLORS.muted)
      .text(
        'Unable to display X-ray image',
        imageAreaX,
        imageAreaY + 40,
        {
          width: imageAreaWidth,
          align: 'center',
        }
      );
  }
};

/* =========================================================
   FINDINGS TABLE
========================================================= */

const drawFindingsTable = (
  doc,
  detections,
  urgentSet
) => {
  const pageWidth = 495;
  const startX = 50;

  const conditionWidth = 245;
  const confidenceWidth = 110;
  const urgencyWidth = 140;

  let y = doc.y;

  // Header
  doc
    .roundedRect(
      startX,
      y,
      pageWidth,
      32,
      8
    )
    .fill(COLORS.navy);

  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .fillColor(COLORS.white)
    .text(
      'DETECTED CONDITION',
      startX + 12,
      y + 11,
      { width: conditionWidth - 20 }
    );

  doc.text(
    'CONFIDENCE',
    startX + conditionWidth,
    y + 11,
    { width: confidenceWidth }
  );

  doc.text(
    'CLINICAL PRIORITY',
    startX + conditionWidth + confidenceWidth,
    y + 11,
    { width: urgencyWidth - 10 }
  );

  y += 32;

  detections.forEach((detection, index) => {
    if (y > 735) {
      doc.addPage();

      drawHeader(doc, {
        dentist: {
          dentistProfile: {
            clinicName: 'DentAI Dental Clinic',
            specialization: 'Dental Diagnosis Report',
          },
        },
      });

      y = doc.y;

      // Repeat table header
      doc
        .roundedRect(
          startX,
          y,
          pageWidth,
          32,
          8
        )
        .fill(COLORS.navy);

      doc
        .font('Helvetica-Bold')
        .fontSize(9)
        .fillColor(COLORS.white)
        .text(
          'DETECTED CONDITION',
          startX + 12,
          y + 11
        );

      doc.text(
        'CONFIDENCE',
        startX + conditionWidth,
        y + 11
      );

      doc.text(
        'CLINICAL PRIORITY',
        startX + conditionWidth + confidenceWidth,
        y + 11
      );

      y += 32;
    }

    const condition =
      detection.className ||
      detection.condition ||
      'Unknown';

    const isUrgent =
      urgentSet.has(condition);

    const rowHeight = 31;

    // alternating background
    const rowBackground =
      index % 2 === 0
        ? COLORS.white
        : '#F8FAFC';

    doc
      .rect(
        startX,
        y,
        pageWidth,
        rowHeight
      )
      .fill(rowBackground);

    // left condition indicator
    doc
      .roundedRect(
        startX + 10,
        y + 9,
        5,
        13,
        2
      )
      .fill(
        isUrgent
          ? COLORS.danger
          : COLORS.success
      );

    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .fillColor(COLORS.text)
      .text(
        condition,
        startX + 24,
        y + 10,
        {
          width: conditionWidth - 30,
        }
      );

    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor(COLORS.text)
      .text(
        formatConfidence(
          detection.confidence
        ),
        startX + conditionWidth,
        y + 10
      );

    // urgency badge
    const badgeText = isUrgent
      ? 'URGENT'
      : 'ROUTINE';

    const badgeColor = isUrgent
      ? COLORS.danger
      : COLORS.success;

    const badgeBg = isUrgent
      ? COLORS.dangerBg
      : COLORS.successBg;

    const badgeX =
      startX +
      conditionWidth +
      confidenceWidth;

    doc
      .roundedRect(
        badgeX,
        y + 7,
        72,
        17,
        8
      )
      .fill(badgeBg);

    doc
      .font('Helvetica-Bold')
      .fontSize(7)
      .fillColor(badgeColor)
      .text(
        badgeText,
        badgeX,
        y + 12,
        {
          width: 72,
          align: 'center',
        }
      );

    y += rowHeight;

    doc
      .strokeColor(COLORS.border)
      .lineWidth(0.5)
      .moveTo(startX, y)
      .lineTo(startX + pageWidth, y)
      .stroke();
  });

  doc.y = y + 12;
};

/* =========================================================
   SUMMARY CARDS
========================================================= */

const drawSummary = (
  doc,
  total,
  averageConfidence,
  urgentCount
) => {
  const y = doc.y;

  const gap = 10;
  const width = (495 - gap * 2) / 3;
  const height = 75;

  const cards = [
    {
      x: 50,
      title: 'TOTAL FINDINGS',
      value: String(total),
      color: COLORS.primary,
      background: COLORS.infoBg,
    },
    {
      x: 50 + width + gap,
      title: 'AVG. CONFIDENCE',
      value: formatConfidence(
        averageConfidence
      ),
      color: COLORS.success,
      background: COLORS.successBg,
    },
    {
      x: 50 + (width + gap) * 2,
      title: 'URGENT FINDINGS',
      value: String(urgentCount),
      color: COLORS.danger,
      background: COLORS.dangerBg,
    },
  ];

  cards.forEach((card) => {
    drawBox(
      doc,
      card.x,
      y,
      width,
      height,
      COLORS.white,
      COLORS.border,
      10
    );

    doc
      .roundedRect(
        card.x,
        y,
        width,
        5,
        5
      )
      .fill(card.color);

    doc
      .font('Helvetica-Bold')
      .fontSize(8)
      .fillColor(COLORS.muted)
      .text(
        card.title,
        card.x + 12,
        y + 17
      );

    doc
      .font('Helvetica-Bold')
      .fontSize(22)
      .fillColor(card.color)
      .text(
        card.value,
        card.x + 12,
        y + 34
      );
  });

  doc.y = y + height + 20;
};

/* =========================================================
   FOOTER
========================================================= */

const addFooter = (doc) => {
  const range = doc.bufferedPageRange();

  for (
    let i = range.start;
    i < range.start + range.count;
    i++
  ) {
    doc.switchToPage(i);

    doc
      .strokeColor(COLORS.border)
      .lineWidth(0.5)
      .moveTo(50, 780)
      .lineTo(545, 780)
      .stroke();

    doc
      .font('Helvetica')
      .fontSize(7)
      .fillColor(COLORS.lightText)
      .text(
        'DentAI • AI-Assisted Dental Diagnosis',
        50,
        788
      );

    doc.text(
      `Page ${i + 1} of ${range.count}`,
      450,
      788,
      {
        width: 95,
        align: 'right',
      }
    );
  }
};

/* =========================================================
   MAIN PDF GENERATOR
========================================================= */

const generateDiagnosisPDF = async (
  diagnosis
) => {
  const outputPath = path.join(
    TMP_DIR,
    `report-${diagnosis._id}.pdf`
  );

  const doc = new PDFDocument({
    size: 'A4',
    margins: {
      top: 50,
      bottom: 55,
      left: 50,
      right: 50,
    },
    bufferPages: true,
  });

  const stream =
    fs.createWriteStream(outputPath);

  doc.pipe(stream);

  /* =====================================================
     PAGE 1 — COVER / INFORMATION
  ===================================================== */

  drawHeader(doc, diagnosis);

  doc
    .font('Helvetica-Bold')
    .fontSize(24)
    .fillColor(COLORS.navy)
    .text('Dental Diagnosis Report');

  doc.moveDown(0.3);

  doc
    .font('Helvetica')
    .fontSize(10)
    .fillColor(COLORS.muted)
    .text(
      'AI-assisted panoramic X-ray analysis reviewed and confirmed by a licensed dentist.'
    );

  doc.moveDown(1.3);

  const patient =
    diagnosis.patient || {};

  const dentist =
    diagnosis.dentist || {};

  const dentistProfile =
    dentist.dentistProfile || {};

  // Patient + Dentist cards
  const cardTop = doc.y;

  drawInfoCard(
    doc,
    50,
    cardTop,
    238,
    190,
    'PATIENT INFORMATION',
    [
      {
        label: 'FULL NAME',
        value: patient.name,
      },
      {
        label: 'EMAIL',
        value: patient.email,
      },
      {
        label: 'PHONE',
        value: patient.phone,
      },
      {
        label: 'REPORT DATE',
        value: formatDate(
          diagnosis.createdAt || new Date()
        ),
      },
    ]
  );

  drawInfoCard(
    doc,
    307,
    cardTop,
    238,
    190,
    'DENTIST INFORMATION',
    [
      {
        label: 'DENTIST',
        value: `Dr. ${safe(dentist.name)}`,
      },
      {
        label: 'SPECIALIZATION',
        value:
          dentistProfile.specialization ||
          'General Dentistry',
      },
      {
        label: 'LICENSE NUMBER',
        value:
          dentistProfile.licenseNumber,
      },
      {
        label: 'EXPERIENCE',
        value:
          dentistProfile.experienceYears != null
            ? `${dentistProfile.experienceYears} years`
            : '-',
      },
    ]
  );

  doc.y = cardTop + 215;

  // Clinic information
  drawBox(
    doc,
    50,
    doc.y,
    495,
    78,
    '#F0F9FF',
    '#BAE6FD',
    10
  );

  doc
    .font('Helvetica-Bold')
    .fontSize(10)
    .fillColor(COLORS.primaryDark)
    .text(
      'CLINIC',
      65,
      doc.y + 15
    );

  doc
    .font('Helvetica-Bold')
    .fontSize(13)
    .fillColor(COLORS.navy)
    .text(
      safe(
        dentistProfile.clinicName,
        'DentAI Dental Clinic'
      ),
      65,
      doc.y + 32
    );

  doc
    .font('Helvetica')
    .fontSize(8.5)
    .fillColor(COLORS.muted)
    .text(
      safe(
        dentistProfile.clinicAddress,
        'Clinic address not provided'
      ),
      250,
      doc.y + 35,
      {
        width: 275,
      }
    );

  doc.y += 105;

  // Report status
  const status =
    diagnosis.status === 'confirmed'
      ? 'CONFIRMED BY DENTIST'
      : String(
          diagnosis.status || 'PENDING'
        ).toUpperCase();

  const statusColor =
    diagnosis.status === 'confirmed'
      ? COLORS.success
      : COLORS.warning;

  const statusBg =
    diagnosis.status === 'confirmed'
      ? COLORS.successBg
      : COLORS.warningBg;

  doc
    .roundedRect(
      50,
      doc.y,
      495,
      42,
      10
    )
    .fill(statusBg);

  doc
    .font('Helvetica-Bold')
    .fontSize(10)
    .fillColor(statusColor)
    .text(
      `●  ${status}`,
      65,
      doc.y + 14
    );

  doc.moveDown(3);

  /* =====================================================
     PAGE 2 — X-RAYS
  ===================================================== */

  doc.addPage();

  drawHeader(doc, diagnosis);

  sectionTitle(
    doc,
    'X-ray Analysis',
    'Original panoramic scan and AI-annotated result for clinical review.'
  );

  const xrayPath =
    diagnosis.xrayImage?.url;

  const annotatedPath =
    diagnosis.annotatedImage?.url;

  const visualTop = doc.y;

  const imageWidth =
    (495 - 14) / 2;

  const imageHeight = 315;

  let originalLocal;
  let annotatedLocal;

  try {
    if (xrayPath && annotatedPath) {
      originalLocal = path.join(
        TMP_DIR,
        `xray-original-${diagnosis._id}.jpg`
      );

      annotatedLocal = path.join(
        TMP_DIR,
        `xray-annotated-${diagnosis._id}.jpg`
      );

      await Promise.all([
        downloadImage(
          xrayPath,
          originalLocal
        ),
        downloadImage(
          annotatedPath,
          annotatedLocal
        ),
      ]);

      renderImageCard(
        doc,
        originalLocal,
        50,
        visualTop,
        imageWidth,
        imageHeight,
        'Original Panoramic X-ray',
        'ORIGINAL'
      );

      renderImageCard(
        doc,
        annotatedLocal,
        50 + imageWidth + 14,
        visualTop,
        imageWidth,
        imageHeight,
        'AI Annotated Result',
        'AI ANALYSIS'
      );
    } else {
      const sourceUrl =
        annotatedPath || xrayPath;

      if (sourceUrl) {
        const singleLocal = path.join(
          TMP_DIR,
          `xray-${diagnosis._id}.jpg`
        );

        await downloadImage(
          sourceUrl,
          singleLocal
        );

        renderImageCard(
          doc,
          singleLocal,
          50,
          visualTop,
          495,
          imageHeight,
          annotatedPath
            ? 'AI Annotated Result'
            : 'Original Panoramic X-ray',
          annotatedPath
            ? 'AI ANALYSIS'
            : 'ORIGINAL'
        );

        fs.unlink(
          singleLocal,
          () => {}
        );
      }
    }
  } catch (error) {
    drawBox(
      doc,
      50,
      visualTop,
      495,
      imageHeight,
      '#F8FAFC',
      COLORS.border,
      12
    );

    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor(COLORS.muted)
      .text(
        'X-ray visual could not be embedded in this report.',
        50,
        visualTop + 140,
        {
          width: 495,
          align: 'center',
        }
      );
  }

  if (originalLocal) {
    fs.unlink(
      originalLocal,
      () => {}
    );
  }

  if (annotatedLocal) {
    fs.unlink(
      annotatedLocal,
      () => {}
    );
  }

  doc.y =
    visualTop +
    imageHeight +
    30;

  // Explanation box
  drawBox(
    doc,
    50,
    doc.y,
    495,
    72,
    '#F8FAFC',
    COLORS.border,
    10
  );

  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .fillColor(COLORS.navy)
    .text(
      'About the AI analysis',
      65,
      doc.y + 14
    );

  doc
    .font('Helvetica')
    .fontSize(8.5)
    .fillColor(COLORS.muted)
    .text(
      'The annotated image highlights areas detected by the YOLOv8 dental AI model. These findings are intended to assist the dentist and do not replace professional clinical examination.',
      65,
      doc.y + 30,
      {
        width: 465,
        lineGap: 2,
      }
    );

  /* =====================================================
     PAGE 3 — FINDINGS
  ===================================================== */

  doc.addPage();

  drawHeader(doc, diagnosis);

  sectionTitle(
    doc,
    'AI-Detected Findings',
    'Detected dental conditions ranked by AI confidence and clinical priority.'
  );

  const detections =
    diagnosis.dentistReview?.modifiedDetections
      ?.length > 0
      ? diagnosis.dentistReview
          .modifiedDetections
      : diagnosis.aiDetections || [];

  const urgentSet = new Set(
    (
      diagnosis.aiSummary
        ?.urgentFindings || []
    ).map(
      (item) =>
        item.condition
    )
  );

  const urgentCount =
    detections.filter((item) =>
      urgentSet.has(
        item.className
      )
    ).length;

  if (detections.length > 0) {
    drawFindingsTable(
      doc,
      detections,
      urgentSet
    );
  } else {
    drawBox(
      doc,
      50,
      doc.y,
      495,
      70,
      COLORS.white,
      COLORS.border,
      10
    );

    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor(COLORS.muted)
      .text(
        'No AI findings were recorded for this diagnosis.',
        65,
        doc.y + 28
      );

    doc.y += 85;
  }

  /* =====================================================
     SUMMARY
  ===================================================== */

  sectionTitle(
    doc,
    'Diagnosis Summary'
  );

  const totalFindings =
    diagnosis.aiSummary
      ?.totalFindings ??
    detections.length;

  const averageConfidence =
    diagnosis.aiSummary
      ?.averageConfidence ??
    (
      detections.length
        ? detections.reduce(
            (sum, d) =>
              sum +
              getConfidenceNumber(
                d.confidence
              ),
            0
          ) /
          detections.length /
          100
        : 0
    );

  drawSummary(
    doc,
    totalFindings,
    averageConfidence,
    urgentCount
  );

  /* =====================================================
     DENTIST REVIEW
  ===================================================== */

  if (doc.y > 670) {
    doc.addPage();
    drawHeader(doc, diagnosis);
  }

  sectionTitle(
    doc,
    "Dentist's Clinical Review",
    'Final comments and confirmation from the reviewing dentist.'
  );

  drawBox(
    doc,
    50,
    doc.y,
    495,
    125,
    '#F8FAFC',
    COLORS.border,
    10
  );

  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .fillColor(COLORS.primaryDark)
    .text(
      `Dr. ${safe(dentist.name)}`,
      65,
      doc.y + 16
    );

  doc
    .font('Helvetica')
    .fontSize(8)
    .fillColor(COLORS.muted)
    .text(
      `${safe(
        dentistProfile.specialization,
        'General Dentistry'
      )} • License: ${safe(
        dentistProfile.licenseNumber
      )}`,
      65,
      doc.y + 31
    );

  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .fillColor(COLORS.navy)
    .text(
      'Review Notes',
      65,
      doc.y + 52
    );

  doc
    .font('Helvetica')
    .fontSize(9)
    .fillColor(COLORS.text)
    .text(
      safe(
        diagnosis.dentistReview?.notes,
        'No additional clinical notes were provided.'
      ),
      65,
      doc.y + 68,
      {
        width: 465,
        lineGap: 2,
      }
    );

  doc.y += 150;

  /* =====================================================
     DISCLAIMER
  ===================================================== */

  drawBox(
    doc,
    50,
    doc.y,
    495,
    100,
    '#FFF7ED',
    '#FED7AA',
    10
  );

  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .fillColor('#C2410C')
    .text(
      'IMPORTANT CLINICAL DISCLAIMER',
      65,
      doc.y + 16
    );

  doc
    .font('Helvetica')
    .fontSize(8)
    .fillColor('#7C2D12')
    .text(
      'This report was generated using AI-assisted YOLOv8 object detection and subsequently reviewed by a licensed dentist. AI-generated findings may contain errors or omissions. This document is intended to support clinical decision-making and is not a substitute for an in-person dental examination, professional diagnosis, or treatment plan.',
      65,
      doc.y + 34,
      {
        width: 465,
        lineGap: 2,
      }
    );

  doc.y += 125;

  doc
    .font('Helvetica')
    .fontSize(8)
    .fillColor(COLORS.lightText)
    .text(
      'Generated securely by DentAI',
      {
        align: 'center',
      }
    );

  /* =====================================================
     FOOTERS
  ===================================================== */

  addFooter(doc);

  doc.end();

  return new Promise(
    (resolve, reject) => {
      stream.on(
        'finish',
        () => resolve(outputPath)
      );

      stream.on(
        'error',
        reject
      );
    }
  );
};

module.exports = {
  generateDiagnosisPDF,
};