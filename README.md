# StarCatcher

Expo Router дээр суурилсан жижиг reaction game.

## Ашиглах

```bash
npm install
npx expo start
```

## Бүтэц

- `app/` route entry болон app shell
- `components/game/` menu, board, modal, star component-ууд
- `constants/` theme болон game config
- `types/` shared type-ууд
- `utils/` game helper функцууд

## Тоглоомын логик

- 4x4 grid дээр одууд random байдлаар гарна
- Шар, цэнхэр, улаан од өөр өөр оноотой
- 3 дараалсан барилтаас хойш combo x2 идэвхжинэ
- Хүндрэл бүр тусдаа рекорд хадгална
