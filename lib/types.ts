export interface Profile {
  id: string
  email: string
  full_name: string
  role: "student" | "admin"
  student_id?: string
  phone?: string
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  description: string
  image_url: string
  is_active: boolean
  created_at: string
}

export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category_id: string
  is_available: boolean
  preparation_time: number
  image_url: string
  ingredients: string[]
  allergens: string[]
  nutritional_info?: any
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  user_id: string
  status: "pending" | "confirmed" | "preparing" | "ready" | "completed" | "cancelled"
  total_amount: number
  payment_status: "pending" | "paid" | "failed"
  payment_method: string
  special_instructions?: string
  estimated_ready_time?: string
  actual_ready_time?: string
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  menu_item_id: string
  quantity: number
  unit_price: number
  total_price: number
  special_requests?: string
  created_at: string
}

export interface UserStats {
  id: string
  user_id: string
  total_orders: number
  total_spent: number
  loyalty_points: number
  streak_days: number
  last_order_date?: string
  favorite_items: any
  achievements: any
  created_at: string
  updated_at: string
}

export interface InventoryItem {
  id: string
  item_name: string
  current_stock: number
  minimum_stock: number
  maximum_stock: number
  unit: string
  cost_per_unit: number
  supplier: string
  expiry_date: string
  last_restocked?: string
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: string
  is_read: boolean
  created_at: string
}
