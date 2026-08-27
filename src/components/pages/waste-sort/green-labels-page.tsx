import {
  IconArrowUpRight,
  IconCircleCheck,
  IconLeaf,
} from '@tabler/icons-react'
import Image from 'next/image'
import Link from 'next/link'

import greenFlagInfo from '~/assets/images/green_flag_info.png'

import { WasteSortPageShell } from './page-shell'

const LABEL_GUIDE_STEPS = [
  'มองหาสัญลักษณ์บนบรรจุภัณฑ์หรือข้อมูลของผลิตภัณฑ์',
  'อ่านความหมายของฉลากให้ตรงกับสิ่งที่ต้องการเปรียบเทียบ',
  'ตรวจสอบหน่วยงานรับรองและข้อมูลล่าสุดก่อนตัดสินใจ',
]

export function GreenLabelsPage() {
  return (
    <WasteSortPageShell>
      <section className="border-b border-[#dfe4da] bg-[#f7f8f3]">
        <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14 lg:py-16">
          <header className="grid gap-8 border-b-2 border-[#111111] pb-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)] lg:items-end">
            <div>
              <p className="inline-flex items-center gap-2 font-bold text-[#168542]">
                <IconLeaf aria-hidden="true" className="size-5" />
                คู่มือเลือกผลิตภัณฑ์ที่เป็นมิตรต่อสิ่งแวดล้อม
              </p>
              <h1 className="mt-4 max-w-4xl text-4xl leading-tight font-bold tracking-[-0.03em] text-balance text-[#111111] sm:text-6xl">
                รู้จักฉลากสิ่งแวดล้อม{' '}
                <span className="text-[#168542]">ประเภทที่ 1</span>
              </h1>
            </div>
            <p className="max-w-xl text-base leading-7 text-[#4d5053] sm:text-lg sm:leading-8">
              รวมสัญลักษณ์สำคัญที่ใช้สื่อสารข้อมูลด้านสิ่งแวดล้อมในประเทศไทย
              เพื่อช่วยให้เลือกสินค้าและบริการได้อย่างเข้าใจมากขึ้น
            </p>
          </header>

          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start">
            <figure className="neo-card overflow-hidden bg-white p-3 sm:p-5">
              <Image
                alt="อินโฟกราฟิกฉลากสิ่งแวดล้อมประเภทที่ 1 และสัญลักษณ์สีเขียวที่ควรรู้"
                className="h-auto w-full"
                placeholder="blur"
                priority
                sizes="(min-width: 1024px) 768px, (min-width: 640px) calc(100vw - 64px), calc(100vw - 40px)"
                src={greenFlagInfo}
              />
              <figcaption className="mt-4 flex flex-col gap-4 border-t border-[#dfe4da] pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm leading-6 text-[#616668]">
                  อินโฟกราฟิกสรุปฉลากและความหมายเบื้องต้นสำหรับใช้เป็นแนวทาง
                </p>
                <Link
                  className="rounded-base inline-flex min-h-11 shrink-0 items-center justify-center gap-2 border-2 border-[#111111] bg-[#5df591] px-4 py-2 font-bold text-[#111111] shadow-[3px_3px_0_0_#111111] transition-[transform,box-shadow,background-color] hover:translate-x-[3px] hover:translate-y-[3px] hover:bg-[#49db7b] hover:shadow-none focus-visible:ring-2 focus-visible:ring-[#111111] focus-visible:ring-offset-2 focus-visible:outline-none"
                  href={greenFlagInfo.src}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  เปิดภาพขนาดเต็ม
                  <IconArrowUpRight aria-hidden="true" className="size-5" />
                </Link>
              </figcaption>
            </figure>

            <aside className="grid gap-5 lg:sticky lg:top-24">
              <section className="neo-card bg-white p-5">
                <span className="rounded-base flex size-11 items-center justify-center bg-[#111111] text-[#5df591]">
                  <IconLeaf aria-hidden="true" />
                </span>
                <h2 className="mt-5 text-2xl font-bold text-[#111111]">
                  ฉลากนี้ช่วยอะไร?
                </h2>
                <p className="mt-3 leading-7 text-[#4d5053]">
                  ช่วยสื่อสารคุณลักษณะด้านสิ่งแวดล้อมของสินค้า บริการ หรือองค์กร
                  ให้ผู้บริโภคใช้ประกอบการตัดสินใจได้ง่ายขึ้น
                </p>
              </section>

              <section className="neo-card bg-[#5df591] p-5">
                <h2 className="text-xl font-bold text-[#111111]">
                  วิธีใช้ข้อมูลในภาพ
                </h2>
                <ol className="mt-4 space-y-4">
                  {LABEL_GUIDE_STEPS.map((step, index) => (
                    <li className="flex items-start gap-3" key={step}>
                      <span className="rounded-base flex size-7 shrink-0 items-center justify-center bg-[#111111] text-sm font-bold text-white">
                        {index + 1}
                      </span>
                      <span className="pt-0.5 text-sm leading-6 font-semibold text-[#111111]">
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>
              </section>

              <p className="flex items-start gap-2 px-1 text-sm leading-6 text-[#616668]">
                <IconCircleCheck
                  aria-hidden="true"
                  className="mt-0.5 size-5 shrink-0 text-[#168542]"
                />
                ใช้ข้อมูลจากหน่วยงานผู้ออกฉลากเป็นแหล่งอ้างอิงหลักเสมอ
              </p>
            </aside>
          </div>
        </div>
      </section>
    </WasteSortPageShell>
  )
}
