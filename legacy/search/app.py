import os
import json
import re


root_dir = os.getcwd()

save_file = open(os.path.join(root_dir, 'search/index.json'), 'r')
words = json.load(save_file)
save_file.close()
blacklist = []
with open(os.path.join(root_dir, 'search/excluded.txt'), 'r') as f:
    blacklist = f.readline().split('|')

files = {}


def parse_file(file):
    file_str = open(file, 'r')
    file_arr = {}
    for line in file_str.readlines():           
        for word in re.split('\s', line):
            word = word.lower()
            if word not in blacklist and re.sub('\d|\W', '', word) != '':
                if word not in file_arr and word not in blacklist:
                    file_arr[word] = 0
                file_arr[word] += 1
    files[file.path] = file_arr


def scan_dir(directory):
    for file in os.scandir(directory):
        if os.path.isdir(file):
            scan_dir(file)
        elif file.name.endswith('.md'):
            parse_file(file)


scan_dir('pico/content')
for f in files:
    for word in files[f]:
        if word not in words:
            words[word] = {}
        words[word][f] = files[f][word]

save_file = open(os.path.join(root_dir, 'search/index.json'), 'w')
save_file.write(json.dumps(words))
save_file.close()