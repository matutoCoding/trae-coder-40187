import type { DayRoute, VehicleType } from '@/types'
import { MapPin, Clock, Fuel, Plug, Battery } from 'lucide-react'

interface RouteCardProps {
  route: DayRoute
  vehicleType: VehicleType
}

export default function RouteCard({ route, vehicleType }: RouteCardProps) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-sand-100 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="bg-forest-500 text-white text-xs font-medium px-2.5 py-1 rounded-full">
            DAY {route.day}
          </span>
          <span className="text-sm text-sand-600">{route.date}</span>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-1.5 text-sand-700">
          <MapPin size={14} className="text-sunset-400" />
          <span className="text-sm font-medium">{route.totalMileage} km</span>
        </div>
        <div className="flex items-center gap-1.5 text-sand-700">
          <Clock size={14} className="text-forest-400" />
          <span className="text-sm font-medium">{route.drivingDuration}h</span>
        </div>
      </div>

      <div className="space-y-1.5 mb-3">
        {route.spots.map((spot) => (
          <div key={spot.id} className="flex items-center gap-2 text-sm">
            <div className={`w-1.5 h-1.5 rounded-full ${
              spot.type === 'hotel' ? 'bg-sunset-400' :
              spot.type === 'restaurant' ? 'bg-sand-400' :
              spot.type === 'service_area' ? 'bg-forest-300' :
              'bg-forest-500'
            }`} />
            <span className={`${spot.type === 'hotel' ? 'text-sand-500' : 'text-sand-700'}`}>
              {spot.name}
            </span>
            <span className="text-sand-400 text-xs ml-auto">{spot.arrivalTime}</span>
          </div>
        ))}
      </div>

      {route.serviceAreas.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {route.serviceAreas.map((area, i) => (
            <span key={i} className="inline-flex items-center gap-1 bg-sand-100 text-sand-600 text-xs px-2 py-0.5 rounded-full">
              <Fuel size={10} />
              {area}
            </span>
          ))}
        </div>
      )}

      {route.fuelChargeSuggestion && (
        <div className={`flex items-start gap-1.5 text-xs px-2.5 py-1.5 rounded-lg ${
          vehicleType === 'electric' ? 'bg-forest-50 text-forest-700' : 'bg-sand-100 text-sand-600'
        }`}>
          {vehicleType === 'electric' ? <Plug size={12} /> : <Battery size={12} />}
          {route.fuelChargeSuggestion}
        </div>
      )}
    </div>
  )
}
