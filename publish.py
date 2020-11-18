import datetime
import os
import json


reader = open('web.json')
config = json.load(reader)
files = config['files']
now = datetime.datetime.now()
print(now)
print(files)
for file in files:
    file['lastChanged'] = now
print(files)




def watch():
    now = datetime.datetime.now()
    for file in files:
        pass
        # print(now.timestamp - )
        # if os.path.getmtime(file['title'])

watch()
