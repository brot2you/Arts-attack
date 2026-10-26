#!/usr/bin/env python3
"""Télécharge les images ouvertes vérifiées dans assets/oeuvres. Nécessite accès Internet et Python 3."""
import json,urllib.request,time
from pathlib import Path
ROOT=Path(__file__).resolve().parent/'assets'/'oeuvres'
ROOT.mkdir(parents=True,exist_ok=True)
HEADERS={'User-Agent':'ArtsAttackEducationalMuseum/1.0 (educational local archiving)'}
def get(url):
 req=urllib.request.Request(url,headers=HEADERS)
 with urllib.request.urlopen(req,timeout=25) as r:return r.read()
def get_json(url):return json.loads(get(url))
def save(id,url,desc):
 data=get(url)
 if not data.startswith(bytes.fromhex('ffd8ff')):raise ValueError('La réponse n’est pas un JPEG')
 (ROOT/(id+'.jpg')).write_bytes(data)
 print('OK',id,len(data)//1024,'Ko',desc)
def met(id,oid,artist):
 d=get_json('https://collectionapi.metmuseum.org/public/collection/v1/objects/'+str(oid))
 if not d.get('isPublicDomain') or artist.lower() not in d.get('artistDisplayName','').lower():raise ValueError('Statut ou artiste non confirmé')
 url=d.get('primaryImageSmall') or d.get('primaryImage')
 if not url:raise ValueError('Pas de reproduction Open Access')
 save(id,url,'The Met Open Access CC0')
def artic(id,oid):
 d=get_json('https://api.artic.edu/api/v1/artworks/'+str(oid)+'?fields=id,image_id,is_public_domain')['data']
 if not d.get('is_public_domain') or not d.get('image_id'):raise ValueError('Non libre ou sans image')
 url='https://www.artic.edu/iiif/2/'+d['image_id']+'/full/843,/0/default.jpg'
 save(id,url,'Art Institute of Chicago public domain')
for id,fn,args in [('wave',met,(45434,'Hokusai')),('cypresses',met,(436535,'Gogh')),('sunday',artic,(27992,))]:
 try:fn(id,*args)
 except Exception as e:print('NON TÉLÉCHARGÉ',id,':',str(e))
print('Terminé. Vérifier les fichiers dans assets/oeuvres puis publier l’ensemble du dossier.')
