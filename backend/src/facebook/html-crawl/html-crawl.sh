curl 'https://www.facebook.com/photo/?fbid=2772978292844339&%3Bset=a.120725628069632' --compressed \
-H 'User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/115.0' \
-H 'Accept: text/html,application/xhtml+xml' \
-H 'Cookie: usida=eyJ2ZXIiOjEsImlkIjoiQXM3dG90MjE0bzFwNjUiLCJ0aW1lIjoxNzA2MjAzNjI0fQ%3D%3D; datr=pm6xZQrn99qwGQywgFCEstWO; wd=3430x1246; sb=XVuyZd7BMPXIChFfTFOgQPam; oo=v1%7C3%3A1706277288; c_user=100073381562742; xs=12%3ABFTXMwVFDF8zmQ%3A2%3A1706277289%3A-1%3A11757%3A%3AAcVMDoLWRh_NI4668DN_SiuIhbbUY-fC5M7pW6imvQ; presence=C%7B%22t3%22%3A%5B%5D%2C%22utc3%22%3A1706281454473%2C%22v%22%3A1%7D' \
-H 'TE: trailers' | sed -E 's/src\=\"https/src\=\"\nhttps/g' | egrep '^https' | sed -E 's/\"(.*)//g'