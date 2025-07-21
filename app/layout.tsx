import './globals.css'
import { Inter } from 'next/font/google'
import { ConfigProvider } from 'antd'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Master Catalog Admin',
  description: 'Admin dashboard for managing the master catalog of varieties',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: '#16a34a', // green-600
              colorSuccess: '#16a34a',
              borderRadius: 8,
            },
          }}
        >
          {children}
        </ConfigProvider>
      </body>
    </html>
  )
}
