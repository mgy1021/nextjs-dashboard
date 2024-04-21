import Breadcrumbs from "@/app/ui/invoices/breadcrumbs"
import From from '@/app/ui/invoices/create-form'
import { fetchCustomers } from "@/app/lib/data"
import {Metadata} from 'next'

export const metadata:Metadata = {
  title:'Invoices Create'
}

export default async function Page() {
  const customers = await fetchCustomers()
  return (
    <main>
      <Breadcrumbs breadcrumbs={[
        { label: 'Invoices', href: '/dashboard/invoices' },
        {
          label: 'Create Invoices',
          href: '/dashboard/invoices/create',
          active: true
        }
      ]}>
      </Breadcrumbs>
      <From customers={customers} />
    </main>
  )
}