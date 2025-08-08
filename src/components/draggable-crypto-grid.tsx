import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { CryptoPriceCard } from './crypto-price-card';
import { Cryptocurrency } from '@shared/schema';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { GripVertical } from 'lucide-react';

interface DraggableCryptoGridProps {
  cryptocurrencies: Cryptocurrency[];
  isLoading: boolean;
  onCryptoClick: (crypto: Cryptocurrency) => void;
}

export function DraggableCryptoGrid({ 
  cryptocurrencies, 
  isLoading, 
  onCryptoClick 
}: DraggableCryptoGridProps) {
  const [orderedCryptos, setOrderedCryptos] = useState<Cryptocurrency[]>([]);

  useEffect(() => {
    // Load saved order from localStorage or use default order
    const savedOrder = localStorage.getItem('crypto-order');
    if (savedOrder && cryptocurrencies.length > 0) {
      try {
        const orderIds = JSON.parse(savedOrder);
        const ordered = orderIds
          .map((id: string) => cryptocurrencies.find(c => c.id === id))
          .filter(Boolean);
        
        // Add any new cryptocurrencies not in saved order
        const remainingCryptos = cryptocurrencies.filter(
          c => !orderIds.includes(c.id)
        );
        
        setOrderedCryptos([...ordered, ...remainingCryptos]);
      } catch (error) {
        setOrderedCryptos(cryptocurrencies);
      }
    } else {
      setOrderedCryptos(cryptocurrencies);
    }
  }, [cryptocurrencies]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(orderedCryptos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setOrderedCryptos(items);
    
    // Save new order to localStorage
    const orderIds = items.map(crypto => crypto.id);
    localStorage.setItem('crypto-order', JSON.stringify(orderIds));

    // Track analytics event
    if (typeof gtag !== 'undefined') {
      gtag('event', 'crypto_reorder', {
        event_category: 'User Interaction',
        event_label: 'Cryptocurrency Cards Reordered',
        value: result.destination.index
      });
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <Card key={i} className="bg-based-surface border-border p-4">
            <div className="flex items-center space-x-3 mb-3">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-8" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-3 w-20" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!orderedCryptos?.length) {
    return (
      <Card className="bg-based-surface border-border p-8 text-center">
        <p className="text-muted-foreground">No cryptocurrency data available</p>
      </Card>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="crypto-grid" direction="horizontal">
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 transition-colors ${
              snapshot.isDraggingOver ? 'bg-muted/10 rounded-lg p-2' : ''
            }`}
          >
            {orderedCryptos.map((crypto, index) => (
              <Draggable key={crypto.id} draggableId={crypto.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`relative ${snapshot.isDragging ? 'z-50' : ''}`}
                  >
                    <div
                      {...provided.dragHandleProps}
                      className="absolute top-2 right-2 z-10 p-1 rounded-md bg-background/80 border border-border opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <GripVertical className="w-3 h-3 text-muted-foreground" />
                    </div>
                    
                    <div className="group">
                      <CryptoPriceCard 
                        cryptocurrency={crypto} 
                        onClick={() => onCryptoClick(crypto)}
                      />
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}