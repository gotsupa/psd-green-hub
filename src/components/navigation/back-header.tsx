'use client'

import { LuArrowLeft } from 'react-icons/lu'

import { useRouter } from 'next/navigation'

import { Button } from '~/components/ui/button'

export function BackHeader() {
  const router = useRouter()

  return (
    <Button
      className="h-auto w-fit gap-2 border-0 p-0 transition-opacity hover:border-0 hover:bg-transparent hover:opacity-80"
      onClick={() => router.back()}
      type="button"
      variant="ghost"
    >
      <LuArrowLeft className="text-primary size-5" data-icon="inline-start" />
      <span className="text-lg font-semibold">ย้อนกลับ</span>
    </Button>
  )
}
