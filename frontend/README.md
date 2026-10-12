# Otok znanja – frontend

React frontend fakultetnega projekta. Ta prvi korak vsebuje ogrodje, osnovno
navigacijo in prazne strani. Backend in Godot igro razvijajo drugi člani ekipe.

## Zagon

Ukaze izvajaj iz `frontend/`:

```sh
npm ci
npm run dev
```

Odpri lokalni naslov, ki ga izpiše Vite (običajno `http://localhost:5173`).
Za produkcijsko različico uporabi `npm run build` in nato `npm run preview`.
Statični strežnik mora za poti aplikacije vračati `index.html`, ker uporabljamo
React Router z zgodovino brskalnika.

Uporabljene različice:

| Orodje | Različica |
| --- | --- |
| React / React DOM | 19.3.0 / 19.3.0 |
| Vite / React plugin | 8.3.4 / 6.1.2 |
| TypeScript | 6.0.3 |
| React Router DOM | 7.18.4 |
| ESLint | 10.12.0 |
| Node.js pri preverjanju | 20.20.2 |
| npm pri namestitvi | 10.9.9 |

Vite zahteva Node.js `^20.19.0 || >=22.12.0`. Uporabi tudi različico npm,
združljivo s svojim Node.js. V tem okolju je sistemski npm 12 nezdružljiv z
Node.js 20, zato je bil za namestitev uporabljen npm 10 iz začasne mape zunaj
repozitorija. Natančne različice odvisnosti so zapisane v `package-lock.json`.
TypeScript 6.0.3 je izbran zaradi združljivosti s `typescript-eslint` 8.71.2,
ki podpira TypeScript `<6.1.0`.

Stabilni različici Reacta in React DOM sta bili pred namestitvijo preverjeni
v npm 12. oktobra 2026. Pregledana sta bila tudi
[uradna dokumentacija Reacta](https://react.dev/learn/creating-a-react-app) in
[Vite guide](https://vite.dev/guide/).

## Preverjanja

```sh
npm run typecheck
npm run lint
npm run build
```

Za ročni pregled preveri širini približno 1440 in 375 px: začetno stran,
povezavo »Za učitelje«, prehod do praznega urejevalnika in nazaj, predogled,
tipkovnico (Tab, Enter, preskok na vsebino), osvežitev neposrednih poti,
Back/Forward in neznano pot. Dekoracije SVG/CSS so statične, ključne povezave
se ne premikajo. Vmesnik in gumbi so pravi HTML elementi.

Pri prvem koraku so typecheck, lint in build uspeli. V Firefoxu 157.0.1 so
bile pri 1440, 375 in 320 px preverjene vse poti brez vodoravnega prelivanja,
minimalna višina povezav 44 px, preskok na vsebino s Tab/Enter, vidni fokus,
prehodi med stranmi, prenos fokusa, Back/Forward in osvežitev. Posnetki
začetne ter učiteljske strani pri 1440 in 375 px so bili vizualno pregledani
glede na priloženo referenco; grafika je za ta korak poenostavljena.

## Trenutni obseg in poti

| Pot | Vsebina prvega koraka |
| --- | --- |
| `/` | Osnovna otroška stran z dekorativnimi baloni in kartico igre |
| `/teachers` | Prazna učiteljska stran |
| `/teachers/collections/new` | Prazna stran za novo zbirko |
| `/teachers/collections/:collectionId/edit` | Prazna stran za urejanje |
| `/preview` | Obvestilo o prihodnjem statičnem predogledu |
| Neznana pot | Obvestilo in povezava na začetno stran |

Zbirke, obrazci, shranjevanje, uvoz/izvoz in dejanski predogled še niso
implementirani. Ni prijave, API klicev ali zagona igre. Obstoječi izvoz v
`games/` se v tem koraku ne vgrajuje: za povezavo je potreben dogovor ekipe o
web buildu in prenosu podatkov.

## Načrt in meje MVP-ja

Koraki so objavljeni kot GitHub issues; implementira se samo en naenkrat:

1. [Set up React frontend #5](https://github.com/poucno/Website/issues/5)
2. [Add collection dashboard #8](https://github.com/poucno/Website/issues/8)
3. [Add question editor #9](https://github.com/poucno/Website/issues/9)
4. [Add JSON import and export #10](https://github.com/poucno/Website/issues/10)
5. [Add question preview #11](https://github.com/poucno/Website/issues/11)

Dashboard bo uporabljal `localStorage` za zbirke in nastavitve demonstracije.
Podatki bodo vezani na isti brskalnik in izvor; niso sinhronizirani ali
zaščiteni kot učiteljski račun. Branje in zapis bosta v eni majhni datoteki
`collectionsStorage.ts`. Napake ne smejo tiho prepisati podatkov ali prikazati
lažnega uspešnega shranjevanja. Lokalno shranjevanje še ni vključeno.

Začetni JSON dogovor iz navodil: `version: 1`, `title`, `subject`, `grade`
(1–9), `settings` (`shuffleQuestions`, `movingBalloons`) in `questions`.
Vsako vprašanje ima unikaten `id`, `text`, natanko tri odgovore (`id`, `text`),
`correctAnswerId` in neobvezen `hint`. ID-ji ostanejo stabilni; ID lokalne
zbirke ni del izvoza. Obvezne vrednosti niso prazne, odgovori so po obrezovanju
presledkov različni in zbirka vsebuje najmanj eno vprašanje. Omejitve dolžin
so naslov 80, vprašanje 200, odgovor 40 in namig 200 znakov zaradi prostora
v vmesniku in na balonih. Uvoz bo ustvaril novo zbirko. Primer JSON-a in
testi validacije ter povratnega uvoza/izvoza sledijo v ustreznih korakih.

FastAPI povezava in Godot integracija sta ločena poznejša koraka, odvisna od
dejanske API pogodbe oziroma delujočega web builda. Frontend ne predpostavlja
endpointov. Spremembe po vsakem koraku ostanejo v lokalnem commitu za pregled;
push, merge in objava zahtevajo nadaljnje navodilo.
