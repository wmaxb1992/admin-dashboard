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
              // Sunset Orange color scheme
              colorPrimary: '#ff6b35', // Vibrant sunset orange
              colorSuccess: '#52c41a', // Keep success green
              colorWarning: '#faad14', // Warm amber
              colorError: '#ff4d4f', // Coral red
              colorInfo: '#ff8c42', // Light orange for info
              
              // Background colors
              colorBgContainer: '#fff',
              colorBgElevated: '#fff',
              colorBgLayout: '#faf5f0', // Very light orange background
              
              // Text colors
              colorTextBase: '#2c1810', // Dark brown text
              colorTextSecondary: '#8b4513', // Medium brown
              colorTextTertiary: '#cd853f', // Light brown
              
              // Border and divider
              colorBorder: '#ffd4c4', // Light orange border
              colorSplit: '#ffe4d6', // Very light orange divider
              
              // Link colors
              colorLink: '#ff6b35',
              colorLinkHover: '#ff8c42',
              colorLinkActive: '#e55a2b',
              
              // Component specific
              borderRadius: 8,
              borderRadiusLG: 12,
              borderRadiusSM: 6,
              
              // Control colors
              controlItemBgHover: '#fff2ed', // Very light orange hover
              controlItemBgActive: '#ffd4c4', // Light orange active
              controlItemBgActiveHover: '#ffbea9', // Slightly darker orange
              
              // Box shadow with warm tones
              boxShadowSecondary: '0 6px 16px 0 rgba(255, 107, 53, 0.08), 0 3px 6px -4px rgba(255, 107, 53, 0.12), 0 9px 28px 8px rgba(255, 107, 53, 0.05)',
            },
            components: {
              // Table customizations
              Table: {
                headerBg: '#fff2ed', // Light orange header
                headerColor: '#2c1810', // Dark text on header
                rowHoverBg: '#fff2ed', // Light orange hover
                borderColor: '#ffd4c4', // Light orange borders
              },
              // Button customizations
              Button: {
                primaryShadow: '0 2px 0 rgba(255, 107, 53, 0.1)',
                colorPrimaryHover: '#ff8c42',
                colorPrimaryActive: '#e55a2b',
              },
              // Card customizations
              Card: {
                headerBg: '#fff2ed',
                colorBorderSecondary: '#ffd4c4',
              },
              // Menu customizations
              Menu: {
                itemSelectedBg: '#fff2ed',
                itemHoverBg: '#fff2ed',
                itemSelectedColor: '#ff6b35',
                itemColor: '#2c1810',
              },
              // Tag customizations
              Tag: {
                defaultBg: '#fff2ed',
                defaultColor: '#ff6b35',
              },
              // Input customizations
              Input: {
                hoverBorderColor: '#ff8c42',
                activeBorderColor: '#ff6b35',
              },
            },
          }}
        >
          {children}
        </ConfigProvider>
      </body>
    </html>
  )
}
