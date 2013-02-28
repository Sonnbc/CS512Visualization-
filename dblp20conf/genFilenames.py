from os import listdir
f = open('kmeansFileName.txt','w')
for files in listdir('.\\'):
	f.write(files+'\n')
	