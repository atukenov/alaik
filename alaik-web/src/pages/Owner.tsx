import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ApiError } from '../lib/api';
import { useT, typeLabel } from '../lib/i18n';
import { coverStyle, formatPrice } from '../lib/format';
import { AppShell } from '../components/AppShell';
import { ProgressBar, TypeChip, Placeholder } from '../components/ui';
import { BackIcon, GiftIcon, PlusIcon, ShareIcon } from '../components/Icons';
import { shareLink } from '../lib/share';
import type { CreateItemInput, OwnerItem } from '../lib/types';

export default function Owner() {
  const t = useT();
  const nav = useNavigate();
  const qc = useQueryClient();
  const { id = '' } = useParams();
  const [toast, setToast] = useState('');
  const [editing, setEditing] = useState<OwnerItem | null>(null);
  const [adding, setAdding] = useState(false);

  const { data: ev, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: () => api.getEvent(id),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['event', id] });
    qc.invalidateQueries({ queryKey: ['events'] });
  };

  const del = useMutation({
    mutationFn: (itemId: string) => api.deleteItem(itemId),
    onSuccess: invalidate,
  });

  const share = async () => {
    if (!ev) return;
    // Guests open the link in a browser (no app needed). Inside the native app
    // window.location.origin is "https://localhost", so use the public web URL
    // when configured; on the web it falls back to the current origin.
    const base = import.meta.env.VITE_PUBLIC_WEB_URL || window.location.origin;
    const url = `${base.replace(/\/$/, '')}/e/${ev.slug}`;
    const copied = await shareLink(ev.title, url);
    if (copied) {
      setToast(t.linkCopied);
      setTimeout(() => setToast(''), 1800);
    }
  };

  if (isLoading || !ev) {
    return (
      <AppShell>
        <div className="py-24 text-center text-sm text-muted">…</div>
      </AppShell>
    );
  }

  const pct = ev.totalItems > 0 ? Math.round((ev.coveredItems / ev.totalItems) * 100) : 0;

  return (
    <AppShell>
      <div className="animate-fadein relative min-h-full pb-24">
        <div
          className="relative flex h-[170px] flex-col justify-between p-4 pb-4"
          style={coverStyle(ev.type)}
        >
          <button
            onClick={() => nav('/lists')}
            className="tapc flex h-10 w-10 items-center justify-center rounded-pill bg-white/70 backdrop-blur"
          >
            <BackIcon />
          </button>
          <div>
            <TypeChip label={typeLabel(t, ev.type)} />
            <h1 className="mt-2.5 text-[26px] font-extrabold leading-[1.02]">{ev.title}</h1>
          </div>
        </div>

        <div className="px-[18px] pt-4">
          <div className="rounded-card border border-line bg-card p-4 shadow-event">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-semibold">{t.ownerClosed}</span>
              <span className="text-lg font-extrabold text-accent">
                {ev.coveredItems} / {ev.totalItems}
              </span>
            </div>
            <ProgressBar pct={pct} className="mt-2.5" />
            <p className="mt-3 text-xs leading-[1.45] text-muted">{t.surprise}</p>
          </div>

          <div className="mt-3.5 flex gap-2.5">
            <button
              onClick={share}
              className="tapc flex h-12 flex-1 items-center justify-center gap-1.5 rounded-pill border-[1.5px] border-line bg-card text-[13px] font-semibold"
            >
              <ShareIcon size={16} />
              {t.share}
            </button>
          </div>

          <h2 className="section-label mx-1 mb-3 mt-[22px]">{t.gifts}</h2>

          {ev.items.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted">{t.noItems}</div>
          ) : (
            <div className="flex flex-col gap-[11px]">
              {ev.items.map((it) => (
                <div
                  key={it.id}
                  className="flex gap-3 rounded-gift border border-line bg-card p-[11px]"
                >
                  <Placeholder
                    icon={<GiftIcon size={24} />}
                    src={it.imageUrl}
                    className="h-[60px] w-[60px] flex-none rounded-[14px]"
                  />
                  <div className="flex min-w-0 flex-1 flex-col justify-center">
                    <span className="text-sm font-semibold leading-tight">{it.title}</span>
                    {it.price != null && (
                      <span className="mt-1 text-[13px] font-bold">
                        {formatPrice(it.price, it.currency)}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setEditing(it)}
                    className="tapc self-center px-1 text-lg font-bold text-muted"
                    aria-label="edit"
                  >
                    ⋯
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-bg from-[66%] to-transparent p-[18px] pb-6">
          <button onClick={() => setAdding(true)} className="btn-primary !h-[52px]">
            <PlusIcon size={18} />
            {t.addGift}
          </button>
        </div>

        {toast && (
          <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-pill bg-text px-4 py-2 text-[13px] font-medium text-white">
            {toast}
          </div>
        )}

        {(adding || editing) && (
          <ItemModal
            eventId={id}
            item={editing}
            onClose={() => {
              setAdding(false);
              setEditing(null);
            }}
            onDelete={
              editing
                ? () => {
                    del.mutate(editing.id);
                    setEditing(null);
                  }
                : undefined
            }
          />
        )}
      </div>
    </AppShell>
  );
}

function ItemModal({
  eventId,
  item,
  onClose,
  onDelete,
}: {
  eventId: string;
  item: OwnerItem | null;
  onClose: () => void;
  onDelete?: () => void;
}) {
  const t = useT();
  const qc = useQueryClient();
  const nav = useNavigate();
  const [title, setTitle] = useState(item?.title ?? '');
  const [store, setStore] = useState(item?.store ?? '');
  const [price, setPrice] = useState(item?.price != null ? String(item.price) : '');
  const [link, setLink] = useState(item?.purchaseLink ?? '');
  const [imageUrl, setImageUrl] = useState<string | null>(item?.imageUrl ?? null);
  const [previewing, setPreviewing] = useState(false);
  const [noPhoto, setNoPhoto] = useState(false);
  const lastPreviewed = useRef('');

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['event', eventId] });
    qc.invalidateQueries({ queryKey: ['events'] });
  };

  // Pull photo/title/store/price from the pasted product link (server-side scrape).
  const fetchPreview = async () => {
    const url = link.trim();
    if (!url || url === lastPreviewed.current) return;
    lastPreviewed.current = url;
    setPreviewing(true);
    setNoPhoto(false);
    try {
      const p = await api.previewLink(url);
      if (p.imageUrl) setImageUrl(p.imageUrl);
      if (p.store && !store.trim()) setStore(p.store);
      if (p.title && !title.trim()) setTitle(p.title);
      if (p.price != null && !price) setPrice(String(p.price));
      // Nothing came back (marketplace blocks scraping) → prompt manual photo URL.
      if (!p.imageUrl && !imageUrl) setNoPhoto(true);
    } catch {
      setNoPhoto(true);
    } finally {
      setPreviewing(false);
    }
  };

  const payload = (): CreateItemInput => ({
    title: title.trim(),
    store: store.trim() || null,
    imageUrl,
    price: price ? Number(price.replace(/\s/g, '')) : null,
    currency: 'KZT',
    purchaseLink: link.trim() || null,
    priority: item?.priority ?? 0,
  });

  const save = useMutation({
    mutationFn: async () => {
      if (item) await api.updateItem(item.id, payload());
      else await api.addItem(eventId, payload());
    },
    onSuccess: () => {
      invalidate();
      onClose();
    },
    onError: (err) => {
      if (err instanceof ApiError && err.status === 402) {
        const code = (err.body as { error?: string } | null)?.error ?? 'free_limit_gifts';
        onClose();
        nav(`/plus?reason=${code}`);
      }
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30" onClick={onClose}>
      <div
        className="w-full max-w-[430px] animate-fadein rounded-t-[28px] bg-bg p-5 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line" />

        {(imageUrl || previewing) && (
          <div className="mb-3 flex items-center gap-3">
            <Placeholder
              src={imageUrl}
              icon={<GiftIcon size={26} />}
              className="h-16 w-16 flex-none rounded-2xl"
            />
            <span className="text-xs font-medium text-muted">
              {previewing ? t.linkLoading : t.linkPhotoFound}
            </span>
          </div>
        )}

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t.itemTitle}
          className="field mb-3 h-[50px]"
          autoFocus
        />
        <input
          value={store}
          onChange={(e) => setStore(e.target.value)}
          placeholder={t.itemStore}
          className="field mb-3 h-[50px]"
        />
        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          inputMode="numeric"
          placeholder={t.itemPrice}
          className="field mb-3 h-[50px]"
        />
        <div className="mb-1 flex gap-2">
          <input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            onBlur={fetchPreview}
            onKeyDown={(e) => e.key === 'Enter' && fetchPreview()}
            inputMode="url"
            placeholder={t.itemLink}
            className="field h-[50px] flex-1"
          />
          {link.trim() && (
            <button
              onClick={fetchPreview}
              disabled={previewing}
              className="tapc flex-none rounded-field bg-card2 px-4 text-[13px] font-semibold text-text"
            >
              {previewing ? '…' : t.linkFetch}
            </button>
          )}
        </div>
        <p className="mb-3 px-1 text-[11px] text-muted">{t.linkHint}</p>

        {(noPhoto || (imageUrl && !previewing)) && (
          <>
            {noPhoto && (
              <p className="mb-2 px-1 text-[11px] font-medium text-accent">{t.linkNoPhoto}</p>
            )}
            <input
              value={imageUrl ?? ''}
              onChange={(e) => setImageUrl(e.target.value.trim() || null)}
              inputMode="url"
              placeholder={t.itemImage}
              className="field mb-4 h-[50px]"
            />
          </>
        )}
        <button
          onClick={() => save.mutate()}
          disabled={!title.trim() || save.isPending}
          className="btn-primary"
        >
          {t.save}
        </button>
        {onDelete && (
          <button
            onClick={onDelete}
            className="tapc mt-3 h-11 w-full rounded-pill text-sm font-semibold text-accent"
          >
            {t.delete}
          </button>
        )}
      </div>
    </div>
  );
}
