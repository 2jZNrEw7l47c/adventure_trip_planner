const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']

export function SavedTripsList({ trips, onLoad, onDelete }) {
  if (trips.length === 0) return null
  return (
    <div className="saved-trips">
      <div className="saved-trips__title">Saved itineraries</div>
      {trips.map(trip => (
        <div key={trip.id} className="saved-trips__item">
          <button className="saved-trips__load" onClick={() => onLoad(trip)}>
            {trip.countryName} · {MONTH_NAMES[trip.month - 1]} · {trip.duration}d
          </button>
          <button className="saved-trips__delete" onClick={() => onDelete(trip.id)}>×</button>
        </div>
      ))}
    </div>
  )
}
