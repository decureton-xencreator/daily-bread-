from pathlib import Path
from reportlab.lib.pagesizes import letter
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

root=Path(__file__).resolve().parents[1]
out=root/'output/pdf/XAO-010-EVIDENCE-FEDERATION-MANUAL.pdf'
out.parent.mkdir(parents=True,exist_ok=True)
pdfmetrics.registerFont(TTFont('DejaVu','/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('DejaVu-Bold','/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'))
styles=getSampleStyleSheet(); navy=HexColor('#061015'); ink=HexColor('#172b35'); muted=HexColor('#566d76')
title=ParagraphStyle('Title',parent=styles['Title'],fontName='DejaVu-Bold',fontSize=29,leading=34,textColor=navy,spaceAfter=14)
h=ParagraphStyle('H',parent=styles['Heading2'],fontName='DejaVu-Bold',fontSize=14,leading=18,textColor=navy,spaceBefore=9,spaceAfter=6)
p=ParagraphStyle('P',parent=styles['BodyText'],fontName='DejaVu',fontSize=9.2,leading=13.5,textColor=ink,spaceAfter=7)
small=ParagraphStyle('Small',parent=p,fontSize=7.8,leading=10.5,textColor=muted)
key=ParagraphStyle('Key',parent=p,textColor=HexColor('#087f91'),fontSize=8,leading=11,spaceAfter=16)
story=[
  Paragraph('Alpha One<br/>Evidence Federation',title),
  Paragraph('OPERATING MANUAL · XAO-010 · VERSION 1.0',key),
  Paragraph('One identifier is not one truth.',h),
  Paragraph('The bridge imports canonical Xen OS evidence only when the identifier, semantic contract, certification level, release commit, workflow run, source commit and privacy boundary all pass.',p),
  Spacer(1,6)
]
rows=[
 ['Gate','Required proof'],
 ['Source','Canonical xen-operating-system main at a full commit SHA'],
 ['Contract','GOVERNED_WORKFLOW_EXECUTION_RUNTIME'],
 ['Certification','Environment or stronger'],
 ['Release','Full release commit plus successful workflow run'],
 ['Privacy','No credentials, secrets or raw workflow logs']
]
t=Table(rows,colWidths=[100,372],repeatRows=1)
t.setStyle(TableStyle([
 ('BACKGROUND',(0,0),(-1,0),navy),('TEXTCOLOR',(0,0),(-1,0),HexColor('#ffffff')),
 ('FONTNAME',(0,0),(-1,0),'DejaVu-Bold'),('FONTNAME',(0,1),(0,-1),'DejaVu-Bold'),
 ('FONTNAME',(1,1),(-1,-1),'DejaVu'),('FONTSIZE',(0,0),(-1,-1),8.2),
 ('LEADING',(0,0),(-1,-1),11.5),('GRID',(0,0),(-1,-1),.4,HexColor('#c6d5da')),
 ('VALIGN',(0,0),(-1,-1),'TOP'),('PADDING',(0,0),(-1,-1),7)
]))
story += [t,Spacer(1,10),Paragraph('Current canonical finding',h),
 Paragraph('The certified XRI-006 receipt proves Xen Repository Intelligence Runtime Version 2.0 at repository level. Alpha One requires the Governed Workflow Execution Runtime at environment level. The bridge therefore returns IDENTIFIER_COLLISION_CONTRACT_MISMATCH and keeps XRI-006 current.',p),
 PageBreak(),Paragraph('Operate and recover',title)]
steps=[
 ('1. Inspect','Open Alpha One Activation and read the Evidence Federation card.'),
 ('2. Reconcile','Confirm source commit, contract, candidates, certification and collision count.'),
 ('3. Correct canonically','Publish a contract-matching environment receipt in Xen OS.'),
 ('4. Regenerate','Update the machine-readable federation receipt from canonical main.'),
 ('5. Validate','Run federation, Activation Center, Guardian and site tests.'),
 ('6. Retry','XRI-007 becomes current only after XRI-006 evidence is accepted.')
]
for name,body in steps: story += [Paragraph(name,h),Paragraph(body,p)]
story += [Spacer(1,6),Paragraph('Fail-closed guarantees',h),
 Paragraph('Malformed, weak, stale, privacy-unsafe or semantically mismatched evidence never advances the ordered program. Retry never manufactures proof. Rollback preserves the XAOA-001 evidence record.',p),
 Paragraph('Maintenance: reconcile canonical evidence before publication. Keep the validator deterministic and the public receipt free of credentials and raw workflow logs.',small)]
doc=SimpleDocTemplate(str(out),pagesize=letter,rightMargin=54,leftMargin=54,topMargin=52,bottomMargin=48,title='Alpha One Evidence Federation Manual',author='Xen')
doc.build(story)
print(out)
