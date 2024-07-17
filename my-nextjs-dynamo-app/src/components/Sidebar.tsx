'use client'

import { navLinks } from '@/constants'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const Sidebar = () => {
  const pathname = usePathname()

  return (
    <aside className="sidebar">
      <div className="flex size-full flex-col gap-4">
        <nav className="sidebar-nav">
          <ul className='sidebar-nav_elements'>
          <Link href="/">Home</Link>
          <Link href="/week1">Week 1</Link>
          </ul>
        </nav>
      </div>
    </aside>
  )
}

export default Sidebar
