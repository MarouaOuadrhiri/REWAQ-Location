from pathlib import Path
import re, math
from xml.etree import ElementTree as ET
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, Color
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import ImageReader
from pypdf import PdfReader

ROOT=Path(__file__).resolve().parent.parent
OUT=ROOT/'output/pdf/LOCATION-Brand-Identity-Medina-Motion.pdf'
W,H=841.89,595.28
G='#103E38';T='#C86A4A';S='#E8D6BA';I='#FAF7F1';K='#263C36';M='#63766D';B='#E4DCD0'
for name,file in [('Arial','arial.ttf'),('ArialBold','arialbd.ttf'),('ArialItalic','ariali.ttf')]:
    pdfmetrics.registerFont(TTFont(name,str(Path('C:/Windows/Fonts')/file)))
pdfmetrics.registerFontFamily('Arial',normal='Arial',bold='ArialBold',italic='ArialItalic',boldItalic='ArialBold')
c=canvas.Canvas(str(OUT),pagesize=(W,H),pageCompression=1)
c.setTitle('LOCATION | Brand Identity - Medina Motion')
c.setAuthor('LOCATION')
c.setSubject('Identite visuelle : Marrakech, location de voitures et livraison aeroport')

def rect(x,y,w,h,fill,stroke=None,r=0):
    c.setFillColor(HexColor(fill));c.setStrokeColor(HexColor(stroke or fill))
    if r:c.roundRect(x,y,w,h,r,stroke=bool(stroke),fill=1)
    else:c.rect(x,y,w,h,stroke=bool(stroke),fill=1)
def text(x,y,s,size=11,font='Arial',color=K,spacing=None):
    c.setFillColor(HexColor(color));p=c.beginText(x,y);p.setFont(font,size)
    p.setCharSpace(spacing or 0)
    p.textOut(s);c.drawText(p)
def para(x,top,w,s,size=11,color=M,leading=None,bold=False):
    reset=c.beginText();reset.setCharSpace(0);c.drawText(reset)
    style=ParagraphStyle('body',fontName='ArialBold' if bold else 'Arial',fontSize=size,leading=leading or size*1.6,textColor=HexColor(color),spaceAfter=0)
    p=Paragraph(s,style);_,height=p.wrap(w,H);p.drawOn(c,x,top-height);return top-height
def line(x1,y1,x2,y2,color=B,width=.7):
    c.setStrokeColor(HexColor(color));c.setLineWidth(width);c.line(x1,y1,x2,y2)
def page(n,section,dark=False):
    rect(0,0,W,H,G if dark else I)
    text(44,H-34,'LOCATION / MEDINA MOTION',8,'ArialBold',S if dark else G,1.5)
    text(W-260,H-34,section.upper(),7.5,'Arial',S if dark else M,1.1)
    line(44,35,W-44,35,'#356257' if dark else B)
    text(44,21,'MARRAKECH · AIRPORT CAR RENTAL',7,'Arial',S if dark else M,1)
    text(W-85,21,f'{n:02d} / 10',7,'Arial',S if dark else M)
def heading(kicker,title,desc=None):
    text(44,H-82,kicker.upper(),9,'ArialBold','#9D4831',1.5)
    text(44,H-125,title,31,'ArialBold',G)
    if desc:para(44,H-145,W-88,desc,10.5)
def end():c.showPage()

def symbol(x,y,height=100,light=False,mono=False):
    file='medina-motion-symbol-light.svg' if light else 'medina-motion-symbol.svg'
    svg=ET.parse(ROOT/'public/brand'/file).getroot();scale=height/112
    c.saveState();c.translate(x,y+height);c.scale(scale,-scale)
    for node in svg:
        tag=node.tag.split('}')[-1];fill=node.attrib.get('fill',G)
        if mono:fill=I if light else G
        c.setFillColor(HexColor(fill))
        if tag=='path':
            tokens=re.findall(r'[A-Za-z]|-?\d*\.?\d+',node.attrib['d']);p=c.beginPath();j=0;cmd='';cx=cy=0
            while j<len(tokens):
                if tokens[j].isalpha():cmd=tokens[j];j+=1
                if cmd in ('Z','z'):p.close();cmd='';continue
                if cmd in ('M','L','m','l'):
                    nx,ny=float(tokens[j]),float(tokens[j+1]);j+=2
                    if cmd.islower():nx+=cx;ny+=cy
                    cx,cy=nx,ny
                    if cmd in ('M','m'):p.moveTo(cx,cy);cmd='l' if cmd=='m' else 'L'
                    else:p.lineTo(cx,cy)
                elif cmd in ('H','h'):cx=float(tokens[j])+(cx if cmd=='h' else 0);j+=1;p.lineTo(cx,cy)
                elif cmd in ('V','v'):cy=float(tokens[j])+(cy if cmd=='v' else 0);j+=1;p.lineTo(cx,cy)
                elif cmd in ('C','c'):
                    values=[float(v) for v in tokens[j:j+6]];j+=6
                    if cmd=='c':values=[v+(cx if i%2==0 else cy) for i,v in enumerate(values)]
                    p.curveTo(*values);cx,cy=values[-2:]
                else:raise ValueError(cmd)
            c.drawPath(p,stroke=0,fill=1,fillMode=0)
        elif tag=='circle':c.circle(float(node.attrib['cx']),float(node.attrib['cy']),float(node.attrib['r']),stroke=0,fill=1)
    c.restoreState()
def lockup(x,y,width=500,light=False,tagline=True,mono=False):
    sh=width*.19;symbol(x,y,sh,light,mono);tx=x+sh*.99;size=width*.085
    text(tx,y+sh*.44,'LOCATION',size,'ArialBold',I if light else G,size*.075)
    if tagline:text(tx+1,y+sh*.19,'MARRAKECH · AIRPORT CAR RENTAL',width*.0159,'Arial',I if light else K,width*.003)
def pill(x,y,label,bg=G,fg=I,w=None):
    w=w or pdfmetrics.stringWidth(label,'ArialBold',9)+30;rect(x,y,w,29,bg,r=5);text(x+15,y+10,label,9,'ArialBold',fg)
def number_card(x,y,n,title,body,w=225,h=180):
    rect(x,y,w,h,'#FFFFFF',B,8);text(x+20,y+h-35,n,11,'ArialBold',T);text(x+20,y+h-65,title,15,'ArialBold',G);para(x+20,y+h-84,w-40,body,10)

# 01 - cover
page(1,'Identite visuelle / 2026',True)
lockup(58,330,700,True)
text(58,254,'Votre voiture vous attend',32,'ArialBold',I)
text(58,211,'à Marrakech.',32,'ArialBold',I)
para(60,162,520,'Une identité locale, accueillante et contemporaine pour relier l’arrivée à l’aéroport au plaisir de prendre la route.',12,S)
pill(60,69,'OPTION 01 ADOPTEE',T,I,160)
text(245,79,'CHARTE DE MARQUE / 12 NOVEMBRE 2026',8,'Arial',S,1.2)
end()

# 02 - brand strategy
page(2,'La marque')
heading('01 / Positionnement','Un accueil local. La liberté de rouler.')
para(44,400,330,'LOCATION est un service de location de voitures basé à <b>Marrakech</b>. La marque accompagne notamment les voyageurs arrivant d’Europe et propose la livraison du véhicule à <b>l’aéroport Marrakech-Menara (RAK)</b>.',13,K,21)
para(44,274,330,'Sa personnalité : une équipe locale accessible, un parcours de réservation clair et une présentation soignée. La marque parle du voyage avec simplicité, sans promesse de luxe artificielle ni garantie non définie.',11,M)
for j,(t,b) in enumerate([('Ancrage local','Une porte m arrakchie, des tons naturels et le nom de la ville comme point de repère.'.replace('m arrakchie','marrakchie')),('Clarté','Des tarifs en DH, des étapes lisibles et une distinction nette entre demande et confirmation.'),('Accueil','Un ton humain et concret, avec les informations de vol utiles au rendez-vous à l’aéroport.')]):
    yy=369-j*108;rect(421,yy,375,93,'#FFFFFF',B,7);text(442,yy+64,t,14,'ArialBold',G);para(442,yy+49,333,b,10)
end()

# 03 - logo concept
page(3,'Le signe')
heading('02 / Concept du logo','Medina Motion : une porte vers le voyage.')
symbol(60,115,280)
for yy,n,title,body in [(392,'01','Le portail','Une arche contemporaine évoque l’architecture de Marrakech et l’idée d’un accueil.'),(301,'02','Le L','La lettre initiale de LOCATION structure le signe, pour le rattacher directement au nom.'),(210,'03','La route','Une courbe suggère la conduite et la continuité entre l’aéroport, la ville et le séjour.'),(119,'04','Le point d’arrivée','La touche terracotta sert de repère : un rendez-vous, un départ de parcours, une destination.')]:
    text(394,yy,n,10,'ArialBold',T);text(428,yy,title,15,'ArialBold',G);para(428,yy-15,355,body,10)
end()

# 04 - variants
page(4,'Versions du logo')
heading('03 / Systeme de marque','Un logo. Plusieurs contextes.')
cards=[(44,268,I,'Version principale',False,False),(432,268,G,'Version inversée',True,False),(44,71,'#FFFFFF','Version monochrome',False,True),(432,71,S,'Icône et signe seul',False,False)]
for x,y,bg,label,light,mono in cards:
    rect(x,y,365,171,bg,B if not light else None,8)
    if label=='Icône et signe seul':
        symbol(x+50,y+45,83);c.drawImage(str(ROOT/'public/brand/medina-motion-icon-512.png'),x+225,y+45,83,83,mask='auto')
    else:lockup(x+19,y+49,325,light,True,mono)
    text(x+20,y+18,label,9,'ArialBold',S if light else M)
end()

# 05 - palette
page(5,'Palette chromatique')
heading('04 / Couleurs','Le vert de confiance. La chaleur de Marrakech.')
palette=[('Vert Medina',G,'Couleur principale','16 / 62 / 56'),('Terracotta',T,'Accent et repères','200 / 106 / 74'),('Sable',S,'Surfaces secondaires','232 / 214 / 186'),('Ivoire',I,'Fond principal','250 / 247 / 241'),('Encre végétale',K,'Texte courant','38 / 60 / 54')]
for j,(name,hx,role,rgb) in enumerate(palette):
    x=44+j*154;rect(x,232,138,170,hx,B if hx==I else None,7);fg=I if j in (0,1,4) else G;text(x+14,249,hx,12,'ArialBold',fg);text(x,210,name,11,'ArialBold',G);para(x,191,141,role,9,M);text(x,153,'RGB '+rgb,8,'Arial',M)
rect(44,67,752,54,'#FFFFFF',B,7);para(60,104,717,'Répartition conseillée des surfaces : <b>60 % ivoire · 25 % vert · 10 % sable · 5 % terracotta</b>. L’encre sert au texte. Le terracotta souligne la marque ; le vert porte les actions principales.',10,K)
end()

# 06 - typography
page(6,'Typographie')
heading('05 / La voix visuelle','Directe, lisible, accueillante.')
text(44,383,'Votre voiture vous attend',30,'ArialBold',G)
text(44,344,'à Marrakech.',30,'ArialBold',G)
para(46,301,405,'Choisissez vos dates, trouvez votre voiture et préparez votre arrivée à Marrakech-Menara. Notre équipe coordonne la remise du véhicule avec vous.',12,K,20)
text(45,204,'Aa Bb Cc 0123456789',27,'Arial',G)
text(45,170,'LOCATION / MARRAKECH / RAK',11,'ArialBold',T,1.6)
rect(517,102,279,311,'#FFFFFF',B,8)
text(539,382,'Famille retenue : Arial',15,'ArialBold',G)
para(539,361,232,'Une sans serif disponible sur le site et intégrée dans ce PDF. Éviter les mélanges de familles sans fonction claire.',10)
rows=[('Titre principal','32-48 px / Bold'),('Titre de section','24-32 px / Bold'),('Texte courant','14-16 px / Regular'),('Boutons','13-14 px / Bold'),('Labels','11-12 px / Bold')]
for j,(l,v) in enumerate(rows):
    yy=272-j*32;text(539,yy,l,10,'ArialBold',G);text(654,yy,v,8,'Arial',M);line(539,yy-11,774,yy-11)
para(44,111,410,'Lisibilité : interligne généreux, phrases courtes, titres utiles. Les textes longs restent alignés à gauche.',10,M)
end()

# 07 - digital use
page(7,'Application digitale')
heading('06 / Interface','Une identité qui guide la réservation.')
rect(44,84,752,343,'#FFFFFF',B,8)
rect(44,343,752,84,G)
lockup(61,365,231,True,False)
text(576,389,'MAD / DH',9,'ArialBold',I);pill(660,376,'Réserver',I,G,108)
text(64,318,'Votre voiture à Marrakech',18,'ArialBold',G)
rect(63,258,713,43,T,r=5)
for x,width,label in [(67,276,'Marrakech-Menara (RAK)'),(347,139,'18 déc. 2026'),(490,139,'25 déc. 2026')]:
    rect(x,262,width,35,'#FFFFFF',r=3);text(x+10,275,label,9,'Arial',K)
pill(634,264,'Rechercher',G,I,137)
rect(63,108,448,129,I,B,6)
c.drawImage(ImageReader(str(ROOT/'public/vehicles/mercedes.png')),75,116,170,112,mask='auto',preserveAspectRatio=True,anchor='c')
text(254,206,'Mercedes-Benz C-Class',12,'ArialBold',G)
text(254,180,'Automatique · 5 places',9,'Arial',M)
text(254,155,'Livraison à Marrakech-Menara',9,'Arial',G)
text(254,131,'Demande sans compte client',8,'Arial',M)
rect(529,108,247,129,'#F2E5D4',r=6)
text(547,208,'Exemple : 7 jours',10,'Arial',K)
text(547,176,'2 850 DH',25,'ArialBold',G)
pill(547,125,'Voir le véhicule',G,I,208)
text(63,93,'Exemple de présentation : véhicule et tarif indicatifs.',7,'ArialItalic',M)
end()

# 08 - print/application
page(8,'Supports de marque')
heading('07 / Au-dela du site','Une signature reconnaissable à chaque contact.')
rect(44,235,365,190,G,r=10);lockup(67,292,320,True)
rect(431,235,365,190,I,B,10);symbol(452,326,58)
text(520,372,'LOCATION',22,'ArialBold',G,2)
text(454,302,'Location de voitures à Marrakech',13,'ArialBold',G)
text(454,277,'Livraison à l’aéroport Marrakech-Menara',10,'Arial',M)
text(454,254,'Marrakech · Maroc',9,'Arial',M)
text(44,213,'Carte de visite / recto',9,'ArialBold',G);text(431,213,'Carte de visite / verso',9,'ArialBold',G)
rect(44,70,364,110,S,r=8);symbol(62,88,70);text(145,135,'Bienvenue à Marrakech.',16,'ArialBold',G);para(146,117,240,'Exemple de panneau d’accueil ou de signature documentaire.',9)
rect(431,70,365,110,'#FFFFFF',B,8)
for j,size in enumerate([58,38,24]):
    c.drawImage(str(ROOT/'public/brand/medina-motion-icon-512.png'),456+j*89,96,size,size,mask='auto')
text(456,82,'Icône / réseaux / raccourci mobile',8,'Arial',M)
text(44,48,'Maquettes de supports : aucun numéro, adresse ou nom de domaine fictif ajouté.',7,'ArialItalic',M)
end()

# 09 - rules / accessibility
page(9,'Regles d’utilisation')
heading('08 / Cohérence et lisibilité','Protéger le signe, préserver le contraste.')
rect(44,180,362,242,'#FFFFFF',B,8)
lockup(80,270,286)
c.setStrokeColor(HexColor(T));c.setDash(4,3);c.rect(65,242,320,130,stroke=1,fill=0);c.setDash()
text(65,387,'Zone de protection',11,'ArialBold',G)
para(65,226,320,'Garder autour du logo un espace libre au moins égal à 20 % de la largeur du symbole.',9,M)
text(443,396,'À respecter',14,'ArialBold',G)
for j,s in enumerate(['Conserver les proportions et la géométrie.','Utiliser une version claire sur fond sombre.','Préférer le signe seul quand l’espace est limité.','Logo web : 220 px minimum ; signature complète : 320 px.','Symbole : 24 px conseillé ; favicon dédié : 16/32 px.']):
    text(444,365-j*29,'• '+s,10,'Arial',K)
text(443,190,'À éviter',14,'ArialBold','#9D4831')
for j,s in enumerate(['Étirement, rotation ou contour ajouté.','Ombres lourdes, dégradés et couleurs improvisées.','Texte fin en terracotta sur fond ivoire.','Logo sur une photo chargée sans aplat de soutien.']):text(444,160-j*25,'• '+s,10,'Arial',M)
rect(44,73,362,85,G,r=7);text(62,127,'Boutons principaux',12,'ArialBold',I);para(62,110,324,'Texte ivoire sur vert. Accent terracotta réservé aux repères, bordures et éléments non textuels.',10,S)
end()

# 10 - tone / delivery
page(10,'Ton et livrables')
heading('09 / Mise en pratique','Une marque locale, jamais une promesse inventée.')
number_card(44,226,'01','Dire les choses clairement','<i>Votre voiture vous attend à Marrakech.</i><br/><br/><i>Ajoutez votre numéro de vol pour préparer votre remise du véhicule à l’aéroport.</i>')
number_card(307,226,'02','Garder un ton humain','Des phrases directes, un vocabulaire concret et une aide utile à chaque étape.<br/><br/>La destination et le besoin du voyageur passent avant les effets de style.')
number_card(570,226,'03','Rester exact','Ne pas annoncer de livraison gratuite, d’ouverture 24 h/24 ou de confirmation immédiate sans politique validée.<br/><br/>Une demande en attente reste une demande en attente.')
rect(44,70,752,125,'#FFFFFF',B,8)
text(64,166,'Fichiers livrés',14,'ArialBold',G)
para(64,148,340,'SVG : logo principal, version inversée, monochrome, symbole et icône.<br/>PNG : logo transparent haute résolution et icônes 16, 32, 64, 180 et 512 px.',10)
para(444,148,330,'Les fichiers vectoriels sont les sources de production. Les planches générées restent des références de direction artistique.<br/>Pour l’impression : valider couleurs, dimensions et support avec l’imprimeur.',10)
end()
c.save()
reader=PdfReader(str(OUT));assert len(reader.pages)==10
assert all((p.extract_text() or '').strip() for p in reader.pages)
print(f'Created {OUT} / {len(reader.pages)} pages / {OUT.stat().st_size:,} bytes')
