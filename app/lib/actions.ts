'use server'

import { z } from 'zod'
import { sql } from '@vercel/postgres'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import {signIn} from "@/auth"
import {AuthError} from 'next-auth'

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

const FromSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error:'Please select a customer.'
  }),
  amount: z.coerce.number().gt(0,{message:'Please enter an amount greater than $0.'}),
  status: z.enum(['pending', 'paid'],{
    invalid_type_error: 'Please select an invoice status.'
  }),
  date: z.string()
})

const CreateInvoice = FromSchema.omit({ id: true, date: true })

export async function createInvoice(prevState:State,fromData: FormData) {
  // 校验数据格式
  const validatedFields = CreateInvoice.safeParse({
    customerId: fromData.get('customerId'),
    amount: fromData.get('amount'),
    status: fromData.get('status')
  })  

  if (!validatedFields.success) {
    return {
      errors:validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    }
  }

  // 处理数据格式
  const {customerId, amount, status} = validatedFields.data
  const amountInCents = amount * 100
  const date = new Date().toISOString().split('T')[0]

  try {

    // 把数据添加到数据库
    await sql`
    INSERT INTO invoices (customer_id,amount,status,date) 
    VALUES (${customerId},${amountInCents},${status},${date})
  `
  } catch (e) {
    return {
      message: 'Database Error：Failed to create Invoice.'
    }
  }

  // 关闭缓存，是页面重新发送请求，获取最新的数据
  revalidatePath('/dashboard/invoices')
  // 重定向到邮票列表页面
  redirect('/dashboard/invoices');
}

const UpdateInvoice = FromSchema.omit({ id: true, date: true });

export async function updateInvoice(id: string, prevState:State,formData: FormData) {

  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status')
  })

  if (!validatedFields.success) {
    return {
      errors:validatedFields.error.flatten().fieldErrors,
      message:'Missing Fields. Failed to Create Invoice.'
  }
}

  //处理数据格式
 const { customerId, amount, status }  = validatedFields.data
  const amountInCents = amount * 100

  try {
    // 更新数据库
    await sql`
    UPDATE invoices 
    SET customer_id = ${customerId},amount = ${amountInCents},status = ${status} 
    WHERE id = ${id}
  `;
  } catch (e) {
    return {
      message: 'Database Error：Failed to update Invoice.'
    }
  }

  // 关闭缓存，使页面重新发送请求，获取最新的数据
  revalidatePath('/dashboard/invoices')
  // 重定向到邮票列表页面
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  throw new Error('Failed to delete Invoice.')
  try {
    // 删除数据库中的数据
    await sql` DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices')
  } catch (e) {
    return {
      message: 'Database Error: Failed to delete Invoice.'
    }
  }
}

export async function authenticate(prevState:string|undefined,formData:FormData){
  try{
    await signIn('credentials',formData)
  }catch(error){
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.'
        default:
          return 'Something went wrong.'
      }
    }
  throw error;
  }
}

