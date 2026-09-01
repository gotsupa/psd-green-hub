'use client'

import { useMemo, useState } from 'react'

import { IconArrowUpRight, IconMaximize, IconPhoto } from '@tabler/icons-react'
import Image from 'next/image'
import Link from 'next/link'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { cn } from '~/lib/utils'

import {
  MEDIA_CATEGORY_LABELS,
  MEDIA_ITEMS,
  type MediaCategory,
  type MediaItem,
} from './media-gallery-data'
import { WasteSortPageShell } from './page-shell'

type MediaFilter = 'all' | MediaCategory

const MEDIA_FILTERS: { id: MediaFilter; label: string }[] = [
  { id: 'all', label: 'ทั้งหมด' },
  ...Object.entries(MEDIA_CATEGORY_LABELS).map(([id, label]) => ({
    id: id as MediaCategory,
    label,
  })),
]

export function MediaGalleryPage() {
  const [activeFilter, setActiveFilter] = useState<MediaFilter>('all')
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null)

  const visibleMedia = useMemo(
    () =>
      activeFilter === 'all'
        ? MEDIA_ITEMS
        : MEDIA_ITEMS.filter((media) => media.category === activeFilter),
    [activeFilter]
  )

  return (
    <WasteSortPageShell>
      <section className="border-b border-[#dfe4da] bg-[#f7f8f3]">
        <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-12">
          <header className="grid gap-5 border-b-2 border-[#111111] pb-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <div>
              <h1 className="text-4xl leading-tight font-bold tracking-[-0.03em] text-[#111111] sm:text-6xl">
                คลังสื่อสีเขียว
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[#4d5053] sm:text-lg">
                รวมโปสเตอร์และอินโฟกราฟิกด้านสิ่งแวดล้อม
                เลือกหัวข้อที่สนใจแล้วกดที่ภาพเพื่ออ่านรายละเอียดได้เต็มขนาด
              </p>
            </div>
            <p className="flex items-center gap-2 font-bold text-[#168542]">
              <IconPhoto aria-hidden="true" className="size-5" />
              {MEDIA_ITEMS.length} สื่อ
            </p>
          </header>

          <div className="sticky top-[73px] z-20 -mx-5 border-b border-[#dfe4da] bg-[#f7f8f3]/95 px-5 py-4 backdrop-blur sm:-mx-8 sm:px-8">
            <div
              aria-label="กรองคลังสื่อตามหัวข้อ"
              className="flex gap-2 overflow-x-auto pb-1"
              role="group"
            >
              {MEDIA_FILTERS.map((filter) => {
                const isActive = activeFilter === filter.id

                return (
                  <button
                    aria-pressed={isActive}
                    className={cn(
                      'rounded-base min-h-11 shrink-0 border-2 border-[#111111] bg-white px-4 py-2 text-sm font-bold text-[#111111] transition-[background-color,transform,box-shadow] focus-visible:ring-2 focus-visible:ring-[#111111] focus-visible:ring-offset-2 focus-visible:outline-none',
                      isActive
                        ? 'bg-[#5df591] shadow-[3px_3px_0_0_#111111]'
                        : 'hover:bg-[#e8f2df]'
                    )}
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                    type="button"
                  >
                    {filter.label}
                  </button>
                )
              })}
            </div>
          </div>

          <p aria-live="polite" className="mt-6 text-sm text-[#616668]">
            แสดง {visibleMedia.length} รายการ
          </p>

          <div className="mt-4 columns-1 gap-5 sm:columns-2 lg:columns-3">
            {visibleMedia.map((media, index) => (
              <button
                aria-label={`เปิดดู ${media.title}`}
                className="group neo-interactive mb-5 block w-full break-inside-avoid overflow-hidden bg-white text-left"
                key={media.image.src}
                onClick={() => setSelectedMedia(media)}
                type="button"
              >
                <span className="relative block overflow-hidden border-b-2 border-[#111111] bg-white">
                  <Image
                    alt={media.title}
                    className="h-auto w-full transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transition-none"
                    placeholder="blur"
                    priority={index < 3 || index === 15 || index === 25}
                    quality={72}
                    sizes="(min-width: 1024px) 352px, (min-width: 640px) calc(50vw - 44px), calc(100vw - 40px)"
                    src={media.image}
                  />
                  <span className="rounded-base absolute right-3 bottom-3 flex size-10 items-center justify-center border-2 border-[#111111] bg-[#5df591] text-[#111111] opacity-0 shadow-[2px_2px_0_0_#111111] transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                    <IconMaximize aria-hidden="true" className="size-5" />
                  </span>
                </span>
                <span className="flex items-start justify-between gap-3 p-4">
                  <span>
                    <span className="block text-xs font-bold text-[#168542]">
                      {MEDIA_CATEGORY_LABELS[media.category]}
                    </span>
                    <span className="mt-1 block leading-6 font-bold text-[#111111]">
                      {media.title}
                    </span>
                  </span>
                  <IconMaximize
                    aria-hidden="true"
                    className="mt-1 size-5 shrink-0 text-[#616668]"
                  />
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <Dialog
        onOpenChange={(isOpen) => {
          if (!isOpen) setSelectedMedia(null)
        }}
        open={Boolean(selectedMedia)}
      >
        {selectedMedia ? (
          <DialogContent className="max-h-[94dvh] max-w-[min(96vw,82rem)] gap-3 overflow-hidden border-[#111111] bg-[#111111] p-3 text-white shadow-[6px_6px_0_0_#5df591] sm:p-5">
            <DialogHeader className="sr-only">
              <DialogTitle>{selectedMedia.title}</DialogTitle>
              <DialogDescription>
                ภาพขนาดใหญ่ของ {selectedMedia.title}
              </DialogDescription>
            </DialogHeader>
            <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto">
              <Image
                alt={selectedMedia.title}
                className="max-h-[calc(94dvh-7rem)] w-auto max-w-full object-contain"
                priority
                quality={90}
                sizes="96vw"
                src={selectedMedia.image}
              />
            </div>
            <div className="flex flex-col gap-3 border-t border-white/20 pt-3 pr-10 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold text-[#5df591]">
                  {MEDIA_CATEGORY_LABELS[selectedMedia.category]}
                </p>
                <p className="mt-1 font-bold text-white">
                  {selectedMedia.title}
                </p>
              </div>
              <Link
                className="rounded-base inline-flex min-h-11 shrink-0 items-center justify-center gap-2 border-2 border-[#111111] bg-[#5df591] px-4 py-2 font-bold text-[#111111] focus-visible:ring-2 focus-visible:ring-[#5df591] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111111] focus-visible:outline-none"
                href={selectedMedia.image.src}
                rel="noopener noreferrer"
                target="_blank"
              >
                เปิดภาพในแท็บใหม่
                <IconArrowUpRight aria-hidden="true" className="size-5" />
              </Link>
            </div>
          </DialogContent>
        ) : null}
      </Dialog>
    </WasteSortPageShell>
  )
}
