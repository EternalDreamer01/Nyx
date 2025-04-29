#!/usr/bin/env python3

file = open("logo.txt", "r")
picture = file.read()

file = open("name.txt", "r")
text = file.read()

lf = 8
i = 0

output = ""

for c in picture:
    if lf == 0:
        if c == " ":
            output += text[i]
        else:
            output += c
        i += 1
        continue
    elif c == "\n":
        lf -= 1
        #print("done lf")
    #print(c, end='')
    output += c

print(output)

