import Link from 'next/link'
import type { ServerProps } from 'payload'
import { formatAdminURL } from 'payload/shared'
import { adminPath, getAdminDashboardData, LOW_STOCK_THRESHOLD } from '@/lib/admin-dashboard'
import { formatOrderStatus } from '@/lib/orders'
import { formatPkr } from '@/lib/pakistan'

export default async function DashboardStats({ payload, user }: ServerProps) {
  if (!user || !payload) return null

  const adminRoute = payload.config.routes.admin || '/admin'
  let data
  try {
    data = await getAdminDashboardData(payload)
  } catch (error) {
    payload.logger.error({ err: error, msg: 'Admin dashboard stats failed.' })
    return null
  }
  const orders = formatAdminURL({ adminRoute, path: '/collections/orders' })
  const products = formatAdminURL({ adminRoute, path: '/collections/products' })
  const newProduct = formatAdminURL({ adminRoute, path: '/collections/products/create' })
  const settings = formatAdminURL({ adminRoute, path: '/globals/site-settings' })

  const cards = [
    {
      label: "Today's orders",
      value: String(data.todayOrders),
      href: orders,
      hint: data.todayLabel,
    },
    {
      label: "Today's sales",
      value: formatPkr(data.todaySales),
      href: orders,
      hint: 'Excludes cancelled and returns',
    },
    {
      label: 'Pending',
      value: String(data.pending),
      href: adminPath(adminRoute, '/collections/orders', { status: 'pending' }),
      hint: 'Need WhatsApp confirm',
    },
    {
      label: 'Confirmed',
      value: String(data.confirmed),
      href: adminPath(adminRoute, '/collections/orders', { status: 'confirmed' }),
      hint: 'Ready to pack',
    },
    {
      label: 'Shipped',
      value: String(data.shipped),
      href: adminPath(adminRoute, '/collections/orders', { status: 'shipped' }),
      hint: 'With the courier',
    },
    {
      label: 'Delivered',
      value: String(data.delivered),
      href: adminPath(adminRoute, '/collections/orders', { status: 'delivered' }),
      hint: 'Cash collected on delivery',
    },
    {
      label: 'Returns',
      value: String(data.returned),
      href: adminPath(adminRoute, '/collections/orders', { status: 'returned' }),
      hint: 'Returned to shop',
    },
    {
      label: 'Low stock',
      value: String(data.lowStock.length),
      href: products,
      hint: `Stock at ${LOW_STOCK_THRESHOLD} or below`,
    },
  ]

  return (
    <section className="rnz-dashboard">
      <div className="rnz-dashboard__header">
        <div>
          <p className="rnz-dashboard__eyebrow">RumiNZuni · Pakistan · COD</p>
          <h1 className="rnz-dashboard__title">Shop dashboard</h1>
          <p className="rnz-dashboard__lede">{data.todayLabel} · Asia/Karachi</p>
        </div>
        <div className="rnz-dashboard__actions">
          <Link className="rnz-dashboard__btn rnz-dashboard__btn--primary" href={orders}>
            Manage orders
          </Link>
          <Link className="rnz-dashboard__btn" href={products}>
            Products
          </Link>
          <Link className="rnz-dashboard__btn" href={newProduct}>
            Add product
          </Link>
          <Link className="rnz-dashboard__btn" href={settings}>
            Store settings
          </Link>
          <Link className="rnz-dashboard__btn" href="/" target="_blank" rel="noreferrer">
            View shop
          </Link>
        </div>
      </div>

      <div className="rnz-dashboard__grid">
        {cards.map((card) => (
          <Link key={card.label} className="rnz-dashboard__card" href={card.href}>
            <span className="rnz-dashboard__card-label">{card.label}</span>
            <span className="rnz-dashboard__card-value">{card.value}</span>
            <span className="rnz-dashboard__card-hint">{card.hint}</span>
          </Link>
        ))}
      </div>

      <div className="rnz-dashboard__panels">
        <div className="rnz-dashboard__panel">
          <div className="rnz-dashboard__panel-head">
            <h2>Today&apos;s orders</h2>
            <Link href={orders}>All orders</Link>
          </div>
          {data.recentToday.length === 0 ? (
            <p className="rnz-dashboard__empty">No orders yet today.</p>
          ) : (
            <table className="rnz-dashboard__table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {data.recentToday.map((order) => (
                  <tr key={String(order.id)}>
                    <td>
                      <Link href={`${orders}/${order.id}`}>{order.orderNumber}</Link>
                    </td>
                    <td>
                      {order.customerName}
                      {order.city ? <span className="rnz-dashboard__muted"> · {order.city}</span> : null}
                    </td>
                    <td>{formatOrderStatus(order.status)}</td>
                    <td>{formatPkr(order.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="rnz-dashboard__panel">
          <div className="rnz-dashboard__panel-head">
            <h2>Low stock</h2>
            <Link href={products}>All products</Link>
          </div>
          {data.lowStock.length === 0 ? (
            <p className="rnz-dashboard__empty">No variants at {LOW_STOCK_THRESHOLD} or below.</p>
          ) : (
            <table className="rnz-dashboard__table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Size / colour</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {data.lowStock.map((row) => (
                  <tr key={`${row.productId}-${row.sku}`}>
                    <td>
                      <Link href={`${products}/${row.productId}`}>{row.title}</Link>
                    </td>
                    <td>{row.sku}</td>
                    <td>
                      {row.size} · {row.color}
                    </td>
                    <td className={row.stock === 0 ? 'rnz-dashboard__stock-out' : 'rnz-dashboard__stock-low'}>
                      {row.stock}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </section>
  )
}
