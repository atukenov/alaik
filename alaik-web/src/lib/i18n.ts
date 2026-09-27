import type { EventType } from './types';
import { useUi } from '../store/ui';

interface Onb {
  t: string;
  d: string;
}

export interface Dict {
  skip: string;
  next: string;
  start: string;
  continue: string;
  ob: Onb[];
  authTitle: string;
  authSub: string;
  phone: string;
  otpTitle: string;
  otpSub: string;
  resend: string;
  confirm: string;
  hi: string; // "Привет, {name}" — {name} placeholder
  segMine: string;
  segReserved: string;
  tabLists: string;
  tabProfile: string;
  wizTitle: string;
  wizType: string;
  fTitle: string;
  fDate: string;
  create2: string;
  ownerClosed: string;
  surprise: string;
  addGift: string;
  share: string;
  gifts: string;
  gFrom: string;
  reserve: string;
  reserved: string;
  cancel: string;
  chosen: string;
  shareList: string;
  pMyEvents: string;
  pReserved: string;
  language: string;
  settings: string;
  notif: string;
  help: string;
  logout: string;
  editP: string;
  itemsW: string;
  closedW: string;
  reservedByYou: string;
  empty: string;
  emptyReserved: string;
  noItems: string;
  addFirst: string;
  itemTitle: string;
  itemStore: string;
  itemPrice: string;
  itemLink: string;
  save: string;
  linkCopied: string;
  delete: string;
  linkFetch: string;
  linkHint: string;
  linkLoading: string;
  linkPhotoFound: string;
  linkNoPhoto: string;
  itemImage: string;
  openStore: string;
  oneOnly: string;
  oneChosen: string;
  limitReached: string;
  alreadyTaken: string;
  loginTitle: string;
  loginSub: string;
  registerTitle: string;
  registerSub: string;
  loginCta: string;
  registerCta: string;
  haveAccount: string;
  noAccount: string;
  fName: string;
  fEmail: string;
  fPassword: string;
  errEmail: string;
  errPassword: string;
  errEmailTaken: string;
  errCredentials: string;
  errGeneric: string;
  email: string;
  deleteAccount: string;
  deleteAccountConfirm: string;
  confirmDelete: string;
  cancelBtn: string;
  notifTitle: string;
  notifEmpty: string;
  adLabel: string;
  adRemove: string;
  plusCta: string;
  plusRow: string;
  plusTagline: string;
  plusB1: string;
  plusB2: string;
  plusB3: string;
  plusB4: string;
  plusB5: string;
  plusActive: string;
  plusNotReady: string;
  plusLegal: string;
  limitEvents: string;
  limitGifts: string;
  premiumTitle: string;
  planPlus: string;
  planMax: string;
  planPlusDesc: string;
  planMaxDesc: string;
  planPlusPrice: string;
  planMaxPrice: string;
  subscribeCta: string;
  restoreCta: string;
  currentTierLabel: string;
  types: Record<Exclude<EventType, 'Custom'> | 'custom', string>;
}

export const tr: Record<'ru' | 'kz' | 'en', Dict> = {
  ru: {
    skip: 'Пропустить', next: 'Далее', start: 'Начать', continue: 'Продолжить',
    ob: [
      { t: 'Дарите то, что ждут', d: 'Alaik — тёплый список желаний к любому событию. Без дублей и неловких подарков.' },
      { t: 'Поделитесь ссылкой', d: 'Отправьте список близким одним касанием — регистрация им не нужна.' },
      { t: 'Сюрприз под защитой', d: 'Гости бронируют подарки, а вы видите только процент закрытых позиций.' },
    ],
    authTitle: 'Вход в Alaik', authSub: 'Введите номер телефона — пришлём код подтверждения', phone: 'Номер телефона',
    otpTitle: 'Введите код', otpSub: 'Мы отправили 4-значный код на', resend: 'Отправить снова', confirm: 'Подтвердить',
    hi: 'Привет, {name}', segMine: 'Мои', segReserved: 'Где бронировал', tabLists: 'Списки', tabProfile: 'Профиль',
    wizTitle: 'Новое событие', wizType: 'Выберите тип события', fTitle: 'Название', fDate: 'Дата', create2: 'Создать список',
    ownerClosed: 'Закрыто позиций', surprise: 'Кто именно забронировал — скрыто. Сюрприз останется сюрпризом.', addGift: 'Добавить подарок', share: 'Поделиться', gifts: 'Подарки',
    gFrom: 'Список от', reserve: 'Забронировать', reserved: 'Забронировано', cancel: 'отменить', chosen: 'Выбрано подарков', shareList: 'Поделиться списком',
    pMyEvents: 'Мои события', pReserved: 'Брони', language: 'Язык', settings: 'Настройки', notif: 'Уведомления', help: 'Помощь', logout: 'Выйти', editP: 'Изменить',
    itemsW: 'позиций', closedW: 'закрыто', reservedByYou: 'забронировано вами',
    empty: 'Пока нет событий. Создайте первое!', emptyReserved: 'Вы ещё ничего не бронировали.',
    noItems: 'Пока нет подарков.', addFirst: 'Добавьте первый подарок', itemTitle: 'Название подарка', itemStore: 'Магазин', itemPrice: 'Цена, ₸', itemLink: 'Ссылка на товар', save: 'Сохранить', linkCopied: 'Ссылка скопирована', delete: 'Удалить',
    linkFetch: 'Подтянуть', linkHint: 'Вставьте ссылку — подтянем фото и название автоматически', linkLoading: 'Загружаем фото…', linkPhotoFound: 'Фото добавлено из ссылки', linkNoPhoto: 'Фото не подтянулось (магазин закрыл доступ). Вставьте ссылку на фото вручную ниже.', itemImage: 'Ссылка на фото', openStore: 'Открыть в магазине',
    oneOnly: 'Один подарок на гостя', oneChosen: 'Вы выбрали подарок', limitReached: 'Можно забронировать только один подарок в списке', alreadyTaken: 'Этот подарок уже забронировали',
    loginTitle: 'Вход в Alaik', loginSub: 'Введите email и пароль', registerTitle: 'Регистрация', registerSub: 'Создайте аккаунт по email', loginCta: 'Войти', registerCta: 'Зарегистрироваться', haveAccount: 'Уже есть аккаунт?', noAccount: 'Нет аккаунта?',
    fName: 'Имя', fEmail: 'Email', fPassword: 'Пароль', errEmail: 'Неверный email', errPassword: 'Пароль не короче 6 символов', errEmailTaken: 'Этот email уже занят', errCredentials: 'Неверный email или пароль', errGeneric: 'Что-то пошло не так',
    email: 'Email', deleteAccount: 'Удалить аккаунт', deleteAccountConfirm: 'Удалить аккаунт навсегда? Ваши события и подарки будут удалены. Отменить нельзя.', confirmDelete: 'Удалить', cancelBtn: 'Отмена', notifTitle: 'Уведомления', notifEmpty: 'Пока нет уведомлений',
    adLabel: 'Реклама', adRemove: 'Уберите рекламу с Alaik Plus', plusCta: 'Plus', plusRow: 'Alaik Plus',
    plusTagline: 'Больше возможностей, без рекламы', plusB1: 'Без рекламы', plusB2: 'Неограниченно событий и подарков', plusB3: 'Свои фото для обложек', plusB4: 'Совместные списки с со-организаторами', plusB5: 'Напоминания и премиум-темы',
    plusActive: 'Подписка активна ✨', plusNotReady: 'Оплата ещё не подключена на этом устройстве', plusLegal: 'Оплата спишется с вашего Apple ID. Подписка продлевается автоматически, отмена — в настройках Apple ID.',
    limitEvents: 'Лимит событий достигнут. Оформите подписку, чтобы создавать больше.', limitGifts: 'Лимит подарков достигнут. Оформите подписку, чтобы добавлять больше.',
    premiumTitle: 'Выберите тариф', planPlus: 'Alaik Plus', planMax: 'Alaik Max', planPlusDesc: '3 события · 20 подарков в событии', planMaxDesc: 'Без ограничений на события и подарки',
    planPlusPrice: '₸990 / мес', planMaxPrice: '₸1 990 / мес', subscribeCta: 'Оформить подписку', restoreCta: 'Восстановить покупки', currentTierLabel: 'Ваш тариф',
    types: { Wedding: 'Свадьба', Birthday: 'День рождения', BabyShower: 'Рождение ребёнка', Housewarming: 'Новоселье', custom: 'Другое' },
  },
  kz: {
    skip: 'Өткізу', next: 'Әрі қарай', start: 'Бастау', continue: 'Жалғастыру',
    ob: [
      { t: 'Күтілген сыйлық сыйлаңыз', d: 'Alaik — кез келген оқиғаға арналған жылы тілектер тізімі. Қайталанбай, ыңғайсыз сыйлықсыз.' },
      { t: 'Сілтемемен бөлісіңіз', d: 'Тізімді жақындарыңызға бір рет түртіп жіберіңіз — оларға тіркелу қажет емес.' },
      { t: 'Тосынсый қорғауда', d: 'Қонақтар сыйлық брондайды, ал сіз тек жабылған позиция пайызын көресіз.' },
    ],
    authTitle: 'Alaik-ке кіру', authSub: 'Телефон нөміріңізді енгізіңіз — растау кодын жібереміз', phone: 'Телефон нөмірі',
    otpTitle: 'Кодты енгізіңіз', otpSub: 'Біз 4 таңбалы кодты жібердік', resend: 'Қайта жіберу', confirm: 'Растау',
    hi: 'Сәлем, {name}', segMine: 'Менің', segReserved: 'Брондағаным', tabLists: 'Тізімдер', tabProfile: 'Профиль',
    wizTitle: 'Жаңа оқиға', wizType: 'Оқиға түрін таңдаңыз', fTitle: 'Атауы', fDate: 'Күні', create2: 'Тізім құру',
    ownerClosed: 'Жабылған позициялар', surprise: 'Кім брондағаны жасырын. Тосынсый сол қалпында қалады.', addGift: 'Сыйлық қосу', share: 'Бөлісу', gifts: 'Сыйлықтар',
    gFrom: 'Тізім иесі', reserve: 'Брондау', reserved: 'Броньдалған', cancel: 'болдырмау', chosen: 'Таңдалған сыйлықтар', shareList: 'Тізіммен бөлісу',
    pMyEvents: 'Оқиғаларым', pReserved: 'Брондар', language: 'Тіл', settings: 'Баптаулар', notif: 'Хабарламалар', help: 'Көмек', logout: 'Шығу', editP: 'Өңдеу',
    itemsW: 'позиция', closedW: 'жабылды', reservedByYou: 'сіз брондадыңыз',
    empty: 'Әзірге оқиға жоқ. Алғашқысын жасаңыз!', emptyReserved: 'Сіз әлі ештеңе брондаған жоқсыз.',
    noItems: 'Әзірге сыйлық жоқ.', addFirst: 'Алғашқы сыйлықты қосыңыз', itemTitle: 'Сыйлық атауы', itemStore: 'Дүкен', itemPrice: 'Бағасы, ₸', itemLink: 'Тауар сілтемесі', save: 'Сақтау', linkCopied: 'Сілтеме көшірілді', delete: 'Жою',
    linkFetch: 'Тарту', linkHint: 'Сілтемені қойыңыз — фото мен атауын автоматты аламыз', linkLoading: 'Фото жүктелуде…', linkPhotoFound: 'Фото сілтемеден қосылды', linkNoPhoto: 'Фото тартылмады (дүкен рұқсат бермеді). Төменде фото сілтемесін қолмен қойыңыз.', itemImage: 'Фото сілтемесі', openStore: 'Дүкенде ашу',
    oneOnly: 'Бір қонаққа бір сыйлық', oneChosen: 'Сіз сыйлық таңдадыңыз', limitReached: 'Тізімде тек бір сыйлық брондауға болады', alreadyTaken: 'Бұл сыйлық брондалып қойған',
    loginTitle: 'Alaik-ке кіру', loginSub: 'Email және құпиясөзді енгізіңіз', registerTitle: 'Тіркелу', registerSub: 'Email арқылы аккаунт жасаңыз', loginCta: 'Кіру', registerCta: 'Тіркелу', haveAccount: 'Аккаунтыңыз бар ма?', noAccount: 'Аккаунт жоқ па?',
    fName: 'Аты', fEmail: 'Email', fPassword: 'Құпиясөз', errEmail: 'Қате email', errPassword: 'Құпиясөз кемінде 6 таңба', errEmailTaken: 'Бұл email бос емес', errCredentials: 'Email не құпиясөз қате', errGeneric: 'Бірдеңе дұрыс болмады',
    email: 'Email', deleteAccount: 'Аккаунтты жою', deleteAccountConfirm: 'Аккаунт біржола жойылсын ба? Оқиғалар мен сыйлықтар жойылады. Қайтару мүмкін емес.', confirmDelete: 'Жою', cancelBtn: 'Болдырмау', notifTitle: 'Хабарламалар', notifEmpty: 'Әзірге хабарлама жоқ',
    adLabel: 'Жарнама', adRemove: 'Alaik Plus-пен жарнаманы өшіріңіз', plusCta: 'Plus', plusRow: 'Alaik Plus',
    plusTagline: 'Көбірек мүмкіндік, жарнамасыз', plusB1: 'Жарнамасыз', plusB2: 'Шексіз оқиға мен сыйлық', plusB3: 'Мұқабаға өз фотоңыз', plusB4: 'Со-ұйымдастырушылармен ортақ тізім', plusB5: 'Еске салулар мен премиум тақырыптар',
    plusActive: 'Жазылым белсенді ✨', plusNotReady: 'Бұл құрылғыда төлем әлі қосылмаған', plusLegal: 'Төлем Apple ID-ден шешіледі. Жазылым автоматты жаңарады, бас тарту — Apple ID баптауларында.',
    limitEvents: 'Оқиға лимиті бітті. Көбірек құру үшін жазылыңыз.', limitGifts: 'Сыйлық лимиті бітті. Көбірек қосу үшін жазылыңыз.',
    premiumTitle: 'Тарифті таңдаңыз', planPlus: 'Alaik Plus', planMax: 'Alaik Max', planPlusDesc: '3 оқиға · оқиғада 20 сыйлық', planMaxDesc: 'Оқиға мен сыйлыққа шек жоқ',
    planPlusPrice: '₸990 / ай', planMaxPrice: '₸1 990 / ай', subscribeCta: 'Жазылу', restoreCta: 'Сатып алуларды қалпына келтіру', currentTierLabel: 'Сіздің тарифіңіз',
    types: { Wedding: 'Той', Birthday: 'Туған күн', BabyShower: 'Бөбек тойы', Housewarming: 'Үй той', custom: 'Басқа' },
  },
  en: {
    skip: 'Skip', next: 'Next', start: 'Get started', continue: 'Continue',
    ob: [
      { t: 'Give what they truly want', d: 'Alaik is a warm wishlist for any celebration. No duplicates, no awkward gifts.' },
      { t: 'Share a single link', d: 'Send the list to friends and family in one tap — no sign-up needed for them.' },
      { t: 'The surprise stays safe', d: 'Guests reserve gifts while you only see the percentage of items covered.' },
    ],
    authTitle: 'Sign in to Alaik', authSub: "Enter your phone number — we'll text you a code", phone: 'Phone number',
    otpTitle: 'Enter the code', otpSub: 'We sent a 4-digit code to', resend: 'Resend code', confirm: 'Confirm',
    hi: 'Hi, {name}', segMine: 'Mine', segReserved: 'Reserved', tabLists: 'Lists', tabProfile: 'Profile',
    wizTitle: 'New event', wizType: 'Choose event type', fTitle: 'Title', fDate: 'Date', create2: 'Create list',
    ownerClosed: 'Items covered', surprise: 'Who reserved what stays hidden. The surprise remains a surprise.', addGift: 'Add gift', share: 'Share', gifts: 'Gifts',
    gFrom: 'List by', reserve: 'Reserve', reserved: 'Reserved', cancel: 'cancel', chosen: 'Gifts chosen', shareList: 'Share list',
    pMyEvents: 'My events', pReserved: 'Reserved', language: 'Language', settings: 'Settings', notif: 'Notifications', help: 'Help', logout: 'Log out', editP: 'Edit',
    itemsW: 'items', closedW: 'covered', reservedByYou: 'reserved by you',
    empty: 'No events yet. Create your first one!', emptyReserved: "You haven't reserved anything yet.",
    noItems: 'No gifts yet.', addFirst: 'Add the first gift', itemTitle: 'Gift title', itemStore: 'Store', itemPrice: 'Price, ₸', itemLink: 'Product link', save: 'Save', linkCopied: 'Link copied', delete: 'Delete',
    linkFetch: 'Fetch', linkHint: 'Paste a link — we’ll pull the photo and title automatically', linkLoading: 'Loading photo…', linkPhotoFound: 'Photo added from link', linkNoPhoto: 'Couldn’t fetch the photo (the store blocks it). Paste a photo URL manually below.', itemImage: 'Photo URL', openStore: 'Open in store',
    oneOnly: 'One gift per guest', oneChosen: 'You’ve chosen a gift', limitReached: 'You can reserve only one gift in this list', alreadyTaken: 'This gift was just taken',
    loginTitle: 'Sign in to Alaik', loginSub: 'Enter your email and password', registerTitle: 'Create account', registerSub: 'Sign up with your email', loginCta: 'Sign in', registerCta: 'Sign up', haveAccount: 'Already have an account?', noAccount: 'No account yet?',
    fName: 'Name', fEmail: 'Email', fPassword: 'Password', errEmail: 'Invalid email', errPassword: 'Password must be 6+ characters', errEmailTaken: 'That email is already taken', errCredentials: 'Wrong email or password', errGeneric: 'Something went wrong',
    email: 'Email', deleteAccount: 'Delete account', deleteAccountConfirm: 'Delete your account permanently? Your events and gifts will be removed. This cannot be undone.', confirmDelete: 'Delete', cancelBtn: 'Cancel', notifTitle: 'Notifications', notifEmpty: 'No notifications yet',
    adLabel: 'Ad', adRemove: 'Remove ads with Alaik Plus', plusCta: 'Plus', plusRow: 'Alaik Plus',
    plusTagline: 'More power, no ads', plusB1: 'No ads', plusB2: 'Unlimited events & gifts', plusB3: 'Custom cover photos', plusB4: 'Collaborative lists with co-hosts', plusB5: 'Reminders & premium themes',
    plusActive: 'Subscription active ✨', plusNotReady: 'Billing isn’t set up on this device yet', plusLegal: 'Billed to your Apple ID. Auto-renews; cancel anytime in your Apple ID settings.',
    limitEvents: 'Event limit reached. Subscribe to create more.', limitGifts: 'Gift limit reached. Subscribe to add more.',
    premiumTitle: 'Choose your plan', planPlus: 'Alaik Plus', planMax: 'Alaik Max', planPlusDesc: '3 events · 20 gifts per event', planMaxDesc: 'Unlimited events and gifts',
    planPlusPrice: '₸990 / mo', planMaxPrice: '₸1,990 / mo', subscribeCta: 'Subscribe', restoreCta: 'Restore purchases', currentTierLabel: 'Your plan',
    types: { Wedding: 'Wedding', Birthday: 'Birthday', BabyShower: 'Baby shower', Housewarming: 'Housewarming', custom: 'Custom' },
  },
};

export function useT(): Dict {
  const lang = useUi((s) => s.lang);
  return tr[lang];
}

export function typeLabel(d: Dict, type: EventType): string {
  return type === 'Custom' ? d.types.custom : d.types[type];
}
