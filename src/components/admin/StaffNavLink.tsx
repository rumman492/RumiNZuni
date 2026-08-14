import Link from 'next/link'

export default function StaffNavLink() {
  return (
    <div className="nav-group">
      <div className="nav-group__toggle">
        <span className="nav-group__label">Help</span>
      </div>
      <div className="nav-group__content">
        <Link className="nav__link" href="/admin/staff-guide" prefetch={false}>
          <span className="nav__link-label">Staff guide</span>
        </Link>
      </div>
    </div>
  )
}
