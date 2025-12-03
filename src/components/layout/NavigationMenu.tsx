import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import { mockCategories } from '@/data/categories'
import { cn } from '@/lib/utils'

import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'

export function CategoriesMenu() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className='text-sm font-medium'>
            Categories
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className='grid w-[700px] gap-3 p-4 md:w-[800px] lg:w-[1000px] lg:grid-cols-3'>
              {mockCategories.map(category => (
                <li key={category.id}>
                  <NavigationMenuLink asChild>
                    <Link
                      to={`/products?category=${category.slug}`}
                      className={cn(
                        'block select-none space-y-1 rounded-lg p-4 leading-none no-underline outline-none transition-all duration-200 hover:bg-accent hover:shadow-md group border border-transparent hover:border-primary/20',
                      )}>
                      {/* Category Name with Arrow */}
                      <div className='flex items-center justify-between mb-3'>
                        <div className='text-base font-bold leading-none group-hover:text-primary transition-colors'>
                          {category.name}
                        </div>
                        <ChevronRight className='h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-primary' />
                      </div>

                      {/* Category Description */}
                      <p className='text-xs leading-relaxed text-muted-foreground mb-3 line-clamp-2 group-hover:text-foreground/80 transition-colors'>
                        {category.description}
                      </p>

                      {/* Subcategories */}
                      <div className='space-y-1.5 pt-2 border-t border-border/50'>
                        {category.subcategories.map(sub => (
                          <Tooltip key={sub.id}>
                            <TooltipTrigger asChild>
                              <Link
                                to={`/products?category=${category.slug}&subcategory=${sub.slug}`}
                                className='block text-sm text-muted-foreground hover:text-primary transition-all py-2 px-3 rounded-md hover:bg-primary/5'
                                onClick={e => e.stopPropagation()}>
                                <div className='font-medium truncate'>{sub.name}</div>
                              </Link>
                            </TooltipTrigger>

                            <TooltipContent
                              side='right'
                              align='start'
                              className='max-w-xs text-xs leading-relaxed'>
                              {sub.description}
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </div>
                    </Link>
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}
