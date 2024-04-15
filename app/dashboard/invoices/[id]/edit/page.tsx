import Breadcrumbs from '@/app/ui/invoices/breadcrumbs'
import From from '@/app/ui/invoices/edit-form'
import { fetchInvoiceById, fetchCustomers } from '@/app/lib/data'
import { notFound } from 'next/navigation'

export default async function Page({ params }: { params: { id: string } }) {
  const { id } = params
  const [invoice, customers] = await Promise.all([
    fetchInvoiceById(id),
    fetchCustomers()
  ])

  if (!invoice) {
    notFound()
  }

  return (
    <main>
      <Breadcrumbs breadcrumbs={[
        { label: 'Invoices', href: '/dashboard/invoidces' },
        {
          label: 'Edit Invoice',
          href: `/dashboard/invodices/${id}/edit`,
          active: true
        }
      ]} />
      <From invoice={invoice} customers={customers} />
    </main>
  )
}