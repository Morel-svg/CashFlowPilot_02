import Header from '../Header'

export default function HeaderExample() {
  return (
    <Header 
      onAddTransaction={() => console.log('Add transaction clicked')}
      onToggleMenu={() => console.log('Menu toggled')}
    />
  )
}