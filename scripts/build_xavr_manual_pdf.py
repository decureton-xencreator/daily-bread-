from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output" / "pdf" / "XAVR-1.0-OPERATING-MANUAL.pdf"
OUT.parent.mkdir(parents=True, exist_ok=True)

navy = colors.HexColor("#08111F")
cyan = colors.HexColor("#62D9FF")
ink = colors.HexColor("#172033")
muted = colors.HexColor("#5D6A7D")
paper = colors.HexColor("#F6F8FB")

pdfmetrics.registerFont(TTFont("XenSans", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"))
pdfmetrics.registerFont(TTFont("XenSans-Bold", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"))

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="CoverTitle", parent=styles["Title"], fontName="XenSans-Bold",
                          fontSize=27, leading=32, textColor=colors.white, alignment=TA_CENTER,
                          spaceAfter=18))
styles.add(ParagraphStyle(name="CoverSub", parent=styles["BodyText"], fontName="XenSans",
                          fontSize=11, leading=16,
                          textColor=colors.HexColor("#D9E7F5"), alignment=TA_CENTER))
styles.add(ParagraphStyle(name="H1X", parent=styles["Heading1"], fontName="XenSans-Bold",
                          fontSize=18, leading=22, textColor=navy, spaceBefore=10, spaceAfter=8))
styles.add(ParagraphStyle(name="H2X", parent=styles["Heading2"], fontName="XenSans-Bold",
                          fontSize=12, leading=15, textColor=ink, spaceBefore=9, spaceAfter=5))
styles.add(ParagraphStyle(name="BodyX", parent=styles["BodyText"], fontName="XenSans",
                          fontSize=9.5, leading=14,
                          textColor=ink, spaceAfter=6))
styles.add(ParagraphStyle(name="SmallX", parent=styles["BodyText"], fontName="XenSans",
                          fontSize=8, leading=11,
                          textColor=muted))

def footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(colors.HexColor("#D9E1EA"))
    canvas.line(0.7*inch, 0.55*inch, 7.8*inch, 0.55*inch)
    canvas.setFont("XenSans", 8)
    canvas.setFillColor(muted)
    canvas.drawString(0.7*inch, 0.35*inch, "XAVR 1.0.0 | Xen Academy Voice Runtime")
    canvas.drawRightString(7.8*inch, 0.35*inch, f"Page {doc.page}")
    canvas.restoreState()

doc = SimpleDocTemplate(str(OUT), pagesize=letter, leftMargin=0.7*inch, rightMargin=0.7*inch,
                        topMargin=0.7*inch, bottomMargin=0.7*inch,
                        title="XAVR 1.0 Operating Manual", author="Xen Academy")
story = []

cover = Table([[
    Paragraph("XEN ACADEMY<br/>VOICE RUNTIME", styles["CoverTitle"]),
    Paragraph("OPERATING MANUAL<br/><br/>XAVR 1.0.0 / XPS 4.5.0<br/>Permission-gated spoken learning, local assessment, and Resume Anywhere", styles["CoverSub"])
]], colWidths=[3.4*inch, 3.4*inch], rowHeights=[7.3*inch])
cover.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (-1,-1), navy), ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
    ("LEFTPADDING", (0,0), (-1,-1), 24), ("RIGHTPADDING", (0,0), (-1,-1), 24),
    ("LINEBEFORE", (1,0), (1,0), 2, cyan)
]))
story.extend([cover, PageBreak()])

def h1(text): story.append(Paragraph(text, styles["H1X"]))
def h2(text): story.append(Paragraph(text, styles["H2X"]))
def p(text): story.append(Paragraph(text, styles["BodyX"]))

h1("What XAVR does")
p("XAVR lets a learner listen to a Spanish model phrase, record a spoken attempt, replay it, submit it for browser-supported assessment, retry without penalty, and preserve passing evidence in the same browser profile. Every Spanish phrase is followed by its English translation.")

h1("Complete a spoken activity")
steps = [
    "Open <b>Academy</b> and enter the Spanish voice activity.",
    "Read <b>Before you start</b>. The microphone is off.",
    "Play the slow or natural model.",
    "Press <b>Start Speaking</b>; only this action may request microphone permission.",
    "Choose Allow, speak, and press <b>Stop Recording</b>.",
    "Replay, submit, or retry. Continue unlocks only after passing evidence.",
    "Pass all six required speaking modes to satisfy the spoken Warden gate."
]
for i, step in enumerate(steps, 1): p(f"<b>{i}.</b> {step}")

h1("Controls")
data = [["Control", "Result"],
        ["Start Speaking", "Requests permission and begins capture after approval"],
        ["Stop Recording", "Stops capture and releases microphone tracks"],
        ["Replay", "Plays the current temporary recording"],
        ["Retry / Delete / Cancel", "Discards audio and returns to a safe state"],
        ["Submit", "Scores the available transcript and saves local evidence"],
        ["Disable Voice", "Turns voice off while keeping typed lessons usable"]]
table = Table(data, colWidths=[1.65*inch, 5.05*inch], repeatRows=1)
table.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (-1,0), navy), ("TEXTCOLOR", (0,0), (-1,0), colors.white),
    ("FONTNAME", (0,0), (-1,0), "XenSans-Bold"), ("FONTNAME", (0,1), (0,-1), "XenSans-Bold"),
    ("FONTNAME", (1,1), (-1,-1), "XenSans"),
    ("FONTSIZE", (0,0), (-1,-1), 8.5), ("LEADING", (0,0), (-1,-1), 12),
    ("BACKGROUND", (0,1), (-1,-1), paper), ("GRID", (0,0), (-1,-1), 0.4, colors.HexColor("#CFD8E3")),
    ("VALIGN", (0,0), (-1,-1), "TOP"), ("TOPPADDING", (0,0), (-1,-1), 7),
    ("BOTTOMPADDING", (0,0), (-1,-1), 7)
]))
story.append(table)

h1("Assessment")
p("Passing is 80/100: phrase completion 25%, word accuracy 30%, pronunciation similarity 20%, pacing 10%, fluency 10%, and hesitation 5%. Recognition confidence is separate. Browser-only pronunciation is a recognition-derived proxy; XAVR does not claim phoneme-level analysis.")

story.append(PageBreak())
story.append(KeepTogether([
    Paragraph("Permission recovery", styles["H1X"]),
    Paragraph("Denied", styles["H2X"]),
    Paragraph("Open the browser's site controls, allow Microphone for Daily Bread, return to Academy, and press Retry.", styles["BodyX"]),
    Paragraph("Unavailable or no transcript", styles["H2X"]),
    Paragraph("Use current Chrome or Edge on a microphone-equipped device. Typed Academy remains available. XAVR does not upload audio to compensate for missing browser support.", styles["BodyX"])
]))

h1("Privacy and reset")
p("Audio exists only as a temporary in-memory browser object URL. It is never persisted or transmitted. Delete Recording, Retry, Cancel, Disable Voice, or leaving the page discards it. Transcript and score evidence remain in local browser storage. Use Reset local data to remove learner evidence and privacy-safe local telemetry.")

h1("Warden release checklist")
for item in ["Allow path and deny/recovery path", "Start, stop, replay, deletion, retry, and disable",
             "Assessment, passing gate, best/latest evidence, and Resume Anywhere", "Typed fallback",
             "Mobile, keyboard, screen reader, reduced motion, and no overflow", "Privacy scan, secret scan, deployment binding, and live release marker"]:
    p(f"&#9633; {item}")

story.append(Spacer(1, 14))
story.append(Paragraph("Production: https://decureton-xencreator.github.io/daily-bread-/#scene-academy", styles["SmallX"]))
story.append(Paragraph("Canonical source: docs/XAVR-1.0-OPERATING-MANUAL.md", styles["SmallX"]))

doc.build(story, onFirstPage=footer, onLaterPages=footer)
print(OUT)
