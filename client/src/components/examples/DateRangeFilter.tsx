import DateRangeFilter from '../DateRangeFilter'

export default function DateRangeFilterExample() {
  return (
    <DateRangeFilter 
      onRangeChange={(range) => console.log('Date range changed:', range)}
    />
  )
}