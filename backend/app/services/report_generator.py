"""
Inspection Report Generator
===========================
Generates audit-ready PDF reports via ReportLab and CSV exports via python's csv module.
Strictly incorporates preliminary assessment notices, demo mode watermarks,
and verification sign-off blocks.
"""

import io
import csv
from datetime import datetime
from pathlib import Path
from typing import Optional, List, Dict, Any

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas

from app.database import Inspection


class NumberedCanvas(canvas.Canvas):
    """Canvas that adds running footers, page counts, and optional demo watermarks."""
    def __init__(self, *args, is_demo: bool = False, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []
        self.is_demo = is_demo

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count: int):
        self.saveState()
        
        # DEMO MODE Watermark diagonally across page if applicable
        if self.is_demo:
            self.setFont("Helvetica-Bold", 42)
            self.setFillColor(colors.Color(0.9, 0.2, 0.2, alpha=0.12))
            self.translate(300, 420)
            self.rotate(35)
            self.drawCentredString(0, 0, "DEMO MODE — PRELIMINARY ONLY")
            self.restoreState()
            self.saveState()

        # Footer
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        self.drawString(40, 30, "Nova Grid | Transmission Tower Inspection Intelligence — Human Verification Required")
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(572, 30, page_text)
        
        # Footer dividing line
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.5)
        self.line(40, 42, 572, 42)
        
        self.restoreState()


def generate_pdf_report(inspection: Inspection) -> bytes:
    """
    Constructs a formal PDF inspection assessment report using ReportLab.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=55
    )

    styles = getSampleStyleSheet()
    
    # Custom Brand Typography Styles
    title_style = ParagraphStyle(
        "BrandTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#0A1128")
    )
    subtitle_style = ParagraphStyle(
        "BrandSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#0891B2")
    )
    section_h2 = ParagraphStyle(
        "SectionH2",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#0A1128"),
        spaceBefore=10,
        spaceAfter=4
    )
    meta_label = ParagraphStyle(
        "MetaLabel",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#475569")
    )
    meta_val = ParagraphStyle(
        "MetaVal",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#0F172A")
    )
    table_cell = ParagraphStyle(
        "TableCell",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8,
        leading=10,
        textColor=colors.HexColor("#1E293B")
    )
    table_header = ParagraphStyle(
        "TableHeader",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8,
        leading=10,
        textColor=colors.HexColor("#FFFFFF")
    )
    disclaimer_style = ParagraphStyle(
        "Disclaimer",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=7.5,
        leading=10.5,
        textColor=colors.HexColor("#7F1D1D")
    )

    story = []

    # 1. Header Banner
    header_table_data = [
        [
            Paragraph("<b>NOVA GRID</b>", title_style),
            Paragraph(
                "<b>AI-Generated Preliminary Assessment</b><br/>"
                f"<font color='#64748B'>Report ID: {inspection.id[:8].upper()}</font>",
                ParagraphStyle("HeaderRight", parent=styles["Normal"], alignment=2, fontName="Helvetica", fontSize=9, leading=13)
            )
        ],
        [
            Paragraph("Smarter Grids. Safer Power. | Visual Infrastructure Inspection", subtitle_style),
            Paragraph(f"Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}", ParagraphStyle("GenDate", parent=styles["Normal"], alignment=2, fontSize=8, textColor=colors.HexColor("#64748B")))
        ]
    ]
    header_table = Table(header_table_data, colWidths=[3.5 * inch, 3.8 * inch])
    header_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 10))

    # Demo Mode Warning Banner
    if inspection.is_demo:
        demo_banner = Table(
            [[
                Paragraph(
                    "<b>DEMO MODE ADVISORY:</b> This inspection was processed in demo mode using a base evaluation model. "
                    "Detected objects illustrate system pipeline flow and <b>ARE NOT</b> verified transmission tower defects.",
                    ParagraphStyle("DemoAlert", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=8.5, leading=12, textColor=colors.HexColor("#991B1B"))
                )
            ]],
            colWidths=[7.3 * inch]
        )
        demo_banner.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#FEF2F2")),
            ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#F87171")),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("LEFTPADDING", (0, 0), (-1, -1), 10),
            ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ]))
        story.append(demo_banner)
        story.append(Spacer(1, 10))

    # 2. Inspection Metadata Table
    meta_data = [
        [
            Paragraph("Tower / Image Reference:", meta_label),
            Paragraph(f"<b>{inspection.tower_id}</b>", meta_val),
            Paragraph("Inspection Date:", meta_label),
            Paragraph(inspection.created_at.strftime("%Y-%m-%d %H:%M:%S UTC"), meta_val),
        ],
        [
            Paragraph("Inspection Location:", meta_label),
            Paragraph(inspection.location or "Not specified", meta_val),
            Paragraph("Confidence Threshold:", meta_label),
            Paragraph(f"{inspection.confidence_threshold:.2f} ({int(inspection.confidence_threshold * 100)}%)", meta_val),
        ],
        [
            Paragraph("Analysis Mode:", meta_label),
            Paragraph(f"<b>{inspection.mode.upper()}</b> {'(Demo)' if inspection.is_demo else '(Trained Weights)'}", meta_val),
            Paragraph("Model Identifier:", meta_label),
            Paragraph(inspection.model_name, meta_val),
        ],
        [
            Paragraph("Suspected Fault Count:", meta_label),
            Paragraph(f"<b>{inspection.fault_count}</b> detected", meta_val),
            Paragraph("High Priority Alerts:", meta_label),
            Paragraph(f"<b>{inspection.high_priority_count}</b> requiring expedited check", meta_val),
        ],
    ]
    meta_table = Table(meta_data, colWidths=[1.7 * inch, 2.0 * inch, 1.6 * inch, 2.0 * inch])
    meta_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
        ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 12))

    # 3. Visual Evidence Section (Side-by-Side Images)
    story.append(Paragraph("Visual Evidence (Original vs. AI-Annotated)", section_h2))
    
    img_cells = []
    orig_path = Path(inspection.original_path)
    annot_path = Path(inspection.annotated_path)

    # Helper to load scaled ReportLab Image
    def get_rl_image(p: Path, target_w=3.45 * inch, target_h=2.25 * inch):
        if p.exists() and p.is_file():
            try:
                img = RLImage(str(p))
                img.drawWidth = target_w
                img.drawHeight = target_h
                return img
            except Exception:
                return Paragraph("<i>Image preview unavailable</i>", meta_val)
        return Paragraph("<i>Image file not found on disk</i>", meta_val)

    img_table_data = [
        [Paragraph("<b>Original Drone Capture</b>", meta_label), Paragraph("<b>Annotated Fault Detections</b>", meta_label)],
        [get_rl_image(orig_path), get_rl_image(annot_path)]
    ]
    img_table = Table(img_table_data, colWidths=[3.6 * inch, 3.6 * inch])
    img_table.setStyle(TableStyle([
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, 0), 2),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 4),
        ("TOPPADDING", (0, 1), (-1, 1), 2),
        ("BOTTOMPADDING", (0, 1), (-1, 1), 6),
    ]))
    story.append(img_table)
    story.append(Spacer(1, 10))

    # 4. Findings & Detections Table
    story.append(Paragraph(f"Preliminary AI Findings ({inspection.fault_count} items)", section_h2))
    
    if inspection.fault_count == 0 or not inspection.detections:
        no_fault_data = [[
            Paragraph("<b>No supported faults detected at current confidence threshold.</b><br/>"
                      "<i>Note: This assessment indicates no supported defects were identified above the threshold. "
                      "It does NOT certify or imply that the transmission tower is safe or free of undetected issues.</i>", table_cell)
        ]]
        no_fault_table = Table(no_fault_data, colWidths=[7.3 * inch])
        no_fault_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F1F5F9")),
            ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
            ("TOPPADDING", (0, 0), (-1, -1), 10),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
            ("LEFTPADDING", (0, 0), (-1, -1), 12),
        ]))
        story.append(no_fault_table)
    else:
        findings_data = [
            [
                Paragraph("<b>#</b>", table_header),
                Paragraph("<b>Fault Category</b>", table_header),
                Paragraph("<b>Confidence</b>", table_header),
                Paragraph("<b>Bounding Box (x1, y1, x2, y2)</b>", table_header),
                Paragraph("<b>Suggested Priority</b>", table_header)
            ]
        ]
        
        for idx, det in enumerate(inspection.detections, start=1):
            bbox_str = f"[{int(det.x1)}, {int(det.y1)}, {int(det.x2)}, {int(det.y2)}]"
            prio_color = "#DC2626" if det.priority == "High" else ("#D97706" if det.priority == "Medium" else "#2563EB")
            prio_markup = f"<font color='{prio_color}'><b>{det.priority}</b></font>"

            findings_data.append([
                Paragraph(str(idx), table_cell),
                Paragraph(f"<b>{det.class_name}</b>", table_cell),
                Paragraph(f"{det.confidence * 100:.1f}%", table_cell),
                Paragraph(bbox_str, table_cell),
                Paragraph(prio_markup, table_cell)
            ])

        findings_table = Table(findings_data, colWidths=[0.4 * inch, 2.3 * inch, 1.1 * inch, 2.1 * inch, 1.4 * inch])
        findings_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0A1128")),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F8FAFC")]),
        ]))
        story.append(findings_table)

    story.append(Spacer(1, 12))

    # 5. Recommendation & Verification Block
    rec_text = "Schedule review by a qualified electrical transmission line inspector to physically verify findings."
    if inspection.high_priority_count > 0:
        rec_text = "High-priority items identified. Prioritize physical or high-resolution telephoto review by qualified engineers."

    rec_box = Table(
        [[
            Paragraph(f"<b>Recommended Action:</b> {rec_text}", meta_val)
        ]],
        colWidths=[7.3 * inch]
    )
    rec_box.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#EFF6FF")),
        ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#93C5FD")),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
    ]))
    story.append(rec_box)
    story.append(Spacer(1, 10))

    # Sign-off & Human Verification
    sign_off_data = [
        [
            Paragraph("<b>Human Verification Sign-Off:</b>", meta_label),
            Paragraph(f"Status: <b>{inspection.review_status}</b>", meta_val),
            Paragraph("Inspector Decision:", meta_label),
            Paragraph("[ ] Verified  [ ] Rejected  [ ] Escalated", meta_val),
        ],
        [
            Paragraph("Inspector Name:", meta_label),
            Paragraph("____________________________", meta_val),
            Paragraph("Signature / Date:", meta_label),
            Paragraph("____________________________", meta_val),
        ]
    ]
    sign_table = Table(sign_off_data, colWidths=[1.7 * inch, 2.0 * inch, 1.6 * inch, 2.0 * inch])
    sign_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
        ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
    ]))
    story.append(sign_table)
    story.append(Spacer(1, 10))

    # Legal / Responsible AI Disclaimer Box
    disclaimer_box = Table(
        [[
            Paragraph(
                "<b>RESPONSIBLE AI DISCLAIMER & MANDATORY HUMAN VERIFICATION:</b><br/>"
                "This assessment document is generated by computer vision algorithms to assist maintenance triage. "
                "AI detections are subject to false positives, false negatives, visual occlusions, and lighting artifacts. "
                "<b>This report DOES NOT state or certify that any tower is safe or unsafe.</b> "
                "All observations must be verified by certified personnel before undertaking operational interventions.",
                disclaimer_style
            )
        ]],
        colWidths=[7.3 * inch]
    )
    disclaimer_box.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#FEF2F2")),
        ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#FCA5A5")),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(disclaimer_box)

    # Build PDF with custom NumberedCanvas
    doc.build(
        story,
        canvasmaker=lambda *args, **kwargs: NumberedCanvas(*args, is_demo=inspection.is_demo, **kwargs)
    )

    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes


def generate_csv_report(inspection: Inspection) -> str:
    """
    Generates a structured CSV export with assessment metadata and detailed detection rows.
    """
    output = io.StringIO()
    writer = csv.writer(output)

    # Metadata Header
    writer.writerow(["# Nova Grid - Transmission Tower AI Preliminary Assessment"])
    writer.writerow(["# Notice: Preliminary AI assessment requiring human verification. Does not certify tower safety."])
    writer.writerow([])
    writer.writerow(["Report ID", inspection.id])
    writer.writerow(["Tower ID", inspection.tower_id])
    writer.writerow(["Location", inspection.location or "Not specified"])
    writer.writerow(["Inspection Date (UTC)", inspection.created_at.strftime("%Y-%m-%d %H:%M:%S")])
    writer.writerow(["Mode", f"{inspection.mode} ({'Demo Mode' if inspection.is_demo else 'Trained Model'})"])
    writer.writerow(["Model Identifier", inspection.model_name])
    writer.writerow(["Confidence Threshold", f"{inspection.confidence_threshold:.2f}"])
    writer.writerow(["Review Status", inspection.review_status])
    writer.writerow(["Total Suspected Faults", inspection.fault_count])
    writer.writerow(["High Priority Count", inspection.high_priority_count])
    writer.writerow([])

    # Table of Detections
    writer.writerow([
        "Index",
        "Class ID",
        "Fault Category",
        "Confidence",
        "Confidence (%)",
        "Bounding Box X1",
        "Bounding Box Y1",
        "Bounding Box X2",
        "Bounding Box Y2",
        "Suggested Priority",
        "Human Review Status"
    ])

    if not inspection.detections:
        writer.writerow([
            1,
            "-",
            "No supported faults detected",
            0.0,
            "0.0%",
            "-",
            "-",
            "-",
            "-",
            "N/A",
            inspection.review_status
        ])
    else:
        for idx, det in enumerate(inspection.detections, start=1):
            writer.writerow([
                idx,
                det.class_id,
                det.class_name,
                det.confidence,
                f"{det.confidence * 100:.1f}%",
                det.x1,
                det.y1,
                det.x2,
                det.y2,
                det.priority,
                inspection.review_status
            ])

    writer.writerow([])
    writer.writerow(["# End of Report - Certified Human Verification Required"])
    return output.getvalue()
