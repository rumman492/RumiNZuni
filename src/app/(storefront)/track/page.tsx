import { TrackForm } from '@/components/TrackForm'

export const metadata = { title: 'Track order' }

export default function TrackPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="display text-5xl">Track your order</h1>
      <p className="mt-3 text-ink-soft">
        Use the order number from your confirmation screen and the same mobile number you entered at checkout.
      </p>
      <div className="mt-8">
        <TrackForm />
      </div>
    </div>
  )
}
