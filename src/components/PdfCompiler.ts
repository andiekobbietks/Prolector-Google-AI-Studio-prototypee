/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from 'jspdf';
import { GLOSSARY_CHEAT_SHEET_P1, GLOSSARY_CHEAT_SHEET_P2 } from '../data/ebooks';

export function compileCheatSheetToPdf() {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageW = doc.internal.pageSize.getWidth(); // 210
  const pageH = doc.internal.pageSize.getHeight(); // 297
  const margin = 20;
  const contentW = pageW - (margin * 2);

  // Helper - Apply full-page dark navy background
  const drawPageBackground = (d: jsPDF) => {
    // #050e1a (Deep dark navy)
    d.setFillColor(5, 14, 26);
    d.rect(0, 0, pageW, pageH, 'F');

    // Accent line at the top (#f97316 orange)
    d.setFillColor(249, 115, 22);
    d.rect(0, 0, pageW, 2, 'F');
  };

  // Helper - Draw standard page headers and footers
  const drawPageHeaderAndFooter = (d: jsPDF, pageNum: number) => {
    // Top Right Header Tracker
    d.setFont('helvetica', 'normal');
    d.setFontSize(8);
    d.setTextColor(249, 115, 22); // Orange
    d.text('PROLECTOR TECHNICAL BLUEPRINT', pageW - margin, 12, { align: 'right' });

    // Top Left Header Standard
    d.setTextColor(150, 160, 180);
    d.text('AFJ Cardiff Series · Edition 2026', margin, 12);

    // Fine dividers
    d.setDrawColor(30, 41, 59);
    d.line(margin, 15, pageW - margin, 15);
    d.line(margin, pageH - 15, pageW - margin, pageH - 15);

    // Footer
    d.setTextColor(100, 110, 130);
    d.text(`Page 0${pageNum} / 05`, margin, pageH - 10);
    d.text('CONFIDENTIAL · LOCAL-FIRST WORKSPACE', pageW - margin, pageH - 10, { align: 'right' });
  };

  // ============================================
  // PAGE 1: COVER PAGE
  // ============================================
  drawPageBackground(doc);

  // Header Brand Detail
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(249, 115, 22); // Orange tag
  doc.text('VIDEO ENGINEERING SPECIFICATION [V2.0]', margin, 45);

  // Title
  doc.setFontSize(28);
  doc.setTextColor(250, 250, 250);
  doc.text('Broadcast Color Space', margin, 60);
  doc.text('& HDR Cheat Sheet', margin, 72);

  doc.setLineWidth(1);
  doc.setDrawColor(249, 115, 22);
  doc.line(margin, 82, margin + 40, 82);

  // Tagline
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(12);
  doc.setTextColor(180, 190, 210);
  doc.text('The Mathematics and Pipelines of Local-First HDR-to-SDR Reconstruction', margin, 94);

  // Summary Description
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(140, 150, 170);
  const descParagraph = [
    'A professional-grade system blueprint documenting the transfer characteristics, sub-pixel algorithms,',
    'colorimeter matrix transforms, and compilable WebGPU compute shaders. This manual enables engineers',
    'and developers to perform non-destructive Rec. 2100 HDR-to-SDR local tone-mapping directly in browser-based',
    'decoding layers without recurring encoding server runtime costs.'
  ];
  let currentY = 110;
  descParagraph.forEach((line) => {
    doc.text(line, margin, currentY);
    currentY += 6;
  });

  // Vector wave representation (Aesthetic Wave Lines in Orange/Blue)
  const centerY = 190;
  doc.setLineWidth(0.3);
  for (let i = 0; i < 24; i++) {
    const x1 = margin + (i * 7);
    const waveH = Math.sin(i * 0.5) * 15;
    doc.setDrawColor(249 - i * 3, 115 + i * 4, 22 + i * 8);
    doc.line(x1, centerY - waveH, x1, centerY + waveH);

    // Connector loops
    if (i < 23) {
      const x2 = margin + ((i + 1) * 7);
      const waveH2 = Math.sin((i + 1) * 0.5) * 15;
      doc.line(x1, centerY - waveH, x2, centerY - waveH2);
    }
  }

  // Footer Brand info on Cover
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(250, 250, 250);
  doc.text('PROLECTOR', margin, 250);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(120, 130, 150);
  doc.text('A product of AFJ Cardiff Studio', margin, 255);
  doc.text('Build: 2026.06-03.A1', margin, 260);

  // Cover Page Footnotes
  doc.text('Local-First OPFS Caching enabled', pageW - margin, 260, { align: 'right' });

  // ============================================
  // PAGE 2: STANDARDS COMPASS & EOTF
  // ============================================
  doc.addPage();
  drawPageBackground(doc);
  drawPageHeaderAndFooter(doc, 2);

  // Content Heading
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(240, 240, 245);
  doc.text('1. Color Gamut Standards Comparison', margin, 28);

  // Divider
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.2);
  doc.line(margin, 31, pageW - margin, 31);

  // Grid Table Header
  const tableY = 38;
  doc.setFillColor(15, 23, 42); // #0f172a
  doc.rect(margin, tableY, contentW, 10, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(249, 115, 22);
  doc.text('PARAMETER', margin + 4, tableY + 6.5);
  doc.setTextColor(250, 250, 250);
  doc.text('REC. 709 (SDR STANDARD)', margin + 50, tableY + 6.5);
  doc.text('REC. 2020 / 2100 (HDR WIDE)', margin + 115, tableY + 6.5);

  // Table Rows
  const rows = [
    { param: 'Color Gamut Coverage', ref709: '35.9% of CIE 1931 space', ref2020: '75.8% of CIE 1931 space (Deep Primaries)' },
    { param: 'Standard Bit Depth', ref709: '8-Bit integer (256 luminance steps)', ref2020: '10-Bit or 12-Bit (1024 or 4096 steps)' },
    { param: 'Reference Target White', ref709: '100 nits (cd/m²)', ref2020: '1,000 to 10,000 nits Peak brightness capability' },
    { param: 'Primary Transfer Curves', ref709: 'Gamma 2.4 (OETF & EOTF)', ref2020: 'PQ (SMPTE ST 2084) & Hybrid Log-Gamma (HLG)' },
    { param: 'Common Native Codecs', ref709: 'H.264 / AVC web stream profiles', ref2020: 'H.265 / HEVC Main 10 profile, AV1 Profiles' }
  ];

  let currentYRow = tableY + 10;
  rows.forEach((r, idx) => {
    // Alt backgrounds
    if (idx % 2 === 1) {
      doc.setFillColor(10, 18, 36);
    } else {
      doc.setFillColor(18, 30, 56);
    }
    doc.rect(margin, currentYRow, contentW, 10, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(180, 190, 210);
    doc.text(r.param, margin + 4, currentYRow + 6);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(220, 225, 240);
    doc.text(r.ref709, margin + 50, currentYRow + 6);
    doc.text(r.ref2020, margin + 115, currentYRow + 6);

    currentYRow += 10;
  });

  // Second Section of Page 2: EOTF Breakdown
  const section2Y = currentYRow + 15;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(240, 240, 245);
  doc.text('2. Electro-Optical Transfer Functions (EOTF)', margin, section2Y);
  doc.line(margin, section2Y + 3, pageW - margin, section2Y + 3);

  // Twin Column Cards: PQ vs HLG
  const cardW = (contentW - 6) / 2;
  const cardY = section2Y + 8;
  const cardH = 65;

  // Card Left: PQ
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, cardY, cardW, cardH, 'F');
  doc.setDrawColor(249, 115, 22); // Orange borders
  doc.rect(margin, cardY, cardW, cardH, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(250, 250, 250);
  doc.text('Perceptual Quantizer (PQ / ST 2084)', margin + 5, cardY + 7);
  doc.setLineWidth(0.2);
  doc.line(margin + 5, cardY + 10, margin + cardW - 5, cardY + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(140, 150, 170);
  const pqText = [
    '• Targets absolute luminance: 0 - 10,000 nits scale.',
    '• Modeled precisely on the human visual system CSS',
    '  Schreiber-Barten contrast sensitivity threshold curve.',
    '• Non-backwards-compatible; requires metadata',
    '  handshakes (static HDR10/SMPTE ST 2086 or dynamic',
    '  Dolby Vision Metadata blocks).'
  ];
  pqText.forEach((line, i) => {
    doc.text(line, margin + 5, cardY + 16 + (i * 5.5));
  });

  // Card Right: HLG
  doc.setFillColor(15, 23, 42);
  doc.rect(margin + cardW + 6, cardY, cardW, cardH, 'F');
  doc.setDrawColor(100, 115, 140);
  doc.rect(margin + cardW + 6, cardY, cardW, cardH, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(250, 250, 250);
  doc.text('Hybrid Log-Gamma (HLG Curve)', margin + cardW + 11, cardY + 7);
  doc.line(margin + cardW + 11, cardY + 10, margin + contentW - 5, cardY + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(140, 150, 170);
  const hlgText = [
    '• Targets relative luminance: scales automatically',
    '  according to the maximum brightness of the display.',
    '• Employs classical gamma curve in the dark region,',
    '  seamlessly transitioning into log formula for highlights.',
    '• Backwards-compatible; displays on absolute SDR',
    '  monitors with negligible visual distortion.'
  ];
  hlgText.forEach((line, i) => {
    doc.text(line, margin + cardW + 11, cardY + 16 + (i * 5.5));
  });

  // ============================================
  // PAGE 3: CST MATH & WEBGPU SHADER (WGSL)
  // ============================================
  doc.addPage();
  drawPageBackground(doc);
  drawPageHeaderAndFooter(doc, 3);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(240, 240, 245);
  doc.text('3. Color Space Transform & WebGPU compute', margin, 28);
  doc.line(margin, 31, pageW - margin, 31);

  // CST Formula Text
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(150, 160, 180);
  const cstDesc = [
    'To translate Rec. 2020 Wide Gamut linear RGB components into standard definition Rec. 709 screens,',
    'the coordinates must undergo a strict 3x3 matrix multiplication. The standard primary transformation is:',
    '  [ R_709 ]   [  1.6605  -0.5876  -0.0729 ]   [ R_2020 ]',
    '  [ G_709 ] = [ -0.1246   1.2524  -0.1278 ] * [ G_2020 ]',
    '  [ B_709 ]   [ -0.0182  -0.1006   1.1189 ]   [ B_2020 ]',
    'Followed by Reinhard-based tone-mapping to clip highlights non-destructively in local browser memory.'
  ];
  let cstY = 37;
  cstDesc.forEach((line) => {
    if (line.includes('=[')) doc.setFont('courier', 'bold');
    else doc.setFont('helvetica', 'normal');

    doc.text(line, margin, cstY);
    cstY += 5.5;
  });

  // WGSL Shader Header Box
  const shaderY = cstY + 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(249, 115, 22);
  doc.text('Real-Time WebGPU Tone-Mapping Shader (WGSL Spec)', margin, shaderY);

  // CODE CONTAINER BOX
  doc.setFillColor(8, 14, 25);
  doc.rect(margin, shaderY + 3, contentW, 140, 'F');
  doc.setDrawColor(20, 30, 50);
  doc.rect(margin, shaderY + 3, contentW, 140, 'S');

  // Code
  doc.setFont('courier', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(120, 180, 240); // Soft Blue-grey (code aesthetic)

  const wgslLines = [
    '// WebGPU shader to non-destructively tone-map Rec. 2100 HLG to SDR Rec. 709',
    '@group(0) @binding(0) var<storage, read> inputPixels: array<vec4<f32>>;',
    '@group(0) @binding(1) var<storage, read_write> outputPixels: array<vec4<f32>>;',
    '',
    '@compute @workgroup_size(64)',
    'fn main(@builtin(global_invocation_id) id: vec3<u32>) {',
    '    let idx = id.x;',
    '    var color = inputPixels[idx].rgb;',
    '',
    '    // Apply Rec.2020 RGB -> Rec.709 3x3 Coordinate Matrix multiplication',
    '    let r709 = color.r * 1.6605 - color.g * 0.5876 - color.b * 0.0729;',
    '    let g709 = -color.r * 0.1246 + color.g * 1.2524 - color.b * 0.1278;',
    '    let b709 = -color.r * 0.0182 - color.g * 0.1006 + color.b * 1.1189;',
    '    var sdrLinear = vec3<f32>(r709, g709, b709);',
    '',
    '    // Reinhard Tone-Mapping Operator: scale = color / (1.0 + color)',
    '    let maxLuma = 1.2; // Custom threshold clamp',
    '    let toneMapped = sdrLinear / (vec3<f32>(1.0) + sdrLinear);',
    '',
    '    // Standard SDR Gamma 2.2 curve encoding',
    '    let sdrGetted = pow(clamp(toneMapped, vec3<f32>(0.0), vec3<f32>(1.0)), vec3<f32>(1.0 / 2.2));',
    '    ',
    '    outputPixels[idx] = vec4<f32>(sdrGetted, 1.0); // Keep Alpha intact',
    '}'
  ];

  let codeY = shaderY + 10;
  wgslLines.forEach((line) => {
    // Basic syntax coloration highlights
    if (line.trim().startsWith('//')) {
      doc.setTextColor(100, 130, 100); // Green comments
    } else if (line.includes('fn ') || line.includes('let ') || line.includes('var')) {
      doc.setTextColor(249, 115, 22); // Orange keywords
    } else if (line.includes('vec3') || line.includes('vec4') || line.includes('f32')) {
      doc.setTextColor(100, 200, 150); // Teal types
    } else {
      doc.setTextColor(180, 195, 220); // Normal code text
    }
    doc.text(line, margin + 5, codeY);
    codeY += 4.8;
  });

  // ============================================
  // PAGE 4: BROADCAST COMPLIANCE & GLOSSARY (A-H)
  // ============================================
  doc.addPage();
  drawPageBackground(doc);
  drawPageHeaderAndFooter(doc, 4);

  // Compliance Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(240, 240, 245);
  doc.text('4. Broadcast Compliance & Glossary (A - H)', margin, 28);
  doc.line(margin, 31, pageW - margin, 31);

  // Compliance Cards
  doc.setFontSize(10.5);
  doc.setTextColor(250, 250, 250);
  doc.text('Waveform Monitoring Thresholds (Standard IRE Scales)', margin, 37);

  // Draw 2 mini boxes for ranges
  const rangeCardW = (contentW - 6) / 2;
  const rangeCardY = 41;

  // Legal Range card
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, rangeCardY, rangeCardW, 25, 'F');
  doc.setDrawColor(249, 115, 22);
  doc.rect(margin, rangeCardY, rangeCardW, 25, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(249, 115, 22);
  doc.text('LEGAL VIDEO RANGE (RGB Clamped)', margin + 4, rangeCardY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(150, 160, 180);
  doc.text('• Shadows: Fixed at 0% IRE (8-bit value: 16)', margin + 4, rangeCardY + 12);
  doc.text('• Highlights: Fixed at 100% IRE (8-bit value: 235)', margin + 4, rangeCardY + 18);

  // Full Range Card
  doc.rect(margin + rangeCardW + 6, rangeCardY, rangeCardW, 25, 'F');
  doc.setDrawColor(100, 115, 140);
  doc.rect(margin + rangeCardW + 6, rangeCardY, rangeCardW, 25, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(250, 250, 250);
  doc.text('FULL GRAPHICS RANGE (RGB Unclamped)', margin + rangeCardW + 10, rangeCardY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(150, 160, 180);
  doc.text('• Shadows: Full absolute 0 black pedestal (Value: 0)', margin + rangeCardW + 10, rangeCardY + 12);
  doc.text('• Highlights: Full absolute 255 pure white peak', margin + rangeCardW + 10, rangeCardY + 18);

  // Glossary subtitle
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(250, 250, 250);
  doc.text('Interactive Glossary (A - H Index Cards)', margin, 74);

  // Grid cards for Glossary (A-H)
  let glossY = 79;
  const gridW = (contentW - 6) / 2;
  const gridH = 40;

  GLOSSARY_CHEAT_SHEET_P1.forEach((card, i) => {
    const isLeft = i % 2 === 0;
    const itemX = isLeft ? margin : margin + gridW + 6;
    const itemY = glossY + Math.floor(i / 2) * (gridH + 4);

    doc.setFillColor(15, 23, 42);
    doc.rect(itemX, itemY, gridW, gridH, 'F');
    doc.setDrawColor(30, 41, 59);
    doc.rect(itemX, itemY, gridW, gridH, 'S');

    // Title left border
    doc.setFillColor(249, 115, 22);
    doc.rect(itemX, itemY, 2, gridH, 'F');

    // Text details
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(250, 250, 250);
    doc.text(card.term, itemX + 5, itemY + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(140, 150, 170);
    
    // Auto wrap definitions
    const splitLines = doc.splitTextToSize(card.definition, gridW - 10);
    doc.text(splitLines, itemX + 5, itemY + 14);
  });

  // ============================================
  // PAGE 5: DEEP GLOSSARY & INTEGRATION (I - Z)
  // ============================================
  doc.addPage();
  drawPageBackground(doc);
  drawPageHeaderAndFooter(doc, 5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(240, 240, 245);
  doc.text('5. Deep Glossary & Local Integration', margin, 28);
  doc.line(margin, 31, pageW - margin, 31);

  // Subheading
  doc.setFontSize(11);
  doc.setTextColor(250, 250, 250);
  doc.text('Continuation (I - Z Glossary Index Cards)', margin, 37);

  // Grid cards for Glossary (I-Z)
  let glossY2 = 41;
  const gridW2 = (contentW - 6) / 2;
  const gridH2 = 40;

  GLOSSARY_CHEAT_SHEET_P2.forEach((card, i) => {
    const isLeft = i % 2 === 0;
    const itemX = isLeft ? margin : margin + gridW2 + 6;
    const itemY = glossY2 + Math.floor(i / 2) * (gridH2 + 4);

    doc.setFillColor(15, 23, 42);
    doc.rect(itemX, itemY, gridW2, gridH2, 'F');
    doc.setDrawColor(30, 41, 59);
    doc.rect(itemX, itemY, gridW2, gridH2, 'S');

    // Left border indicator (orange if tone mapped or edge deploy)
    doc.setFillColor(100, 120, 150);
    if (card.term === 'Color Space Transform (CST)' || card.term === 'WGSL') {
      doc.setFillColor(249, 115, 22);
    }
    doc.rect(itemX, itemY, 2, gridH2, 'F');

    // Texts
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(250, 250, 250);
    doc.text(card.term, itemX + 5, itemY + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(140, 150, 170);

    const splitLines = doc.splitTextToSize(card.definition, gridW2 - 10);
    doc.text(splitLines, itemX + 5, itemY + 14);
  });

  // Edge deployment footer section
  const buildGuideY = glossY2 + 4 * (gridH2 + 4) + 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(249, 115, 22);
  doc.text('Local Edge Deployment Pipeline Integration Strategy', margin, buildGuideY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(150, 160, 180);
  const endSteps = [
    '1. Store raw H265/Dolby Vision master files directly in client local OPFS directories.',
    '2. Execute background WebCodec Demux loops to output raw coordinates.',
    '3. Supply the WGSL compute shader through WebGPU interfaces to write tone-mapped output buffers.',
    '4. Serve lightweight JSON EDL manifests on edge-powered networks like Cloudflare Workers to render on demand.'
  ];
  let stepY = buildGuideY + 6;
  endSteps.forEach((step) => {
    doc.text(step, margin, stepY);
    stepY += 5;
  });

  // Save the generated document
  doc.save('Prolector_HDR_Color_Space_Cheat_Sheet.pdf');
}
