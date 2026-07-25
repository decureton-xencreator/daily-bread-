from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"output/pdf/XQG-1.0-OPERATING-MANUAL.pdf"
OUT.parent.mkdir(parents=True,exist_ok=True)
navy=colors.HexColor("#08111F");cyan=colors.HexColor("#62D9FF");ink=colors.HexColor("#172033");muted=colors.HexColor("#5D6A7D")
pdfmetrics.registerFont(TTFont("XenSans","/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"))
pdfmetrics.registerFont(TTFont("XenSans-Bold","/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"))
styles=getSampleStyleSheet()
styles.add(ParagraphStyle(name="Cover",parent=styles["Title"],fontName="XenSans-Bold",fontSize=28,leading=34,textColor=colors.white,alignment=TA_CENTER))
styles.add(ParagraphStyle(name="CoverSub",parent=styles["BodyText"],fontName="XenSans",fontSize=11,leading=17,textColor=colors.HexColor("#D9E7F5"),alignment=TA_CENTER))
styles.add(ParagraphStyle(name="H1X",parent=styles["Heading1"],fontName="XenSans-Bold",fontSize=18,leading=22,textColor=navy,spaceBefore=10,spaceAfter=7))
styles.add(ParagraphStyle(name="BodyX",parent=styles["BodyText"],fontName="XenSans",fontSize=9.5,leading=14,textColor=ink,spaceAfter=7))
styles.add(ParagraphStyle(name="SmallX",parent=styles["BodyText"],fontName="XenSans",fontSize=8,leading=11,textColor=muted))
def footer(canvas,doc):
    canvas.saveState();canvas.setStrokeColor(colors.HexColor("#D9E1EA"));canvas.line(.7*inch,.55*inch,7.8*inch,.55*inch)
    canvas.setFont("XenSans",8);canvas.setFillColor(muted);canvas.drawString(.7*inch,.35*inch,"XQG 1.1 | Xen Quality Guardian")
    canvas.drawRightString(7.55*inch,.35*inch,f"Page {doc.page}");canvas.restoreState()
doc=SimpleDocTemplate(str(OUT),pagesize=letter,leftMargin=.7*inch,rightMargin=.7*inch,topMargin=.7*inch,bottomMargin=.7*inch,title="XQG 1.1 Operating Manual",author="Xen")
story=[]
cover=Table([[Paragraph("XEN QUALITY<br/>GUARDIAN",styles["Cover"])],[Paragraph("OPERATING MANUAL<br/><br/>XQG 1.1.0 / XPS 4.7.0<br/>No action may leave the user trapped.",styles["CoverSub"])]],colWidths=[6.8*inch],rowHeights=[3.8*inch,3.5*inch])
cover.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),navy),("TEXTCOLOR",(0,1),(-1,-1),colors.white),("ALIGN",(0,0),(-1,-1),"CENTER"),("VALIGN",(0,0),(-1,-1),"MIDDLE"),("BOX",(0,0),(-1,-1),2,cyan)]))
story.extend([cover,PageBreak()])
def h(text):story.append(Paragraph(text,styles["H1X"]))
def p(text):story.append(Paragraph(text,styles["BodyX"]))
h("Recover from a wrong answer")
for i,text in enumerate(["Read the explanation. Your attempt and checkpoint remain local.","Choose Correct and retry to clear the draft and answer again.","Choose Show coaching hint for focused help.","Choose Continue - revisit before completion to move forward without receiving credit.","Return with Previous or at completion. Warden requires every assessed activity to pass."],1):p(f"<b>{i}.</b> {text}")
h("What Guardian checks")
data=[["Signal","Guardian behavior"],["Wrong or blank input","Explanation and tested recovery route"],["Repeated clicks","Local rage-click finding after three rapid activations"],["16 registered surfaces","Presence, minimum controls, and named fallback"],["Buttons and links","Label, action, destination, and external-link safety"],["Media nodes","Labelled and controllable player contract"],["Dynamic interface","Automatic rescan after rendered changes"],["Runtime failure","Privacy-safe error category; no entered content"]]
t=Table(data,colWidths=[1.7*inch,5.0*inch],repeatRows=1)
t.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,0),navy),("TEXTCOLOR",(0,0),(-1,0),colors.white),("FONTNAME",(0,0),(-1,0),"XenSans-Bold"),("FONTNAME",(0,1),(0,-1),"XenSans-Bold"),("FONTNAME",(1,1),(-1,-1),"XenSans"),("FONTSIZE",(0,0),(-1,-1),8.5),("LEADING",(0,0),(-1,-1),12),("GRID",(0,0),(-1,-1),.4,colors.HexColor("#CFD8E3")),("VALIGN",(0,0),(-1,-1),"TOP"),("TOPPADDING",(0,0),(-1,-1),7),("BOTTOMPADDING",(0,0),(-1,-1),7)]))
story.append(t)
h("Privacy and reset")
p("Guardian stores aggregate interaction categories and bounded findings only in this browser. It never captures passwords, private messages, raw answers, printable keystrokes, payment data, microphone audio, screen video, or query-bearing URLs.")
p("Open Command Deck, choose Reset local state, and confirm the toast to delete Daily Bread progress and XER/XQG diagnostics.")
h("Administrator release gate")
p("Test correct, wrong, blank, retry, hint, defer, revisit, completion, keyboard, mobile, reduced-motion, unavailable-provider, reset, and offline paths. Every visible control must act or disclose an unavailable state.")
story.extend([Spacer(1,12),Paragraph("Production: https://decureton-xencreator.github.io/daily-bread-/#scene-academy",styles["SmallX"]),Paragraph("Canonical source: docs/XQG-1.0-OPERATING-MANUAL.md",styles["SmallX"])])
doc.build(story,onFirstPage=footer,onLaterPages=footer)
print(OUT)
