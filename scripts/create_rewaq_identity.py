from pathlib import Path
import re
ROOT=Path(__file__).resolve().parent.parent
s=(ROOT/'scripts/create_brand_identity.py').read_text(encoding='utf8')
s=s.replace("LOCATION-Brand-Identity-Medina-Motion.pdf","REWAQ-Location-Brand-Identity.pdf")
s=s.replace("LOCATION | Brand Identity - Medina Motion","REWAQ Location | Brand Identity")
s=s.replace("c.setAuthor('LOCATION')","c.setAuthor('REWAQ Location')")
s=s.replace('medina-motion-symbol','rewaq-symbol').replace('medina-motion-icon','rewaq-icon')
s=s.replace('LOCATION / MEDINA MOTION','REWAQ LOCATION / BRAND IDENTITY')
s=s.replace("/ 10'","/ 11'").replace('len(reader.pages)==10','len(reader.pages)==11')
s=s.replace("text(tx,y+sh*.44,'LOCATION',size,'ArialBold',I if light else G,size*.075)","text(tx,y+sh*.5,'REWAQ',size*1.1,'ArialBold',I if light else G,size*.09)\n    text(tx+2,y+sh*.27,'LOCATION',size*.28,'ArialBold',I if light else G,size*.055)")
s=s.replace("y+sh*.19,'MARRAKECH", "y+sh*.06,'MARRAKECH")
s=s.replace("'OPTION 01 ADOPTEE'","'REWAQ LOCATION'")
s=s.replace('LOCATION est un service','REWAQ Location est un service')
s=s.replace('Medina Motion : une porte vers le voyage.','REWAQ : une porte ouverte sur votre voyage.')
s=s.replace("'Le L','La lettre initiale de LOCATION structure le signe, pour le rattacher directement au nom.'","'Le R','La lettre initiale de REWAQ structure le signe. Sa jambe se prolonge en route pour évoquer la mobilité.'")
s=s.replace("'LOCATION / MARRAKECH / RAK'","'REWAQ / LOCATION / MARRAKECH'")
s=s.replace("text(520,372,'LOCATION',22", "text(520,372,'REWAQ LOCATION',20")
s=s.replace('Les planches générées restent des références de direction artistique.','Le nom REWAQ reçoit une signification marketing construite ; il ne constitue pas une vérification de disponibilité de marque.')
s=s.replace('Les fichiers vectoriels sont les sources de production. Le nom REWAQ reçoit une signification marketing construite ; il ne constitue pas une vérification de disponibilité de marque.<br/>Pour l’impression : valider couleurs, dimensions et support avec l’imprimeur.','Fichiers vectoriels destinés à la production. Le sens de REWAQ est une création marketing, pas une validation de disponibilité de marque.<br/>Valider couleurs et supports avec l’imprimeur.')
# Keep each established page and insert a dedicated naming chapter after positioning.
for n in range(10,2,-1):s=s.replace(f'page({n},',f'page({n+1},')
s=re.sub(r"heading\('(\d{2}) /",lambda m:"heading('"+f"{int(m.group(1))+1:02d}"+" /" if int(m.group(1))>=2 else m.group(0),s)
insert='''
# Naming and meaningful acronym
page(3,'Le nom REWAQ')
heading('02 / Le sens du nom','Rent Easily With Accurate Quotes.')
para(44,408,752,'Une expression marketing proposée pour la marque : <b>louer facilement, avec un devis précis</b>. Elle relie le nom au parcours réel : dates, véhicule, calcul du tarif et demande de réservation.',12,K)
for j,(letter,word,meaning) in enumerate([('R','Rent','Louer une voiture'),('E','Easily','Un parcours simple'),('W','With','Avec'),('A','Accurate','Un calcul précis'),('Q','Quotes','Des devis de location')]):
    x=44+j*154;rect(x,155,138,175,G if j%2==0 else S,r=8);fg=I if j%2==0 else G
    text(x+17,260,letter,42,'ArialBold',fg);text(x+17,222,word,14,'ArialBold',fg);para(x+17,201,105,meaning,9,fg)
para(44,119,752,'Le lien architectural reste présent : le rewaq évoque un passage couvert ou une galerie à arcades. La marque associe ce passage à l’accueil du voyageur et au départ sur la route. L’acronyme est une création marketing, pas une étymologie.',10,M)
end()

'''
s=s.replace('# 03 - logo concept',insert+'# 03 - logo concept')
exec(compile(s,str(ROOT/'scripts/create_brand_identity.py'),'exec'))
