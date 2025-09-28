import { createClient } from "@/lib/supabase/server"
import type { Profile, MenuItem, Order, UserStats, Category, InventoryItem } from "./types"

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (error) return null
  return data
}

export async function getMenuItems(): Promise<MenuItem[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from("menu_items").select("*").eq("is_available", true).order("name")

  if (error) return []
  return data
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from("categories").select("*").eq("is_active", true).order("name")

  if (error) return []
  return data
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) return []
  return data
}

export async function getUserStats(userId: string): Promise<UserStats | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.from("user_stats").select("*").eq("user_id", userId).single()

  if (error) return null
  return data
}

export async function getAllOrders(): Promise<Order[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false })

  if (error) return []
  return data
}

export async function getInventoryItems(): Promise<InventoryItem[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from("inventory").select("*").order("item_name")

  if (error) return []
  return data
}
