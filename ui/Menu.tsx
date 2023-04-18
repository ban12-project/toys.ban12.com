'use client'

import Image from 'next/image'
import { useResponsive } from '@/hooks/useResponsive'
import HorizontalSlides from '@/ui/HorizontalSlides'

const List: React.FunctionComponent<{ types: string[] }> = ({ types }) => {
  return (
    <>
      {types.map((type, index) => (
        <div
          key={index}
          className="flex aspect-square w-[calc((100vw-2rem)/2)] flex-col items-center justify-center rounded-t-xl will-change-transform md:w-[calc(100vw/4)] md:p-10 md:first:ml-[calc(100vw/2)] xl:w-[calc(100vw/6)]"
        >
          <Image
            src={`/${type}.png`}
            alt={`${type} icon`}
            width={1024}
            height={1024}
            priority={index === 0}
          />
          <span className="capitalize md:text-lg">{type}</span>
        </div>
      ))}
    </>
  )
}

export default function Menu({ types }: { types: string[] }) {
  const isDesktop = useResponsive((breakpoint) => breakpoint.md)

  return isDesktop ? (
    <HorizontalSlides className="sticky top-40 hidden md:flex">
      <List types={types} />
    </HorizontalSlides>
  ) : (
    <div className="flex flex-row flex-wrap justify-around md:hidden">
      <List types={types} />
    </div>
  )
}
