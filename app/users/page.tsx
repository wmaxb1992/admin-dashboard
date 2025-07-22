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
  notification,
  Popconfirm,
  Descriptions,
  Divider
} from 'antd'
import {
  SearchOutlined,
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  PlusOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

const { Header, Content } = Layout
const { Title } = Typography
const { Search } = Input

interface User {
  id: string
  name: string
  email: string
  phone: string | null
  created_at: string
  updated_at: string
  farms?: Farm[]
}

interface Farm {
  id: string
  name: string
  description: string | null
  owner_name: string | null
  email: string
  phone: string | null
  created_at: string
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isViewModalVisible, setIsViewModalVisible] = useState(false)
  const [form] = Form.useForm()

  // Fetch users with their farms
  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/users')
      if (!response.ok) throw new Error('Failed to fetch users')
      const data = await response.json()
      setUsers(data.users || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      notification.error({
        message: 'Error',
        description: 'Failed to fetch users'
      })
    } finally {
      setLoading(false)
    }
  }

  // Delete user
  const deleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Failed to delete user')
      
      notification.success({
        message: 'Success',
        description: 'User deleted successfully'
      })
      
      fetchUsers() // Refresh the list
    } catch (error) {
      console.error('Error deleting user:', error)
      notification.error({
        message: 'Error',
        description: 'Failed to delete user'
      })
    }
  }

  // Update user
  const updateUser = async (values: any) => {
    try {
      const response = await fetch(`/api/users/${selectedUser?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
      })
      
      if (!response.ok) throw new Error('Failed to update user')
      
      notification.success({
        message: 'Success',
        description: 'User updated successfully'
      })
      
      setIsModalVisible(false)
      form.resetFields()
      setSelectedUser(null)
      fetchUsers() // Refresh the list
    } catch (error) {
      console.error('Error updating user:', error)
      notification.error({
        message: 'Error',
        description: 'Failed to update user'
      })
    }
  }

  // Create user
  const createUser = async (values: any) => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
      })
      
      if (!response.ok) throw new Error('Failed to create user')
      
      notification.success({
        message: 'Success',
        description: 'User created successfully'
      })
      
      setIsModalVisible(false)
      form.resetFields()
      setSelectedUser(null)
      fetchUsers() // Refresh the list
    } catch (error) {
      console.error('Error creating user:', error)
      notification.error({
        message: 'Error',
        description: 'Failed to create user'
      })
    }
  }

  // Handle form submission
  const handleFormSubmit = async (values: any) => {
    if (selectedUser) {
      await updateUser(values)
    } else {
      await createUser(values)
    }
  }

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone?.includes(searchTerm)
  )

  // Table columns
  const columns: ColumnsType<User> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name) => name || 'N/A'
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone) => phone || 'N/A'
    },
    {
      title: 'Farms',
      key: 'farms',
      render: (_, record) => (
        <Tag color="blue">
          {record.farms?.length || 0} farm(s)
        </Tag>
      )
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
              setSelectedUser(record)
              setIsViewModalVisible(true)
            }}
            size="small"
          >
            View
          </Button>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedUser(record)
              form.setFieldsValue(record)
              setIsModalVisible(true)
            }}
            size="small"
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this user?"
            description="This will also delete all associated farms. This action cannot be undone."
            onConfirm={() => deleteUser(record.id)}
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
            <UserOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
            <Title level={3} style={{ margin: 0 }}>
              User Management
            </Title>
          </div>
          <Button 
            type="primary" 
            ghost
            onClick={() => window.location.href = '/'}
          >
            Back to Dashboard
          </Button>
        </div>
      </Header>

      <Content style={{ padding: '24px' }}>
        <Card>
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Search
              placeholder="Search users by name, email, or phone"
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
                  setSelectedUser(null)
                  form.resetFields()
                  setIsModalVisible(true)
                }}
              >
                Add User
              </Button>
            </div>
          </div>

          <Table
            columns={columns}
            dataSource={filteredUsers}
            rowKey="id"
            loading={loading}
            size="small"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} users`
            }}
            style={{
              '--ant-table-row-height': '40px'
            } as React.CSSProperties}
            className="compact-table"
          />
        </Card>

        {/* Edit User Modal */}
        <Modal
          title={selectedUser ? "Edit User" : "Add User"}
          open={isModalVisible}
          onCancel={() => {
            setIsModalVisible(false)
            form.resetFields()
            setSelectedUser(null)
          }}
          footer={null}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleFormSubmit}
          >
            <Form.Item
              label="Name"
              name="name"
              rules={[{ required: true, message: 'Please enter name' }]}
            >
              <Input placeholder="User name" />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Please enter email' },
                { type: 'email', message: 'Please enter valid email' }
              ]}
            >
              <Input placeholder="user@example.com" />
            </Form.Item>

            <Form.Item
              label="Phone"
              name="phone"
            >
              <Input placeholder="Phone number" />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Space>
                <Button onClick={() => {
                  setIsModalVisible(false)
                  form.resetFields()
                  setSelectedUser(null)
                }}>
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit">
                  {selectedUser ? 'Update' : 'Create'}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* View User Modal */}
        <Modal
          title="User Details"
          open={isViewModalVisible}
          onCancel={() => {
            setIsViewModalVisible(false)
            setSelectedUser(null)
          }}
          footer={[
            <Button key="close" onClick={() => {
              setIsViewModalVisible(false)
              setSelectedUser(null)
            }}>
              Close
            </Button>
          ]}
          width={600}
        >
          {selectedUser && (
            <div>
              <Descriptions bordered column={1}>
                <Descriptions.Item label="Name">
                  {selectedUser.name || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  {selectedUser.email}
                </Descriptions.Item>
                <Descriptions.Item label="Phone">
                  {selectedUser.phone || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Created">
                  {new Date(selectedUser.created_at).toLocaleString()}
                </Descriptions.Item>
                <Descriptions.Item label="Updated">
                  {new Date(selectedUser.updated_at).toLocaleString()}
                </Descriptions.Item>
              </Descriptions>

              {selectedUser.farms && selectedUser.farms.length > 0 && (
                <>
                  <Divider />
                  <Title level={4}>Associated Farms</Title>
                  {selectedUser.farms.map((farm) => (
                    <Card key={farm.id} size="small" style={{ marginBottom: '8px' }}>
                      <div>
                        <strong>{farm.name}</strong>
                        {farm.description && <div style={{ color: '#666', fontSize: '12px' }}>{farm.description}</div>}
                        <div style={{ fontSize: '12px', color: '#999' }}>
                          Email: {farm.email} | Created: {new Date(farm.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </Card>
                  ))}
                </>
              )}
            </div>
          )}
        </Modal>
      </Content>
    </Layout>
  )
}
