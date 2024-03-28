# Search Stats Extended

Like the new anki stats screen? Want more? This is the addon for you.

## The Graphs

### Future due types

![image](https://github.com/Luc-Mcgrady/Anki-New-Stats-Plus/assets/63685643/84ccc66d-7e1d-4fb7-9c12-0ad231e44fdd)

### Intra-Day Due 

![image](https://github.com/Luc-Mcgrady/Anki-Search-Stats-Extended/assets/63685643/fdab1f3f-c3bb-4a45-b8d4-f5544774d946)

### Todays Retention

![image](https://github.com/Luc-Mcgrady/Anki-New-Stats-Plus/assets/63685643/d34dd13e-32cc-49cc-ab46-871696f58c75)

### Custom Pie

![image](https://github.com/Luc-Mcgrady/Anki-New-Stats-Plus/assets/63685643/65c1e76b-89f0-4125-b6b3-4b5f4051592c)

### Interval/Load distribution

![image](https://github.com/Luc-Mcgrady/Anki-New-Stats-Plus/assets/63685643/ffe3cb58-ef01-4961-bca7-18c81b03f77d)

## Development

Building this with make addon works on linux and will probably work on mac 

Clone this repo recursively (It contains all anki's source files, sorry)
```
https://github.com/Luc-Mcgrady/Anki-Search-Stats-Extended.git --recursive
```

run make to setup source files

### Linux / Mac

```
make
``` 

Then every-time you make any changes run make again.

### Windows

You need to copy ./anki/sass to ./sass then generate the proto files by running

```sh
npm i
npx protoc \
    -I anki/proto \
    --es_out src/ts/proto \
    --es_opt target=ts \
    anki/proto/anki/*.proto \
```

Then whenever you want to build changes

```sh
npm run build
```
I haven't actually tested this so good luck.
Check the makefile for more information

------

Due to the way its set up you don't have to reload anki for javascript changes, you only have to run make/build again and reload the stats menu.

If you have any cool graph idea's then let me know or just pull request and make it yourself.
