import json
import random

'''
attributes
'''

phrases = ['parallel,database,memory,server,performance,processing,systems,join,sql,architectures,distributed,disk,shared,high,client,architecture,transaction,algorithm,file,main,oracle,strategies,system,db,execution,algorithms,processors,hash,grid,availability,cache,processor,techniques,parallelism,files,joins,multiprocessor,caching,microsoft,machine,subscribe,graphics,arrays,publish,dbms,operations,recovery,external,disks,implementation,index,balancing,strategy,flash,massively,side,buffer,storage,evaluation,declustering,replacement']
conferences = ['kdd', 'www', 'sigir', 'siggraph', 'icml', 'siam', 'icdm']
authors = ['philip s. yu,charu c. aggarwal,jiawei han,christos faloutsos,jian pei,hans-peter kriegel,haixun wang,johannes gehrke,divesh srivastava,tao li']

def dataGen (levels, phrases, conferences, authors, children, root):
	random.shuffle(phrases)
	random.shuffle(authors)
	random.shuffle(conferences)
	root['phrases'] = ','.join(phrases)
	root['authors'] = ','.join(authors)
	root['conferences'] = ','.join(conferences)
	root['score'] = random.randint(1,20)
	root['year'] = {}
	for a in range(1990, 2000):
		root['year'][str(a)] = random.randint(1,10)
	if levels!=0:
	#make children and recurse
		root['children'] = []
		for i in range(0, children):
			root['children'].append({})
			dataGen(levels-1, phrases, conferences, authors, children, root['children'][i])

if __name__ == '__main__':
	f = open('data.json', 'w')
	root = {}
	phrases = phrases[0].split(',')
	authors = authors[0].split(',')
	dataGen(4, phrases, conferences, authors, 4, root)
	f.write(json.dumps(root, indent = 4, separators = (',',':')))
	