#!/usr/bin/env python3
"""Arts Attack! — télécharge jusqu'à huit reproductions authentiques libres.
Exécuter depuis le dossier de l'application : python telecharger_oeuvres.py
Nécessite Python 3, Pillow et une connexion Internet.
"""
import io,json,re,time,urllib.parse,urllib.request
from pathlib import Path
try:
 from PIL import Image,ImageOps
except ImportError:
 raise SystemExit('Installer Pillow avec : python -m pip install Pillow')
FOLDER=Path(__file__).resolve().parent/'assets'/'oeuvres';FOLDER.mkdir(parents=True,exist_ok=True)
HEADERS={'User-Agent':'ArtsAttackEducationalCollection/1.0 (contact: https://github.com/)', 'Accept':'application/json,image/*'}
COMMONS='https://commons.wikimedia.org/w/api.php'
# Les titres désignent les reproductions exactes et non des interprétations graphiques.
CANDIDATES={
 'wave':['The Great Wave off Kanagawa.jpg','Katsushika Hokusai - The Great Wave off Kanagawa.jpg'],
 'starry':['Van Gogh - Starry Night - Google Art Project.jpg','Van Gogh - Starry Night.jpg','Vincent van Gogh - The Starry Night - Google Art Project.jpg'],
 'boogie':['Piet Mondrian, 1942 - Broadway Boogie Woogie.jpg'],
 'yellow':['Gelb-Rot-Blau, by Wassily Kandinsky, Centre Pompidou.jpg','Kandinsky - Gelb-Rot-Blau, 1925.png'],
 'self':['Vincent van Gogh, Self-Portrait, 1889, NGA 106382.jpg','Vincent van Gogh - Zelfportret, 1889 (National Gallery of Art).jpg'],
 'scream':['The Scream by Edvard Munch, 1893 - Nasjonalgalleriet.png'],
}
SEARCH={'wave':'The Great Wave off Kanagawa Hokusai','starry':'The Starry Night Vincent van Gogh painting','boogie':'Piet Mondrian 1942 Broadway Boogie Woogie','yellow':'Kandinsky Gelb Rot Blau 1925','self':'Vincent van Gogh Self-Portrait 1889 National Gallery of Art','scream':'Edvard Munch The Scream 1893 Nasjonalgalleriet'}

def get(url):
 req=urllib.request.Request(url,headers=HEADERS)
 with urllib.request.urlopen(req,timeout=35) as r: return r.read()
def getjson(url):return json.loads(get(url))
def api(params):return getjson(COMMONS+'?'+urllib.parse.urlencode(dict(action='query',format='json',**params)))
def checkpd(metadata):
 m={k:str(v.get('value','')) for k,v in metadata.items()}
 code=(m.get('LicenseShortName','')+' '+m.get('License','')).lower()
 # Restricted to clearly public-domain or CC0 records; no licensing guesses.
 return any(x in code for x in ('public domain','cc0','pd-old','pd-art','pd-us','pd-anon')) or m.get('Copyrighted','').lower()=='false'
def commons_file(title):
 d=api({'prop':'imageinfo','iiprop':'url|extmetadata','iiurlwidth':1700,'titles':'File:'+title})
 p=next(iter(d.get('query',{}).get('pages',{}).values()),{})
 info=(p.get('imageinfo') or [{}])[0]
 if not info.get('url') or not checkpd(info.get('extmetadata',{})):return None
 return info.get('thumburl') or info['url'],info['url'],'Wikimedia Commons : '+p.get('title','File:'+title)
def commons(id):
 for title in CANDIDATES[id]:
  try:
   result=commons_file(title)
   if result:return result
  except Exception as e:print('  Source indisponible :',str(e)[:70])
 # Automated search for the exact work; don't choose unverified search result silently.
 d=api({'list':'search','srsearch':'filetype:bitmap '+SEARCH[id],'srnamespace':6,'srlimit':8})
 matches=[i['title'][5:] for i in d.get('query',{}).get('search',[]) if i['title'].startswith('File:')]
 print('  Recherche de fichiers possibles :',matches[:5]);return None

def met(id,oid,artist):
 d=getjson('https://collectionapi.metmuseum.org/public/collection/v1/objects/'+str(oid))
 if not d.get('isPublicDomain') or artist.lower() not in d.get('artistDisplayName','').lower():raise ValueError('Domaine public ou artiste non vérifié')
 url=d.get('primaryImage') or d.get('primaryImageSmall')
 if not url:raise ValueError('Image absente du catalogue du Met')
 return url,url,'The Met — Open Access / CC0 — objet '+str(oid)
def artic(oid):
 d=getjson('https://api.artic.edu/api/v1/artworks/'+str(oid)+'?fields=id,image_id,is_public_domain,title')['data']
 if not d.get('is_public_domain') or not d.get('image_id') or 'grande jatte' not in d.get('title','').lower():raise ValueError('Image ou objet non vérifié')
 url='https://www.artic.edu/iiif/2/'+urllib.parse.quote(d['image_id'])+'/full/1600,/0/default.jpg'
 return url,url,'Art Institute of Chicago — public domain — objet '+str(oid)

def save(id,record):
 url,original,credit=record
 b=get(url)
 with Image.open(io.BytesIO(b)) as im:
  im=ImageOps.exif_transpose(im).convert('RGB')
  im.thumbnail((1800,1800),Image.Resampling.LANCZOS)
  if min(im.size)<300:raise ValueError('Résolution insuffisante : '+str(im.size))
  out=FOLDER/(id+'.jpg');im.save(out,'JPEG',quality=86,optimize=True,progressive=True)
  return {'status':'local','file':out.name,'width':im.width,'height':im.height,'credit':credit,'source_url':original,'download_url':url}

manifest=json.loads((FOLDER/'manifest.json').read_text(encoding='utf-8'))
for id in ['wave','starry','boogie','yellow','self','cypresses','sunday','scream']:
 if (FOLDER/(id+'.jpg')).is_file():print('DÉJÀ PRÉSENT',id);continue
 print('Récupération',id)
 try:
  if id=='cypresses':record=met(id,436535,'Gogh')
  elif id=='sunday':record=artic(27992)
  else: record=commons(id)
  if not record:raise ValueError('Aucune reproduction confirmée automatiquement : vérification manuelle nécessaire')
  manifest[id].update(save(id,record));print('  OK',id,manifest[id]['width'],'×',manifest[id]['height'])
 except Exception as exc:
  manifest[id]['status']='Téléchargement non abouti — '+str(exc)[:120]
  print('  NON TÉLÉCHARGÉ :',exc)
 (FOLDER/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
 time.sleep(0.2)
print('\nFichiers JPEG présents :',len(list(FOLDER.glob('*.jpg'))),'/ 8')
print('Déposer tous les fichiers assets/oeuvres sur GitHub Pages.')
