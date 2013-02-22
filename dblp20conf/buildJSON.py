import json

def processLeaf(filename):
	f = open(filename, 'r')
	leaf = []
	for line in f:
		#print(line)
		newline = line.replace('\t', ',')
		leafNode = {}
		leafNode['name'] = newline
		leafNode['size'] = 1
		leaf.append(leafNode)
	return leaf

def processTopLevel(filename):
	f = open(filename, 'r')
	toplvl = {}
	toplvl['name'] = 'ngram hierarchy'
	toplvl['children'] = []
	for line in f:
		newline = line.replace('\t',',')
		childnode = {}
		childnode['name'] = newline
		childnode['children'] = []
		toplvl['children'].append(childnode)
	return toplvl
		
def processMidLevel(filename, midlvl):
	f = open(filename, 'r')
	for line in f:
		newline = line.replace('\t',',')
		childnode = {}
		childnode['name'] = newline
		childnode['children'] = []
		midlvl['children'].append(childnode)
	
if __name__ == '__main__':
	f = open('filename.txt','r')
	outfile = open('dblp.json','w')
	for line in f:
		line = line.replace('\n','')
		if line[0]=='_': #top level
			toplvl = processTopLevel(line)
		elif line[0]=='m': #mid level
			nodeNum = int(line[2])-1 #condtaining the node number
			processMidLevel(line[1:], toplvl['children'][nodeNum])
		else: #leaf
			midNode = int(line[1])-1
			leafNode = int(line[3])-1
			leaf = processLeaf(line)
			toplvl['children'][midNode]['children'][leafNode]['children'].extend(leaf)
	outfile.write(json.dumps(toplvl))
			