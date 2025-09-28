"use client"

import { useState } from "react"
import type { MenuItem, Category } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Clock, AlertTriangle } from "lucide-react"
import Image from "next/image"
import { AddToCartDialog } from "@/components/add-to-cart-dialog"

interface MenuGridProps {
  menuItems: MenuItem[]
  categories: Category[]
}

export function MenuGrid({ menuItems, categories }: MenuGridProps) {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleAddToCart = (item: MenuItem) => {
    setSelectedItem(item)
    setIsDialogOpen(true)
  }

  return (
    <>
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-8 gradient-card border-border/50">
          <TabsTrigger value="all">All Items</TabsTrigger>
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id}>
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {menuItems.map((item) => (
              <MenuItemCard key={item.id} item={item} onAddToCart={handleAddToCart} />
            ))}
          </div>
        </TabsContent>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {menuItems
                .filter((item) => item.category_id === category.id)
                .map((item) => (
                  <MenuItemCard key={item.id} item={item} onAddToCart={handleAddToCart} />
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {selectedItem && (
        <AddToCartDialog item={selectedItem} isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
      )}
    </>
  )
}

function MenuItemCard({ item, onAddToCart }: { item: MenuItem; onAddToCart: (item: MenuItem) => void }) {
  return (
    <Card className="gradient-card backdrop-blur-sm border-border/50 overflow-hidden group hover:scale-105 transition-transform">
      <div className="relative h-48 overflow-hidden">
        <Image
          src={item.image_url || "/placeholder.svg"}
          alt={item.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2">
          <Badge className="bg-background/80 text-foreground">${item.price}</Badge>
        </div>
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-balance">{item.name}</CardTitle>
        <CardDescription className="text-pretty">{item.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>{item.preparation_time} min</span>
        </div>

        {item.allergens && item.allergens.length > 0 && (
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
            <div className="flex flex-wrap gap-1">
              {item.allergens.map((allergen) => (
                <Badge key={allergen} variant="outline" className="text-xs">
                  {allergen}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Button
          onClick={() => onAddToCart(item)}
          className="w-full gradient-primary hover:opacity-90 transition-opacity"
          disabled={!item.is_available}
        >
          <Plus className="w-4 h-4 mr-2" />
          {item.is_available ? "Add to Cart" : "Unavailable"}
        </Button>
      </CardContent>
    </Card>
  )
}
