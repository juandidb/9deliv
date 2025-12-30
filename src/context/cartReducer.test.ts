import { cartReducer, getCartTotal, initialCartState } from './cartReducer'

describe('cartReducer', () => {
  it('agrega items e incrementa cantidad', () => {
    const s1 = cartReducer(initialCartState, {
      type: 'ADD_ITEM',
      payload: {
        restaurantId: 'rest1',
        item: { id: 'p1', name: 'Muzzarella', price: 1200, image: '/assets/menu/muzzarella.jpg' },
      },
    })

    const s2 = cartReducer(s1, {
      type: 'ADD_ITEM',
      payload: {
        restaurantId: 'rest1',
        item: { id: 'p1', name: 'Muzzarella', price: 1200, image: '/assets/menu/muzzarella.jpg' },
      },
    })

    expect(s2.restaurantId).toBe('rest1')
    expect(s2.items).toHaveLength(1)
    expect(s2.items[0]?.quantity).toBe(2)
    expect(getCartTotal(s2)).toBe(2400)
  })

  it('no permite mezclar restaurantes (reducer no muta estado)', () => {
    const s1 = cartReducer(initialCartState, {
      type: 'ADD_ITEM',
      payload: {
        restaurantId: 'rest1',
        item: { id: 'p1', name: 'Muzzarella', price: 1200, image: '/assets/menu/muzzarella.jpg' },
      },
    })

    const s2 = cartReducer(s1, {
      type: 'ADD_ITEM',
      payload: { restaurantId: 'rest2', item: { id: 'b1', name: 'Cheese', price: 1800, image: '/assets/menu/cheeseburger.jpg' } },
    })

    expect(s2).toEqual(s1)
    expect(s2.items).toHaveLength(1)
    expect(s2.restaurantId).toBe('rest1')
  })
})
