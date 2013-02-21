Topic hierarchy:

_k.ngram7 (k topics under root, level 0)
	.1_k.ngram7 (k topics under topic-1 in level 1)
		.1.1_k.ngram7 (k topics under topic-1.1 in level 2)
	.2_k.ngram7 (k topics under topic-2 in level 1)
	...


Each file is named in the following convention:

	[topicname]_[k].ngram7

where [topicname] = [parentname].[topicnum]

parentname means the name of parent topic, topicnum means in which line of parent you can find the current topic, and k means how many subtopics the current topic has.

For example, the root topic's name is '', and it's partitioned into 5 subtopics, so there is this file _5.ngram7. There are 5 lines in this file and each lines shows the ranked phrases in each topic, separated by '\t'.

The first topic under the root is named ".1" because [parentname] = "" and [topicnum] = 1. It has 4 children, so ther is a file ".1_4.ngram7", with 4 lines indicating 4 subtopics.

For all leaf topics, there is no file with their name as prefix fbecause they do not have children. But the top ranked phrases for them can be found in the file with their parent's name as filename. For example, the 2nd line of ".1.1_4.ngram7"actually shows the top ranked phrases of topic ".1.1.2". In other words, to see the top ranked phrases of a topic, you must check a certain line in the file with the parent topic's name as filename.