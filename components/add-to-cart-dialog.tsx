"use client"

import { useState } from "react"
import type { MenuItem } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Minus, Plus, ShoppingCart } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface AddToCartDialogProps {
  item: MenuItem
  isOpen: boolean
  onClose: () => void
}

export function AddToCartDialog({ item, isOpen, onClose }: AddToCartDialogProps) {
  const [quantity, setQuantity] = useState(1)
  const [specialRequests, setSpecialRequests] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const totalPrice = item.price * quantity

  const handleAddToCart = async () => {
    setIsLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      // Create a new order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          status: "pending",
          total_amount: totalPrice,
          payment_status: "pending",
          payment_method: "cash",
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Add order item
      const { error: itemError } = await supabase.from("order_items").insert({
        order_id: order.id,
        menu_item_id: item.id,
        quantity,
        unit_price: item.price,
        total_price: totalPrice,
        special_requests: specialRequests || null,
      })

      if (itemError) throw itemError

      // Update user stats
      const { data: currentStats } = await supabase.from("user_stats").select("*").eq("user_id", user.id).single()

      if (currentStats) {
        await supabase
          .from("user_stats")
          .update({
            total_orders: currentStats.total_orders + 1,
            total_spent: currentStats.total_spent + totalPrice,
            loyalty_points: currentStats.loyalty_points + Math.floor(totalPrice),
            last_order_date: new Date().toISOString().split("T")[0],
          })
          .eq("user_id", user.id)
      }

      onClose()
      router.push("/orders")
    } catch (error) {
      console.error("Error adding to cart:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="gradient-card border-border/50 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-balance">{item.name}</DialogTitle>
          <DialogDescription>Customize your order</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="relative h-32 rounded-lg overflow-hidden">
            <Image src={item.image_url || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number.parseInt(e.target.value) || 1))}
                  className="w-20 text-center"
                  min="1"
                />
                <Button variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="special-requests">Special Requests (Optional)</Label>
              <Textarea
                id="special-requests"
                placeholder="Any special instructions..."
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                className="mt-1"
              />
            </div>

            {item.allergens && item.allergens.length > 0 && (
              <div>
                <Label>Allergens</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {item.allergens.map((allergen) => (
                    <Badge key={allergen} variant="outline" className="text-xs">
                      {allergen}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-border/50">
              <span className="text-lg font-semibold">Total: ${totalPrice.toFixed(2)}</span>
              <Button
                onClick={handleAddToCart}
                disabled={isLoading}
                className="gradient-primary hover:opacity-90 transition-opacity"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {isLoading ? "Adding..." : "Add to Cart"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
