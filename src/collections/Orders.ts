import type { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'
import { PAKISTAN_CITIES } from '@/lib/pakistan'

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'orderNumber',
    group: 'Sales',
    defaultColumns: ['orderNumber', 'customerName', 'phone', 'city', 'status', 'paymentStatus', 'total', 'createdAt'],
  },
  access: {
    read: isAdmin,
    create: () => false,
    update: isAdmin,
    delete: isAdmin,
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
      type: 'row',
      fields: [
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'pending',
          options: [
            { label: 'Pending', value: 'pending' },
            { label: 'Confirmed', value: 'confirmed' },
            { label: 'Packed', value: 'packed' },
            { label: 'Shipped', value: 'shipped' },
            { label: 'Delivered', value: 'delivered' },
            { label: 'Cancelled', value: 'cancelled' },
            { label: 'Returned', value: 'returned' },
          ],
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
          options: [
            { label: 'Unpaid (collect on delivery)', value: 'unpaid' },
            { label: 'Collected', value: 'collected' },
            { label: 'Refunded', value: 'refunded' },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'customerName', type: 'text', required: true },
        { name: 'phone', type: 'text', required: true },
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
    {
      name: 'adminNotes',
      type: 'textarea',
      admin: { description: 'Internal notes — not shown to the customer' },
    },
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
  timestamps: true,
}
