'use client'

import { useState, useEffect } from 'react'
import { 
  Layout, 
  Table, 
  Input, 
  Button, 
  Space, 
  Card, 
  Typography, 
  Tag, 
  Modal,
  Form,
  Select,
  notification,
  Popconfirm,
  Descriptions,
  Divider,
  Row,
  Col
} from 'antd'
import {
  SearchOutlined,
  ShopOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  PlusOutlined,
  UserOutlined,
  EnvironmentOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

const { Header, Content } = Layout
const { Title, Text } = Typography
const { Search, TextArea } = Input
const { Option } = Select

interface User {
  id: string
  name: string
  email: string
  phone: string | null
}

interface Farm {
  id: string
  name: string
  description: string | null
  logo: string | null
  cover_image: string | null
  owner_name: string | null
  email: string
  phone: string | null
  website: string | null
  address: string | null
  rating: number | null
  owner_id: string | null
  created_at: string
  updated_at: string
  owner?: User
}

export default function FarmManagement() {
  const [farms, setFarms] = useState<Farm[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isViewModalVisible, setIsViewModalVisible] = useState(false)
  const [form] = Form.useForm()

  // Fetch farms with their owners
  const fetchFarms = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/farms')
      if (!response.ok) throw new Error('Failed to fetch farms')
      const data = await response.json()
      setFarms(data.farms || [])
    } catch (error) {
      console.error('Error fetching farms:', error)
      notification.error({
        message: 'Error',
        description: 'Failed to fetch farms'
      })
    } finally {
      setLoading(false)
    }
  }

  // Fetch users for the owner dropdown
  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      if (!response.ok) throw new Error('Failed to fetch users')
      const data = await response.json()
      setUsers(data.users || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  // Delete farm
  const deleteFarm = async (farmId: string) => {
    try {
      const response = await fetch(`/api/farms/${farmId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Failed to delete farm')
      
      notification.success({
        message: 'Success',
        description: 'Farm deleted successfully'
      })
      
      fetchFarms() // Refresh the list
    } catch (error) {
      console.error('Error deleting farm:', error)
      notification.error({
        message: 'Error',
        description: 'Failed to delete farm'
      })
    }
  }

  // Update farm
  const updateFarm = async (values: any) => {
    try {
      const response = await fetch(`/api/farms/${selectedFarm?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
      })
      
      if (!response.ok) throw new Error('Failed to update farm')
      
      notification.success({
        message: 'Success',
        description: 'Farm updated successfully'
      })
      
      setIsModalVisible(false)
      form.resetFields()
      setSelectedFarm(null)
      fetchFarms() // Refresh the list
    } catch (error) {
      console.error('Error updating farm:', error)
      notification.error({
        message: 'Error',
        description: 'Failed to update farm'
      })
    }
  }

  // Create farm
  const createFarm = async (values: any) => {
    try {
      const response = await fetch('/api/farms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
      })
      
      if (!response.ok) throw new Error('Failed to create farm')
      
      notification.success({
        message: 'Success',
        description: 'Farm created successfully'
      })
      
      setIsModalVisible(false)
      form.resetFields()
      setSelectedFarm(null)
      fetchFarms() // Refresh the list
    } catch (error) {
      console.error('Error creating farm:', error)
      notification.error({
        message: 'Error',
        description: 'Failed to create farm'
      })
    }
  }

  // Handle form submission
  const handleFormSubmit = async (values: any) => {
    if (selectedFarm) {
      await updateFarm(values)
    } else {
      await createFarm(values)
    }
  }

  // Filter farms based on search term
  const filteredFarms = farms.filter(farm =>
    farm.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    farm.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    farm.owner_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    farm.address?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Table columns
  const columns: ColumnsType<Farm> = [
    {
      title: 'Farm Name',
      dataIndex: 'name',
      key: 'name',
      render: (name) => <Text strong>{name}</Text>
    },
    {
      title: 'Owner',
      key: 'owner',
      render: (_, record) => (
        <div>
          <Text>{record.owner_name || record.owner?.name || 'N/A'}</Text>
          {record.owner?.email && (
            <div style={{ fontSize: '12px', color: '#666' }}>
              {record.owner.email}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Contact',
      key: 'contact',
      render: (_, record) => (
        <div>
          <div>{record.email}</div>
          {record.phone && (
            <div style={{ fontSize: '12px', color: '#666' }}>
              {record.phone}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Location',
      dataIndex: 'address',
      key: 'address',
      render: (address) => address ? (
        <Text title={address}>
          <EnvironmentOutlined /> {address.length > 30 ? address.substring(0, 30) + '...' : address}
        </Text>
      ) : 'N/A'
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating) => rating ? (
        <Tag color="gold">⭐ {rating}</Tag>
      ) : <Text type="secondary">No rating</Text>
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedFarm(record)
              setIsViewModalVisible(true)
            }}
            size="small"
          >
            View
          </Button>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedFarm(record)
              form.setFieldsValue({
                ...record,
                owner_id: record.owner_id || record.owner?.id
              })
              setIsModalVisible(true)
            }}
            size="small"
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this farm?"
            description="This action cannot be undone."
            onConfirm={() => deleteFarm(record.id)}
            okText="Yes"
            cancelText="No"
            okType="danger"
          >
            <Button
              icon={<DeleteOutlined />}
              danger
              size="small"
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  useEffect(() => {
    fetchFarms()
    fetchUsers()
  }, [])

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        background: '#fff', 
        padding: '0 24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          height: '64px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <ShopOutlined style={{ fontSize: '24px', color: '#16a34a' }} />
            <Title level={3} style={{ margin: 0 }}>
              Farm Management
            </Title>
          </div>
          <Space>
            <Button 
              type="primary" 
              ghost
              icon={<UserOutlined />}
              onClick={() => window.location.href = '/users'}
            >
              Manage Users
            </Button>
            <Button 
              type="primary" 
              ghost
              onClick={() => window.location.href = '/'}
            >
              Back to Dashboard
            </Button>
          </Space>
        </div>
      </Header>

      <Content style={{ padding: '24px' }}>
        <Card>
          <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
            <Col xs={24} sm={12} md={8}>
              <Card size="small">
                <div style={{ textAlign: 'center' }}>
                  <Title level={2} style={{ margin: 0, color: '#16a34a' }}>
                    {farms.length}
                  </Title>
                  <Text type="secondary">Total Farms</Text>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card size="small">
                <div style={{ textAlign: 'center' }}>
                  <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                    {farms.filter(f => f.owner_id).length}
                  </Title>
                  <Text type="secondary">With Owners</Text>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card size="small">
                <div style={{ textAlign: 'center' }}>
                  <Title level={2} style={{ margin: 0, color: '#faad14' }}>
                    {farms.filter(f => f.rating && f.rating > 4).length}
                  </Title>
                  <Text type="secondary">Top Rated (4+)</Text>
                </div>
              </Card>
            </Col>
          </Row>

          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Search
              placeholder="Search farms by name, owner, email, or location"
              allowClear
              style={{ width: 400 }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              prefix={<SearchOutlined />}
            />
            <div>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setSelectedFarm(null)
                  form.resetFields()
                  setIsModalVisible(true)
                }}
              >
                Add Farm
              </Button>
            </div>
          </div>

          <Table
            columns={columns}
            dataSource={filteredFarms}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} farms`
            }}
          />
        </Card>

        {/* Edit/Create Farm Modal */}
        <Modal
          title={selectedFarm ? "Edit Farm" : "Add Farm"}
          open={isModalVisible}
          onCancel={() => {
            setIsModalVisible(false)
            form.resetFields()
            setSelectedFarm(null)
          }}
          footer={null}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleFormSubmit}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Farm Name"
                  name="name"
                  rules={[{ required: true, message: 'Please enter farm name' }]}
                >
                  <Input placeholder="Farm name" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Owner"
                  name="owner_id"
                >
                  <Select placeholder="Select farm owner" allowClear>
                    {users.map(user => (
                      <Option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Description"
              name="description"
            >
              <TextArea rows={3} placeholder="Farm description" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: 'Please enter email' },
                    { type: 'email', message: 'Please enter valid email' }
                  ]}
                >
                  <Input placeholder="farm@example.com" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Phone"
                  name="phone"
                >
                  <Input placeholder="Phone number" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Website"
                  name="website"
                >
                  <Input placeholder="https://farm-website.com" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Owner Name"
                  name="owner_name"
                >
                  <Input placeholder="Farm owner name" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Address"
              name="address"
            >
              <TextArea rows={2} placeholder="Farm address" />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Space>
                <Button onClick={() => {
                  setIsModalVisible(false)
                  form.resetFields()
                  setSelectedFarm(null)
                }}>
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit">
                  {selectedFarm ? 'Update' : 'Create'}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* View Farm Modal */}
        <Modal
          title="Farm Details"
          open={isViewModalVisible}
          onCancel={() => {
            setIsViewModalVisible(false)
            setSelectedFarm(null)
          }}
          footer={[
            <Button key="close" onClick={() => {
              setIsViewModalVisible(false)
              setSelectedFarm(null)
            }}>
              Close
            </Button>
          ]}
          width={700}
        >
          {selectedFarm && (
            <div>
              <Descriptions bordered column={2}>
                <Descriptions.Item label="Farm Name" span={2}>
                  <Text strong style={{ fontSize: '16px' }}>{selectedFarm.name}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Owner">
                  {selectedFarm.owner_name || selectedFarm.owner?.name || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Owner Email">
                  {selectedFarm.owner?.email || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Farm Email">
                  {selectedFarm.email}
                </Descriptions.Item>
                <Descriptions.Item label="Phone">
                  {selectedFarm.phone || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Website" span={2}>
                  {selectedFarm.website ? (
                    <a href={selectedFarm.website} target="_blank" rel="noopener noreferrer">
                      {selectedFarm.website}
                    </a>
                  ) : 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Address" span={2}>
                  {selectedFarm.address || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Rating">
                  {selectedFarm.rating ? `⭐ ${selectedFarm.rating}/5` : 'No rating'}
                </Descriptions.Item>
                <Descriptions.Item label="Created">
                  {new Date(selectedFarm.created_at).toLocaleString()}
                </Descriptions.Item>
              </Descriptions>

              {selectedFarm.description && (
                <>
                  <Divider />
                  <Title level={5}>Description</Title>
                  <Text>{selectedFarm.description}</Text>
                </>
              )}
            </div>
          )}
        </Modal>
      </Content>
    </Layout>
  )
}
