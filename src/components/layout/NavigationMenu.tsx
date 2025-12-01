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

export function CategoriesMenu() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className='text-sm font-medium'>
            Categories
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className='grid w-[700px] gap-3 p-4 md:w-[800px] lg:w-[900px] lg:grid-cols-3'>
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
                          <div key={sub.id} className='group/tooltip relative'>
                            <Link
                              to={`/products?category=${category.slug}&subcategory=${sub.slug}`}
                              className='block text-sm text-muted-foreground hover:text-primary transition-all py-2 px-3 rounded-md hover:bg-primary/5'
                              onClick={e => e.stopPropagation()}>
                              <div className='font-medium truncate'>{sub.name}</div>
                            </Link>

                            {/* Tooltip - Shows description on hover */}
                            <div className='absolute left-full right-full ml-2 z-50 top-0 w-64 p-3 bg-popover text-popover-foreground rounded-lg shadow-xl border opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 z-100 pointer-events-none'>
                              <div className='text-xs text-muted-foreground leading-relaxed'>
                                {sub.description}
                              </div>
                            </div>
                          </div>
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
