'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Bed, Heart, CheckCircle, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { useFavorites } from '@/lib/hooks'

export function RoomCard({ room, userId, index = 0 }: { room: any; userId?: string; index?: number }) {
  const { favorites, toggleFavorite } = useFavorites(userId)
  const isFav = favorites.includes(room.id)
  const img = room.room_images?.find((i: any) => i.is_primary) || room.room_images?.[0]

  return (
    <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:index*0.05,duration:0.3}} className="card-hover">
      <div className="rounded-2xl overflow-hidden bg-card border border-border/50 shadow-sm h-full flex flex-col">
        {/* Image */}
        <div className="relative h-48 bg-muted shrink-0">
          {img ? (
            <Image src={img.url} alt={room.title} fill className="object-cover"/>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-500/20 to-indigo-500/20">
              <span className="text-5xl">🏠</span>
            </div>
          )}
          <div className="absolute top-3 left-3">
            <Badge variant={room.is_available ? 'success' : 'warning'} className="text-xs font-semibold backdrop-blur-sm">
              {room.is_available ? '● Available' : '○ Occupied'}
            </Badge>
          </div>
          {userId && (
            <button onClick={e => { e.preventDefault(); toggleFavorite(room.id) }}
              className={`absolute top-3 right-3 w-8 h-8 rounded-full glass flex items-center justify-center transition-all hover:scale-110 ${isFav ? 'text-red-400' : 'text-white/60 hover:text-red-400'}`}>
              <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`}/>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="font-display font-semibold text-sm leading-tight line-clamp-2 flex-1">{room.title}</h3>
            <div className="shrink-0 text-right">
              <div className="font-bold text-violet-500 text-sm">{formatPrice(room.rent_price)}</div>
              <div className="text-muted-foreground text-xs">/mo</div>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
            <MapPin className="w-3 h-3 text-violet-400 shrink-0"/>
            <span className="line-clamp-1">{room.location}, {room.city}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <span className="flex items-center gap-1"><Bed className="w-3.5 h-3.5"/> {room.num_beds} Bed{room.num_beds>1?'s':''}</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/40"/>
            <span>{room.room_type}</span>
          </div>
          {room.amenities?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {room.amenities.slice(0,3).map((a: string) => (
                <span key={a} className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground">{a}</span>
              ))}
              {room.amenities.length > 3 && <span className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground">+{room.amenities.length-3}</span>}
            </div>
          )}
          <div className="mt-auto">
            <Link href={`/room/${room.id}`}>
              <Button className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-0 h-9 text-sm">
                View Details
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function RoomCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border border-border/50 bg-card">
      <div className="h-48 bg-muted animate-pulse"/>
      <div className="p-4 space-y-3">
        <div className="h-4 bg-muted rounded animate-pulse w-3/4"/>
        <div className="h-3 bg-muted rounded animate-pulse w-1/2"/>
        <div className="flex gap-2"><div className="h-5 w-16 bg-muted rounded-full animate-pulse"/><div className="h-5 w-20 bg-muted rounded-full animate-pulse"/></div>
        <div className="h-9 bg-muted rounded-xl animate-pulse"/>
      </div>
    </div>
  )
}
