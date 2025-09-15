import AddTransactionForm from '../AddTransactionForm'

export default function AddTransactionFormExample() {
  return (
    <AddTransactionForm 
      onSubmit={(data) => console.log('Form submitted:', data)}
      onCancel={() => console.log('Form cancelled')}
    />
  )
}