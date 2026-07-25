from pathlib import Path
from reportlab.lib.pagesizes import letter
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

root=Path(__file__).resolve().parents[1]; out=root/'output/pdf/XAO-009-ACTIVATION-CENTER-MANUAL.pdf'; out.parent.mkdir(parents=True,exist_ok=True)
pdfmetrics.registerFont(TTFont('DejaVu','/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('DejaVu-Bold','/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'))
styles=getSampleStyleSheet(); cyan=HexColor('#76e7f7'); navy=HexColor('#061015'); ink=HexColor('#172b35'); muted=HexColor('#566d76')
title=ParagraphStyle('Title',parent=styles['Title'],fontName='DejaVu-Bold',fontSize=30,leading=35,textColor=navy,spaceAfter=16)
h=ParagraphStyle('H',parent=styles['Heading2'],fontName='DejaVu-Bold',fontSize=15,leading=19,textColor=navy,spaceBefore=10,spaceAfter=8)
p=ParagraphStyle('P',parent=styles['BodyText'],fontName='DejaVu',fontSize=9.4,leading=14,textColor=ink,spaceAfter=7)
small=ParagraphStyle('Small',parent=p,fontSize=8,leading=11,textColor=muted)
story=[Paragraph('Xen Alpha One<br/>Activation Center',title),Paragraph('OPERATING MANUAL · XAO-009 · VERSION 1.0',ParagraphStyle('K',parent=p,textColor=HexColor('#087f91'),fontSize=8,leading=11,spaceAfter=18)),Paragraph('Press play - with proof.',h),Paragraph('The Activation Center shows the first Alpha One gate that lacks authentic evidence. It never turns configuration, deployment, or a button press into an activation claim.',p),Spacer(1,8)]
rows=[['Step','Operator action'],['1','Open Alpha One Activation from the Command Deck index.'],['2','Read Current Gate and its plain-language explanation.'],['3','Show the recovery guide and gather authentic non-secret evidence.'],['4','Run the declared validation, then retry evaluation.'],['5','Copy the continuation or defer safely when work must pause.']]
t=Table(rows,colWidths=[42,430],repeatRows=1);t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),navy),('TEXTCOLOR',(0,0),(-1,0),HexColor('#ffffff')),('FONTNAME',(0,0),(-1,0),'DejaVu-Bold'),('FONTNAME',(0,1),(0,-1),'DejaVu-Bold'),('FONTNAME',(1,1),(-1,-1),'DejaVu'),('FONTSIZE',(0,0),(-1,-1),8.5),('LEADING',(0,0),(-1,-1),12),('GRID',(0,0),(-1,-1),.4,HexColor('#c6d5da')),('VALIGN',(0,0),(-1,-1),'TOP'),('PADDING',(0,0),(-1,-1),8)]));story+=[t,PageBreak(),Paragraph('Truth states and recovery',title)]
for name,body in [('Passed','The gate contains valid evidence and its predecessor passed.'),('Evidence required','This is the first unmet gate and the only gate eligible to advance.'),('Waiting for predecessor','The gate remains locked until every earlier gate passes.'),('Gold Master complete','All 11 gates pass and XBP-009 authorizes the decision.')]: story += [Paragraph(name,h),Paragraph(body,p)]
story += [Spacer(1,8),Paragraph('Universal recovery contract',h),Paragraph('Every blocked state explains the problem and offers retry, defer, and resume. Deferral never grants credit. Failed clipboard access leaves guidance visible. No credentials, approval payloads, private content, or invented evidence are retained.',p),Paragraph('Maintenance: run the Activation Center, Alpha One, Guardian, and site validation suites before release. Rollback must not alter XAOA-001 evidence records.',small)]
doc=SimpleDocTemplate(str(out),pagesize=letter,rightMargin=54,leftMargin=54,topMargin=54,bottomMargin=48,title='Xen Alpha One Activation Center Manual',author='Xen');doc.build(story);print(out)
