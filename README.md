# pavelkrotov.dev

Исходный код моего сайта-портфолио: [pavelkrotov.dev](https://pavelkrotov.dev)

Одностраничник без фреймворков и сборщика — один `index.html` со встроенными стилями и
скриптами плюс одна serverless-функция для формы обратной связи. Так сделано намеренно:
странице не нужен React, а отсутствие сборки означает отсутствие пайплайна, который может
сломаться между коммитом и продом.

## Что внутри

| Файл | Назначение |
|---|---|
| `index.html` | Вся страница: разметка, CSS, JS |
| `functions/api/contact.js` | Cloudflare Pages Function: форма → уведомление в Telegram |
| `avatar.jpg`, `og-banner-v7.png` | Аватар и карточка для соцсетей |

## Технически

- **Вёрстка** — CSS Grid и Flexbox, адаптив до 520 px, без внешних UI-библиотек.
- **Темы** — тёмная и светлая, выбор сохраняется в `localStorage`.
- **Анимации** — появление блоков через `IntersectionObserver`, с уважением к
  `prefers-reduced-motion`: при включённой настройке анимации отключаются полностью.
- **Форма обратной связи** — POST на `/api/contact`, серверная валидация, honeypot-поле
  против ботов, доставка сообщения в Telegram.
- **Секреты** — токен бота и chat id живут только в переменных окружения Cloudflare
  (`wrangler pages secret put`). В коде их нет и не было.
- **Хостинг** — Cloudflare Pages, домен в Cloudflare Registrar, HTTPS и www настроены.

## Деплой

```bash
# черновик
npx wrangler pages deploy public --project-name=portfolio-site --branch=draft
# прод
npx wrangler pages deploy public --project-name=portfolio-site --branch=master
```

Функции ищутся относительно текущего каталога, поэтому рядом с каталогом статики
должен лежать `functions/`.

## Контакты

Telegram: [@pavelWork0](https://t.me/pavelWork0)
