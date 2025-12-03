import { MOCK_PRODUCTS } from '@/data/mock-data'

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '../../components/ui/carousel'
import { ProductCard } from '../../components/ui/product-card'

function Homepage() {
  return (
    <>
      <div className='container mx-auto flex flex-col gap-16'>
        <div>
          <h2 className='text-2xl font-bold mb-6 text-gray-900'>Sản phẩm nổi bật</h2>
          <Carousel className='w-full max-w-full px-12' opts={{ align: 'start' }}>
            <CarouselContent className='-ml-4'>
              {MOCK_PRODUCTS.map(product => (
                <CarouselItem key={product.id} className='pl-4 basis-1/3'>
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    image={product.images[0]}
                    currentPrice={product.currentPrice}
                    categoryName={product.categoryName}
                    categoryId={product.categoryId}
                    endTime={product.endTime}
                    bidCount={product.bidCount}
                    highestBidder={product.highestBidder}
                    buyNowPrice={product.buyNowPrice}
                    createdAt={product.createdAt}
                    //   isNew={product.isNew}
                    size='large'
                    //   onCategoryClick={() => handleCategoryClick(product.categoryId)}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className='left-0' />
            <CarouselNext className='right-0' />
          </Carousel>
        </div>
        <div>
          <h2 className='text-2xl font-bold mb-6 text-gray-900'>Sản phẩm nổi bật</h2>
          <Carousel className='w-full max-w-full px-20' opts={{ align: 'start' }}>
            <CarouselContent className='-ml-4'>
              {MOCK_PRODUCTS.map(product => (
                <CarouselItem key={product.id} className='pl-4 basis-1/3'>
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    image={product.images[0]}
                    currentPrice={product.currentPrice}
                    categoryName={product.categoryName}
                    categoryId={product.categoryId}
                    endTime={product.endTime}
                    bidCount={product.bidCount}
                    highestBidder={product.highestBidder}
                    buyNowPrice={product.buyNowPrice}
                    createdAt={product.createdAt}
                    //   isNew={product.isNew}
                    size='large'
                    //   onCategoryClick={() => handleCategoryClick(product.categoryId)}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className='left-0' />
            <CarouselNext className='right-0' />
          </Carousel>
        </div>
        <div>
          <h2 className='text-2xl font-bold mb-6 text-gray-900'>Sản phẩm nổi bật</h2>
          <Carousel className='w-full max-w-full px-20' opts={{ align: 'start' }}>
            <CarouselContent className='-ml-4'>
              {MOCK_PRODUCTS.map(product => (
                <CarouselItem key={product.id} className='pl-4 basis-1/3'>
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    image={product.images[0]}
                    currentPrice={product.currentPrice}
                    categoryName={product.categoryName}
                    categoryId={product.categoryId}
                    endTime={product.endTime}
                    bidCount={product.bidCount}
                    highestBidder={product.highestBidder}
                    buyNowPrice={product.buyNowPrice}
                    createdAt={product.createdAt}
                    //   isNew={product.isNew}
                    size='large'
                    //   onCategoryClick={() => handleCategoryClick(product.categoryId)}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className='left-0' />
            <CarouselNext className='right-0' />
          </Carousel>
        </div>
      </div>
    </>
  )
}

export default Homepage
