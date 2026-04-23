import AppNavbar from '@/components/AppNavbar'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <AppNavbar />
      {children}
    </>
  )
}