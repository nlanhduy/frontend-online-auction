import { StickyChatWidget } from '@/components/chat/sticky-chat-widget'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { QUERY_KEYS } from '@/constants/queryKey'
import { ProductAPI } from '@/services/api/product.api'
import { useQuery } from '@tanstack/react-query'

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '../../components/ui/carousel'
import { ProductCard } from '../../components/ui/product-card'

import type { Product } from '@/types/product.type'
interface HomePageData {
  endingSoon: Product[]
  mostBids: Product[]
  highestPriced: Product[]
}

function Homepage() {
  const { data, isLoading, error } = useQuery<HomePageData>({
    queryKey: QUERY_KEYS.products.homepage,
    queryFn: async () => {
      const response = await ProductAPI.getHomePageProducts({ options: {} })
      return response.data
    },
    refetchOnWindowFocus: false,
  })

  if (isLoading) {
    return (
      <div className='container mx-auto flex items-center justify-center min-h-screen'>
        <Button disabled size='lg'>
          <Spinner />
          Loading...
        </Button>
      </div>
    )
  }

  if (error) {
    return (
      <div className='container mx-auto flex items-center justify-center min-h-screen'>
        <p className='text-lg text-red-600'>An error occurred while loading data</p>
      </div>
    )
  }

  const sections = [
    { title: 'Ending Soon', data: data?.endingSoon || [] },
    { title: 'Most Bids', data: data?.mostBids || [] },
    { title: 'Highest Price', data: data?.highestPriced || [] },
  ]

  return (
    <>
      <div className='container mx-auto flex flex-col gap-16 py-12'>
        {sections.map((section, index) => (
          <div key={index}>
            <h2 className='text-2xl font-bold mb-6 text-gray-900'>{section.title}</h2>
            <Carousel className='w-full max-w-full px-12' opts={{ align: 'start' }}>
              <CarouselContent className='-ml-4'>
                {section.data.map(product => (
                  <CarouselItem key={product.id} className='pl-4 basis-1/3'>
                    <ProductCard product={product} size='large' />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className='left-0' />
              <CarouselNext className='right-0' />
            </Carousel>
          </div>
        ))}
      </div>
      <StickyChatWidget orderId='07ab5bfd-2b1b-4a3b-a9d7-9e571ca0ffcf' />
    </>
  )
}

export default Homepage
