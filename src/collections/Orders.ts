import type { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'
import { recordOrderStatusHistory } from '@/collections/hooks/recordOrderStatusHistory'
import { isExceptionStatus, ORDER_STATUSES, PAYMENT_STATUSES } from '@/lib/orders'
import { PAKISTAN_CITIES } from '@/lib/pakistan'

export const Orders: CollectionConfig = {
  slug: 'orders',
  labels: {
    singular: 'Order',
    plural: 'Orders',
  },
  admin: {
    useAsTitle: 'orderNumber',
    group: 'Sales',
    defaultColumns: ['orderNumber', 'customerName', 'phone', 'city', 'status', 'paymentStatus', 'total', 'createdAt'],
    listSearchableFields: ['orderNumber', 'customerName', 'phone'],
    description:
      'COD workflow: Pending → Confirmed → Packed → Shipped → Out for delivery → Delivered. Use Cancelled, Refused at door, Failed delivery, or Returned when the parcel does not complete. Mark cash collected when the rider is paid.',
  },
  defaultSort: '-createdAt',
  access: {
    read: isAdmin,
    create: () => false,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [recordOrderStatusHistory],
  },
  fields: [
    {
      name: 'orderNumber',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { readOnly: true },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Fulfillment',
          admin: {
            description: 'Move the order through the cash-on-delivery journey. History is recorded automatically.',
          },
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'status',
                  type: 'select',
                  required: true,
                  defaultValue: 'pending',
                  index: true,
                  options: [...ORDER_STATUSES],
                  admin: {
                    description:
                      'Happy path: Pending → Confirmed → Packed → Shipped → Out for delivery → Delivered. Exceptions: Cancelled, Refused at door, Failed delivery, Returned.',
                  },
                },
                {
                  name: 'paymentMethod',
                  type: 'select',
                  required: true,
                  defaultValue: 'cod',
                  options: [{ label: 'Cash on Delivery', value: 'cod' }],
                  admin: { readOnly: true },
                },
                {
                  name: 'paymentStatus',
                  type: 'select',
                  required: true,
                  defaultValue: 'unpaid',
                  options: [...PAYMENT_STATUSES],
                  admin: {
                    description: 'Set Collected when the rider receives cash. Delivered orders that are still unpaid are marked collected automatically.',
                  },
                },
              ],
            },
            {
              name: 'statusReason',
              type: 'textarea',
              admin: {
                description: 'Required context for cancelled, refused, failed, or returned orders. Saved into status history.',
                condition: (_, siblingData) => isExceptionStatus(siblingData?.status),
              },
            },
            {
              name: 'statusHistory',
              type: 'array',
              labels: { singular: 'Status change', plural: 'Status history' },
              admin: {
                readOnly: true,
                description: 'Timestamped log of status and payment changes. Staff cannot edit this list.',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'status', type: 'select', options: [...ORDER_STATUSES] },
                    { name: 'paymentStatus', type: 'select', options: [...PAYMENT_STATUSES] },
                    {
                      name: 'at',
                      type: 'date',
                      admin: { date: { displayFormat: 'yyyy-MM-dd HH:mm', pickerAppearance: 'dayAndTime' } },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'source',
                      type: 'select',
                      options: [
                        { label: 'Checkout', value: 'checkout' },
                        { label: 'Admin', value: 'admin' },
                        { label: 'System', value: 'system' },
                      ],
                    },
                    { name: 'actor', type: 'text' },
                  ],
                },
                { name: 'note', type: 'text' },
              ],
            },
            {
              name: 'adminNotes',
              type: 'textarea',
              admin: { description: 'Internal notes — not shown to the customer' },
            },
          ],
        },
        {
          label: 'Customer',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'customerName', type: 'text', required: true },
                { name: 'phone', type: 'text', required: true, index: true },
                { name: 'email', type: 'email' },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'city',
                  type: 'select',
                  required: true,
                  options: PAKISTAN_CITIES.map((city) => ({ label: city, value: city })),
                },
                { name: 'area', type: 'text', required: true },
              ],
            },
            {
              name: 'address',
              type: 'textarea',
              required: true,
            },
            {
              name: 'landmark',
              type: 'text',
            },
            {
              name: 'customerNotes',
              type: 'textarea',
            },
          ],
        },
        {
          label: 'Items',
          fields: [
            {
              name: 'items',
              type: 'array',
              required: true,
              minRows: 1,
              admin: { readOnly: true },
              fields: [
                { name: 'product', type: 'relationship', relationTo: 'products' },
                { name: 'title', type: 'text', required: true },
                { name: 'sku', type: 'text', required: true },
                { name: 'size', type: 'text', required: true },
                { name: 'color', type: 'text', required: true },
                { name: 'qty', type: 'number', required: true, min: 1 },
                { name: 'price', type: 'number', required: true, min: 0 },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'subtotal', type: 'number', required: true, min: 0, admin: { readOnly: true } },
                { name: 'shipping', type: 'number', required: true, min: 0, admin: { readOnly: true } },
                { name: 'codFee', type: 'number', required: true, min: 0, defaultValue: 0, admin: { readOnly: true } },
                { name: 'total', type: 'number', required: true, min: 0, admin: { readOnly: true } },
              ],
            },
          ],
        },
        {
          label: 'Notifications',
          fields: [
            {
              name: 'whatsappConfirmUrl',
              type: 'text',
              admin: {
                readOnly: true,
                description: 'Customer WhatsApp click-to-chat confirmation link',
              },
            },
            {
              name: 'notifications',
              type: 'array',
              admin: {
                readOnly: true,
                description: 'Outbound notification attempts after the order was placed',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'channel',
                      type: 'select',
                      options: [
                        { label: 'WhatsApp', value: 'whatsapp' },
                        { label: 'Email', value: 'email' },
                        { label: 'SMS', value: 'sms' },
                      ],
                    },
                    {
                      name: 'audience',
                      type: 'select',
                      options: [
                        { label: 'Customer', value: 'customer' },
                        { label: 'Staff', value: 'staff' },
                      ],
                    },
                    {
                      name: 'status',
                      type: 'select',
                      options: [
                        { label: 'Ready (customer action)', value: 'ready' },
                        { label: 'Skipped', value: 'skipped' },
                        { label: 'Sent', value: 'sent' },
                        { label: 'Failed', value: 'failed' },
                      ],
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'provider', type: 'text' },
                    { name: 'to', type: 'text' },
                  ],
                },
                { name: 'error', type: 'textarea' },
                { name: 'at', type: 'date', admin: { date: { displayFormat: 'yyyy-MM-dd HH:mm' } } },
              ],
            },
          ],
        },
      ],
    },
  ],
  timestamps: true,
}
