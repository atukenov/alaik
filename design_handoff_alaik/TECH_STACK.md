# Alaik — технический стек, архитектура и скоуп MVP

Источник — исходное ТЗ проекта. Дизайн описан в `README.md`.

## Технический стек
- **Backend**: .NET 8, ASP.NET Core Web API, Entity Framework Core
- **База данных**: PostgreSQL *(либо SQL Server — см. открытые вопросы)*
- **Auth**: ASP.NET Core Identity + JWT (register/login/refresh), либо внешний провайдер *(уточнить)*
- **Frontend**: React + TypeScript, сборка через Vite
- **Мобильная обёртка**: Capacitor (iOS + Android) поверх собранного React-приложения
- **UI-кит**: Ionic React components (нативный мобильный вид внутри Capacitor) + Tailwind CSS для кастомной стилизации
- **Стейт/данные**: React Query (работа с API) + Zustand (локальный UI-стейт)
- **Формы**: react-hook-form + zod
- **Realtime** (опц., 2-й этап): SignalR для live-обновления броней

## Архитектура (high-level)
- **Alaik.Api** — ASP.NET Core Web API (контроллеры/минимал-API, DTO, аутентификация)
- **Alaik.Domain** — модели предметной области, интерфейсы
- **Alaik.Infrastructure** — EF Core DbContext, миграции, репозитории
- **alaik-web** — React + Vite фронтенд, оборачивается в Capacitor

## Роли
1. **Владелец списка** — создаёт событие и список подарков.
2. **Гость** — открывает список по публичной ссылке (без обязательной регистрации), бронирует подарок.

## Структура данных (EF Core, черновая)
- **User** — Id, Name, Phone/Email, AvatarUrl, CreatedAt
- **Event** — Id, OwnerId (FK→User), Title, Type (enum: Wedding/Birthday/BabyShower/Custom),
  EventDate, CoverImageUrl, Slug (уникальный, для публичной ссылки), CreatedAt
- **WishlistItem** — Id, EventId (FK), Title, Description, ImageUrl, Price, PurchaseLink, Priority, CreatedAt
- **Reservation** — Id, ItemId (FK), ReservedByUserId (nullable), ReservedByName (для незалогиненных
  гостей), ReservedAt, Status (enum: Reserved/Purchased/Cancelled)

## Скоуп MVP
### 1. Аутентификация
Регистрация/вход через телефон (OTP) или email *(уточнить)*; JWT + refresh-токен flow.

### 2. Создание события и списка
Мастер: тип события с шаблонными обложками/темами → добавление подарков вручную (название, фото,
цена, ссылка, описание). Опц.: парсинг og:title/og:image по ссылке на товар. Приоритет, редактирование, удаление.

### 3. Публичная ссылка и шаринг
Уникальный slug/URL (напр. `alaik.app/e/xxxxx`). Web Share API в браузере / нативный share через
Capacitor Share plugin на мобильных. Просмотр списка без обязательной регистрации.

### 4. Бронирование
Гость бронирует позицию — статус меняется для всех. **Владелец не видит, кто и что забронировал** —
сюрприз сохраняется, видит только процент «закрытых» позиций. Есть отмена брони.
Это инвариант приватности — соблюдать и на API (не отдавать владельцу reservedBy/детали), и в UI.

### 5. Профиль и мои списки
Список своих событий; список чужих событий, где что-то забронировано.

## Порядок работ (старт)
1. Solution: Alaik.Api / Alaik.Domain / Alaik.Infrastructure; EF Core + PostgreSQL; первая миграция.
2. JWT-аутентификация + базовые эндпоинты auth (register/login/refresh).
3. CRUD для Event и WishlistItem; эндпоинт бронирования с проверкой «не видно владельцу, кто забронировал».
4. Инициализация alaik-web (Vite + React + TS); Capacitor (`npx cap init`) + платформы ios/android.
5. Ionic React + Tailwind; базовая навигация (Ionic Router / React Router).
6. Экраны: онбординг → auth → таб-бар (Мои списки / Профиль) → создание события → список подарков →
   публичный экран гостя → профиль (дизайн — в `README.md` и прототипе).
7. CORS на API под Capacitor WebView origin.

## Открытые вопросы (решить до старта)
1. PostgreSQL или SQL Server?
2. Вход по OTP (SMS-провайдер, напр. Twilio) или email/пароль, или оба?
3. Где хостится backend (Azure / VPS / другое) — влияет на storage для картинок и т.д.?
4. Монетизация в MVP или всё бесплатно на старте?
5. iOS и Android сразу, или сначала одна платформа?
6. Многоязычность (kz/ru/en) в MVP или один язык? *(в дизайне заложены все три, дефолт — русский)*
