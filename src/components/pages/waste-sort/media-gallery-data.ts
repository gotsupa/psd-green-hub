import type { StaticImageData } from 'next/image'

import zeroWaste3R from '~/assets/images/tabs-preview/1A3R.jpg'
import greenMeeting from '~/assets/images/tabs-preview/5-Green-Meeting-New.jpg'
import carbonCredit from '~/assets/images/tabs-preview/AW Carbon Credit_1040_1040 px.jpg'
import carbonCreditVsFootprint from '~/assets/images/tabs-preview/AW Carbon Credit Vs Carbon Footprint_1920_1080 px.jpg'
import carbonFootprint from '~/assets/images/tabs-preview/AW Carbon Footprint_1040_1040 px.jpg'
import carbonNeutrality from '~/assets/images/tabs-preview/AW Carbon Neutrality_1040_1040 px.jpg'
import carbonNeutralityVsNetZero from '~/assets/images/tabs-preview/AW Carbon Neutrality Vs Net Zero Emission_1920_1080 px.jpg'
import carbonCreditDevelopment from '~/assets/images/tabs-preview/AW Green House Effect - Carbon credit Development_1040_1040 px.jpg'
import carbonCreditMeaning from '~/assets/images/tabs-preview/AW Green House Effect - Carbon credit Meaning_1920_1080 px.jpg'
import greenhouseEveryday from '~/assets/images/tabs-preview/AW Green House Effect Everyday_New 1920_1080 px.jpg'
import greenhouseManagement from '~/assets/images/tabs-preview/AW Green House Effect Manage_1920_1080 px.jpg'
import zeroEmission from '~/assets/images/tabs-preview/AW Zero Emission_1040_1040 px.jpg'
import greenOrganization from '~/assets/images/tabs-preview/Green-Organization-SO.jpg'
import zeroWaste from '~/assets/images/tabs-preview/MEA--Zero-Waste.jpg'
import greenProcurement from '~/assets/images/tabs-preview/MEA-Green-Procurement.jpg'
import safety from '~/assets/images/tabs-preview/MEA-safety.jpg'
import organizationStandard from '~/assets/images/tabs-preview/poster1.jpg'
import efficientResources from '~/assets/images/tabs-preview/poster2.jpg'
import noPlastic from '~/assets/images/tabs-preview/poster3.jpg'
import greenProducts from '~/assets/images/tabs-preview/poster4 copy-01_0.jpg'
import sortBeforeDisposal from '~/assets/images/tabs-preview/poster4 copy2.jpg'
import wasteSeparation from '~/assets/images/tabs-preview/poster แยกขยะ A3(2).jpg'
import resourceIssues from '~/assets/images/tabs-preview/S__5775461_0.jpg'
import greenhouseGases from '~/assets/images/tabs-preview/S__6291572(1).png'
import greenhouseSources from '~/assets/images/tabs-preview/S__6291574(1).jpg'
import ecoLabeling from '~/assets/images/tabs-preview/S__6291578(1).jpg'
import greenDirectory from '~/assets/images/tabs-preview/เปิดบัญชีรายชื่อสินค้าและสถานที่จัดประช.jpg'
import wasteToEnergyB from '~/assets/images/tabs-preview/โปสเตอร์ waste to energy ขนาด A3(1).jpg'
import paperless from '~/assets/images/tabs-preview/ลดการใช้กระดาษ a3_0.jpg'
import reducePlastic from '~/assets/images/tabs-preview/ลดใช้พลาสติก เพื่อพิทักษ์โลกของเรากันเถอะ.jpg'

export type MediaCategory = 'carbon' | 'organization' | 'resources' | 'waste'

export type MediaItem = {
  category: MediaCategory
  image: StaticImageData
  title: string
}

export const MEDIA_CATEGORY_LABELS: Record<MediaCategory, string> = {
  carbon: 'คาร์บอนและภูมิอากาศ',
  organization: 'องค์กรสีเขียว',
  resources: 'พลังงานและทรัพยากร',
  waste: 'ขยะและรีไซเคิล',
}

export const MEDIA_ITEMS: MediaItem[] = [
  { category: 'waste', image: zeroWaste3R, title: 'หลัก 1A3R สู่ Zero Waste' },
  {
    category: 'organization',
    image: greenMeeting,
    title: 'แนวทาง Green Meeting',
  },
  {
    category: 'carbon',
    image: carbonCreditVsFootprint,
    title: 'Carbon Footprint กับ Carbon Credit',
  },
  {
    category: 'carbon',
    image: carbonCredit,
    title: 'ความหมายของ Carbon Credit',
  },
  {
    category: 'carbon',
    image: carbonFootprint,
    title: 'รู้จัก Carbon Footprint',
  },
  {
    category: 'carbon',
    image: carbonNeutralityVsNetZero,
    title: 'Carbon Neutrality กับ Net Zero Emission',
  },
  {
    category: 'carbon',
    image: carbonNeutrality,
    title: 'ภารกิจ Carbon Neutrality',
  },
  {
    category: 'carbon',
    image: carbonCreditDevelopment,
    title: 'การพัฒนา Carbon Credit',
  },
  {
    category: 'carbon',
    image: carbonCreditMeaning,
    title: 'Carbon Credit คืออะไร',
  },
  {
    category: 'carbon',
    image: greenhouseEveryday,
    title: 'ก๊าซเรือนกระจกในชีวิตประจำวัน',
  },
  {
    category: 'carbon',
    image: greenhouseManagement,
    title: 'แนวทางจัดการก๊าซเรือนกระจก',
  },
  { category: 'carbon', image: zeroEmission, title: 'มุ่งสู่ Zero Emission' },
  {
    category: 'organization',
    image: greenOrganization,
    title: 'ขับเคลื่อนองค์กรสู่ Green Organization',
  },
  { category: 'waste', image: zeroWaste, title: 'MEA Zero Waste คืออะไร' },
  {
    category: 'organization',
    image: greenProcurement,
    title: 'MEA Green Procurement',
  },
  { category: 'organization', image: safety, title: 'ความปลอดภัยในการทำงาน' },
  {
    category: 'resources',
    image: resourceIssues,
    title: 'ปัญหาด้านทรัพยากรและมลพิษ',
  },
  {
    category: 'carbon',
    image: greenhouseGases,
    title: 'ก๊าซเรือนกระจก 7 ชนิด',
  },
  {
    category: 'carbon',
    image: greenhouseSources,
    title: 'ก๊าซเรือนกระจกมาจากไหน',
  },
  {
    category: 'organization',
    image: ecoLabeling,
    title: 'รู้จักฉลากสิ่งแวดล้อม',
  },
  { category: 'waste', image: wasteSeparation, title: 'แยกขยะแต่ละชนิด' },
  {
    category: 'organization',
    image: organizationStandard,
    title: 'มาตรฐาน MEA Green Organization',
  },
  {
    category: 'resources',
    image: efficientResources,
    title: 'ใช้พลังงานและทรัพยากรอย่างมีประสิทธิภาพ',
  },
  { category: 'waste', image: noPlastic, title: 'MEA Say No to Plastic' },
  {
    category: 'organization',
    image: greenProducts,
    title: 'สินค้าและบริการที่เป็นมิตรกับสิ่งแวดล้อม',
  },
  { category: 'waste', image: sortBeforeDisposal, title: 'แยกก่อนทิ้ง' },
  {
    category: 'resources',
    image: paperless,
    title: 'ลดการใช้กระดาษสู่องค์กร Paperless',
  },
  {
    category: 'waste',
    image: reducePlastic,
    title: 'ลดใช้พลาสติกเพื่อพิทักษ์โลก',
  },
  {
    category: 'organization',
    image: greenDirectory,
    title: 'แหล่งข้อมูลสินค้าและสถานที่สีเขียว',
  },
  {
    category: 'waste',
    image: wasteToEnergyB,
    title: 'Waste to Energy: เปลี่ยนขยะเป็นพลังงาน',
  },
]
