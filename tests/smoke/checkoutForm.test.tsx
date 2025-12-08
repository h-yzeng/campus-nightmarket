import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import CheckoutForm from '../../src/components/checkout/CheckoutForm';
import type { CartItem } from '../../src/types';

describe('CheckoutForm inline validation', () => {
  const sampleItem: CartItem = {
    id: 1,
    name: 'Test Noodles',
    seller: 'Chef A',
    sellerId: 'seller-1',
    price: 10,
    image: '🍜',
    location: 'Quad',
    rating: '5.0',
    description: 'Tasty sample',
    quantity: 1,
  };

  it('flags missing pickup time and wires aria attributes', () => {
    const onTimeSelection = jest.fn();

    render(
      <CheckoutForm
        itemsBySeller={{ 'Chef A': [sampleItem] }}
        pickupTimesBySeller={{}}
        onTimeSelection={onTimeSelection}
        selectedPayment="Cash"
        onPaymentChange={jest.fn()}
        notes=""
        onNotesChange={jest.fn()}
        timeErrors={{ 'Chef A': 'Select a pickup time for Chef A' }}
        hasSubmitted
      />
    );

    expect(screen.getByText(/Select a pickup time for Chef A/i)).toBeInTheDocument();
    const radiogroup = screen.getByRole('radiogroup', { name: /Pickup time for Chef A/i });
    expect(radiogroup).toHaveAttribute('aria-invalid', 'true');

    fireEvent.click(screen.getAllByRole('radio')[0]);
    expect(onTimeSelection).toHaveBeenCalled();
  });
});
