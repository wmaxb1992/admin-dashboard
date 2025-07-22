'use client'

import { useState, useEffect } from 'react'
import { 
  Layout, 
  Table, 
  Input, 
  Select, 
  Button, 
  Space, 
  Card, 
  Statistic, 
  Row, 
  Col, 
  Typography, 
  Tag, 
  theme,
  Empty,
  Spin,
  Menu
} from 'antd'
import {
  SearchOutlined,
  FilterOutlined,
  BarChartOutlined,
  DatabaseOutlined,
  BugOutlined,
  UserOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { searchVarieties, getVarietyStats, getCategories, getAllVarieties, findDuplicateVarieties, removeDuplicateVarieties } from '@/lib/supabase'
import type { VarietyWithDetails, Category } from '@/lib/supabase'

const { Header, Content } = Layout
const { Option } = Select
const { Title, Text } = Typography

interface ExtendedVariety extends VarietyWithDetails {
  farm_count?: number
}

export default function AdminDashboard() {
  const [varieties, setVarieties] = useState<ExtendedVariety[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [categories, setCategories] = useState<Category[]>([])
  const [stats, setStats] = useState<any>(null)
  const [duplicates, setDuplicates] = useState<any[]>([])
  const [showDuplicates, setShowDuplicates] = useState(false)
  
  const { token } = theme.useToken()

  // Table columns configuration
  const columns: ColumnsType<ExtendedVariety> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Category',
      dataIndex: 'category_name',
      key: 'category_name',
      sorter: (a, b) => a.category_name.localeCompare(b.category_name),
      render: (text: string) => <Tag color="green">{text}</Tag>,
      filters: categories.map(cat => ({ text: cat.name, value: cat.name })),
      onFilter: (value, record) => record.category_name === value,
    },
    {
      title: 'Subcategory',
      dataIndex: 'subcategory_name',
      key: 'subcategory_name',
      sorter: (a, b) => a.subcategory_name.localeCompare(b.subcategory_name),
    },
    {
      title: 'Farms Carrying',
      dataIndex: 'farm_count',
      key: 'farm_count',
      sorter: (a, b) => (a.farm_count || 0) - (b.farm_count || 0),
      render: (count: number) => (
        <Text type={count > 0 ? 'success' : 'secondary'} strong={count > 0}>
          {count || 0}
        </Text>
      ),
    },
    {
      title: 'Days to Maturity',
      dataIndex: ['nutritional_info', 'days_to_maturity'],
      key: 'days_to_maturity',
      sorter: (a, b) => {
        const aDays = a.nutritional_info?.days_to_maturity || 0
        const bDays = b.nutritional_info?.days_to_maturity || 0
        return aDays - bDays
      },
      render: (days: string) => days ? <Tag color="blue">{days}</Tag> : <Text type="secondary">-</Text>,
    },
    {
      title: 'Sun Requirements',
      dataIndex: ['nutritional_info', 'sun_requirements'],
      key: 'sun_requirements',
      render: (sun: string) => sun ? <Tag color="orange">{sun}</Tag> : <Text type="secondary">-</Text>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => text ? (
        <Text type="secondary" style={{ fontSize: '12px' }} title={text}>
          {text.length > 50 ? text.substring(0, 50) + '...' : text}
        </Text>
      ) : <Text type="secondary">-</Text>,
    },
  ]

  // Load initial data
  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      const [categoriesData, statsData, allVarieties] = await Promise.all([
        getCategories(),
        getVarietyStats(),
        getAllVarieties() // Load all varieties on page load
      ])
      
      setCategories(categoriesData)
      setStats(statsData)
      setVarieties(allVarieties) // Set all varieties initially
    } catch (error) {
      console.error('Error loading initial data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchTerm.trim()) return
    
    try {
      setLoading(true)
      const results = await searchVarieties(searchTerm, selectedCategory || undefined)
      setVarieties(results)
    } catch (error) {
      console.error('Error searching varieties:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryFilter = async (categoryName: string) => {
    setSelectedCategory(categoryName)
    if (searchTerm) {
      await handleSearch()
    }
  }

  const handleFindDuplicates = async () => {
    try {
      setLoading(true)
      const duplicateData = await findDuplicateVarieties()
      setDuplicates(duplicateData)
      setShowDuplicates(true)
    } catch (error) {
      console.error('Error finding duplicates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveDuplicates = async () => {
    try {
      setLoading(true)
      console.log('Starting duplicate removal...')
      
      const result = await removeDuplicateVarieties(duplicates)
      console.log(`Successfully removed ${result.deletedCount} duplicate varieties`)
      
      // Refresh the data
      await loadInitialData()
      setShowDuplicates(false)
      setDuplicates([])
      
      // Show success message (you could add a notification here)
      alert(`Successfully removed ${result.deletedCount} duplicate varieties!`)
    } catch (error) {
      console.error('Error removing duplicates:', error)
      alert(`Error removing duplicates: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Header */}
      <Header style={{ 
        backgroundColor: token.colorPrimary, 
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <BugOutlined style={{ fontSize: '32px', color: 'white' }} />
          <Title level={2} style={{ color: 'white', margin: 0 }}>
            Master Catalog Admin
          </Title>
        </div>
        <Space size="large">
          <Button 
            type="text" 
            icon={<UserOutlined />} 
            style={{ color: 'white', border: '1px solid white' }}
            onClick={() => window.location.href = '/users'}
          >
            Manage Users
          </Button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <DatabaseOutlined style={{ fontSize: '24px', color: 'white' }} />
            <Text style={{ color: 'white' }}>
              {stats?.total || 0} Varieties
            </Text>
          </div>
        </Space>
      </Header>

      {/* Content */}
      <Content style={{ padding: '24px' }}>
        {/* Stats Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total Varieties"
                value={stats?.total || 0}
                prefix={<BarChartOutlined style={{ color: token.colorPrimary }} />}
              />
            </Card>
          </Col>
          {stats?.byCategory && Object.entries(stats.byCategory).slice(0, 3).map(([category, count]) => (
            <Col xs={24} sm={12} md={6} key={category}>
              <Card>
                <Statistic
                  title={category}
                  value={count as number}
                  prefix={
                    <div style={{ 
                      width: '24px', 
                      height: '24px', 
                      backgroundColor: token.colorPrimaryBg,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Text style={{ 
                        color: token.colorPrimary, 
                        fontWeight: 'bold', 
                        fontSize: '12px' 
                      }}>
                        {category.charAt(0)}
                      </Text>
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>

        {/* Search Section */}
        <Card style={{ marginBottom: '24px' }}>
          <Title level={4} style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
            <SearchOutlined style={{ marginRight: '8px' }} />
            Search Master Catalog
          </Title>
          
          <Space.Compact style={{ width: '100%', display: 'flex' }}>
            <Input
              placeholder="Search varieties (e.g., 'tomato', 'basil', 'Cherokee Purple')"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onPressEnter={handleSearch}
              style={{ flex: 1 }}
            />
            <Select
              value={selectedCategory}
              onChange={(value) => handleCategoryFilter(value)}
              placeholder="All Categories"
              style={{ width: 200 }}
              allowClear
            >
              {categories.map((category) => (
                <Option key={category.id} value={category.name}>
                  {category.name}
                </Option>
              ))}
            </Select>
            <Button
              type="primary"
              onClick={handleSearch}
              disabled={loading || !searchTerm.trim()}
              loading={loading}
              icon={<SearchOutlined />}
            >
              Search
            </Button>
          </Space.Compact>
        </Card>

        {/* Varieties Table */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <Title level={4} style={{ margin: 0 }}>
              {searchTerm 
                ? `Search Results (${varieties.length} varieties)`
                : `All Varieties (${varieties.length} varieties)`
              }
            </Title>
            <Space>
              <Button 
                onClick={handleFindDuplicates}
                loading={loading}
                icon={<FilterOutlined />}
              >
                Find Duplicates
              </Button>
              {showDuplicates && duplicates.length > 0 && (
                <Button 
                  type="primary" 
                  danger
                  onClick={handleRemoveDuplicates}
                  loading={loading}
                >
                  Remove {duplicates.length} Duplicates
                </Button>
              )}
            </Space>
          </div>
          
          {showDuplicates && duplicates.length > 0 && (
            <Card style={{ marginBottom: '16px', backgroundColor: '#fff2f0' }}>
              <Title level={5} style={{ color: '#ff4d4f', margin: 0 }}>
                🚨 Found {duplicates.length} duplicate groups affecting {duplicates.reduce((sum, d) => sum + d.count, 0)} varieties
              </Title>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                First 5 duplicates: {duplicates.slice(0, 5).map(d => d.name).join(', ')}
              </Text>
            </Card>
          )}
          
          <Table
            columns={columns}
            dataSource={varieties}
            loading={loading}
            rowKey="id"
            pagination={{
              total: varieties.length,
              pageSize: 50,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} varieties`,
            }}
            scroll={{ x: 1200 }}
            size="small"
          />
        </Card>

        {/* Empty States */}
        {!loading && searchTerm && varieties.length === 0 && (
          <Card style={{ textAlign: 'center', padding: '48px 24px' }}>
            <Empty
              image={<SearchOutlined style={{ fontSize: '48px', color: token.colorTextTertiary }} />}
              description={
                <div>
                  <Text>No varieties found for "{searchTerm}"</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Try searching for something like "tomato", "basil", or "Cherokee Purple"
                  </Text>
                </div>
              }
            />
          </Card>
        )}

        {!loading && !searchTerm && varieties.length === 0 && (
          <Card style={{ textAlign: 'center', padding: '48px 24px' }}>
            <Empty
              image={<DatabaseOutlined style={{ fontSize: '48px', color: token.colorTextTertiary }} />}
              description={
                <div>
                  <Text>No varieties found in the database</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    The varieties database appears to be empty
                  </Text>
                </div>
              }
            />
          </Card>
        )}
      </Content>
    </Layout>
  )
}
